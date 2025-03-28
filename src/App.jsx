import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, RedirectToSignIn } from '@clerk/clerk-react';
import SignInPage from './pages/auth/SignIn';
import SignUpPage from './pages/auth/SignUp';
import Home from './pages/Home';
import Features from './pages/Features';
import FeatureDetails from './components/FeatureDetails';
import Courses from './pages/Courses';
import Roadmap from './pages/Roadmap';
import SavedRoadmaps from './pages/SavedRoadmaps';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import JobOpportunities from './pages/JobOpportunities';
import Reviews from './pages/Reviews';
import CollegeDetails from './pages/CollegeDetails';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import Profile from './pages/Profile';
import Mentors from './pages/Mentors';
import MentorProfile from './pages/MentorProfile';
import Chat from './pages/Chat';
import GovernmentSchemesChatbot from './pages/GovernmentSchemesChatbot';
import 'react-toastify/dist/ReactToastify.css';


const ProtectedLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  const hideHeaderFooter = location.pathname === '/roadmap' ||
                          location.pathname === '/saved-roadmaps';

  const hideFooterOnly = location.pathname.startsWith('/mentor/') || 
  location.pathname === '/mentors' ||
                         location.pathname === '/chat';
  const hideSidebar = location.pathname.startsWith('/mentor/');
  
  const showFooter = !hideHeaderFooter && !hideFooterOnly;
  const showNavbar = !hideHeaderFooter;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-primary">
        {showNavbar && <Navbar />}
        <div className={showNavbar ? 'pt-16' : ''}>
          <Outlet />
        </div>
        {showFooter && <Footer />}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </ThemeProvider>
  );
};

// Public Layout Component
const PublicLayout = ({ children }) => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-dark-primary dark:via-dark-secondary dark:to-dark-tertiary">
        {children}
      </div>
    </ThemeProvider>
  );
};

function App() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/sign-in" element={
          <PublicLayout>
            {!isSignedIn ? <SignInPage /> : <Navigate to="/dashboard" replace />}
          </PublicLayout>
        } />
        <Route path="/sign-up" element={
          <PublicLayout>
            {!isSignedIn ? <SignUpPage /> : <Navigate to="/dashboard" replace />}
          </PublicLayout>
        } />
        
        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/features/:featureId" element={<FeatureDetails />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/roadmap/:id" element={<Roadmap />} />
          <Route path="/roadmap/shared/:sharedData" element={<Roadmap />} />
          <Route path="/saved-roadmaps" element={<SavedRoadmaps />} />
          <Route path="/saved-roadmaps/:id" element={<SavedRoadmaps />} />
          <Route path="/job-opportunities" element={<JobOpportunities />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/college/:collegeId" element={<CollegeDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/mentor/:mentorId" element={<MentorProfile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/government-schemes" element={<GovernmentSchemesChatbot />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
