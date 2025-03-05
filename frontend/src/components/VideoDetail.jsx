import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import VideoCard from './VideoCard';
import useVideoStore from '../store/useVideoStore';
import { useAuthStore } from '../store/useAuthStore';

const VideoDetail = () => {
  const { id } = useParams();
  const { 
    fetchVideoById, 
    currentVideo, 
    loading, 
    error,
    videos,
    fetchVideos, 
    deleteVideo 
  } = useVideoStore();
  const { authUser, isAuthenticated } = useAuthStore();
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchVideoById(parseInt(id));
    
    if (videos.length === 0) {
      fetchVideos();
    }
  }, [id, fetchVideoById, videos.length, fetchVideos]);

  useEffect(() => {
    if (videos.length > 0 && currentVideo) {
      // Find related videos (excluding current video)
      // In a real app, you might want to implement more sophisticated recommendation logic
      const related = videos
        .filter(video => video.id !== currentVideo.id)
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
      
      setRelatedVideos(related);
    }
  }, [videos, currentVideo]);

  const handleDeleteVideo = async () => {
    try {
      await deleteVideo(currentVideo.id, authUser.token);
      // Redirect to videos page after deletion
      window.location.href = '/videos';
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && !currentVideo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Video not found</h2>
        <p className="mb-6">{`The video you're looking for doesn't exist or has been removed.`}</p>
        <Link 
          to="/videos" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Browse Videos
        </Link>
      </div>
    );
  }

  const isOwner = authUser?.id === currentVideo.user.id;
  
  console.log("isAuthenticated => ", isAuthenticated)
  console.log("user id => ", authUser.id)
  console.log("currentVideo user id => ", currentVideo.user.id)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Video player and details */}
        <div className="w-full lg:w-8/12">
          <div className="bg-black rounded-xl overflow-hidden">
            <VideoPlayer video={currentVideo} />
          </div>
          
          <div className="mt-6">
            <h1 className="text-2xl font-bold mb-2">{currentVideo.title}</h1>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <span>{currentVideo.views.toLocaleString()} views</span>
                <span>•</span>
                <span>{formatDate(currentVideo.createdAt)}</span>
              </div>
              
              {isOwner && (
                <div className="flex space-x-2">
                  <Link 
                    to={`/videos/${currentVideo.id}/edit`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
              <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xl font-bold">
                {currentVideo.user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-medium">{currentVideo.user.username}</h3>
              </div>
            </div>
            
            {currentVideo.description && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{currentVideo.description}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Related videos */}
        <div className="w-full lg:w-4/12">
          <h3 className="text-lg font-medium mb-4">Related Videos</h3>
          
          {relatedVideos.length > 0 ? (
            <div className="space-y-4">
              {relatedVideos.map(video => (
                <div key={video.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No related videos found</p>
          )}
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Delete Video</h3>
            <p className="mb-6">
              {`Are you sure you want to delete "${currentVideo.title}"? This action cannot be undone.`}
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteVideo}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDetail;