import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const CategoryManagement = () => {
    const [user] = useState(() => JSON.parse(localStorage.getItem('userInfo')));
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ name: '', image: '', status: true });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', currentCategory.name);
            formData.append('status', currentCategory.status);
            if (selectedFile) {
                formData.append('image', selectedFile);
            } else if (currentCategory.image && !currentCategory.image.startsWith('/uploads')) {
                 formData.append('image', currentCategory.image);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            if (isEditing) {
                await api.put(`/categories/${currentCategory._id}`, formData, config);
            } else {
                await api.post('/categories', formData, config);
            }
            fetchCategories();
            closeModal();
        } catch (err) {
            console.error('Failed to save category:', err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories();
            } catch (err) {
                console.error('Failed to delete category:', err);
            }
        }
    };

    const openModal = (category = { name: '', image: '', status: true }) => {
        setCurrentCategory(category);
        setIsEditing(!!category._id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentCategory({ name: '', image: '', status: true });
        setSelectedFile(null);
        setPreviewUrl('');
        setIsEditing(false);
    };

    const getImageUrl = (image) => {
        if (!image) return '/no-image.jpg';
        if (image.startsWith('http') || image.startsWith('blob:')) return image;
        // Assuming backend is on port 5000 as per previous context
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${baseUrl}${image}`;
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-dark-200">Category Management</h1>
                {user?.role === 'Admin' && (
                    <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                        <Plus size={20} /> Add Category
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat) => (
                    <div key={cat._id} className="glass-panel p-4 group relative overflow-hidden">
                        <div className="h-32 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                            <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-bold text-lg text-dark-200">{cat.name}</h3>
                        <p className={`text-xs mt-1 ${cat.status ? 'text-green-600' : 'text-red-500'}`}>
                            {cat.status ? '● Active' : '● Inactive'}
                        </p>
                        {user?.role === 'Admin' && (
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(cat)} className="p-2 bg-white/90 rounded-full text-blue-600 shadow-sm border border-gray-100">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(cat._id)} className="p-2 bg-white/90 rounded-full text-red-600 shadow-sm border border-gray-100">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-dark-200">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Category' : 'Add Category'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={currentCategory.name}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                                <div className="mt-1 flex items-center gap-4">
                                    {(previewUrl || currentCategory.image) && (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                            <img src={previewUrl || getImageUrl(currentCategory.image)} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2">Or paste a URL (optional legacy support)</p>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    className="input-field text-xs py-1"
                                    value={currentCategory.image}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, image: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="status"
                                    checked={currentCategory.status}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, status: e.target.checked })}
                                />
                                <label htmlFor="status" className="text-sm font-medium text-gray-700">Active</label>
                            </div>
                            <button type="submit" className="btn-primary w-full py-3 mt-4">
                                {isEditing ? 'Update Category' : 'Create Category'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
