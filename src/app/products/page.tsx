"use client"; // Required for using hooks

import { useRouter } from "next/navigation";
import { storage, db } from "../firebase-config";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useEffect, useRef, useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";

export default function Products() {
    const [image, setImage] = useState<File | null>(null);
    // const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);

    const [isOpen, setIsOpen] = useState(false); // state for modal visibility

    // state for product details (array)
    const [products, setProducts] = useState<Array<{
        id: string,
        imageURL: string,
        name: string,
        price: string,
        stock: string,
        unit: string,
        description: string,
    }>>([]);

    // state for product details (single)
    const [product, setProduct] = useState({
        imageURL: "",
        name: "",
        price: "",
        stock: "",
        unit: "",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    //handle image file selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
            setFile(e.target.files[0]);
        }
    };

    // function to upload image to cloudinary
    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "bbnka-product-images"); // asset folder name
        formData.append("cloud_name", "dbmofuvwn"); // Cloudinary cloud name

        try {
            const res = await fetch("https://api.cloudinary.com/v1_1/dbmofuvwn/image/upload", {
                method: "POST",
                body: formData,
        });

        const data = await res.json();
        return data.secure_url; // get the uploaded image URL

    } catch (error) {
        console.error("Error uploading image: ", error);
        return null;
    }
};

    useEffect(() => {
        fetchProducts();
    }, []);

    // fetch products from firestore
    const fetchProducts = async () => {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map(doc => {
            const data = doc.data();

            return {
                id: doc.id,
                imageURL: data.imageURL || "",  // Ensure default values
                name: data.name || "",
                price: data.price || "",
                stock: data.stock || "",
                unit: data.unit || "",
                description: data.description || "",
            };
        });
    
        console.log("Fetched products:", productList);
        setProducts(productList);
    };

    // function to handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting form...");

        try {
            let imageURL = "";

            // upload image to cloudinary
            if (image) {
                const uploadedImageURL = await uploadImage(image);
                if (!uploadedImageURL) {
                    alert("Failed to upload image");
                    return;
                }
                imageURL = uploadedImageURL;
                
            }

            // save product details in firestore
            await addDoc(collection(db, "products"), {
            imageURL,
            name: product.name,
            price: Number(product.price),
            stock: Number(product.stock),
            unit: (product.unit),
            description: (product.description),
            createdAt: new Date(),
            });

        alert("Product added successfully!");

        // clear form state
        setProducts([]);
        setImage(null); 
        setFile(null);

        // Fetch products again to update UI
        fetchProducts();

        } catch (error) {
            console.error("Error adding product: ", error);
            alert("Failed to add product. Please try again later.");
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Welcome to Products
                </h1>

                <div className="w-full flex flex-col p-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">List of Products</h3>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="relative w-full max-w-sm min-w-[200px]">
                            <input
                                className="bg-white w-full pr-11 h-10 pl-3 py-2 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
                                placeholder="Search for products..."
                            />
                            <button
                                className="absolute h-8 w-8 right-1 top-1 my-auto px-2 flex items-center bg-white rounded "
                                type="button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-8 h-8 text-slate-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                    </svg>
                            </button>
                        </div>

                        {/* Button to open modal */}
                        <button
                            onClick={() => setIsOpen(true)}
                            className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg shadow-md transition"
                        >
                            + Add Product
                        </button>

                        {/* Modal */}
                {isOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                            
                {/* form to add product */}
                <form onSubmit={handleSubmit} 
                    className="flex flex-col gap-4">
                    <div className="w-full max-w-sm min-w-[200px]">
                        <input className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-blue-500 hover:border-blue-300 shadow-sm focus:shadow"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}>
                        </input>
                    </div>
                    <div className="w-full max-w-sm min-w-[200px]">
                        <input className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-blue-500 hover:border-blue-300 shadow-sm focus:shadow" 
                            type="text"
                            name="name"
                            value={product.name}
                            onChange={handleChange}
                            placeholder="Product Name" 
                            required/>
                    </div>
                    <div className="w-full max-w-sm min-w-[200px]">
                        <input className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-purple-500 hover:border-purple-300 shadow-sm focus:shadow" 
                            type="number"
                            name="price"
                            value={product.price}
                            onChange={handleChange}
                            placeholder="Price" 
                            required/>
                    </div>
                    <div className="w-full max-w-sm min-w-[200px]">
                        <input className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-indigo-500 hover:border-indigo-300 shadow-sm focus:shadow" 
                            type="number"
                            name="stock"
                            value={product.stock}
                            onChange={handleChange}
                            placeholder="Quantity / Stock" 
                            required/>
                    </div>
                    <div className="w-full max-w-sm min-w-[200px]">
                        <input className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-blue-500 hover:border-blue-300 shadow-sm focus:shadow" 
                            type="text"
                            name="unit"
                            value={product.unit}
                            onChange={handleChange}
                            placeholder="Unit Type" 
                            required/>
                    </div>
                    <div className="w-full max-w-sm min-w-[200px]">
                        <input className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-blue-500 hover:border-blue-300 shadow-sm focus:shadow" 
                            type="text"
                            name="description"
                            value={product.description}
                            onChange={handleChange}
                            placeholder="Description" 
                            required/>
                    </div>
                    <button className="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2" 
                        type="submit">Submit
                    </button>
                </form>
                            
                            {/* Close button */}
                            <button
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg"
                            >
                            Close
                            </button>
                        </div>
                    </div>
                )}
                    </div>
                </div>

                <div className="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border">
                    <table className="w-full text-left table-auto min-w-max">
                        <thead>
                            <tr>
                            <th className="p-4 border-b border-slate-300 bg-slate-50">
                                <p className="block text-sm font-normal leading-none text-slate-500">
                                Image
                                </p>
                            </th>
                            <th className="p-4 border-b border-slate-300 bg-slate-50">
                                <p className="block text-sm font-normal leading-none text-slate-500">
                                Name
                                </p>
                            </th>
                            <th className="p-4 border-b border-slate-300 bg-slate-50">
                                <p className="block text-sm font-normal leading-none text-slate-500">
                                Price
                                </p>
                            </th>
                            <th className="p-4 border-b border-slate-300 bg-slate-50">
                                <p className="block text-sm font-normal leading-none text-slate-500">
                                Stock
                                </p>
                            </th>
                            <th className="p-4 border-b border-slate-300 bg-slate-50">
                                <p className="block text-sm font-normal leading-none text-slate-500">
                                Unit
                                </p>
                            </th>
                            <th className="p-4 border-b border-slate-300 bg-slate-50">
                            </th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 border-b border-slate-200">
                                        <td className="p-4 py-5">
                                            <img src={product.imageURL} alt={product.name} className="w-16 h-16 object-cover rounded" />
                                        </td>
                                        <td className="p-4 py-5 text-sm text-slate-800">{product.name}</td>
                                        <td className="p-4 py-5 text-sm text-slate-800">₱{product.price}</td>
                                        <td className="p-4 py-5 text-sm text-slate-800">{product.stock}</td>
                                        <td className="p-4 py-5 text-sm text-slate-800">{product.unit}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-4">No products available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ProtectedRoute>
    );
}