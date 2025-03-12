"use client"; // Required for using hooks

import { useRouter } from "next/navigation";
import { storage, db } from "../firebase-config";
import ProtectedRoute from "@/app/components/protectedroute";
import { useEffect, useRef, useState } from "react";
import { addDoc, collection, doc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";

export default function Users() {
    const [users, setUsers] = useState<Array<{
        id: string,
        name: string,
        email: string,
        role: string,
        status: string,
    }>>([]);

    const [user, setUser] = useState({
        name: "",
        email: "",
        role: "",
        status: "Inactive",
        password: "",
    });

    const [isOpen, setIsOpen] = useState(false);
    const [editUser, setEditUser] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = querySnapshot.docs.map(doc => {
            const data = doc.data();

            return {
                id: doc.id,
                name: data.name || "",
                email: data.email || "",
                role: data.role || "",
                status: data.status || "Inactive",
            };
        });

        setUsers(userList);
    };

    const handleStatusToggle = async (userID: string, currentStatus: string) => {
        const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
        try {
            await updateDoc(doc(db, "users", userID), { status: newStatus });
            fetchUsers();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editUser) {
                // Update existing user
                await updateDoc(doc(db, "users", editUser), {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                });
                alert("User updated successfully!");
            } else {
                // Create new user
                console.log("Creating user with password:", user.password);
                const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
                console.log("User created:", userCredential);
                const uid = userCredential.user.uid; // Get the user ID

                // Add user details to Firestore
                await addDoc(collection(db, "users"), {
                    id: uid,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status || "Inactive",
                    createdAt: new Date(),
                });
                alert("User added successfully!");
            }
            setUser({ name: "", email: "", role: "", status: "Inactive", password: "" }); // Reset user state
            fetchUsers();
            setIsOpen(false);
        } catch (error) {
            console.error("Error adding or updating user: ", error);
            alert("Failed to add or update user.");
        }
    };

    const handleEdit = (userData: any) => {
        setEditUser(userData.id);
        setUser({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            status: userData.status,
        });
        setIsOpen(true);
    };

    const handleDelete = async (userID: string) => {
        if (!userID) return;

        try {
            await deleteDoc(doc(db, "users", userID));
            alert("User deleted successfully!");
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    User Management
                </h1>

                <div className="w-full flex flex-col p-4">
                    <div className="flex items-center justify-between mt-2">
                        <button
                            onClick={() => {
                                setEditUser(null);
                                setUser({ name: "", email: "", role: "", status: "Inactive", password: "" });
                                setIsOpen(true);
                            }}
                            className="px-6 py-3 rounded text-center text-sm font-semibold text-white bg-bg-light-brown shadow-md">
                            + Add User
                        </button>
                    </div>

                    {/* Modal for adding/editing user */}
                    {isOpen && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                                <h2 className="text-2xl mb-4">{editUser ? "Edit User" : "Add User"}</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={user.name}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={user.email}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                            Role
                                        </label>
                                        <input
                                            type="text"
                                            id="role"
                                            name="role"
                                            value={user.role}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={user.status}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={user.password}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded">
                                            {editUser ? "Update" : "Add"} User
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            className="px-6 py-2 bg-red-500 text-white rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="relative w-full bg-white shadow-md rounded-lg overflow-hidden mt-6">
                        <table className="w-full text-left table-auto min-w-max">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b">
                                        <td className="p-4">{user.name}</td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4">{user.role}</td>
                                        <td className="p-4">
                                            <button
                                                className={`px-3 py-1 rounded ${user.status === "Active" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                                                onClick={() => handleStatusToggle(user.id, user.status)}
                                            >
                                                {user.status}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => handleEdit(user)}>Edit</button>
                                            <button onClick={() => handleDelete(user.id)} className="ml-2 text-red-500">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
