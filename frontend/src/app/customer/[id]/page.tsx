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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    loadSession();
    const interval = setInterval(loadSession, 30000);

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const response = await sessions.getForCustomer(sessionId);
      setSession(response.data.session);
      setMenus(response.data.menus);

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

  // ... (Keep addToCart, removeFromCart, updateQuantity logic same as before) ...
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
        {
          menu_item_id: menu.id,
          name: menu.name,
          quantity: 1,
          price: menu.cost,
        },
      ]); // Assuming cost/price exists for display if needed
    }
  };

  const updateQuantity = (menuId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.menu_item_id !== menuId));
    } else {
      setCart(
        cart.map((item) =>
          item.menu_item_id === menuId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    if (!confirm("ยืนยันการสั่งอาหาร?")) return;

    try {
      await orders.create({
        session_id: sessionId,
        items: cart.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
        })),
      });
      alert("✅ สั่งอาหารเรียบร้อยแล้ว");
      setCart([]);
      loadSession();
    } catch (error) {
      alert("❌ ไม่สามารถสั่งอาหารได้");
    }
  };

  const filteredMenus =
    selectedCategory === "all"
      ? menus
      : menus.filter((m) => m.category.id === selectedCategory);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">
        กำลังโหลดเมนู...
      </div>
    );
  if (!session)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">
        ไม่พบข้อมูล
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans">
      {/* Navbar แบบ Modern */}
      <div
        className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white shadow-none"}`}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              โต๊ะ {session.table_number}
            </h1>
            <p className="text-xs text-primary-600 font-medium bg-primary-50 inline-block px-2 py-0.5 rounded-full mt-0.5">
              {session.package_name}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div
              className={`text-2xl font-bold ${session.remaining_minutes < 15 ? "text-red-500 animate-pulse" : "text-gray-800"}`}
            >
              {session.remaining_minutes}
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">
              นาที
            </span>
          </div>
        </div>

        {/* Category Scrollbar */}
        <div className="px-4 pb-3 overflow-x-auto no-scrollbar flex gap-2 snap-x">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`snap-start whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            ทั้งหมด
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`snap-start whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-2xl mx-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-xl shadow-card overflow-hidden group hover:shadow-soft transition-all duration-300"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                {menu.image_url ? (
                  <img
                    src={menu.image_url}
                    alt={menu.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
                {/* Out of Stock Overlay */}
                {menu.is_out_of_stock && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="text-white text-xs font-bold px-2 py-1 bg-red-500 rounded">
                      หมดชั่วคราว
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                  {menu.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {menu.description || "ไม่มีคำอธิบาย"}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  {/* Check if in cart */}
                  {cart.find((i) => i.menu_item_id === menu.id) ? (
                    <div className="flex items-center gap-3 bg-gray-900 text-white rounded-lg px-2 py-1 ml-auto">
                      <button
                        onClick={() =>
                          updateQuantity(
                            menu.id,
                            cart.find((i) => i.menu_item_id === menu.id)
                              .quantity - 1,
                          )
                        }
                        className="text-lg font-medium w-6 h-6 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold w-4 text-center">
                        {cart.find((i) => i.menu_item_id === menu.id).quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            menu.id,
                            cart.find((i) => i.menu_item_id === menu.id)
                              .quantity + 1,
                          )
                        }
                        className="text-lg font-medium w-6 h-6 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(menu)}
                      disabled={menu.is_out_of_stock}
                      className={`ml-auto px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        menu.is_out_of_stock
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white"
                      }`}
                    >
                      เพิ่ม
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto z-50">
          <button
            onClick={handleSubmitOrder}
            className="w-full bg-gray-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between hover:bg-gray-800 transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </div>
              <span className="font-medium text-sm">รายการในตะกร้า</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">สั่งเลย</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
