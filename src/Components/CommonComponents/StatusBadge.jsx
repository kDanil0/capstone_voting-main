// src/Components/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'accept':
      case 'accepted':
        return 'bg-green-500 text-white';
      case 'rejected':
      case 'reject':
      case 'declined':
        return 'bg-red-500 text-white';
      case 'pending':
      case 'on review':
      case 'in progress':
        return 'bg-yellow-500 text-white';
      case 'on going':
      case 'ongoing':
        return 'bg-green-800 text-white';
      case 'upcoming':
        return 'bg-gray-200 border border-gray-400 text-[#38438c]';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <span className={`w-24 text-center px-3 py-1 rounded-full text-sm font-medium font-assistant ${getStatusStyles()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;