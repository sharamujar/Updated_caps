"use client"; // Required for using hooks

import { useRouter } from "next/navigation";
import { auth } from "../firebase-config";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function Users() {
    return (
        <ProtectedRoute>
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Users
            </h1>
        </div>
        </ProtectedRoute>
    );
}