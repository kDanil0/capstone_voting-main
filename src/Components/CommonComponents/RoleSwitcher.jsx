import React from 'react';
import { useAuthContext } from '../../utils/AuthContext';

const RoleSwitcher = () => {
  const { user, setUser } = useAuthContext();
  const isDevEnvironment = process.env.NODE_ENV === 'development';

  if (!isDevEnvironment) return null;

  const mockUsers = {
    admin: {
      id: 1,
      name: "Admin User",
      role_id: 1,
      email: "admin@test.com",
      student_id: "ADMIN001"
    },
    candidate: {
      id: 2,
      name: "Candidate User",
      role_id: 2,
      email: "candidate@test.com",
      student_id: "CAND001"
    },
    user: {
      id: 3,
      name: "Regular User",
      role_id: 3,
      email: "user@test.com",
      student_id: "USER001"
    }
  };

  const handleRoleSwitch = (role) => {
    if (role === 'logout') {
      setUser(null);
    } else {
      setUser(mockUsers[role]);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <h3 className="font-bold text-sm mb-2">Development Role Switcher</h3>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleRoleSwitch('admin')}
          className={`px-3 py-1 text-sm rounded ${
            user?.role_id === 1
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Switch to Admin
        </button>
        <button
          onClick={() => handleRoleSwitch('candidate')}
          className={`px-3 py-1 text-sm rounded ${
            user?.role_id === 2
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Switch to Candidate
        </button>
        <button
          onClick={() => handleRoleSwitch('user')}
          className={`px-3 py-1 text-sm rounded ${
            user?.role_id === 3
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Switch to User
        </button>
        <button
          onClick={() => handleRoleSwitch('logout')}
          className="px-3 py-1 text-sm rounded bg-red-100 hover:bg-red-200 text-red-600"
        >
          Logout
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Current: {user ? `${user.name} (${user.role_id})` : 'Logged Out'}
      </div>
    </div>
  );
};

export default RoleSwitcher; 