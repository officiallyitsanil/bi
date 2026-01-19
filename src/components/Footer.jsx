'use client';

import { Map, User, Instagram, Youtube, Linkedin } from 'lucide-react';
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
                <footer className={`hidden md:block border-t transition-colors ${
                    isDark 
                        ? 'bg-[#1f2229] border-gray-700' 
                        : 'bg-white border-gray-900'
                }`}>
                    <div className={`max-w-4xl px-12 mx-auto py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-left text-base ${
                        isDark ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                        <div>
                            <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Services</h4>
                            <ul className="space-y-1">
                                <li><Link href="/hand-holding" className={`hover:underline ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>Hand Holding</Link></li>
                                <li><Link href="/tag-along" className={`hover:underline ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>Tag Along</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Company</h4>
                            <ul className="space-y-1">
                                <li><Link href="/terms-and-conditions" className={`hover:underline ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>Terms and Conditions</Link></li>
                                <li><Link href="/privacy-policy" className={`hover:underline ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>Privacy Policy</Link></li>
                                <li><Link href="/about-us" className={`hover:underline ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>About Us</Link></li>
                            </ul>
                        </div>
                        <div className='ml-4'>
                            <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Contact Us</h4>
                            <p className="mb-1">+918884886822</p>
                            <p className="mb-2">email: <Link href="mailto:support@buildersinfo.in" className="hover:underline">support@buildersinfo.in</Link></p>
                            <div className="flex space-x-4 mt-2">
                                <Link href="https://www.instagram.com/buildersinfo.in/" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>
                                    <Instagram className="w-7" alt='instagram' />
                                </Link>
                                <Link href="https://www.youtube.com/@buildersinfo.in" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>
                                    <Youtube className="w-7" alt='youtube' />
                                </Link>
                                <Link href="http://www.linkedin.com/company/buildersinfo" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>
                                    <Linkedin className="w-7" alt='linkedin' />
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className={`py-3 text-center text-sm border-t ${
                        isDark 
                            ? 'bg-[#fbbf24] text-black border-gray-700' 
                            : 'bg-[#ffdd57] text-black border-gray-300'
                    }`}>
                        © 2025 - <Link href="https://buildersinfo.in">Buildersinfo.in</Link> - All Rights Reserved
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
