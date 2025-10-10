'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/utils/auth'; 

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('uploaded');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error("Could not parse user from localStorage", error);
            router.push('/');
        }
    }, [router]);

    const handleSignOut = () => {
        logoutUser(); 
        router.push('/');
    };

    if (!user) {
        return null;
    }

    return (
        <main className="container max-w-5xl mx-auto mt-8 mb-20 px-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                    <span className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-200">
                        <span className="flex h-16 w-16 items-center justify-center rounded-xl border bg-gray-200">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" aria-hidden="true" className="text-gray-800" height="38" width="38" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd"></path></svg>
                        </span>
                    </span>
                    <div className="flex min-w-20 flex-col gap-2">
                        <p className="my-0 text-base font-semibold leading-none text-gray-800">
                            {user.phoneNumber || 'Loading...'}
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <button 
                        type="button" 
                        className="rounded-lg border-none p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis-vertical">
                            <circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
                        </svg>
                    </button>
                    {isMenuOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-8">
                <div className="w-full">
                    <div className="inline-flex h-auto w-full max-w-[600px] items-center justify-center rounded-lg border border-gray-300 bg-white p-1 outline-none">
                        <button 
                            onClick={() => setActiveTab('uploaded')}
                            type="button"
                            className={`inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm sm:text-base font-medium transition-all
                                ${activeTab === 'uploaded' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <span>Uploaded</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line>
                            </svg>
                        </button>
                        <button 
                            onClick={() => setActiveTab('shortlisted')}
                            type="button"
                            className={`inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm sm:text-base font-medium transition-all
                                ${activeTab === 'shortlisted' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <span>Shortlisted</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
                            </svg>
                        </button>
                    </div>
                    <div className="mt-6">
                        {activeTab === 'uploaded' && (
                            <div className="my-4 rounded-lg bg-gray-100 p-4 lg:flex lg:items-center lg:justify-between">
                                <div className="px-2 pt-2 lg:py-2">
                                    <p className="text-gray-600">You have not uploaded any properties yet.</p>
                                    <div className="mt-4 mb-3 text-lg font-semibold text-gray-800">Benefits Of Listing</div>
                                    <ul className="list-inside list-disc text-sm font-normal text-gray-800 space-y-1">
                                        <li>List unlimited lands for FREE!</li>
                                        <li>Get a FREE Preliminary Verification tag!</li>
                                        <li>Get direct calls from users</li>
                                    </ul>
                                </div>
                                <div className="p-2 mt-4 lg:mt-0">
                                    <a className="flex w-fit items-center justify-center gap-2 rounded-lg border border-gray-400 bg-white px-4 py-2 text-base font-normal text-gray-800 hover:bg-gray-50" target="_blank" href="https://wa.me/+918151915199/?text=Hi Buildersinfo - I want to sell my land" rel="noopener noreferrer">
                                        <span className="text-base font-medium text-gray-800">Add Land</span>
                                        <svg stroke="currentColor" fill="#4CAF50" strokeWidth="0" viewBox="0 0 24 24" height="22" width="22" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12.001 2C17.5238 2 22.001 6.47715 22.001 12C22.001 17.5228 17.5238 22 12.001 22C10.1671 22 8.44851 21.5064 6.97086 20.6447L2.00516 22L3.35712 17.0315C2.49494 15.5536 2.00098 13.8345 2.00098 12C2.00098 6.47715 6.47813 2 12.001 2ZM8.59339 7.30019L8.39232 7.30833C8.26293 7.31742 8.13607 7.34902 8.02057 7.40811C7.93392 7.45244 7.85348 7.51651 7.72709 7.63586C7.60774 7.74855 7.53857 7.84697 7.46569 7.94186C7.09599 8.4232 6.89729 9.01405 6.90098 9.62098C6.90299 10.1116 7.03043 10.5884 7.23169 11.0336C7.63982 11.9364 8.31288 12.8908 9.20194 13.7759C9.4155 13.9885 9.62473 14.2034 9.85034 14.402C10.9538 15.3736 12.2688 16.0742 13.6907 16.4482C13.6907 16.4482 14.2507 16.5342 14.2589 16.5347C14.4444 16.5447 14.6296 16.5313 14.8153 16.5218C15.1066 16.5068 15.391 16.428 15.6484 16.2909C15.8139 16.2028 15.8922 16.159 16.0311 16.0714C16.0311 16.0714 16.0737 16.0426 16.1559 15.9814C16.2909 15.8808 16.3743 15.81 16.4866 15.6934C16.5694 15.6074 16.6406 15.5058 16.6956 15.3913C16.7738 15.2281 16.8525 14.9166 16.8838 14.6579C16.9077 14.4603 16.9005 14.3523 16.8979 14.2854C16.8936 14.1778 16.8047 14.0671 16.7073 14.0201L16.1258 13.7587C16.1258 13.7587 15.2563 13.3803 14.7245 13.1377C14.6691 13.1124 14.6085 13.1007 14.5476 13.097C14.4142 13.0888 14.2647 13.1236 14.1696 13.2238C14.1646 13.2218 14.0984 13.279 13.3749 14.1555C13.335 14.2032 13.2415 14.3069 13.0798 14.2972C13.0554 14.2955 13.0311 14.292 13.0074 14.2858C12.9419 14.2685 12.8781 14.2457 12.8157 14.2193C12.692 14.1668 12.6486 14.1469 12.5641 14.1105C11.9868 13.8583 11.457 13.5209 10.9887 13.108C10.8631 12.9974 10.7463 12.8783 10.6259 12.7616C10.2057 12.3543 9.86169 11.9211 9.60577 11.4938C9.5918 11.4705 9.57027 11.4368 9.54708 11.3991C9.50521 11.331 9.45903 11.25 9.44455 11.1944C9.40738 11.0473 9.50599 10.9291 9.50599 10.9291C9.50599 10.9291 9.74939 10.663 9.86248 10.5183C9.97128 10.379 10.0652 10.2428 10.125 10.1457C10.2428 9.95633 10.2801 9.76062 10.2182 9.60963C9.93764 8.92565 9.64818 8.24536 9.34986 7.56894C9.29098 7.43545 9.11585 7.33846 8.95659 7.32007C8.90265 7.31384 8.84875 7.30758 8.79459 7.30402C8.66053 7.29748 8.5262 7.29892 8.39232 7.30833L8.59339 7.30019Z"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        )}
                        {activeTab === 'shortlisted' && (
                            <div className="text-center p-10 rounded-lg bg-gray-100">
                                <p className="text-gray-600">You have no shortlisted properties.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};