import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '@clerk/clerk-react';

function GovernmentSchemesChatbot() {
  const { darkMode } = useTheme();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [userResponses, setUserResponses] = useState({
    category: '',
    income: '',
    education: '',
    age: '',
    location: '',
  });
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const questions = [
    {
      id: 'category',
      question: 'What category of government scheme are you interested in?',
      options: ['Education', 'Employment', 'Housing', 'Healthcare', 'Agriculture', 'Financial Assistance']
    },
    {
      id: 'income',
      question: 'What is your annual family income range?',
      options: ['Below ₹2.5 Lakhs', '₹2.5 Lakhs - ₹5 Lakhs', '₹5 Lakhs - ₹8 Lakhs', 'Above ₹8 Lakhs']
    },
    {
      id: 'education',
      question: 'What is your highest level of education?',
      options: ['10th Pass', '12th Pass', 'Undergraduate', 'Postgraduate', 'Doctorate', 'Other']
    },
    {
      id: 'age',
      question: 'What is your age group?',
      options: ['Below 18', '18-25', '26-35', '36-45', '46-60', 'Above 60']
    },
    {
      id: 'location',
      question: 'Where are you located?',
      options: ['Urban', 'Semi-Urban', 'Rural', 'Tribal']
    }
  ];

  const handleOptionSelect = (option) => {
    const currentQuestion = questions[currentStep];
    setUserResponses({
      ...userResponses,
      [currentQuestion.id]: option
    });
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      fetchRecommendationsFromGemini();
    }
  };

  const fetchRecommendationsFromGemini = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const prompt = `
        I need information about the latest government schemes in India for a person with the following profile:
        - Interested in: ${userResponses.category}
        - Annual family income: ${userResponses.income}
        - Education level: ${userResponses.education}
        - Age group: ${userResponses.age}
        - Location type: ${userResponses.location}
        
        Please provide 3-5 relevant government schemes that would be most suitable for this person.
        For each scheme, include the following information in a structured format:
        1. Name of the scheme
        2. Brief description (2-3 sentences)
        3. Eligibility criteria
        4. Key benefits
        5. Official website link (if available)
        
        Format the response as a JSON array of objects with the following structure:
        [
          {
            "name": "Scheme Name",
            "description": "Brief description",
            "eligibility": "Eligibility criteria",
            "benefits": "Key benefits",
            "link": "Official website URL"
          },
          ...
        ]
        
        Only include schemes that are currently active and relevant to the profile. Ensure the information is accurate and up-to-date.
      `;
      
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDHjrtT_1te5kCjmUTC0YVo1b1zcZrqnY0',
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }
      );
      
      if (response.data && response.data.candidates && response.data.candidates[0]?.content?.parts[0]?.text) {
        const responseText = response.data.candidates[0].content.parts[0].text;
        
        let jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          try {
            const schemes = JSON.parse(jsonMatch[0]);
            setRecommendedSchemes(schemes);
          } catch (parseError) {
            console.error('Error parsing JSON from Gemini response:', parseError);
            setError('Unable to parse scheme information. Please try again.');
            
            const fallbackSchemes = extractSchemesFromText(responseText);
            if (fallbackSchemes.length > 0) {
              setRecommendedSchemes(fallbackSchemes);
              setError(null);
            }
          }
        } else {
          const fallbackSchemes = extractSchemesFromText(responseText);
          if (fallbackSchemes.length > 0) {
            setRecommendedSchemes(fallbackSchemes);
          } else {
            setError('Could not identify scheme information in the response. Please try again.');
          }
        }
      } else {
        setError('No valid response received from the AI. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching recommendations from Gemini API:', error);
      setError('Error connecting to the recommendation service. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const extractSchemesFromText = (text) => {
    const schemes = [];
    const schemeBlocks = text.split(/\d+\.\s+(?=[A-Z])|(?:\r?\n){2,}/);
    
    for (const block of schemeBlocks) {
      if (block.trim().length === 0) continue;
      
      const nameMatch = block.match(/^([A-Za-z\s\(\)\-]+)(?::|\.)/);
      const descriptionMatch = block.match(/Description:?\s*([^]*?)(?:Eligibility|Benefits|Link|$)/i);
      const eligibilityMatch = block.match(/Eligibility:?\s*([^]*?)(?:Benefits|Link|Description|$)/i);
      const benefitsMatch = block.match(/Benefits:?\s*([^]*?)(?:Link|Eligibility|Description|$)/i);
      const linkMatch = block.match(/(?:Link|Website|URL):?\s*([^\s]+)/i);
      
      if (nameMatch || (block.length > 20 && block.includes(' '))) {
        schemes.push({
          name: nameMatch ? nameMatch[1].trim() : block.split('\n')[0].trim(),
          description: descriptionMatch ? descriptionMatch[1].trim() : 'Information not available',
          eligibility: eligibilityMatch ? eligibilityMatch[1].trim() : 'Information not available',
          benefits: benefitsMatch ? benefitsMatch[1].trim() : 'Information not available',
          link: linkMatch ? linkMatch[1].trim() : '#'
        });
      }
    }
    
    return schemes;
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setUserResponses({
      category: '',
      income: '',
      education: '',
      age: '',
      location: '',
    });
    setRecommendedSchemes([]);
    setError(null);
  };

  return (
    <div className={`min-h-screen mx-4 md:mx-8 lg:mx-16 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 py-4 px-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              <path d="M10 4a1 1 0 011 1v5a1 1 0 01-1 1 1 1 0 01-1-1V5a1 1 0 011-1z" />
              <path d="M10 12a1 1 0 011 1v1a1 1 0 01-1 1 1 1 0 01-1-1v-1a1 1 0 011-1z" />
            </svg>
            Government Schemes Finder
          </h1>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        {/* Questions Section */}
        {recommendedSchemes.length === 0 && !loading && !error && (
          <div className={`max-w-3xl mx-auto rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 mb-6">
              <div 
                className="bg-blue-600 h-2 transition-all duration-300" 
                style={{ width: `${Math.round(((currentStep) / questions.length) * 100)}%` }}
              ></div>
            </div>
            
            <div>
              <div className="flex justify-between mb-6">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Question {currentStep + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {Math.round(((currentStep) / questions.length) * 100)}% Complete
                </span>
              </div>
              
              <h2 className="text-2xl font-bold mb-6">{questions[currentStep].question}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[currentStep].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className={`p-5 rounded-lg border-2 text-left hover:bg-blue-50 hover:border-blue-500 transition-all flex items-center ${
                      darkMode 
                        ? 'border-gray-600 hover:bg-gray-700 hover:border-blue-400' 
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className={`max-w-3xl mx-auto rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
                <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mt-6 mb-2">Finding the latest government schemes</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                We're analyzing your profile to identify the most relevant government schemes for you. This may take a moment.
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className={`max-w-3xl mx-auto rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
            <div className="bg-red-500 h-2 w-full mb-6"></div>
            <div>
              <div className="flex items-center mb-6">
                <div className="rounded-full bg-red-100 dark:bg-red-900 p-3 mr-4">
                  <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-red-500">Something went wrong</h3>
              </div>
              
              <p className="mb-6 text-gray-600 dark:text-gray-300">{error}</p>
              
              <button
                onClick={handleRestart}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results section */}
        {recommendedSchemes.length > 0 && !loading && (
          <div className="py-6">
            <div className="flex justify-between items-center mb-8 px-4">
              <h2 className="text-2xl font-bold">Your Recommended Schemes</h2>
              <button
                onClick={handleRestart}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                } transition-all`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Start Over
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 px-4">
              {recommendedSchemes.map((scheme, index) => (
                <div 
                  key={index} 
                  className={`rounded-lg overflow-hidden shadow-lg ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  } hover:shadow-xl transition-all mx-2`}
                >
                  <div className={`p-1 ${getSchemeColor(index)}`}></div>
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className={`rounded-full ${getSchemeColorBg(index)} p-3 mr-4`}>
                        {getSchemeIcon(scheme.category || userResponses.category)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{scheme.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{scheme.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Eligibility
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">{scheme.eligibility}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 000 6.364L12 20.364l7.682-7.682a3.066 3.066 0 00-6.364-6.364L12 7.636l-1.318-1.318a3.066 3.066 0 00-6.364 0z" />
                          </svg>
                          Benefits
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">{scheme.benefits}</p>
                      </div>
                    </div>
                    
                    <a 
                      href={scheme.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full inline-block text-center py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                    >
                      Visit Official Website
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function getSchemeColor(index) {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
  ];
  return colors[index % colors.length];
}

function getSchemeColorBg(index) {
  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-green-100 text-green-600',
    'bg-purple-100 text-purple-600',
    'bg-yellow-100 text-yellow-600',
    'bg-red-100 text-red-600',
    'bg-indigo-100 text-indigo-600',
  ];
  return colors[index % colors.length];
}

function getSchemeIcon(category) {
  switch(category) {
    case 'Education':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case 'Employment':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'Housing':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case 'Healthcare':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case 'Agriculture':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    case 'Financial Assistance':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

export default GovernmentSchemesChatbot;