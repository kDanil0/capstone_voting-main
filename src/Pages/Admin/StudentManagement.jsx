import React, { useState, useEffect } from "react";
import DashboardHeader from "../../components/admin/DashboardHeader";
import StudentTable from "../../Components/admin/StudentTable";
import StudentForm from "../../Components/admin/StudentForm";
import { CirclePlus } from "lucide-react";
import {
  getAllStudents,
  getDepartmentsList,
  deleteStudent,
  generateStudentToken,
} from "../../utils/api";
import { message } from "antd";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState("table"); // 'table' or 'form'
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 40,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch departments
  const fetchDepartments = async () => {
    if (!token) {
      message.error("Not authenticated. Please log in again.");
      return;
    }

    try {
      const response = await getDepartmentsList(token);

      // Handle different response formats
      if (response && response.departments) {
        setDepartments(response.departments);
      } else if (response && response.data && response.data.departments) {
        setDepartments(response.data.departments);
      } else {
        console.error(
          "API error fetching departments: Unexpected response format"
        );
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchStudents = async (page = 1, search = "") => {
    // Debug logging
    console.log("Token available:", !!token);
    console.log(
      "Token prefix:",
      token ? token.substring(0, 10) + "..." : "No token"
    );

    if (!token) {
      message.error("Not authenticated. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      console.log("Making API call to /api/admin/students/all with params:", {
        page,
        per_page: pagination.pageSize,
        search,
      });

      const response = await getAllStudents(
        token,
        page,
        pagination.pageSize,
        search
      );

      console.log("API response:", response);

      if (response.success) {
        // Transform the data to match our component structure
        const transformedData = response.students.map((student) => {
          return {
            id: student.id,
            studentNumber: student.id,
            name: student.name || "Unknown",
            department: student.department_id || student.department || null,
            year: student.year,
            isRegistered: student.is_registered,
            token:
              student.tokenOTPs === "unregistered"
                ? "No Token"
                : student.tokenOTPs && student.tokenOTPs.length > 0
                ? student.tokenOTPs[0].tokenOTP
                : "No Token",
            tokenExpiry:
              student.tokenOTPs === "unregistered"
                ? null
                : student.tokenOTPs && student.tokenOTPs.length > 0
                ? student.tokenOTPs[0].expires_at
                : null,
            tokenUsed:
              student.tokenOTPs === "unregistered"
                ? false
                : student.tokenOTPs && student.tokenOTPs.length > 0
                ? student.tokenOTPs[0].used
                : false,
            allTokens: student.tokenOTPs,
          };
        });

        setStudents(transformedData);
        setPagination({
          ...pagination,
          current: response.pagination.current_page,
          total: response.pagination.total,
        });
      } else {
        console.error("API error:", response.message);
        message.error(response.message || "Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error(
        "Failed to fetch students: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDepartments();
      fetchStudents(pagination.current, searchQuery);
    } else {
      message.error("Please log in to access this page");
    }
  }, [token]);

  const handleTableChange = (pagination) => {
    fetchStudents(pagination.current, searchQuery);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    fetchStudents(1, value);
  };

  const handleGenerateToken = async (studentId) => {
    try {
      const response = await generateStudentToken(token, studentId);

      // Only refresh the students list if successful, but don't show messages
      if (response.success) {
        // Refresh the students list
        fetchStudents(pagination.current, searchQuery);
      }

      // Return the response to be handled by the child component
      return response;
    } catch (error) {
      console.error("Error generating token:", error);
      return {
        success: false,
        message: "Failed to generate token",
        error: error.message,
      };
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      const response = await deleteStudent(token, studentId);
      if (response.success) {
        message.success(response.message);
        // Refresh the students list
        fetchStudents(pagination.current, searchQuery);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      message.error("Failed to delete student");
    }
  };

  const addStudent = (newStudent) => {
    // Student will be added through the StudentForm component
    // which will call the API directly
    setActiveTab("table"); // Switch back to table view
    fetchStudents(pagination.current, searchQuery); // Refresh the list
  };

  const handleBatchUpload = (csvData) => {
    // CSV data will be processed in the StudentForm component
    // which will call the API directly
    setActiveTab("table"); // Switch back to table view
    fetchStudents(pagination.current, searchQuery); // Refresh the list
  };

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden p-4">
      <div className="flex-none mb-2">
        <DashboardHeader title="Student Management" />
      </div>

      {/* Tab Navigation */}
      <div className="flex-none font-assistant text-xl flex border-b border-gray-300 mb-2">
        <button
          className={`py-1 px-4 font-bold ${
            activeTab === "table"
              ? "text-[#38438c] border-b-2 border-[#38438c]"
              : "text-gray-500 hover:text-[#38438c]"
          }`}
          onClick={() => setActiveTab("table")}
        >
          Student List
        </button>
        <button
          className={`py-1 px-4 font-bold flex items-center justify-center ${
            activeTab === "form"
              ? "text-[#38438c] border-b-2 border-[#38438c]"
              : "text-gray-500 hover:border-b-2 hover:border-[#38438c] hover:text-[#38438c]"
          }`}
          onClick={() => setActiveTab("form")}
        >
          <CirclePlus size={24} color="#38438c" className="mr-2" />
          Add Student
        </button>
      </div>

      {/* Content Area - Fixed Height */}
      <div className="flex-grow overflow-hidden">
        {activeTab === "table" ? (
          <div className="h-full overflow-auto pb-2">
            <StudentTable
              students={students}
              loading={loading}
              pagination={pagination}
              onTableChange={handleTableChange}
              onSearch={handleSearch}
              onGenerateToken={handleGenerateToken}
              onDelete={handleDeleteStudent}
              departments={departments}
            />
          </div>
        ) : (
          <div className="h-full overflow-auto pb-2">
            <StudentForm
              token={token}
              onAddStudent={addStudent}
              onBatchUpload={handleBatchUpload}
              departments={departments}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
