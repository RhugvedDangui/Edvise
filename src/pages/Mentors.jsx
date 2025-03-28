import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Mentors = () => {
  const { user } = useUser();
  const [suggestedMentors, setSuggestedMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestedMentors();
  }, [user]);

  const fetchSuggestedMentors = async () => {
    try {
      const response = await fetch(`/api/connections/suggested-mentors/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestedMentors(data);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Failed to fetch mentors');
    } finally {
      setLoading(false);
    }
  };

  const searchMentors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/connections/search-mentors?query=${searchQuery}&userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestedMentors(data);
      }
    } catch (error) {
      console.error('Error searching mentors:', error);
      toast.error('Failed to search mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (mentorId) => {
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
        toast.success('Connected with mentor successfully');
        fetchSuggestedMentors();
      }
    } catch (error) {
      console.error('Error connecting with mentor:', error);
      toast.error('Failed to connect with mentor');
    }
  };

  const handleDisconnect = async (mentorId) => {
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
        toast.success('Disconnected from mentor');
        fetchSuggestedMentors();
      }
    } catch (error) {
      console.error('Error disconnecting from mentor:', error);
      toast.error('Failed to disconnect from mentor');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Find Mentors</h1>
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mentors by name or skills..."
              className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm 
                focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && searchMentors()}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={searchMentors}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Search
            </motion.button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestedMentors.map((mentor) => (
              <div
                key={mentor.clerkId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {mentor.username}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {mentor.skills.slice(0, 3).join(', ')}
                      {mentor.skills.length > 3 && ' ...'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    to={`/mentor/${mentor.clerkId}`}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 
                      dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 
                      focus:outline-none text-center"
                  >
                    View Profile
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => mentor.connectionStatus === 'connected' 
                      ? handleDisconnect(mentor.clerkId)
                      : handleConnect(mentor.clerkId)
                    }
                    className={`flex-1 px-4 py-2 rounded-md focus:outline-none ${
                      mentor.connectionStatus === 'connected'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {mentor.connectionStatus === 'connected' ? 'Disconnect' : 'Connect'}
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentors;
