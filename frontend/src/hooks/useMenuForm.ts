import { useState } from 'react';
import { menus } from '@/lib/api';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    category_id: string;
    category?: { id: string; name: string };
    image_url?: string;
    is_available: boolean;
    branch_id?: string;
    package_menus?: Array<{ package: { id: string; name: string } }>;
}

interface MenuFormData {
    name: string;
    description: string;
    category_id: string;
    package_id: string;
    branch_id: string;
    image_url: string;
    is_available: boolean;
}

export function useMenuForm() {
    const [formData, setFormData] = useState<MenuFormData>({
        name: '',
        description: '',
        category_id: '',
        package_id: '',
        branch_id: '',
        image_url: '',
        is_available: true,
    });
    const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
                alert('Only PNG and JPG images are allowed');
                return;
            }
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) return null;

        setUploading(true);
        try {
            const response = await menus.uploadImage(imageFile);
            return response.data.url;
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Failed to upload image');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (onSuccess: () => void) => {
        try {
            let imageUrl = formData.image_url;

            // Upload image if file selected
            if (imageFile) {
                const uploadedUrl = await uploadImage();
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            }

            const data = {
                ...formData,
                image_url: imageUrl,
            };

            if (editingMenu) {
                await menus.update(editingMenu.id, data);
                alert('Menu updated successfully');
            } else {
                await menus.create(data);
                alert('Menu created successfully');
            }

            resetForm();
            onSuccess();
        } catch (error: any) {
            console.error('Failed to save menu:', error);
            alert(error.response?.data?.message || 'Failed to save menu');
        }
    };

    const handleEdit = (menu: MenuItem) => {
        setEditingMenu(menu);
        setFormData({
            name: menu.name,
            description: menu.description,
            category_id: menu.category_id,
            package_id: menu.package_menus?.[0]?.package?.id || '',
            branch_id: menu.branch_id || '',
            image_url: menu.image_url || '',
            is_available: menu.is_available,
        });
        if (menu.image_url) {
            setImagePreview(menu.image_url);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category_id: '',
            package_id: '',
            branch_id: '',
            image_url: '',
            is_available: true,
        });
        setEditingMenu(null);
        setImageFile(null);
        setImagePreview('');
    };

    return {
        formData,
        setFormData,
        editingMenu,
        imageFile,
        imagePreview,
        uploading,
        handleImageChange,
        handleSubmit,
        handleEdit,
        resetForm,
    };
}

