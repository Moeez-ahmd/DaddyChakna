import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const MenuManagement = () => {
    const [user] = useState(() => JSON.parse(localStorage.getItem('userInfo')));
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        status: true
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        fetchData();
    }, [page, categoryFilter]);

    const fetchData = async () => {
        try {
            const cats = await api.get('/categories');
            setCategories(cats.data);

            const queryParams = new URLSearchParams({
                page: page,
                limit: 8,
                category: categoryFilter
            }).toString();

            const menuItems = await api.get(`/menu?${queryParams}`);
            setItems(menuItems.data.data);
            setTotalPages(menuItems.data.pages);

            if (cats.data.length > 0 && !currentItem.category) {
                setCurrentItem(prev => ({ ...prev, category: cats.data[0]._id }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setCurrentItem({
                ...item,
                category: item.category?._id || item.category
            });
            setIsEditing(true);
        } else {
            setCurrentItem({
                name: '',
                description: '',
                price: '',
                category: categories[0]?._id || '',
                image: '',
                status: true
            });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem({ name: '', description: '', price: '', category: '', image: '', status: true });
        setSelectedFile(null);
        setPreviewUrl('');
    };

    const getImageUrl = (image) => {
        if (!image) return '/no-item-image.jpg';
        if (image.startsWith('http') || image.startsWith('blob:')) return image;
        const baseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '');
        return `${baseUrl}${image}`;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', currentItem.name);
            formData.append('description', currentItem.description);
            formData.append('price', currentItem.price);
            formData.append('category', currentItem.category);
            formData.append('status', currentItem.status);
            
            if (selectedFile) {
                formData.append('image', selectedFile);
            } else if (currentItem.image && !currentItem.image.startsWith('/uploads')) {
                formData.append('image', currentItem.image);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            if (isEditing) {
                await api.put(`/menu/${currentItem._id}`, formData, config);
            } else {
                await api.post('/menu', formData, config);
            }
            fetchData();
            closeModal();
        } catch (err) {
            console.error('Failed to save menu item:', err);
            alert('Error saving menu item');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/menu/${id}`);
                fetchData();
            } catch (err) {
                console.error('Failed to delete item:', err);
            }
        }
    };

    return (
        <div className="p-8">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-dark-200">Menu Management</h1>
                    <select 
                        className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium"
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                {user?.role === 'Admin' && (
                    <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                        <Plus size={20} /> Add New Item
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                {items.length === 0 ? (
                    <p className="text-gray-500">No items available. Add some menu items.</p>
                ) : (
                    items.map(item => (
                        <div key={item._id} className="glass-panel p-4 flex flex-col group relative">
                            <div className="h-40 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                                <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <h4 className="font-bold text-lg text-dark-200">{item.name}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="font-bold text-brand-600">₹{item.price}</span>
                                <span className="px-2 py-1 bg-brand-50 text-brand-600 text-xs font-semibold rounded-lg">
                                    {typeof item.category === 'object' ? item.category?.name : categories.find(c => c._id === item.category)?.name || 'Uncategorized'}
                                </span>
                            </div>
                            
                            {user?.role === 'Admin' && (
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(item)} className="p-2 bg-white/90 rounded-full text-blue-600 shadow-sm border border-gray-100">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(item._id)} className="p-2 bg-white/90 rounded-full text-red-600 shadow-sm border border-gray-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-between items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 font-medium">
                    Showing page <span className="text-brand-600 font-bold">{page}</span> of <span className="text-dark-200 font-bold">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(prev => prev - 1)}
                        className="px-4 py-2 rounded-xl text-sm font-bold border-2 border-gray-50 text-gray-400 hover:border-brand-500 hover:text-brand-600 disabled:opacity-30 disabled:hover:border-gray-50 disabled:hover:text-gray-400 transition-all font-mono"
                    >
                        PREV
                    </button>
                    <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === i + 1 ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button 
                        disabled={page === totalPages}
                        onClick={() => setPage(prev => prev + 1)}
                        className="px-4 py-2 rounded-xl text-sm font-bold border-2 border-gray-50 text-gray-400 hover:border-brand-500 hover:text-brand-600 disabled:opacity-30 disabled:hover:border-gray-50 disabled:hover:text-gray-400 transition-all font-mono"
                    >
                        NEXT
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-dark-200">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field"
                                        value={currentItem.name}
                                        onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="input-field"
                                        value={currentItem.price}
                                        onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select 
                                    className="input-field"
                                    value={currentItem.category}
                                    onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="input-field"
                                    value={currentItem.description}
                                    onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Item Image</label>
                                <div className="mt-1 flex items-center gap-4">
                                     {(previewUrl || currentItem.image) && (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                            <img src={previewUrl || getImageUrl(currentItem.image)} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2">Or paste a URL</p>
                                <input
                                    type="text"
                                    className="input-field text-xs py-1"
                                    placeholder="https://..."
                                    value={currentItem.image}
                                    onChange={(e) => setCurrentItem({ ...currentItem, image: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full py-3 mt-4">
                                {isEditing ? 'Update Item' : 'Create Item'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManagement;
