"use client";

import { useRouter } from "next/navigation";
import { db } from "../firebase-config";
import ProtectedRoute from "@/app/components/protectedroute";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

export default function Orders() {
    const [orders, setOrders] = useState([]);

    // Fetch orders from Firestore
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "orders"));
                const orderList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setOrders(orderList);
            } catch (error) {
                console.error("Error fetching orders:", error);
                alert("Failed to load orders. Please try again later.");
            }
        };

        fetchOrders();
    }, []);

    return (
        <ProtectedRoute>
            <div className="flex flex-col items-center h-screen bg-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Orders</h1>

                <div className="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border ml-8">
                    <table className="w-full text-left table-auto min-w-max">
                        <thead>
                            <tr>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Customer Name</th>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Contact</th>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Product Name</th>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Quantity</th>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Total Price</th>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 border-b border-slate-200">
                                        <td className="p-4 py-5">{order.customerName || '-'}</td>
                                        <td className="p-4 py-5">{order.contact || '-'}</td>
                                        <td className="p-4 py-5">{order.productName || '-'}</td>
                                        <td className="p-4 py-5">{order.quantity || '-'}</td>
                                        <td className="p-4 py-5">₱{order.totalPrice || '0'}</td>
                                        <td className="p-4 py-5">{order.status || 'Pending'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-4">No orders available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ProtectedRoute>
    );
}