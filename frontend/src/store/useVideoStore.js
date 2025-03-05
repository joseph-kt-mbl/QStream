import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

const useVideoStore = create((set) => ({
  videos: [],
  userVideos: [],
  currentVideo: null,
  loading: false,
  error: null,
  
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
  uploadVideo: async (videoData, token) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('title', videoData.title);
      formData.append('description', videoData.description || '');
      formData.append('video', videoData.file);
      
      const response = await axiosInstance.post(`/videos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
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
  updateVideo: async (id, videoData, token) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(`/videos/${id}`, videoData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
  deleteVideo: async (id, token) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/videos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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