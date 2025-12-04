"use client";

import { useState, useEffect } from "react";
import { menus, packages as packagesApi, branches } from "@/lib/api";
import { useMenuForm } from "@/hooks/useMenuForm";
import MenuFormModal from "@/components/modals/MenuFormModal";
import CategoryManagement from "./CategoryManagement";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category?: { id: string; name: string };
  image_url?: string;
  is_available: boolean;
  is_out_of_stock?: boolean;
  stock_quantity?: number | null;
  low_stock_threshold?: number | null;
  package_menus?: Array<{ package: { id: string; name: string } }>;
}

interface Category {
  id: string;
  name: string;
}

interface Package {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
}

interface MenuManagementProps {
  onClose?: () => void;
}

export default function MenuManagement({ onClose }: MenuManagementProps) {
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [packagesList, setPackagesList] = useState<Package[]>([]);
  const [branchesList, setBranchesList] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>(""); // "" = All
  const [filterPackage, setFilterPackage] = useState<string>(""); // "" = All

  const menuForm = useMenuForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [menusRes, categoriesRes, packagesRes, branchesRes] =
        await Promise.all([
          menus.getAll(),
          menus.getCategories(),
          packagesApi.getAll(),
          branches.getAll(),
        ]);
      setMenuList(menusRes.data);
      setCategories(categoriesRes.data);
      setPackagesList(packagesRes.data);
      setBranchesList(branchesRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await menuForm.handleSubmit(() => {
      setShowModal(false);
      loadData();
    });
  };

  const handleEdit = (menu: MenuItem) => {
    menuForm.handleEdit(menu);
    setShowModal(true);
  };

  const handleDelete = async (menu: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${menu.name}"?`)) return;

    try {
      await menus.delete(menu.id);
      alert("Menu deleted successfully");
      loadData();
    } catch (error) {
      console.error("Failed to delete menu:", error);
      alert("Failed to delete menu");
    }
  };

  const handleToggleAvailability = async (menu: MenuItem) => {
    try {
      await menus.toggleAvailability(menu.id);
      loadData();
    } catch (error) {
      console.error("Failed to toggle availability:", error);
      alert("Failed to update menu status");
    }
  };

  const handleToggleStock = async (menu: MenuItem) => {
    try {
      const newStockStatus = !menu.is_out_of_stock;
      await menus.toggleStock(menu.id, newStockStatus);
      loadData();
    } catch (error) {
      console.error("Failed to toggle stock:", error);
      alert("Failed to update stock status");
    }
  };


  const handleAddNew = () => {
    menuForm.resetForm();
    // Auto-select first branch for new menus
    if (branchesList.length > 0) {
      menuForm.setFormData({
        ...menuForm.formData,
        branch_id: branchesList[0].id,
      });
    }
    setShowModal(true);
  };

  const handleCategoryManagementClose = () => {
    setShowCategoryManagement(false);
    loadData(); // Reload to get updated categories
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // Filter menu list
  const filteredMenuList = menuList.filter((menu) => {
    if (filterCategory && menu.category_id !== filterCategory) return false;
    if (filterPackage && !menu.package_menus?.some(pm => pm.package.id === filterPackage)) return false;
    return true;
  });

  // Show CategoryManagement if requested
  if (showCategoryManagement) {
    return <CategoryManagement onClose={handleCategoryManagementClose} />;
  }

  return (
    <div className="space-y-6 p-4">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowCategoryManagement(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          📁 Manage Categories
        </button>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Menu Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Package
            </label>
            <select
              value={filterPackage}
              onChange={(e) => setFilterPackage(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">All Packages</option>
              {packagesList.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Package
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stock
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMenuList.map((menu) => (
              <tr key={menu.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {menu.image_url ? (
                    <img
                      src={menu.image_url}
                      alt={menu.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {menu.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {menu.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {menu.category?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {menu.package_menus?.[0]?.package?.name || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleAvailability(menu)}
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${menu.is_available
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {menu.is_available ? "Available" : "Unavailable"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {menu.stock_quantity === null || menu.stock_quantity === undefined ? (
                    <span className="text-green-600">♾️ Unlimited</span>
                  ) : menu.stock_quantity === 0 || menu.is_out_of_stock ? (
                    <span className="text-red-600">🔴 Out of Stock</span>
                  ) : menu.stock_quantity <=
                    (menu.low_stock_threshold || 10) ? (
                    <span className="text-yellow-600">
                      ⚠️ Low ({menu.stock_quantity})
                    </span>
                  ) : (
                    <span className="text-green-600">
                      🟢 {menu.stock_quantity}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(menu)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(menu)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <MenuFormModal
        show={showModal}
        editingMenu={menuForm.editingMenu}
        formData={menuForm.formData}
        categories={categories}
        packagesList={packagesList}
        branchesList={branchesList}
        imagePreview={menuForm.imagePreview}
        uploading={menuForm.uploading}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowModal(false);
          menuForm.resetForm();
        }}
        onFormDataChange={menuForm.setFormData}
        onImageChange={menuForm.handleImageChange}
      />
    </div>
  );
}
