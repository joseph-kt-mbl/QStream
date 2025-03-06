import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import useVideoStore from '../store/useVideoStore';


const HomePage = () => {
  const { videos, fetchVideos, loading, error } = useVideoStore();
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [popularVideos, setPopularVideos] = useState([]);
  console.log({videos})

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    if (videos.length > 0) {
      // Get recent videos (sorted by creation date)
      const recent = [...videos].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 6);
      setRecentVideos(recent);
      
      // Get popular videos (sorted by views)
      const popular = [...videos].sort((a, b) => b.views - a.views).slice(0, 6);
      setPopularVideos(popular);
      
      // Get featured videos (could be a random selection or based on criteria)
      // For now, let's use the most viewed video and some recent ones
      if (videos.length > 4) {
        setFeaturedVideos([videos.sort((a, b) => b.views - a.views)[0], ...recent.slice(0, 3)]);
      } else {
        setFeaturedVideos(videos);
      }
    }
  }, [videos]);

  if (loading && videos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 h-80 mb-12">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 h-full flex flex-col justify-center px-8 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Share Your World</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-xl">Upload, watch, and share videos with creators around the globe.</p>
          <div>
            <Link 
              to="/upload-video" 
              className="bg-white text-blue-600 hover:bg-blue-100 px-6 py-3 rounded-lg font-semibold transition-colors mr-4"
            >
              Start Creating
            </Link>
            <Link 
              to="/videos" 
              className="bg-transparent hover:bg-white/20 border-2 border-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
            >
              Explore Videos
            </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-6 -right-12 w-64 h-64 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Featured Videos */}
      {featuredVideos.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Videos */}
      {recentVideos.length > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recently Added</h2>
            <Link to="/videos" className="text-blue-600 hover:text-blue-800 font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentVideos.map(video => (
              <VideoCard key={video.id} video={video} compact />
            ))}
          </div>
        </section>
      )}

      {/* Popular Videos */}
      {popularVideos.length > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Popular Now</h2>
            <Link to="/videos" className="text-blue-600 hover:text-blue-800 font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularVideos.map(video => (
              <VideoCard key={video.id} video={video} compact />
            ))}
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="bg-gray-100 rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to share your story?</h2>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Join our community of creators and start sharing your videos today. It's free and takes just a minute to get started.
        </p>
        <Link 
          to="/upload-video" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
        >
          Upload Your First Video
        </Link>
      </section>
    </div>
  );
};

export default HomePage;