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
    const [globalConfig, setGlobalConfig] = useState({ isFullNavVisible: false });
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

    useEffect(() => {
        fetch('/api/global-config')
            .then((res) => res.json())
            .then((data) => {
                if (data?.success && data?.config) {
                    setGlobalConfig(data.config);
                }
            })
            .catch(() => {});
    }, []);

    const allNavLinks = [
        { href: '/', label: 'Map-View', icon: 'circle', alwaysShow: true },
        { href: '/commercial', label: 'Commercial', icon: 'building', alwaysShow: false },
        { href: '/residential', label: 'Residential', icon: 'home', alwaysShow: false },
        { href: '/builders', label: 'Builders', icon: 'crown', alwaysShow: false },
    ];
    const navLinks = allNavLinks.filter(
        (link) => link.alwaysShow || globalConfig.isFullNavVisible
    );

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
                    block sticky top-0 z-50 py-1.5 transition-colors duration-300 border-b w-full
                    ${isDark ? 'bg-[#1f2229] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}
                `}
            >
                <div className="px-3 md:px-8 w-full">
                    <div className="flex items-center justify-between w-full">
                        {/* Left: Logo + Location */}
                        <div className="flex items-center gap-2">
                            <Link href="/" className="mr-2">
                                <Image 
                                    src="https://i.ibb.co/gMsT7BMs/buildersinfologo3x.png" 
                                    width={120} 
                                    height={40} 
                                    className='h-8 w-auto' 
                                    alt="Logo"
                                    unoptimized
                                />
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
                                className={`hover:cursor-pointer p-2 rounded-full transition-colors ${isDark
                                        ? 'hover:bg-white/10 text-yellow-400'
                                        : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDark ? (
                                    <Sun className="w-5 h-5" strokeWidth={1.5} />
                                ) : (
                                    <Moon className="w-5 h-5" strokeWidth={1.5} />
                                )}
                            </button>

                            {/* Menu + Profile Pill Button - both open right drawer */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`flex items-center gap-2.5 px-1.5 py-1.5 pl-3.5 border rounded-full transition-colors cursor-pointer ${isDark
                                        ? 'border-gray-700 bg-[#282c34] hover:bg-gray-700'
                                        : 'border-gray-200 bg-white hover:shadow-md'
                                    }`}
                            >
                                <Menu className={`w-4.5 h-4.5 ${isDark ? 'text-white' : 'text-gray-600'}`} strokeWidth={1.5} />
                                <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'
                                    }`}>
                                    <User className="w-4.5 h-4.5 text-blue-600" strokeWidth={2} fill="none" />
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
