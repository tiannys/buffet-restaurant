# Waste Tracking System Documentation

## Overview
ระบบติดตามอาหารที่เหลือทิ้ง เพื่อลดต้นทุนและปรับปรุงการบริการ

## Why Waste Tracking?

### ปัญหาที่พบในร้านบุฟเฟ่ต์:
- ลูกค้าสั่งอาหารเกิน แล้วทิ้ง
- ครัวทำผิดพลาด ต้องทำใหม่
- อาหารหมดอายุก่อนเสิร์ฟ
- ไม่ทราบว่าเมนูไหนมีปัญหา

### ประโยชน์ของ Waste Tracking:
✅ ลดต้นทุนอาหารที่สูญเสีย  
✅ วิเคราะห์พฤติกรรมลูกค้า  
✅ ปรับ portion size ให้เหมาะสม  
✅ ปรับปรุงกระบวนการครัว  
✅ รายงานต้นทุนที่แม่นยำ  

## Database Schema

Already added to `order_items` table:

```sql
ALTER TABLE order_items 
ADD COLUMN waste_quantity INTEGER DEFAULT 0,
ADD COLUMN waste_reason VARCHAR(100);
```

### Waste Reasons:
- `customer_leftover` - ลูกค้าสั่งแล้วไม่กิน/กินไม่หมด
- `kitchen_error` - ครัวทำผิดพลาด (เผ็ดเกิน, ไหม้, ฯลฯ)
- `expired` - อาหารหมดอายุก่อนเสิร์ฟ
- `damaged` - อาหารเสียหายระหว่างขนส่ง
- `quality_issue` - คุณภาพไม่ผ่าน

## API Endpoints

### 1. Mark Waste (Staff/Kitchen)

```http
POST /staff/orders/:orderId/items/:itemId/mark-waste
Authorization: Bearer {staff_token}

Request:
{
  "waste_quantity": 2,
  "reason": "customer_leftover",
  "notes": "ลูกค้าสั่งมาแต่ไม่ได้กิน"
}

Response:
{
  "success": true,
  "data": {
    "order_item_id": "uuid",
    "menu_item_name": "หมูสามชั้น",
    "ordered_quantity": 3,
    "waste_quantity": 2,
    "waste_reason": "customer_leftover",
    "waste_percentage": 66.67
  }
}
```

### 2. Get Waste Report (Admin/Manager)

```http
GET /admin/reports/waste-summary
Authorization: Bearer {admin_token}

Query Parameters:
- date_from: 2023-11-01
- date_to: 2023-11-30
- reason: customer_leftover (optional)

Response:
{
  "success": true,
  "data": {
    "period": {
      "from": "2023-11-01",
      "to": "2023-11-30"
    },
    "summary": {
      "total_waste_items": 450,
      "total_waste_cost": 12500.00,
      "waste_percentage": 8.5
    },
    "by_reason": [
      {
        "reason": "customer_leftover",
        "count": 320,
        "cost": 8900.00,
        "percentage": 71.1
      },
      {
        "reason": "kitchen_error",
        "count": 80,
        "cost": 2200.00,
        "percentage": 17.8
      },
      {
        "reason": "expired",
        "count": 50,
        "cost": 1400.00,
        "percentage": 11.1
      }
    ],
    "top_wasted_items": [
      {
        "menu_item_id": "uuid",
        "name": "ซูชิแซลมอน",
        "total_waste": 120,
        "total_cost": 3600.00,
        "avg_waste_per_order": 2.4
      },
      {
        "menu_item_id": "uuid",
        "name": "เนื้อวากิว",
        "total_waste": 80,
        "total_cost": 4800.00,
        "avg_waste_per_order": 1.6
      }
    ]
  }
}
```

### 3. Get Menu Waste Analysis

```http
GET /admin/reports/menu-waste-analysis/:menuId
Authorization: Bearer {admin_token}

Query Parameters:
- days: 30 (default)

Response:
{
  "success": true,
  "data": {
    "menu_item": {
      "id": "uuid",
      "name": "ซูชิแซลมอน",
      "cost": 30.00
    },
    "period_days": 30,
    "statistics": {
      "total_ordered": 500,
      "total_wasted": 120,
      "waste_percentage": 24.0,
      "total_waste_cost": 3600.00,
      "avg_waste_per_order": 0.24
    },
    "recommendations": [
      "พิจารณาลด portion size ลง 20%",
      "เมนูนี้มีการทิ้งสูง แนะนำให้แจ้งลูกค้าเกี่ยวกับขนาด"
    ],
    "waste_by_reason": [
      {
        "reason": "customer_leftover",
        "count": 100,
        "percentage": 83.3
      },
      {
        "reason": "kitchen_error",
        "count": 20,
        "percentage": 16.7
      }
    ]
  }
}
```

## Backend Implementation

### 1. Waste Tracking Service

