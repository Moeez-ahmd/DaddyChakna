import React, { useState, useEffect } from 'react';
import { homeMediaService, ASSET_BASE_URL } from '../services/api';
import { Trash2, UploadCloud, Image as ImageIcon, Video, RefreshCw } from 'lucide-react';

const HomeMediaManagement = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const response = await homeMediaService.getAllMedia();
            setMediaItems(response.data || response);
        } catch (error) {
            console.error('Failed to fetch home media', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await homeMediaService.uploadMedia(formData);
            setFile(null);
            setPreview(null);
            fetchMedia(); // Refresh list
        } catch (error) {
            console.error('Upload failed', error);
            alert('Failed to upload media. Ensure it is an image or video and under 50MB.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this media?')) return;
        
        try {
            await homeMediaService.deleteMedia(id);
            fetchMedia();
        } catch (error) {
            console.error('Delete failed', error);
            alert('Failed to delete media.');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 border-b-4 border-brand-500 pb-2 inline-block">Home Media</h1>
                    <p className="text-gray-500 mt-2">Upload images and promotional videos (up to 50MB) to display on the Customer Home Page.</p>
                </div>
                <button 
                    onClick={fetchMedia} 
                    className="flex text-sm items-center gap-2 text-gray-600 hover:text-brand-600 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center">
                <form onSubmit={handleUpload} className="p-8">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-brand-200 rounded-xl bg-brand-50/30 hover:bg-brand-50 transition-colors cursor-pointer group relative overflow-hidden">
                        {preview ? (
                            file.type.startsWith('video/') ? (
                                <video src={preview} className="absolute inset-0 w-full h-full object-cover opacity-50" autoPlay loop muted />
                            ) : (
                                <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Preview" />
                            )
                        ) : null}
                        
                        <div className="z-10 flex flex-col items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                            <UploadCloud className="w-10 h-10 text-brand-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-gray-700">Click to browse or drag media here</span>
                            <span className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WEBP, MP4, WEBM (Max 50MB)</span>
                        </div>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>

                    {file && (
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                className="mr-4 px-6 py-2 text-gray-500 hover:text-gray-700"
                                onClick={() => { setFile(null); setPreview(null); }}
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`px-8 py-2 rounded-xl text-white font-medium ${uploading ? 'bg-brand-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-200'} transition-all flex items-center gap-2`}
                                disabled={uploading}
                            >
                                {uploading ? <RefreshCw className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                                {uploading ? 'Uploading...' : 'Upload Media'}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Gallery Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading && mediaItems.length === 0 ? (
                    <div className="col-span-full py-12 flex justify-center text-gray-400">
                        <RefreshCw className="animate-spin" size={32} />
                    </div>
                ) : mediaItems.length > 0 ? (
                    mediaItems.map(item => (
                        <div key={item._id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 aspect-square flex items-center justify-center">
                            {item.mediaType === 'VIDEO' ? (
                                <>
                                    <span className="absolute top-3 left-3 z-10 p-1.5 bg-black/60 rounded-lg text-white backdrop-blur-md">
                                        <Video size={16} />
                                    </span>
                                    <video 
                                        src={`${ASSET_BASE_URL}${item.mediaUrl}`} 
                                        className="w-full h-full object-cover" 
                                        autoPlay loop muted playsInline
                                    />
                                </>
                            ) : (
                                <>
                                    <span className="absolute top-3 left-3 z-10 p-1.5 bg-black/60 rounded-lg text-white backdrop-blur-md">
                                        <ImageIcon size={16} />
                                    </span>
                                    <img 
                                        src={`${ASSET_BASE_URL}${item.mediaUrl}`} 
                                        alt="Home Media" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </>
                            )}
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                                <button 
                                    onClick={() => handleDelete(item._id)}
                                    className="bg-white text-red-500 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all font-medium text-sm"
                                >
                                    <Trash2 size={16} /> Delete Media
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg">No media uploaded yet</p>
                        <p className="text-sm">Upload images and videos above to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeMediaManagement;
