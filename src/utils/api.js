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

export const webLoginUser = async (formData) => {
    try {
        const response = await axiosInstance.post('/api/web-login', formData);
        
        // The backend returns { status, message, data: { user, token } }
        if (response.data.status === 'request was successful') {
            // Extract directly from response.data.data
            const { user, token } = response.data.data;
            
            return {
                success: true,
                data: {
                    token,
                    user
                }
            };
        }
        
        return {
            success: false,
            message: response.data.message || 'Login failed'
        };
    } catch (error) {
        console.error("Error during web login:", error);
        return {
            success: false,
            message: error.response?.data?.message || 'An error occurred during login'
        };
    }
};

// export const registerUser = async (formData) => {
//     try {
//         const response = await axiosInstance.post('/api/register', formData);
//         return response.data.data;  // return the API response
//     } catch (error) {
//         console.error("Error during registration:", error.response);
//         return error.response.data;  // throw the error response for handling in the component
//     }
// };

// export const loginUser = async (formData) => {
//     try {
//         const response = await axiosInstance.post('/api/login', formData);
//         return response.data.data;  // return the API response

//     } catch (error) {
//         console.error("Error during login:", error);
//         return error.response.data;  // throw the error response for handling in the component
//     }
// }

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
        const response = await axiosInstance.get('/api/user', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Make sure we're returning the user data in the correct format
        return response.data.user || response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
};

export const getDepartments = async () => {
    try {
        const response = await axiosInstance.get('/api/getDepartments');
        console.log(response.data.departments)
        return response.data.departments;
    } catch {
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
    } catch {
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
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching election details:", error);
    return {
      success: false,
      hasVoted: false,
      userVoteDetails: null,
      message: error.response?.data?.message || 'Failed to fetch election details'
    };
  }
};

// For backward compatibility, make getElectionById an alias to getElectionDetails
export const getElectionById = getElectionDetails;

export const getAllCandidates = async () => {
    try {
        const response = await axiosInstance.get(`/api/candidate/all`);
        console.log('reached function')
        return response.data;
    } catch {
        console.error("Error fetching candidates details", error);
        throw error
    }
}

export const getAllPositions = async () => {
    try {
        const response = await axiosInstance.get(`/api/positions/all`,);
        console.log('reached function')
        return response.data;
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
        return response.data; n 
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

