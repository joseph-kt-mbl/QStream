import prisma from '../lib/prisma.js';
const _video = prisma.video;
import { v2 as cloudinary } from 'cloudinary';
import { unlinkSync ,existsSync ,mkdirSync,writeFileSync} from 'fs';
import path from 'path';


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload a video
export async function uploadVideo(req, res) {
  try {
    console.log('Received request to upload video');
    
    const { title, description } = req.body;
    console.log('Request body:', { title, description });
    
    const videoFile = req.file;
    console.log('Uploaded file:', videoFile);
    
    if (!videoFile) {
      console.log('No video file uploaded');
      return res.status(400).json({ message: 'No video file uploaded!' });
    }
    
    // Upload the video to Cloudinary
    console.log('Uploading video to Cloudinary...');
    const uploadResult = await cloudinary.uploader.upload(videoFile.path, {
      resource_type: 'video',
      folder: 'video-stream-app',
    });
    console.log('Video uploaded:', uploadResult);
    
    // Generate a thumbnail from the video
    console.log('Generating thumbnail...');
    const thumbnailResult = await cloudinary.uploader.upload(videoFile.path, {
      resource_type: 'video',
      format: 'jpg',  // Convert to image
      folder: 'video-stream-app-thumbnails',
      transformation: [
        { width: 300, height: 200, crop: "fill" },
        { fetch_format: "auto" },
        { quality: "auto" },
        { start_offset: "auto" }  // This takes a frame from the video automatically
      ]
    });
    console.log('Thumbnail generated:', thumbnailResult);
    
    // Remove temporary file
    console.log('Removing temporary file:', videoFile.path);
    unlinkSync(videoFile.path);
    console.log('Temporary file removed');
    
    // Create video in database
    console.log('Saving video to database...');
    const video = await _video.create({
      data: {
        title,
        description,
        filePath: uploadResult.secure_url,
        thumbnailPath: thumbnailResult.secure_url,
        userId: req.user.id
      }
    });
    console.log('Video saved:', video);
    
    res.status(201).json(video);
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Error uploading video', error: error.message });
  }
}



// Get all videos
export async function getAllVideos(req, res) {
  try {
    const videos = await _video.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
}

export async function incrementViews(req,res) {
  try {
    const { id } = req.params;
    
    const video = await _video.findUnique({
      where: { id: parseInt(id) }
    });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment view count
    await _video.update({
      where: { id: parseInt(id) },
      data: { views: { increment: 1 } }
    });

    res.status(200).json({msg: 'View incremented'});
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Error fetching video', error: error.message });
  }
}

// Get video by ID
export async function getVideoById(req, res) {
  try {
    const { id } = req.params;
    
    const video = await _video.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.status(200).json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Error fetching video', error: error.message });
  }
}

// Get user's videos
export async function getUserVideos(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    
    const videos = await _video.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching user videos:', error);
    res.status(500).json({ message: 'Error fetching user videos', error: error.message });
  }
}

// Update video
export async function updateVideo(req, res) {
  try {
    const { id } = req.params;
    const { title, description, thumbnailBase64, thumbnailFilename } = req.body;
    
    console.log('Updating video ID:', id);
    console.log('Request body:', { title, description, hasThumbnail: !!thumbnailBase64 });
    
    // Check if video exists and belongs to user
    const existingVideo = await _video.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    if (existingVideo.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Initialize update data with basic fields
    const updateData = {
      title,
      description
    };
    
    // Handle base64 thumbnail if provided
    if (thumbnailBase64) {
      try {
        // Convert base64 to buffer
        const base64Data = thumbnailBase64.split(';base64,').pop();
        
        // Create temporary file
        const tempFilePath = path.join(process.cwd(), 'uploads', `temp-${Date.now()}-${thumbnailFilename}`);
        
        // Ensure directory exists
        if (!existsSync(path.dirname(tempFilePath))) {
          mkdirSync(path.dirname(tempFilePath), { recursive: true });
        }
        
        // Write buffer to temporary file
        writeFileSync(tempFilePath, Buffer.from(base64Data, 'base64'));
        
        // Upload to Cloudinary
        const thumbnailResult = await cloudinary.uploader.upload(tempFilePath, {
          folder: 'video-stream-app-thumbnails',
          transformation: [
            { width: 300, height: 200, crop: "fill" },
            { fetch_format: "auto" },
            { quality: "auto" }
          ]
        });
        
        // Add thumbnail URL to update data
        updateData.thumbnailPath = thumbnailResult.secure_url;
        
        // Clean up the temporary file
        unlinkSync(tempFilePath);
      } catch (thumbnailError) {
        console.error('Error processing thumbnail:', thumbnailError);
        return res.status(500).json({ message: 'Error processing thumbnail', error: thumbnailError.message });
      }
    }
    
    // Update video in database
    const updatedVideo = await _video.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
    
    res.status(200).json(updatedVideo);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ message: 'Error updating video', error: error.message });
  }
}

// Delete video
export async function deleteVideo(req, res) {
  try {
    const { id } = req.params;
    
    // Check if video exists and belongs to user
    const existingVideo = await _video.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (existingVideo.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete from Cloudinary
    const videoPublicId = existingVideo.filePath.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' });

    if (existingVideo.thumbnailPath) {
      const thumbnailPublicId = existingVideo.thumbnailPath.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(thumbnailPublicId);
    }

    // Delete from database
    await _video.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Error deleting video', error: error.message });
  }
}