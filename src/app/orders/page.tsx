"use client";

import { useRouter } from "next/navigation";
import { db } from "../firebase-config";
import ProtectedRoute from "@/app/components/protectedroute";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, updateDoc, doc, onSnapshot } from "firebase/firestore";

interface Order {
    id: string;
    customerName: string;
    contact: string;
    email: string;
    address: string;
    productName: string;
    quantity: number;
    totalPrice: number;
    status: 'Pending' | 'Processing' | 'Ready' | 'Completed' | 'Cancelled';
    paymentStatus: 'Pending' | 'Paid' | 'Failed';
    paymentMethod: string;
    deliveryMethod: 'Delivery' | 'Pickup';
    deliveryAddress?: string;
    deliveryDate?: string;
    pickupDate?: string;
    pickupLocation?: string;
    orderDate: Date;
    lastUpdated: Date;
    notes: string;
}

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPayment, setFilterPayment] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // Real-time orders subscription
    useEffect(() => {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, orderBy("orderDate", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orderList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                orderDate: doc.data().orderDate?.toDate(),
                lastUpdated: doc.data().lastUpdated?.toDate()
            })) as Order[];
            setOrders(orderList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
        try {
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, {
                status: newStatus,
                lastUpdated: new Date()
            });
        } catch (error) {
            console.error("Error updating order status:", error);
            alert("Failed to update order status.");
        }
    };

    const handlePaymentUpdate = async (orderId: string, newStatus: Order['paymentStatus']) => {
        try {
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, {
                paymentStatus: newStatus,
                lastUpdated: new Date()
            });
        } catch (error) {
            console.error("Error updating payment status:", error);
            alert("Failed to update payment status.");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
        const matchesSearch = 
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.contact.includes(searchTerm);
        return matchesStatus && matchesPayment && matchesSearch;
    });

    return (
        <ProtectedRoute>
            <div className="flex flex-col min-h-screen bg-gray-100 p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Orders Management</h1>

                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border p-2 rounded flex-1"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Ready">Ready</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <select
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="all">All Payments</option>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery/Pickup</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">Loading orders...</td>
                                    </tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">No orders found.</td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                                                <div className="text-sm text-gray-500">
                                                    Qty: {order.quantity} • ₱{order.totalPrice.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {order.orderDate?.toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                                                <div className="text-sm text-gray-500">{order.contact}</div>
                                                <div className="text-sm text-gray-500">{order.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{order.paymentMethod}</div>
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                                                    order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{order.deliveryMethod}</div>
                                                <div className="text-sm text-gray-500">
                                                    {order.deliveryMethod === 'Delivery' 
                                                        ? `Delivery Date: ${order.deliveryDate}`
                                                        : `Pickup Date: ${order.pickupDate}`
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                                                    className={`px-2 py-1 rounded text-sm ${
                                                        order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                        order.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Ready">Ready</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowDetails(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Order Details Modal */}
                {showDetails && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Order Details</h2>
                                    <button
                                        onClick={() => setShowDetails(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ×
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="border-b pb-4">
                                        <h3 className="font-medium mb-2">Customer Information</h3>
                                        <p>Name: {selectedOrder.customerName}</p>
                                        <p>Contact: {selectedOrder.contact}</p>
                                        <p>Email: {selectedOrder.email}</p>
                                        <p>Address: {selectedOrder.address}</p>
                                    </div>

                                    <div className="border-b pb-4">
                                        <h3 className="font-medium mb-2">Order Information</h3>
                                        <p>Product: {selectedOrder.productName}</p>
                                        <p>Quantity: {selectedOrder.quantity}</p>
                                        <p>Total Price: ₱{selectedOrder.totalPrice.toLocaleString()}</p>
                                        <p>Order Date: {selectedOrder.orderDate?.toLocaleString()}</p>
                                    </div>

                                    <div className="border-b pb-4">
                                        <h3 className="font-medium mb-2">Delivery/Pickup Information</h3>
                                        <p>Method: {selectedOrder.deliveryMethod}</p>
                                        {selectedOrder.deliveryMethod === 'Delivery' ? (
                                            <>
                                                <p>Delivery Address: {selectedOrder.deliveryAddress}</p>
                                                <p>Delivery Date: {selectedOrder.deliveryDate}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p>Pickup Location: {selectedOrder.pickupLocation}</p>
                                                <p>Pickup Date: {selectedOrder.pickupDate}</p>
                                            </>
                                        )}
                                    </div>

                                    <div className="border-b pb-4">
                                        <h3 className="font-medium mb-2">Payment Information</h3>
                                        <p>Method: {selectedOrder.paymentMethod}</p>
                                        <p>Status: {selectedOrder.paymentStatus}</p>
                                    </div>

                                    <div>
                                        <h3 className="font-medium mb-2">Additional Notes</h3>
                                        <p>{selectedOrder.notes || 'No additional notes'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}