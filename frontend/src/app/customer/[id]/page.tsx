"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { sessions, orders } from "@/lib/api";

export default function CustomerMenuPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<any>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
    const interval = setInterval(loadSession, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const response = await sessions.getForCustomer(sessionId);
      setSession(response.data.session);
      setMenus(response.data.menus);

      // Extract unique categories
      const cats = response.data.menus.reduce((acc: any[], menu: any) => {
        if (!acc.find((c) => c.id === menu.category.id)) {
          acc.push(menu.category);
        }
        return acc;
      }, []);
      setCategories(cats);
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (menu: any) => {
    const existing = cart.find((item) => item.menu_item_id === menu.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.menu_item_id === menu.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        { menu_item_id: menu.id, name: menu.name, quantity: 1 },
      ]);
    }
  };

  const removeFromCart = (menuId: string) => {
    setCart(cart.filter((item) => item.menu_item_id !== menuId));
  };

  const updateQuantity = (menuId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuId);
    } else {
      setCart(
        cart.map((item) =>
          item.menu_item_id === menuId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert("กรุณาเลือกเมนูก่อนสั่งอาหาร");
      return;
    }

    try {
      await orders.create({
        session_id: sessionId,
        items: cart.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
        })),
      });

      alert("สั่งอาหารสำเร็จ!");
      setCart([]);
      loadSession();
    } catch (error) {
      console.error("Failed to submit order:", error);
      alert("ไม่สามารถสั่งอาหารได้");
    }
  };

  const filteredMenus =
    selectedCategory === "all"
      ? menus
      : menus.filter((m) => m.category.id === selectedCategory);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">ไม่พบข้อมูลรอบโต๊ะ</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-blue-600 p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">โต๊ะ {session.table_number}</h1>
            <p className="text-sm">{session.package_name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {session.remaining_minutes}
            </div>
            <div className="text-xs">นาที</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-16 z-10 bg-white p-4 shadow">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${selectedCategory === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
              }`}
          >
            ทั้งหมด
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${selectedCategory === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className="overflow-hidden rounded-lg bg-white shadow hover:shadow-lg"
            >
              {menu.image_url && (
                <img
                  src={menu.image_url}
                  alt={menu.name}
                  className="h-32 w-full object-cover"
                />
              )}
              <div className="p-3">
                <h3 className="font-medium text-gray-800">{menu.name}</h3>
                {menu.description && (
                  <p className="mt-1 text-xs text-gray-600">
                    {menu.description}
                  </p>
                )}

                {/* Button: disable when out of stock */}
                {menu.is_out_of_stock ? (
                  <button
                    disabled
                    className="mt-2 w-full rounded-md bg-gray-300 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                ) : (
                  <button
                    onClick={() => addToCart(menu)}
                    className="mt-2 w-full rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    เพิ่ม
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
          <div className="mb-4 max-h-40 overflow-y-auto">
            {cart.map((item) => (
              <div
                key={item.menu_item_id}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm">{item.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.menu_item_id, item.quantity - 1)
                    }
                    className="rounded bg-gray-200 px-2 py-1 text-sm"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.menu_item_id, item.quantity + 1)
                    }
                    className="rounded bg-gray-200 px-2 py-1 text-sm"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.menu_item_id)}
                    className="ml-2 text-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmitOrder}
            className="w-full rounded-md bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
          >
            ส่งออเดอร์ ({cart.length} รายการ)
          </button>
        </div>
      )}
    </div>
  );
}
