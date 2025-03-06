import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Upload, Save } from 'lucide-react';
import useVideoStore from '../store/useVideoStore';


const VideoEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    fetchVideoById, 
    updateVideo, 
    loading, 
    error 
  } = useVideoStore();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  // Validation state
  const [errors, setErrors] = useState({});

  // Fetch video details on component mount
  useEffect(() => {
    const fetchVideo = async () => {
      const video = await fetchVideoById(parseInt(id));
      if (video) {
        setTitle(video.title);
        setDescription(video.description || '');
        setTags(video.tags ? video.tags.join(', ') : '');
        setThumbnailPreview(video.thumbnailPath);
      }
    };

    fetchVideo();
  }, [id, fetchVideoById]);

  // Thumbnail file handling
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const videoData = {
        id: parseInt(id),
        title,
        description,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        thumbnailFile: thumbnail
      };

      await updateVideo(id,videoData);
      navigate(`/videos/${id}`);
    } catch (err) {
      console.error('Video update failed:', err);
      setErrors({ submit: 'Failed to update video. Please try again.' });
    }
  };

  // Cancel editing
  const handleCancel = () => {
    navigate(`/videos/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-100 border border-red-400 rounded">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Video</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thumbnail Upload */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Thumbnail
          </label>
          <div className="flex items-center space-x-4">
            {thumbnailPreview && (
              <img 
                src={thumbnailPreview} 
                alt="Thumbnail preview" 
                className="w-32 h-20 object-cover rounded"
              />
            )}
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2">
                <Upload size={18} />
                <span>Upload Thumbnail</span>
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailChange}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Enter video title"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Describe your video"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Tags Input */}
        <div>
          <label htmlFor="tags" className="block mb-2 text-sm font-medium text-gray-700">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tags (e.g., tutorial, coding, react)"
          />
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {errors.submit}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <X size={18} />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Save size={18} />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoEdit;