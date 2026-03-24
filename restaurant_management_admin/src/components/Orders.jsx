import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ClipboardList, Eye, Trash2, X, ChevronRight, Plus, Edit2, ShoppingCart, Search, Minus, Utensils } from 'lucide-react';

const Orders = () => {
    const [user] = useState(() => JSON.parse(localStorage.getItem('userInfo')));
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // For order list filtering
    const [listSearchTerm, setListSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    
    // For new order creation
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newOrder, setNewOrder] = useState({
        customerName: '',
        orderType: 'Pickup',
        tableNumber: '',
        deliveryAddress: ''
    });

    useEffect(() => {
        fetchOrders();
    }, [page, listSearchTerm, typeFilter, statusFilter]);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            // For the order creation modal, we want all items so search works correctly
            const res = await api.get('/menu?limit=100');
            setMenuItems(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch menu:', err);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: page,
                limit: 10,
                searchTerm: listSearchTerm,
                orderType: typeFilter === 'All' ? '' : typeFilter,
                status: statusFilter === 'All' ? '' : statusFilter
            }).toString();
            const response = await api.get(`/orders?${queryParams}`);
            setOrders(response.data.data);
            setTotalPages(response.data.pages);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1); // Reset page when filters change
    }, [listSearchTerm, typeFilter, statusFilter]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/orders/${id}/status`, { status: newStatus });
            fetchOrders();
            if (selectedOrder?._id === id) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const openDetails = (order) => {
        setSelectedOrder(order);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const openEdit = (order) => {
        setSelectedOrder(order);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDeleteOrder = async (id) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                await api.delete(`/orders/${id}`);
                fetchOrders();
            } catch (err) {
                console.error('Failed to delete order:', err);
                alert('Only Admins can delete orders');
            }
        }
    };

    const addToCart = (item) => {
        const exists = cart.find(c => c.menuItem === item._id);
        if (exists) {
            setCart(cart.map(c => c.menuItem === item._id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, { menuItem: item._id, name: item.name, price: item.price, quantity: 1 }]);
        }
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(c => c.menuItem !== itemId));
    };

    const updateQuantity = (itemId, delta) => {
        setCart(cart.map(c => {
            if (c.menuItem === itemId) {
                const newQty = Math.max(1, c.quantity + delta);
                return { ...c, quantity: newQty };
            }
            return c;
        }));
    };

    const filteredMenu = menuItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredOrders = orders || [];

    const calculateTotal = (items) => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return alert('Add at least one item');

        try {
            const orderData = {
                items: cart.map(item => ({
                    menuItem: item.menuItem,
                    quantity: item.quantity,
                    priceAtPurchase: item.price
                })),
                totalAmount: calculateTotal(cart),
                orderType: newOrder.orderType,
                customerName: newOrder.customerName,
                tableNumber: newOrder.orderType === 'Dine In' ? newOrder.tableNumber : '',
                deliveryAddress: newOrder.orderType === 'Delivery' ? newOrder.deliveryAddress : ''
            };

            await api.post('/orders', orderData);
            setCart([]);
            setNewOrder({ customerName: '', orderType: 'Pickup', tableNumber: '', deliveryAddress: '' });
            setIsCreateModalOpen(false);
            fetchOrders();
        } catch (err) {
            console.error('Failed to create order:', err);
        }
    };

    const handleUpdateOrder = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/orders/${selectedOrder._id}`, selectedOrder);
            setIsModalOpen(false);
            fetchOrders();
        } catch (err) {
            console.error('Failed to update order:', err);
            alert('Admin access required to modify order details');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Accepted': return 'bg-green-100 text-green-700';
            case 'Preparing': return 'bg-blue-100 text-blue-700';
            case 'Ready': return 'bg-purple-100 text-purple-700';
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Served': return 'bg-teal-100 text-teal-700';
            case 'Completed': return 'bg-gray-100 text-gray-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-dark-200">Live Orders</h1>
                <div className="flex gap-4">
                    <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary text-sm flex items-center gap-2">
                        <Plus size={18} /> New Order
                    </button>
                    <button onClick={fetchOrders} className="btn-secondary text-sm">Refresh</button>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Search by Order # or Customer..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        value={listSearchTerm}
                        onChange={(e) => setListSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="All">All Types</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Dine In">Dine In</option>
                </select>
                <select 
                    className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Served">Served</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            
            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="p-4 text-sm font-semibold text-gray-600">Order #</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Type</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Customer</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Booked By</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Items</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Total</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="p-12 text-center text-gray-500">
                                    <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
                                    No orders match your filters.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map(order => (
                                <tr key={order._id} className="border-b border-gray-50 hover:bg-brand-50/20 transition-colors">
                                    <td className="p-4 text-sm font-bold text-brand-600">#{order.orderNumber || '00000'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            order.orderType === 'Delivery' ? 'bg-purple-100 text-purple-600' : 
                                            order.orderType === 'Dine In' ? 'bg-blue-100 text-blue-600' :
                                            'bg-orange-100 text-orange-600'
                                        }`}>
                                            {order.orderType} {order.tableNumber ? `#${order.tableNumber}` : ''}
                                        </span>
                                        {order.orderType === 'Delivery' && (
                                            <span className="block text-[9px] font-bold text-brand-500 mt-1 uppercase tracking-tight">⏲️ 30 MINS AVG.</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-medium text-dark-200">{order.customerName || order.user?.name || 'Guest'}</p>
                                        <p className="text-[10px] text-gray-400">{order.user?.email || ''}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-medium text-gray-600">{order.staff?.name || 'Customer App'}</span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{order.items?.length || 0} items</td>
                                    <td className="p-4 text-sm font-bold text-dark-200">₹{order.totalAmount}</td>
                                    <td className="p-4">
                                        <select 
                                            className={`text-xs font-semibold px-2 py-1 rounded-full border-none focus:ring-2 focus:ring-brand-500 ${getStatusColor(order.status)}`}
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Accepted">Accepted</option>
                                            <option value="Preparing">Preparing</option>
                                            <option value="Ready">Ready</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Served">Served</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => openDetails(order)}
                                                className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {user?.role === 'Admin' && (
                                                <>
                                                    <button 
                                                        onClick={() => openEdit(order)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Order"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteOrder(order._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-between items-center p-4 border-t border-gray-50 bg-white rounded-b-xl">
                    <p className="text-xs text-gray-500">
                        Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(prev => prev - 1)}
                            className="px-4 py-2 border border-gray-100 rounded-lg text-xs font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>
                        <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'border border-gray-100 hover:bg-gray-50 text-gray-400'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(prev => prev + 1)}
                            className="px-4 py-2 border border-gray-100 rounded-lg text-xs font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Details & Edit Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-dark-200">
                            <X size={24} />
                        </button>
                        
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-dark-200">{isEditing ? 'Modify Order' : 'Order Details'}</h2>
                                <p className="text-gray-500 font-mono text-xs mt-1">Order #: {selectedOrder.orderNumber}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-4 py-1 rounded-full text-sm font-bold ${getStatusColor(selectedOrder.status)}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleUpdateOrder} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select 
                                            className="input-field"
                                            value={selectedOrder.status}
                                            onChange={(e) => setSelectedOrder({...selectedOrder, status: e.target.value})}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Accepted">Accepted</option>
                                            <option value="Preparing">Preparing</option>
                                            <option value="Ready">Ready</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Served">Served</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                                        <select 
                                            className="input-field"
                                            value={selectedOrder.orderType}
                                            onChange={(e) => setSelectedOrder({...selectedOrder, orderType: e.target.value})}
                                        >
                                            <option value="Pickup">Pickup</option>
                                            <option value="Delivery">Delivery</option>
                                            <option value="Dine In">Dine In</option>
                                        </select>
                                    </div>
                                </div>
                                {selectedOrder.orderType === 'Delivery' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                                        <textarea 
                                            className="input-field"
                                            value={selectedOrder.deliveryAddress}
                                            onChange={(e) => setSelectedOrder({...selectedOrder, deliveryAddress: e.target.value})}
                                        />
                                    </div>
                                )}
                                {selectedOrder.orderType === 'Dine In' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                                        <input 
                                            type="text"
                                            className="input-field"
                                            value={selectedOrder.tableNumber}
                                            onChange={(e) => setSelectedOrder({...selectedOrder, tableNumber: e.target.value})}
                                        />
                                    </div>
                                )}
                                <button type="submit" className="btn-primary w-full py-3">Save Changes</button>
                            </form>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Info</h4>
                                        <p className="font-bold text-dark-200">{selectedOrder.customerName || selectedOrder.user?.name || 'Guest User'}</p>
                                        <p className="text-sm text-gray-600">{selectedOrder.user?.email || 'N/A'}</p>
                                        {selectedOrder.orderType === 'Delivery' && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <h5 className="text-[10px] font-bold text-gray-400 uppercase">Address</h5>
                                                <p className="text-sm text-dark-200 leading-tight">{selectedOrder.deliveryAddress || 'No address provided'}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Details</h4>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-gray-600">Total Amount:</span>
                                            <span className="font-bold text-brand-600">₹{selectedOrder.totalAmount}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                            <span>Type:</span>
                                            <span>{selectedOrder.orderType}</span>
                                        </div>
                                        {selectedOrder.orderType === 'Dine In' && (
                                            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                                <span>Table:</span>
                                                <span className="font-bold text-dark-200">#{selectedOrder.tableNumber || 'N/A'}</span>
                                            </div>
                                        )}
                                        {selectedOrder.orderType === 'Delivery' && (
                                            <div className="flex justify-between items-center text-xs text-brand-600 font-bold mb-1 pt-2 border-t mt-2">
                                                <span>Est. Delivery:</span>
                                                <span>30 Minutes</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-[10px] text-gray-400 border-t pt-1 mt-1">
                                            <span>Booked By:</span>
                                            <span className="font-medium">{selectedOrder.staff?.name || 'System/App'}</span>
                                        </div>
                                    </div>
                                </div>

                                <h4 className="font-bold text-dark-200 mb-4 border-b pb-2">Order Items</h4>
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-400 overflow-hidden">
                                                    {item.menuItem?.image ? <img src={item.menuItem.image} className="w-full h-full object-cover" /> : <Utensils size={16} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-dark-200 text-sm">{item.menuItem?.name || 'Food Item'}</p>
                                                    <p className="text-xs text-gray-500">₹{item.priceAtPurchase || item.price} × {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right text-sm font-bold text-brand-600">
                                                ₹{((item.priceAtPurchase || item.price) * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t flex gap-4">
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedOrder._id, 'Preparing')}
                                        className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                                    >
                                        Start Preparing
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(selectedOrder._id, 'Ready')}
                                        className="flex-1 py-3 bg-purple-50 text-purple-600 rounded-xl font-bold hover:bg-purple-100 transition-colors"
                                    >
                                        Mark as Ready
                                    </button>
                                    {selectedOrder.orderType === 'Dine In' && (
                                        <button 
                                            onClick={() => handleStatusUpdate(selectedOrder._id, 'Served')}
                                            className="flex-1 py-3 bg-teal-50 text-teal-600 rounded-xl font-bold hover:bg-teal-100 transition-colors"
                                        >
                                            Mark as Served
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Create Order Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
                        <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-dark-200">
                            <X size={24} />
                        </button>
                        
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-dark-200">Place New Order</h2>
                            <p className="text-gray-500 text-sm">Create a manual order for a customer</p>
                        </div>

                        <div className="flex gap-8 flex-1 min-h-0">
                            {/* Menu Selection */}
                            <div className="flex-1 overflow-y-auto pr-4 border-r pr-8 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Select Items</h4>
                                    <div className="relative w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input 
                                            type="text"
                                            placeholder="Search items..."
                                            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {filteredMenu.map(item => (
                                        <div key={item._id} className="p-3 border border-gray-100 rounded-xl hover:bg-brand-50/20 transition-all group flex flex-col justify-between">
                                            <div className="flex gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                                                    <img src={item.image} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-dark-200">{item.name}</p>
                                                    <p className="text-xs text-brand-600 font-bold">₹{item.price}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => addToCart(item)}
                                                className="mt-3 w-full py-1.5 text-xs bg-brand-50 text-brand-600 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
                                            >
                                                <Plus size={14} /> Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cart & Details */}
                            <div className="w-80 flex flex-col">
                                <form onSubmit={handleCreateOrder} className="flex flex-col h-full">
                                    <div className="flex-1 min-h-0 overflow-y-auto mb-6 pr-2">
                                        <div className="flex items-center gap-2 mb-4 text-brand-600">
                                            <ShoppingCart size={18} />
                                            <h4 className="font-bold text-sm uppercase tracking-widest">Your Basket</h4>
                                        </div>
                                        
                                        {cart.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400">
                                                <p className="text-xs italic">Select items to start an order</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {cart.map(item => (
                                                    <div key={item.menuItem} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                                        <div className="flex-1">
                                                            <p className="text-xs font-bold text-dark-200">{item.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => updateQuantity(item.menuItem, -1)}
                                                                    className="p-1 hover:bg-white rounded transition-colors text-gray-500"
                                                                >
                                                                    <Minus size={12} />
                                                                </button>
                                                                <span className="text-[10px] font-bold w-4 text-center">{item.quantity}</span>
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => updateQuantity(item.menuItem, 1)}
                                                                    className="p-1 hover:bg-white rounded transition-colors text-gray-500"
                                                                >
                                                                    <Plus size={12} />
                                                                </button>
                                                                <span className="text-[10px] text-brand-600 ml-auto">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeFromCart(item.menuItem)}
                                                            className="text-red-400 hover:text-red-500 p-1 ml-2"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Customer Name</label>
                                            <input 
                                                type="text"
                                                placeholder="Enter full name"
                                                className="input-field text-sm py-2"
                                                value={newOrder.customerName}
                                                onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Order Type</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => setNewOrder({...newOrder, orderType: 'Pickup'})}
                                                    className={`py-2 text-xs font-bold rounded-lg border-2 transition-all ${newOrder.orderType === 'Pickup' ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                                >
                                                    Pickup
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setNewOrder({...newOrder, orderType: 'Delivery'})}
                                                    className={`py-2 text-xs font-bold rounded-lg border-2 transition-all ${newOrder.orderType === 'Delivery' ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                                >
                                                    Delivery
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setNewOrder({...newOrder, orderType: 'Dine In'})}
                                                    className={`py-2 text-xs font-bold rounded-lg border-2 transition-all ${newOrder.orderType === 'Dine In' ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                                >
                                                    Dine In
                                                </button>
                                            </div>
                                        </div>

                                        {newOrder.orderType === 'Dine In' && (
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Table Number</label>
                                                <input 
                                                    type="text"
                                                    placeholder="Enter table number (e.g. 5)"
                                                    className="input-field text-sm py-2"
                                                    value={newOrder.tableNumber}
                                                    onChange={(e) => setNewOrder({...newOrder, tableNumber: e.target.value})}
                                                />
                                            </div>
                                        )}

                                        {newOrder.orderType === 'Delivery' && (
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Address</label>
                                                <input 
                                                    required
                                                    type="text"
                                                    placeholder="Enter full address"
                                                    className="input-field text-sm py-2"
                                                    value={newOrder.deliveryAddress}
                                                    onChange={(e) => setNewOrder({...newOrder, deliveryAddress: e.target.value})}
                                                />
                                            </div>
                                        )}

                                        <div className="bg-dark-100 p-4 rounded-xl text-white">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs opacity-60">Total Amount</span>
                                                <span className="text-xl font-bold">₹{calculateTotal(cart)}</span>
                                            </div>
                                            <p className="text-[10px] opacity-40">Tax & Charges Included</p>
                                        </div>

                                        <button 
                                            type="submit"
                                            disabled={cart.length === 0}
                                            className="btn-primary w-full py-4 text-sm font-bold shadow-lg shadow-brand-600/20"
                                        >
                                            Confirm Order
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
