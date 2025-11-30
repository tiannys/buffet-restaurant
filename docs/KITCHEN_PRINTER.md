# Kitchen Printer Integration Documentation

## Overview
ระบบพิมพ์ใบสั่งอาหารอัตโนมัติไปยังครัวเมื่อมี order ใหม่

## Hardware Requirements
- เครื่องพิมพ์ใบเสร็จ (Receipt Printer) รองรับ ESC/POS protocol
- เชื่อมต่อผ่าน Network (Ethernet/WiFi)
- แนะนำ: Epson TM-T82, Star TSP143, Xprinter XP-80C

## Database Settings

เพิ่มการตั้งค่าใน `settings` table:

```sql
INSERT INTO settings (key, value, data_type, description) VALUES
('kitchen_printer_enabled', 'true', 'boolean', 'Enable/disable kitchen printer'),
('kitchen_printer_ip', '192.168.1.100', 'string', 'Printer IP address'),
('kitchen_printer_port', '9100', 'number', 'Printer port (default: 9100)'),
('kitchen_printer_encoding', 'TIS-620', 'string', 'Character encoding for Thai'),
('print_order_copies', '2', 'number', 'Number of copies to print');
```

## Backend Implementation

### 1. Install Dependencies

```bash
npm install escpos escpos-network iconv-lite
```

### 2. Printer Service

```typescript
// src/printer/printer.service.ts
import { Injectable } from '@nestjs/common';
import * as escpos from 'escpos';
import * as Network from 'escpos-network';
import * as iconv from 'iconv-lite';

@Injectable()
export class PrinterService {
  private device: any;
  private printer: any;

  async initialize(ip: string, port: number) {
    this.device = new Network(ip, port);
    this.printer = new escpos.Printer(this.device, {
      encoding: 'TIS-620'
    });
  }

  async printOrder(order: any) {
    if (!this.device) {
      throw new Error('Printer not initialized');
    }

    return new Promise((resolve, reject) => {
      this.device.open((error) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          this.printer
            .font('a')
            .align('ct')
            .style('bu')
            .size(2, 2)
            .text('ใบสั่งอาหาร')
            .size(1, 1)
            .style('normal')
            .text('--------------------------------')
            .align('lt')
            .text(`โต๊ะ: ${order.table_number}`)
            .text(`แพ็กเกจ: ${order.package_name}`)
            .text(`เวลา: ${new Date().toLocaleString('th-TH')}`)
            .text(`Order #: ${order.order_number}`)
            .text('--------------------------------')
            .text('รายการอาหาร:')
            .text('');

          // Print each item
          order.items.forEach((item, index) => {
            this.printer
              .text(`${index + 1}. ${item.menu_name}`)
              .text(`   จำนวน: ${item.quantity}`)
              .text(`   หมายเหตุ: ${item.notes || '-'}`)
              .text('');
          });

          this.printer
            .text('--------------------------------')
            .text(`รวม ${order.items.length} รายการ`)
            .text('--------------------------------')
            .cut()
            .close(() => {
              resolve(true);
            });
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  async testPrint() {
    return new Promise((resolve, reject) => {
      this.device.open((error) => {
        if (error) {
          reject(error);
          return;
        }

        this.printer
          .font('a')
          .align('ct')
          .text('ทดสอบเครื่องพิมพ์')
          .text('Test Print')
          .text(new Date().toLocaleString('th-TH'))
          .cut()
          .close(() => {
            resolve(true);
          });
      });
    });
  }
}
```

### 3. Auto-print on New Order

```typescript
// src/orders/orders.service.ts
import { PrinterService } from '../printer/printer.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class OrdersService {
  constructor(
    private printerService: PrinterService,
    private settingsService: SettingsService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const order = await this.ordersRepository.save(createOrderDto);
    
    // Auto-print to kitchen
    const printerEnabled = await this.settingsService.get('kitchen_printer_enabled');
    if (printerEnabled === 'true') {
      try {
        const printerIp = await this.settingsService.get('kitchen_printer_ip');
        const printerPort = parseInt(await this.settingsService.get('kitchen_printer_port'));
        
        await this.printerService.initialize(printerIp, printerPort);
        await this.printerService.printOrder(order);
      } catch (error) {
        console.error('Failed to print order:', error);
        // Don't fail the order creation if printing fails
      }
    }

    return order;
  }
}
```

## API Endpoints

### Test Printer Connection

```http
POST /admin/printer/test
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "message": "ทดสอบพิมพ์สำเร็จ"
}
```

### Manual Print Order

```http
POST /staff/orders/:orderId/print
Authorization: Bearer {staff_token}

Response:
{
  "success": true,
  "message": "พิมพ์ใบสั่งสำเร็จ"
}
```

## Admin UI

### Printer Settings Page

```typescript
// frontend/src/app/admin/settings/printer/page.tsx
export default function PrinterSettingsPage() {
  const [settings, setSettings] = useState({
    enabled: false,
    ip: '',
    port: 9100,
  });

  const handleTest = async () => {
    try {
      await api.post('/admin/printer/test');
      toast.success('ทดสอบพิมพ์สำเร็จ');
    } catch (error) {
      toast.error('ไม่สามารถเชื่อมต่อเครื่องพิมพ์ได้');
    }
  };

  return (
    <div>
      <h1>ตั้งค่าเครื่องพิมพ์ครัว</h1>
      
      <Toggle
        label="เปิดใช้งานเครื่องพิมพ์"
        checked={settings.enabled}
        onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
      />

      <Input
        label="IP Address"
        value={settings.ip}
        placeholder="192.168.1.100"
        onChange={(e) => setSettings({...settings, ip: e.target.value})}
      />

      <Input
        label="Port"
        type="number"
        value={settings.port}
        onChange={(e) => setSettings({...settings, port: parseInt(e.target.value)})}
      />

      <Button onClick={handleTest}>ทดสอบพิมพ์</Button>
      <Button onClick={handleSave}>บันทึก</Button>
    </div>
  );
}
```

## Troubleshooting

### ปัญหาที่พบบ่อย

1. **Cannot connect to printer**
   - ตรวจสอบ IP address และ port
   - ตรวจสอบ firewall
   - Ping เครื่องพิมพ์: `ping 192.168.1.100`

2. **Thai characters not printing correctly**
   - ตั้งค่า encoding เป็น TIS-620
   - ใช้ font ที่รองรับภาษาไทย

3. **Print queue stuck**
   - Restart printer
   - Clear print queue
   - Restart backend service

## Alternative: PDF Print

ถ้าไม่มีเครื่องพิมพ์ ESC/POS สามารถใช้ PDF แทนได้:

```typescript
// Generate PDF and auto-print via browser
async generateOrderPDF(order: any) {
  const pdf = new PDFDocument();
  // ... generate PDF content
  return pdf;
}

// Frontend auto-print
const printPDF = (pdfUrl: string) => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = pdfUrl;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow.print();
  };
};
```

## Benefits

✅ ครัวได้ใบสั่งทันที ไม่ต้องดูหน้าจอ  
✅ ลดข้อผิดพลาดในการสื่อสาร  
✅ เก็บใบสั่งไว้เป็นหลักฐาน  
✅ รองรับหลายครัว (แยกพิมพ์ตามแผนก)  
