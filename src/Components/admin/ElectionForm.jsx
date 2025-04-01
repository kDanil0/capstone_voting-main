import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createElection, getDepartmentsList } from "../../utils/api";
import { useAuthContext } from "../../utils/AuthContext";
import { message, Select, Spin } from "antd";

const { Option } = Select;

const ElectionForm = () => {
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const [formData, setFormData] = useState({
    election_name: "",
    election_type_id: 1, // Default to general election (1)
    department_id: null,
    campaign_start_date: "",
    campaign_end_date: "",
    election_start_date: "",
    election_end_date: "",
    status: "upcoming",
  });

  // Fetch departments for selection
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const data = await getDepartmentsList(token);
        if (data && data.departments) {
          setDepartments(data.departments);
        }
      } catch (err) {
        console.error("Error fetching departments:", err);
        message.error("Failed to load departments");
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Check if election type is department but no department is selected
    if (formData.election_type_id === 2 && !formData.department_id) {
      message.error("Please select a department for department election");
      return false;
    }

    // Validate dates
    const campaignStart = new Date(formData.campaign_start_date);
    const campaignEnd = new Date(formData.campaign_end_date);
    const electionStart = new Date(formData.election_start_date);
    const electionEnd = new Date(formData.election_end_date);

    if (campaignEnd <= campaignStart) {
      message.error("Campaign end date must be after campaign start date");
      return false;
    }

    if (electionEnd <= electionStart) {
      message.error("Election end date must be after election start date");
      return false;
    }

    if (electionStart < campaignEnd) {
      message.error("Election should start after campaign period ends");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await createElection(token, formData);

      if (result.success) {
        message.success(result.message || "Election created successfully");
        navigate("/admin/elections/view"); // Redirect to elections list
      } else {
        message.error(result.message || "Failed to create election");
      }
    } catch (err) {
      console.error("Error creating election:", err);
      message.error("An error occurred while creating the election");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="election_name"
            className="block text-md font-bold font-assistant text-[#38438c] mb-1"
          >
            Election Name
          </label>
          <input
            type="text"
            id="election_name"
            name="election_name"
            value={formData.election_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="election_type_id"
            className="block text-md font-bold font-assistant text-[#38438c] mb-1"
          >
            Election Type
          </label>
          <select
            id="election_type_id"
            name="election_type_id"
            value={formData.election_type_id}
            onChange={(e) =>
              handleSelectChange("election_type_id", parseInt(e.target.value))
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          >
            <option value={1}>General</option>
            <option value={2}>Department</option>
            <option value={3}>College</option>
          </select>
        </div>

        {/* Show department selection only for department elections */}
        {formData.election_type_id === 2 && (
          <div className="mb-4">
            <label
              htmlFor="department_id"
              className="block text-md font-bold font-assistant text-[#38438c] mb-1"
            >
              Select Department
            </label>
            {loadingDepartments ? (
              <div className="flex items-center mt-2">
                <Spin size="small" />
                <span className="ml-2">Loading departments...</span>
              </div>
            ) : (
              <Select
                id="department_id"
                placeholder="Select a department"
                value={formData.department_id}
                onChange={(value) => handleSelectChange("department_id", value)}
                className="w-full"
                required
              >
                {departments.map((dept) => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="campaign_start_date"
              className="block text-md font-bold font-assistant text-[#38438c] mb-1"
            >
              Campaign Start Date
            </label>
            <input
              type="datetime-local"
              id="campaign_start_date"
              name="campaign_start_date"
              value={formData.campaign_start_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="campaign_end_date"
              className="block text-md font-bold font-assistant text-[#38438c] mb-1"
            >
              Campaign End Date
            </label>
            <input
              type="datetime-local"
              id="campaign_end_date"
              name="campaign_end_date"
              value={formData.campaign_end_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="election_start_date"
              className="block text-md font-bold font-assistant text-[#38438c] mb-1"
            >
              Election Start Date
            </label>
            <input
              type="datetime-local"
              id="election_start_date"
              name="election_start_date"
              value={formData.election_start_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="election_end_date"
              className="block text-md font-bold font-assistant text-[#38438c] mb-1"
            >
              Election End Date
            </label>
            <input
              type="datetime-local"
              id="election_end_date"
              name="election_end_date"
              value={formData.election_end_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="status"
            className="block text-md font-bold font-assistant text-[#38438c] mb-1"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-[#38438c] text-white px-4 py-2 rounded-md hover:bg-[#2d3470] transition-colors"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Election"}
        </button>
      </form>
    </div>
  );
};

export default ElectionForm;
