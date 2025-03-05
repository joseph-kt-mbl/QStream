import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {useAuthStore} from '../store/useAuthStore.js';
import useVideoStore from '../store/useVideoStore.js';


const VideoUpload = () => {
  const navigate = useNavigate();
  const { uploadVideo, loading, error, clearError } = useVideoStore();
  const { token } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      // Revoke object URL to free memory
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert('Please upload a valid video file');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      alert('Please select a video file');
      return;
    }

    let isMounted = true;

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (!isMounted) return prev;
          const newProgress = prev + 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      await uploadVideo({ title, description, file: videoFile }, token);

      if (isMounted) {
        clearInterval(progressInterval);
        setProgress(100);

        // Reset form
        setTitle('');
        setDescription('');
        setVideoFile(null);
        setPreviewUrl('');
        setProgress(0);

        setTimeout(() => {
          navigate('/videos');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      isMounted = false;
    }
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert('Please upload a valid video file');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upload Video</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
          <button onClick={clearError} className="text-sm underline">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video upload area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer h-64 ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <video
              src={previewUrl}
              className="h-full max-w-full rounded"
              controls
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-gray-600 mb-2">Drag and drop your video here</p>
              <p className="text-gray-500 text-sm">or click to browse</p>
              {loading && <p className="text-blue-500 mt-2">Uploading... {progress}%</p>}
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
          />
        </div>

        {/* Progress bar */}
        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Video details */}
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter video title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter video description"
              rows={3}
            ></textarea>
          </div>
        </div>

        {/* Upload button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 text-white font-semibold rounded-md ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;
