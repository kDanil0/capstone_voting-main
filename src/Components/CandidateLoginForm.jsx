import React, { useState } from "react";
// import { loginCandidate } from "../utils/api"; // You'll need to create this function
import { useNavigate } from "react-router-dom";

const CandidateLoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const response = await loginCandidate(formData);

      if (response.success) {
        setSuccessMessage(response.message);
        // Navigate to candidate dashboard or home page
        navigate("/candidate-profile", {
          state: {
            user: response.user,
          },
        });
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-4/12 mx-auto mt-8 p-8 bg-white rounded-2xl">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-climate tracking-wider mt-4 font-bold text-[#3F51B5]">
          Candidate Login
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            className="block text-md font-medium font-assistant text-gray-700 mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="font-assistant w-full px-4 py-2 rounded-lg bg-[#F5F5F5] border border-gray-200
                     focus:border-[#3F51B5] focus:ring-1 focus:ring-[#3F51B5] outline-none
                     transition-all"
            required
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label
            className="block text-md font-medium font-assistant text-gray-700 mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="font-assistant w-full px-4 py-2 rounded-lg bg-[#F5F5F5] border border-gray-200
                     focus:border-[#3F51B5] focus:ring-1 focus:ring-[#3F51B5] outline-none
                     transition-all"
            required
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`font-assistant w-full py-3 px-4 rounded-lg font-bold text-white
                     ${
                       isLoading
                         ? "bg-gray-400 cursor-not-allowed"
                         : "bg-[#3F51B5] hover:bg-[#4B5FCD] transition-colors"
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
            "Login"
          )}
        </button>
      </form>
    </div>
  );
};

export default CandidateLoginForm;