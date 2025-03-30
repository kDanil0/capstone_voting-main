import React from "react";
import VerifyOTP from "../Components/VerifyOTP";

function Verify_OTP() {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm brightness-95"
        style={{
          backgroundImage: "url('src/assets/spcf_bg.jpg')",
          position: "fixed",
          top: 0,
          left: 0,
        }}
      />
      {/* Content */}
      <div className="relative flex items-center justify-center h-full">
        <VerifyOTP />
      </div>
    </div>
  );
}

export default Verify_OTP;
