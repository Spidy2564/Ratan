import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Package, Clock, DollarSign, User, X, CheckCircle, Clock as ClockIcon, Truck, XCircle, RefreshCw, Package as PackageIcon } from 'lucide-react';
import axios from 'axios';
import { X as CloseIcon } from 'lucide-react';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;

// Helper for status badge color
const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
        case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
        case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
        case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};

// Status steps for the tracker
const STATUS_STEPS = [
    { key: 'pending', label: 'Pending', icon: ClockIcon },
    { key: 'processing', label: 'Processing', icon: RefreshCw },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: PackageIcon },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
    { key: 'cancelled', label: 'Cancelled', icon: XCircle },
    { key: 'refunded', label: 'Refunded', icon: XCircle },
];

// Helper to get the step index for a status
const getStatusStepIndex = (status: string) => {
    const idx = STATUS_STEPS.findIndex(s => s.key === status);
    // If not found, treat as last
    return idx === -1 ? STATUS_STEPS.length - 1 : idx;
};

const UserOrders: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalImage, setModalImage] = useState<{ src: string; name: string } | null>(null);

    useEffect(() => {
        const fetchOrdersAndProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
                if (!token) throw new Error('You must be logged in to view your orders.');
                // Fetch orders
                const response = await fetch(`${API_BASE}/api/purchases`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                const data = await response.json();
                if (!data.success || !Array.isArray(data.data)) throw new Error(data.message || 'Failed to fetch orders');
                setOrders(data.data);
                // Fetch products
                const productsRes = await axios.get(`${API_BASE}/api/products`);
                setProducts(productsRes.data.data || []);
            } catch (err: any) {
                setError(err.message || 'Failed to load orders');
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOrdersAndProducts();
    }, []);

    // Helper to get image for an order item
    const getItemImage = (item: any) => {
        if (item.imageUrl) return item.imageUrl;
        const match = products.find((p: any) => p.name === item.productName);
        return match ? match.imageUrl : undefined;
    };

    return (
        <div className="max-w-6xl mx-auto pt-20 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
                My Orders
            </h1>
            {loading && (
                <div className="text-center py-12 text-lg text-gray-600">Loading your orders...</div>
            )}
            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center mb-4">{error}</div>
            )}
            {!loading && !error && orders.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600">You haven't placed any orders yet.</p>
                </div>
            )}
            {!loading && !error && orders.length > 0 && (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                <div className="flex items-center text-gray-700">
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Total:</span> ₹{order.totalAmount}
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Date:</span> {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown'}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg mb-2">
                                <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                            {getItemImage(item) && (
                                                <img
                                                    src={getItemImage(item)}
                                                    alt={item.productName}
                                                    className="w-10 h-10 object-cover rounded shadow border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                                                    onClick={() => setModalImage({ src: getItemImage(item), name: item.productName })}
                                                />
                                            )}
                                            <span className="font-semibold">{item.productName}</span>
                                            <span>x{item.quantity}</span>
                                            {item.size && <span className="text-xs text-blue-600">({item.size})</span>}
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-gray-400">No items</span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <User className="w-4 h-4 mr-1" />
                                {order.shippingAddress?.name || user?.name || user?.email}
                                <span>|</span>
                                {order.shippingAddress?.email || user?.email}
                            </div>

                            {/* Flipkart-style status tracker at the bottom with continuous progress line */}
                            <div className="relative mt-6 mb-2">
                                {/* Progress line background */}
                                <div className="absolute left-0 right-0 top-1/2 h-1 w-full z-0 flex">
                                    {/* Progressed part */}
                                    <div
                                        className="h-1 rounded bg-blue-500 transition-all duration-300"
                                        style={{
                                            width: `${Math.max(0, Math.min(1, (getStatusStepIndex(order.status) / 4))) * 100}%`,
                                            flex: 'none',
                                        }}
                                    />
                                    {/* Remaining part */}
                                    <div
                                        className="h-1 rounded bg-gray-200 flex-1"
                                        style={{
                                            width: `${100 - Math.max(0, Math.min(1, (getStatusStepIndex(order.status) / 4))) * 100}%`,
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-between relative z-10">
                                    {STATUS_STEPS.slice(0, 5).map((step, idx) => {
                                        const Icon = step.icon;
                                        const currentIdx = getStatusStepIndex(order.status);
                                        const isActive = idx <= currentIdx && currentIdx < 5;
                                        const isCancelled = order.status === 'cancelled' || order.status === 'refunded';
                                        return (
                                            <div key={step.key} className="flex-1 flex flex-col items-center relative">
                                                <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 transition-all duration-200 ${
                                                    isCancelled && (step.key === 'cancelled' || step.key === 'refunded')
                                                        ? 'bg-red-100 border-red-400 text-red-600'
                                                        : isActive
                                                        ? 'bg-blue-100 border-blue-500 text-blue-600'
                                                        : 'bg-gray-100 border-gray-300 text-gray-400'
                                                }`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className={`mt-2 text-xs font-medium ${
                                                    isCancelled && (step.key === 'cancelled' || step.key === 'refunded')
                                                        ? 'text-red-600'
                                                        : isActive
                                                        ? 'text-blue-700'
                                                        : 'text-gray-400'
                                                }`}>{step.label}</span>
                                            </div>
                                        );
                                    })}
                                    {/* If cancelled/refunded, show as last step */}
                                    {(order.status === 'cancelled' || order.status === 'refunded') && (
                                        <div className="flex-1 flex flex-col items-center">
                                            <div className="rounded-full w-8 h-8 flex items-center justify-center border-2 bg-red-100 border-red-400 text-red-600">
                                                <XCircle className="w-5 h-5" />
                                            </div>
                                            <span className="mt-2 text-xs font-medium text-red-600 capitalize">{order.status}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for product image */}
            {modalImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
                    onClick={() => setModalImage(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                            onClick={() => setModalImage(null)}
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <img
                            src={modalImage.src}
                            alt={modalImage.name}
                            className="w-full h-64 object-contain rounded mb-4"
                        />
                        <div className="text-lg font-bold text-center text-gray-900">{modalImage.name}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserOrders; 