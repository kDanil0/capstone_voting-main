import axios from "axios";

// Base URL configuration
export const BASE_URL = "http://127.0.0.1:8000";

// Create Axios instance with custom configuration
export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: false, // If you need to send cookies or other credentials with requests
    timeout: 10000, // Optional: to set a timeout for requests
});

/**
 * Helper function to get a properly formatted storage URL
 * @param {string} path The file path
 * @returns {string|null} The full URL to the file
 */
export const getStorageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('data:')) return path;
  
  // Clean the path of any leading slashes or 'storage/' prefix
  let cleanPath = path.replace(/^\/+/, '');
  if (cleanPath.startsWith('storage/')) {
    cleanPath = cleanPath.substring(8);
  }
  
  // Add cache-busting
  const timestamp = Date.now();
  
  // Full URL with direct access to Laravel storage
  return `${BASE_URL}/storage/${cleanPath}?_=${timestamp}`;
};

/**
 * Directly fetch an image from storage and return it as a data URL
 * This can bypass CORS issues since this is a direct request from our JS code
 * @param {string} path The image path
 * @returns {Promise<string>} A Promise resolving to a data URL
 */
export const fetchImageAsDataUrl = async (path) => {
  if (!path) return null;
  
  try {
    // Clean the path
    let cleanPath = path.replace(/^\/+/, '');
    if (cleanPath.startsWith('storage/')) {
      cleanPath = cleanPath.substring(8);
    }
    
    // Make request with responseType blob
    const response = await axios.get(`${BASE_URL}/storage/${cleanPath}`, {
      responseType: 'blob',
      // Add cache-busting
      params: { _: Date.now() }
    });
    
    // Convert blob to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(response.data);
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

export const webLoginUser = async (loginData, isAdmin = false) => {
    try {
        const endpoint = isAdmin ? '/api/admin-login' : '/api/web-login';
        console.log(`Using endpoint: ${endpoint} for ${isAdmin ? 'admin' : 'user'} login`);
        
        // Add a timestamp to prevent caching
        const response = await axiosInstance.post(`${endpoint}?_=${Date.now()}`, loginData);
        
        console.log("Raw API response:", JSON.stringify(response.data, null, 2));
        
        // Normalize the response structure
        let normalizedResponse = {
            success: false,
            message: "",
            data: {
                token: null,
                user: null
            }
        };
        
        // Check for success message regardless of the success flag
        const isMessageSuccessful = response.data.message && 
            response.data.message.toLowerCase().includes("successful");
            
        // Override the success flag if message indicates success
        const isActuallySuccessful = response.data.success || isMessageSuccessful;
        
        // Extract token - might be at different locations in response
        let token = null;
        if (response.data.data && response.data.data.token) {
            token = response.data.data.token;
        } else if (response.data.token) {
            token = response.data.token;
        }
        
        // Extract user data - might be at different locations
        let userData = null;
        if (response.data.data && response.data.data.user) {
            userData = response.data.data.user;
        } else if (response.data.user) {
            userData = response.data.user;
        }
        
        // Check if we have a token despite odd response structure
        if (token) {
            normalizedResponse = {
                success: true,
                message: response.data.message || "Login successful",
                data: {
                    token: token,
                    user: userData
                }
            };
        } 
        // If it says success but no token, try to create a minimal response
        else if (isActuallySuccessful) {
            normalizedResponse = {
                success: true,
                message: response.data.message || "Login successful",
                data: {
                    token: "temp_token_" + Math.random().toString(36).substring(2),
                    user: {
                        student_id: userData?.student_id || loginData.student_id || "",
                        role_id: isAdmin ? 3 : (userData?.role_id || 1),
                        name: userData?.name || "User"
                    }
                }
            };
        } else {
            // It's truly an error
            normalizedResponse = {
                success: false,
                message: response.data.message || "Login failed",
                data: null
            };
        }
        
        console.log("Normalized response:", normalizedResponse);
        return normalizedResponse;
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Network error. Please try again later.",
            data: null
        };
    }
};


export const logoutUser = async (token) => {
    try {
        const response = await axiosInstance.post('/api/logout', {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error logging out", error);
        throw error.response ? error.response.data : error;
    }
};

export const getUser = async (token) => {
    try {
        if (!token) {
            console.log("No token provided to getUser");
            return null;
        }
        
        console.log("Fetching user data with token:", token);
        const response = await axiosInstance.get('/api/user', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("User data response:", response.data);
        
        // Make sure we're returning the user data in the correct format
        // Handle different response formats
        if (response.data.user) {
            return response.data.user;
        } else if (response.data.data) {
            return response.data.data;
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        // Return null instead of throwing to prevent app crashes
        return null;
    }
};

export const getDepartments = async () => {
    try {
        const response = await axiosInstance.get('/api/getDepartments');
        console.log(response.data.departments)
        return response.data.departments;
    } catch (error) {
        console.error("Error fetching department data:", error);
        throw error
    }
}

export const getAllElections = async (token) => {
    try {
        const response = await axiosInstance.get('/api/elections', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching elections", error);
        throw error
    }
}

// export const getAllRegistered = async (token) => {
//     try {
//         const response = await axiosInstance.get('/api/election/registered', {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         });
//         return response.data;
//     } catch {
//         console.error("Error fetching registered voters", error);
//         throw error
//     }
// }

export const getPublicElectionDetails = async (electionId) => {
    try {
      const response = await axiosInstance.get(`/api/elections/${electionId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching public election details:", error);
      throw error;
    }
  };

export const getElectionDetails = async (token, electionId) => {
  try {
    // Extract the base ID (in case query parameters were added)
    const baseId = electionId.toString().split('?')[0];
    
    // Make sure we're calling the correct endpoint that returns vote status
    const response = await axiosInstance.get(`/api/votes/election/${baseId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      // Add cache control to prevent caching
      params: {
        _: new Date().getTime() // Add timestamp to prevent caching
      },
      // Extend timeout for this specific request as it might be slow
      timeout: 30000 // 30 seconds instead of the default 10 seconds
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching election details:", error);
    
    // Create a standardized error response object that won't cause downstream issues
    const errorResponse = {
      success: false,
      hasVoted: false,
      userVoteDetails: null,
      message: 'Failed to fetch election details'
    };
    
    // Add more specific error information if available
    if (error.response) {
      const status = error.response.status;
      
      if (status === 500) {
        errorResponse.message = 'Server error (500): The server encountered an internal error. Please contact support.';
      } else if (status === 404) {
        errorResponse.message = 'Election not found (404): The requested election does not exist.';
      } else if (status === 401 || status === 403) {
        errorResponse.message = 'Authentication error: You are not authorized to access this election.';
      } else {
        errorResponse.message = `Error (${status}): ${error.response.data?.message || 'Unknown error occurred'}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorResponse.message = 'Network error: No response received from server. Please check your connection.';
    } else {
      // Something happened in setting up the request
      errorResponse.message = `Request configuration error: ${error.message}`;
    }
    
    return errorResponse;
  }
};

// For backward compatibility, make getElectionById an alias to getElectionDetails
export const getElectionById = getElectionDetails;

export const getAllCandidates = async () => {
    try {
        const response = await axiosInstance.get(`/api/candidate/all`);
        console.log('reached function')
        return response.data;
    } catch (error) {
        console.error("Error fetching candidates details", error);
        throw error
    }
}

export const getAllPositions = async () => {
    try {
        const response = await axiosInstance.get(`/api/positions/all`,);
        console.log('reached function')
        return response.data;
    } catch (error) {
        console.error("Error fetching candidates details", error);
        throw error
    }
}

export const getAllPartylists = async (token) => {
    try {
        const response = await axiosInstance.get(`/api/partylists/all`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        console.log('reached function')
        return response.data;
    } catch (error) {
        console.error("Error fetching candidates details", error);
        throw error
    }
}

//get departments
export const getDepartmentsList = async (token) => {
    try {
        const response = await axiosInstance.get(`/api/admin/departments/all`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data
    } catch (error) {
        // Check if the error has a response object (e.g., server responded with a status code)
        if (error.response) {
            console.error("Error during election creation:", error.response);
            return { success: false, message: error.response.data.message || 'An error occurred during election creation' };
        } else {
            // If no response (e.g., network error), handle it here
            console.error("Network or other error:", error);
            return { success: false, message: 'A network error occurred. Please try again later.' };
        }
    }
}

export const getDepartmentById = async (token, id) => {
    try {
        const response = await axiosInstance.get(`/api/admin/departments/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data
    } catch (error) {
        // Check if the error has a response object (e.g., server responded with a status code)
        if (error.response) {
            console.error("Error during election creation:", error.response);
            return { success: false, message: error.response.data.message || 'An error occurred during election creation' };
        } else {
            // If no response (e.g., network error), handle it here
            console.error("Network or other error:", error);
            return { success: false, message: 'A network error occurred. Please try again later.' };
        }
    }
}

//register -> provide student_id, name, department, email, contact, -> unique id


// Get candidate ID from student ID
export const getCandidateId = async (token, student_id) => {
    try {
        const response = await axiosInstance.get(`/api/candidate-id/${student_id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching candidate ID:", error);
        throw error;
    }
};

// Get candidate details by ID
export const getCandidate = async (token, candidateId) => {
    try {
        const response = await axiosInstance.get(`/api/candidates/${candidateId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching candidate details:", error);
        throw error;
    }
};

// Update candidate bio
export const updateCandidateBio = async (token, candidateId, bio) => {
    try {
        const response = await axiosInstance.post(`/api/candidates/${candidateId}/bio`, 
            { bio },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating bio:", error);
        throw error;
    }
};

// Upload profile photo
export const uploadProfilePhoto = async (token, candidateId, photoFile) => {
    try {
        const formData = new FormData();
        formData.append('profile_photo', photoFile);

        const response = await axiosInstance.post(
            `/api/candidates/${candidateId}/upload-photo`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error uploading photo:", error);
        throw error;
    }
};

// Add this function to your api.js file
export const getCandidatesByElection = async (electionId) => {
  try {
    const response = await axiosInstance.get(`/api/elections/${electionId}/candidates`);
    return response.data;
  } catch (error) {
    console.error("Error fetching candidates by election:", error);
    throw error;
  }
};

// Function to submit votes
export const submitVote = async (token, voteData) => {
  try {
    const response = await axiosInstance.post('/api/vote/cast', voteData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting vote:", error);
    // Return a structured error object that can be handled in the component
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to submit vote'
    };
  }
};

// Create a new post (for candidates)
export const createPost = async (token, postData) => {
  try {
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    
    // Add image if present
    if (postData.image) {
      formData.append('image', postData.image);
    }
    
    const response = await axiosInstance.post('/api/candidates/posts/upload', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data', // Important for file uploads
      }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create post'
    };
  }
};

// Fetch all approved posts (authenticated and non-authenticated endpoints)
export const getApprovedPosts = async (token = null, page = 1, perPage = 5, search = '') => {
  try {
    // Create request config with pagination parameters
    const config = {
      params: {
        page,
        per_page: perPage
      },
      headers: {}
    };
    
    // Add search parameter if provided
    if (search && search.trim()) {
      config.params.search = search.trim();
    }
    
    // Use different endpoints based on authentication status
    const endpoint = token 
      ? '/api/posts/approved'  // Authenticated endpoint
      : '/api/posts/approved/public';  // Public endpoint
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await axiosInstance.get(endpoint, config);
    
    // Return posts, pagination metadata, and hasMore flag
    return {
      success: true,
      data: response.data.posts || [],
      pagination: response.data.pagination || {},
      hasMore: response.data.pagination?.current_page < response.data.pagination?.last_page
    };
  } catch (error) {
    console.error("Error fetching approved posts:", error);
    return {
      success: false,
      data: [],
      pagination: {},
      hasMore: false,
      error: error.response?.data?.message || "Failed to fetch posts"
    };
  }
};

// Fetch approved posts for a specific candidate
export const getApprovedPostsByCandidate = async (token, candidateId) => {
  try {
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : { headers: {} };
    
    const response = await axiosInstance.get(`/api/posts/approved/${candidateId}`, config);
    
    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    console.error("Error fetching candidate posts:", error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || "Failed to fetch candidate posts"
    };
  }
};

// Get admin election details by ID
export const getAdminElectionDetails = async (electionId) => {
  try {
    const response = await axiosInstance.get(`/api/elections/${electionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin election details:", error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch election details'
    };
  }
};

/**
 * Format date for MySQL compatibility
 * @param {string} dateString - Date string to format
 * @returns {string|null} MySQL formatted date string or null if invalid
 */
const formatDateForMySQL = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19).replace('T', ' '); // Format as YYYY-MM-DD HH:MM:SS
  } catch (error) {
    console.error("Date formatting error:", error);
    return null;
  }
};

/**
 * Updates election details in the database
 * @param {string} token - Authentication token
 * @param {Object} electionData - Election data to update
 * @returns {Object} Response with success status, message, and updated data
 */
export const editElection = async (token, electionData) => {
  try {
    // Prepare request data with proper types
    const requestData = {
      election_id: parseInt(electionData.election_id),
      election_name: electionData.election_name,
      status: electionData.status,
      campaign_start_date: electionData.campaign_start_date,
      campaign_end_date: electionData.campaign_end_date,
      election_start_date: electionData.election_start_date,
      election_end_date: electionData.election_end_date
    };
    
    // Make API request to update election
    const response = await axiosInstance.put('/api/admin/election/edit', requestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    return {
      success: true,
      message: response.data.message || 'Election updated successfully',
      data: response.data.election || response.data.data || response.data
    };
  } catch (error) {
    console.error("Error editing election:", error);
    
    // Provide detailed error information for debugging
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update election',
      error: error.response?.data
    };
  }
};

/**
 * Delete election (for admin)
 * @param {string} token - Auth token
 * @param {number} electionId - ID of the election to delete
 * @returns {Object} Response with success status and message
 */
export const deleteElection = async (token, electionId) => {
  try {
    const response = await axiosInstance.delete(`api/admin/election/delete/${electionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      message: response.data.message || 'Election deleted successfully'
    };
  } catch (error) {
    console.error("Error deleting election:", error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete election',
      error: error.response?.data
    };
  }
};

/**
 * Fetches all students with pagination and search
 * @param {string} token - Auth token
 * @param {number} page - Current page
 * @param {number} perPage - Items per page
 * @param {string} search - Search term
 * @returns {Object} Response with student data and pagination
 */
export const getAllStudents = async (token, page = 1, perPage = 40, search = '') => {
  try {
    const params = { page, per_page: perPage };
    if (search) params.search = search;

    // Check if token exists
    if (!token) {
      console.error("No auth token provided for getAllStudents");
      return {
        success: false,
        students: [],
        pagination: {},
        message: 'Authentication token is missing'
      };
    }

    // Use the fully qualified URL to avoid any path issues
    const fullUrl = `${BASE_URL}/api/admin/students/all`;
    console.log("Making API request to:", fullUrl, "with params:", params);

    const response = await axiosInstance.get(fullUrl, {
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Raw API response:", response.data);
    
    return {
      success: true,
      students: response.data.students || [],
      pagination: response.data.pagination || {
        current_page: 1,
        total: 0,
        per_page: perPage
      },
      message: response.data.message || 'Students retrieved successfully'
    };
  } catch (error) {
    console.error("Error fetching students:", error);
    
    // Provide detailed error information for debugging
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    
    return {
      success: false,
      students: [],
      pagination: { current_page: 1, total: 0, per_page: perPage },
      message: error.response?.data?.message || error.message || 'Failed to fetch students'
    };
  }
};

/**
 * Creates a new student
 * @param {string} token - Auth token
 * @param {Object} studentData - Student data (id, name, department_id, email)
 * @returns {Object} Response with success status, message, and created student data
 */
export const addStudent = async (token, studentData) => {
  try {
    // Ensure numeric fields are actually numbers
    const formattedData = {
      ...studentData,
      id: Number(studentData.id),
      department_id: Number(studentData.department_id),
    };
    
    console.log("Sending student data to API:", formattedData);
    
    const response = await axiosInstance.post(`${BASE_URL}/api/admin/students/make`, formattedData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      message: response.data.message || 'Student created successfully',
      student: response.data.student,
      user: response.data.user,
      otp: response.data.otp
    };
  } catch (error) {
    console.error("Error creating student:", error);
    
    // Provide detailed error information for debugging
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      
      // Return the actual error from the server
      return {
        success: false,
        message: error.response.data.message || 'Failed to create student',
        error: error.response.data.error || error.response.data
      };
    }
    
    return {
      success: false,
      message: error.message || 'Network error while creating student',
      error: error
    };
  }
};

/**
 * Batch upload students using CSV file
 * @param {string} token - Auth token
 * @param {File} file - CSV file containing student data
 * @returns {Object} Response with success status and message
 */
export const batchUploadStudents = async (token, file) => {
  try {
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('file', file); // Changed from 'csv_file' to 'file' to match backend
    
    const response = await axiosInstance.post(`${BASE_URL}/api/admin/students/import`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return {
      success: response.data.success || true,
      message: response.data.message || 'Students uploaded successfully',
      data: response.data,
      errors: response.data.errors || null
    };
  } catch (error) {
    console.error("Error batch uploading students:", error);
    
    // Provide detailed error information for debugging
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      
      return {
        success: false,
        message: error.response.data.message || 'Failed to upload students',
        errors: error.response.data.errors || null,
        error: error.response.data
      };
    }
    
    return {
      success: false,
      message: error.message || 'Network error while uploading students',
      error: error
    };
  }
};

/**
 * Delete a student by ID
 * @param {string} token - Auth token
 * @param {number|string} studentId - ID of the student to delete
 * @returns {Object} Response with success status and message
 */
export const deleteStudent = async (token, studentId) => {
  try {
    // Ensure studentId is properly formatted
    const id = String(studentId).trim();
    
    const response = await axiosInstance.delete(`${BASE_URL}/api/admin/students/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    return {
      success: true,
      message: response.data.message || 'Student deleted successfully'
    };
  } catch (error) {
    console.error("Error deleting student:", error);
    
    // Provide detailed error information for debugging
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      
      return {
        success: false,
        message: error.response.data.message || 'Failed to delete student',
        error: error.response.data.error || error.response.data
      };
    }
    
    return {
      success: false,
      message: error.message || 'Network error while deleting student',
      error: error
    };
  }
};

/**
 * Generate token OTP for student(s)
 * @param {string} token - Auth token
 * @param {number|string|Array} studentIds - ID or array of IDs of the students to generate tokens for
 * @returns {Object} Response with success status, message, and generated tokens
 */
export const generateStudentToken = async (token, studentIds) => {
  try {
    // Ensure studentIds is an array
    const ids = Array.isArray(studentIds) ? studentIds : [studentIds];
    
    const response = await axiosInstance.post(`${BASE_URL}/api/admin/token/generate`, 
      { student_ids: ids },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      success: true,
      message: response.data.message || 'Tokens generated successfully',
      results: response.data.results || {}
    };
  } catch (error) {
    console.error("Error generating tokens:", error);
    
    // Provide detailed error information for debugging
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      
      return {
        success: false,
        message: error.response.data.message || 'Failed to generate tokens',
        error: error.response.data.error || error.response.data
      };
    }
    
    return {
      success: false,
      message: error.message || 'Network error while generating tokens',
      error: error
    };
  }
};

/**
 * Creates a new election (for admin)
 * @param {string} token - Auth token
 * @param {Object} electionData - Election data to create
 * @returns {Object} Response with success status, message, and created election
 */
export const createElection = async (token, electionData) => {
  try {
    // Format dates for MySQL compatibility
    const formattedData = {
      election_name: electionData.election_name,
      election_type_id: electionData.election_type_id,
      department_id: electionData.department_id || null,
      campaign_start_date: formatDateForMySQL(electionData.campaign_start_date),
      campaign_end_date: formatDateForMySQL(electionData.campaign_end_date),
      election_start_date: formatDateForMySQL(electionData.election_start_date),
      election_end_date: formatDateForMySQL(electionData.election_end_date),
      status: electionData.status
    };

    const response = await axiosInstance.post('api/elections/make', formattedData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      message: response.data.message || 'Election created successfully',
      election: response.data.election
    };
  } catch (error) {
    console.error("Error creating election:", error);
    
    // Provide detailed error information for debugging
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create election',
      error: error.response?.data
    };
  }
};

