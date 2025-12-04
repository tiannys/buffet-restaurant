# Staff Notification System Documentation

## Overview
ระบบแจ้งเตือนพนักงานแบบ Real-time ผ่าน WebSocket และ Line Notify (optional)

## Notification Types

### 1. Customer Call Staff (ลูกค้าเรียกพนักงาน)
```typescript
{
  type: 'CUSTOMER_CALL',
  table_number: 'A01',
  session_id: 'uuid',
  reason: 'ขอน้ำเพิ่ม',
  timestamp: '2023-11-30T12:30:00Z'
}
```

### 2. Time Warning (เวลาใกล้หมด)
```typescript
{
  type: 'TIME_WARNING',
  table_number: 'A01',
  session_id: 'uuid',
  minutes_remaining: 5,
  package_name: 'Gold Buffet',
  timestamp: '2023-11-30T13:55:00Z'
}
```

### 3. New Order (ออเดอร์ใหม่)
```typescript
{
  type: 'NEW_ORDER',
  table_number: 'A01',
  order_number: 'ORD-123',
  items_count: 5,
  timestamp: '2023-11-30T12:15:00Z'
}
```

### 4. Order Status Changed (สถานะออเดอร์เปลี่ยน)
```typescript
{
  type: 'ORDER_STATUS_CHANGED',
  order_number: 'ORD-123',
  old_status: 'new',
  new_status: 'in_progress',
  timestamp: '2023-11-30T12:16:00Z'
}
```

## Backend Implementation

### 1. WebSocket Gateway

