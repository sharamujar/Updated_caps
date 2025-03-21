"use client"; // Required for using hooks

import { useRouter } from "next/navigation";
import { storage, db } from "../firebase-config";
import ProtectedRoute from "@/app/components/protectedroute";
import { useEffect, useState } from "react";
import { addDoc, collection, doc, getDocs, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
import { 
    UserPlus, 
    Users as UsersIcon, 
    UserCog, 
    History, 
    Star, 
    MessageSquare, 
    Activity,
    Search,
    Filter,
    Edit,
    Trash2,
    Shield,
    UserCheck
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'staff' | 'customer';
    status: 'active' | 'inactive';
    permissions?: string[];
    lastLogin?: Date;
    createdAt: Date;
    phoneNumber?: string;
    address?: string;
    loyaltyPoints?: number;
    totalOrders?: number;
    totalSpent?: number;
}

interface ActivityLog {
    id: string;
    userId: string;
    action: string;
    timestamp: Date;
    details: string;
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [selectedTab, setSelectedTab] = useState<'staff' | 'customers'>('staff');
    const [showActivityLog, setShowActivityLog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'add' | 'edit' | 'permissions' | 'profile'>('add');

    const [userForm, setUserForm] = useState({
        name: "",
        email: "",
        role: "staff",
        status: "active",
        password: "",
        phoneNumber: "",
        address: "",
        permissions: [] as string[],
    });

    // Available permissions for staff roles
    const availablePermissions = {
        inventory: [
            'view_inventory',
            'manage_products',
            'manage_categories',
            'manage_stock',
        ],
        orders: [
            'view_orders',
            'process_orders',
            'manage_returns',
        ],
        customers: [
            'view_customers',
            'manage_feedback',
            'manage_loyalty',
        ],
        reports: [
            'view_reports',
            'export_reports',
        ],
    };

    useEffect(() => {
        fetchUsers();
        fetchActivityLogs();
    }, [selectedTab]);

    const fetchUsers = async () => {
        try {
            const userQuery = query(
                collection(db, "users"),
                where("role", selectedTab === 'staff' ? 'in' : '==', 
                    selectedTab === 'staff' ? ['admin', 'staff'] : 'customer'),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(userQuery);
            const userList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                lastLogin: doc.data().lastLogin?.toDate(),
            })) as User[];

            console.log("Fetched users:", userList);
            setUsers(userList);
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Failed to load users");
        }
    };

    const fetchActivityLogs = async () => {
        try {
            const logsQuery = query(
                collection(db, "activityLogs"),
                orderBy("timestamp", "desc")
            );
            const querySnapshot = await getDocs(logsQuery);
            const logsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate(),
            })) as ActivityLog[];
            setActivityLogs(logsList);
        } catch (error) {
            console.error("Error fetching activity logs:", error);
        }
    };

    const logActivity = async (userId: string, action: string, details: string) => {
        try {
            await addDoc(collection(db, "activityLogs"), {
                userId,
                action,
                details,
                timestamp: new Date(),
            });
            fetchActivityLogs();
        } catch (error) {
            console.error("Error logging activity:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Check if current user is admin
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('You must be logged in to perform this action');
            }

            if (modalType === 'edit') {
                await updateDoc(doc(db, "users", selectedUser!.id), {
                    name: userForm.name,
                    email: userForm.email,
                    role: userForm.role,
                    status: userForm.status,
                    phoneNumber: userForm.phoneNumber,
                    address: userForm.address,
                    permissions: userForm.permissions,
                    updatedAt: new Date(),
                });
                await logActivity(selectedUser!.id, "user_updated", `Updated user: ${userForm.name}`);
            } else {
                // Create user in Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, userForm.email, userForm.password);
                
                // Create user document in Firestore
                const userData: any = {
                    uid: userCredential.user.uid,
                    name: userForm.name,
                    email: userForm.email,
                    role: userForm.role,
                    status: userForm.status,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                // Only add loyaltyPoints, totalOrders, and totalSpent if the user is a customer
                if (userForm.role === 'customer') {
                    userData.loyaltyPoints = 0;
                    userData.totalOrders = 0;
                    userData.totalSpent = 0;
                }

                await addDoc(collection(db, "users"), userData);
                await logActivity(userCredential.user.uid, "user_created", `Created new ${userForm.role}: ${userForm.name}`);
            }
            setIsModalOpen(false);
            resetForm();
            fetchUsers();
        } catch (error: unknown) {
            console.error("Error handling user:", error);
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("Failed to process user");
            }
        }
    };

    const resetForm = () => {
        setUserForm({
            name: "",
            email: "",
            role: "staff",
            status: "active",
            password: "",
            phoneNumber: "",
            address: "",
            permissions: [],
        });
        setSelectedUser(null);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    console.log("Selected Tab:", selectedTab);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {selectedTab === 'staff' ? 'Staff Management' : 'Customer Management'}
                    </h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setSelectedTab('staff')}
                            className={`px-4 py-2 rounded-lg ${
                                selectedTab === 'staff' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-white text-gray-600'
                            }`}
                        >
                            <UserCog className="w-5 h-5 inline-block mr-2" />
                            Staff
                        </button>
                        <button
                            onClick={() => setSelectedTab('customers')}
                            className={`px-4 py-2 rounded-lg ${
                                selectedTab === 'customers' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-white text-gray-600'
                            }`}
                        >
                            <UsersIcon className="w-5 h-5 inline-block mr-2" />
                            Customers
                        </button>
                    </div>
                </div>

                {/* Filters and Controls */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 p-2 border rounded w-full"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="p-2 border rounded"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            {selectedTab === 'customers' && (
                                <option value="customer">Customer</option>
                            )}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="p-2 border rounded"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <button
                            onClick={() => {
                                setModalType('add');
                                setIsModalOpen(true);
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                            <UserPlus className="w-5 h-5 inline-block mr-2" />
                            Add {selectedTab === 'staff' ? 'Staff' : 'Customer'}
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User Info
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role & Status
                                </th>
                                {selectedTab === 'customers' ? (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loyalty & Orders
                                    </th>
                                ) : (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Activity
                                    </th>
                                )}
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-4">No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                    {user.phoneNumber && (
                                                        <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {selectedTab === 'customers' ? (
                                                <div>
                                                    <div className="text-sm text-gray-900">
                                                        Points: {user.loyaltyPoints || 0}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Orders: {user.totalOrders || 0}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500">
                                                    {user.lastLogin?.toLocaleDateString() || 'Never'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setModalType('profile');
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                View Profile
                                            </button>
                                            {selectedTab === 'staff' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setModalType('permissions');
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="text-purple-600 hover:text-purple-900 mr-3"
                                                >
                                                    Permissions
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setModalType('edit');
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Activity Log */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Activity Log</h2>
                        <button
                            onClick={() => setShowActivityLog(!showActivityLog)}
                            className="text-blue-600 hover:text-blue-900"
                        >
                            {showActivityLog ? 'Hide Log' : 'Show Log'}
                        </button>
                    </div>
                    {showActivityLog && (
                        <div className="space-y-4">
                            {activityLogs.map((log) => (
                                <div key={log.id} className="flex items-center justify-between border-b pb-2">
                                    <div>
                                        <span className="font-medium">{log.action}</span>
                                        <p className="text-sm text-gray-500">{log.details}</p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {log.timestamp.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modals */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">
                                {modalType === 'add' ? 'Add New User' : 
                                 modalType === 'edit' ? 'Edit User' :
                                 modalType === 'permissions' ? 'Manage Permissions' : 'User Profile'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                {/* Form fields */}
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={userForm.name}
                                        onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                                        className="w-full p-2 border rounded"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={userForm.email}
                                        onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                                        className="w-full p-2 border rounded"
                                    />
                                    {modalType === 'add' && (
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={userForm.password}
                                            onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                                            className="w-full p-2 border rounded"
                                        />
                                    )}
                                </div>
                                <div className="mt-6 flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        {modalType === 'add' ? 'Create' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
