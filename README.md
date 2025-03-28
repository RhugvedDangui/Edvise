# Edvise - Student Support Platform

Edvise is an innovative student support platform designed to empower students with interactive learning tools, collaboration features, and a modern architecture to enhance their educational experience.

## Team Information
### Team Name
EQUINOX

### Team Leader
- **Rhugved Dangui**  
  - Contact: 8805218288 
  - Email: rhugveddangui07@gmail.com

### Team Members
1. **Fayaz Khan**  
   - Contact: 9209352504  
   - Email: fayaz.khanxid411@gmail.com
2. **Tanmay Desai**  
   - Contact:9860997932 
   - Email: tanmay2004desai@gmail.com

### Individual Contributions
1. **Rhugved Dangui**:  
   - Project Management  
   - Frontend Development    
2. **Fayaz Khan**:  
   - Backend Integration  
   - Database Management  
   - API Development  
3. **Tanmay Desai**:  
   - Real-time Collaboration Features   
   - Testing and Debugging  
   - UI/UX Design

### Collaborations
- **Rhugved Dangui & Fayaz Khan**: Worked together on integrating the frontend with the backend APIs for seamless data flow.  
- **Fayaz Khan & Tanmay Desai**: Collaborated on real-time chat functionality using Socket.IO and database optimization.  
- **Tanmay Desai & Rhugved Dangui**: Partnered on designing interactive learning roadmaps and ensuring UI responsiveness.

---

## Project Structure
```
Edvise/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   │   ├── Hero.jsx
│   │   └── Footer.jsx
│   ├── pages/             # Page components
│   │   ├── Home.jsx
│   │   ├── CollegeDetails.jsx
│   │   └── Roadmap.jsx    # Interactive learning roadmap
│   ├── api/               # Backend API integration
│   │   └── server.js
│   └── App.jsx            # Main application component
├── server/                # Collaborative whiteboard server
├── public/                # Static assets (images, fonts, etc.)
└── package.json           # Project dependencies and scripts
```

---

## Project Approach
Edvise is designed to provide students with a comprehensive support system, featuring:

1. **Interactive Learning Roadmaps**  
   - Visual progression tracking  
   - Customizable learning paths  
   - Progress monitoring  


2. **Modern Architecture**  
   - Component-based React architecture  
   - Real-time updates using Socket.IO  
   - Secure authentication with Clerk  
   - MongoDB database for data persistence  

---

## Tech Stack
### Frontend
- **React 18**: Core library for building UI  
- **Vite**: Fast build tool and development server  
- **Framer Motion**: Smooth animations  
- **ReactFlow**: Interactive diagrams for roadmaps  
- **React Router DOM**: Client-side navigation  
- **React Icons**: Icon library  
- **HTML2Canvas & jsPDF**: PDF generation from UI  
- **DND Kit**: Drag-and-drop functionality  
- **Date-fns**: Date formatting utilities  

### Backend
- **Express.js**: Web framework for Node.js  
- **Socket.IO**: Real-time collaboration features  
- **MongoDB with Mongoose**: Database and ORM  
- **Clerk**: Authentication and user management  
- **Google AI Integration**: AI-powered features  

### Development Tools
- **Concurrently**: Run multiple scripts simultaneously  
- **ESLint**: Code linting for consistency  
- **Nodemon**: Auto-restart server during development  

---

## Build and Run Commands

### Prerequisites
- **Node.js**: Version 14 or higher  
- **npm or yarn**: Package manager  
- **MongoDB**: Local or cloud instance  
- **Clerk Account**: For authentication setup  
- **Google AI API Key**: For AI-powered features  

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Development
```bash
# Run frontend and backend concurrently
npm run dev:all

# Or run separately:
# Frontend only (Port: 5173)
npm run dev

# Backend only (Port: 3000)
npm run server
```

### Production Build
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

---

## Environment Variables
Create a `.env` file in the root directory with the following:
```
VITE_CLERK_PUBLISHABLE_KEY=[Your Clerk Publishable Key]
VITE_GOOGLE_AI_API_KEY=[Your Google AI API Key]
MONGODB_URI=[Your MongoDB Connection String]
```

---

## Additional Information
- **Development Ports**:  
  - Frontend: `http://localhost:5173`  
  - Backend API: `http://localhost:3000`  
  - Whiteboard Server: `http://localhost:3001`  
- **Deployment**: Ensure environment variables are set in your production environment.  
- **Future Enhancements**:  
  - Add AI-driven personalized learning recommendations.  
  - Expand collaboration tools with video/audio integration.  

