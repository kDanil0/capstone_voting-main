import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import AuthContextProvider from "./utils/AuthContext";
import Layout from "./Components/layout/Layout";
import { useAuthContext } from "./utils/AuthContext";
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

// Authentication Pages
import Login from "./Pages/Login";
import Verify_OTP from "./Pages/Verify-OTP";

import CandidateProfile from "./Components/Candidate/CandidateProfile";
import CandidateProfileView from "./Components/Candidate/CandidateProfileView";

// Post Components - Make sure these exist or create them
import Posts from "./Pages/Posts";
import CandidatePost from "./Pages/Candidate/CandidatePost";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, setUser } = useAuthContext();
  const location = useLocation();
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [localUser, setLocalUser] = useState(null);

  // Debug flag - only log in development
  const DEBUG = process.env.NODE_ENV === "development";

  // On first render, check localStorage for user data if not in context
  useEffect(() => {
    if (!user && !checkedStorage) {
      // Try to get user from localStorage
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (DEBUG) console.log("🔄 Route: Found user in localStorage");
          setLocalUser(parsedUser);
          setUser(parsedUser); // Update context
        }
      } catch (e) {
        console.error("❌ Route: Error parsing user from localStorage");
      }
      setCheckedStorage(true);
    }
  }, [user, checkedStorage, setUser, DEBUG]);

  // Use either context user or localStorage user
  const effectiveUser = user || localUser;

  // Log route access info - grouped for clarity
  useEffect(() => {
    if (DEBUG) {
      console.groupCollapsed(`🛡️ Protected Route: ${location.pathname}`);
      console.log(
        "User:",
        effectiveUser
          ? `ID: ${effectiveUser.id}, Role: ${effectiveUser.role_id}`
          : "Not authenticated"
      );
      if (allowedRoles) console.log("Required roles:", allowedRoles);
      console.groupEnd();
    }
  }, [effectiveUser, allowedRoles, location.pathname, DEBUG]);

  if (!effectiveUser) {
    if (DEBUG) console.log("⚠️ Route: No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(effectiveUser.role_id)) {
    if (DEBUG) console.log("⚠️ Route: User role not authorized");
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useAuthContext();
  const location = useLocation();

  return (
    <Layout>
      <Routes>
        {/* Public Routes - No authentication required */}
        <Route path="/" element={<Home />} />
        <Route path="/election" element={<Election />} />
        <Route path="/election/:id" element={<ElectionDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/posts" element={<Posts />} />

        {/* Public Candidate Profile View */}
        <Route path="/view-candidates/:id" element={<CandidateProfileView />} />

        {/* Protected Routes - Requires Authentication */}
        {/* Voting Process - Requires Authentication */}
        <Route
          path="/election/:id/vote"
          element={
            <ProtectedRoute allowedRoles={[1, 2, 3]}>
              <VotingProcess />
            </ProtectedRoute>
          }
        />

        {/* Candidate Protected Routes */}
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

        {/* Admin Protected Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <Routes>
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
                {/* <Route path="elections/results" element={<ElectionsReport />} /> */}
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
