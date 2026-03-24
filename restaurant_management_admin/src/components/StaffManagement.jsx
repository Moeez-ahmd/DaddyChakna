import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, UserPlus, Shield, User, Trash2, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Staff', phone: '' });
    const location = useLocation();

    useEffect(() => {
        fetchStaff();
        if (new URLSearchParams(location.search).get('add') === 'true') {
            openModal();
        }
    }, [location.search]);

    const fetchStaff = async () => {
        try {
            const response = await api.get('/staff');
            setStaff(response.data);
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
                password: '' // Keep password empty for updates
            });
            setIsEditing(true);
        } else {
            setFormData({ name: '', email: '', password: '', role: 'Staff', phone: '' });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Remove password if empty
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await api.put(`/staff/${formData._id}`, updateData);
            } else {
                await api.post('/staff', formData);
            }
            fetchStaff();
            closeModal();
        } catch (err) {
            console.error('Failed to save staff:', err);
            alert(err.response?.data?.message || 'Failed to save staff');
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
                <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                    <UserPlus size={20} /> Add Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map((member) => (
                    <div key={member._id} className="glass-panel p-6 flex flex-col group relative">
                        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 mb-4 mx-auto">
                            {member.role === 'Admin' ? <Shield size={40} /> : <User size={40} />}
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
                            <button 
                                onClick={() => handleDelete(member._id)}
                                className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                            >
                                <Trash2 size={16} /> Remove
                            </button>
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
                            <button type="submit" className="btn-primary w-full py-3 mt-4">
                                {isEditing ? 'Update Member' : 'Create Member'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
