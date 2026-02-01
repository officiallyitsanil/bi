"use client";
import {
    X,
    Info,
    SquareCheck,
    HelpCircle,
    FileText,
    Unlink,
    ChevronRight,
    Check,
    User,
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    Twitter,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginModal from "@/components/LoginModal";
import VerificationProcessModal from "./VerificationProcessModal";

export default function MenuSideBar({ onClose }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isVerificationOpen, setIsVerificationOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        try {
            const userJson = localStorage.getItem("currentUser");
            if (userJson) {
                setCurrentUser(JSON.parse(userJson));
            }
        } catch (error) {
            console.error("Failed to parse user data from localStorage:", error);
        }
        setTimeout(() => setIsVisible(true), 10);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300);
    };

    const handleLoginSuccess = (userData) => {
        setIsLoginOpen(false);
        window.location.reload();
    };

    return (
        <>
            <div className="fixed inset-0 z-50">
                {/* Backdrop - light blur, more transparent */}
                <div
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                />

                {/* Drawer - same width logic: w-72 md:w-96; soft grey shadow left/bottom */}
                <div
                    className={`absolute right-0 top-0 w-72 md:w-96 h-full bg-[#FFFFFF] rounded-l-[20px] flex flex-col transform transition-transform duration-300 overflow-y-auto ${
                        isVisible ? "translate-x-0" : "translate-x-full"
                    }`}
                    style={{ boxShadow: "-4px 0 24px rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.06)" }}
                >
                    {/* 1. Top Header - reduced sizes: avatar, Hello, benefits text, Login/Profile button, close */}
                    <div className="flex-shrink-0 bg-white rounded-b-2xl shadow-sm px-4 pt-3 pb-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#E5E5E5]">
                                    <User className="w-5 h-5 text-[#2563EB]" strokeWidth={2} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[#212121] font-bold text-sm leading-tight">Hello 👋</p>
                                    <ul className="mt-1.5 space-y-1 text-xs text-[#616161] max-[435px]:hidden">
                                        <li className="flex items-center gap-1.5">
                                            <Check className="w-3.5 h-3.5 flex-shrink-0 text-[#22C55E]" strokeWidth={2.5} />
                                            <span>Easy Contact with sellers</span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <Check className="w-3.5 h-3.5 flex-shrink-0 text-[#22C55E]" strokeWidth={2.5} />
                                            <span>Personalized experience</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex items-start gap-1.5 flex-shrink-0">
                                {currentUser ? (
                                    <Link
                                        href="/dashboard"
                                        onClick={handleClose}
                                        className="px-3 py-2 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors hover:opacity-95 bg-[#2563EB]"
                                    >
                                        Profile
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => setIsLoginOpen(true)}
                                        className="px-3 py-2 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors hover:opacity-95 bg-[#2563EB]"
                                    >
                                        Login
                                    </button>
                                )}
                                <button
                                    onClick={handleClose}
                                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors bg-[#E8E8E8] hover:bg-[#DADADA] text-[#374151]"
                                    aria-label="Close menu"
                                >
                                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2. Navigation - reduced: smaller icons, text, padding */}
                    <div className="flex-shrink-0 px-4 py-1.5 bg-white">
                        <nav className="space-y-0">
                            <Link
                                onClick={handleClose}
                                href="/about-us"
                                className="flex items-center gap-2.5 py-3 text-[#4A4A4A] font-medium text-sm hover:bg-gray-50/80 rounded-lg transition-colors -mx-2 px-2"
                            >
                                <Info className="w-4 h-4 flex-shrink-0 text-[#4A4A4A]" strokeWidth={1.5} />
                                <span>About Us</span>
                            </Link>
                            <button
                                onClick={() => setIsVerificationOpen(true)}
                                className="w-full flex items-center gap-2.5 py-3 text-[#4A4A4A] font-medium text-sm hover:bg-gray-50/80 rounded-lg transition-colors text-left -mx-2 px-2"
                            >
                                <SquareCheck className="w-4 h-4 flex-shrink-0 text-[#4A4A4A]" strokeWidth={1.5} />
                                <span>Our Verification Process</span>
                            </button>
                            <a
                                href="mailto:support@buildersinfo.in"
                                onClick={handleClose}
                                className="flex items-center justify-between gap-2.5 py-3 text-[#4A4A4A] font-medium text-sm hover:bg-gray-50/80 rounded-lg transition-colors -mx-2 px-2"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <HelpCircle className="w-4 h-4 flex-shrink-0 text-[#4A4A4A]" strokeWidth={1.5} />
                                    <span>Visit Help Center</span>
                                </div>
                                <ChevronRight className="w-4 h-4 flex-shrink-0 text-[#4A4A4A]" />
                            </a>
                        </nav>
                    </div>

                    {/* 3. Tag Along - hidden on mobile < 435px */}
                    <div className="flex-shrink-0 px-4 pb-4 max-[435px]:hidden">
                        <Link onClick={handleClose} href="/tag-along" className="block">
                            <div
                                className="rounded-xl p-3 flex items-center gap-3 min-h-[80px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                                style={{ backgroundColor: "#F5F0E6" }}
                            >
                                <div className="min-w-0 flex-1 flex flex-col justify-center">
                                    <p className="font-bold text-[#212121] text-sm leading-tight">Tag Along</p>
                                    <p className="text-[#212121] text-xs font-normal mt-1 leading-snug">
                                        Buy Large Land Parcels with us, starting @ 4 Lakh/ Acre.
                                    </p>
                                </div>
                                <div className="flex-shrink-0 w-[100px] h-[42px] relative rounded-lg overflow-hidden">
                                    <Image
                                        src="/tag-along-pic.svg"
                                        alt="Tag Along"
                                        fill
                                        className="object-contain object-right"
                                    />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* 4. Download Builderinfo App - hidden on mobile < 435px */}
                    <div className="flex-shrink-0 px-4 pb-4 max-[435px]:hidden">
                        <div className="rounded-xl overflow-hidden w-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                            <Image
                                src="/drawer-banner.png"
                                alt="Download Builderinfo App - App Store, Google Play, QR Code"
                                width={400}
                                height={200}
                                className="w-full h-auto object-contain"
                                unoptimized
                            />
                        </div>
                    </div>

                    {/* 5. Bottom - Legal + Follow on - reduced: smaller text, icons, padding */}
                    <div className="flex-shrink-0 px-4 pb-4 pt-1.5 mt-auto bg-white">
                        <div className="space-y-0">
                            <Link
                                onClick={handleClose}
                                href="/privacy-policy"
                                className="flex items-center gap-2.5 py-2.5 px-2 -mx-2 text-[#212121] font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Unlink className="w-4 h-4 text-[#757575] flex-shrink-0" strokeWidth={1.5} />
                                <span>Privacy Policy</span>
                            </Link>
                            <Link
                                onClick={handleClose}
                                href="/terms-and-conditions"
                                className="flex items-center gap-2.5 py-2.5 px-2 -mx-2 text-[#212121] font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FileText className="w-4 h-4 text-[#757575] flex-shrink-0" strokeWidth={1.5} />
                                <span>Terms & Conditions</span>
                            </Link>
                        </div>
                        <div className="border-t border-gray-200 mt-3 pt-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[#212121] text-xs font-medium">Follow on</span>
                                <div className="flex items-center gap-2">
                                    <a
                                        href="https://www.facebook.com/buildersinfo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#757575] hover:text-[#212121] transition-colors p-0.5"
                                        aria-label="Facebook"
                                    >
                                        <Facebook className="w-4 h-4" strokeWidth={1.5} />
                                    </a>
                                    <a
                                        href="https://twitter.com/buildersinfo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#757575] hover:text-[#212121] transition-colors p-0.5"
                                        aria-label="Twitter"
                                    >
                                        <Twitter className="w-4 h-4" strokeWidth={1.5} />
                                    </a>
                                    <a
                                        href="https://www.instagram.com/buildersinfo.in/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#757575] hover:text-[#212121] transition-colors p-0.5"
                                        aria-label="Instagram"
                                    >
                                        <Instagram className="w-4 h-4" strokeWidth={1.5} />
                                    </a>
                                    <a
                                        href="http://www.linkedin.com/company/buildersinfo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#757575] hover:text-[#212121] transition-colors p-0.5"
                                        aria-label="LinkedIn"
                                    >
                                        <Linkedin className="w-4 h-4" strokeWidth={1.5} />
                                    </a>
                                    <a
                                        href="https://www.youtube.com/@buildersinfo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#757575] hover:text-[#212121] transition-colors p-0.5"
                                        aria-label="YouTube"
                                    >
                                        <Youtube className="w-4 h-4" strokeWidth={1.5} />
                                    </a>
                                </div>
                            </div>
                        </div>
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
