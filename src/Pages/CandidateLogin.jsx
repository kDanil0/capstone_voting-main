import React from "react";
import CandidateLoginForm from "../Components/CandidateLoginForm";
import backgroundImage from "../assets/spcf_bg.jpg";

function CandidateLogin() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm brightness-95"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {/* Content */}
      <div className="relative flex items-center justify-center min-h-screen">
        <CandidateLoginForm />
      </div>
    </div>
  );
}

export default CandidateLogin; 