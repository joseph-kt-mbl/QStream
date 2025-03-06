import { Router } from 'express';
const router = Router();
import {
  uploadVideo,
  getAllVideos, 
  getVideoById, 
  getUserVideos, 
  updateVideo, 
  deleteVideo,
  incrementViews,
  saveWatchedTime,
  getWatchedTime
} from '../controllers/video.controller.js';

import {protectRoute as authMiddleware} from '../middleware/auth.middleware.js';
import multer, { diskStorage } from 'multer';
import path from 'path';

// Setup multer for file uploads
const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter for videos
const fileFilter = (req, file, cb) => {
  // Accept video files only
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 150 * 1024 * 1024 // 100MB limit
  }
});

// Routes
router.post('/upload', authMiddleware, upload.single('video'), uploadVideo);
router.post('/incviews/:id', incrementViews);
router.get('/', getAllVideos);
router.get('/:id', getVideoById);
router.get('/user/:userId', getUserVideos);
router.put('/:id', authMiddleware, updateVideo);
router.delete('/:id', authMiddleware, deleteVideo);
router.post('/watched', authMiddleware,saveWatchedTime);
router.get('/watched/:videoId', authMiddleware,getWatchedTime);

export default router;