'use client';

import { Map, User, Instagram, Youtube, Linkedin, Facebook, Twitter, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import LoginModal from '@/components/LoginModal';
import { loginUser } from '@/utils/auth';
import { useTheme } from '@/context/ThemeContext';

export default function Footer() {
    const pathName = usePathname();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const { isDark } = useTheme();

    useEffect(() => {
        const syncUser = () => {
            try {
                const userJson = localStorage.getItem('currentUser');
                setCurrentUser(userJson ? JSON.parse(userJson) : null);
            } catch (error) {
                console.error("Failed to access localStorage or parse user data:", error);
                setCurrentUser(null);
            }
        };

        syncUser();

        window.addEventListener('onAuthChange', syncUser);

        return () => {
            window.removeEventListener('onAuthChange', syncUser);
        };
    }, []);

    const handleLoginSuccess = (userData) => {
        loginUser(userData);
        setIsLoginOpen(false);
    };

    return (
        <>
            <footer className={`md:hidden border-t fixed bottom-0 left-0 right-0 z-20 transition-colors ${
                isDark 
                    ? 'bg-[#1f2229] border-gray-700' 
                    : 'bg-white border-gray-300'
            }`}>
                <div className="flex items-center justify-around py-0.5">
                    <Link href="/" className={`flex flex-col items-center justify-center w-1/5 h-14 transition-colors duration-200 ${
                        pathName === '/' 
                            ? isDark ? 'text-white font-medium' : 'text-gray-900 font-medium' 
                            : isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                        <Map className="w-5 h-5 mb-0.5" />
                        <span className="text-[0.65rem]">Map view</span>
                    </Link>

                    <Link href="/residential" className="flex flex-col items-center justify-center w-1/5 h-14">
                        <span className={`py-1.5 px-3 rounded-full text-[0.7rem] font-semibold transition-colors duration-200 ${
                            pathName === '/residential' 
                                ? 'text-gray-900 bg-[#ffefad]' 
                                : isDark ? 'text-gray-400 bg-transparent' : 'text-gray-500 bg-transparent'
                        }`}>
                            Residential
                        </span>
                    </Link>

                    <Link href="/builders" className={`flex flex-col items-center justify-center w-1/5 h-14 transition-colors duration-200 ${
                        pathName === '/builders' 
                            ? isDark ? 'text-white font-medium' : 'text-gray-900 font-medium' 
                            : isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                        <Image src="/crown.svg" alt="Crown" width={20} height={20} />
                        <span className="text-[0.65rem] mt-0.5">Builders</span>
                    </Link>

                    <Link href="/commercial" className="flex flex-col items-center justify-center w-1/5 h-14">
                        <span className={`py-1.5 px-3 rounded-full text-[0.7rem] font-semibold transition-colors duration-200 ${
                            pathName === '/commercial' 
                                ? 'text-gray-900 bg-[#ffefad]' 
                                : isDark ? 'text-gray-400 bg-transparent' : 'text-gray-500 bg-transparent'
                        }`}>
                            Commercial
                        </span>
                    </Link>

                    {currentUser ? (
                        <Link href="/dashboard" className={`flex flex-col items-center justify-center w-1/5 h-14 transition-colors duration-200 ${
                            pathName === '/dashboard' 
                                ? isDark ? 'text-white font-medium' : 'text-gray-900 font-medium' 
                                : isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                            <User className="w-5 h-5 mb-0.5" />
                            <span className="text-[0.65rem]">Profile</span>
                        </Link>
                    ) : (
                        <button onClick={() => setIsLoginOpen(true)} className={`flex flex-col items-center justify-center w-1/5 h-14 ${
                            isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                            <User className="w-5 h-5 mb-0.5" />
                            <span className="text-[0.65rem]">Login</span>
                        </button>
                    )}
                </div>
            </footer>

            {pathName !== '/' && (
                <footer className="hidden md:block bg-[#F8F8F8] border-t border-[#E5E7EB]">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                            <div className="space-y-2 md:col-span-2">
                                <Link href="/">
                                    <Image
                                        alt="BuildersInfo Logo"
                                        width={90}
                                        height={24}
                                        src="https://i.ibb.co/gMsT7BMs/buildersinfologo3x.png"
                                        className="h-5 w-auto"
                                        unoptimized
                                    />
                                </Link>
                                <p className="text-xs text-[#6B7280] leading-tight">India&apos;s first brokerage-free real estate discovery platform.</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-[#4A4A4A] mb-2">Company</h3>
                                <ul className="space-y-1">
                                    <li><Link className="text-xs text-[#6B7280] hover:text-[#1A6AC4]" href="/about">About Us</Link></li>
                                    <li><Link className="text-xs text-[#6B7280] hover:text-[#1A6AC4]" href="#">Contact Us</Link></li>
                                    <li><Link className="text-xs text-[#6B7280] hover:text-[#1A6AC4]" href="#">Our Verification Process</Link></li>
                                    <li><Link className="text-xs text-[#6B7280] hover:text-[#1A6AC4]" href="/terms-and-conditions">Terms & Conditions</Link></li>
                                    <li><Link className="text-xs text-[#6B7280] hover:text-[#1A6AC4]" href="/privacy-policy">Privacy Policy</Link></li>
                                    <li><Link className="text-xs text-[#6B7280] hover:text-[#1A6AC4]" href="#">Disclaimer</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-[#4A4A4A] mb-2">Services</h3>
                                <ul className="space-y-1">
                                    <li><Link className="text-xs text-[#6B7280] hover:text-[#1A6AC4]" href="/hand-holding">Hand Holding</Link></li>
                                    <li><Link className="text-xs text-[#6B7280] hover:text-[#1A6AC4]" href="/tag-along">Tag Along</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-[#4A4A4A] mb-2">Follow Us</h3>
                                <div className="flex items-center gap-3">
                                    <Link className="text-[#6B7280] hover:text-[#1A6AC4]" href="#"><Facebook className="w-5 h-5" strokeWidth={2} /></Link>
                                    <Link className="text-[#6B7280] hover:text-[#1A6AC4]" href="#"><Twitter className="w-5 h-5" strokeWidth={2} /></Link>
                                    <Link className="text-[#6B7280] hover:text-[#1A6AC4]" href="https://www.instagram.com/buildersinfo.in/"><Instagram className="w-5 h-5" strokeWidth={2} /></Link>
                                    <Link className="text-[#6B7280] hover:text-[#1A6AC4]" href="https://www.linkedin.com/company/buildersinfo"><Linkedin className="w-5 h-5" strokeWidth={2} /></Link>
                                    <Link className="text-[#6B7280] hover:text-[#1A6AC4]" href="https://www.youtube.com/@buildersinfo.in"><Youtube className="w-5 h-5" strokeWidth={2} /></Link>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <h3 className="text-sm font-semibold text-[#4A4A4A] mb-1">Contact</h3>
                                    <a href="mailto:support@buildersinfo.in" className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1A6AC4]">
                                        <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={2} /> support@buildersinfo.in
                                    </a>
                                    <a href="tel:+918884886822" className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1A6AC4]">
                                        <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={2} /> +918884886822
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 border-t border-[#E5E7EB] pt-4 text-center text-xs text-[#6B7280]">
                            <p>© 2026 Buildersinfo.in. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            )}

            {isLoginOpen && (
                <LoginModal
                    onClose={() => setIsLoginOpen(false)}
                    onProceed={handleLoginSuccess}
                />
            )}
        </>
    );
}
