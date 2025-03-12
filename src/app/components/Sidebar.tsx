"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "../firebase-config";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Sidebar = () => {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false); // Track inventory dropdown state
  const router = useRouter(); // Next.js navigation

  const handleLogout = async () => {
    try {
      console.log("Attempting logout...");
      await signOut(auth); // Sign out user
      console.log("Logout successful! Redirecting...");
      router.push("/"); // Redirect to home page
    } catch (error: any) {
      console.error("Logout error:", error.code, error.message);
    }
  };

  const pathname = usePathname() || ""; // get URL current path
  const hideSidebarRoutes = ["/"]; // hide sidebar on these routes

  if (hideSidebarRoutes.includes(pathname)) return null;

  return (
    <aside className="w-full h-screen flex flex-col bg-white text-black p-4 max-w-[18rem] bg-clip-border shadow-xl shadow-blue-gray-900/5">
      <div className="p-4 mb-2">
        <h5 className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
          BBNKA
        </h5>
      </div>
      <nav className="flex flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700 flex-grow">
        <Link href="/dashboard">
          <div
            role="button"
            className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
          >
            <div className="grid mr-4 place-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard">
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
            </div>
            Dashboard
          </div>
        </Link>

        {/* Inventory Module with Arrow Dropdown */}
        <div className="relative">
          <div
            role="button"
            onClick={() => setIsInventoryOpen(!isInventoryOpen)} // Toggle dropdown
            className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
          >
            <div className="grid mr-4 place-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package">
                <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                <path d="M12 22V12" />
                <polyline points="3.29 7 12 12 20.71 7" />
                <path d="m7.5 4.27 9 5.15" />
              </svg>
            </div>
            Inventory
            <div className={`ml-auto transform transition-transform duration-300 ${isInventoryOpen ? 'rotate-180' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Dropdown items */}
          {isInventoryOpen && (
            <div className="ml-6 mt-2 space-y-1">
              <Link href="/inventory/products">
                <div
                  role="button"
                  className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                >
                  <div className="grid mr-4 place-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box">
                      <path d="M9 6.6V5a3 3 0 1 1 6 0v1.6l1.6.8a1 1 0 0 1 .4 1.6l-7 4a1 1 0 0 1-1 0l-7-4a1 1 0 0 1 .4-1.6l1.6-.8V5a3 3 0 1 1 6 0v1.6" />
                    </svg>
                  </div>
                  Products
                </div>
              </Link>
              <Link href="/inventory/categories">
                <div
                  role="button"
                  className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                >
                  <div className="grid mr-4 place-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tag">
                      <path d="M14 2h8v8l-6 6H8l-6-6V2h8z" />
                    </svg>
                  </div>
                  Categories
                </div>
              </Link>
              <Link href="/inventory/stock-management">
                <div
                  role="button"
                  className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                >
                  <div className="grid mr-4 place-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard">
                      <path d="M6 2h12l4 4v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4z" />
                    </svg>
                  </div>
                  Stock Management
                </div>
              </Link>
              <Link href="/inventory/suppliers">
                <div
                  role="button"
                  className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                >
                  <div className="grid mr-4 place-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    </svg>
                  </div>
                  Suppliers
                </div>
              </Link>
              <Link href="/inventory/damaged-goods">
                <div
                  role="button"
                  className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                >
                  <div className="grid mr-4 place-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right-circle">
                      <path d="M12 6l6 6-6 6" />
                    </svg>
                  </div>
                  Damaged Goods
                </div>
              </Link>
              <Link href="/inventory/inventory-reports">
                <div
                  role="button"
                  className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                >
                  <div className="grid mr-4 place-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text">
                      <path d="M6 2h12l4 4v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4z" />
                    </svg>
                  </div>
                  Inventory Reports
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Other Menu Items */}
        <Link href="/orders">
          <div role="button" className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
            <div className="grid mr-4 place-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            Orders
          </div>
        </Link>
        <Link href="/users">
                    <div role="button"
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    Users
                    </div>
                </Link>
                <Link href="/settings">
                    <div role="button"
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                    Settings
                </div>
                </Link>


        {/* Logout Button */}
        <div className="mt-auto">
          <div
            role="button"
            onClick={handleLogout}
            className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start text-secondary-red hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
          >
            <div className="grid mr-4 place-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </div>
            Sign Out
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