```typescript
// src/waste/waste.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';

@Injectable()
export class WasteService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemsRepo: Repository<OrderItem>,
  ) {}

  async markWaste(orderItemId: string, wasteData: MarkWasteDto) {
    const orderItem = await this.orderItemsRepo.findOne({
      where: { id: orderItemId },
      relations: ['menu_item'],
    });

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    if (wasteData.waste_quantity > orderItem.quantity) {
      throw new BadRequestException('Waste quantity cannot exceed ordered quantity');
    }

    orderItem.waste_quantity = wasteData.waste_quantity;
    orderItem.waste_reason = wasteData.reason;
    
    await this.orderItemsRepo.save(orderItem);

    return {
      order_item_id: orderItem.id,
      menu_item_name: orderItem.menu_item.name,
      ordered_quantity: orderItem.quantity,
      waste_quantity: orderItem.waste_quantity,
      waste_percentage: (orderItem.waste_quantity / orderItem.quantity) * 100,
    };
  }

  async getWasteSummary(dateFrom: Date, dateTo: Date, reason?: string) {
    const query = this.orderItemsRepo
      .createQueryBuilder('oi')
      .leftJoinAndSelect('oi.menu_item', 'mi')
      .leftJoinAndSelect('oi.order', 'o')
      .where('oi.waste_quantity > 0')
      .andWhere('o.created_at BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });

    if (reason) {
      query.andWhere('oi.waste_reason = :reason', { reason });
    }

    const wasteItems = await query.getMany();

    // Calculate summary
    const totalWasteItems = wasteItems.reduce((sum, item) => sum + item.waste_quantity, 0);
    const totalWasteCost = wasteItems.reduce(
      (sum, item) => sum + (item.waste_quantity * (item.menu_item.cost || 0)),
      0
    );

    // Group by reason
    const byReason = this.groupByReason(wasteItems);

    // Top wasted items
    const topWasted = this.getTopWastedItems(wasteItems);

    return {
      summary: {
        total_waste_items: totalWasteItems,
        total_waste_cost: totalWasteCost,
      },
      by_reason: byReason,
      top_wasted_items: topWasted,
    };
  }

  private groupByReason(items: OrderItem[]) {
    const grouped = items.reduce((acc, item) => {
      const reason = item.waste_reason || 'unknown';
      if (!acc[reason]) {
        acc[reason] = { count: 0, cost: 0 };
      }
      acc[reason].count += item.waste_quantity;
      acc[reason].cost += item.waste_quantity * (item.menu_item.cost || 0);
      return acc;
    }, {});

    return Object.entries(grouped).map(([reason, data]: [string, any]) => ({
      reason,
      count: data.count,
      cost: data.cost,
    }));
  }

  private getTopWastedItems(items: OrderItem[], limit: number = 10) {
    const grouped = items.reduce((acc, item) => {
      const menuId = item.menu_item.id;
      if (!acc[menuId]) {
        acc[menuId] = {
          menu_item_id: menuId,
          name: item.menu_item.name,
          total_waste: 0,
          total_cost: 0,
          order_count: 0,
        };
      }
      acc[menuId].total_waste += item.waste_quantity;
      acc[menuId].total_cost += item.waste_quantity * (item.menu_item.cost || 0);
      acc[menuId].order_count += 1;
      return acc;
    }, {});

    return Object.values(grouped)
      .map((item: any) => ({
        ...item,
        avg_waste_per_order: item.total_waste / item.order_count,
      }))
      .sort((a: any, b: any) => b.total_cost - a.total_cost)
      .slice(0, limit);
  }
}
```

### 2. Auto-recommendations

```typescript
async getMenuWasteAnalysis(menuId: string, days: number = 30) {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  const wasteItems = await this.orderItemsRepo
    .createQueryBuilder('oi')
    .leftJoinAndSelect('oi.menu_item', 'mi')
    .leftJoinAndSelect('oi.order', 'o')
    .where('mi.id = :menuId', { menuId })
    .andWhere('o.created_at >= :dateFrom', { dateFrom })
    .getMany();

  const totalOrdered = wasteItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalWasted = wasteItems.reduce((sum, item) => sum + item.waste_quantity, 0);
  const wastePercentage = (totalWasted / totalOrdered) * 100;

  // Generate recommendations
  const recommendations = [];
  if (wastePercentage > 20) {
    recommendations.push(`พิจารณาลด portion size ลง ${Math.round(wastePercentage)}%`);
  }
  if (wastePercentage > 15) {
    recommendations.push('เมนูนี้มีการทิ้งสูง แนะนำให้แจ้งลูกค้าเกี่ยวกับขนาด');
  }
  if (wastePercentage > 30) {
    recommendations.push('⚠️ เมนูนี้มีการทิ้งสูงมาก ควรทบทวนการเสิร์ฟ');
  }

  return {
    statistics: {
      total_ordered: totalOrdered,
      total_wasted: totalWasted,
      waste_percentage: wastePercentage,
    },
    recommendations,
  };
}
```

## Frontend Implementation

### 1. Waste Marking UI (Staff)

