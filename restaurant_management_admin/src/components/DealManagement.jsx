import React, { useState, useEffect } from 'react';
import { api, ASSET_BASE_URL, dealService } from '../services/api';
import { Plus, Edit2, Trash2, X, Tag, Calendar, Package } from 'lucide-react';

const DealManagement = () => {
    const [user] = useState(() => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (e) {
            return null;
        }
    });

    const [deals, setDeals] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDeal, setCurrentDeal] = useState({
        name: '',
        description: '',
        price: '',
        startDate: '',
        endDate: '',
        menuItems: [],
        image: '',
        isAvailable: true
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        fetchDeals();
        fetchMenuItems();
    }, []);

    const fetchDeals = async () => {
        try {
            const res = await dealService.getDeals();
            setDeals(res.data);
        } catch (err) {
            console.error('Failed to fetch deals:', err);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const res = await api.get('/menu?limit=100');
            const items = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setMenuItems(items);
        } catch (err) {
            console.error('Failed to fetch menu items:', err);
        }
    };

    const openModal = (deal = null) => {
        if (deal) {
            setCurrentDeal({
                ...deal,
                startDate: deal.startDate ? new Date(deal.startDate).toISOString().split('T')[0] : '',
                endDate: deal.endDate ? new Date(deal.endDate).toISOString().split('T')[0] : '',
                menuItems: deal.menuItems.map(item => ({
                    menuItem: item.menuItem?._id || item.menuItem,
                    quantity: item.quantity
                }))
            });
            setIsEditing(true);
        } else {
            setCurrentDeal({
                name: '',
                description: '',
                price: '',
                startDate: '',
                endDate: '',
                menuItems: [],
                image: '',
                isAvailable: true
            });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFile(null);
        setPreviewUrl('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const addProductToDeal = (productId) => {
        if (!productId) return;
        const exists = currentDeal.menuItems.find(item => item.menuItem === productId);
        if (exists) return;

        setCurrentDeal({
            ...currentDeal,
            menuItems: [...currentDeal.menuItems, { menuItem: productId, quantity: 1 }]
        });
    };

    const removeProductFromDeal = (productId) => {
        setCurrentDeal({
            ...currentDeal,
            menuItems: currentDeal.menuItems.filter(item => item.menuItem !== productId)
        });
    };

    const updateProductQuantity = (productId, quantity) => {
        setCurrentDeal({
            ...currentDeal,
            menuItems: currentDeal.menuItems.map(item => 
                item.menuItem === productId ? { ...item, quantity: parseInt(quantity) || 1 } : item
            )
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentDeal.menuItems.length === 0) {
            alert('Please add at least one product to the deal');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', currentDeal.name);
            formData.append('description', currentDeal.description);
            formData.append('price', currentDeal.price);
            formData.append('startDate', currentDeal.startDate);
            formData.append('endDate', currentDeal.endDate);
            formData.append('isAvailable', currentDeal.isAvailable);
            formData.append('menuItems', JSON.stringify(currentDeal.menuItems));

            if (selectedFile) {
                formData.append('image', selectedFile);
            } else if (currentDeal.image && !currentDeal.image.startsWith('/uploads')) {
                formData.append('image', currentDeal.image);
            }

            if (isEditing) {
                await dealService.updateDeal(currentDeal._id, formData);
            } else {
                await dealService.createDeal(formData);
            }
            fetchDeals();
            closeModal();
        } catch (err) {
            console.error('Failed to save deal:', err);
            alert('Error saving deal');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this deal?')) {
            try {
                await dealService.deleteDeal(id);
                fetchDeals();
            } catch (err) {
                console.error('Failed to delete deal:', err);
            }
        }
    };

    const getImageUrl = (image) => {
        if (!image || image === 'no-deal-image.jpg') return '/no-item-image.jpg';
        if (image.startsWith('http') || image.startsWith('blob:')) return image;
        return `${ASSET_BASE_URL}${image}`;
    };

    return (
        <div className="p-8">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-dark-200">Deals Management</h1>
                {user?.role === 'Admin' && (
                    <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                        <Plus size={20} /> Create New Deal
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.length === 0 ? (
                    <div className="col-span-full py-12 text-center glass-panel">
                        <Tag className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500">No deals found. Create your first deal!</p>
                    </div>
                ) : (
                    deals.map(deal => (
                        <div key={deal._id} className="glass-panel p-5 flex flex-col group relative">
                            <div className="h-44 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                                <img src={getImageUrl(deal.image)} alt={deal.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-xl text-dark-200">{deal.name}</h4>
                                <span className="font-bold text-brand-600 text-lg">₹{deal.price}</span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{deal.description}</p>
                            
                            <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                    <Calendar size={14} className="text-brand-500" />
                                    <span>{new Date(deal.startDate).toLocaleDateString()} - {new Date(deal.endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {deal.menuItems.map((item, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-brand-50 text-brand-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                                            <Package size={10} /> {item.menuItem?.name || 'Item'} x {item.quantity}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {user?.role === 'Admin' && (
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-4px] group-hover:translate-y-0">
                                    <button onClick={() => openModal(deal)} className="p-2 bg-white rounded-full text-blue-600 shadow-lg border border-gray-100 hover:bg-blue-50 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(deal._id)} className="p-2 bg-white rounded-full text-red-600 shadow-lg border border-gray-100 hover:bg-red-50 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative custom-scrollbar">
                        <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-dark-200 transition-colors">
                            <X size={28} />
                        </button>
                        
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-dark-200 mb-2">{isEditing ? 'Edit Deal' : 'Create New Deal'}</h2>
                            <p className="text-gray-500">Combine items and set a promotional price.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Deal Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Family Combo"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                                            value={currentDeal.name}
                                            onChange={(e) => setCurrentDeal({ ...currentDeal, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Total Price (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                                            value={currentDeal.price}
                                            onChange={(e) => setCurrentDeal({ ...currentDeal, price: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                                        <textarea
                                            required
                                            rows="3"
                                            placeholder="What's included in this deal?"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all resize-none"
                                            value={currentDeal.description}
                                            onChange={(e) => setCurrentDeal({ ...currentDeal, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Date</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                                                value={currentDeal.startDate}
                                                onChange={(e) => setCurrentDeal({ ...currentDeal, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">End Date</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                                                value={currentDeal.endDate}
                                                onChange={(e) => setCurrentDeal({ ...currentDeal, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Deal Image</label>
                                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                                                <img src={previewUrl || getImageUrl(currentDeal.image)} className="w-full h-full object-cover" />
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-600 file:text-white hover:file:bg-brand-700 transition-all pointer-events-auto"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            id="isAvailable"
                                            checked={currentDeal.isAvailable}
                                            onChange={(e) => setCurrentDeal({ ...currentDeal, isAvailable: e.target.checked })}
                                            className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
                                        />
                                        <label htmlFor="isAvailable" className="text-sm font-bold text-gray-700">Available for customers</label>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-dark-200">Included Products</h3>
                                    <select 
                                        className="px-4 py-2 bg-brand-50 text-brand-600 border border-brand-100 rounded-xl outline-none text-sm font-bold"
                                        onChange={(e) => addProductToDeal(e.target.value)}
                                        value=""
                                    >
                                        <option value="">+ Add Product</option>
                                        {menuItems.map(item => (
                                            <option key={item._id} value={item._id}>{item.name} (₹{item.price})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    {currentDeal.menuItems.length === 0 ? (
                                        <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-gray-400 text-sm">No products added to this deal yet.</p>
                                        </div>
                                    ) : (
                                        currentDeal.menuItems.map((item, index) => {
                                            const product = menuItems.find(m => m._id === item.menuItem);
                                            return (
                                                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-brand-200 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden">
                                                            <img src={getImageUrl(product?.image)} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-dark-200">{product?.name || 'Unknown Item'}</p>
                                                            <p className="text-[10px] text-gray-400">Regular Price: ₹{product?.price || 0}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center bg-gray-50 rounded-lg p-1">
                                                            <span className="text-[10px] uppercase font-bold text-gray-400 px-2">Qty</span>
                                                            <input 
                                                                type="number"
                                                                min="1"
                                                                className="w-12 bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold focus:ring-1 focus:ring-brand-500 outline-none"
                                                                value={item.quantity}
                                                                onChange={(e) => updateProductQuantity(item.menuItem, e.target.value)}
                                                            />
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeProductFromDeal(item.menuItem)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="w-full btn-primary py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-500/20 mt-4">
                                {isEditing ? 'Update Deal' : 'Publish Deal'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DealManagement;
