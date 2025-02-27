"use client"; // Required for using hooks

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function Dashboard() {
  // const router = useRouter(); // Next.js navigation

  // const handleLogout = async () => {
  //   try {
  //     await signOut(auth); // Sign out user
  //     router.push("/"); // Redirect to home page
  //   } catch (error: any) {
  //     console.error("Logout error:", error.code, error.message);
  //   }
  // };

  return (
    <ProtectedRoute>
        <div className="flex flex-col justify-center items-center h-screen bg-bg-white">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Dashboard
            </h1>
            {/* <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
            >
                Logout
            </button> */}
        </div>
    </ProtectedRoute>
  );
}