```typescript
// src/notifications/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private staffSockets = new Map<string, Socket>();

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;
    const userRole = client.handshake.auth.userRole;

    // Only allow staff, admin, kitchen roles
    if (['Staff', 'Admin', 'Kitchen'].includes(userRole)) {
      this.staffSockets.set(userId, client);
      console.log(`Staff connected: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth.userId;
    this.staffSockets.delete(userId);
    console.log(`Staff disconnected: ${userId}`);
  }

  // Emit to all staff
  notifyAllStaff(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Emit to specific staff
  notifyStaff(userId: string, event: string, data: any) {
    const socket = this.staffSockets.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }
}
```

### 2. Notification Service

```typescript
// src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { LineNotifyService } from './line-notify.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class NotificationsService {
  constructor(
    private gateway: NotificationsGateway,
    private lineNotify: LineNotifyService,
    private settings: SettingsService,
  ) {}

  async notifyCustomerCall(sessionId: string, tableNumber: string, reason: string) {
    const notification = {
      type: 'CUSTOMER_CALL',
      table_number: tableNumber,
      session_id: sessionId,
      reason,
      timestamp: new Date().toISOString(),
    };

    // WebSocket notification
    this.gateway.notifyAllStaff('customer:called', notification);

    // Optional: Line Notify
    const lineToken = await this.settings.get('line_notify_token');
    if (lineToken) {
      await this.lineNotify.send(
        `🔔 ลูกค้าเรียก - โต๊ะ ${tableNumber}\n${reason}`,
        lineToken
      );
    }
  }

  async notifyTimeWarning(sessionId: string, tableNumber: string, minutesRemaining: number) {
    const notification = {
      type: 'TIME_WARNING',
      table_number: tableNumber,
      session_id: sessionId,
      minutes_remaining: minutesRemaining,
      timestamp: new Date().toISOString(),
    };

    this.gateway.notifyAllStaff('session:time-warning', notification);
  }

  async notifyNewOrder(order: any) {
    const notification = {
      type: 'NEW_ORDER',
      table_number: order.table_number,
      order_number: order.order_number,
      items_count: order.items.length,
      timestamp: new Date().toISOString(),
    };

    this.gateway.notifyAllStaff('order:new', notification);
  }
}
```

### 3. Line Notify Service (Optional)

```typescript
// src/notifications/line-notify.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LineNotifyService {
  async send(message: string, token: string) {
    try {
      await axios.post(
        'https://notify-api.line.me/api/notify',
        `message=${encodeURIComponent(message)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Line Notify error:', error);
    }
  }
}
```

### 4. Time Warning Scheduler

```typescript
// src/sessions/sessions.scheduler.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionsService } from './sessions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class SessionsScheduler {
  constructor(
    private sessionsService: SessionsService,
    private notifications: NotificationsService,
    private settings: SettingsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkTimeWarnings() {
    const warningMinutes = parseInt(await this.settings.get('time_warning_minutes') || '5');
    const sessions = await this.sessionsService.findActiveSessions();

    for (const session of sessions) {
      const minutesRemaining = this.calculateMinutesRemaining(session);
      
      if (minutesRemaining === warningMinutes && !session.warning_sent) {
        await this.notifications.notifyTimeWarning(
          session.id,
          session.table.table_number,
          minutesRemaining
        );
        
        // Mark as warned
        await this.sessionsService.update(session.id, { warning_sent: true });
      }
    }
  }

  private calculateMinutesRemaining(session: any): number {
    const endTime = new Date(session.start_time);
    endTime.setMinutes(endTime.getMinutes() + session.time_limit_minutes);
    const now = new Date();
    return Math.floor((endTime.getTime() - now.getTime()) / 60000);
  }
}
```

## Frontend Implementation

### 1. WebSocket Connection

```typescript
// frontend/src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectNotifications(userId: string, userRole: string) {
  if (socket?.connected) return socket;

  socket = io(`${process.env.NEXT_PUBLIC_WS_URL}/notifications`, {
    auth: {
      userId,
      userRole,
    },
  });

  socket.on('connect', () => {
    console.log('Connected to notifications');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from notifications');
  });

  return socket;
}

export function disconnectNotifications() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
```

### 2. Notification Component

```typescript
// frontend/src/components/staff/NotificationBell.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { toast } from 'react-hot-toast';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Customer called
    socket.on('customer:called', (data) => {
      toast(`🔔 โต๊ะ ${data.table_number} เรียกพนักงาน\n${data.reason}`, {
        duration: 10000,
        icon: '🔔',
      });
      addNotification(data);
      playSound();
    });

    // Time warning
    socket.on('session:time-warning', (data) => {
      toast(`⏰ โต๊ะ ${data.table_number} เหลือเวลา ${data.minutes_remaining} นาที`, {
        duration: 8000,
        icon: '⏰',
      });
      addNotification(data);
      playSound();
    });

    // New order
    socket.on('order:new', (data) => {
      toast(`📝 ออเดอร์ใหม่ - โต๊ะ ${data.table_number}`, {
        duration: 5000,
        icon: '📝',
      });
      addNotification(data);
      playSound();
    });

    return () => {
      socket.off('customer:called');
      socket.off('session:time-warning');
      socket.off('order:new');
    };
  }, []);

  const addNotification = (data: any) => {
    setNotifications(prev => [data, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const playSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(console.error);
  };

  return (
    <div className="relative">
      <button className="relative p-2">
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification dropdown */}
      <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg">
        {notifications.map((notif, index) => (
          <NotificationItem key={index} notification={notif} />
        ))}
      </div>
    </div>
  );
}
```

### 3. Staff Dashboard Integration

```typescript
// frontend/src/app/staff/layout.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { connectNotifications, disconnectNotifications } from '@/lib/socket';
import NotificationBell from '@/components/staff/NotificationBell';

export default function StaffLayout({ children }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      connectNotifications(user.id, user.role.name);
    }

    return () => {
      disconnectNotifications();
    };
  }, [user]);

  return (
    <div>
      <nav>
        <NotificationBell />
      </nav>
      {children}
    </div>
  );
}
```

## Line Notify Setup (Optional)

### 1. Get Line Notify Token

1. ไปที่ https://notify-bot.line.me/
2. Login ด้วย Line account
3. สร้าง token ใหม่
4. เลือก group ที่ต้องการส่งแจ้งเตือน
5. Copy token

### 2. Add to Settings

```sql
INSERT INTO settings (key, value, data_type, description) VALUES
('line_notify_token', 'YOUR_TOKEN_HERE', 'string', 'Line Notify token for staff notifications');
```

### 3. Test

```http
POST /admin/notifications/test-line
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "message": "ส่งข้อความทดสอบไปยัง Line สำเร็จ"
}
```

## Database Schema Update

```sql
-- Add warning_sent flag to customer_sessions
ALTER TABLE customer_sessions ADD COLUMN warning_sent BOOLEAN DEFAULT false;

-- Add notification_logs table (optional)
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    recipient_type VARCHAR(20) NOT NULL, -- 'staff', 'line'
    data JSONB NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Benefits

✅ พนักงานได้รับแจ้งเตือนทันที  
✅ ไม่พลาดการเรียกของลูกค้า  
✅ จัดการเวลาได้ดีขึ้น  
✅ ลดการรอคอยของลูกค้า  
✅ รองรับหลายช่องทาง (WebSocket + Line)  
