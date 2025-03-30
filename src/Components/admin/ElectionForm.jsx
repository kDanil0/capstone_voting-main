import React, { useState } from 'react';

const ElectionForm = () => {
  const [formData, setFormData] = useState({
    electionName: '',
    electionType: 'general',
    campaignStartDate: '',
    campaignEndDate: '',
    electionStartDate: '',
    electionEndDate: '',
    status: 'Upcoming'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add API call to save election data
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="electionName" className="block text-md font-bold font-assistant text-[#38438c] mb-1">
            Election Name
          </label>
          <input
            type="text"
            id="electionName"
            name="electionName"
            value={formData.electionName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="electionType" className="block text-md font-bold font-assistant text-[#38438c] mb-1">
            Election Type
          </label>
          <select
            id="electionType"
            name="electionType"
            value={formData.electionType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          >
            <option value="general">general</option>
            <option value="department">department</option>
            <option value="college">college</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="campaignStartDate" className="block text-md font-bold font-assistant text-[#38438c] mb-1">
              Campaign Start Date
            </label>
            <input
              type="datetime-local"
              id="campaignStartDate"
              name="campaignStartDate"
              value={formData.campaignStartDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="mm/dd/yyyy, --:-- --"
              required
            />
          </div>
          <div>
            <label htmlFor="campaignEndDate" className="block text-md font-bold font-assistant text-[#38438c] mb-1">
              Campaign End Date
            </label>
            <input
              type="datetime-local"
              id="campaignEndDate"
              name="campaignEndDate"
              value={formData.campaignEndDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="mm/dd/yyyy, --:-- --"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="electionStartDate" className="block text-md font-bold font-assistant text-[#38438c] mb-1">
              Election Start Date
            </label>
            <input
              type="datetime-local"
              id="electionStartDate"
              name="electionStartDate"
              value={formData.electionStartDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="mm/dd/yyyy, --:-- --"
              required
            />
          </div>
          <div>
            <label htmlFor="electionEndDate" className="block text-md font-bold font-assistant text-[#38438c] mb-1">
              Election End Date
            </label>
            <input
              type="datetime-local"
              id="electionEndDate"
              name="electionEndDate"
              value={formData.electionEndDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="mm/dd/yyyy, --:-- --"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="status" className="block text-md font-bold font-assistant text-[#38438c] mb-1">
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
            <option value="Upcoming">Upcoming</option>
            <option value="On Going">On Going</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-[#38438c] text-white px-4 py-2 rounded-md hover:bg-[#2d3470] transition-colors"
        >
          Create Election
        </button>
      </form>
    </div>
  );
};

export default ElectionForm;
