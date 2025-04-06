import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Space,
  Empty,
  Pagination,
  Tag,
  Spin,
  Image,
  message,
  Modal,
  Select,
  Tabs,
  Tooltip,
  Badge,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useAuthContext } from "../../utils/AuthContext";
import {
  approvePost,
  rejectPost,
  getStorageUrl,
  getAllPostsAdmin,
} from "../../utils/api";
import DashboardHeader from "../../Components/admin/DashboardHeader";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const PostApproval = () => {
  const { token } = useAuthContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [allPosts, setAllPosts] = useState([]);

  // Fetch all posts on component mount and when pagination changes
  useEffect(() => {
    fetchAllPosts();
  }, [pagination.current, token]);

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const response = await getAllPostsAdmin(
        token,
        pagination.current,
        pagination.pageSize
      );

      if (response.success) {
        // Store all posts
        setAllPosts(response.posts);

        // Count pending and approved posts
        const pendingPosts = response.posts.filter((post) => !post.is_approved);
        const approvedPosts = response.posts.filter((post) => post.is_approved);

        setPendingCount(pendingPosts.length);
        setApprovedCount(approvedPosts.length);

        // Filter posts based on active tab
        if (activeTab === "pending") {
          setPosts(pendingPosts);
        } else {
          setPosts(approvedPosts);
        }

        setPagination({
          ...pagination,
          total: response.pagination.total || 0,
        });
      } else {
        message.error(response.message || "Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("An error occurred while fetching posts");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setPagination({
      ...pagination,
      current: 1,
    });
    fetchAllPosts();
  };

  const handleApprove = async (postId) => {
    try {
      const response = await approvePost(token, postId);

      if (response.success) {
        message.success(response.message || "Post approved successfully");

        // Update the post in allPosts array
        const updatedAllPosts = allPosts.map((post) =>
          post.id === postId ? { ...post, is_approved: true } : post
        );
        setAllPosts(updatedAllPosts);

        // If we're on the pending tab, remove the approved post from the list
        if (activeTab === "pending") {
          setPosts(posts.filter((post) => post.id !== postId));
          setPendingCount((prevCount) => Math.max(0, prevCount - 1));
          setApprovedCount((prevCount) => prevCount + 1);
        } else {
          // Just refresh all posts if we're on the approved tab
          fetchAllPosts();
        }
      } else {
        message.error(response.message || "Failed to approve post");
      }
    } catch (error) {
      console.error("Error approving post:", error);
      message.error("An error occurred while approving the post");
    }
  };

  const handleReject = async (postId) => {
    try {
      const response = await rejectPost(token, postId);

      if (response.success) {
        message.success(
          response.message || "Post rejected and deleted successfully"
        );

        // Remove the post from both allPosts and current posts arrays since it's deleted
        const updatedAllPosts = allPosts.filter((post) => post.id !== postId);
        setAllPosts(updatedAllPosts);
        setPosts(posts.filter((post) => post.id !== postId));

        // Update counts
        if (activeTab === "approved") {
          setApprovedCount((prevCount) => Math.max(0, prevCount - 1));
        } else {
          setPendingCount((prevCount) => Math.max(0, prevCount - 1));
        }
      } else {
        // Handle specific error cases
        if (response.status === 401) {
          message.error("Your session has expired. Please log in again.");
        } else if (response.status === 403) {
          message.error("You don't have permission to reject posts.");
        } else if (response.status === 404) {
          message.error("Post not found. It may have been already deleted.");
          // Remove the post from the UI if it doesn't exist in the backend
          const updatedAllPosts = allPosts.filter((post) => post.id !== postId);
          setAllPosts(updatedAllPosts);
          setPosts(posts.filter((post) => post.id !== postId));
        } else {
          message.error(response.message || "Failed to reject post");
        }
      }
    } catch (error) {
      console.error("Error rejecting post:", error);
      message.error("An error occurred while rejecting the post");
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);

    // Filter posts based on tab
    if (key === "pending") {
      setPosts(allPosts.filter((post) => !post.is_approved));
    } else {
      setPosts(allPosts.filter((post) => post.is_approved));
    }

    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handlePageChange = (page) => {
    setPagination({
      ...pagination,
      current: page,
    });
  };

  const showImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <DashboardHeader title="POST APPROVAL" />
            <Text className="text-gray-600 text-lg font-assistant">
              Review and approve candidate posts before they appear publicly
            </Text>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            className="flex items-center"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          className="candidate-posts-tabs"
        >
          <TabPane
            tab={
              <Badge count={pendingCount} offset={[10, 0]}>
                <span>Pending Approval</span>
              </Badge>
            }
            key="pending"
          />
          <TabPane
            tab={
              <Badge count={approvedCount} offset={[10, 0]} color="green">
                <span>Approved Posts</span>
              </Badge>
            }
            key="approved"
          />
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-8">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="w-full shadow-md hover:shadow-lg transition-shadow"
              bordered={false}
              extra={
                post.is_approved ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    Approved
                  </Tag>
                ) : (
                  <Tag color="warning" icon={<CloseCircleOutlined />}>
                    Pending
                  </Tag>
                )
              }
            >
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <UserOutlined className="text-[#38438c]" />
                  <Text strong className="text-lg">
                    {post.candidate?.user?.name ||
                      (post.candidate?.first_name && post.candidate?.last_name
                        ? `${post.candidate.first_name} ${post.candidate.last_name}`
                        : "Unknown Candidate")}
                  </Text>
                  <Tag color="blue">
                    {post.candidate?.position?.name || "Candidate"}
                  </Tag>
                  {post.candidate?.partylist?.name && (
                    <Tag color="purple">{post.candidate.partylist.name}</Tag>
                  )}
                </div>

                <Title level={4} className="text-[#38438c] mt-2">
                  {post.title}
                </Title>

                <Paragraph className="text-base whitespace-pre-line">
                  {post.content}
                </Paragraph>

                {post.image && (
                  <div
                    className="mt-2 cursor-pointer"
                    onClick={() => showImageModal(getStorageUrl(post.image))}
                  >
                    <Image
                      src={getStorageUrl(post.image)}
                      alt={post.title}
                      className="rounded-md object-cover"
                      style={{ maxHeight: "250px", width: "auto" }}
                      preview={false}
                    />
                    <Text className="text-sm text-gray-500 mt-1">
                      Click on image to view full size
                    </Text>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                  <Text className="text-gray-500 text-sm">
                    <CalendarOutlined className="mr-1" />
                    Posted: {formatDate(post.created_at)}
                  </Text>

                  <Space>
                    {!post.is_approved && (
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApprove(post.id)}
                        style={{
                          backgroundColor: "#38438c",
                          transition: "background-color 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "#2c3470";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "#38438c";
                        }}
                      >
                        Approve
                      </Button>
                    )}
                    <Button
                      type="primary"
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleReject(post.id)}
                    >
                      Reject
                    </Button>
                  </Space>
                </div>
              </div>
            </Card>
          ))}

          <div className="flex justify-center mt-6">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </div>
      ) : (
        <Empty
          description={
            <Text className="text-lg text-gray-500">
              {activeTab === "pending"
                ? "No pending posts to approve"
                : "No approved posts found"}
            </Text>
          }
          className="my-12"
        />
      )}

      <Modal
        open={imageModalVisible}
        footer={null}
        onCancel={() => setImageModalVisible(false)}
        width="fit-content"
        centered
        className="post-image-modal"
      >
        <div className="flex justify-center items-center">
          <Image
            src={selectedImage}
            alt="Full size post image"
            style={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              width: "auto",
              height: "auto",
              objectFit: "contain",
            }}
            preview={false}
          />
        </div>
      </Modal>
    </div>
  );
};

// Add styles at the end of the file
const styles = `
  .post-image-modal .ant-modal-content {
    background: rgba(0, 0, 0, 0.85);
    padding: 16px;
    display: inline-block;
  }
  .post-image-modal .ant-modal-body {
    padding: 0;
    line-height: 0;
  }
  .post-image-modal .ant-modal-close {
    color: white;
  }
  .post-image-modal .ant-modal-close:hover {
    color: #f0f0f0;
  }
  .post-image-modal {
    text-align: center;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}

export default PostApproval;
