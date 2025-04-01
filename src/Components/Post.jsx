import React, { useState, useRef, useEffect, useCallback } from "react";
// Add Material UI Icons import
import { PhotoCamera, Videocam, Close } from "@mui/icons-material";
import { useAuthContext } from "../utils/AuthContext";
import {
  createPost,
  getApprovedPosts,
  getApprovedPostsByCandidate,
  getStorageUrl,
  BASE_URL,
} from "../utils/api";

/**
 * Post component that displays posts with optional filtering by candidate
 * @param {Object} props Component props
 * @param {boolean} props.readOnly Whether the component is in read-only mode
 * @param {number|null} props.candidateId Optional candidate ID to filter posts
 */
const Post = ({ readOnly: forcedReadOnly = false, candidateId = null }) => {
  const { user, token } = useAuthContext();

  // Access control - read-only if explicitly set or not authenticated
  const readOnly = forcedReadOnly || !token;

  // ===== STATE MANAGEMENT =====
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Posts states
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({});

  // Refs
  const fileInputRef = useRef(null);
  const observerRef = useRef(null);
  const postsContainerRef = useRef(null);

  // ===== DATA FETCHING =====
  /**
   * Fetch posts - either all approved posts or posts for a specific candidate
   * @param {boolean} isLoadingMore Whether this is a "load more" request or initial load
   * @param {number} pageNumber Page number to fetch
   */
  const fetchPosts = useCallback(
    async (isLoadingMore = false, pageNumber = 1) => {
      try {
        // Set loading states
        isLoadingMore ? setLoadingMore(true) : setPostsLoading(true);
        setPostsError(null);

        // Choose API endpoint based on whether filtering by candidate
        let result;
        if (candidateId) {
          // Fetch only posts for the specified candidate
          result = await getApprovedPostsByCandidate(token, candidateId);
        } else {
          // Fetch paginated posts for all candidates
          result = await getApprovedPosts(token, pageNumber, 5, "");
        }

        if (result.success) {
          if (candidateId) {
            // Candidate-specific posts (no pagination)
            setPosts(result.data || []);
            setHasMore(false);
          } else {
            // General posts with pagination
            if (isLoadingMore) {
              // Append new posts to existing ones, avoiding duplicates
              setPosts((prevPosts) => {
                const existingIds = new Set(prevPosts.map((post) => post.id));
                const uniqueNewPosts = result.data.filter(
                  (post) => !existingIds.has(post.id)
                );
                return [...prevPosts, ...uniqueNewPosts];
              });
            } else {
              // Replace all posts for initial load
              setPosts(result.data || []);
            }
            // Update pagination info
            setPagination(result.pagination || {});
            setHasMore(result.hasMore || false);
          }
        } else {
          setPostsError(result.error || "Failed to fetch posts");
          setPosts([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error in fetchPosts:", err);
        setPostsError("An unexpected error occurred while fetching posts");
        setPosts([]);
        setHasMore(false);
      } finally {
        setPostsLoading(false);
        setLoadingMore(false);
      }
    },
    [token, candidateId]
  );

  // Fetch more posts when scrolling to the bottom
  const loadMorePosts = useCallback(() => {
    if (!hasMore || loadingMore || postsLoading) return;
    setPage((prevPage) => prevPage + 1);
  }, [hasMore, loadingMore, postsLoading]);

  // ===== FORM HANDLING =====
  /**
   * Handle image selection in the post form
   * @param {Event} e Change event from the file input
   */
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        setErrorMessage("Image size must be less than 2MB");
        return;
      }

      setFormData({ ...formData, image: file });

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  /**
   * Remove selected image from the form
   */
  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Handle form field changes
   * @param {Event} e Change event from form fields
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Toggle post creation form visibility
   */
  const togglePostForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      // Reset form when opening
      setFormData({ title: "", content: "", image: null });
      setPreview(null);
      setErrorMessage("");
      setSuccessMessage("");
    }
  };

  /**
   * Submit post creation form
   */
  const handleSubmit = async () => {
    // Form validation
    if (!formData.title.trim()) {
      setErrorMessage("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      setErrorMessage("Content is required");
      return;
    }

    // Submit the form
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await createPost(token, formData);

      if (response.success) {
        // Show success message and reset form
        setSuccessMessage(
          "Post created successfully! It will be reviewed by an admin."
        );
        setFormData({ title: "", content: "", image: null });
        setPreview(null);
        setShowForm(false);

        // Refresh posts
        if (candidateId) {
          // Refresh candidate-specific posts
          fetchPosts(false, 1);
        } else {
          // Refresh all posts
          setPage(1);
          setPosts([]);
          fetchPosts(false, 1);
        }
      } else {
        setErrorMessage(
          response.message || "Failed to create post. Please try again."
        );
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== EFFECTS =====
  // Initialize intersection observer for infinite scrolling
  const lastPostElementRef = useCallback(
    (node) => {
      if (loadingMore) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            hasMore &&
            !loadingMore &&
            !postsLoading
          ) {
            loadMorePosts();
          }
        },
        { threshold: 0.5 }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loadingMore, hasMore, postsLoading, loadMorePosts]
  );

  // Fetch posts on page change
  useEffect(() => {
    const isInitialLoad = page === 1;
    fetchPosts(isInitialLoad ? false : true, page);
  }, [page, fetchPosts]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchPosts(false, 1);
  }, []);

  // ===== HELPERS =====
  /**
   * Format date to "time ago" format
   * @param {string} dateString ISO date string
   * @returns {string} Formatted date string
   */
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? "1 year ago" : `${interval} years ago`;
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1 ? "1 month ago" : `${interval} months ago`;
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? "1 day ago" : `${interval} days ago`;
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
    }

    return seconds < 10 ? "just now" : `${Math.floor(seconds)} seconds ago`;
  };

  /**
   * Get the full storage URL for a file path
   * @param {string} path The relative file path
   * @returns {string|null} The full storage URL or null if no path provided
   */
  const getStorageUrl = (path) => {
    if (!path) return null;
    const baseUrl = BASE_URL.replace(/\/+$/, "");
    const cleanPath = path.replace(/^\/+/, "");
    return `${baseUrl}/storage/${cleanPath}`;
  };

  return (
    <div className="flex flex-col h-full w-full -mt-8 pt-4">
      {/* Main Content */}
      <div className="flex-grow overflow-y-auto" ref={postsContainerRef}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Authentication Message for non-authenticated users */}
          {!token && !forcedReadOnly && (
            <div className="bg-blue-50 border border-blue-300 text-blue-800 px-4 py-3 rounded mb-4">
              <p className="font-medium">Sign in to create posts</p>
              <p className="text-sm">
                You can view all approved candidate posts without signing in.
              </p>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage("")}>
                <Close className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Create Post Section - Only show if not readOnly */}
          {!readOnly && (
            <div className="bg-white rounded-lg shadow-sm p-4 my-4">
              <div className="flex flex-col">
                {/* User input area */}
                <div className="flex items-start gap-3 pb-3 border-b border-gray-300">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0">
                    {user?.profile_photo && (
                      <img
                        src={user.profile_photo}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-grow">
                    {!showForm ? (
                      <textarea
                        className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white text-gray-600 rounded-lg py-2.5 px-4 transition-colors min-h-[60px] resize-none"
                        placeholder="Share your platforms here"
                        onClick={togglePostForm}
                        readOnly
                      ></textarea>
                    ) : (
                      <div className="w-full bg-white rounded-lg">
                        {/* Error message */}
                        {errorMessage && (
                          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {errorMessage}
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Post Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#3F4B8C]"
                            placeholder="Enter a title for your post"
                            maxLength={255}
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Content
                          </label>
                          <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#3F4B8C] min-h-[120px] resize-none"
                            placeholder="Share your message with voters"
                          ></textarea>
                        </div>

                        {/* Image preview */}
                        {preview && (
                          <div className="mb-4 relative">
                            <img
                              src={preview}
                              alt="Preview"
                              className="max-h-40 rounded-lg"
                            />
                            <button
                              onClick={removeImage}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <Close className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Post type options */}
                <div className="flex justify-between pt-2 mt-1">
                  <div className="flex">
                    <button
                      className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!showForm}
                    >
                      <div
                        className={`${
                          !showForm ? "text-gray-400" : "text-[#3F4B8C]"
                        }`}
                      >
                        <PhotoCamera />
                      </div>
                      <span
                        className={`font-medium text-lg font-assistant ${
                          !showForm ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Photo
                      </span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      className="hidden"
                      accept="image/jpeg,image/png,image/jpg"
                    />
                  </div>
                  <div>
                    {showForm && (
                      <button
                        onClick={togglePostForm}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-assistant font-bold py-2 px-4 rounded-lg transition-colors mr-2"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={showForm ? handleSubmit : togglePostForm}
                      disabled={isSubmitting}
                      className={`bg-[#2F3875] hover:bg-[#3a4589] text-white font-assistant font-bold py-2 px-4 rounded-lg transition-colors ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {showForm
                        ? isSubmitting
                          ? "Posting..."
                          : "Submit Post"
                        : "Make a Post"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading state - Only show on initial load */}
          {postsLoading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-[#38438c] rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading posts...</p>
            </div>
          )}

          {/* Error state */}
          {postsError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {postsError}
            </div>
          )}

          {/* No posts state */}
          {!postsLoading && !postsError && posts.length === 0 && (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl text-gray-700 mb-2">No Posts Found</h3>
              <p className="text-gray-500">
                {readOnly
                  ? "There are no approved posts to display yet."
                  : "You don't have any approved posts yet. Create a new post to get started!"}
              </p>
            </div>
          )}

          {/* Posts List */}
          {!postsLoading && !postsError && posts.length > 0 && (
            <div className="space-y-4">
              {posts.map((post, index) => {
                // Check if this is the last post to observe for infinite scrolling
                const isLastPost = index === posts.length - 1;

                // Make sure we have a valid post object
                if (!post || typeof post !== "object") {
                  return null;
                }

                // Extract candidate info with fallbacks
                const candidateInfo = post.candidate || {};
                const userInfo = candidateInfo.user || {};
                const positionInfo = candidateInfo.position || {};
                const partylistInfo = candidateInfo.partylist || {};
                const departmentInfo = candidateInfo.department || {};

                // Extract commonly used values with fallbacks
                const candidateName = userInfo.name || "Anonymous Candidate";
                const positionName = positionInfo.name || "Candidate";
                const partylistName = partylistInfo.name || "";
                const departmentName = departmentInfo.name || "";
                const profilePhoto = candidateInfo.profile_photo || null;
                const postTitle = post.title || "Untitled Post";
                const postContent = post.content || "";
                const postImage = post.image || null;
                const createdAt = post.created_at || "";

                return (
                  <div
                    key={post.id || index}
                    className="bg-white rounded-lg shadow-sm p-6"
                    ref={isLastPost ? lastPostElementRef : null}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0">
                        {profilePhoto && (
                          <img
                            src={`${
                              profilePhoto.startsWith("http")
                                ? ""
                                : "http://127.0.0.1:8000/storage/"
                            }${profilePhoto}`}
                            alt={candidateName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {candidateName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-[#2F3875]">
                            {positionName && `Candidate, ${positionName}`}
                            {partylistName && ` - ${partylistName}`}
                          </span>
                          {departmentName && (
                            <span className="text-gray-600">
                              {departmentName}
                            </span>
                          )}
                          <span className="text-gray-500">
                            {formatTimeAgo(createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-[60px]">
                      <h2 className="text-[#2F3875] text-xl font-semibold mb-2">
                        {postTitle}
                      </h2>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {postContent}
                      </p>

                      {/* Display post image if available */}
                      {postImage && (
                        <div className="mt-4">
                          <img
                            src={`${
                              postImage.startsWith("http")
                                ? ""
                                : "http://127.0.0.1:8000/storage/"
                            }${postImage}`}
                            alt={postTitle}
                            className="max-h-96 rounded-lg object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-[#38438c] rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-500 text-sm">
                    Loading more posts...
                  </p>
                </div>
              )}

              {/* End message when no more posts */}
              {!hasMore && posts.length > 0 && !loadingMore && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {"No more posts to load"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