```typescript
// frontend/src/components/staff/MarkWasteModal.tsx
export default function MarkWasteModal({ orderItem, onClose, onSave }) {
  const [wasteQty, setWasteQty] = useState(0);
  const [reason, setReason] = useState('customer_leftover');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    await api.post(`/staff/orders/${orderItem.order_id}/items/${orderItem.id}/mark-waste`, {
      waste_quantity: wasteQty,
      reason,
      notes,
    });
    onSave();
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2>บันทึกอาหารที่เหลือทิ้ง</h2>
      <p>{orderItem.menu_name} (สั่ง {orderItem.quantity} จาน)</p>

      <Input
        type="number"
        label="จำนวนที่เหลือทิ้ง"
        value={wasteQty}
        max={orderItem.quantity}
        onChange={(e) => setWasteQty(parseInt(e.target.value))}
      />

      <Select
        label="เหตุผล"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      >
        <option value="customer_leftover">ลูกค้าไม่กิน/กินไม่หมด</option>
        <option value="kitchen_error">ครัวทำผิดพลาด</option>
        <option value="expired">หมดอายุ</option>
        <option value="damaged">เสียหายระหว่างขนส่ง</option>
        <option value="quality_issue">คุณภาพไม่ผ่าน</option>
      </Select>

      <Textarea
        label="หมายเหตุ"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <Button onClick={handleSave}>บันทึก</Button>
    </Modal>
  );
}
```

### 2. Waste Report Dashboard (Admin)

```typescript
// frontend/src/app/admin/reports/waste/page.tsx
export default function WasteReportPage() {
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: '2023-11-01',
    to: '2023-11-30',
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    const response = await api.get('/admin/reports/waste-summary', {
      params: dateRange,
    });
    setData(response.data.data);
  };

  return (
    <div>
      <h1>รายงานอาหารที่เหลือทิ้ง</h1>

      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {data && (
        <>
          <SummaryCards>
            <Card>
              <h3>จำนวนที่ทิ้งทั้งหมด</h3>
              <p className="text-3xl">{data.summary.total_waste_items} จาน</p>
            </Card>
            <Card>
              <h3>ต้นทุนที่สูญเสีย</h3>
              <p className="text-3xl text-red-600">
                ฿{data.summary.total_waste_cost.toLocaleString()}
              </p>
            </Card>
          </SummaryCards>

          <Card>
            <h2>แยกตามสาเหตุ</h2>
            <PieChart data={data.by_reason} />
          </Card>

          <Card>
            <h2>เมนูที่ถูกทิ้งมากที่สุด</h2>
            <Table>
              <thead>
                <tr>
                  <th>เมนู</th>
                  <th>จำนวนที่ทิ้ง</th>
                  <th>ต้นทุนที่สูญเสีย</th>
                  <th>เฉลี่ยต่อออเดอร์</th>
                </tr>
              </thead>
              <tbody>
                {data.top_wasted_items.map((item) => (
                  <tr key={item.menu_item_id}>
                    <td>{item.name}</td>
                    <td>{item.total_waste}</td>
                    <td className="text-red-600">
                      ฿{item.total_cost.toLocaleString()}
                    </td>
                    <td>{item.avg_waste_per_order.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
```

## Workflow

### 1. During Service
```
Customer finishes eating
  ↓
Staff collects plates
  ↓
Staff notices leftover food
  ↓
Staff marks waste in system
  ↓
System records waste data
```

### 2. End of Day
```
Admin reviews waste report
  ↓
Identifies problem menus
  ↓
Analyzes waste reasons
  ↓
Makes decisions:
  - Reduce portion size
  - Improve kitchen process
  - Train staff
  - Adjust menu
```

## Benefits & ROI

### Example Calculation:
- ร้านขาย 100 ออเดอร์/วัน
- Waste rate: 10%
- ต้นทุนเฉลี่ย: 50 บาท/จาน
- **สูญเสีย**: 100 × 10% × 50 = 500 บาท/วัน
- **สูญเสียต่อเดือน**: 15,000 บาท

### ถ้าลด waste ได้ 50%:
- **ประหยัด**: 7,500 บาท/เดือน
- **ประหยัดต่อปี**: 90,000 บาท

## Best Practices

1. **Train Staff**: สอนพนักงานบันทึก waste อย่างสม่ำเสำ
2. **Review Weekly**: ทบทวนรายงานทุกสัปดาห์
3. **Take Action**: ใช้ข้อมูลปรับปรุงจริง ไม่ใช่แค่เก็บข้อมูล
4. **Set Goals**: ตั้งเป้า waste rate (เช่น < 5%)
5. **Communicate**: แจ้งลูกค้าเกี่ยวกับขนาดเมนู

---

**สรุป**: Waste Tracking ช่วยลดต้นทุน ปรับปรุงการบริการ และเพิ่มกำไรให้ร้านบุฟเฟ่ต์ได้อย่างมีประสิทธิภาพ 📊
