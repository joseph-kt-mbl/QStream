import  { useEffect, useState } from 'react';

import VideoCard from './VideoCard';
import useVideoStore from '../store/useVideoStore';

const VideoList = () => {
  const { videos, fetchVideos, loading, error } = useVideoStore();
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    // Filter videos based on search query
    let filtered = videos;
    if (searchQuery) {
      filtered = videos.filter(video => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort videos based on selected option
    switch (sortBy) {
      case 'newest':
        filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered = [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'popular':
        filtered = [...filtered].sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }

    setFilteredVideos(filtered);
  }, [videos, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Videos</h1>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="sortBy" className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {loading && videos.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          {searchQuery ? (
            <>
              <h3 className="text-xl font-medium mb-2">No videos found</h3>
              <p className="text-gray-500">
                {`We couldn't find any videos matching "${searchQuery}"`}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium mb-2">No videos available</h3>
              <p className="text-gray-500">
                Be the first to upload a video to our platform!
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-500">
              {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} found
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoList;