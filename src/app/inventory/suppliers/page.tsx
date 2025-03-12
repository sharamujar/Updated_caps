"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import ProtectedRoute from "@/app/components/protectedroute";

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState<Array<{
        id: string;
        name: string;
        contact: string;
        email: string;
        address: string;
        notes: string;
    }>>([]);

    const [supplier, setSupplier] = useState({
        name: "",
        contact: "",
        email: "",
        address: "",
        notes: ""
    });

    const [editSupplier, setEditSupplier] = useState<string | null>(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        const querySnapshot = await getDocs(collection(db, "suppliers"));
        const supplierList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setSuppliers(supplierList);
    };

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        setSupplier({ ...supplier, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            if (editSupplier) {
                await updateDoc(doc(db, "suppliers", editSupplier), {
                    ...supplier,
                    updatedAt: new Date()
                });
                alert("Supplier updated successfully!");
            } else {
                await addDoc(collection(db, "suppliers"), {
                    ...supplier,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                alert("Supplier added successfully!");
            }
            setSupplier({ name: "", contact: "", email: "", address: "", notes: "" });
            setEditSupplier(null);
            fetchSuppliers();
        } catch (error) {
            console.error("Error handling supplier: ", error);
            alert("Failed to process supplier. Please try again later.");
        }
    };

    const handleEdit = (sup: { id: any; name: any; contact: any; email: any; address: any; notes: any; }) => {
        setEditSupplier(sup.id);
        setSupplier({
            name: sup.name,
            contact: sup.contact,
            email: sup.email,
            address: sup.address,
            notes: sup.notes
        });
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this supplier?")) {
            try {
                await deleteDoc(doc(db, "suppliers", id));
                alert("Supplier deleted successfully!");
                fetchSuppliers();
            } catch (error) {
                console.error("Error deleting supplier: ", error);
                alert("Failed to delete supplier.");
            }
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex flex-col items-center h-screen bg-gray-100 overflow-y-auto">
                <h1 className="text-4xl font-extrabold text-black mb-4 shadow-md py-2 px-4 rounded-lg sticky top-0 bg-white w-full text-center z-10">Suppliers Management</h1>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
                    <input
                        type="text"
                        name="name"
                        value={supplier.name}
                        onChange={handleChange}
                        placeholder="Supplier Name"
                        required
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="text"
                        name="contact"
                        value={supplier.contact}
                        onChange={handleChange}
                        placeholder="Contact Number"
                        required
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="email"
                        name="email"
                        value={supplier.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="text"
                        name="address"
                        value={supplier.address}
                        onChange={handleChange}
                        placeholder="Address"
                        className="border p-2 rounded w-full"
                    />
                    <textarea
                        name="notes"
                        value={supplier.notes}
                        onChange={handleChange}
                        placeholder="Notes"
                        className="border p-2 rounded w-full col-span-1 md:col-span-2"
                    ></textarea>
                    <button
                        type="submit"
                        className="bg-bg-light-brown text-white p-2 rounded hover:bg-bg-dark-brown col-span-1 md:col-span-2">
                        {editSupplier ? "Update Supplier" : "Add Supplier"}
                    </button>
                </form>

                <div className="mt-8 w-full max-w-4xl">
                    <h2 className="text-2xl font-bold text-black mb-4 shadow-md py-2 px-4 rounded-lg sticky top-0 bg-white w-full z-10">Supplier List</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {suppliers.map((sup) => (
                            <div key={sup.id} className="border p-4 rounded bg-white shadow-md">
                                <h3 className="font-bold text-lg">{sup.name}</h3>
                                <p>Contact: {sup.contact}</p>
                                <p>Email: {sup.email}</p>
                                <p>Address: {sup.address}</p>
                                <p>Notes: {sup.notes}</p>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                        onClick={() => handleEdit(sup)}>
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                        onClick={() => handleDelete(sup.id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
