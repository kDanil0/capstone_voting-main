import React, { useState } from "react";
import DashboardHeader from "../../components/admin/DashboardHeader";
import StudentTable from "../../Components/admin/StudentTable";
import StudentForm from "../../Components/admin/StudentForm";
import { CirclePlus } from "lucide-react";

const StudentManagement = () => {
  // Generate sample data
  const generateSampleStudents = () => {
    const departments = ["CCIS", "COE", "CON", "COC", "CHTM", "COB", "CAS"];
    const sampleData = [];

    for (let i = 1; i <= 15; i++) {
      const deptIndex = i % departments.length;
      sampleData.push({
        studentNumber: `2023-${10000 + i}`,
        firstName: `FirstName${i}`,
        lastName: `LastName${i}`,
        department: departments[deptIndex],
        token: `TOKEN${i}${Math.random()
          .toString(36)
          .substring(2, 5)
          .toUpperCase()}`,
      });
    }

    return sampleData;
  };

  const [students, setStudents] = useState(generateSampleStudents());
  const [activeTab, setActiveTab] = useState("table"); // 'table' or 'form'

  const addStudent = (newStudent) => {
    setStudents([...students, newStudent]);
    setActiveTab("table"); // Switch back to table view after adding
  };

  const handleBatchUpload = (csvData) => {
    // Parse CSV data
    const lines = csvData.split("\n");
    const newStudents = lines
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const [studentNumber, firstName, lastName, department] =
          line.split(",");
        const token = Math.random().toString(36).substring(2, 10).toUpperCase();

        return {
          studentNumber: studentNumber.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          department: department.trim(),
          token,
        };
      });

    setStudents([...students, ...newStudents]);
    setActiveTab("table"); // Switch back to table view after upload
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
            <StudentTable students={students} />
          </div>
        ) : (
          <div className="h-full overflow-auto pb-2">
            <StudentForm
              onAddStudent={addStudent}
              onBatchUpload={handleBatchUpload}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
