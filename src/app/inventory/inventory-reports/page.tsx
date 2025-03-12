"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/protectedroute";

export default function InventoryReports() {
    const [reports, setReports] = useState<Array<{
        id: string,
        date: string,
        productName: string,
        stockIn: number,
        stockOut: number,
        currentStock: number,
        remarks?: string,
    }>>([
        {
            id: "unique_report_id",
            date: "2025-03-11",
            productName: "Bibingka Special",
            stockIn: 50,
            stockOut: 10,
            currentStock: 40,
            remarks: "Restocked"
        }
    ]);

    useEffect(() => {
        // Fetch data logic can be added here
    }, []);

    return (
        <ProtectedRoute>
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Inventory Reports
                </h1>

                <div className="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border ml-8">
                    <table className="w-full text-left table-auto min-w-max">
                        <thead>
                            <tr>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Date</th>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Product Name</th>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Stock In</th>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Stock Out</th>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Current Stock</th>
                                <th className="p-4 border-b border-slate-300 bg-slate-50">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length > 0 ? (
                                reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-50 border-b border-slate-200">
                                        <td className="p-4 py-5">{report.date}</td>
                                        <td className="p-4 py-5">{report.productName}</td>
                                        <td className="p-4 py-5">{report.stockIn}</td>
                                        <td className="p-4 py-5">{report.stockOut}</td>
                                        <td className="p-4 py-5">{report.currentStock}</td>
                                        <td className="p-4 py-5">{report.remarks || "-"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-4">No reports available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ProtectedRoute>
    );
}