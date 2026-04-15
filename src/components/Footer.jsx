'use client';

import { Map, User, Instagram, Youtube, Linkedin, Facebook, Twitter, Mail, Phone, Building2, Home, Crown } from 'lucide-react';
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
    const [globalConfig, setGlobalConfig] = useState({ isFullNavVisible: false, whatsappNo: null });
    const { isDark } = useTheme();

    useEffect(() => {
        fetch('/api/global-config')
            .then((res) => res.json())
            .then((data) => {
                if (data?.success && data?.config) setGlobalConfig(data.config);
            })
            .catch(() => { });
    }, []);

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
            <footer className={`md:hidden border-t fixed bottom-0 left-0 right-0 z-50 transition-colors shadow-[0_-2px_10px_rgba(0,0,0,0.05)] ${isDark
                    ? 'bg-[#1A1A1A] border-[#333333]'
                    : 'bg-white border-gray-200'
                }`}>
                <div className="flex items-center justify-between px-2 py-1">
                    <Link href="/" className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors duration-200 ${pathName === '/'
                            ? isDark ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium'
                            : isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                        <Map className={`w-5 h-5 mb-0.5 ${pathName === '/' ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-gray-500' : 'text-gray-400')}`} />
                        <span className="text-[0.6rem] font-medium">Map-View</span>
                    </Link>

                    <Link href="/commercial" className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors duration-200 ${pathName === '/commercial'
                            ? isDark ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium'
                            : isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                        <Building2 className={`w-5 h-5 mb-0.5 ${pathName === '/commercial' ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-gray-500' : 'text-gray-400')}`} />
                        <span className="text-[0.6rem] font-medium">Commercial</span>
                    </Link>

                    <Link href="/residential" className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors duration-200 ${pathName === '/residential'
                            ? isDark ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium'
                            : isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                        <Home className={`w-5 h-5 mb-0.5 ${pathName === '/residential' ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-gray-500' : 'text-gray-400')}`} />
                        <span className="text-[0.6rem] font-medium">Residential</span>
                    </Link>

                    <Link href="/builders" className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors duration-200 ${pathName === '/builders'
                            ? isDark ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium'
                            : isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                        <Crown className={`w-5 h-5 mb-0.5 ${pathName === '/builders' ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-gray-500' : 'text-gray-400')}`} />
                        <span className="text-[0.6rem] font-medium">Builders</span>
                    </Link>
                </div>
            </footer>

            {pathName !== '/' && (
                <footer className={`hidden md:block border-t transition-colors duration-300 ${isDark ? 'bg-[#1A1A1A] border-[#333333]' : 'bg-[#F8F8F8] border-[#E5E7EB]'}`}>
                    <div className="px-4 sm:px-6 lg:px-8 py-5">
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
                                <p className={`text-xs leading-tight ${isDark ? 'text-[#CCCCCC]' : 'text-[#6B7280]'}`}>India&apos;s first brokerage-free real estate discovery platform.</p>
                            </div>
                            <div>
                                <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-[#4A4A4A]'}`}>Company</h3>
                                <ul className="space-y-1">
                                    <li><Link className={`text-xs hover:text-[#007BFF] ${isDark ? 'text-[#CCCCCC]' : 'text-[#6B7280] hover:text-[#1A6AC4]'}`} href="/about">About Us</Link></li>
                                    <li><Link className={`text-xs hover:text-[#007BFF] ${isDark ? 'text-[#CCCCCC]' : 'text-[#6B7280] hover:text-[#1A6AC4]'}`} href="#">Contact Us</Link></li>
                                    <li><Link className={`text-xs hover:text-[#007BFF] ${isDark ? 'text-[#CCCCCC]' : 'text-[#6B7280] hover:text-[#1A6AC4]'}`} href="#">Our Verification Process</Link></li>
                                    <li><Link className={`text-xs hover:text-[#007BFF] ${isDark ? 'text-[#CCCCCC]' : 'text-[#6B7280] hover:text-[#1A6AC4]'}`} href="/terms-and-conditions">Terms & Conditions</Link></li>
                                    <li><Link className={`text-xs hover:text-[#007BFF] ${isDark ? 'text-[#CCCCCC]' : 'text-[#6B7280] hover:text-[#1A6AC4]'}`} href="/privacy-policy">Privacy Policy</Link></li>
                                    <li><Link className={`text-xs hover:text-[#007BFF] ${isDark ? 'text-[#CCCCCC]' : 'text-[#6B7280] hover:text-[#1A6AC4]'}`} href="#">Disclaimer</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-[#4A4A4A]'}`}>Services</h3>
                                <ul className="space-y-1">
                                    <li><Link className={`text-xs hover:text-[#007BFF] ${isDark ? 'text-[#CCCCCC]' : 'text-[#6B7280] hover:text-[#1A6AC4]'}`} href="/hand-holding">Hand Holding</Link></li>
                                    <li><Link className={`text-xs hover:text-[#007BFF] ${isDark ? 'text-[#CCCCCC]' : 'text-[#6B7280] hover:text-[#1A6AC4]'}`} href="/tag-along">Tag Along</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-[#4A4A4A]'}`}>Follow Us</h3>
                                <div className="flex items-center gap-3">
                                    <Link className={isDark ? 'text-[#CCCCCC] hover:text-[#007BFF]' : 'text-[#6B7280] hover:text-[#1A6AC4]'} href="#"><Facebook className="w-5 h-5" strokeWidth={2} /></Link>
                                    <Link className={isDark ? 'text-[#CCCCCC] hover:text-[#007BFF]' : 'text-[#6B7280] hover:text-[#1A6AC4]'} href="#"><Twitter className="w-5 h-5" strokeWidth={2} /></Link>
                                    <Link className={isDark ? 'text-[#CCCCCC] hover:text-[#007BFF]' : 'text-[#6B7280] hover:text-[#1A6AC4]'} href="https://www.instagram.com/buildersinfo.in/"><Instagram className="w-5 h-5" strokeWidth={2} /></Link>
                                    <Link className={isDark ? 'text-[#CCCCCC] hover:text-[#007BFF]' : 'text-[#6B7280] hover:text-[#1A6AC4]'} href="https://www.linkedin.com/company/buildersinfo"><Linkedin className="w-5 h-5" strokeWidth={2} /></Link>
                                    <Link className={isDark ? 'text-[#CCCCCC] hover:text-[#007BFF]' : 'text-[#6B7280] hover:text-[#1A6AC4]'} href="https://www.youtube.com/@buildersinfo.in"><Youtube className="w-5 h-5" strokeWidth={2} /></Link>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-[#4A4A4A]'}`}>Contact</h3>
                                    <a href="mailto:support@buildersinfo.in" className={`flex items-center gap-1.5 text-xs hover:text-[#007BFF] ${isDark ? 'text-[#CCCCCC]' : 'text-[#6B7280] hover:text-[#1A6AC4]'}`}>
                                        <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={2} /> support@buildersinfo.in
                                    </a>
                                    {globalConfig.whatsappNo != null && (() => {
                                        const raw = String(globalConfig.whatsappNo).replace(/\D/g, '');
                                        const tel = raw.length === 10 ? '91' + raw : raw.startsWith('91') ? raw : raw;
                                        const display = tel.length === 12 && tel.startsWith('91') ? `+91 ${tel.slice(2, 7)} ${tel.slice(7)}` : tel ? `+${tel}` : '';
                                        return (
                                            <a href={`tel:+${tel}`} className={`flex items-center gap-1.5 text-xs hover:text-[#007BFF] ${isDark ? 'text-[#CCCCCC]' : 'text-[#6B7280] hover:text-[#1A6AC4]'}`}>
                                                <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={2} /> {display}
                                            </a>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                        <div className={`mt-4 border-t pt-4 text-center text-xs transition-colors ${isDark ? 'border-[#333333] text-[#CCCCCC]' : 'border-[#E5E7EB] text-[#6B7280]'}`}>
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
