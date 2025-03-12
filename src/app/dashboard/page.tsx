"use client"; // Required for using hooks

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import ProtectedRoute from "@/app/components/protectedroute";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config"; // Adjust the import based on your setup
import StockChart from "@/app/components/StockChart"; // Import the StockChart component
import Notification from "@/app/components/Notification"; // Import the Notification component

export default function Dashboard() {
  const router = useRouter(); // Next.js navigation
  const [chartData, setChartData] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  });
  const [notifications, setNotifications] = useState<{ message: string; type: 'success' | 'error' }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [totalInventory, setTotalInventory] = useState(0);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out user
      router.push("/"); // Redirect to home page
    } catch (error: any) {
      console.error("Logout error:", error.code, error.message);
      setNotifications(prev => [...prev, { message: "Logout failed. Please try again.", type: 'error' }]);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchSales();
  }, []);

  const fetchStocks = async () => {
    try {
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

      // Prepare data for the chart
      const labels = stockList.map(stock => stock.productName);
      const values = stockList.map(stock => stock.quantity);
      setChartData({ labels, values });

      // Calculate total inventory
      const total = stockList.reduce((acc, stock) => acc + stock.quantity, 0);
      setTotalInventory(total);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      setNotifications(prev => [...prev, { message: "Failed to fetch stocks.", type: 'error' }]);
    }
  };

  const fetchSales = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "sales")); // Adjust collection name as needed
      const salesList = querySnapshot.docs.map(doc => doc.data());

      // Calculate total sales
      const total = salesList.reduce((acc, sale) => acc + (sale.amount || 0), 0);
      setTotalSales(total);
    } catch (error) {
      console.error("Error fetching sales:", error);
      setNotifications(prev => [...prev, { message: "Failed to fetch sales.", type: 'error' }]);
    }
  };

  const closeNotification = () => {
    setShowNotifications(false);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100 relative p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Dashboard
        </h1>

        {/* Total Sales and Inventory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 w-full max-w-4xl">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Total Sales</h2>
            <p className="text-2xl text-gray-700">${totalSales.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Total Inventory</h2>
            <p className="text-2xl text-gray-700">{totalInventory}</p>
          </div>
        </div>

        <StockChart data={chartData} /> {/* Integrate the StockChart component */}

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 mt-4"
        >
          Logout
        </button>

        {/* Notification Icon */}
        <div className="absolute top-4 right-4">
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
            <span className="material-icons" style={{ fontSize: '24px', cursor: 'pointer' }}>notifications</span>
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                {notifications.length}
              </span>
            )}
          </button>
        </div>

        {/* Notification Dropdown */}
        {showNotifications && (
          <Notification
            notifications={notifications}
            onClose={closeNotification}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
