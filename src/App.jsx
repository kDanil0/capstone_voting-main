import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import AuthContextProvider from "./utils/AuthContext";
import { useAuthContext } from "./utils/AuthContext";
import Layout from "./Components/layout/Layout";
import "antd/dist/reset.css";

// Layout Components
import VerticalNavBar from "./Components/CommonComponents/VerticalNavBar";

// Voter Pages
import Home from "./Pages/Voters/Home";
import Election from "./Pages/Voters/Election";
import ElectionDetails from "./Pages/Voters/ElectionDetails";
import VotingProcess from "./Pages/Voters/VotingProcess";

// Candidate Pages
import Candidates from "./Pages/Candidate/Candidates";
import UserCandidates from "./Pages/Candidate/UserCandidates";
import CandidateProfilePage from "./Pages/Candidate/CandidateProfilePage";
import CandidateProfile from "./Components/Candidate/CandidateProfile";
import CandidateProfileView from "./Components/Candidate/CandidateProfileView";
import CandidatePost from "./Pages/Candidate/CandidatePost";

// Admin Pages
import AdminElection from "./Pages/Admin/AdminElection";
import ViewAllElections from "./Pages/Admin/ViewAllElections";
import ElectionDetailsAdmin from "./Pages/Admin/ElectionDetailsAdmin";
import CreateElections from "./Pages/Admin/CreateElections";
import ElectionsReport from "./Pages/Admin/ElectionResults";
import CandidateManagement from "./Pages/Admin/CandidateManagement";
import StudentManagement from "./Pages/Admin/StudentManagement";
import PartylistsManagement from "./Pages/Admin/PartylistsManagement";
import PostApproval from "./Components/admin/PostApproval";
import AdminDashboard from "./Components/AdminDashboard";

// Authentication Pages
import Login from "./Pages/Login";
import Verify_OTP from "./Pages/Verify-OTP";

// Post Components
import Posts from "./Pages/Posts";

/**
 * Protected route component that handles authentication and role-based access
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, setUser } = useAuthContext();
  const location = useLocation();
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [localUser, setLocalUser] = useState(null);

  // On first render, check localStorage for user data if not in context
  useEffect(() => {
    if (!user && !checkedStorage) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setLocalUser(parsedUser);
          setUser(parsedUser); // Update context
        }
      } catch (e) {
        // Silent error handling
      }
      setCheckedStorage(true);
    }
  }, [user, checkedStorage, setUser]);

  // Use either context user or localStorage user
  const effectiveUser = user || localUser;

  // Handle unauthenticated access
  if (!effectiveUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle unauthorized access (wrong role)
  if (allowedRoles && !allowedRoles.includes(effectiveUser.role_id)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Main application content with routes
 */
const AppContent = () => {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/election" element={<Election />} />
        <Route path="/election/:id" element={<ElectionDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/view-candidates/:id" element={<CandidateProfileView />} />

        {/* Protected Voter Routes */}
        <Route
          path="/election/:id/vote"
          element={
            <ProtectedRoute allowedRoles={[1, 2, 3]}>
              <VotingProcess />
            </ProtectedRoute>
          }
        />

        {/* Protected Candidate Routes */}
        <Route
          path="/candidate/*"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <Routes>
                <Route path="profile" element={<CandidateProfilePage />} />
                <Route path="post" element={<CandidatePost />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="elections" element={<AdminElection />} />
                <Route path="elections/view" element={<ViewAllElections />} />
                <Route
                  path="elections/details/:id"
                  element={<ElectionDetailsAdmin />}
                />
                <Route path="elections/create" element={<CreateElections />} />
                <Route
                  path="elections/partylists"
                  element={<PartylistsManagement />}
                />
                <Route path="candidates" element={<CandidateManagement />} />
                <Route path="students" element={<StudentManagement />} />
                <Route path="post-approval" element={<PostApproval />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
};

/**
 * Main App component
 */
const App = () => {
  return (
    <AuthContextProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthContextProvider>
  );
};

export default App;
