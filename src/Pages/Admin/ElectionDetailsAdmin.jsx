import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAdminElectionDetails,
  editElection,
  deleteElection,
} from "../../utils/api";
import { useAuthContext } from "../../utils/AuthContext";
import DashboardHeader from "../../components/admin/DashboardHeader";
import { Row, Col, Spin, Alert, Button, message, Tabs } from "antd";

// Import modular components
import ElectionHeader from "../../components/admin/election-details/ElectionHeader";
import ElectionInformation from "../../components/admin/election-details/ElectionInformation";
import PositionsTable from "../../components/admin/election-details/PositionsTable";
import CandidatesTable from "../../components/admin/election-details/CandidatesTable";
import EditElectionModal from "../../components/admin/election-details/EditElectionModal";
import DeleteConfirmationModal from "../../components/admin/election-details/DeleteConfirmationModal";
import ResultsTab from "../../components/admin/election-details/ResultsTab";

/**
 * Admin component for viewing and editing election details
 */
const ElectionDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const [electionData, setElectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState({
    election_id: "",
    election_name: "",
    status: "",
    campaign_start_date: "",
    campaign_end_date: "",
    election_start_date: "",
    election_end_date: "",
  });

  // Fetch election details on component load
  useEffect(() => {
    fetchElectionDetails();
  }, [id]);

  // Fetch election details from API
  const fetchElectionDetails = async () => {
    try {
      setLoading(true);
      const data = await getAdminElectionDetails(id);

      if (data && data.election) {
        setElectionData(data);
      } else {
        setError(data.message || "Failed to fetch election details");
      }
    } catch (err) {
      console.error("Error fetching election details:", err);
      setError("An error occurred while fetching election details");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format date for display in the UI
   * @param {string} dateString - Date string to format
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  /**
   * Format date for datetime-local input
   * @param {string} dateString - Date string to format
   * @returns {string} Formatted date string for input
   */
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
    } catch (error) {
      return "";
    }
  };

  /**
   * Format date for MySQL database
   * @param {string} dateString - Date string to format
   * @returns {string} MySQL formatted date string
   */
  const formatDateForMySQL = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace("T", " "); // Format as YYYY-MM-DD HH:MM:SS
    } catch (error) {
      console.error("Date formatting error:", error);
      return null;
    }
  };

  /**
   * Determine election status based on dates
   * @returns {Object} Status object with text and color
   */
  const getElectionStatus = () => {
    if (!electionData?.election) return { text: "Unknown", color: "default" };

    const election = electionData.election;
    const now = new Date();
    const startDate = new Date(election.election_start_date);
    const endDate = new Date(election.election_end_date);
    const campaignStartDate = new Date(election.campaign_start_date);
    const campaignEndDate = new Date(election.campaign_end_date);

    if (now < campaignStartDate) {
      return { text: "Scheduled", color: "blue" };
    } else if (now >= campaignStartDate && now <= campaignEndDate) {
      return { text: "Campaign Period", color: "purple" };
    } else if (now >= startDate && now <= endDate) {
      return { text: "Voting Open", color: "green" };
    } else if (now > endDate) {
      return { text: "Completed", color: "volcano" };
    } else {
      return { text: election.status || "Unknown", color: "default" };
    }
  };

  /**
   * Open the edit modal and initialize form data
   */
  const handleEditClick = () => {
    if (electionData && electionData.election) {
      const election = electionData.election;

      setFormData({
        election_id: election.id,
        election_name: election.election_name,
        status: election.status,
        campaign_start_date: formatDateForInput(election.campaign_start_date),
        campaign_end_date: formatDateForInput(election.campaign_end_date),
        election_start_date: formatDateForInput(election.election_start_date),
        election_end_date: formatDateForInput(election.election_end_date),
      });

      setIsEditModalVisible(true);
    }
  };

  /**
   * Show delete confirmation dialog
   */
  const handleDeleteClick = () => {
    setIsDeleteConfirmVisible(true);
  };

  /**
   * Handle election deletion
   */
  const handleDeleteElection = async () => {
    setDeleting(true);
    try {
      const result = await deleteElection(token, id);

      if (result.success) {
        message.success("Election deleted successfully");
        // Navigate back to the elections list after successful deletion
        navigate("/admin/elections/view");
      } else {
        message.error(result.message || "Failed to delete election");
        setIsDeleteConfirmVisible(false);
      }
    } catch (err) {
      console.error("Error deleting election:", err);
      message.error("An error occurred while deleting the election");
      setIsDeleteConfirmVisible(false);
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Handle form input changes
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /**
   * Handle select input changes
   * @param {string} value - Selected value
   */
  const handleSelectChange = (value) => {
    setFormData({
      ...formData,
      status: value,
    });
  };

  /**
   * Submit the edit form to update election details
   * @param {Event} e - Form submit event
   */
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare data with MySQL-compatible date formats
      const apiData = {
        election_id: parseInt(formData.election_id),
        election_name: formData.election_name.trim(),
        status: formData.status,
        campaign_start_date: formatDateForMySQL(formData.campaign_start_date),
        campaign_end_date: formatDateForMySQL(formData.campaign_end_date),
        election_start_date: formatDateForMySQL(formData.election_start_date),
        election_end_date: formatDateForMySQL(formData.election_end_date),
      };

      // Call API to update election
      const result = await editElection(token, apiData);

      if (result.success) {
        message.success("Election updated successfully");
        setIsEditModalVisible(false);
        window.location.reload(); // Refresh data
      } else {
        message.error(result.message || "Failed to update election");
      }
    } catch (err) {
      console.error("Error updating election:", err);
      message.error("An error occurred while updating the election");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle tab change
   * @param {string} key - Tab key
   */
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 bg-gray-50">
        <DashboardHeader title="Election Details" />
        <div className="text-center py-10">
          <Spin size="large" />
          <div className="mt-4">Loading election details...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 bg-gray-50">
        <DashboardHeader title="Election Details" />
        <Alert
          message="Error Loading Election"
          description={error}
          type="error"
          showIcon
        />
        <div className="mt-4">
          <Button
            type="primary"
            onClick={() => navigate("/admin/elections/view")}
          >
            Back to Elections
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!electionData || !electionData.election) {
    return (
      <div className="container mx-auto p-6 bg-gray-50">
        <DashboardHeader title="Election Details" />
        <Alert
          message="Election Not Found"
          description="The requested election could not be found."
          type="warning"
          showIcon
        />
        <div className="mt-4">
          <Button
            type="primary"
            onClick={() => navigate("/admin/elections/view")}
          >
            Back to Elections
          </Button>
        </div>
      </div>
    );
  }

  const election = electionData.election;
  const status = getElectionStatus();

  // Tab items configuration
  const tabItems = [
    {
      key: "details",
      label: "Election Details",
      children: (
        <div className="bg-white shadow-sm rounded-lg p-4">
          {/* Election Info and Positions */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <ElectionInformation
                election={election}
                status={status}
                formatDate={formatDate}
              />
            </Col>

            <Col xs={24} lg={12}>
              <PositionsTable
                positions={electionData.positions}
                candidates={electionData.candidates}
              />
            </Col>
          </Row>

          {/* Candidates Section */}
          <CandidatesTable
            candidates={electionData.candidates}
            positions={electionData.positions}
          />
        </div>
      ),
    },
    {
      key: "results",
      label: "Election Results",
      children: (
        <div className="bg-white shadow-sm rounded-lg p-4">
          <ResultsTab electionData={electionData} />
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <DashboardHeader title="Election Details" />

      {/* Election Header */}
      <ElectionHeader
        election={election}
        status={status}
        formatDate={formatDate}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* Tabs Navigation */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        className="mb-4"
        type="card"
      />

      {/* Edit Election Modal */}
      <EditElectionModal
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onSubmit={handleEditSubmit}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        submitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={isDeleteConfirmVisible}
        onCancel={() => setIsDeleteConfirmVisible(false)}
        onDelete={handleDeleteElection}
        deleting={deleting}
      />
    </div>
  );
};

export default ElectionDetailsAdmin;
