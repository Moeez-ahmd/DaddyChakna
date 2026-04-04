const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `homemedia-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Check file type for both images and videos
function checkMediaFileType(file, cb) {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|webp|mp4|webm|mkv|avi|mov/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type (allow image/* or video/*)
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    if ((isImage || isVideo) && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images and videos are allowed!'));
    }
}

// Init upload
const mediaUpload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: function (req, file, cb) {
        checkMediaFileType(file, cb);
    }
});

module.exports = mediaUpload;
