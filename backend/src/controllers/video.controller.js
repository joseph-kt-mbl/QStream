import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma.js';

const _video = prisma.video;
// console.log('\n\n\n\n\n\n\nn\===========\n\nvideo controller => ',  prisma.user);
import { unlinkSync } from 'fs';
import { v2 as cloudinary } from 'cloudinary';


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload video function
export async function uploadVideo(req, res) {
  try {
    console.log('Received request to upload video');

    const { title, description , duration } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ message: 'No video file uploaded!' });
    }

    console.log('Uploading video to Cloudinary...');
    const uploadResult = await cloudinary.uploader.upload(videoFile.path, {
      resource_type: 'video',
      folder: 'video-stream-app',
    });

    console.log('Video uploaded:', uploadResult);

    // Generate a thumbnail using Cloudinary
    console.log('Generating thumbnail...');
    const thumbnailUrl = cloudinary.url(uploadResult.public_id + '.jpg', {
      resource_type: 'video',
      transformation: [{ start_offset: "3", width: 300, crop: "scale" }],
    });

    console.log('Thumbnail generated:', thumbnailUrl);

    // Clean up local video file
   if (videoFile && videoFile.path) {
    try {
      unlinkSync(videoFile.path);
      console.log('Temporary video file removed');
    } catch (error) {
      console.error('Error deleting video file:', error);
    }
  }

    // Save video details to database
    const video = await prisma.video.create({
      data: {
        title,
        description,
        filePath: uploadResult.secure_url,
        thumbnailPath: thumbnailUrl,
        userId: req.user.id,
        duration: parseFloat(duration),
      },
    });

    console.log('Video saved:', video);
    res.status(201).json(video);
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Error uploading video', error: error.message });
  }
}
export async function saveWatchedTime(req, res) {
  try {
    const { videoId, watchedTime } = req.body;
    const userId = req.user.id;

    const updatedWatch = await prisma.watchedVideo.upsert({
      where: { userId_videoId: { userId, videoId } },
      update: { watchedTime: Math.max(watchedTime, 0) },
      create: { userId, videoId, watchedTime },
    });

    res.status(200).json(updatedWatch);
  } catch (error) {
    console.error('Error saving watched time:', error);
    res.status(500).json({ message: 'Error saving watched time' });
  }
}

export async function getWatchedTime(req, res) {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const watchedVideo = await prisma.watchedVideo.findUnique({
      where: { userId_videoId: { userId, videoId: parseInt(videoId) } },
    });

    if (!watchedVideo) {
      return res.status(200).json({ watchedTime: 0, message: "No watched time recorded" });
    }

    res.status(200).json({ watchedTime: watchedVideo.watchedTime });
  } catch (error) {
    console.error("Error fetching watched time:", error);
    res.status(500).json({ message: "Error fetching watched time" });
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
    console.log(video)

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

