"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
    const pathname = usePathname(); // get URL current path
    const hideSidebarRoutes = ["/"]; // hide sidebar on these routes

    if (hideSidebarRoutes.includes(pathname))
        return null;

    return (
        <aside className="w-64 h-screen bg-bg-yellow text-black p-4">
            <h2 className="text-xl font-bold">BBNKA</h2>
            <nav className="mt-4">
                <ul>
                    <li><Link href="/dashboard">Dashboard</Link></li>
                    <li><Link href="/products">Products</Link></li>
                    <li><Link href="/orders">Orders</Link></li>
                    <li><Link href="/users">Users</Link></li>
                    <li><Link href="/settings">Settings</Link></li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;