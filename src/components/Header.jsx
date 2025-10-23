'use client';

import { useState, useEffect } from 'react';
import { Menu, ArrowRight, User } from 'lucide-react';
import MenuSideBar from '@/components/MenuSideBar';
import Image from 'next/image';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';
import { usePathname } from 'next/navigation';
import { loginUser, logoutUser } from '@/utils/auth';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const pathname = usePathname();

    useEffect(() => {
        const syncUser = () => {
            const userJson = localStorage.getItem('currentUser');
            setCurrentUser(userJson ? JSON.parse(userJson) : null);
        };

        syncUser();
        window.addEventListener('onAuthChange', syncUser);

        return () => {
            window.removeEventListener('onAuthChange', syncUser);
        };
    }, []);

    const navLinks = [
        { href: '/', label: 'Map-View', icon: <div className="bg-yellow-300 w-2 h-2 rounded-full"></div> },
        { href: '/commercial', label: 'Commercial' },
        { href: '/residential', label: 'Residential' },
        { href: '/subscribe', label: 'Builders', icon: <Image src="/crown.svg" alt="Crown" width={24} height={24} /> },
    ];

    const handleLoginSuccess = (userData) => {
        loginUser(userData);
        setIsLoginOpen(false);
    };

    return (
        <>
            <header
                className={`
                    ${pathname === '/' ? 'hidden md:block' : 'block'} 
                    bg-white shadow-sm sticky top-0 z-50 py-0 md:py-2
                `}
            >
                <div className="container mx-auto px-4 md:px-12">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/">
                                <Image src="/logo.png" width={100} height={70} className='w-24' alt="Logo" />
                            </Link>
                        </div>

                        <nav className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 pr-6 border-r border-gray-200 
                                        ${pathname === link.href ? 'text-gray-900 font-semibold' : 'text-gray-800'}
                                    `}
                                >
                                    {link.icon && link.icon}
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center md:gap-4">
                            {currentUser ? (
                                <Link
                                    href="/dashboard"
                                    className="hidden md:flex items-center gap-2 bg-[rgb(255,221,87)] text-black px-6 py-3 rounded-full font-semibold transition-colors hover:cursor-pointer"
                                >
                                    Profile
                                    <User className="w-4 h-4" />
                                </Link>
                            ) : (
                                <button
                                    onClick={() => setIsLoginOpen(true)}
                                    className="hidden md:flex items-center gap-2 bg-[rgb(255,221,87)] text-black px-6 py-3 rounded-full font-semibold transition-colors hover:cursor-pointer"
                                >
                                    Login
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                className="px-0 md:p-2 rounded-md hover:cursor-pointer"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                <Menu className="w-6 h-6 text-gray-800" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {isMenuOpen && (
                <MenuSideBar 
                    onClose={() => setIsMenuOpen(false)} 
                    onLogout={logoutUser}
                />
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