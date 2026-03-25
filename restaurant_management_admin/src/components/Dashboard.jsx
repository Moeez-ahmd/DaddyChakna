import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShoppingBag, DollarSign, Users, Utensils, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        todayOrdersCount: 0,
        todayRevenue: 0,
        staffCount: 0,
        menuCount: 0
    });
    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('userInfo')));
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileData, setProfileData] = useState({ name: user?.name || '', phone: user?.phone || '', profilePic: user?.profilePic || '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/finance');
                setStats(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', profileData.name);
            formData.append('phone', profileData.phone);
            if (selectedFile) {
                formData.append('profilePic', selectedFile);
            }

            const res = await api.put('/auth/me', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const updatedUserInfo = { ...user, ...res.data };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
            setUser(updatedUserInfo);
            setIsProfileModalOpen(false);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const getProfilePicUrl = (pic) => {
        if (!pic || pic === 'default-profile.png') return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User');
        if (pic.startsWith('http') || pic.startsWith('blob:')) return pic;
        const baseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '');
        return `${baseUrl}${pic}`;
    };

    if (loading) return <div className="p-8"><p className="animate-pulse text-gray-400">Loading statistics...</p></div>;

    const allCards = [
        { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Cumulative Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Active Staff', value: stats.staffCount, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', adminOnly: true },
        { title: 'Menu Items', value: stats.menuCount, icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50' },
        { title: "Today's Orders", value: stats.todayOrdersCount, icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50' },
        { title: "Today's Revenue", value: `₹${stats.todayRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    ];

    const cards = allCards.filter(card => !card.adminOnly || user?.role === 'Admin');

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-dark-200 mb-8">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="glass-panel p-6 flex items-center gap-4 hover:translate-y-[-4px] transition-transform">
                        <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{card.title}</p>
                            <h3 className="text-2xl font-bold text-dark-200 mt-1">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-8">
                    <h4 className="font-bold text-lg mb-4 text-dark-200">Recent Activity</h4>
                    <p className="text-gray-400 text-sm italic">Detailed activity graphs and logs coming soon...</p>
                </div>
                <div className="glass-panel p-8">
                    <h4 className="font-bold text-lg mb-4 text-dark-200">Quick Actions</h4>
                    <div className="flex flex-wrap gap-4">
                        <button className="px-4 py-2 bg-brand-50 text-brand-600 rounded-lg font-medium text-sm">Download Report</button>
                        <button onClick={() => setIsProfileModalOpen(true)} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg font-medium text-sm">Update Profile</button>
                    </div>
                </div>
            </div>

        {isProfileModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
                    <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-dark-200">
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold mb-6">Update Profile</h2>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-brand-50 shadow-lg mb-2">
                                <img src={previewUrl || getProfilePicUrl(user.profilePic)} className="w-full h-full object-cover" />
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
                                className="input-field"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="text"
                                className="input-field"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full py-3 mt-4">Save Profile</button>
                    </form>
                </div>
            </div>
        )}
    </div>
    );
};

export default Dashboard;
