import React, { useState, useEffect } from 'react';
import { FaStar, FaFilter, FaSearch, FaPen, FaBook, FaSpinner, FaUniversity, FaGraduationCap } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Review Card Component
const ReviewCard = ({ review }) => {
  const navigate = useNavigate();
  
  const handleCollegeClick = () => {
    navigate(`/college/${review.id}`, { 
      state: { collegeData: review } 
    });
  };

  return (
    <div 
      className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-4 mb-2 hover:shadow-lg transition-all border border-transparent hover:border-primary-200 dark:hover:border-primary-900 cursor-pointer"
      onClick={handleCollegeClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">{review.collegeName}</h3>
          <div className="flex items-center">
            <p className="text-primary-600 dark:text-primary-400 font-medium">{review.courseName}</p>
            {review.location && (
              <p className="text-gray-500 dark:text-gray-400 text-sm ml-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {review.location}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center mb-3">
          <div className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-3 py-1 rounded-full font-medium inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Placement Success: {review.placementSuccess}%
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-dark-tertiary p-3 rounded-lg border-l-4 border-primary-500 dark:border-primary-700">
          {review.collegeDescription || "Description of the college not available."}
        </p>
      </div>
      
    </div>
  );
};

const Reviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    college: '',
    course: '',
    minRating: 0,
    minPlacement: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    collegeName: '',
    courseName: '',
    rating: 5,
    placementSuccess: 80,
    reviewText: '',
  });
  const [showSyllabusForm, setShowSyllabusForm] = useState(false);
  const [syllabusInfo, setSyllabusInfo] = useState({
    departmentName: '',
    collegeName: '',
    location: '',
  });
  const [syllabusResult, setSyllabusResult] = useState(null);
  const [isLoadingSyllabus, setIsLoadingSyllabus] = useState(false);
  const [syllabusError, setSyllabusError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showCollegeListForm, setShowCollegeListForm] = useState(false);
  const [collegeListInfo, setCollegeListInfo] = useState({
    location: '',
    courseName: '',
  });
  const [collegeList, setCollegeList] = useState(null);
  const [isLoadingCollegeList, setIsLoadingCollegeList] = useState(false);
  const [collegeListError, setCollegeListError] = useState(null);


  const sampleReviews = [
    {
      id: 1,
      collegeName: 'Engineering College of Technology',
      courseName: 'Computer Science',
      placementSuccess: 92,
      collegeDescription: 'Engineering College of Technology is a premier institution established in 1985, known for its state-of-the-art facilities and industry partnerships. The campus spans 50 acres with modern laboratories, a central library with over 50,000 books, and dedicated research centers.',
      location: 'Bangalore, Karnataka',
      reviews: {
        curriculum: [],
        faculty: [],
        internships: [],
        placements: []
      }
    },
    {
      id: 2,
      collegeName: 'Institute of Applied Sciences',
      courseName: 'Electronics Engineering',
      placementSuccess: 78,
      collegeDescription: 'Institute of Applied Sciences is recognized for its strong focus on research and innovation in applied sciences. Founded in 1992, the institute offers specialized programs with emphasis on practical learning and industry exposure through its 15 research labs and innovation centers.',
      location: 'Mumbai, Maharashtra',
      reviews: {
        curriculum: [],
        faculty: [],
        internships: [],
        placements: []
      }
    },
    {
      id: 3,
      collegeName: 'National College of Engineering',
      courseName: 'Mechanical Engineering',
      placementSuccess: 85,
      collegeDescription: 'National College of Engineering is among the top engineering institutions in the country with a legacy of over 40 years. The college is known for its robust industry connections, experienced faculty with international exposure, and comprehensive infrastructure including specialized workshops and laboratories.',
      location: 'Delhi, NCR',
      reviews: {
        curriculum: [],
        faculty: [],
        internships: [],
        placements: []
      }
    }
  ];


  useEffect(() => {
   
    setReviews(sampleReviews);
    setFilteredReviews(sampleReviews);
  }, []);

  useEffect(() => {
    let results = reviews;
    
    if (filters.college) {
      results = results.filter(review => 
        review.collegeName.toLowerCase().includes(filters.college.toLowerCase())
      );
    }
    
    if (filters.course) {
      results = results.filter(review => 
        review.courseName.toLowerCase().includes(filters.course.toLowerCase())
      );
    }
    
    if (filters.minRating > 0) {
      results = results.filter(review => {
        const rating = review.rating;
        return rating !== null && parseFloat(rating) >= filters.minRating;
      });
    }
    
    if (filters.minPlacement > 0) {
      results = results.filter(review => review.placementSuccess >= filters.minPlacement);
    }
    
    if (searchTerm) {
      results = results.filter(review => 
        review.collegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.collegeDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (review.location && review.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredReviews(results);
  }, [filters, searchTerm, reviews]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview({
      ...newReview,
      [name]: value,
    });
  };

  const handleRatingChange = (rating) => {
    setNewReview({
      ...newReview,
      rating,
    });
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    // In a real app, this would be an API call to save the review
    const reviewToAdd = {
      id: reviews.length + 1,
      ...newReview,
      reviewerName: 'Current User', // This would come from authentication
      date: new Date().toISOString().split('T')[0],
    };
    
    setReviews([reviewToAdd, ...reviews]);
    setNewReview({
      collegeName: '',
      courseName: '',
      rating: 5,
      placementSuccess: 80,
      reviewText: '',
    });
    setShowReviewForm(false);
  };

  const handleSyllabusChange = (e) => {
    const { name, value } = e.target;
    setSyllabusInfo({
      ...syllabusInfo,
      [name]: value,
    });
  };

  const handleCollegeListChange = (e) => {
    const { name, value } = e.target;
    setCollegeListInfo({
      ...collegeListInfo,
      [name]: value,
    });
  };

  const fetchCollegeList = async (e) => {
    e.preventDefault();
    setIsLoadingCollegeList(true);
    setCollegeList(null);
    setCollegeListError(null);

    try {
      const prompt = `Respond only with a JSON-formatted list of colleges in ${collegeListInfo.location} for the ${collegeListInfo.courseName} program, including college name, location, and department, suitable for separating and displaying on a UI, in the following format:

[
{'name': '[College Name 1]', 'location': '[Specific Location]', 'department': '[Department Name]'},
{'name': '[College Name 2]', 'location': '[Specific Location]', 'department': '[Department Name]'},
...
]`;

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAQq6XdpLMpFYGGfnKn-VewRgjJt6EOlPA',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const content = data.candidates[0].content;
        if (content.parts && content.parts[0] && content.parts[0].text) {
          try {
            // Extract JSON from the response
            const text = content.parts[0].text;
            const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
            if (jsonMatch) {
              const jsonStr = jsonMatch[0];
              const parsedData = JSON.parse(jsonStr);
              setCollegeList(parsedData);
            } else {
              throw new Error('Could not extract JSON from response');
            }
          } catch (error) {
            console.error('Error parsing college list JSON:', error);
            setCollegeListError('Failed to parse college list. Please try again.');
          }
        } else {
          throw new Error('Invalid response format: missing text content');
        }
      } else {
        throw new Error('Invalid response format: missing candidates or content');
      }
    } catch (error) {
      console.error('Error fetching college list:', error);
      setCollegeListError(error.message || 'Failed to fetch college list. Please try again later.');
    } finally {
      setIsLoadingCollegeList(false);
    }
  };

  const fetchSyllabusInfo = async (e) => {
    e.preventDefault();
    setIsLoadingSyllabus(true);
    setSyllabusResult(null);
    setSyllabusError(null);

    try {
      const prompt = `
      Provide comprehensive information about the ${syllabusInfo.departmentName} department at ${syllabusInfo.collegeName}, located in ${syllabusInfo.location}. 
      
      ### **1. Semester-wise Subject List:**  
      Organize the response semester-wise, listing subjects in the following format:  
      
      Semester [Semester Number]: Subject 1, Subject 2, Subject 3, ...  
      - If subject information is not available, mention: "Subject information not found."
      
      ---
      
      ### **2. Real-time College & Course Insights:**  
      Provide authentic reviews on the following aspects:  
      
      - **Curriculum:**  
        - Evaluate the relevance, structure, and up-to-date nature of the curriculum.  
      
      - **Faculty:**  
        - Share feedback on the expertise, teaching quality, and approachability of professors.  
      
      - **Internships:**  
        - Highlight the availability of internships, industry partnerships, and student experiences.  
      
      - **Placements:**  
        - Provide insights on placement statistics, top recruiters, highest and average salary packages, and overall placement trends.
      
      ---
      
      ### **3. Suggested Response Format:**  
      
      **Semester-wise Subjects:**  
      Semester 1: Mathematics, Physics, Chemistry  
      Semester 2: Engineering Mechanics, Programming Basics, Electrical Circuits  
      Semester 3: Subject information not found  
      
      **Real-time Insights:**  
      - **Curriculum:** Well-structured and industry-aligned with hands-on projects.  
      - **Faculty:** Experienced and supportive with strong academic backgrounds.  
      - **Internships:** Ample opportunities with partnerships in top companies.  
      - **Placements:** 95% placement rate with top recruiters like Google, Microsoft, etc.  
      
      Ensure the response is well-organized, detailed, and easy to navigate.`;
      
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAQq6XdpLMpFYGGfnKn-VewRgjJt6EOlPA',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const content = data.candidates[0].content;
        if (content.parts && content.parts[0] && content.parts[0].text) {
          setSyllabusResult(content.parts[0].text);
        } else {
          throw new Error('Invalid response format: missing text content');
        }
      } else {
        throw new Error('Invalid response format: missing candidates or content');
      }
    } catch (error) {
      console.error('Error fetching syllabus information:', error);
      setSyllabusError(error.message || 'Failed to fetch syllabus information. Please try again later.');
    } finally {
      setIsLoadingSyllabus(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const results = await fetchCollegeSearchResults(searchTerm);
      const processedResults = processSearchResults(results);
      setSearchResults(processedResults);
    } catch (error) {
      console.error('Error searching for colleges:', error);
      setSearchError('Failed to fetch search results. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const processSearchResults = (results) => {
    return results.map(result => ({
      ...result,
      reviews: result.reviews || {
        curriculum: [],
        faculty: [],
        internships: [],
        placements: []
      }
    }));
  };

  const fetchCollegeSearchResults = async (query) => {
    try {
      const prompt = `
        I need information about colleges, courses, or educational institutions related to "${query}".
        
        Please provide a JSON array of 5-8 relevant results with the following structure:
        [
          {
            "collegeName": "Full name of the college or institution",
            "courseName": "Relevant course or department",
            "rating": A number between 1.0 and 5.0 representing overall rating,
            "placementSuccess": A percentage between 60 and 98 representing placement rate,
            "reviewText": "A brief, realistic review highlighting key strengths and potential areas for improvement",
            "reviewerName": "A realistic reviewer name",
            "date": "A recent date in DD/MM/YYYY format",
            "location": "City, State/Province"
          }
        ]
        
        Respond ONLY with the JSON array and nothing else. Make sure the data is realistic, varied, and relevant to the search query "${query}".
      `;

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAQq6XdpLMpFYGGfnKn-VewRgjJt6EOlPA',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const content = data.candidates[0].content;
        if (content.parts && content.parts[0] && content.parts[0].text) {
          const responseText = content.parts[0].text;
          const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
          if (jsonMatch) {
            const jsonStr = jsonMatch[0];
            const results = JSON.parse(jsonStr);
            return results;
          } else {
            throw new Error('Could not parse JSON from response');
          }
        } else {
          throw new Error('Invalid response format: missing text content');
        }
      } else {
        throw new Error('Invalid response format: missing candidates or content');
      }
    } catch (error) {
      console.error('Error in fetchCollegeSearchResults:', error);
      throw error;
    }
  };

  const uniqueColleges = [...new Set(reviews.map(review => review.collegeName))];
  const uniqueCourses = [...new Set(reviews.map(review => review.courseName))];

  const getFilteredReviewsByCategory = () => {
    if (activeTab === 'all') {
      return filteredReviews;
    }
    

    return filteredReviews.filter((_, index) => {
      if (activeTab === 'curriculum') return index % 4 === 0;
      if (activeTab === 'faculty') return index % 4 === 1;
      if (activeTab === 'internships') return index % 4 === 2;
      if (activeTab === 'placements') return index % 4 === 3;
      return true;
    });
  };

  const displayedReviews = getFilteredReviewsByCategory();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary text-gray-900 dark:text-white py-8">
      
      <div className="container mx-auto px-6">
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md p-6 mb-8 transition-all">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Search for Colleges & Courses</h2>
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="relative">
              <div className="flex items-center">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Enter college name, course, or location..."
                    className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-tertiary text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSearchResults([]);
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black  bg-white dark:bg-dark-tertiary dark:text-white "
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="ml-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
                  disabled={isSearching || !searchTerm.trim()}
                >
                  {isSearching ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <FaSearch />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
          
          {searchTerm && searchResults.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-dark-tertiary p-3 rounded-lg">
              <span className="font-medium text-primary-600 dark:text-primary-400">{searchResults.length} results</span> found for: <span className="font-medium">{searchTerm}</span>
            </div>
          )}
          
          {searchError && (
            <div className="mt-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {searchError}
            </div>
          )}
        </div>
 
        {searchResults.length > 0 && (
          <div className="mb-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search Results</h2>
              <span className="text-sm px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full font-medium">
                {searchResults.length} colleges found
              </span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 px-4">
              {searchResults.map((result, index) => (
                <div 
                  key={index} 
                  className="bg-white dark:bg-dark-secondary rounded-xl shadow-md p-6 hover:shadow-xl transition-all border border-transparent hover:border-primary-200 dark:hover:border-primary-900 mx-4 cursor-pointer"
                  onClick={() => {
                    navigate(`/college/${index}`, { 
                      state: { 
                        collegeData: {
                          ...result,
                          id: index,
                          collegeDescription: result.reviewText
                        } 
                      } 
                    });
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{result.collegeName}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
                          {result.courseName}
                        </span>
                        {result.location && (
                          <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {result.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-dark-tertiary p-3 rounded-lg border-l-4 border-primary-500 dark:border-primary-700">
                      {result.reviewText}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {searchResults.length === 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 px-4">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <div className="col-span-2 py-16 text-center bg-white dark:bg-dark-secondary rounded-lg shadow-md">
              </div>
            )}
          </div>
        )}
      </div>

      {showCollegeListForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Find Colleges by Location & Course</h2>
                <button 
                  onClick={() => {
                    setShowCollegeListForm(false);
                    setCollegeList(null);
                    setCollegeListError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

             
            </div>
          </div>
        </div>
      )}

      {showSyllabusForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">College Syllabus Information</h2>
                <button 
                  onClick={() => {
                    setShowSyllabusForm(false);
                    setSyllabusResult(null);
                    setSyllabusError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Write a Review</h2>
                <button 
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
