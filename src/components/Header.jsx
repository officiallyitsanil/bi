'use client';

import { useState, useEffect } from 'react';
import { Menu, User, Sun, Moon, Building, Home, Globe, Crown } from 'lucide-react';
import MenuSideBar from '@/components/MenuSideBar';
import Image from 'next/image';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';
import { usePathname } from 'next/navigation';
import { loginUser, logoutUser } from '@/utils/auth';
import { useTheme } from '@/context/ThemeContext';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const pathname = usePathname();
    const { theme, toggleTheme, isDark } = useTheme();

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
        {
            href: '/',
            label: 'Map-View',
            icon: 'circle',
        },
        {
            href: '/commercial',
            label: 'Commercial',
            icon: 'building',
        },
        {
            href: '/residential',
            label: 'Residential',
            icon: 'home',
        },
        {
            href: '/builders',
            label: 'Builders',
            icon: 'crown',
        },
    ];

    const handleLoginSuccess = (userData) => {
        loginUser(userData);
        setIsLoginOpen(false);
    };

    const getIcon = (link) => {
        const isActive = pathname === link.href;
        const iconClass = isActive
            ? 'text-blue-600'
            : isDark ? 'text-gray-400' : 'text-gray-600';
        const iconSize = 20;

        switch (link.icon) {
            case 'circle':
                return isActive ? (
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                ) : (
                    <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                );
            case 'building':
                return <Building className={`w-4 h-4 ${iconClass}`} strokeWidth={isActive ? 2 : 1.5} />;
            case 'home':
                return <Home className={`w-4 h-4 ${iconClass}`} strokeWidth={isActive ? 2 : 1.5} />;
            case 'crown':
                return <Crown className={`w-4 h-4 ${isActive ? 'text-amber-500' : isDark ? 'text-amber-500/60' : 'text-amber-500/70'}`} strokeWidth={2} />;
            default:
                return null;
        }
    };

    return (
        <>
            <header
                className={`
                    ${pathname === '/' ? 'hidden md:block' : 'block'} 
                    sticky top-0 z-50 py-1.5 transition-colors duration-300 border-b
                    ${isDark ? 'bg-[#1f2229] border-gray-800' : 'bg-white border-gray-100'}
                `}
            >
                <div className="container mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-between">
                        {/* Left: Logo + Location */}
                        <div className="flex items-center gap-2">
                            <Link href="/" className="mr-3">
                                <Image src="/logo.png" width={100} height={70} className='w-16' alt="Logo" />
                            </Link>
                            <div className="hidden md:flex items-center gap-1">
                                <Globe className={`w-3.5 h-3.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} strokeWidth={1.5} />
                                <span className={`text-xs ${isDark ? 'text-white' : 'text-black'}`}>India</span>
                            </div>
                        </div>

                        {/* Center: Navigation Tabs */}
                        <nav className="hidden md:flex items-center gap-2">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`
                                            flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all
                                            ${isActive
                                                ? isDark
                                                    ? 'bg-blue-600/20 text-blue-400'
                                                    : 'bg-blue-50 text-blue-700'
                                                : isDark
                                                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }
                                        `}
                                    >
                                        {getIcon(link)}
                                        <span className={`text-xs font-medium ${isActive ? (isDark ? 'text-blue-400' : 'text-blue-700') : ''}`}>
                                            {link.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right: Theme Toggle + Menu + Profile Pill Button */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className={`hover:cursor-pointer p-1.5 rounded-full transition-colors ${isDark
                                        ? 'hover:bg-white/10 text-yellow-400'
                                        : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDark ? (
                                    <Sun className="w-4 h-4" strokeWidth={1.5} />
                                ) : (
                                    <Moon className="w-4 h-4" strokeWidth={1.5} />
                                )}
                            </button>

                            {/* Menu + Profile Pill Button - both open right drawer, hover on whole container */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`flex items-center gap-2 px-2.5 py-1.5 border rounded-full transition-colors cursor-pointer ${isDark
                                        ? 'border-gray-600 bg-[#282c34] hover:bg-white/10'
                                        : 'border-gray-300 bg-white hover:bg-gray-100'
                                    }`}
                            >
                                <Menu className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} strokeWidth={1.5} />
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'
                                    }`}>
                                    <User className="w-3.5 h-3.5 text-blue-600" strokeWidth={2} fill="none" />
                                </div>
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
