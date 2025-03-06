import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const VideoCard = ({ video, compact = false }) => {
  // Format view count
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views;
  };

  // Format date to relative time (e.g. "2 days ago")
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    } else {
      const diffYears = Math.floor(diffDays / 365);
      return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
    }
  };

  if (compact) {
    return (
      <Link to={`/videos/${video.id}`} className="block group">
        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative mb-2">
          {video.thumbnailPath ? (
            <img 
              src={video.thumbnailPath} 
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatViews(video.views)} views
          </div>
        </div>
        <h3 className="text-sm font-medium truncate">{video.title}</h3>
        <p className="text-xs text-gray-500">{getRelativeTime(video.createdAt)}</p>
      </Link>
    );
  }

  return (
    <Link to={`/videos/${video.id}`} className="block group">
      <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative mb-3">
        {video.thumbnailPath ? (
          <img 
            src={video.thumbnailPath} 
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {formatViews(video.views)} views
        </div>
      </div>
      <h3 className="text-lg font-medium mb-1 line-clamp-2">{video.title}</h3>
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <span className="font-medium">{video.user.username}</span>
        <span className="mx-1">•</span>
        <span>{getRelativeTime(video.createdAt)}</span>
      </div>
      {video.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
      )}
    </Link>
  );
};


// Define PropTypes
VideoCard.propTypes = {
  video: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    filePath: PropTypes.string.isRequired,
    thumbnailPath: PropTypes.string,
    views: PropTypes.number.isRequired,
    userId: PropTypes.number.isRequired,
    user: PropTypes.shape({
      id: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
    }).isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  compact: PropTypes.bool,
};

export default VideoCard;