import React, { useState, useEffect } from "react";
import { webLoginUser } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../utils/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { setToken, user } = useAuthContext();
  const [formData, setFormData] = useState({
    student_id: "",
    tokenOTP: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (shouldRedirect && user) {
      if (user.role_id === 2) {
        navigate('/candidate/profile');
      } else {
        navigate('/');
      }
      setShouldRedirect(false);
    }
  }, [shouldRedirect, user, navigate]);

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
      const response = await webLoginUser(formData);
      console.log('Login response:', response);
      console.log('Raw API response data:', response.data);

      if (response.success && response.data?.token) {
        console.log('Token to be set:', response.data.token);
        setToken(response.data.token);
        setSuccessMessage("Login successful!");
        setShouldRedirect(true);
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
        <h2 className="text-3xl font-climate text-[#38438c] mb-2">Welcome</h2>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm">
          {error}
        </div>
      )}

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
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white text-center
                     ${
                       isLoading
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
          ) : (
            "Log In"
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
