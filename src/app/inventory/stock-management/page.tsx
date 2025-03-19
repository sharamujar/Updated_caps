"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy, where, limit } from "firebase/firestore";
import { db } from "../../firebase-config";
import ProtectedRoute from "@/app/components/protectedroute";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Stock {
    id: string;
    productName: string;
    quantity: number;
    unit: string;
    minimumStock: number;
    reorderPoint: number;
    receivedDate: string;
    lastUpdated: Date;
    price: number;
    category: string;
    location: string;
    remarks: string;
}

interface StockHistory {
    id: string;
    productName: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    date: Date;
    updatedBy: string;
    remarks: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor?: string;
    tension: number;
  }[];
}

export default function Stock() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
    const [stock, setStock] = useState<Stock>({
        id: '',
        productName: "",
        quantity: 0,
        unit: "",
        minimumStock: 0,
        reorderPoint: 0,
        receivedDate: "",
        lastUpdated: new Date(),
        price: 0,
        category: "",
        location: "",
        remarks: ""
    });
    const [editStockId, setEditStockId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [stockChartData, setStockChartData] = useState<ChartData>({
        labels: [],
        datasets: [{
            label: 'Stock Level',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.1
        }]
    });
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showLowStock, setShowLowStock] = useState(false);

    useEffect(() => {
        fetchStocks();
        fetchStockHistory();
    }, []);

    const fetchStocks = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "stocks"));
            const stockList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
            })) as Stock[];
            setStocks(stockList);
            updateStockChart(stockList);
        } catch (error) {
            console.error("Error fetching stocks:", error);
        }
    };

    const fetchStockHistory = async () => {
        try {
            const historyRef = collection(db, "stockHistory");
            const historyQuery = query(historyRef, orderBy("date", "desc"), limit(50));
            const querySnapshot = await getDocs(historyQuery);
            const historyList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate()
            })) as StockHistory[];
            setStockHistory(historyList);
        } catch (error) {
            console.error("Error fetching stock history:", error);
        }
    };

    const updateStockChart = (stockList: Stock[]) => {
        const sortedStocks = [...stockList].sort((a, b) => b.quantity - a.quantity);
        setStockChartData({
            labels: sortedStocks.map(s => s.productName),
            datasets: [{
                label: 'Current Stock Level',
                data: sortedStocks.map(s => s.quantity),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1
            }]
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setStock(prev => ({
            ...prev,
            [name]: name === 'quantity' || name === 'price' || name === 'minimumStock' || name === 'reorderPoint' 
                ? parseFloat(value) 
                : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const timestamp = new Date();
            if (editStockId) {
                const stockRef = doc(db, "stocks", editStockId);
                const oldStock = stocks.find(s => s.id === editStockId);
                
                await updateDoc(stockRef, {
                    ...stock,
                    lastUpdated: timestamp
                });

                // Record in history
                await addDoc(collection(db, "stockHistory"), {
                    productName: stock.productName,
                    type: 'adjustment',
                    quantity: stock.quantity - (oldStock?.quantity || 0),
                    previousQuantity: oldStock?.quantity || 0,
                    newQuantity: stock.quantity,
                    date: timestamp,
                    updatedBy: "Admin", // Replace with actual user
                    remarks: `Stock updated from ${oldStock?.quantity} to ${stock.quantity}`
                });

                alert("Stock updated successfully!");
            } else {
                await addDoc(collection(db, "stocks"), {
                    ...stock,
                    lastUpdated: timestamp,
                    createdAt: timestamp
                });

                // Record in history
                await addDoc(collection(db, "stockHistory"), {
                    productName: stock.productName,
                    type: 'in',
                    quantity: stock.quantity,
                    previousQuantity: 0,
                    newQuantity: stock.quantity,
                    date: timestamp,
                    updatedBy: "Admin", // Replace with actual user
                    remarks: "Initial stock entry"
                });

                alert("Stock added successfully!");
            }
            resetForm();
            await Promise.all([fetchStocks(), fetchStockHistory()]);
        } catch (error) {
            console.error("Error handling stock:", error);
            alert("Failed to process stock. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleStockAdjustment = async (id: string, adjustment: number) => {
        try {
            const stockRef = doc(db, "stocks", id);
            const currentStock = stocks.find(s => s.id === id);
            if (!currentStock) return;

            const newQuantity = currentStock.quantity + adjustment;
            if (newQuantity < 0) {
                alert("Stock cannot be negative!");
                return;
            }

            const timestamp = new Date();
            await updateDoc(stockRef, {
                quantity: newQuantity,
                lastUpdated: timestamp
            });

            // Record in history
            await addDoc(collection(db, "stockHistory"), {
                productName: currentStock.productName,
                type: adjustment > 0 ? 'in' : 'out',
                quantity: Math.abs(adjustment),
                previousQuantity: currentStock.quantity,
                newQuantity: newQuantity,
                date: timestamp,
                updatedBy: "Admin", // Replace with actual user
                remarks: `Stock ${adjustment > 0 ? 'added' : 'removed'}: ${Math.abs(adjustment)} units`
            });

            await Promise.all([fetchStocks(), fetchStockHistory()]);
            alert(`Stock ${adjustment > 0 ? 'added' : 'removed'} successfully!`);
        } catch (error) {
            console.error("Error adjusting stock:", error);
            alert("Failed to adjust stock. Please try again later.");
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
            minimumStock: 0,
            reorderPoint: 0,
            receivedDate: "",
            lastUpdated: new Date(),
            price: 0,
            category: "",
            location: "",
            remarks: ""
        });
        setEditStockId(null);
    };

    const filteredStocks = stocks
        .filter(s => filterCategory === 'all' || s.category === filterCategory)
        .filter(s => showLowStock ? s.quantity <= s.minimumStock : true)
        .filter(s => 
            s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.location.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Stock Levels Overview'
            },
        },
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar will be rendered here by the layout */}
                <div className="flex-1 overflow-y-auto bg-gray-100">
                    <div className="p-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Stock Management</h1>

                        {/* Stock Chart */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                            <h2 className="text-xl font-semibold mb-4">Stock Levels Overview</h2>
                            <div className="h-[300px]">
                                <Line options={chartOptions} data={stockChartData} />
                            </div>
                        </div>

                        {/* Filters and Controls */}
                        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-center">
                            <input
                                type="text"
                                placeholder="Search products or locations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border p-2 rounded flex-1"
                            />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="border p-2 rounded"
                            >
                                <option value="all">All Categories</option>
                                {/* Add your categories here */}
                            </select>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={showLowStock}
                                    onChange={(e) => setShowLowStock(e.target.checked)}
                                />
                                Show Low Stock Only
                            </label>
                        </div>

                        {/* Updated Stock Form */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                            <h2 className="text-xl font-semibold mb-4">{editStockId ? 'Edit Stock' : 'Add New Stock'}</h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                        <input
                                            type="text"
                                            name="productName"
                                            value={stock.productName}
                                            onChange={handleChange}
                                            required
                                            className="border p-2 rounded w-full"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={stock.quantity}
                                                onChange={handleChange}
                                                min="0"
                                                step="1"
                                                required
                                                className="border p-2 rounded w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                            <input
                                                type="text"
                                                name="unit"
                                                value={stock.unit}
                                                onChange={handleChange}
                                                placeholder="pcs, kg, etc."
                                                className="border p-2 rounded w-full"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={stock.price}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            className="border p-2 rounded w-full"
                                        />
                                    </div>
                                </div>

                                {/* Stock Control */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock</label>
                                            <input
                                                type="number"
                                                name="minimumStock"
                                                value={stock.minimumStock}
                                                onChange={handleChange}
                                                min="0"
                                                step="1"
                                                className="border p-2 rounded w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
                                            <input
                                                type="number"
                                                name="reorderPoint"
                                                value={stock.reorderPoint}
                                                onChange={handleChange}
                                                min="0"
                                                step="1"
                                                className="border p-2 rounded w-full"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            name="category"
                                            value={stock.category}
                                            onChange={handleChange}
                                            className="border p-2 rounded w-full"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="raw">Raw Materials</option>
                                            <option value="finished">Finished Products</option>
                                            <option value="packaging">Packaging</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Received Date</label>
                                        <input
                                            type="date"
                                            name="receivedDate"
                                            value={stock.receivedDate}
                                            onChange={handleChange}
                                            className="border p-2 rounded w-full"
                                        />
                                    </div>
                                </div>

                                {/* Remarks - Full Width */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                    <textarea
                                        name="remarks"
                                        value={stock.remarks}
                                        onChange={handleChange}
                                        className="border p-2 rounded w-full h-20"
                                    ></textarea>
                                </div>

                                {/* Form Buttons */}
                                <div className="md:col-span-2 flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1"
                                    >
                                        {loading ? 'Processing...' : (editStockId ? 'Update Stock' : 'Add Stock')}
                                    </button>
                                    {editStockId && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Stock List */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                            <h2 className="text-xl font-semibold mb-4">Stock List</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="p-3 text-left">Product</th>
                                            <th className="p-3 text-right">Quantity</th>
                                            <th className="p-3 text-left">Category</th>
                                            <th className="p-3 text-right">Price</th>
                                            <th className="p-3 text-center">Status</th>
                                            <th className="p-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStocks.map((stk) => (
                                            <tr key={stk.id} className="border-t hover:bg-gray-50">
                                                <td className="p-3">
                                                    <div className="font-medium">{stk.productName}</div>
                                                    <div className="text-sm text-gray-500">{stk.category}</div>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="font-medium">{stk.quantity} {stk.unit}</div>
                                                    <div className="text-sm text-gray-500">Min: {stk.minimumStock}</div>
                                                </td>
                                                <td className="p-3">
                                                    <div>{stk.category}</div>
                                                </td>
                                                <td className="p-3 text-right">₱{(stk.price || 0).toLocaleString()}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        stk.quantity <= stk.minimumStock
                                                            ? 'bg-red-100 text-red-800'
                                                            : stk.quantity <= stk.reorderPoint
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {stk.quantity <= stk.minimumStock
                                                            ? 'Low Stock'
                                                            : stk.quantity <= stk.reorderPoint
                                                            ? 'Reorder Soon'
                                                            : 'In Stock'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleStockAdjustment(stk.id, 1)}
                                                            className="p-1 hover:bg-gray-100 rounded"
                                                            title="Add Stock"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleStockAdjustment(stk.id, -1)}
                                                            className="p-1 hover:bg-gray-100 rounded"
                                                            title="Remove Stock"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(stk)}
                                                            className="p-1 hover:bg-gray-100 rounded"
                                                            title="Edit"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(stk.id)}
                                                            className="p-1 hover:bg-gray-100 rounded"
                                                            title="Delete"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Stock History */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Stock History</h2>
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    {showHistory ? 'Hide History' : 'Show History'}
                                </button>
                            </div>
                            {showHistory && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="p-3 text-left">Date</th>
                                                <th className="p-3 text-left">Product</th>
                                                <th className="p-3 text-center">Type</th>
                                                <th className="p-3 text-right">Previous</th>
                                                <th className="p-3 text-right">Change</th>
                                                <th className="p-3 text-right">New</th>
                                                <th className="p-3 text-left">Updated By</th>
                                                <th className="p-3 text-left">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stockHistory.map((history) => (
                                                <tr key={history.id} className="border-t hover:bg-gray-50">
                                                    <td className="p-3">{history.date.toLocaleDateString()}</td>
                                                    <td className="p-3">{history.productName}</td>
                                                    <td className="p-3 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            history.type === 'in' ? 'bg-green-100 text-green-800' :
                                                            history.type === 'out' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {history.type === 'in' ? 'Stock In' :
                                                             history.type === 'out' ? 'Stock Out' :
                                                             'Adjustment'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right">{history.previousQuantity}</td>
                                                    <td className="p-3 text-right">{history.quantity}</td>
                                                    <td className="p-3 text-right">{history.newQuantity}</td>
                                                    <td className="p-3">{history.updatedBy}</td>
                                                    <td className="p-3">{history.remarks}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
