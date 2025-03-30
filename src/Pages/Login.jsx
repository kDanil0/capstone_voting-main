import React from "react";
import LoginForm from "../Components/LoginForm";

function Login() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left side with school logo and background */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#38438c] to-[#38738c] flex-col justify-center items-center p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <img 
            src="/src/assets/spcf_logo.png" 
            alt="School Logo" 
            className="w-64 h-64 object-contain mx-auto mb-6" 
          />
          <h1 className="text-white text-3xl tracking-widest font-climate text-center">SPCF <br />Voting System</h1>
        </div>
      </div>
      
      {/* Right side with login form */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-50">
        <div className="w-full max-w-md px-6 py-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default Login;
