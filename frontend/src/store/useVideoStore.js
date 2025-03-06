import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { getVideoDuration } from '../lib/utils';

const useVideoStore = create((set) => ({
  videos: [],
  userVideos: [],
  currentVideo: null,
  loading: false,
  error: null,
  watchedTimes: {},
  
  // Fetch all videos
  fetchVideos: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get('/videos');
      set({ videos: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch videos', 
        loading: false 
      });
    }
  },
  fetchWatchedTime: async (videoId) => {
    try {
      const response = await axiosInstance.get(`/videos/watched/${videoId}`);
      set((state) => ({
        watchedTimes: { ...state.watchedTimes, [videoId]: response.data.watchedTime },
      }));
    } catch (error) {
      console.error('Error fetching watched time:', error);
    }
  },

  saveWatchedTime: async (videoId, watchedTime) => {
    try {
      await axiosInstance.post(`/videos/watched`, { videoId, watchedTime });
      set((state) => ({
        watchedTimes: { ...state.watchedTimes, [videoId]: watchedTime },
      }));
    } catch (error) {
      console.error('Error saving watched time:', error);
    }
  },
  // Fetch video by ID
  fetchVideoById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/videos/${id}`);
      set({ currentVideo: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch video', 
        loading: false 
      });
    }
  },
  
  // Fetch user's videos
  fetchUserVideos: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/videos/user/${userId}`);
      set({ userVideos: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch user videos', 
        loading: false 
      });
    }
  },
  
  // Upload video
  uploadVideo:async (videoData) => {
    set({ loading: true, error: null });

    try {
        const duration = await getVideoDuration(videoData.file); // ⬅️ Get duration

        const formData = new FormData();
        formData.append('title', videoData.title);
        formData.append('description', videoData.description || '');
        formData.append('video', videoData.file);
        formData.append('duration', duration); // ⬅️ Include duration

        const response = await axiosInstance.post(`/videos/upload`, formData);

        set(state => ({ 
            videos: [response.data, ...state.videos],
            userVideos: [response.data, ...state.userVideos],
            loading: false 
        }));

        return response.data;
    } catch (error) {
        set({ 
            error: error.response?.data?.message || 'Failed to upload video', 
            loading: false 
        });
        throw error;
    }
},
  
  // Update video
updateVideo: async (id, videoData) => {
  set({ loading: true, error: null });
  try {
    // Create a plain object for the update
    const updateData = {
      title: videoData.title,
      description: videoData.description || ''
    };
    
    // If there's a thumbnail file, convert it to base64
    if (videoData.thumbnailFile) {
      // Convert file to base64
      const base64Thumbnail = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(videoData.thumbnailFile);
      });

      console.log('Base64 thumbnail:', base64Thumbnail);
      
      // Add the base64 thumbnail to the update data
      updateData.thumbnailBase64 = base64Thumbnail;
      updateData.thumbnailFilename = videoData.thumbnailFile.name;
    }
    
    // Send regular JSON request
    const response = await axiosInstance.put(`/videos/${id}`, updateData);
    
    set(state => ({
      videos: state.videos.map(video => 
        video.id === response.data.id ? response.data : video
      ),
      userVideos: state.userVideos.map(video => 
        video.id === response.data.id ? response.data : video
      ),
      currentVideo: state.currentVideo?.id === response.data.id ?
        response.data : state.currentVideo,
      loading: false
    }));
    
    return response.data;
  } catch (error) {
    set({
      error: error.response?.data?.message || 'Failed to update video',
      loading: false
    });
    throw error;
  }
},

  
  // Delete video
  deleteVideo: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/videos/${id}`);
      
      set(state => ({
        videos: state.videos.filter(video => video.id !== id),
        userVideos: state.userVideos.filter(video => video.id !== id),
        currentVideo: state.currentVideo?.id === id ? null : state.currentVideo,
        loading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete video', 
        loading: false 
      });
      throw error;
    }
  },

  // Increment video views
  incrementViews: async (id) => {
    try {
      await axiosInstance.post(`/videos/incviews/${id}`);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  },
  
  // Clear errors
  clearError: () => set({ error: null }),
  
  // Reset store
  resetStore: () => set({
    videos: [],
    userVideos: [],
    currentVideo: null,
    loading: false,
    error: null
  })
}));

export default useVideoStore;