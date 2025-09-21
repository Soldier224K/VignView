import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { 
  FaCamera, 
  FaMapMarkerAlt, 
  FaUpload, 
  FaTrash, 
  FaSpinner,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { issuesAPI, getCurrentLocation, reverseGeocode } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ReportIssue = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      latitude: '',
      longitude: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  const categories = [
    { value: 'pothole', label: 'Pothole', icon: '🕳️' },
    { value: 'garbage', label: 'Garbage', icon: '🗑️' },
    { value: 'sewage', label: 'Sewage', icon: '💧' },
    { value: 'street_light', label: 'Street Light', icon: '💡' },
    { value: 'traffic_signal', label: 'Traffic Signal', icon: '🚦' },
    { value: 'road_damage', label: 'Road Damage', icon: '🛣️' },
    { value: 'water_leak', label: 'Water Leak', icon: '💧' },
    { value: 'illegal_dumping', label: 'Illegal Dumping', icon: '🚛' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  const getCurrentLocationHandler = async () => {
    setIsGettingLocation(true);
    try {
      const position = await getCurrentLocation();
      setLocation(position);
      
      setValue('latitude', position.latitude);
      setValue('longitude', position.longitude);
      
      // Get address from coordinates
      const addressData = await reverseGeocode(position.latitude, position.longitude);
      setValue('address', addressData.address);
      setValue('city', addressData.city);
      setValue('state', addressData.state);
      setValue('pincode', addressData.pincode);
      
      toast.success('Location detected successfully!');
    } catch (error) {
      console.error('Location error:', error);
      toast.error('Failed to get location. Please enter manually.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Analyze first image with AI
    if (acceptedFiles.length > 0 && acceptedFiles[0].type.startsWith('image/')) {
      analyzeImageWithAI(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const analyzeImageWithAI = async (file) => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // This would call your AI service
      // const response = await fetch('/api/ai/analyze', {
      //   method: 'POST',
      //   body: formData
      // });
      // const result = await response.json();
      
      // Simulate AI analysis for demo
      setTimeout(() => {
        const mockAnalysis = {
          detected_issues: [
            { type: 'pothole', confidence: 0.85 },
            { type: 'garbage', confidence: 0.72 }
          ],
          confidence: 0.78,
          processing_time: 1.2
        };
        setAiAnalysis(mockAnalysis);
        setIsAnalyzing(false);
        toast.success('AI analysis completed!');
      }, 2000);
      
    } catch (error) {
      console.error('AI analysis error:', error);
      setIsAnalyzing(false);
      toast.error('AI analysis failed');
    }
  };

  const onSubmit = async (data) => {
    if (!isAuthenticated && !user?.isAnonymous) {
      toast.error('Please login or use anonymous mode to report issues');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one photo or video');
      return;
    }

    setIsSubmitting(true);
    try {
      const issueData = {
        ...data,
        media: uploadedFiles.map(f => f.file)
      };

      const response = await issuesAPI.createIssue(issueData);
      
      if (response.data.success) {
        toast.success('Issue reported successfully!');
        reset();
        setUploadedFiles([]);
        setAiAnalysis(null);
        navigate(`/issues/${response.data.data.issue.id}`);
      }
    } catch (error) {
      console.error('Report issue error:', error);
      const message = error.response?.data?.message || 'Failed to report issue';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Report a Civic Issue
          </h1>
          <p className="text-gray-600">
            Help improve your community by reporting issues that need attention.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-primary-600" />
              Basic Information
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Brief description of the issue"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Provide more details about the issue..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-primary-600" />
              Location
            </h2>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={getCurrentLocationHandler}
                disabled={isGettingLocation}
                className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGettingLocation ? (
                  <FaSpinner className="mr-2 animate-spin" />
                ) : (
                  <FaMapMarkerAlt className="mr-2" />
                )}
                {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('latitude', { required: 'Latitude is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 28.6139"
                />
                {errors.latitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('longitude', { required: 'Longitude is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 77.2090"
                />
                {errors.longitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                {...register('address')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Street address or landmark"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  {...register('city')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  {...register('state')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  {...register('pincode')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Pincode"
                />
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FaCamera className="mr-2 text-primary-600" />
              Photos & Videos
            </h2>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...getInputProps()} ref={fileInputRef} />
              <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-primary-600">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop photos/videos here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: JPG, PNG, GIF, MP4, MOV (Max 10MB each, up to 5 files)
                  </p>
                </div>
              )}
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      {file.file.type.startsWith('image/') ? (
                        <img
                          src={file.preview}
                          alt="Upload preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaCamera className="text-4xl text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* AI Analysis Results */}
            {isAnalyzing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FaSpinner className="animate-spin text-blue-600 mr-3" />
                  <span className="text-blue-800">Analyzing image with AI...</span>
                </div>
              </div>
            )}

            {aiAnalysis && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <FaCheck className="text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">AI Analysis Results</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-green-700">
                    Confidence: {(aiAnalysis.confidence * 100).toFixed(1)}%
                  </p>
                  <div className="space-y-1">
                    {aiAnalysis.detected_issues.map((issue, index) => (
                      <div key={index} className="flex items-center text-sm text-green-700">
                        <FaExclamationTriangle className="mr-2" />
                        {issue.type}: {(issue.confidence * 100).toFixed(1)}%
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Reporting...
                </>
              ) : (
                'Report Issue'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ReportIssue;