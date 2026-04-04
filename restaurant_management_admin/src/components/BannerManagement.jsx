import React, { useState, useEffect } from 'react';
import { api, ASSET_BASE_URL, bannerService, dealService } from '../services/api';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Video, Link, ExternalLink, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const BannerManagement = () => {
    const [user] = useState(() => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (e) {
            return null;
        }
    });

    const [banners, setBanners] = useState([]);
    const [products, setProducts] = useState([]);
    const [deals, setDeals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentBanner, setCurrentBanner] = useState({
        title: '',
        purpose: 'Advertisement',
        linkType: 'None',
        linkId: '',
        isActive: true,
        sortOrder: 0,
        image: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        fetchBanners();
        fetchLinkOptions();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await bannerService.getAllBanners();
            setBanners(res.data);
        } catch (err) {
            console.error('Failed to fetch banners:', err);
        }
    };

    const fetchLinkOptions = async () => {
        try {
            const productRes = await api.get('/menu?limit=100');
            const productItems = Array.isArray(productRes.data) ? productRes.data : (productRes.data.data || []);
            setProducts(productItems);

            const dealRes = await dealService.getDeals();
            setDeals(dealRes.data);
        } catch (err) {
            console.error('Failed to fetch link options:', err);
        }
    };

    const openModal = (banner = null) => {
        if (banner) {
            setCurrentBanner({ ...banner });
            setIsEditing(true);
        } else {
            setCurrentBanner({
                title: '',
                purpose: 'Advertisement',
                linkType: 'None',
                linkId: '',
                isActive: true,
                sortOrder: 0,
                image: ''
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

    const handlePurposeChange = (purpose) => {
        let linkType = 'None';
        if (purpose === 'New Product') linkType = 'Product';
        if (purpose === 'New Deal') linkType = 'Deal';
        
        setCurrentBanner({
            ...currentBanner,
            purpose,
            linkType,
            linkId: '' // Reset linkId when purpose changes
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', currentBanner.title);
            formData.append('purpose', currentBanner.purpose);
            formData.append('linkType', currentBanner.linkType);
            
            if (currentBanner.linkId) {
                formData.append('linkId', currentBanner.linkId);
            }
            
            formData.append('isActive', currentBanner.isActive);
            formData.append('sortOrder', currentBanner.sortOrder);

            if (selectedFile) {
                formData.append('image', selectedFile);
            } else if (currentBanner.image && !currentBanner.image.startsWith('/uploads')) {
                formData.append('image', currentBanner.image);
            }

            if (isEditing) {
                await bannerService.updateBanner(currentBanner._id, formData);
            } else {
                await bannerService.createBanner(formData);
            }
            fetchBanners();
            closeModal();
        } catch (err) {
            console.error('Failed to save banner:', err);
            alert('Error saving banner');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                await bannerService.deleteBanner(id);
                fetchBanners();
            } catch (err) {
                console.error('Failed to delete banner:', err);
            }
        }
    };

    const getImageUrl = (image) => {
        if (!image) return '/no-item-image.jpg';
        if (image.startsWith('http') || image.startsWith('blob:')) return image;
        return `${ASSET_BASE_URL}${image}`;
    };

    const getLinkLabel = (banner) => {
        if (banner.linkType === 'None') return 'No Link';
        if (banner.linkType === 'Product') {
            const p = products.find(prod => prod._id === banner.linkId);
            return p ? `Product: ${p.name}` : 'Linked Product';
        }
        if (banner.linkType === 'Deal') {
            const d = deals.find(deal => deal._id === banner.linkId);
            return d ? `Deal: ${d.name}` : 'Linked Deal';
        }
        return 'Unknown Link';
    };

    return (
        <div className="p-8">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-dark-200">Banner Slider Management</h1>
                {user?.role === 'Admin' && (
                    <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                        <Plus size={20} /> Add New Banner
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {banners.length === 0 ? (
                    <div className="col-span-full py-12 text-center glass-panel">
                        <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500">No banners found. Start by adding one!</p>
                    </div>
                ) : (
                    banners.map(banner => (
                        <div key={banner._id} className="glass-panel overflow-hidden group relative flex flex-col">
                            <div className="aspect-[21/9] bg-gray-100 overflow-hidden relative">
                                {banner.mediaType === 'VIDEO' ? (
                                    <>
                                        <span className="absolute top-4 right-4 z-10 p-1.5 bg-black/60 rounded-lg text-white backdrop-blur-md">
                                            <Video size={16} />
                                        </span>
                                        <video src={getImageUrl(banner.image)} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                    </>
                                ) : (
                                    <img src={getImageUrl(banner.image)} alt={banner.title} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute top-4 left-4 flex gap-2 z-10">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border ${
                                        banner.isActive 
                                        ? 'bg-green-500/20 text-green-700 border-green-500/30' 
                                        : 'bg-red-500/20 text-red-700 border-red-500/30'
                                    }`}>
                                        {banner.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="px-3 py-1 bg-brand-500/20 text-brand-700 border border-brand-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                                        {banner.purpose}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-xl text-dark-200">{banner.title || 'Untitled Banner'}</h4>
                                    <span className="text-xs text-gray-400 font-mono">Order: {banner.sortOrder}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                    <Link size={14} className="text-brand-500" />
                                    <span>{getLinkLabel(banner)}</span>
                                </div>

                                {user?.role === 'Admin' && (
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button onClick={() => openModal(banner)} className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm">
                                            <Edit2 size={16} /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(banner._id)} className="btn-secondary py-2 px-4 shadow-sm border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center gap-2 text-sm">
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
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
                            <h2 className="text-3xl font-bold text-dark-200 mb-2">{isEditing ? 'Edit Banner' : 'Add New Banner'}</h2>
                            <p className="text-gray-500">Banner images will be displayed in high quality (landscape ratio).</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Banner Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Weekend Special Deals"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                                            value={currentBanner.title}
                                            onChange={(e) => setCurrentBanner({ ...currentBanner, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Purpose</label>
                                        <select 
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                                            value={currentBanner.purpose}
                                            onChange={(e) => handlePurposeChange(e.target.value)}
                                            required
                                        >
                                            <option value="New Product">New Product</option>
                                            <option value="New Deal">New Deal</option>
                                            <option value="Advertisement">Advertisement</option>
                                        </select>
                                    </div>
                                    
                                    {currentBanner.linkType !== 'None' && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                                Link to {currentBanner.linkType}
                                            </label>
                                            <select 
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                                                value={currentBanner.linkId}
                                                onChange={(e) => setCurrentBanner({ ...currentBanner, linkId: e.target.value })}
                                                required
                                            >
                                                <option value="">Select {currentBanner.linkType}</option>
                                                {currentBanner.linkType === 'Product' ? (
                                                    products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)
                                                ) : (
                                                    deals.map(d => <option key={d._id} value={d._id}>{d.name}</option>)
                                                )}
                                            </select>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Sort Order</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                                                value={currentBanner.sortOrder}
                                                onChange={(e) => setCurrentBanner({ ...currentBanner, sortOrder: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="flex items-center mt-8 gap-3">
                                            <input 
                                                type="checkbox" 
                                                id="isActive"
                                                checked={currentBanner.isActive}
                                                onChange={(e) => setCurrentBanner({ ...currentBanner, isActive: e.target.checked })}
                                                className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
                                            />
                                            <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Display Active</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">Banner Media (Landscape 21:9 Recommended)</label>
                                    <div className="flex flex-col gap-4">
                                        <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 relative group">
                                            {(previewUrl || currentBanner.image) ? (
                                                (selectedFile?.type.startsWith('video/') || currentBanner.mediaType === 'VIDEO') ? (
                                                    <video src={previewUrl || getImageUrl(currentBanner.image)} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                                ) : (
                                                    <img src={previewUrl || getImageUrl(currentBanner.image)} className="w-full h-full object-cover" />
                                                )
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                    <ImageIcon size={48} />
                                                    <p className="text-xs mt-2">No Image Selected</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            onChange={handleFileChange}
                                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-600 file:text-white hover:file:bg-brand-700 transition-all pointer-events-auto cursor-pointer"
                                        />
                                        <p className="text-[10px] text-gray-400">Allowed formats: JPG, PNG, WEBP, MP4, WEBM. Max size: 50MB.</p>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={isSaving} className="w-full btn-primary py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-500/20 mt-4 flex items-center justify-center">
                                {isSaving ? <><RefreshCw size={18} className="animate-spin mr-2" /> Saving...</> : (isEditing ? 'Update Banner' : 'Publish Banner')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BannerManagement;
