"use client";

import { useRouter } from "next/navigation";
import { db } from "../../firebase-config";
import ProtectedRoute from "@/app/components/protectedroute";
import { useEffect, useState } from "react";
import { addDoc, collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

export default function Categories() {
    const [isOpen, setIsOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<string | null>(null);

    const [categories, setCategories] = useState<Array<{
        id: string;
        name: string;
        description: string;
    }>>([]);

    const [category, setCategory] = useState({
        name: "",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCategory({ ...category, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const categoryList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setCategories(categoryList as typeof categories);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "categories"), category);
            alert("Category added successfully!");
            setCategory({ name: "", description: "" });
            fetchCategories();
        } catch (error) {
            console.error("Error adding category: ", error);
            alert("Failed to add category. Please try again later.");
        }
    };

    const handleEdit = async (categoryID: string) => {
        if (!categoryID) return;

        try {
            await updateDoc(doc(db, "categories", categoryID), category);
            alert("Category updated successfully!");
            setCategory({ name: "", description: "" });
            fetchCategories();
        } catch (error) {
            console.error("Error updating category:", error);
            alert("Failed to update category.");
        }
    };

    const handleDelete = async (categoryID: string) => {
        if (!categoryID) return;

        const confirmation = window.confirm("Are you sure you want to delete this category?");
        if (confirmation) {
            try {
                await deleteDoc(doc(db, "categories", categoryID));
                alert("Category deleted successfully!");
                fetchCategories(); // Refresh the categories list
            } catch (error) {
                console.error("Error deleting category: ", error);
                alert("Failed to delete category. Please try again later.");
            }
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Categories</h1>

                <div className="w-full flex flex-col p-4">
                    <button
                        onClick={() => {
                            setEditCategory(null);
                            setCategory({ name: "", description: "" });
                            setIsOpen(true);
                        }}
                        className="px-6 py-3 rounded text-center text-sm font-semibold text-white bg-bg-light-brown shadow-md hover:shadow-lg">
                        + Add Category
                    </button>

                    {isOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (editCategory) {
                                            handleEdit(editCategory);
                                        } else {
                                            handleSubmit(e);
                                        }
                                    }}
                                    className="flex flex-col gap-4"
                                >
                                    <input
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        type="text"
                                        name="name"
                                        value={category.name}
                                        onChange={handleChange}
                                        placeholder="Category Name"
                                        required
                                    />
                                    <textarea
                                        className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md"
                                        name="description"
                                        value={category.description}
                                        onChange={handleChange}
                                        placeholder="Description"
                                        required
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                            type="submit"
                                        >
                                            {editCategory ? "Update" : "Add"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative flex flex-col w-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg">
                    <table className="w-full text-left table-auto min-w-max">
                        <thead>
                            <tr>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Name</th>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Description</th>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length > 0 ? (
                                categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-slate-50 border-b border-slate-200">
                                        <td className="p-4 py-5 text-sm text-slate-800">{category.name}</td>
                                        <td className="p-4 py-5 text-sm text-slate-800">{category.description}</td>
                                        <td className="p-4 py-5">
                                            <button
                                                className="text-slate-600 hover:text-slate-800"
                                                onClick={() => {
                                                    setIsOpen(true);
                                                    setEditCategory(category.id);
                                                    setCategory({
                                                        name: category.name,
                                                        description: category.description,
                                                    });
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-800 ml-4"
                                                onClick={() => handleDelete(category.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center p-4">No categories available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ProtectedRoute>
    );
}
