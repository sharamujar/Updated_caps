"use client";

import { useRouter } from "next/navigation";
import { db } from "../../firebase-config";
import ProtectedRoute from "@/app/components/protectedroute";
import { useEffect, useState } from "react";
import { addDoc, collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

interface Size {
    id: string;
    name: string;
    dimensions: string;
    slices: number;
    shape: string;
    maxVarieties: number;
    price: number;
    availableProducts: string[];
}

interface MenuItem {
    id: string;
    name: string;
    isAvailable: boolean;
}

export default function Sizes() {
    const [isOpenSize, setIsOpenSize] = useState(false);
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [editSize, setEditSize] = useState<string | null>(null);
    const [editMenuItem, setEditMenuItem] = useState<string | null>(null);

    const [sizes, setSizes] = useState<Size[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    const [size, setSize] = useState<Omit<Size, 'id'>>({
        name: "",
        dimensions: "",
        slices: 0,
        shape: "",
        maxVarieties: 0,
        price: 0,
        availableProducts: []
    });

    const [menuItem, setMenuItem] = useState({
        name: "",
        isAvailable: true
    });

    const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        setSize({ ...size, [e.target.name]: value });
    };

    const handleMenuItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setMenuItem({ ...menuItem, [e.target.name]: value });
    };

    useEffect(() => {
        fetchSizes();
        fetchMenuItems();
    }, []);

    const fetchSizes = async () => {
        const querySnapshot = await getDocs(collection(db, "sizes"));
        const sizeList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setSizes(sizeList as Size[]);
    };

    const fetchMenuItems = async () => {
        const querySnapshot = await getDocs(collection(db, "menuItems"));
        const menuList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setMenuItems(menuList as MenuItem[]);
    };

    const handleSizeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editSize) {
                await updateDoc(doc(db, "sizes", editSize), size);
                alert("Size updated successfully!");
            } else {
                await addDoc(collection(db, "sizes"), size);
                alert("Size added successfully!");
            }
            setSize({
                name: "",
                dimensions: "",
                slices: 0,
                shape: "",
                maxVarieties: 0,
                price: 0,
                availableProducts: []
            });
            setIsOpenSize(false);
            fetchSizes();
        } catch (error) {
            console.error("Error managing size: ", error);
            alert("Operation failed. Please try again later.");
        }
    };

    const handleMenuItemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editMenuItem) {
                await updateDoc(doc(db, "menuItems", editMenuItem), menuItem);
                alert("Menu item updated successfully!");
            } else {
                await addDoc(collection(db, "menuItems"), menuItem);
                alert("Menu item added successfully!");
            }
            setMenuItem({ name: "", isAvailable: true });
            setIsOpenMenu(false);
            fetchMenuItems();
        } catch (error) {
            console.error("Error managing menu item: ", error);
            alert("Operation failed. Please try again later.");
        }
    };

    const handleDeleteSize = async (sizeId: string) => {
        if (!sizeId) return;

        const confirmation = window.confirm("Are you sure you want to delete this size?");
        if (confirmation) {
            try {
                await deleteDoc(doc(db, "sizes", sizeId));
                alert("Size deleted successfully!");
                fetchSizes();
            } catch (error) {
                console.error("Error deleting size: ", error);
                alert("Failed to delete size. Please try again later.");
            }
        }
    };

    const handleDeleteMenuItem = async (menuItemId: string) => {
        if (!menuItemId) return;

        const confirmation = window.confirm("Are you sure you want to delete this menu item?");
        if (confirmation) {
            try {
                await deleteDoc(doc(db, "menuItems", menuItemId));
                alert("Menu item deleted successfully!");
                fetchMenuItems();
            } catch (error) {
                console.error("Error deleting menu item: ", error);
                alert("Failed to delete menu item. Please try again later.");
            }
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar will be rendered by the layout */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        {/* Product Sizes Section */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Product Sizes</h2>
                                    <button
                                        onClick={() => {
                                            setEditSize(null);
                                            setSize({
                                                name: "",
                                                dimensions: "",
                                                slices: 0,
                                                shape: "",
                                                maxVarieties: 0,
                                                price: 0,
                                                availableProducts: []
                                            });
                                            setIsOpenSize(true);
                                        }}
                                        className="px-4 py-2 bg-bg-light-brown text-white rounded hover:bg-opacity-90"
                                    >
                                        Add Size
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="p-4 bg-gray-50">Name</th>
                                                <th className="p-4 bg-gray-50">Dimensions</th>
                                                <th className="p-4 bg-gray-50">Slices</th>
                                                <th className="p-4 bg-gray-50">Shape</th>
                                                <th className="p-4 bg-gray-50">Max Varieties</th>
                                                <th className="p-4 bg-gray-50">Price</th>
                                                <th className="p-4 bg-gray-50">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sizes.map((size) => (
                                                <tr key={size.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-4">{size.name}</td>
                                                    <td className="p-4">{size.dimensions}</td>
                                                    <td className="p-4">{size.slices}</td>
                                                    <td className="p-4">{size.shape}</td>
                                                    <td className="p-4">{size.maxVarieties}</td>
                                                    <td className="p-4">₱{size.price.toFixed(2)}</td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => {
                                                                setEditSize(size.id);
                                                                setSize(size);
                                                                setIsOpenSize(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 mr-4"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSize(size.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Menu Items Section */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Menu Items</h2>
                                    <button
                                        onClick={() => {
                                            setEditMenuItem(null);
                                            setMenuItem({ name: "", isAvailable: true });
                                            setIsOpenMenu(true);
                                        }}
                                        className="px-4 py-2 bg-bg-light-brown text-white rounded hover:bg-opacity-90"
                                    >
                                        Add Menu Item
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="p-4 bg-gray-50">Name</th>
                                                <th className="p-4 bg-gray-50">Availability</th>
                                                <th className="p-4 bg-gray-50">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {menuItems.map((item) => (
                                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-4">{item.name}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {item.isAvailable ? 'Available' : 'Not Available'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => {
                                                                setEditMenuItem(item.id);
                                                                setMenuItem(item);
                                                                setIsOpenMenu(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 mr-4"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMenuItem(item.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modals */}
                    {isOpenSize && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-96">
                                <h3 className="text-xl font-bold mb-4">{editSize ? 'Edit Size' : 'Add Size'}</h3>
                                <form onSubmit={handleSizeSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={size.name}
                                            onChange={handleSizeChange}
                                            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                                        <input
                                            type="text"
                                            name="dimensions"
                                            value={size.dimensions}
                                            onChange={handleSizeChange}
                                            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Slices</label>
                                        <input
                                            type="number"
                                            name="slices"
                                            value={size.slices}
                                            onChange={handleSizeChange}
                                            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Shape</label>
                                        <select
                                            name="shape"
                                            value={size.shape}
                                            onChange={handleSizeChange}
                                            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                                            required
                                        >
                                            <option value="">Select shape</option>
                                            <option value="Round">Round</option>
                                            <option value="Rectangle">Rectangle</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Max Varieties</label>
                                        <input
                                            type="number"
                                            name="maxVarieties"
                                            value={size.maxVarieties}
                                            onChange={handleSizeChange}
                                            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Price</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={size.price}
                                            onChange={handleSizeChange}
                                            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Available Products</label>
                                        <select
                                            multiple
                                            name="availableProducts"
                                            value={size.availableProducts}
                                            onChange={(e) => {
                                                const options = Array.from(e.target.selectedOptions, option => option.value);
                                                setSize({ ...size, availableProducts: options });
                                            }}
                                            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                                            required
                                        >
                                            <option value="Sapin-sapin">Sapin-sapin</option>
                                            <option value="Kutsinta">Kutsinta</option>
                                            <option value="Bibingka">Bibingka</option>
                                            <option value="Kalamay">Kalamay</option>
                                            <option value="Cassava">Cassava</option>
                                        </select>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsOpenSize(false)}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-bg-light-brown text-white rounded hover:bg-opacity-90"
                                        >
                                            {editSize ? 'Update' : 'Add'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {isOpenMenu && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-96">
                                <h3 className="text-xl font-bold mb-4">{editMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
                                <form onSubmit={handleMenuItemSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={menuItem.name}
                                            onChange={handleMenuItemChange}
                                            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isAvailable"
                                            checked={menuItem.isAvailable}
                                            onChange={handleMenuItemChange}
                                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">Available</label>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsOpenMenu(false)}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-bg-light-brown text-white rounded hover:bg-opacity-90"
                                        >
                                            {editMenuItem ? 'Update' : 'Add'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
} 