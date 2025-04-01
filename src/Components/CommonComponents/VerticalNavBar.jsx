import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { User, LogIn } from "lucide-react";
import {
  navLinks,
  bottomNavLink,
  candidateLinks,
  adminNavLinks,
} from "../../../navLinks";
import { useAuthContext } from "../../utils/AuthContext";
import { logoutUser } from "../../utils/api";

function VerticalNavBar() {
  const { user, setToken } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Add this for testing different roles
  const [testRole, setTestRole] = useState(null);

  if (location.pathname === "/verify") {
    return null;
  }

  const handleSignOut = async () => {
    try {
      const token = localStorage.getItem("token");
      await logoutUser(token);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      navigate("/");
    }
  };

  const getNavigationLinks = () => {
    // If no user is logged in, show default navigation
    if (!user?.name) {
      return navLinks;
    }

    // Role 1: Student - regular student view
    if (user.role_id === 1) {
      return navLinks; // Regular navigation for students
    }

    // Role 2: Candidate - access to candidate features
    if (user.role_id === 2) {
      return candidateLinks;
    }

    // Role 3: Admin - access to admin dashboard and features
    if (user.role_id === 3) {
      return adminNavLinks;
    }

    // Default to regular navigation if role is undefined
    return navLinks;
  };

  const filteredNavLinks = getNavigationLinks();

  // Test UI controls - only show in development
  const isDevEnvironment = process.env.NODE_ENV === "development";

  return (
    <>
      <nav className="text-xl w-64 bg-[#38438c] text-[#e3e3e8] shrink-0">
        <div className="flex flex-col h-screen sticky top-0">
          {/* Fixed height header section */}
          <div className="h-[220px] mt-6 flex flex-col items-center p-4 border-b border-[#e3e3e8]">
            <div className="w-20 h-20 rounded-full bg-[#e3e3e8] flex items-center justify-center mb-2 flex-shrink-0">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <User size={40} className="text-[#38438c]" />
              )}
            </div>
            <span className="text-xl font-climate tracking-widest text-center max-w-full">
              {user?.name || "Guest"}
            </span>
          </div>

          {/* Scrollable navigation section */}
          <div className="flex-grow font-bebas tracking-widest overflow-y-auto">
            {filteredNavLinks.map((link) => (
              <NavItem key={link.path} {...link} />
            ))}

            {!user?.name && !testRole && (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 transition-colors mb-3 ${
                    isActive
                      ? "bg-[#e3e3e8] text-[#38438c]"
                      : "hover:bg-[#e3e3e8] hover:text-[#38438c]"
                  }`
                }
              >
                <LogIn size={25} />
                <span className="ml-5">Login</span>
              </NavLink>
            )}
          </div>

          {/* Fixed bottom section */}
          {(user?.name || testRole) && (
            <div onClick={handleSignOut} className="mt-auto">
              <NavItem {...bottomNavLink} />
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

const NavItem = ({ path, name, icon: Icon }) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 transition-colors mb-3 ${
          isActive
            ? "bg-[#e3e3e8] text-[#38438c]"
            : "hover:bg-[#e3e3e8] hover:text-[#38438c]"
        }`
      }
    >
      <Icon size={25} />
      <span className="ml-5">{name}</span>
    </NavLink>
  );
};

export default VerticalNavBar;
