"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "../firebase-config";
import { useRouter } from "next/navigation";

const Sidebar = () => {

    const router = useRouter(); // Next.js navigation

    // logout function
    const handleLogout = async () => {
        try {
        await signOut(auth); // Sign out user
        router.push("/"); // Redirect to home page
        } catch (error: any) {
        console.error("Logout error:", error.code, error.message);
        }
    };

    const pathname = usePathname() || ""; // get URL current path
    const hideSidebarRoutes = ["/"]; // hide sidebar on these routes

    if (hideSidebarRoutes.includes(pathname))
        return null;

    return (
        <aside className="w-full h-screen flex flex-col bg-white text-black p-4 max-w-[18rem] bg-clip-border shadow-xl shadow-blue-gray-900/5">
            <div className="p-4 mb-2">
                <h5 className="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                BBNKA
                </h5>
            </div>
            <nav className="flex flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700 flex-grow">
                <Link href="/dashboard">
                    <div role="button"
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                        <div className="grid mr-4 place-items-center">
                        <svg className="w-5 h-5 group-hover:stroke-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13 12C13 11.4477 13.4477 11 14 11H19C19.5523 11 20 11.4477 20 12V19C20 19.5523 19.5523 20 19 20H14C13.4477 20 13 19.5523 13 19V12Z" stroke="#000000" strokeWidth="2" strokeLinecap="round"></path> <path d="M4 5C4 4.44772 4.44772 4 5 4H9C9.55228 4 10 4.44772 10 5V12C10 12.5523 9.55228 13 9 13H5C4.44772 13 4 12.5523 4 12V5Z" stroke="#000000" strokeWidth="2" strokeLinecap="round"></path> <path d="M4 17C4 16.4477 4.44772 16 5 16H9C9.55228 16 10 16.4477 10 17V19C10 19.5523 9.55228 20 9 20H5C4.44772 20 4 19.5523 4 19V17Z" stroke="#000000" strokeWidth="2" strokeLinecap="round"></path> <path d="M13 5C13 4.44772 13.4477 4 14 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H14C13.4477 8 13 7.55228 13 7V5Z" stroke="#000000" strokeWidth="2" strokeLinecap="round"></path> </g>
                        </svg>
                        </div>
                        Dashboard
                    </div>
                </Link>
                <Link href="/products">
                    <div role="button"
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                        <img src="/icons/product-icon.svg" alt="Products" className="w-5 h-5"/>
                    </div>
                    Products
                    </div>
                </Link>
                <Link href="/orders">
                    <div role="button"
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                        <img src="/icons/order-icon.svg" alt="Orders" className="w-5 h-5"/>
                    </div>
                    Orders
                    </div>
                </Link>
                <Link href="/users">
                    <div role="button"
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                        <img src="/icons/user-icon.svg" alt="Users" className="w-5 h-5"/>
                    </div>
                    Users
                    </div>
                </Link>
                <Link href="/settings">
                    <div role="button"
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-bg-light-brown hover:bg-opacity-80 hover:text-white focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                        <img src="/icons/settings-icon.svg" alt="Settings" className="w-5 h-5"/>
                    </div>
                    Settings
                </div>
                </Link>
                <div className="mt-auto">
                    <div role="button"
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start text-secondary-red hover:bg-white hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center"
                    onClick={handleLogout}>
                        <img src="/icons/logout-icon.svg" alt="Logout" className="w-5 h-5"/>
                    </div>
                    Sign Out
                    </div>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;