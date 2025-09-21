import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaMapMarkerAlt, 
  FaCamera, 
  FaTrophy, 
  FaUsers, 
  FaChartLine,
  FaMobileAlt,
  FaRobot,
  FaSatelliteDish,
  FaDrone
} from 'react-icons/fa';
import { issuesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, issuesResponse] = await Promise.all([
          issuesAPI.getStats(),
          issuesAPI.getIssues({ limit: 6, sortBy: 'created_at', sortOrder: 'desc' })
        ]);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.data.stats);
        }

        if (issuesResponse.data.success) {
          setRecentIssues(issuesResponse.data.data.issues);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: <FaMapMarkerAlt className="w-8 h-8" />,
      title: "Report Issues",
      description: "Easily report civic issues with photos, location, and AI-powered detection",
      color: "bg-blue-500"
    },
    {
      icon: <FaTrophy className="w-8 h-8" />,
      title: "Gamification",
      description: "Earn points, unlock achievements, and compete on leaderboards",
      color: "bg-yellow-500"
    },
    {
      icon: <FaChartLine className="w-8 h-8" />,
      title: "Track Progress",
      description: "Monitor the status of your reported issues in real-time",
      color: "bg-green-500"
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: "Community",
      description: "Join thousands of citizens making their cities better",
      color: "bg-purple-500"
    }
  ];

  const phases = [
    {
      phase: "Phase 1",
      title: "Civic Reporting App",
      description: "Mobile app and website for issue reporting with AI detection",
      icon: <FaMobileAlt className="w-6 h-6" />,
      status: "completed",
      features: ["Issue Reporting", "AI Detection", "Gamification", "Progress Tracking"]
    },
    {
      phase: "Phase 2",
      title: "Camera Network",
      description: "Integration with traffic cameras and police van feeds",
      icon: <FaCamera className="w-6 h-6" />,
      status: "upcoming",
      features: ["CCTV Integration", "Police Van Cameras", "Dashcam Integration", "Local CCTV"]
    },
    {
      phase: "Phase 3",
      title: "Drone Surveillance",
      description: "Automated drone network for comprehensive monitoring",
      icon: <FaDrone className="w-6 h-6" />,
      status: "upcoming",
      features: ["Self-Manufactured Drones", "Market Drones", "On-Demand Scanning"]
    },
    {
      phase: "Phase 4",
      title: "Satellite Imagery",
      description: "High-definition satellite data for large-scale analysis",
      icon: <FaSatelliteDish className="w-6 h-6" />,
      status: "upcoming",
      features: ["ISRO Integration", "Change Detection", "GIS Mapping"]
    },
    {
      phase: "Phase 5",
      title: "Data Integration",
      description: "Centralized platform with real-time dashboards",
      icon: <FaChartLine className="w-6 h-6" />,
      status: "upcoming",
      features: ["Centralized Data", "Real-time Dashboards", "Public Portal"]
    },
    {
      phase: "Phase 6",
      title: "Smart Governance",
      description: "Full automation with predictive analytics",
      icon: <FaRobot className="w-6 h-6" />,
      status: "upcoming",
      features: ["AI Predictions", "IoT Sensors", "Automated Workflows"]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'current': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              VighnView
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Smart Civic Monitoring Platform
            </p>
            <p className="text-lg mb-12 text-primary-200 max-w-3xl mx-auto">
              Transform civic issue reporting from reactive to proactive through AI-powered detection, 
              gamification, and multi-source data integration. Making cities smarter, one report at a time!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/report"
                    className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                  >
                    Report an Issue
                  </Link>
                  <Link
                    to="/dashboard"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                  >
                    View Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stats.total_issues || 0}
                </div>
                <div className="text-gray-600">Issues Reported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                  {stats.resolved || 0}
                </div>
                <div className="text-gray-600">Issues Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-600 mb-2">
                  {stats.potholes || 0}
                </div>
                <div className="text-gray-600">Potholes Fixed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                  {stats.garbage || 0}
                </div>
                <div className="text-gray-600">Garbage Cleaned</div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose VighnView?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with community engagement 
              to create a comprehensive civic monitoring solution.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`${feature.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Issues Section */}
      {recentIssues.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Recent Issues
              </h2>
              <p className="text-xl text-gray-600">
                See what your community is reporting
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentIssues.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      issue.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {issue.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {issue.description || 'No description provided'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 capitalize">
                      {issue.category.replace('_', ' ')}
                    </span>
                    <Link
                      to={`/issues/${issue.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/issues"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                View All Issues
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Roadmap Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Development Roadmap
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our journey from basic reporting to full smart governance automation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {phases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white mr-4 ${
                    phase.status === 'completed' ? 'bg-green-500' :
                    phase.status === 'current' ? 'bg-blue-500' :
                    'bg-gray-400'
                  }`}>
                    {phase.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">{phase.phase}</div>
                    <h3 className="text-lg font-semibold text-gray-900">{phase.title}</h3>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{phase.description}</p>
                
                <div className="mb-4">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(phase.status)}`}>
                    {phase.status}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {phase.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
              Join thousands of citizens who are already using VighnView to improve their communities.
            </p>
            
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
                  Start Reporting Issues
                </Link>
                <Link
                  to="/leaderboard"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  View Leaderboard
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;