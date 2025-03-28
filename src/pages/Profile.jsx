import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';

const skillCategories = {
  'Programming Languages': [
    'JavaScript', 'Python', 'Java', 'C++', 'Ruby', 'PHP', 'Swift', 'Go', 'Rust',
    'TypeScript', 'C#', 'Kotlin', 'Scala'
  ],
  'Web Technologies': [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask',
    'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'MongoDB', 'PostgreSQL'
  ],
  'Cloud & DevOps': [
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
    'CI/CD', 'Linux', 'Terraform', 'Ansible'
  ],
  'AI & Data Science': [
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Analysis',
    'Computer Vision', 'NLP', 'Statistics', 'Big Data', 'SQL'
  ],
  'Soft Skills': [
    'Communication', 'Leadership', 'Problem Solving', 'Team Work', 'Time Management',
    'Critical Thinking', 'Adaptability', 'Creativity'
  ]
};

const Profile = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    username: '',
    location: '',
    education: '',
    experience: '',
    qualifications: [],
    specialization: [],
    bio: '',
    skills: [],
    socialLinks: {
      linkedin: '',
      github: '',
      website: ''
    }
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profiles/profile/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else if (['qualifications', 'specialization'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim())
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const saveSkills = async () => {
    await saveProfile(false);
  };

  const saveProfile = async (showToast = true) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/profiles/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          clerkId: user.id,
          email: user.primaryEmailAddress.emailAddress
        }),
      });

      if (response.ok) {
        if (showToast) {
          toast.success('Profile updated successfully');
        }
        fetchProfile();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveProfile(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="mt-4 md:mt-0 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>Save All Changes</>
              )}
            </motion.button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2.5 px-3 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 
                    dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 
                    dark:focus:ring-primary-400"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="mentee">Mentee</option>
                    <option value="mentor">Mentor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2.5 px-3 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 
                    dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 
                    dark:focus:ring-primary-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2.5 px-3 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 
                    dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 
                    dark:focus:ring-primary-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Education *</label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2.5 px-3 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 
                    dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 
                    dark:focus:ring-primary-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                {formData.role === 'mentor' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Experience *</label>
                      <textarea
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        rows="4"
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2.5 px-3 
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 
                        dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 
                        dark:focus:ring-primary-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Qualifications *</label>
                      <input
                        type="text"
                        name="qualifications"
                        value={formData.qualifications.join(', ')}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2.5 px-3 
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 
                        dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 
                        dark:focus:ring-primary-400"
                        placeholder="Enter qualifications separated by commas"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Specialization *</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization.join(', ')}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2.5 px-3 
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 
                        dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 
                        dark:focus:ring-primary-400"
                        placeholder="Enter specializations separated by commas"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2.5 px-3 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 
                    dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 
                    dark:focus:ring-primary-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Skills</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={saveSkills}
                disabled={isSaving}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg shadow-sm transition-all duration-200 flex items-center"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>Save Skills</>
                )}
              </motion.button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <Tab.Group>
                <Tab.List className="flex space-x-2 rounded-xl bg-gray-200 dark:bg-gray-800 p-1 mb-4">
                  {Object.keys(skillCategories).map((category) => (
                    <Tab
                      key={category}
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none transition-all duration-200
                        ${selected
                          ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-400 shadow-md'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.7] dark:hover:bg-gray-600 hover:text-primary-600'
                        }`
                      }
                    >
                      {category}
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels>
                  {Object.entries(skillCategories).map(([category, skills]) => (
                    <Tab.Panel
                      key={category}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                    >
                      {skills.map((skill) => (
                        <motion.button
                          key={skill}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleSkill(skill)}
                          className={`p-2.5 rounded-lg text-sm font-medium transition-colors duration-200
                            ${formData.skills.includes(skill)
                              ? 'bg-primary-500 dark:bg-primary-600 text-white dark:text-white border-2 border-primary-500 dark:border-primary-600'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400'
                            }`}
                        >
                          {skill}
                        </motion.button>
                      ))}
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </Tab.Group>
            </div>
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p>Selected skills: {formData.skills.length > 0 ? formData.skills.join(', ') : 'None'}</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">LinkedIn</label>
                <input
                  type="url"
                  name="socialLinks.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2.5 px-3 
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 
                  dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 
                  dark:focus:ring-primary-400"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">GitHub</label>
                <input
                  type="url"
                  name="socialLinks.github"
                  value={formData.socialLinks.github}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2.5 px-3 
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 
                  dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 
                  dark:focus:ring-primary-400"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Personal Website</label>
                <input
                  type="url"
                  name="socialLinks.website"
                  value={formData.socialLinks.website}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2.5 px-3 
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 
                  dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 
                  dark:focus:ring-primary-400"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Submit Button - Hidden since we have the top button */}
          <div className="flex justify-end">
            <button type="submit" className="hidden">Save Profile</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
