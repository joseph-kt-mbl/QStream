import { useMemo } from 'react';
import useVideoStore from '../store/useVideoStore';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const VideoCard = ({ video, compact = false }) => {
    const { watchedTimes, fetchWatchedTime } = useVideoStore();

    const watchedPercentage = useMemo(() => {
        console.log("Calculating watched percentage...");
        console.log("Duration:", video.duration, "watchedTime:", watchedTimes[video.id]);

        if (!video.duration || video.duration === 0) return 0;
        
        const watchedTime = watchedTimes[video.id] || 0;
        const percentage = (watchedTime / video.duration) * 100;
        return Math.min(percentage, 100);
    }, [video.duration, watchedTimes[video.id]]);

    const getWatchStatusLabel = () => {
        if (watchedPercentage >= 95) return "Watched";
        if (watchedPercentage > 0) return "In progress";
        return null;
    };

    return (
        <Link to={`/videos/${video.id}`} className="block group">
            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
                {video.thumbnailPath ? (
                    <img 
                        src={video.thumbnailPath} 
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                        <video src={video.filePath} className="hidden" preload="metadata" />
                    </div>
                )}
                
                {/* Watched progress bar */}
                {watchedPercentage > 0 && (
                    <div className="absolute bottom-0 left-0 h-1 bg-blue-500" style={{ width: `${watchedPercentage}%` }}></div>
                )}
                
                {/* Watched indicator */}
                {getWatchStatusLabel() && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {getWatchStatusLabel()}
                    </div>
                )}

                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.views} views
                </div>
            </div>

            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="text-lg font-medium mb-1 line-clamp-2">{video.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="font-medium">{video?.user?.username}</span>
                        <span className="mx-1">•</span>
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                    {!compact && video.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                    )}
                </div>

                {/* Video duration display */}
                <div className="text-xs text-gray-500">
                    {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')} min
                </div>
            </div>
        </Link>
    );
};

VideoCard.propTypes = {
    video: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        filePath: PropTypes.string.isRequired,
        thumbnailPath: PropTypes.string,
        views: PropTypes.number.isRequired,
        userId: PropTypes.number,
        duration: PropTypes.number, // Now we support duration from DB
        user: PropTypes.shape({
            id: PropTypes.number,
            username: PropTypes.string,
        }),
        createdAt: PropTypes.string.isRequired,
    }).isRequired,
    compact: PropTypes.bool,
};

export default VideoCard;