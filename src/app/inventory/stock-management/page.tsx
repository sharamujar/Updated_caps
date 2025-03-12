"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import ProtectedRoute from "@/app/components/protectedroute";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";

export default function Stock() {
    const [stocks, setStocks] = useState<Array<{
        id: string;
        productName: string;
        quantity: number;
        unit: string;
        supplier: string;
        receivedDate: string;
        remarks: string;
    }>>([]);

    const [stock, setStock] = useState({
        productName: "",
        quantity: "",
        unit: "",
        supplier: "",
        receivedDate: "",
        remarks: ""
    });

    const [editStock, setEditStock] = useState<string | null>(null);

    const [user, setUser] = useState({
        name: "",
        email: "",
        role: "",
        status: "Inactive",
        password: "",
    });

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        const querySnapshot = await getDocs(collection(db, "stocks"));
        const stockList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            productName: doc.data().productName,
            quantity: doc.data().quantity,
            unit: doc.data().unit,
            supplier: doc.data().supplier,
            receivedDate: doc.data().receivedDate,
            remarks: doc.data().remarks
        }));
        setStocks(stockList);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editStock) {
                await updateDoc(doc(db, "stocks", editStock), {
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
            setStock({ productName: "", quantity: "", unit: "", supplier: "", receivedDate: "", remarks: "" });
            setEditStock(null);
            fetchStocks();
        } catch (error) {
            console.error("Error handling stock: ", error);
            alert("Failed to process stock. Please try again later.");
        }
    };

    const handleEdit = (stk: { id: any; productName: any; quantity: any; unit: any; supplier: any; receivedDate: any; remarks: any; }) => {
        setEditStock(stk.id);
        setStock({
            productName: stk.productName,
            quantity: stk.quantity,
            unit: stk.unit,
            supplier: stk.supplier,
            receivedDate: stk.receivedDate,
            remarks: stk.remarks
        });
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this stock?")) {
            try {
                await deleteDoc(doc(db, "stocks", id));
                alert("Stock deleted successfully!");
                fetchStocks();
            } catch (error) {
                console.error("Error deleting stock: ", error);
                alert("Failed to delete stock.");
            }
        }
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
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={user.password}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-bg-light-brown text-white p-2 rounded hover:bg-bg-dark-brown col-span-1 md:col-span-2">
                        {editStock ? "Update Stock" : "Add Stock"}
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
