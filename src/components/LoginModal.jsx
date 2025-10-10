import React, { useState, useEffect } from "react";
import { X, ArrowRight, RotateCcw } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "./FirebaseConfig";

export default function LoginModal({ onClose, onProceed }) {
  const [step, setStep] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(false);
  const [resendAvailable, setResendAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA verified");
        },
      }
    );
  }, []);

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    setOtpError(false);

    try {
      const formattedPhoneNumber = `+${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        appVerifier
      );

      setConfirmationResult(result);
      setStep("otp");
      setResendAvailable(false);
      setTimeout(() => setResendAvailable(true), 30000);
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please check the console for details.");
      window.recaptchaVerifier.render().then((widgetId) => {
        grecaptcha.reset(widgetId);
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otpValues];
      newOtp[index] = value;
      setOtpValues(newOtp);
      setOtpError(false);

      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleLogin = async () => {
    const otp = otpValues.join("");
    if (otp.length !== 6) {
      setOtpError(true);
      return;
    }

    setLoading(true);
    setOtpError(false);

    try {
      const userCredential = await confirmationResult.confirm(otp);
      console.log("Firebase OTP Verified. User:", userCredential.user);

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: `+${phoneNumber}` }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API login failed.');
      }

      const backendData = await response.json();
      console.log("Backend API login successful:", backendData);
      
      onProceed(userCredential.user); 

    } catch (error) {
      console.error("Error during login process:", error);
      setOtpError(true); 
    } finally {
      setLoading(false);
    }
  };


  const handleResend = () => {
    setOtpValues(Array(6).fill(""));
    setOtpError(false);
    handleSendOTP();
  };

  const handleOtpKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.7)" }}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <div id="recaptcha-container"></div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-lg w-11/12 md:w-[400px] relative"
      >
        {step === "phone" && (
          <>
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-medium text-black">Login</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-8">
              <label className="block text-base text-black mb-4 font-medium">
                Phone number
              </label>
              <PhoneInput
                country={"in"}
                value={phoneNumber}
                onChange={(phone) => setPhoneNumber(phone)}
                inputClass="!w-full !h-12 !text-base !px-12 !border-gray-300 focus:!border-black focus:!ring-0"
                containerClass="!w-full !mb-4"
              />
              <p className="text-sm text-gray-500 text-center mb-6">
                We'll send you a 6-digit code to verify your number.
              </p>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-yellow-400 text-black font-medium py-3 px-6 rounded-xl flex items-center justify-center text-base hover:bg-yellow-500 transition-colors disabled:bg-gray-300"
              >
                {loading ? "Sending..." : "Send OTP"}
                {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
              </button>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="flex items-center px-6 py-5 border-b border-gray-200">
              <button
                onClick={() => setStep("phone")}
                className="mr-3 text-gray-600 hover:text-black"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <h2 className="text-xl font-medium text-black">Enter OTP</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 ml-auto"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-8">
              <p className="text-sm text-gray-600 mb-6 text-center">
                Enter the 6-digit code sent to <br />
                <span className="font-medium text-black">+{phoneNumber}</span>
              </p>

              <div className="flex justify-center space-x-2 md:space-x-3 mb-4">
                {otpValues.map((val, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="tel"
                    value={val}
                    onChange={(e) => handleOTPChange(i, e.target.value)}
                    onKeyDown={handleOtpKeyDown}
                    className={`w-12 h-12 text-center text-xl border-2 rounded-lg outline-none transition-colors ${
                      otpError
                        ? "border-red-500"
                        : "border-gray-300 focus:border-black"
                    }`}
                    maxLength="1"
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-red-500 text-sm mb-4 text-center">
                  Invalid OTP. Please try again.
                </p>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-yellow-400 text-black font-medium py-3 px-6 rounded-xl flex items-center justify-center text-base mb-4 hover:bg-yellow-500 transition-colors disabled:bg-gray-300"
              >
                {loading ? "Verifying..." : "Login"}
                {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
              </button>

              <div className="text-center">
                <button
                  onClick={handleResend}
                  disabled={!resendAvailable || loading}
                  className={`py-2 flex items-center justify-center text-sm mx-auto ${
                    resendAvailable && !loading
                      ? "text-black font-medium"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Resend OTP
                  <RotateCcw className="w-3 h-3 ml-2" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}