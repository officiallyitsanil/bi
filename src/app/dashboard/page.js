'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/utils/auth';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/components/FirebaseConfig";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [favoriteProperties, setFavoriteProperties] = useState([]);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
    
    // Profile form states
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        address: '',
        phoneNumber: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
    
    // Phone change states
    const [isChangingPhone, setIsChangingPhone] = useState(false);
    const [newPhoneNumber, setNewPhoneNumber] = useState('');
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const [otpStep, setOtpStep] = useState('phone'); // 'phone' or 'otp'
    const [otpError, setOtpError] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendAvailable, setResendAvailable] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
    
    const router = useRouter();

    // Cleanup recaptcha verifier on unmount
    useEffect(() => {
        return () => {
            if (window.recaptchaVerifierProfile) {
                try {
                    window.recaptchaVerifierProfile.clear();
                } catch (e) {
                    // Error clearing recaptcha
                }
                window.recaptchaVerifierProfile = null;
            }
        };
    }, []);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setProfileData({
                    name: parsedUser.name || '',
                    email: parsedUser.email || '',
                    address: parsedUser.address || '',
                    phoneNumber: parsedUser.phoneNumber || ''
                });
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error("Could not parse user from localStorage", error);
            router.push('/');
        }
    }, [router]);

    // Fetch updated profile data
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user || !user.phoneNumber) return;
            
            try {
                const response = await fetch(`/api/profile?phoneNumber=${encodeURIComponent(user.phoneNumber)}`);
                const data = await response.json();
                
                if (data.success && data.user) {
                    setUser(data.user);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    setProfileData({
                        name: data.user.name || '',
                        email: data.user.email || '',
                        address: data.user.address || '',
                        phoneNumber: data.user.phoneNumber || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        if (user && activeTab === 'profile') {
            fetchProfile();
        }
    }, [user, activeTab]);

    // Fetch favorite properties
    useEffect(() => {
        const fetchFavoriteProperties = async () => {
            if (!user || !user.phoneNumber || activeTab !== 'shortlisted') return;

            setIsLoadingFavorites(true);
            try {
                // Fetch favorites from API
                const favoritesResponse = await fetch(`/api/favorites?userPhoneNumber=${encodeURIComponent(user.phoneNumber)}`);
                const favoritesData = await favoritesResponse.json();

                if (favoritesData.success && favoritesData.data.length > 0) {
                    // Fetch property details for each favorite
                    const propertyPromises = favoritesData.data.map(async (favorite) => {
                        try {
                            const propertyResponse = await fetch(`/api/properties?id=${favorite.propertyId}&type=${favorite.propertyType || ''}`);
                            const propertyData = await propertyResponse.json();

                            if (propertyData.success && propertyData.property) {
                                // Calculate prices
                                const calculatePrices = (property) => {
                                    let originalPriceValue = 0;
                                    
                                    if (property.propertyType === 'residential') {
                                        const expectedRent = property.expectedRent || '0';
                                        originalPriceValue = parseFloat(expectedRent.toString().replace(/[₹,]/g, '')) || 0;
                                    } else if (property.propertyType === 'commercial') {
                                        if (property.floorConfigurations && property.floorConfigurations.length > 0) {
                                            const firstFloor = property.floorConfigurations[0];
                                            if (firstFloor.dedicatedCabin && firstFloor.dedicatedCabin.seats && firstFloor.dedicatedCabin.pricePerSeat) {
                                                const seatsStr = firstFloor.dedicatedCabin.seats.toString();
                                                const pricePerSeatStr = firstFloor.dedicatedCabin.pricePerSeat.toString();
                                                
                                                const seatsMatch = seatsStr.match(/(\d+)/);
                                                const pricePerSeatMatch = pricePerSeatStr.match(/(\d+)/);
                                                
                                                if (seatsMatch && pricePerSeatMatch) {
                                                    const seatsLower = parseFloat(seatsMatch[1]);
                                                    const pricePerSeatLower = parseFloat(pricePerSeatMatch[1]);
                                                    originalPriceValue = seatsLower * pricePerSeatLower;
                                                }
                                            }
                                        }
                                    }
                                    
                                    const discountedPriceValue = originalPriceValue * 0.95;
                                    
                                    const formatPrice = (price) => {
                                        if (price === 0) return '₹XX';
                                        return `₹${Math.round(price).toLocaleString('en-IN')}`;
                                    };
                                    
                                    return {
                                        originalPrice: formatPrice(originalPriceValue),
                                        discountedPrice: formatPrice(discountedPriceValue)
                                    };
                                };

                                const prices = calculatePrices(propertyData.property);
                                
                                return {
                                    ...propertyData.property,
                                    _id: propertyData.property._id || propertyData.property.id,
                                    id: propertyData.property._id || propertyData.property.id,
                                    originalPrice: prices.originalPrice,
                                    discountedPrice: prices.discountedPrice,
                                };
                            }
                            return null;
                        } catch (error) {
                            console.error(`Error fetching property ${favorite.propertyId}:`, error);
                            return null;
                        }
                    });

                    const properties = await Promise.all(propertyPromises);
                    setFavoriteProperties(properties.filter(p => p !== null));
                } else {
                    setFavoriteProperties([]);
                }
            } catch (error) {
                console.error('Error fetching favorite properties:', error);
                setFavoriteProperties([]);
            } finally {
                setIsLoadingFavorites(false);
            }
        };

        fetchFavoriteProperties();
    }, [user, activeTab]);

    const handleSignOut = () => {
        logoutUser(); 
        router.push('/');
    };

    // Initialize reCAPTCHA for phone change
    const initializeRecaptcha = async () => {
        // Ensure container exists
        let container = document.getElementById("recaptcha-container-profile");
        if (!container) {
            container = document.createElement("div");
            container.id = "recaptcha-container-profile";
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            document.body.appendChild(container);
        }

        // Clear any existing verifier
        if (window.recaptchaVerifierProfile) {
            try {
                window.recaptchaVerifierProfile.clear();
            } catch (e) {
                // Error clearing old recaptcha
            }
        }

        // Create a new verifier
        const verifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container-profile",
            {
                size: "invisible",
                callback: (response) => {
                    // reCAPTCHA verified
                },
                "expired-callback": () => {
                    // reCAPTCHA expired
                }
            }
        );

        window.recaptchaVerifierProfile = verifier;
        setRecaptchaVerifier(verifier);

        // Render the verifier and wait for it to be ready
        try {
            const widgetId = await verifier.render();
            
            // Wait briefly to ensure reCAPTCHA is fully initialized
            await new Promise(resolve => setTimeout(resolve, 300));
            
            return verifier;
        } catch (error) {
            console.error("Error rendering reCAPTCHA:", error);
            // Clean up on error
            try {
                verifier.clear();
            } catch (e) {
                // Error clearing verifier
            }
            throw error;
        }
    };

    // Handle send OTP for phone change
    const handleSendOTPForPhoneChange = async () => {
        if (!newPhoneNumber || newPhoneNumber.length < 10) {
            alert("Please enter a valid phone number.");
            return;
        }

        setOtpLoading(true);
        setOtpError(false);

        try {
            // Always reinitialize recaptcha for a fresh token
            let appVerifier = recaptchaVerifier || window.recaptchaVerifierProfile;
            
            // Clear existing verifier and create a new one
            if (appVerifier) {
                try {
                    appVerifier.clear();
                } catch (e) {
                    // Error clearing existing recaptcha
                }
            }

            // Initialize and wait for reCAPTCHA to be verified
            appVerifier = await initializeRecaptcha();
            
            // Small delay to ensure token is ready
            await new Promise(resolve => setTimeout(resolve, 500));

            const formattedPhoneNumber = `+${newPhoneNumber}`;
            const result = await signInWithPhoneNumber(
                auth,
                formattedPhoneNumber,
                appVerifier
            );

            setConfirmationResult(result);
            setOtpStep('otp');
            setResendAvailable(false);
            setTimeout(() => setResendAvailable(true), 30000);
        } catch (error) {
            console.error("Error sending OTP:", error);
            
            // Clear recaptcha on error
            if (window.recaptchaVerifierProfile) {
                try {
                    window.recaptchaVerifierProfile.clear();
                } catch (e) {
                    // Error clearing recaptcha
                }
                window.recaptchaVerifierProfile = null;
                setRecaptchaVerifier(null);
            }

            let errorMessage = "Failed to send OTP.\n\n";
            
            // Log full error details for debugging
            console.error("Full error details:", {
                code: error.code,
                message: error.message,
                stack: error.stack,
                response: error.customData?.serverResponse,
                customData: error.customData
            });
            
            if (error.code === "auth/invalid-app-credential") {
                errorMessage += "⚠️ LOCALHOST CONFIGURATION ISSUE ⚠️\n\n";
                errorMessage += "reCAPTCHA is working, but Firebase is rejecting the request.\n\n";
                errorMessage += "IMMEDIATE FIXES:\n\n";
                errorMessage += "1. Add Authorized Domains in Firebase:\n";
                errorMessage += "   → Firebase Console → Authentication → Settings\n";
                errorMessage += "   → Click 'Authorized domains'\n";
                errorMessage += "   → Add: 'localhost' and '127.0.0.1'\n\n";
                errorMessage += "2. TRY ACCESSING VIA 127.0.0.1:\n";
                errorMessage += "   → Instead of: http://localhost:3000\n";
                errorMessage += "   → Use: http://127.0.0.1:3000\n\n";
                errorMessage += "3. Check Google Cloud API Key:\n";
                errorMessage += "   → https://console.cloud.google.com/apis/credentials\n";
                errorMessage += "   → Find API key: AIzaSyBAEqha-T9VRWdg5Ia3EkUn1bxubc3iVO8\n";
                errorMessage += "   → Ensure 'HTTP referrers' includes:\n";
                errorMessage += "     - localhost/*\n";
                errorMessage += "     - 127.0.0.1/*\n";
                errorMessage += "   → OR remove restrictions temporarily for testing\n";
            } else if (error.code === "auth/invalid-phone-number") {
                errorMessage += "Invalid phone number format. Please check the number.";
            } else if (error.code === "auth/quota-exceeded") {
                errorMessage += "Too many requests. Please try again later.";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage += "Too many attempts. Please wait a few minutes.";
            } else {
                errorMessage += `Error: ${error.message || error.code || "Unknown error"}`;
            }
            
            alert(errorMessage);
        } finally {
            setOtpLoading(false);
        }
    };

    // Handle OTP input change
    const handleOTPChange = (index, value) => {
        if (/^\d?$/.test(value)) {
            const newOtp = [...otpValues];
            newOtp[index] = value;
            setOtpValues(newOtp);
            setOtpError(false);

            if (value && index < 5) {
                const nextInput = document.getElementById(`otp-profile-${index + 1}`);
                if (nextInput) nextInput.focus();
            }
        }
    };

    // Handle OTP key down (Enter key support)
    const handleOtpKeyDown = (e) => {
        if (e.key === "Enter") {
            handleVerifyOTPAndUpdatePhone();
        }
    };

    // Handle resend OTP
    const handleResendOTP = () => {
        setOtpValues(Array(6).fill(""));
        setOtpError(false);
        // Clear existing verifier and reinitialize
        if (window.recaptchaVerifierProfile) {
            try {
                window.recaptchaVerifierProfile.clear();
            } catch (e) {
                // Error clearing recaptcha
            }
            window.recaptchaVerifierProfile = null;
            setRecaptchaVerifier(null);
        }
        handleSendOTPForPhoneChange();
    };

    // Handle verify OTP and update phone
    const handleVerifyOTPAndUpdatePhone = async () => {
        const otp = otpValues.join("");
        if (otp.length !== 6) {
            setOtpError(true);
            return;
        }

        setOtpLoading(true);
        setOtpError(false);

        try {
            await confirmationResult.confirm(otp);

            // Update phone number via API
            const response = await fetch('/api/profile/change-phone', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPhoneNumber: user.phoneNumber,
                    newPhoneNumber: `+${newPhoneNumber}`
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Update local storage and state
                const updatedUser = { ...user, phoneNumber: data.user.phoneNumber };
                setUser(updatedUser);
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                setProfileData({ ...profileData, phoneNumber: data.user.phoneNumber });
                
            // Reset phone change states
            setIsChangingPhone(false);
            setNewPhoneNumber('');
            setOtpValues(['', '', '', '', '', '']);
            setOtpStep('phone');
            setConfirmationResult(null);
            setResendAvailable(false);
            
            // Clear recaptcha verifier
            if (window.recaptchaVerifierProfile) {
                try {
                    window.recaptchaVerifierProfile.clear();
                } catch (e) {
                    // Error clearing recaptcha
                }
                window.recaptchaVerifierProfile = null;
                setRecaptchaVerifier(null);
            }
            
            setSaveMessage({ type: 'success', text: 'Phone number updated successfully!' });
            setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
        } else {
            throw new Error(data.message || 'Failed to update phone number');
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        setOtpError(true);
        alert(error.message || "Failed to verify OTP. Please try again.");
    } finally {
        setOtpLoading(false);
    }
};

    // Handle profile update
    const handleProfileUpdate = async () => {
        if (!user || !user.phoneNumber) return;

        setIsSaving(true);
        setSaveMessage({ type: '', text: '' });

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: user.phoneNumber,
                    name: profileData.name,
                    email: profileData.email,
                    address: profileData.address
                }),
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
                setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
            } else {
                throw new Error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setSaveMessage({ type: 'error', text: error.message || 'Failed to update profile' });
            setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <main className="container max-w-5xl mx-auto mt-8 mb-20 px-4">
            {/* Hidden reCAPTCHA container */}
            <div id="recaptcha-container-profile" style={{ position: 'absolute', left: '-9999px' }}></div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                    <span className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-200">
                        <span className="flex h-16 w-16 items-center justify-center rounded-xl border bg-gray-200">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" aria-hidden="true" className="text-gray-800" height="38" width="38" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd"></path></svg>
                        </span>
                    </span>
                    <div className="flex min-w-20 flex-col gap-2">
                        <p className="my-0 text-base font-semibold leading-none text-gray-800">
                            {user.phoneNumber || 'Loading...'}
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <button 
                        type="button" 
                        className="rounded-lg border-none p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis-vertical">
                            <circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
                        </svg>
                    </button>
                    {isMenuOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-8">
                <div className="w-full">
                    <div className="inline-flex h-auto w-full max-w-[600px] items-center justify-center rounded-lg border border-gray-300 bg-white p-1 outline-none">
                        <button 
                            onClick={() => setActiveTab('profile')}
                            type="button"
                            className={`inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm sm:text-base font-medium transition-all
                                ${activeTab === 'profile' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <span>Profile Details</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </button>
                        <button 
                            onClick={() => setActiveTab('shortlisted')}
                            type="button"
                            className={`inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm sm:text-base font-medium transition-all
                                ${activeTab === 'shortlisted' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <span>Shortlisted</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
                            </svg>
                        </button>
                    </div>
                    <div className="mt-6">
                        {activeTab === 'profile' && (
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Details</h2>
                                    
                                    {saveMessage.text && (
                                        <div className={`mb-4 p-3 rounded-md ${
                                            saveMessage.type === 'success' 
                                                ? 'bg-green-50 text-green-800 border border-green-200' 
                                                : 'bg-red-50 text-red-800 border border-red-200'
                                        }`}>
                                            {saveMessage.text}
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        {/* Name Field */}
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                                placeholder="Enter your name"
                                            />
                                        </div>

                                        {/* Email Field */}
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                                                placeholder="Enter your email"
                                            />
                                        </div>

                                        {/* Address Field */}
                                        <div>
                                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                                Address
                                            </label>
                                            <textarea
                                                id="address"
                                                value={profileData.address}
                                                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
                                                placeholder="Enter your address"
                                            />
                                        </div>

                                        {/* Phone Number Field */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={profileData.phoneNumber}
                                                    disabled
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                                />
                                                {!isChangingPhone ? (
                                                    <button
                                                        onClick={() => setIsChangingPhone(true)}
                                                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
                                                    >
                                                        Change
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setIsChangingPhone(false);
                                                            setNewPhoneNumber('');
                                                            setOtpStep('phone');
                                                            setOtpValues(['', '', '', '', '', '']);
                                                            setConfirmationResult(null);
                                                            setResendAvailable(false);
                                                            // Clear recaptcha verifier
                                                            if (window.recaptchaVerifierProfile) {
                                                                try {
                                                                    window.recaptchaVerifierProfile.clear();
                                                                } catch (e) {
                                                                    // Error clearing recaptcha
                                                                }
                                                                window.recaptchaVerifierProfile = null;
                                                                setRecaptchaVerifier(null);
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>

                                            {/* Phone Change Form */}
                                            {isChangingPhone && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    {otpStep === 'phone' ? (
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    New Phone Number
                                                                </label>
                                                                <PhoneInput
                                                                    country={'in'}
                                                                    value={newPhoneNumber}
                                                                    onChange={(value) => setNewPhoneNumber(value)}
                                                                    inputClass="!w-full !h-12 !text-base !px-12 !border-gray-300 focus:!border-gray-900 focus:!ring-0"
                                                                    containerClass="!w-full !mb-4"
                                                                />
                                                                <p className="text-sm text-gray-500 text-center mt-2">
                                                                    We'll send you a 6-digit code to verify your number.
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={handleSendOTPForPhoneChange}
                                                                disabled={otpLoading || !newPhoneNumber}
                                                                className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                                            >
                                                                {otpLoading ? 'Sending...' : 'Send OTP'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <div>
                                                                <p className="text-sm text-gray-600 mb-4 text-center">
                                                                    Enter the 6-digit code sent to <br />
                                                                    <span className="font-medium text-gray-900">+{newPhoneNumber}</span>
                                                                </p>
                                                                <div className="flex gap-2 justify-center mb-4">
                                                                    {otpValues.map((value, index) => (
                                                                        <input
                                                                            key={index}
                                                                            id={`otp-profile-${index}`}
                                                                            type="tel"
                                                                            maxLength={1}
                                                                            value={value}
                                                                            onChange={(e) => handleOTPChange(index, e.target.value)}
                                                                            onKeyDown={handleOtpKeyDown}
                                                                            className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-colors ${
                                                                                otpError ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'
                                                                            }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                {otpError && (
                                                                    <p className="text-red-600 text-sm mb-4 text-center">Invalid OTP. Please try again.</p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={handleVerifyOTPAndUpdatePhone}
                                                                disabled={otpLoading || otpValues.join('').length !== 6}
                                                                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium mb-3"
                                                            >
                                                                {otpLoading ? 'Verifying...' : 'Verify & Update'}
                                                            </button>
                                                            <div className="flex items-center justify-between">
                                                                <button
                                                                    onClick={() => {
                                                                        setOtpStep('phone');
                                                                        setOtpValues(['', '', '', '', '', '']);
                                                                        setOtpError(false);
                                                                    }}
                                                                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                                                                >
                                                                    ← Back
                                                                </button>
                                                                <button
                                                                    onClick={handleResendOTP}
                                                                    disabled={!resendAvailable || otpLoading}
                                                                    className={`text-sm font-medium ${
                                                                        resendAvailable && !otpLoading
                                                                            ? "text-gray-900 hover:text-gray-700"
                                                                            : "text-gray-400 cursor-not-allowed"
                                                                    }`}
                                                                >
                                                                    Resend OTP
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Save Button */}
                                        <div className="pt-4">
                                            <button
                                                onClick={handleProfileUpdate}
                                                disabled={isSaving}
                                                className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                            >
                                                {isSaving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'shortlisted' && (
                            <div>
                                {isLoadingFavorites ? (
                                    <div className="text-center p-10 rounded-lg bg-gray-100">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading your favorites...</p>
                                    </div>
                                ) : favoriteProperties.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                        {favoriteProperties.map((property) => (
                                            <div
                                                key={property._id || property.id}
                                                onClick={() => window.open(`/property-details?id=${property._id || property.id}&type=${property.propertyType || 'commercial'}`, '_blank')}
                                                className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 relative cursor-pointer"
                                            >
                                                {/* Property Image */}
                                                <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-300 to-blue-500 relative overflow-hidden">
                                                    <img
                                                        src={property.featuredImageUrl || property.images?.[0] || '/property-icon.svg'}
                                                        alt={property.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Property Details */}
                                                <div className="p-3 sm:p-4">
                                                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                        <h3 className="text-sm sm:text-base font-bold text-gray-900">
                                                            {property.name}
                                                        </h3>
                                                        <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] sm:text-[10px] font-medium rounded-md border border-green-200 whitespace-nowrap">
                                                            {property.ratings?.overall ? `${property.ratings.overall} ⭐` : 'No ratings yet'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-3 sm:mt-4">
                                                        <span className="text-sm sm:text-base font-bold text-gray-900">{property.discountedPrice}</span>
                                                        {property.originalPrice && property.originalPrice !== '₹XX' && (
                                                            <span className="text-xs text-gray-500 line-through">{property.originalPrice}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-10 rounded-lg bg-gray-100">
                                        <p className="text-gray-600">You have no shortlisted properties.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};