"use client";

import { useState, use, useEffect } from "react";
import { Home, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryPage({ searchParams }) {
    // Get images from URL params or use default
    const defaultImages = [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
        'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
    ];

    const params = use(searchParams);
    const images = params?.images ? JSON.parse(decodeURIComponent(params.images)) : defaultImages;
    const propertyName = params?.name || 'Property Gallery';

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Navigation functions
    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Keyboard navigation
    useEffect(() => {
        if (!isModalOpen) return;

        const handleKeyPress = (e) => {
            if (e.key === 'ArrowRight') {
                setCurrentImageIndex((prev) => (prev + 1) % images.length);
            }
            if (e.key === 'ArrowLeft') {
                setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
            }
            if (e.key === 'Escape') {
                setIsModalOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isModalOpen, images.length]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Layout */}
            <div className="md:hidden">
                <div className="px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold mb-1 inline-block">{propertyName}</h1>
                        <div className="h-1 mb-0" style={{ backgroundColor: '#f8c02f', width: '100%', maxWidth: '80px' }}></div>
                        <p className="text-sm text-gray-600 mt-2">{images.length} {images.length === 1 ? 'image' : 'images'}</p>
                    </div>

                    {/* Main Image with Navigation */}
                    <div className="relative mb-4">
                        <div
                            className="relative h-80 overflow-hidden rounded-xl cursor-pointer group"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <img
                                src={images[currentImageIndex]}
                                alt={`Property image ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium transition-opacity duration-300">
                                    View Full Screen
                                </span>
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prevImage();
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg z-10"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg z-10"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {currentImageIndex + 1} / {images.length}
                        </div>
                    </div>

                    {/* All Images Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className={`aspect-square overflow-hidden rounded-lg cursor-pointer border-2 transition-all ${
                                    index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                                }`}
                                onClick={() => setCurrentImageIndex(index)}
                            >
                                <img
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-1 inline-block">{propertyName}</h1>
                    <div className="h-1 mb-0" style={{ backgroundColor: '#f8c02f', width: '100%', maxWidth: '80px' }}></div>
                    <p className="text-sm text-gray-600 mt-2">{images.length} {images.length === 1 ? 'image' : 'images'}</p>
                </div>

                {/* Main Image with Navigation */}
                <div className="relative mb-8">
                    <div className="flex gap-4">
                        {/* Main Image */}
                        <div
                            className="flex-1 relative h-96 overflow-hidden rounded-xl cursor-pointer group"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <img
                                src={images[currentImageIndex]}
                                alt={`Property image ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium transition-opacity duration-300">
                                    View Full Screen
                                </span>
                            </div>

                            {/* Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            prevImage();
                                        }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            nextImage();
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            {/* Image Counter */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        </div>

                        {/* Thumbnail Grid - Show first 4 or all if less than 4 */}
                        <div className="w-80 grid grid-cols-2 gap-2">
                            {images.slice(1, 5).map((image, index) => (
                                <div
                                    key={index + 1}
                                    className={`aspect-square overflow-hidden rounded-xl cursor-pointer border-2 transition-all ${
                                        index + 1 === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                                    }`}
                                    onClick={() => setCurrentImageIndex(index + 1)}
                                >
                                    <img
                                        src={image}
                                        alt={`Thumbnail ${index + 2}`}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* All Images Grid - Desktop */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">All Images ({images.length})</h2>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className={`aspect-square overflow-hidden rounded-lg cursor-pointer border-2 transition-all ${
                                    index === currentImageIndex ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent hover:border-gray-300'
                                }`}
                                onClick={() => setCurrentImageIndex(index)}
                            >
                                <img
                                    src={image}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Full Screen Image Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
                    {/* Close Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsModalOpen(false);
                        }}
                        className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all duration-200 z-10"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* Previous Button */}
                    {images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                prevImage();
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 z-10"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}

                    {/* Next Button */}
                    {images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                nextImage();
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 z-10"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}

                    {/* Image Counter */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                        {currentImageIndex + 1} / {images.length}
                    </div>

                    {/* Image Container */}
                    <div
                        className="relative w-full h-full flex items-center justify-center"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <img
                            src={images[currentImageIndex]}
                            alt={`Full screen property image ${currentImageIndex + 1}`}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* App Download Banner Section */}
            <div className="mt-16 bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Left Side - Content */}
                        <div className="space-y-8">
                            {/* House Icon */}
                            <div className="flex justify-center lg:justify-start">
                                <div className="w-16 h-16 border-4 border-blue-600 rounded-lg flex items-center justify-center">
                                    <Home className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="text-center lg:text-left">
                                <h2 className="text-4xl font-bold text-blue-900 mb-6 leading-tight">
                                    Brokerage – Free Real Estate at Your Fingertips
                                </h2>

                                <p className="text-xl text-blue-800 leading-relaxed mb-8">
                                    Find your dream home faster with our app—less searching, more living. Download now!
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <button className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors shadow-lg">
                                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                                            <span className="text-black font-bold text-sm">🍎</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm">Download on the</div>
                                            <div className="font-bold text-lg">App Store</div>
                                        </div>
                                    </button>

                                    <button className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors shadow-lg">
                                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                                            <span className="text-black font-bold text-sm">▶</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm">GET IT ON</div>
                                            <div className="font-bold text-lg">Google Play</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Phone Image */}
                        <div className="flex justify-center lg:justify-end">
                            <div className="relative overflow-hidden rounded-3xl">
                                <img
                                    src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=600&fit=crop&crop=center"
                                    alt="Hand holding smartphone with real estate app"
                                    className="w-80 h-[600px] object-cover rounded-3xl shadow-2xl transition-transform duration-300 hover:scale-105 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}