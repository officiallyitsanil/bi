'use client';

import { useState, useEffect } from 'react';
import { Menu, User, Sun, Building, Home, Globe } from 'lucide-react';
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
        { 
            href: '/', 
            label: 'Map-View', 
            icon: 'circle',
            activeBg: 'bg-blue-50',
            activeText: 'text-blue-700',
            inactiveText: 'text-gray-600'
        },
        { 
            href: '/commercial', 
            label: 'Commercial',
            icon: 'building',
            activeBg: 'bg-blue-50',
            activeText: 'text-blue-700',
            inactiveText: 'text-gray-600'
        },
        { 
            href: '/residential', 
            label: 'Residential',
            icon: 'home',
            activeBg: 'bg-blue-50',
            activeText: 'text-blue-700',
            inactiveText: 'text-gray-600'
        },
        { 
            href: '/builders', 
            label: 'Builders',
            icon: 'crown',
            activeBg: 'bg-blue-50',
            activeText: 'text-blue-700',
            inactiveText: 'text-gray-600'
        },
    ];

    const handleLoginSuccess = (userData) => {
        loginUser(userData);
        setIsLoginOpen(false);
    };

    const getIcon = (link) => {
        const isActive = pathname === link.href;
        const iconClass = isActive ? link.activeText : link.inactiveText;
        const iconSize = 20;

        switch (link.icon) {
            case 'circle':
                return isActive ? (
                    <div className="w-4 h-4 rounded-full bg-blue-700"></div>
                ) : (
                    <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                );
            case 'building':
                return <Building className={`w-5 h-5 ${iconClass}`} strokeWidth={isActive ? 2 : 1.5} />;
            case 'home':
                return <Home className={`w-5 h-5 ${iconClass}`} strokeWidth={isActive ? 2 : 1.5} />;
            case 'crown':
                return <Image src="/crown.svg" alt="Crown" width={iconSize} height={iconSize} className={isActive ? 'opacity-100' : 'opacity-60'} />;
            default:
                return null;
        }
    };

    return (
        <>
            <header
                className={`
                    ${pathname === '/' ? 'hidden md:block' : 'block'} 
                    bg-white sticky top-0 z-50 py-4
                `}
            >
                <div className="container mx-auto px-4 md:px-12">
                    <div className="flex items-center justify-between">
                        {/* Left: Logo + Location */}
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Image src="/logo.png" width={100} height={70} className='w-24' alt="Logo" />
                            </Link>
                            <div className="hidden md:flex items-center gap-1.5">
                                <Globe className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
                                <span className="text-sm text-black">India</span>
                            </div>
                        </div>

                        {/* Center: Navigation Tabs */}
                        <nav className="hidden md:flex items-center gap-4">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-full transition-all
                                            ${isActive 
                                                ? `${link.activeBg} ${link.activeText}` 
                                                : link.inactiveText
                                            }
                                        `}
                                    >
                                        {getIcon(link)}
                                        <span className={`text-sm font-medium ${isActive ? link.activeText : link.inactiveText}`}>
                                            {link.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right: Sun Icon + Menu + Profile Pill Button */}
                        <div className="flex items-center gap-3">
                            {/* Sun Icon (Light/Dark Mode) */}
                            <button className="hover:cursor-pointer">
                                <Sun className="w-6 h-6 text-black" strokeWidth={1.5} />
                            </button>
                            
                            {/* Menu + Profile Pill Button */}
                            <div className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-full bg-white">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="hover:cursor-pointer"
                                >
                                    <Menu className="w-5 h-5 text-black" strokeWidth={1.5} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (currentUser) {
                                            window.location.href = '/dashboard';
                                        } else {
                                            setIsLoginOpen(true);
                                        }
                                    }}
                                    className="hover:cursor-pointer flex items-center justify-center"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600" strokeWidth={2} fill="none" />
                                    </div>
                                </button>
                            </div>
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