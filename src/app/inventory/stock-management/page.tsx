"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import ProtectedRoute from "@/app/components/protectedroute";

interface Stock {
    id: string;
    productName: string;
    quantity: number;
    unit: string;
    supplier: string;
    receivedDate: string;
    remarks: string;
}

export default function Stock() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [stock, setStock] = useState<Stock>({
        id: '',
        productName: "",
        quantity: 0,
        unit: "",
        supplier: "",
        receivedDate: "",
        remarks: ""
    });
    const [editStockId, setEditStockId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "stocks"));
            const stockList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Stock[];
            setStocks(stockList);
        } catch (error) {
            console.error("Error fetching stocks:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setStock({ ...stock, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editStockId) {
                await updateDoc(doc(db, "stocks", editStockId), {
                    ...stock,
                    updatedAt: new Date()
                });
                alert("Stock updated successfully!");
            } else {
                await addDoc(collection(db, "stocks"), {
                    ...stock,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                alert("Stock added successfully!");
            }
            resetForm();
            fetchStocks();
        } catch (error) {
            console.error("Error handling stock:", error);
            alert("Failed to process stock. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (stk: Stock) => {
        setEditStockId(stk.id);
        setStock(stk);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this stock?")) {
            try {
                await deleteDoc(doc(db, "stocks", id));
                alert("Stock deleted successfully!");
                fetchStocks();
            } catch (error) {
                console.error("Error deleting stock:", error);
                alert("Failed to delete stock.");
            }
        }
    };

    const resetForm = () => {
        setStock({
            id: '',
            productName: "",
            quantity: 0,
            unit: "",
            supplier: "",
            receivedDate: "",
            remarks: ""
        });
        setEditStockId(null);
    };

    return (
        <ProtectedRoute>
            <div className="flex flex-col items-center h-screen bg-gray-100 overflow-y-auto">
                <h1 className="text-4xl font-extrabold text-black mb-4 shadow-md py-2 px-4 rounded-lg sticky top-0 bg-white w-full text-center z-10">Stock Management</h1>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
                    <input
                        type="text"
                        name="productName"
                        value={stock.productName}
                        onChange={handleChange}
                        placeholder="Product Name"
                        required
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="number"
                        name="quantity"
                        value={stock.quantity}
                        onChange={handleChange}
                        placeholder="Quantity"
                        required
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="text"
                        name="unit"
                        value={stock.unit}
                        onChange={handleChange}
                        placeholder="Unit"
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="text"
                        name="supplier"
                        value={stock.supplier}
                        onChange={handleChange}
                        placeholder="Supplier"
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="date"
                        name="receivedDate"
                        value={stock.receivedDate}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                    />
                    <textarea
                        name="remarks"
                        value={stock.remarks}
                        onChange={handleChange}
                        placeholder="Remarks"
                        className="border p-2 rounded w-full col-span-1 md:col-span-2"
                    ></textarea>
                    <button
                        type="submit"
                        className="bg-bg-light-brown text-white p-2 rounded hover:bg-bg-dark-brown col-span-1 md:col-span-2">
                        {editStockId ? "Update Stock" : "Add Stock"}
                    </button>
                </form>

                <div className="mt-8 w-full max-w-4xl">
                    <h2 className="text-2xl font-bold text-black mb-4 shadow-md py-2 px-4 rounded-lg sticky top-0 bg-white w-full z-10">Stock List</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stocks.map((stk) => (
                            <div key={stk.id} className="border p-4 rounded bg-white shadow-md">
                                <h3 className="font-bold text-lg">{stk.productName}</h3>
                                <p>Quantity: {stk.quantity} <span className="text-sm text-gray-500">{stk.unit}</span></p>
                                <p>Supplier: {stk.supplier}</p>
                                <p>Received Date: {stk.receivedDate}</p>
                                <p>Remarks: {stk.remarks}</p>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                        onClick={() => handleEdit(stk)}>
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                        onClick={() => handleDelete(stk.id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
