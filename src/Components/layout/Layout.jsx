import React from 'react';
import { useLocation } from 'react-router-dom';
import VerticalNavBar from '../../Components/CommonComponents/VerticalNavBar';
import RoleSwitcher from '../../Components/CommonComponents/RoleSwitcher';

const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isVerifyPage = location.pathname === "/verify";
  const isCandidateLoginPage = location.pathname === "/candidatelogin";

  // No layout for login and verify pages
  if (isLoginPage || isVerifyPage || isCandidateLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex">
      {/* Fixed width sidebar */}
      <div className="fixed">
        <VerticalNavBar />
      </div>
      
      {/* Main content area */}
      <div className="pl-64 w-full min-h-screen bg-gray-200">
        {/* Main Content Area */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;