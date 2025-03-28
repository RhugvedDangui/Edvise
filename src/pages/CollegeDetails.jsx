import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaStar, FaChalkboardTeacher, FaLaptopCode, FaBriefcase, FaGraduationCap, FaArrowLeft, FaSpinner, FaBook } from 'react-icons/fa';
import { useUser } from '@clerk/clerk-react';

const API_KEY = "AIzaSyAQq6XdpLMpFYGGfnKn-VewRgjJt6EOlPA";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const CategoryTab = ({ active, name, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300'
          : 'bg-gray-100 dark:bg-dark-tertiary text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-secondary'
      }`}
    >
      <span className="ml-2">{name}</span>
    </button>
  );
};

const ReviewItem = ({ review }) => {
  return (
    <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-4 mb-4 border border-transparent hover:border-primary-200 dark:hover:border-primary-900">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg mr-3">
            {review.authorName.charAt(0)}
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white">{review.authorName}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{review.date}</p>
          </div>
        </div>
        <div className="flex items-center bg-gray-100 dark:bg-dark-tertiary px-3 py-1 rounded-full">
          <span className="text-lg font-bold text-gray-800 dark:text-white mr-1">{review.rating}</span>
          <FaStar className="text-yellow-500" />
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-dark-tertiary p-3 rounded-lg border-l-4 border-primary-500 dark:border-primary-700">
        {review.text}
      </p>
    </div>
  );
};

const CollegeDetails = () => {
  const { collegeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const collegeData = location.state?.collegeData;
  const { user } = useUser();
  const [activeCategory, setActiveCategory] = useState('all');
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [syllabusData, setSyllabusData] = useState(null);
  const [syllabusError, setSyllabusError] = useState(null);
  const [admissionData, setAdmissionData] = useState(null);
  const [admissionError, setAdmissionError] = useState(null);
  const [reviewData, setReviewData] = useState({
    curriculum: { rating: 0, text: '' },
    faculty: { rating: 0, text: '' },
    internships: { rating: 0, text: '' },
    placements: { rating: 0, text: '' }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [collegeDetails, setCollegeDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState({
    curriculum: [],
    faculty: [],
    internships: [],
    placements: []
  });
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterCategories = [
    { id: 'all', label: 'All Reviews' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'internships', label: 'Internships' },
    { id: 'placements', label: 'Placements' }
  ];

  // Fetch syllabus data using Gemini API
  const fetchSyllabusData = async () => {
    try {
      setSyllabusError(null);
      const prompt = `Search for the semester-wise subject names of the ${collegeData.courseName} program at ${collegeData.collegeName}${collegeData.location ? `, ${collegeData.location}` : ''}. Look for this information on the college's official website or other reliable academic sources.

If you find the curriculum or syllabus, format it as a JSON object where:
- Keys should be "Semester [Number]" (e.g., "Semester 1")
- Values should be comma-separated lists of subject names
- Include both core subjects and electives
- Include lab courses if available

Respond ONLY with a JSON object in this format:
{
  "Semester 1": "Subject 1, Subject 2, Lab 1",
  "Semester 2": "Subject 3, Subject 4, Lab 2"
}`;

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch syllabus data');
      }

      const data = await response.json();
      const textContent = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const parsedData = JSON.parse(jsonString);
        setSyllabusData(parsedData);
      } else {
        throw new Error('Could not parse syllabus data from response');
      }
    } catch (error) {
      console.error('Error fetching syllabus data:', error);
      setSyllabusError('Failed to fetch syllabus data. Please try again.');
    }
  };

  // Fetch syllabus data when modal is opened
  useEffect(() => {
    if (showSyllabusModal && !syllabusData) {
      fetchSyllabusData();
    }
  }, [showSyllabusModal]);

  // Fetch admission process data using Gemini API
  const fetchAdmissionData = async () => {
    try {
      setAdmissionError(null);
      const prompt = `Provide detailed information about the admission process for ${collegeData.courseName} at ${collegeData.collegeName}${collegeData.location ? `, ${collegeData.location}` : ''}.

Format the response as a JSON object with the following structure:
{
  "admissionProcess": {
    "overview": "Brief overview of the admission process",
    "eligibility": ["List of eligibility criteria"],
    "requiredDocuments": ["List of required documents"],
    "importantDates": {
      "applicationStart": "Approximate start date",
      "applicationEnd": "Approximate end date",
      "resultDeclaration": "Approximate result date"
    },
    "selectionProcess": ["List of selection process steps"],
    "fees": {
      "applicationFee": "Application fee amount",
      "tuitionFee": "Approximate annual tuition fee"
    }
  }
}`;

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admission data');
      }

      const data = await response.json();
      const textContent = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const parsedData = JSON.parse(jsonString);
        setAdmissionData(parsedData);
      } else {
        throw new Error('Could not parse admission data from response');
      }
    } catch (error) {
      console.error('Error fetching admission data:', error);
      setAdmissionError('Failed to fetch admission data. Please try again.');
    }
  };

  // Fetch admission data when modal is opened
  useEffect(() => {
    if (showAdmissionModal && !admissionData) {
      fetchAdmissionData();
    }
  }, [showAdmissionModal]);

  // Fetch college details using Gemini API
  useEffect(() => {
    const fetchCollegeDetails = async () => {
      if (!collegeData) {
        navigate('/reviews');
        return;
      }

      setIsLoading(true);
      try {
        const prompt = `
          I need comprehensive information about ${collegeData.collegeName} offering ${collegeData.courseName} in ${collegeData.location || 'India'}.
          
          Please provide a detailed JSON response with the following structure:
          {
            "collegeDescription": "A detailed 3-4 sentence description of the college including its founding year, reputation, and notable features",
            "curriculum": {
              "overview": "A paragraph about the curriculum structure and approach",
              "strengths": ["List 3-4 strengths of the curriculum"],
              "weaknesses": ["List 2-3 areas that could be improved"],
              "reviews": [
                {
                  "authorName": "A realistic Indian name",
                  "date": "A recent date in DD MMM YYYY format",
                  "rating": A number between 3.5 and 4.8,
                  "text": "A detailed, realistic review about the curriculum (80-120 words)"
                },
                {
                  "authorName": "Another realistic Indian name",
                  "date": "A recent date in DD MMM YYYY format",
                  "rating": A number between 3.2 and 4.9,
                  "text": "Another detailed, realistic review about the curriculum (80-120 words)"
                }
              ]
            },
            "faculty": {
              "overview": "A paragraph about the faculty quality and teaching approach",
              "strengths": ["List 3-4 strengths of the faculty"],
              "weaknesses": ["List 2-3 areas that could be improved"],
              "reviews": [
                {
                  "authorName": "A realistic Indian name",
                  "date": "A recent date in DD MMM YYYY format",
                  "rating": A number between 3.5 and 4.8,
                  "text": "A detailed, realistic review about the faculty (80-120 words)"
                },
                {
                  "authorName": "Another realistic Indian name",
                  "date": "A recent date in DD MMM YYYY format",
                  "rating": A number between 3.2 and 4.9,
                  "text": "Another detailed, realistic review about the faculty (80-120 words)"
                }
              ]
            },
            "internships": {
              "overview": "A paragraph about internship opportunities and industry connections",
              "strengths": ["List 3-4 strengths of the internship program"],
              "weaknesses": ["List 2-3 areas that could be improved"],
              "reviews": [
                {
                  "authorName": "A realistic Indian name",
                  "date": "A recent date in DD MMM YYYY format",
                  "rating": A number between 3.5 and 4.8,
                  "text": "A detailed, realistic review about internships (80-120 words)"
                },
                {
                  "authorName": "Another realistic Indian name",
                  "date": "A recent date in DD MMM YYYY format",
                  "rating": A number between 3.2 and 4.9,
                  "text": "Another detailed, realistic review about internships (80-120 words)"
                }
              ]
            },
            "placements": {
              "overview": "A paragraph about placement opportunities and success rates",
              "strengths": ["List 3-4 strengths of the placement program"],
              "weaknesses": ["List 2-3 areas that could be improved"],
              "reviews": [
                {
                  "authorName": "A realistic Indian name",
                  "date": "A recent date in DD MMM YYYY format",
                  "rating": A number between 3.5 and 4.8,
                  "text": "A detailed, realistic review about placements (80-120 words)"
                },
                {
                  "authorName": "Another realistic Indian name",
                  "date": "A recent date in DD MMM YYYY format",
                  "rating": A number between 3.2 and 4.9,
                  "text": "Another detailed, realistic review about placements (80-120 words)"
                }
              ]
            }
          }
          
          Ensure the information is realistic and specific to ${collegeData.collegeName} and the ${collegeData.courseName} program. If exact information isn't available, provide plausible details that would be typical for a college of this type in ${collegeData.location || 'India'}.
        `;

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch college details');
        }

        const data = await response.json();
        const textContent = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonString = jsonMatch[0];
          const parsedData = JSON.parse(jsonString);
          setCollegeDetails(parsedData);
        } else {
          throw new Error('Could not parse college details from response');
        }
      } catch (error) {
        console.error('Error fetching college details:', error);
        setError('Failed to fetch college details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollegeDetails();
  }, [collegeData, navigate]);

  const handleRatingChange = (category, value) => {
    setReviewData(prev => ({
      ...prev,
      [category]: { ...prev[category], rating: value }
    }));
  };

  const handleReviewTextChange = (category, value) => {
    setReviewData(prev => ({
      ...prev,
      [category]: { ...prev[category], text: value }
    }));
  };

  const handleReviewSubmit = async () => {
    try {
      if (!user) {
        alert('Please sign in to submit reviews');
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      const categories = ['curriculum', 'faculty', 'internships', 'placements'];
      const reviewPromises = categories.map(async (category) => {
        if (reviewData[category].rating === 0 || !reviewData[category].text.trim()) {
          return null; // Skip categories with no rating or empty text
        }

        const review = {
          collegeId: collegeId,
          collegeName: collegeData.collegeName,
          category,
          rating: reviewData[category].rating,
          text: reviewData[category].text,
          authorName: user.fullName || user.username,
          userId: user.id
        };

        const response = await fetch('http://localhost:5001/api/reviews/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(review),
        });

        if (!response.ok) {
          throw new Error(`Failed to submit ${category} review`);
        }

        return response.json();
      });

      // Wait for all reviews to be submitted
      await Promise.all(reviewPromises.filter(Boolean));

      // Clear all review forms
      setReviewData({
        curriculum: { rating: 0, text: '' },
        faculty: { rating: 0, text: '' },
        internships: { rating: 0, text: '' },
        placements: { rating: 0, text: '' }
      });

      // Close the review modal
      setShowReviewModal(false);

      // Show success message and reload
      alert('Reviews submitted successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmitError('Failed to submit reviews. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch reviews for the college
  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/reviews/college/${collegeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      
      // Organize reviews by category
      const reviewsByCategory = {
        curriculum: [],
        faculty: [],
        internships: [],
        placements: []
      };

      data.reviews.forEach(review => {
        if (reviewsByCategory[review.category]) {
          reviewsByCategory[review.category].push(review);
        }
      });

      setReviews(reviewsByCategory);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    if (collegeId) {
      fetchReviews();
    }
  }, [collegeId]);

  // Calculate average rating for a category
  const getAverageRating = (category) => {
    const categoryReviews = reviews[category];
    if (!categoryReviews || categoryReviews.length === 0) return '0.0';
    const sum = categoryReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / categoryReviews.length).toFixed(1);
  };

  // Calculate overall rating from all reviews
  const calculateOverallRating = () => {
    const allReviews = [
      ...reviews.curriculum || [],
      ...reviews.faculty || [],
      ...reviews.internships || [],
      ...reviews.placements || []
    ];
    
    if (allReviews.length === 0) return '0.0';
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / allReviews.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 mx-auto text-primary-600 dark:text-primary-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Loading college details...</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={() => navigate('/reviews')}
            className="flex items-center text-primary-600 dark:text-primary-400 mb-6 hover:underline"
          >
            <FaArrowLeft className="mr-2" />
            Back to Reviews
          </button>
          
          <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Error</h2>
            <p className="text-gray-700 dark:text-gray-200 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!collegeDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={() => navigate('/reviews')}
            className="flex items-center text-primary-600 dark:text-primary-400 mb-6 hover:underline"
          >
            <FaArrowLeft className="mr-2" />
            Back to Reviews
          </button>
          
          <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{collegeData.collegeName}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
                {collegeData.courseName}
              </span>
              {collegeData.location && (
                <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {collegeData.location}
                </span>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-dark-tertiary p-3 rounded-lg border-l-4 border-primary-500 dark:border-primary-700">
              {collegeData.collegeDescription}
            </p>
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">Detailed information is not available at the moment.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get the reviews to display based on active category
  const getReviewsByCategory = () => {
    switch (activeCategory) {
      case 'curriculum':
        return collegeDetails.curriculum.reviews;
      case 'faculty':
        return collegeDetails.faculty.reviews;
      case 'internships':
        return collegeDetails.internships.reviews;
      case 'placements':
        return collegeDetails.placements.reviews;
      default:
        return [
          ...collegeDetails.curriculum.reviews,
          ...collegeDetails.faculty.reviews,
          ...collegeDetails.internships.reviews,
          ...collegeDetails.placements.reviews
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button 
          onClick={() => navigate('/reviews')}
          className="flex items-center bg-white dark:bg-dark-secondary text-primary-600 dark:text-primary-400 mb-6 hover:underline"
        >
          <FaArrowLeft className="mr-2" />
          Back to Reviews
        </button>

        {/* College header */}
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{collegeData.collegeName}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
                  {collegeData.courseName}
                </span>
                {collegeData.location && (
                  <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {collegeData.location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSyllabusModal(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center"
              >
                <FaBook className="mr-2" />
                View Syllabus
              </button>
              <button
                onClick={() => setShowAdmissionModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
              >
                <FaGraduationCap className="mr-2" />
                Admission Process
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">
              {collegeDetails.collegeDescription}
            </p>
            <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-dark-tertiary px-4 py-3 rounded-lg shadow-sm self-start">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center space-x-1.5">
                  <span>{calculateOverallRating()}</span>
                  <FaStar className="text-yellow-500 h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">Overall Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pt-2 pb-2 pl-2">
          <CategoryTab
            active={activeCategory === 'all'}
            name="All Reviews"
            onClick={() => setActiveCategory('all')}
          />
          <CategoryTab
            active={activeCategory === 'curriculum'}
            name="Curriculum"
            onClick={() => setActiveCategory('curriculum')}
          />
          <CategoryTab
            active={activeCategory === 'faculty'}
            name="Faculty"
            onClick={() => setActiveCategory('faculty')}
          />
          <CategoryTab
            active={activeCategory === 'internships'}
            name="Internships"
            onClick={() => setActiveCategory('internships')}
          />
          <CategoryTab
            active={activeCategory === 'placements'}
            name="Placements"
            onClick={() => setActiveCategory('placements')}
          />
        </div>

        {/* Category-specific content */}
        {activeCategory !== 'all' && (
          <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Overview
            </h2>
            <p className="text-gray-700 dark:text-gray-200 mb-6">
              {collegeDetails[activeCategory].overview}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {collegeDetails[activeCategory].strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {collegeDetails[activeCategory].weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Syllabus Modal */}
        {showSyllabusModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowSyllabusModal(false)}>
                <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
              </div>
              <div className="inline-block align-bottom bg-white dark:bg-dark-secondary rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full mx-4">
                <div className="bg-white dark:bg-dark-secondary px-4 pt-5 pb-4 sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Course Syllabus
                        </h3>
                        <button
                          onClick={() => setShowSyllabusModal(false)}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {syllabusError ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <svg className="h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-gray-700 dark:text-gray-300 mb-4">{syllabusError}</p>
                          <button
                            onClick={fetchSyllabusData}
                            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry
                          </button>
                        </div>
                      ) : !syllabusData ? (
                        <div className="flex items-center justify-center py-12">
                          <FaSpinner className="animate-spin h-8 w-8 text-primary-600" />
                        </div>
                      ) : (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {Object.entries(syllabusData).map(([semester, subjects]) => (
                            <div key={semester} className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-4">
                              <h4 className="text-lg font-semibold text-primary-600 dark:text-primary-400 mb-3">
                                {semester}
                              </h4>
                              <ul className="space-y-2">
                                {subjects.split(', ').map((subject, index) => (
                                  <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start">
                                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                    {subject}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-dark-tertiary px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowSyllabusModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admission Process Modal */}
        {showAdmissionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admission Process</h2>
                  <button
                    onClick={() => setShowAdmissionModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {admissionError ? (
                  <div className="text-red-600 dark:text-red-400 text-center py-4">
                    {admissionError}
                  </div>
                ) : !admissionData ? (
                  <div className="text-center py-4">
                    <FaSpinner className="animate-spin h-8 w-8 mx-auto text-primary-600 dark:text-primary-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading admission details...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Overview</h3>
                      <p className="text-gray-600 dark:text-gray-300">{admissionData.admissionProcess.overview}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Eligibility Criteria</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                        {admissionData.admissionProcess.eligibility.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Required Documents</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                        {admissionData.admissionProcess.requiredDocuments.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Important Dates</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-dark-tertiary p-3 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Application Start</p>
                          <p className="font-medium text-gray-800 dark:text-white">{admissionData.admissionProcess.importantDates.applicationStart}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark-tertiary p-3 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Application End</p>
                          <p className="font-medium text-gray-800 dark:text-white">{admissionData.admissionProcess.importantDates.applicationEnd}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark-tertiary p-3 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Result Declaration</p>
                          <p className="font-medium text-gray-800 dark:text-white">{admissionData.admissionProcess.importantDates.resultDeclaration}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Selection Process</h3>
                      <ul className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-300">
                        {admissionData.admissionProcess.selectionProcess.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Fees</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-dark-tertiary p-3 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Application Fee</p>
                          <p className="font-medium text-gray-800 dark:text-white">{admissionData.admissionProcess.fees.applicationFee}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark-tertiary p-3 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Annual Tuition Fee</p>
                          <p className="font-medium text-gray-800 dark:text-white">{admissionData.admissionProcess.fees.tuitionFee}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowReviewModal(false)}>
                <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
              </div>
              <div className="inline-block align-bottom bg-white dark:bg-dark-secondary rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full mx-4">
                <div className="bg-white dark:bg-dark-secondary px-4 pt-5 pb-4 sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                          Add Your Review
                        </h3>
                        <button
                          onClick={() => setShowReviewModal(false)}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-6">
                        {/* Review Categories */}
                        {['curriculum', 'faculty', 'internships', 'placements'].map((category) => (
                          <div key={category} className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white capitalize">
                              {category}
                            </h4>
                            <div className="flex items-center mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleRatingChange(category, star)}
                                  className="p-1"
                                >
                                  <FaStar
                                    className={`h-6 w-6 ${
                                      star <= reviewData[category].rating
                                        ? 'text-yellow-500'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={reviewData[category].text}
                              onChange={(e) => handleReviewTextChange(category, e.target.value)}
                              placeholder={`Share your experience about the ${category}...`}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-tertiary dark:text-white"
                              rows="3"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-dark-tertiary px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleReviewSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Reviews'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-dark-tertiary dark:text-gray-300 dark:border-gray-600 dark:hover:bg-dark-secondary"
                    onClick={() => setShowReviewModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews section */}
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Reviews</h2>
            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Write a Review
            </button>
          </div>

          {/* Reviews content */}
          {selectedFilter === 'all' ? (
            // Show all reviews grouped by category
            ['curriculum', 'faculty', 'internships', 'placements'].map(category => (
              <div key={category} className="mb-8 last:mb-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white capitalize">
                    {category} Reviews
                  </h3>
                </div>
                
                {reviews[category]?.length > 0 ? (
                  <div className="space-y-4">
                    {reviews[category].map((review, index) => (
                      <ReviewItem key={index} review={review} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">
                      No reviews yet for {category}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            // Show filtered reviews
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white capitalize">
                  {selectedFilter} Reviews
                </h3>
              </div>
              
              {reviews[selectedFilter]?.length > 0 ? (
                <div className="space-y-4">
                  {reviews[selectedFilter].map((review, index) => (
                    <ReviewItem key={index} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">
                    No reviews yet for {selectedFilter}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeDetails;
