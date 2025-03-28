import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const MentorProfile = () => {
  const { mentorId } = useParams();
  const { user } = useUser();
  const [mentor, setMentor] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorProfile();
    fetchConnectionStatus();
  }, [mentorId]);

  const fetchMentorProfile = async () => {
    try {
      const response = await fetch(`/api/profiles/profile/${mentorId}`);
      if (response.ok) {
        const data = await response.json();
        setMentor(data);
      }
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
      toast.error('Failed to fetch mentor profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch(`/api/connections/suggested-mentors/${user.id}`);
      if (response.ok) {
        const mentors = await response.json();
        const currentMentor = mentors.find(m => m.clerkId === mentorId);
        setConnectionStatus(currentMentor?.connectionStatus || null);
      }
    } catch (error) {
      console.error('Error fetching connection status:', error);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/connections/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menteeId: user.id,
          mentorId
        }),
      });

      if (response.ok) {
        setConnectionStatus('connected');
        toast.success('Connected with mentor successfully');
      }
    } catch (error) {
      console.error('Error connecting with mentor:', error);
      toast.error('Failed to connect with mentor');
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/connections/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menteeId: user.id,
          mentorId
        }),
      });

      if (response.ok) {
        setConnectionStatus(null);
        toast.success('Disconnected from mentor');
      }
    } catch (error) {
      console.error('Error disconnecting from mentor:', error);
      toast.error('Failed to disconnect from mentor');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">
          Mentor not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {mentor.username}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{mentor.email}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={connectionStatus === 'connected' ? handleDisconnect : handleConnect}
            className={`px-6 py-2 rounded-md focus:outline-none ${
              connectionStatus === 'connected'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {connectionStatus === 'connected' ? 'Disconnect' : 'Connect'}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{mentor.bio}</p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Location</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{mentor.location}</p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Experience</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{mentor.experience}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {mentor.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Education</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{mentor.education}</p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Social Links</h2>
            <div className="space-y-2">
              {mentor.socialLinks?.linkedin && (
                <a
                  href={mentor.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary-600 dark:text-primary-400 hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {mentor.socialLinks?.github && (
                <a
                  href={mentor.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary-600 dark:text-primary-400 hover:underline"
                >
                  GitHub
                </a>
              )}
              {mentor.socialLinks?.website && (
                <a
                  href={mentor.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Personal Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;
