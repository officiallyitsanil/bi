'use client';

import { Map, User, Instagram, Youtube, Linkedin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import LoginModal from '@/components/LoginModal';
import { loginUser } from '@/utils/auth'; // 

export default function Footer() {
    const pathName = usePathname();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

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
            <footer className="md:hidden bg-white border-t border-gray-300 fixed bottom-0 left-0 right-0 z-20">
                <div className="flex items-center justify-around py-0.5">
                    <Link href="/" className={`flex flex-col items-center justify-center w-1/5 h-14 transition-colors duration-200 ${pathName === '/' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        <Map className="w-5 h-5 mb-0.5" />
                        <span className="text-[0.65rem]">Map view</span>
                    </Link>

                    <Link href="/sell-properties" className="flex flex-col items-center justify-center w-1/5 h-14">
                        <span className={`py-1.5 px-4 rounded-full text-sm font-semibold transition-colors duration-200 ${pathName === '/sell-properties' ? 'text-gray-900 bg-[#ffefad]' : 'text-gray-500 bg-transparent'}`}>
                            Sell
                        </span>
                    </Link>

                    <Link href="/subscribe" className={`flex flex-col items-center justify-center w-1/5 h-14 transition-colors duration-200 ${pathName === '/subscribe' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        <Image src="/crown.svg" alt="Crown" width={20} height={20} />
                        <span className="text-[0.65rem] mt-0.5">Premium</span>
                    </Link>

                    <Link href="/buy-properties" className="flex flex-col items-center justify-center w-1/5 h-14">
                        <span className={`py-1.5 px-4 rounded-full text-sm font-semibold transition-colors duration-200 ${pathName === '/buy-properties' ? 'text-gray-900 bg-[#ffefad]' : 'text-gray-500 bg-transparent'}`}>
                            Buy
                        </span>
                    </Link>

                    {currentUser ? (
                        <Link href="/dashboard" className={`flex flex-col items-center justify-center w-1/5 h-14 transition-colors duration-200 ${pathName === '/dashboard' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            <User className="w-5 h-5 mb-0.5" />
                            <span className="text-[0.65rem]">Profile</span>
                        </Link>
                    ) : (
                        <button onClick={() => setIsLoginOpen(true)} className="flex flex-col items-center justify-center w-1/5 h-14 text-gray-500">
                            <User className="w-5 h-5 mb-0.5" />
                            <span className="text-[0.65rem]">Login</span>
                        </button>
                    )}
                </div>
            </footer>

            {pathName !== '/' && (
                <footer className="hidden md:block bg-white border-t border-gray-900">
                    <div className="max-w-4xl px-12 mx-auto py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-left text-base text-gray-700">
                        <div>
                            <h4 className="font-semibold text-black mb-2">Services</h4>
                            <ul>
                                <li><Link href="/hand-holding">Hand Holding</Link></li>
                                <li><Link href="/tag-along">Tag Along</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-black mb-2">Company</h4>
                            <ul>
                                <li><Link href="/terms-and-conditions">Terms and Conditions</Link></li>
                                <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                                <li><Link href="/about-us">About Us</Link></li>
                            </ul>
                        </div>
                        <div className='ml-4'>
                            <h4 className="font-semibold text-black mb-2">Contact Us</h4>
                            <p className="mb-1">+918151915199</p>
                            <p className="mb-2">email: <Link href="mailto:hi@buildersinfo.in">hi@buildersinfo.in</Link></p>
                            <div className="flex space-x-4 mt-2">
                                <Link href="https://www.instagram.com/buildersinfo.in/"><Instagram className="w-7" alt='instagram' /></Link>
                                <Link href="https://www.youtube.com/@buildersinfo.in"><Youtube className="w-7" alt='youtube' /></Link>
                                <Link href="https://www.linkedin.com/company/buildersinfo.in/"><Linkedin className="w-7" alt='linkedin' /></Link>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#ffdd57] py-3 text-center text-sm text-black border-t border-gray-300">
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