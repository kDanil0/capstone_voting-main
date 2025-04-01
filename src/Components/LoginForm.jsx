import React, { useState, useEffect } from "react";
import { webLoginUser } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../utils/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { setToken, user, setUser } = useAuthContext();
  const [formData, setFormData] = useState({
    student_id: "",
    tokenOTP: "",
    email: "",
  });
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempt, setLoginAttempt] = useState(0);

  // Debug user state
  useEffect(() => {
    console.log("Current user state in LoginForm:", user);
  }, [user]);

  // Handle redirect after successful login
  useEffect(() => {
    if (loginAttempt > 0 && successMessage) {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const role_id = userData.role_id || 1;

      let redirectPath = "/";
      if (role_id === 3) {
        redirectPath = "/admin/elections";
      } else if (role_id === 2) {
        redirectPath = "/candidate/profile";
      }

      console.log(`Redirecting to ${redirectPath} (Attempt ${loginAttempt})`);

      // Use a combination of setTimeout and window.location for reliability
      const redirectTimer = setTimeout(() => {
        // Use replace instead of href for a cleaner history
        window.location.replace(redirectPath);
      }, 1000);

      return () => clearTimeout(redirectTimer);
    }
  }, [loginAttempt, successMessage]);

  // Backup redirection mechanism if the direct method fails
  useEffect(() => {
    if (loginAttempt > 0 && successMessage) {
      try {
        // Get user data from localStorage
        const userDataStr = localStorage.getItem("user");
        if (!userDataStr) {
          console.error("No user data in localStorage for backup redirection");
          return;
        }

        const userData = JSON.parse(userDataStr);
        const role_id = Number(userData.role_id || 1);

        let redirectPath = "/";
        if (role_id === 3) {
          redirectPath = "/admin/elections";
        } else if (role_id === 2) {
          redirectPath = "/candidate/profile";
        }

        console.log(
          `BACKUP Redirection to ${redirectPath} (Attempt ${loginAttempt})`
        );

        // Wait longer for backup redirection to avoid conflict with primary method
        const redirectTimer = setTimeout(() => {
          console.log("Executing backup redirection");
          window.location.href = redirectPath;
        }, 2000);

        return () => clearTimeout(redirectTimer);
      } catch (error) {
        console.error("Error in backup redirection:", error);
      }
    }
  }, [loginAttempt, successMessage]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Clear previous authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const response = await webLoginUser(formData, isAdminLogin);
      console.log(
        "Login response structure:",
        JSON.stringify(response, null, 2)
      );

      if (response.success && response.data) {
        // Get token and role_id from the normalized response
        const token = response.data.token;

        // Ensure we have user data with the correct role
        const userData = response.data.user || {
          student_id: formData.student_id,
          role_id: isAdminLogin ? 3 : 1, // Default to admin role if admin login, otherwise user
          name: formData.student_id || "User",
        };

        console.log("Extracted user data:", userData);

        // Explicitly set the role_id if not present
        if (!userData.role_id) {
          userData.role_id = isAdminLogin ? 3 : 1;
        }

        // Ensure role_id is a number
        userData.role_id = Number(userData.role_id);

        // Store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Set in context
        setToken(token);
        setUser(userData);

        // Determine redirect path based on role
        let redirectPath = "/";
        if (userData.role_id === 3) {
          redirectPath = "/admin/elections";
          console.log("Admin login detected - redirecting to admin dashboard");
        } else if (userData.role_id === 2) {
          redirectPath = "/candidate/profile";
          console.log(
            "Candidate login detected - redirecting to candidate profile"
          );
        } else {
          console.log("Student login detected - redirecting to home");
        }

        // Show success message
        setSuccessMessage(`Login successful! Redirecting to ${redirectPath}`);

        console.log(`Forcing redirect to ${redirectPath}`);

        // Force immediate redirect - most reliable method
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 800);
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLoginMode = () => {
    setIsAdminLogin(!isAdminLogin);
    setFormData({
      student_id: "",
      tokenOTP: "",
      email: "",
    });
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="w-full">
      {/* Logo for mobile view only */}
      <div className="md:hidden flex justify-center mb-8">
        <img
          src="/src/assets/logo.png"
          alt="School Logo"
          className="w-24 h-24 object-contain"
        />
      </div>

      {/* Form header */}
      <div className="mb-8">
        <h2 className="text-3xl font-climate text-[#38438c] mb-2">
          {isAdminLogin ? "Admin Login" : "Welcome"}
        </h2>
        <button
          onClick={toggleLoginMode}
          className="text-sm text-[#38438c] hover:underline mt-2"
        >
          {isAdminLogin ? "Switch to Student Login" : "Switch to Admin Login"}
        </button>
      </div>

      {/* Error message */}
      {error && !successMessage && (
        <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm">
          {error}
        </div>
      )}

      {/* Success message - ensure this doesn't show alongside error */}
      {successMessage && (
        <div className="mb-6 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="student_id"
          >
            Student ID
          </label>
          <input
            type="text"
            id="student_id"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300
                     focus:border-[#38438c] focus:ring-2 focus:ring-[#38438c] focus:ring-opacity-30 outline-none
                     transition-all"
            required
            placeholder="Enter your student ID"
          />
        </div>

        {isAdminLogin && (
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300
                       focus:border-[#38438c] focus:ring-2 focus:ring-[#38438c] focus:ring-opacity-30 outline-none
                       transition-all"
              required
              placeholder="Enter your email"
            />
          </div>
        )}

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="tokenOTP"
          >
            One Time Password
          </label>
          <input
            type="text"
            id="tokenOTP"
            name="tokenOTP"
            value={formData.tokenOTP}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300
                     focus:border-[#38438c] focus:ring-2 focus:ring-[#38438c] focus:ring-opacity-30 outline-none
                     transition-all"
            required
            placeholder="Enter your One Time Password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !!successMessage}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white text-center
                     ${
                       isLoading || !!successMessage
                         ? "bg-gray-400 cursor-not-allowed"
                         : "bg-[#38438c] hover:bg-[#2d3570] transition-colors"
                     }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : successMessage ? (
            "Redirecting..."
          ) : (
            `${isAdminLogin ? "Admin Log In" : "Log In"}`
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
