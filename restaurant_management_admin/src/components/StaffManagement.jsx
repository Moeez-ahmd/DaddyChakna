import React, { useState, useEffect } from 'react';
import { api, authService, ASSET_BASE_URL } from '../services/api';
import { Plus, UserPlus, Shield, User, Trash2, X, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Staff', phone: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const location = useLocation();
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        fetchStaff();
        if (new URLSearchParams(location.search).get('add') === 'true') {
            openModal();
        }
    }, [location.search]);

    const fetchStaff = async () => {
        try {
            const response = await api.get('/staff');
            const nextStaff = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.data)
                    ? response.data.data
                    : [];
            setStaff(nextStaff);
        } catch (err) {
            console.error('Failed to fetch staff:', err);
        }
    };

    const openModal = (member = null) => {
        if (member) {
            setFormData({
                _id: member._id,
                name: member.name,
                email: member.email,
                role: member.role,
                phone: member.phone || '',
                profilePic: member.profilePic || '',
                password: '' 
            });
            setIsEditing(true);
        } else {
            setFormData({ name: '', email: '', password: '', role: 'Staff', phone: '' });
            setIsEditing(false);
        }
        setSelectedFile(null);
        setPreviewUrl('');
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const getProfilePicUrl = (pic) => {
        if (!pic || pic === 'default-profile.png') return `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}`;
        if (pic.startsWith('http') || pic.startsWith('blob:')) return pic;
        return `${ASSET_BASE_URL}${pic}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('role', formData.role);
            data.append('phone', formData.phone);
            
            if (formData.password) {
                data.append('password', formData.password);
            }
            
            if (selectedFile) {
                data.append('profilePic', selectedFile);
            }

            if (isEditing) {
                await api.put(`/staff/${formData._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/staff', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            fetchStaff();
            closeModal();
        } catch (err) {
            console.error('Failed to save staff:', err);
            alert(err.response?.data?.message || 'Failed to save staff');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this staff member?')) {
            try {
                await api.delete(`/staff/${id}`);
                fetchStaff();
            } catch (err) {
                console.error('Failed to delete staff:', err);
                alert(err.response?.data?.message || 'Deletion failed');
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', email: '', password: '', role: 'Staff', phone: '' });
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-dark-200">Staff Management</h1>
                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            const me = staff.find(m => m._id === currentUser?._id) || currentUser;
                            openModal(me);
                        }} 
                        className="btn-secondary flex items-center gap-2"
                    >
                        <User size={20} /> Update My Profile
                    </button>
                    <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                        <UserPlus size={20} /> Add Member
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.filter(member => member._id !== currentUser?._id).map((member) => (
                    <div key={member._id} className="glass-panel p-6 flex flex-col group relative">
                        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 mb-4 mx-auto overflow-hidden border-2 border-brand-50">
                            {member.profilePic && member.profilePic !== 'default-profile.png' ? (
                                <img src={getProfilePicUrl(member.profilePic)} className="w-full h-full object-cover" />
                            ) : (
                                member.role === 'Admin' ? <Shield size={40} /> : <User size={40} />
                            )}
                        </div>
                        <div className="text-center mb-4">
                            <h3 className="font-bold text-xl text-dark-200">{member.name}</h3>
                            <p className="text-brand-600 font-medium text-sm mb-2 uppercase tracking-wide">{member.role}</p>
                            <p className="text-gray-500 text-sm">{member.email}</p>
                            <p className="text-gray-500 text-xs mt-1">{member.phone || 'No phone'}</p>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t flex justify-between items-center">
                            <button 
                                onClick={() => openModal(member)}
                                className="text-blue-500 hover:text-blue-700 font-medium text-sm"
                            >
                                Update
                            </button>
                            {currentUser?._id !== member._id && (
                                <button 
                                    onClick={() => handleDelete(member._id)}
                                    className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                                >
                                    <Trash2 size={16} /> Remove
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-dark-200">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Update Member Info' : 'Add Staff Member'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-brand-50 shadow-lg mb-2">
                                    <img 
                                        src={previewUrl || getProfilePicUrl(formData.profilePic)} 
                                        className="w-full h-full object-cover" 
                                        alt="Profile Preview"
                                    />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="text-xs file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-brand-50 file:text-brand-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="input-field"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {isEditing ? 'New Password (Optional)' : 'Password'}
                                </label>
                                <input
                                    type="password"
                                    required={!isEditing}
                                    className="input-field"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select 
                                    className="input-field"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Staff">Staff</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <button type="submit" disabled={isSaving} className="btn-primary w-full py-3 mt-4 flex items-center justify-center">
                                {isSaving ? <><RefreshCw size={18} className="animate-spin mr-2" /> Saving...</> : (isEditing ? 'Update Member' : 'Create Member')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
