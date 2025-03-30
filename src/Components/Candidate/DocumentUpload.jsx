import { useState, useEffect } from "react";
import { documentAPI } from "../../utils/api";
import { useAuthContext } from "../../utils/AuthContext";

const DocumentUpload = () => {
  const { token } = useAuthContext();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [documents, setDocuments] = useState([]);
  const [statusLoading, setStatusLoading] = useState(true);

  // Fetch document status
  const fetchStatus = async () => {
    try {
      const response = await documentAPI.getStatus(token);
      console.log("Document status response:", response);
      setDocuments(response.data);
      setStatusLoading(false);
    } catch (err) {
      console.error("Error fetching status:", err);
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [token]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError("");

    if (selectedFile) {
      // Validate file type
      const fileType = selectedFile.type;
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validTypes.includes(fileType)) {
        setError("Please upload only PDF or DOCX files");
        return;
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("document", file);

    try {
      console.log("Uploading to:", "/api/documents/upload");
      const response = await documentAPI.upload(token, formData);
      setSuccess(
        "Document uploaded successfully! Please check your email for confirmation."
      );
      setFile(null);
      // Reset file input
      document.getElementById("document-upload").value = "";
      // Refresh status after successful upload
      fetchStatus();
    } catch (err) {
      console.log("Error details:", err);
      setError(err.response?.data?.message || "Error uploading document");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="h-96 container mx-auto flex gap-6">
      {/* Left Column - Status Section */}
      <div className="flex-1 bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-climate text-center text-gray-800">
            Document Status
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track your document status
          </p>
        </div>

        {/* Status Section Content - Added max-height and overflow-y-auto */}
        <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
          {statusLoading ? (
            <div className="mb-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-sm font-medium w-24">Name:</span>
                      <span className="text-sm text-gray-600">
                        {doc.document_name || "N/A"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-sm font-medium w-24">Status:</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          doc.status
                        )}`}
                      >
                        {doc.status
                          ? doc.status.charAt(0).toUpperCase() +
                            doc.status.slice(1)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-sm font-medium w-24">
                        Uploaded:
                      </span>
                      <span className="text-sm text-gray-600">
                        {doc.created_at
                          ? new Date(doc.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 text-center">
                No documents uploaded yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Upload Section */}
      <div className="flex-1 bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-climate text-center text-gray-800">
            Upload Document
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload your documents here
          </p>
        </div>

        <div className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              id="document-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.docx"
            />
            <label
              htmlFor="document-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="p-2 rounded-full bg-blue-50">
                {/* You can add an icon here */}
              </div>
              <span className="text-sm font-medium text-blue-600">
                Click to upload
              </span>
              <span className="text-xs text-gray-500">
                PDF or DOCX (max. 5MB)
              </span>
            </label>
          </div>

          {/* Selected File */}
          {file && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              Selected: {file.name}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
              {success}
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full py-2.5 px-4 rounded-lg text-white font-medium
                          ${
                            !file || loading
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 transition-colors"
                          }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading...
              </span>
            ) : (
              "Upload Document"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
