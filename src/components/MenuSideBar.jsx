"use client";
import {
    X,
    Mail,
    Linkedin,
    Youtube,
    Instagram,
    Info,
    SquareCheck,
    Headset,
    FileText,
    EyeOff,
    ChevronDown,
    ChevronUp,
    Copy,
    CopyCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginModal from '@/components/LoginModal';
import VerificationProcessModal from "./VerificationProcessModal";

export default function MenuSideBar({ onClose }) {
    const [contactOpen, setContactOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isVerificationOpen, setIsVerificationOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        try {
            const userJson = localStorage.getItem('currentUser');
            if (userJson) {
                setCurrentUser(JSON.parse(userJson));
            }
        } catch (error) {
            console.error("Failed to parse user data from localStorage:", error);
        }

        setTimeout(() => setIsVisible(true), 10);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText("support@buildersinfo.in");
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleLoginSuccess = (userData) => {
        setIsLoginOpen(false);
        window.location.reload();
    };

    return (
        <>
            <div className="fixed inset-0 z-50">
                <div
                    onClick={handleClose}
                    className="absolute inset-0 bg-gray-900 opacity-80"
                ></div>

                <div
                    className={`absolute right-0 top-0 w-72 md:w-96 h-full rounded-l-2xl bg-white shadow-lg p-3 md:p-6 pl-4 pt-4 flex flex-col transform transition-transform duration-300 ${isVisible ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    <div className="flex justify-between items-start mb-4 md:mb-8 border-b pb-5 border-gray-300">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center justify-center h-12 w-12 rounded-full bg-[#E5E5E5]">
                                <Image src="/profile-pic.svg" className="object-contain" alt="Profile" width={32} height={32} />
                            </span>
                            {currentUser ? (
                                <div className="flex flex-col">
                                    <span className="text-gray-800 font-semibold">{currentUser.phoneNumber}</span>
                                    <Link
                                        href="/dashboard"
                                        onClick={handleClose}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            ) : (
                                <button onClick={() => setIsLoginOpen(true)} className="underline text-[0.9rem] font-semibold text-gray-800">
                                    Login
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto space-y-6 px-0 md:px-3">
                        <Link onClick={handleClose}
                            href="/about-us"
                            className="flex items-center gap-3 text-gray-800 font-medium rounded-lg px-2 py-2 hover:bg-gray-50"
                        >
                            <Info className="w-5 h-5" />
                            <span>About Us</span>
                        </Link>

                        <button
                            onClick={() => setIsVerificationOpen(true)}
                            className="w-full flex items-center gap-3 text-gray-800 font-medium rounded-lg px-2 py-2 hover:bg-gray-50"
                        >
                            <SquareCheck className="w-5 h-5" />
                            <span>Our Verification Process</span>
                        </button>

                        <div>
                            <button
                                onClick={() => setContactOpen(!contactOpen)}
                                className="w-full flex items-center justify-between text-gray-800 font-medium rounded-lg px-2 py-2 hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <Headset className="w-5 h-5" />
                                    <span>Contact Us</span>
                                </div>
                                {contactOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            <div className={`overflow-hidden transition-all duration-300 ${contactOpen ? "max-h-60 mt-3" : "max-h-0"}`}>
                                <div className="pl-8 space-y-3 text-sm text-gray-600 relative">
                                    <div className="absolute left-4 top-0 bottom-1.5 w-[1.5px] bg-gray-400"></div>
                                    <span className="flex flex-row items-center justify-between relative">
                                        <div className="absolute -left-4 rounded-full w-4 h-0.5 bg-gray-400"></div>
                                        <Link href="mailto:support@buildersinfo.in" className="flex items-center gap-2 rounded-lg px-2 py-2 underline hover:no-underline">
                                            <Mail className="w-4 h-4" /> support@buildersinfo.in
                                        </Link>
                                        <button onClick={handleCopy} className="p-1">
                                            {copied ? <CopyCheck className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 hover:cursor-pointer" />}
                                        </button>
                                    </span>
                                    <Link href="https://wa.me/+918884886822/?text=Hello%20buildersinfo.in" className="flex text-gray-700 items-center gap-2 rounded-lg px-2 py-2 underline hover:no-underline relative">
                                        <div className="absolute -left-4 rounded-full w-4 h-0.5 bg-gray-400"></div>
                                        <Image src="/whatsapp-line.svg" width={16} height={16} alt="WhatsApp" />
                                        Whatsapp
                                    </Link>
                                    <Link href="http://www.linkedin.com/company/buildersinfo" className="flex items-center gap-2 rounded-lg px-2 py-2 underline hover:no-underline relative">
                                        <div className="absolute -left-4 rounded-full w-4 h-0.5 bg-gray-400"></div>
                                        <Linkedin className="w-4 h-4" /> LinkedIn
                                    </Link>
                                    <Link href="https://www.youtube.com/@buildersinfo" className="flex items-center gap-2 rounded-lg px-2 py-2 underline hover:no-underline relative">
                                        <div className="absolute -left-4 rounded-full w-4 h-0.5 bg-gray-400"></div>
                                        <Youtube className="w-4 h-4" /> YouTube
                                    </Link>
                                    <Link href="https://www.instagram.com/buildersinfo.in/" className="flex items-center gap-2 rounded-lg px-2 py-2 underline hover:no-underline relative">
                                        <div className="absolute -left-4 rounded-full w-4 h-0.5 bg-gray-400"></div>
                                        <Instagram className="w-4 h-4" /> Instagram
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link onClick={handleClose} href="/tag-along">
                            <div className="flex justify-center items-center flex-1">
                                <Image src="/tag-along-pic.svg" alt="Tag Along" width={260} height={130} className="object-contain w-full h-full" />
                            </div>
                        </Link>
                    </nav>

                    <div className="border-t border-gray-300 mt-auto pt-4 space-y-4 px-3">
                        <Link onClick={handleClose} href="/privacy-policy" className="flex items-center gap-3 text-gray-800 font-medium rounded-lg px-2 py-2 hover:bg-gray-50">
                            <EyeOff className="w-5 h-5" />
                            <span>Privacy Policy</span>
                        </Link>
                        <Link onClick={handleClose} href="/terms-and-conditions" className="flex items-center gap-3 text-gray-800 font-medium rounded-lg px-2 py-2 hover:bg-gray-50">
                            <FileText className="w-5 h-5" />
                            <span>Terms & Conditions</span>
                        </Link>
                    </div>
                </div>
            </div>

            {isLoginOpen && (
                <LoginModal
                    onClose={() => setIsLoginOpen(false)}
                    onProceed={handleLoginSuccess}
                />
            )}

            {isVerificationOpen && (
                <VerificationProcessModal onClose={() => setIsVerificationOpen(false)} />
            )}
        </>
    );
}