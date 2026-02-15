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
import { useTheme } from "@/context/ThemeContext";

export default function MenuSideBar({ onClose }) {
    const { isDark } = useTheme();
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
            <style jsx>{`
                .menu-drawer-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: ${isDark ? "#4b5563 #282c34" : "#cbd5e1 #f1f5f9"};
                }
                .menu-drawer-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .menu-drawer-scroll::-webkit-scrollbar-track {
                    background: ${isDark ? "#282c34" : "#f1f5f9"};
                }
                .menu-drawer-scroll::-webkit-scrollbar-thumb {
                    background: ${isDark ? "#4b5563" : "#cbd5e1"};
                    border-radius: 4px;
                }
                .menu-drawer-scroll::-webkit-scrollbar-thumb:hover {
                    background: ${isDark ? "#6b7280" : "#94a3b8"};
                }
            `}</style>
            <div className="fixed inset-0 z-50">
                {/* Backdrop - light blur, more transparent */}
                <div
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                />

                {/* Drawer - narrower, top & bottom fixed, only middle scrolls */}
                <div
                    className={`absolute right-0 top-0 w-56 md:w-72 h-full rounded-l-[14px] flex flex-col transform transition-all duration-300 overflow-hidden ${
                        isVisible ? "translate-x-0" : "translate-x-full"
                    } ${isDark ? "bg-[#1f2229]" : "bg-[#FFFFFF]"}`}
                    style={{ boxShadow: isDark ? "-4px 0 24px rgba(0,0,0,0.3)" : "-4px 0 24px rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.06)" }}
                >
                    {/* 1. Top Header - FIXED, not scrollable */}
                    <div className={`flex-shrink-0 rounded-b-xl shadow-sm px-3 pt-2 pb-3 ${isDark ? "bg-[#282c34]" : "bg-white"}`}>
                        <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-[#3a3f4b]" : "bg-[#E5E5E5]"}`}>
                                    <User className="w-4 h-4 text-blue-500" strokeWidth={2} />
                                </div>
                                <div className="min-w-0">
                                    <p className={`font-bold text-xs leading-tight ${isDark ? "text-white" : "text-[#212121]"}`}>Hello 👋</p>
                                    <ul className={`mt-1 space-y-0.5 text-[11px] max-[435px]:hidden ${isDark ? "text-gray-400" : "text-[#616161]"}`}>
                                        <li className="flex items-center gap-1">
                                            <Check className="w-3 h-3 flex-shrink-0 text-green-500" strokeWidth={2.5} />
                                            <span>Easy Contact with sellers</span>
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <Check className="w-3 h-3 flex-shrink-0 text-green-500" strokeWidth={2.5} />
                                            <span>Personalized experience</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex items-start gap-1 flex-shrink-0">
                                {currentUser ? (
                                    <Link
                                        href="/dashboard"
                                        onClick={handleClose}
                                        className="px-2 py-1.5 text-white font-semibold text-[11px] rounded-md shadow-sm transition-colors hover:opacity-95 bg-blue-600"
                                    >
                                        Profile
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => setIsLoginOpen(true)}
                                        className="px-2 py-1.5 text-white font-semibold text-[11px] rounded-md shadow-sm transition-colors hover:opacity-95 bg-blue-600"
                                    >
                                        Login
                                    </button>
                                )}
                                <button
                                    onClick={handleClose}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isDark ? "bg-[#3a3f4b] hover:bg-[#4b5563] text-gray-300" : "bg-[#E8E8E8] hover:bg-[#DADADA] text-[#374151]"}`}
                                    aria-label="Close menu"
                                >
                                    <X className="w-3 h-3" strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2. MIDDLE - SCROLLABLE: Nav + Tag Along + Download App (thin scrollbar) */}
                    <div className={`menu-drawer-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${isDark ? "bg-[#1f2229]" : "bg-white"}`}>
                        <div className="px-3 py-1">
                            <nav className="space-y-0">
                                <Link
                                    onClick={handleClose}
                                    href="/about-us"
                                    className={`flex items-center gap-2 py-2 font-medium text-xs rounded-md transition-colors -mx-1.5 px-1.5 ${isDark ? "text-gray-300 hover:bg-white/10" : "text-[#4A4A4A] hover:bg-gray-50/80"}`}
                                >
                                    <Info className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-gray-400" : "text-[#4A4A4A]"}`} strokeWidth={1.5} />
                                    <span>About Us</span>
                                </Link>
                                <button
                                    onClick={() => setIsVerificationOpen(true)}
                                    className={`w-full flex items-center gap-2 py-2 font-medium text-xs rounded-md transition-colors text-left -mx-1.5 px-1.5 ${isDark ? "text-gray-300 hover:bg-white/10" : "text-[#4A4A4A] hover:bg-gray-50/80"}`}
                                >
                                    <SquareCheck className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-gray-400" : "text-[#4A4A4A]"}`} strokeWidth={1.5} />
                                    <span>Our Verification Process</span>
                                </button>
                                <a
                                    href="mailto:support@buildersinfo.in"
                                    onClick={handleClose}
                                    className={`flex items-center justify-between gap-2 py-2 font-medium text-xs rounded-md transition-colors -mx-1.5 px-1.5 ${isDark ? "text-gray-300 hover:bg-white/10" : "text-[#4A4A4A] hover:bg-gray-50/80"}`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <HelpCircle className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-gray-400" : "text-[#4A4A4A]"}`} strokeWidth={1.5} />
                                        <span>Visit Help Center</span>
                                    </div>
                                    <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-gray-400" : "text-[#4A4A4A]"}`} />
                                </a>
                            </nav>
                        </div>

                        {/* Tag Along - inside scrollable */}
                        <div className="px-3 pb-3 max-[435px]:hidden">
                            <Link onClick={handleClose} href="/tag-along" className="block">
                                <div
                                    className={`rounded-lg p-2 flex items-center gap-2 min-h-[64px] shadow-[0_1px_2px_rgba(0,0,0,0.06)] ${isDark ? "bg-[#282c34]" : ""}`}
                                    style={isDark ? undefined : { backgroundColor: "#F5F0E6" }}
                                >
                                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                                        <p className={`font-bold text-xs leading-tight ${isDark ? "text-white" : "text-[#212121]"}`}>Tag Along</p>
                                        <p className={`text-[11px] font-normal mt-0.5 leading-snug ${isDark ? "text-gray-400" : "text-[#212121]"}`}>
                                            Buy Large Land Parcels with us, starting @ 4 Lakh/ Acre.
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 w-[72px] h-[30px] relative rounded overflow-hidden">
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

                        {/* Download Builderinfo App - inside scrollable */}
                        <div className="px-3 pb-3 max-[435px]:hidden">
                            <div className={`rounded-lg overflow-hidden w-full shadow-[0_1px_2px_rgba(0,0,0,0.06)] ${isDark ? "bg-[#282c34]" : "bg-white"}`}>
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
                    </div>

                    {/* 3. Bottom - FIXED, not scrollable: Legal + Follow on */}
                    <div className={`flex-shrink-0 px-3 pb-3 pt-1 mt-auto ${isDark ? "bg-[#1f2229]" : "bg-white"}`}>
                        <div className="space-y-0">
                            <Link
                                onClick={handleClose}
                                href="/privacy-policy"
                                className={`flex items-center gap-2 py-2 px-1.5 -mx-1.5 font-medium text-xs rounded-md transition-colors ${isDark ? "text-gray-300 hover:bg-white/10" : "text-[#212121] hover:bg-gray-50"}`}
                            >
                                <Unlink className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-gray-500" : "text-[#757575]"}`} strokeWidth={1.5} />
                                <span>Privacy Policy</span>
                            </Link>
                            <Link
                                onClick={handleClose}
                                href="/terms-and-conditions"
                                className={`flex items-center gap-2 py-2 px-1.5 -mx-1.5 font-medium text-xs rounded-md transition-colors ${isDark ? "text-gray-300 hover:bg-white/10" : "text-[#212121] hover:bg-gray-50"}`}
                            >
                                <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-gray-500" : "text-[#757575]"}`} strokeWidth={1.5} />
                                <span>Terms & Conditions</span>
                            </Link>
                        </div>
                        <div className={`border-t mt-2 pt-2 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[11px] font-medium ${isDark ? "text-gray-300" : "text-[#212121]"}`}>Follow on</span>
                                <div className="flex items-center gap-1.5">
                                    <a
                                        href="https://www.facebook.com/buildersinfo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`transition-colors p-0.5 ${isDark ? "text-gray-500 hover:text-blue-400" : "text-[#757575] hover:text-[#212121]"}`}
                                        aria-label="Facebook"
                                    >
                                        <Facebook className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    </a>
                                    <a
                                        href="https://twitter.com/buildersinfo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`transition-colors p-0.5 ${isDark ? "text-gray-500 hover:text-blue-400" : "text-[#757575] hover:text-[#212121]"}`}
                                        aria-label="Twitter"
                                    >
                                        <Twitter className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    </a>
                                    <a
                                        href="https://www.instagram.com/buildersinfo.in/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`transition-colors p-0.5 ${isDark ? "text-gray-500 hover:text-blue-400" : "text-[#757575] hover:text-[#212121]"}`}
                                        aria-label="Instagram"
                                    >
                                        <Instagram className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    </a>
                                    <a
                                        href="http://www.linkedin.com/company/buildersinfo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`transition-colors p-0.5 ${isDark ? "text-gray-500 hover:text-blue-400" : "text-[#757575] hover:text-[#212121]"}`}
                                        aria-label="LinkedIn"
                                    >
                                        <Linkedin className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    </a>
                                    <a
                                        href="https://www.youtube.com/@buildersinfo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`transition-colors p-0.5 ${isDark ? "text-gray-500 hover:text-blue-400" : "text-[#757575] hover:text-[#212121]"}`}
                                        aria-label="YouTube"
                                    >
                                        <Youtube className="w-3.5 h-3.5" strokeWidth={1.5} />
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
