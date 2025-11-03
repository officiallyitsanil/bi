"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    Bookmark,
    Share2,
    Home,
    Star,
    ThumbsUp,
    ThumbsDown,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Heart
} from "lucide-react";
import GoogleMap from "../../components/GoogleMap";
import { propertiesData } from '@/data/properties';

import "./animations.css";

// Animated Text Component
const AnimatedText = ({ children, className = "", delay = 0, lineColor = "#f8c02f" }) => {
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimationKey(prev => prev + 1);
        }, 8000); // 8 seconds total cycle (3s visible + slower wipe animations)

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`relative ${className}`}>
            <div className="overflow-hidden">
                <div
                    key={animationKey}
                    className="animate-wipe-cycle"
                    style={{
                        animationDelay: `${delay}ms`,
                        animationDuration: '8s',
                        animationIterationCount: 'infinite'
                    }}
                >
                    {children}
                </div>
            </div>
            <div className="overflow-hidden mt-1">
                <div
                    key={`line-${animationKey}`}
                    className="animate-wipe-cycle h-1"
                    style={{
                        backgroundColor: lineColor,
                        animationDelay: `${delay + 100}ms`,
                        animationDuration: '8s',
                        animationIterationCount: 'infinite'
                    }}
                />
            </div>
        </div>
    );
};

function PropertyDetailsContent() {
    const [activeTab, setActiveTab] = useState('amenities');
    const [selectedCapacity, setSelectedCapacity] = useState('6-15 Seats');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState('school');
    const [showModal, setShowModal] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [property, setProperty] = useState(null);
    const [showMoreNearby, setShowMoreNearby] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [interestFormData, setInterestFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);
    const [showSuccessTooltip, setShowSuccessTooltip] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    // Refs for scroll-to-section functionality
    const amenitiesRef = useRef(null);
    const locationRef = useRef(null);
    const reviewsRef = useRef(null);
    const layoutRef = useRef(null);

    // Scroll animation effect
    useEffect(() => {
        if (!property) return;

        // Wait for DOM to be ready
        const timer = setTimeout(() => {
            const observerOptions = {
                threshold: 0.05, // Lower threshold for better detection
                rootMargin: '50px 0px -50px 0px' // Start observing earlier
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                        const animationClass = entry.target.dataset.animation;
                        if (animationClass) {
                            // Add animation class
                            entry.target.classList.add(animationClass);
                            entry.target.classList.add('animated');
                            // Unobserve after animation is applied
                            observer.unobserve(entry.target);
                        }
                    }
                });
            }, observerOptions);

            // Get all elements with scroll-animate class
            const animatedElements = document.querySelectorAll('.scroll-animate');

            animatedElements.forEach((el, index) => {
                // Reset any previous animations
                el.classList.remove('animated');
                const animationClass = el.dataset.animation;
                if (animationClass) {
                    el.classList.remove(animationClass);
                }

                // Check if element is already in viewport
                const rect = el.getBoundingClientRect();
                const isInViewport = (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );

                if (isInViewport) {
                    // Element is already visible, animate immediately with slight delay
                    setTimeout(() => {
                        if (animationClass) {
                            el.classList.add(animationClass);
                            el.classList.add('animated');
                        }
                    }, index * 50); // Stagger animations for elements already in view
                } else {
                    // Element not in viewport, observe it
                    observer.observe(el);
                }
            });

            return () => observer.disconnect();
        }, 150); // Small delay to ensure DOM is ready

        return () => clearTimeout(timer);
    }, [property]);

    // Get property data from URL params or use first property as default
    useEffect(() => {
        const idParam = searchParams.get('id');
        const dataParam = searchParams.get('data');

        if (idParam) {
            // Find property by ID from shared data
            const foundProperty = propertiesData.find(p => p.id === idParam);
            setProperty(foundProperty || propertiesData[0]);
        } else if (dataParam) {
            try {
                const parsedData = JSON.parse(decodeURIComponent(dataParam));
                // If parsed data has an ID, try to get full data from propertiesData
                if (parsedData.id) {
                    const foundProperty = propertiesData.find(p => p.id === parsedData.id);
                    setProperty(foundProperty || parsedData);
                } else {
                    setProperty(parsedData);
                }
            } catch (error) {
                console.error('Error parsing property data:', error);
                // Use first property from shared data as fallback
                setProperty(propertiesData[0]);
            }
        } else {
            // Use first property from shared data as default
            setProperty(propertiesData[0]);
        }
    }, [searchParams]);

    // Map configuration - using property data as reference
    const mapCenter = property ? { lat: property.coordinates.lat, lng: property.coordinates.lng } : { lat: 28.6139, lng: 77.2090 };
    const mapZoom = 15;



    const tabs = [
        { id: 'amenities', label: 'Amenities' },
        { id: 'location', label: 'Location & Landmark' },
        { id: 'reviews', label: 'Rating & Reviews' },
        { id: 'layout', label: 'Property Layout' }
    ];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    };

    // Swipe handlers for mobile
    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextImage();
        }
        if (isRightSwipe) {
            prevImage();
        }

        // Reset
        setTouchStart(0);
        setTouchEnd(0);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: property.name,
                text: `Check out this property: ${property.name}`,
                url: 'http://localhost:3000'
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText('http://localhost:3000');
            alert('Link copied to clipboard!');
        }
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleMessage = () => {
        window.open('http://localhost:3000', '_blank');
    };

    const scrollToSection = (sectionId) => {
        setActiveTab(sectionId);
        const refs = {
            'amenities': amenitiesRef,
            'location': locationRef,
            'reviews': reviewsRef,
            'layout': layoutRef
        };

        if (refs[sectionId]?.current) {
            refs[sectionId].current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const openGallery = () => {
        const imagesParam = encodeURIComponent(JSON.stringify(property.images));
        const nameParam = encodeURIComponent(property.name);
        router.push(`/gallery?images=${imagesParam}&name=${nameParam}`);
    };

    // Show loading if property data is not yet loaded
    if (!property) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading property details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Layout (below md) */}
            <div className="md:hidden">
                {/* Mobile Hero Section */}
                <div
                    className="relative group"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <img
                        src={property.images[currentImageIndex]}
                        alt="Property"
                        className="w-full h-96 object-cover transition-transform duration-300"
                    />

                    {/* Image Navigation Arrows - Always visible on mobile */}
                    <button
                        onClick={prevImage}
                        className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg z-10"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextImage}
                        className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg z-10"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Action Icons */}
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <button
                            onClick={handleShare}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleLike}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors ${isLiked ? 'bg-red-500 hover:bg-red-600' : 'bg-white hover:bg-gray-100'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${isLiked ? 'text-white fill-white' : 'text-gray-700'}`} />
                        </button>
                    </div>

                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                        {property.images.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* More Images Button */}
                    <div className="absolute bottom-4 right-4 hover:cursor-pointer" onClick={openGallery}>
                        <div className="bg-gray-800/80 text-white px-4 py-2 rounded-lg text-sm hover:cursor-pointer">
                            +{property.images.length - 1} more
                        </div>
                    </div>
                </div>

                {/* Mobile Property Info */}
                <div className="w-full px-4 py-5 max-[425px]:px-3 min-[426px]:w-3/4 min-[426px]:mx-auto">
                    <h2 className="text-xl font-bold mb-2 scroll-animate" data-animation="animate-pop">{property.name}</h2>
                    <p className="text-xs text-gray-600 mb-3 scroll-animate" data-animation="animate-fade-up">{property.address}</p>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3 scroll-animate" data-animation="animate-slide-top">
                        <span className="text-base text-red-500 line-through">{property.originalPrice}</span>
                        <img
                            src="/property-details/right-arrow.png"
                            alt="Arrow"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="text-xl font-bold">{property.discountedPrice}</span>
                    </div>

                    {/* Limited Offer Badge */}
                    <div className="flex items-center gap-2 mb-5 scroll-animate" data-animation="animate-slide-top">
                        <img
                            src="/property-details/limited-offer.png"
                            alt="Limited Offer"
                            className="h-8 object-contain"
                        />
                        <span className="text-base">{property.additionalPrice}</span>
                    </div>



                    {/* Amenities */}
                    <div className="mb-5 scroll-animate" data-animation="animate-slide-top">
                        <AnimatedText className="text-base font-bold mb-3 text-red-600 inline-block" delay={500} lineColor="#f8c02f">
                            <h3>Amenities</h3>
                        </AnimatedText>
                        <div className="grid grid-cols-5 gap-2">
                            {property.amenities?.slice(0, 15).map((amenity, i) => {
                                const truncatedName = amenity.name.length > 12 ? amenity.name.substring(0, 12) + '...' : amenity.name;
                                return (
                                    <div key={i} className="text-center relative group p-2 scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                                        <div className="w-10 h-10 mx-auto mb-1.5 rounded-full bg-white shadow-md flex items-center justify-center">
                                            <img
                                                src={amenity.image}
                                                alt={amenity.name}
                                                className="w-4 h-4 object-contain"
                                            />
                                        </div>
                                        <p className="text-[0.6rem] text-gray-700 text-center">{truncatedName}</p>
                                        {amenity.name.length > 12 && (
                                            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-[99999]">
                                                {amenity.name}
                                            </div>
                                        )}
                                    </div>
                                );
                            }) || <p className="text-gray-500 col-span-5">No amenities available</p>}
                        </div>
                        {property.amenities && property.amenities.length > 15 && (
                            <div className="mt-3 text-center">
                                <button className="text-blue-600 text-sm font-medium">
                                    View All {property.amenities.length} Amenities
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Location & Landmark */}
                    <div className="mb-5 scroll-animate" data-animation="animate-slide-top">
                        <AnimatedText className="text-base font-bold mb-3 text-blue-600 inline-block" delay={1000} lineColor="#f8c02f">
                            <h3>Location & Landmark</h3>
                        </AnimatedText>

                        {/* Map */}
                        <div className="h-56 rounded-lg mb-3 overflow-hidden scroll-animate" data-animation="animate-fade-up">
                            <GoogleMap
                                center={mapCenter}
                                zoom={mapZoom}
                                markers={[
                                    {
                                        position: property.coordinates,
                                        title: property.name,
                                        useDefaultIcon: true,
                                        infoContent: `<div style="padding: 8px;"><strong>${property.name}</strong><br/>${property.address}</div>`
                                    },
                                    {
                                        position: { lat: 28.6149, lng: 77.2100 },
                                        title: 'Metro Station',
                                        color: '#10b981',
                                        icon: 'M',
                                        infoContent: '<div style="padding: 8px;"><strong>Rajiv Chowk Metro</strong><br/>0.3 km away</div>'
                                    },
                                    {
                                        position: { lat: 28.6129, lng: 77.2080 },
                                        title: 'Hospital',
                                        color: '#ef4444',
                                        icon: 'H',
                                        infoContent: '<div style="padding: 8px;"><strong>Max Hospital</strong><br/>0.5 km away</div>'
                                    }
                                ]}
                            />
                        </div>

                        {/* Category Filters */}
                        <div className="flex gap-2 mb-3 overflow-x-auto scroll-animate" data-animation="animate-fade-up">
                            {property.nearbyPlaces && Object.keys(property.nearbyPlaces).map((category) => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setActiveCategory(category);
                                        setShowMoreNearby(false);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg font-medium text-sm capitalize whitespace-nowrap cursor-pointer transition-colors hover:bg-blue-600 hover:text-white ${activeCategory === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white border border-gray-300 text-gray-700'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Places List */}
                        <div className="space-y-1 mb-3 scroll-animate" data-animation="animate-fade-up">
                            {property.nearbyPlaces && property.nearbyPlaces[activeCategory] ?
                                property.nearbyPlaces[activeCategory].slice(0, showMoreNearby ? 6 : 4).map((place, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b">
                                        <div>
                                            <h4 className="font-medium text-sm text-gray-900">{place.name}</h4>
                                            <p className="text-xs text-gray-500">{place.location}</p>
                                        </div>
                                        <span className="text-xs text-gray-500">{place.distance}</span>
                                    </div>
                                ))
                                : <p className="text-gray-500 text-xs">No nearby places available</p>
                            }
                        </div>

                        {/* View More Button */}
                        {property.nearbyPlaces && property.nearbyPlaces[activeCategory] && property.nearbyPlaces[activeCategory].length > 4 && (
                            <button
                                onClick={() => setShowMoreNearby(!showMoreNearby)}
                                className="w-28 bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm cursor-pointer transition-colors hover:bg-blue-700"
                            >
                                {showMoreNearby ? 'View Less' : 'View More'}
                            </button>
                        )}
                    </div>

                    {/* Rating & Reviews */}
                    <div className="mb-5 scroll-animate" data-animation="animate-slide-top">
                        <div className="flex items-center justify-between mb-3">
                            <AnimatedText className="text-base font-bold inline-block" delay={1500} lineColor="#f8c02f">
                                <h3>Rating & Reviews</h3>
                            </AnimatedText>
                            <button
                                onClick={() => setShowReviewsModal(true)}
                                className="text-blue-600 font-medium text-xs hover:underline cursor-pointer"
                            >
                                View All
                            </button>
                        </div>

                        {/* Stars and Rating */}
                        <div className="flex items-center gap-2 mb-3 scroll-animate" data-animation="animate-fade-up">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${star <= (property.ratings?.overall || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="font-medium text-sm">
                                {property.ratings?.overall || 'N/A'} – {property.ratings?.totalRatings || 0} Rating
                            </span>
                        </div>

                        {/* Rating Bars */}
                        <div className="space-y-1.5 mb-5 scroll-animate" data-animation="animate-fade-up">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-2">
                                    <span className="text-xs font-medium w-10">{star} Star</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className="bg-yellow-400 h-1.5 rounded-full"
                                            style={{
                                                width: `${property.ratings?.breakdown && property.ratings?.totalRatings ?
                                                    (property.ratings.breakdown[star] / property.ratings.totalRatings) * 100 : 0}%`
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium w-5">{property.ratings?.breakdown?.[star] || 0}</span>
                                </div>
                            ))}
                        </div>

                        {/* What's Good */}
                        <div className="mb-3 scroll-animate" data-animation="animate-fade-up">
                            <div className="flex items-center gap-2 mb-2">
                                <ThumbsUp className="w-4 h-4 text-blue-500" />
                                <h4 className="font-medium text-sm">What&apos;s good</h4>
                            </div>
                            <div className="flex flex-col flex-wrap gap-3">
                                {property.ratings?.whatsGood?.map((item, i) => (
                                    <span
                                        key={i}
                                        onClick={() => {
                                            setReviewText(item);
                                            setShowRatingModal(true);
                                        }}
                                        className="px-4 py-2 max-w-44 bg-gray-100 text-gray-700 rounded-full text-xs cursor-pointer hover:bg-gray-200 transition-colors"
                                    >
                                        {item}
                                    </span>
                                )) || <span className="text-gray-500 text-xs">No reviews available</span>}
                            </div>
                        </div>

                        {/* What's Bad */}
                        <div className="mb-5 scroll-animate" data-animation="animate-fade-up">
                            <div className="flex items-center gap-2 mb-2">
                                <ThumbsDown className="w-4 h-4 text-blue-500" />
                                <h4 className="font-medium text-sm">What&apos;s Bad</h4>
                            </div>
                            <div className="flex flex-col flex-wrap gap-3">
                                {property.ratings?.whatsBad?.map((item, i) => (
                                    <span
                                        key={i}
                                        onClick={() => {
                                            setReviewText(item);
                                            setShowRatingModal(true);
                                        }}
                                        className="px-4 py-2 max-w-44 bg-red-100 text-red-700 rounded-full text-xs cursor-pointer hover:bg-red-200 transition-colors"
                                    >
                                        {item}
                                    </span>
                                )) || <span className="text-gray-500 text-xs">No negative reviews</span>}
                            </div>
                        </div>
                    </div>

                    {/* Properties Nearby */}
                    <div className="mb-16 scroll-animate" data-animation="animate-slide-top">
                        <h3 className="text-base font-bold mb-3 text-center scroll-animate" data-animation="animate-pop">Properties Nearby</h3>
                        <div className="w-6 h-0.5 bg-red-500 mx-auto mb-4"></div>

                        <div className="grid grid-cols-2 gap-2.5">
                            {/* Property Cards */}
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                                <div key={item} className="relative overflow-hidden rounded-lg scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: `${item * 100}ms` }}>
                                    <img
                                        src={property.images[0]}
                                        alt="Property"
                                        className="w-full h-28 object-cover rounded-lg transition-transform duration-300 hover:scale-110"
                                    />
                                    <div className="absolute top-1.5 right-1.5 w-7 h-7 bg-white rounded-full flex items-center justify-center border border-blue-500">
                                        <span className="text-blue-500 text-xs font-bold">Ne</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1.5 rounded-b-lg">
                                        <p className="text-xs text-center">Statesman house</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Fixed Bottom Action Bar */}
                <div className="fixed left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-30" style={{ bottom: '60px' }}>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.open(`https://wa.me/${property.sellerPhoneNumber?.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in ${property.name}`, '_blank')}
                            className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-600 cursor-pointer transition-colors"
                        >
                            <img
                                src="/property-details/whatsapp.png"
                                alt="WhatsApp"
                                className="w-5 h-5 object-contain"
                            />
                            Whatsapp
                        </button>
                        <button
                            onClick={() => window.location.href = `tel:${property.sellerPhoneNumber}`}
                            className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-600 cursor-pointer transition-colors"
                        >
                            <img
                                src="/property-details/call-icon.png"
                                alt="Call"
                                className="w-5 h-5 object-contain"
                            />
                            Request for call
                        </button>
                    </div>
                </div>

                {/* Floating Chat Icon */}
                <div className="fixed right-4 z-40 md:hidden" style={{ bottom: '140px' }}>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
                    >
                        <MessageCircle className="w-6 h-6" />
                    </button>
                </div>

                {/* Mobile Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 md:hidden">
                        <div className="bg-white rounded-2xl w-full max-w-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-blue-600">Interested in this Property</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="text-gray-600 text-sm mb-6">Fill your details for a customized quote</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        defaultValue="Ytefhn Jin"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        defaultValue="ggffdtyul@gmail.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        defaultValue="+91 1234567890"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Messages</label>
                                    <textarea
                                        defaultValue="Thank you for sharing home and helping to create incredible experiences for our guests."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        alert('Form submitted successfully!');
                                        setShowModal(false);
                                    }}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews Modal */}
                {showReviewsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                                <h3 className="text-xl font-bold">All Ratings & Reviews</h3>
                                <button
                                    onClick={() => setShowReviewsModal(false)}
                                    className="text-gray-400 hover:text-gray-900 text-2xl w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="overflow-y-auto p-5 flex-1">
                                {property.reviews && property.reviews.length > 0 ? (
                                    <div className="space-y-5">
                                        {property.reviews.map((review, index) => (
                                            <div key={index} className="border-b pb-5 last:border-b-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900">{review.user}</span>
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-gray-500">{review.date}</span>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-10">No reviews available</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Rating Submit Modal */}
                {showRatingModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-md p-8">
                            {/* Title with underline */}
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Rate Your Experience</h3>
                                <div className="w-32 h-1 bg-yellow-400 mx-auto"></div>
                            </div>

                            {/* Rating Section */}
                            <div className="mb-6">
                                <label className="block text-base font-medium text-gray-700 mb-3">Rating</label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            onClick={() => setSelectedRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className={`w-12 h-12 cursor-pointer transition-all ${star <= (hoverRating || selectedRating)
                                                ? 'text-gray-400 fill-gray-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Review Text Area */}
                            <div className="mb-6">
                                <label className="block text-base font-medium text-gray-700 mb-3">Review (optional)</label>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Share your experience..."
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowRatingModal(false);
                                        setSelectedRating(0);
                                        setReviewText('');
                                    }}
                                    className="flex-1 bg-transparent border-2 border-[#f8c02f] text-gray-800 py-3 rounded-lg font-semibold text-base hover:bg-[#f8c02f]/10 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        alert(`Rating submitted: ${selectedRating} stars\nReview: ${reviewText}`);
                                        setShowRatingModal(false);
                                        setSelectedRating(0);
                                        setReviewText('');
                                    }}
                                    className="flex-1 bg-[#f8c02f] text-gray-800 py-3 rounded-lg font-semibold text-base hover:bg-[#e0ad2a] transition-colors cursor-pointer"
                                >
                                    Submit Rating
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Layout (md and above) */}
            <div className="hidden md:block">
                {/* Main Content */}
                <div className="w-full px-12 py-6">
                    <div className="mb-6 scroll-animate" data-animation="animate-pop">
                        <AnimatedText className="text-lg font-bold inline-block" lineColor="#f8c02f">
                            <h1>Showing Spaces in Delhi</h1>
                        </AnimatedText>
                    </div>

                    {/* Image Gallery - Full Width */}
                    <div className="relative mb-6 scroll-animate" data-animation="animate-slide-top">
                        <div className="flex gap-3">
                            {/* Main Image */}
                            <div className="flex-1 relative group h-80 overflow-hidden rounded-xl">
                                <img
                                    src={property.images[currentImageIndex]}
                                    alt="Property"
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                />
                                <button
                                    onClick={prevImage}
                                    className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>

                                {/* Top Right Actions */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    <button
                                        onClick={handleShare}
                                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleLike}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors ${isLiked ? 'bg-red-500 hover:bg-red-600' : 'bg-white hover:bg-gray-100'
                                            }`}
                                    >
                                        <Heart className={`w-4 h-4 ${isLiked ? 'text-white fill-white' : 'text-gray-700'}`} />
                                    </button>
                                    <button
                                        onClick={handleMessage}
                                        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Bottom Right Counter */}
                                <div className="absolute bottom-4 right-4 cursor-pointer">
                                    <button
                                        onClick={openGallery}
                                        className="bg-black/30 backdrop-blur-sm text-white rounded-xl border-2 border-white/80 w-16 h-16 flex flex-col items-center justify-center hover:bg-black/40 transition-all duration-200 shadow-lg cursor-pointer"
                                    >
                                        <span className="text-lg font-bold leading-none cursor-pointer">+{property.images.length - 1}</span>
                                        <span className="text-sm font-medium leading-none mt-0.5 cursor-pointer">More</span>
                                    </button>
                                </div>

                                {/* Dots */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                                    {property.images.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-2 h-2 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Thumbnail Grid - 2x2 */}
                            <div className="w-80 grid grid-cols-2 gap-2">
                                <div className="aspect-square overflow-hidden rounded-xl cursor-pointer scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: '100ms' }}>
                                    <img
                                        src={property.images[1] || property.images[0]}
                                        alt="Thumbnail 1"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        onClick={() => setCurrentImageIndex(1)}
                                    />
                                </div>
                                <div className="aspect-square overflow-hidden rounded-xl cursor-pointer scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: '200ms' }}>
                                    <img
                                        src={property.images[2] || property.images[0]}
                                        alt="Thumbnail 2"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        onClick={() => setCurrentImageIndex(2)}
                                    />
                                </div>
                                <div className="aspect-square overflow-hidden rounded-xl cursor-pointer scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: '300ms' }}>
                                    <img
                                        src={property.images[3] || property.images[0]}
                                        alt="Thumbnail 3"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        onClick={() => setCurrentImageIndex(3)}
                                    />
                                </div>
                                <div className="aspect-square overflow-hidden rounded-xl cursor-pointer scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: '400ms' }}>
                                    <img
                                        src={property.images[4] || property.images[0]}
                                        alt="Thumbnail 4"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        onClick={() => setCurrentImageIndex(4)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Layout - Grid with sidebar for Property Info and Amenities only */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Property Info */}
                            <div className="bg-white rounded-2xl p-5 scroll-animate" data-animation="animate-slide-top">
                                <h2 className="text-xl font-bold mb-2 scroll-animate" data-animation="animate-pop">{property.name}</h2>
                                <p className="text-sm text-gray-600 mb-3 scroll-animate" data-animation="animate-fade-up">{property.address}</p>

                                {/* Price */}
                                <div className="flex items-center gap-3 mb-5 scroll-animate" data-animation="animate-fade-up">
                                    <span className="text-lg text-red-500 line-through">{property.originalPrice}</span>
                                    <img
                                        src="/property-details/right-arrow.png"
                                        alt="Arrow"
                                        className="w-8 h-8 object-contain"
                                    />
                                    <span className="text-xl font-bold">{property.discountedPrice}</span>
                                    <img
                                        src="/property-details/limited-offer.png"
                                        alt="Limited Offer"
                                        className="h-8 object-contain"
                                    />
                                    <span className="text-lg">{property.additionalPrice}</span>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 mb-5 scroll-animate" data-animation="animate-fade-up">
                                    <button
                                        onClick={() => window.open(`https://wa.me/${property.sellerPhoneNumber?.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in ${property.name}`, '_blank')}
                                        className="flex-1 border-2 border-green-500 text-green-500 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-green-50 cursor-pointer transition-colors"
                                    >
                                        <img
                                            src="/property-details/whatsapp.png"
                                            alt="WhatsApp"
                                            className="w-4 h-4 object-contain"
                                        />
                                        WhatsApp
                                    </button>
                                    <button
                                        onClick={() => window.location.href = `tel:${property.sellerPhoneNumber}`}
                                        className="flex-1 bg-green-500 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-green-600 cursor-pointer transition-colors"
                                    >
                                        <img
                                            src="/property-details/call-icon.png"
                                            alt="Call"
                                            className="w-4 h-4 object-contain"
                                        />
                                        Request for call
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="border-b mb-5">
                                    <div className="flex">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => scrollToSection(tab.id)}
                                                className={`px-3 py-2.5 font-medium text-xs border-b-2 ${activeTab === tab.id
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-600'
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Amenities Section - Only this section has sidebar */}
                                <div ref={amenitiesRef} className="mb-10">
                                    <AnimatedText className="text-lg font-bold mb-3 inline-block" delay={500} lineColor="#f8c02f">
                                        <h3>Amenities</h3>
                                    </AnimatedText>
                                    <div className="grid grid-cols-6 gap-3 mt-5">
                                        {property.amenities?.map((amenity, i) => {
                                            const truncatedName = amenity.name.length > 15 ? amenity.name.substring(0, 15) + '...' : amenity.name;
                                            return (
                                                <div key={i} className="text-center relative group p-3 scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                                                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white shadow-md flex items-center justify-center">
                                                        <img
                                                            src={amenity.image}
                                                            alt={amenity.name}
                                                            className="w-5 h-5 object-contain"
                                                        />
                                                    </div>
                                                    <p className="text-[0.6rem] text-gray-700">{truncatedName}</p>
                                                    {amenity.name.length > 15 && (
                                                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-[99999]">
                                                            {amenity.name}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }) || <p className="text-gray-500 col-span-6">No amenities available</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Only for Property Info and Amenities */}
                        <div className="space-y-5">
                            {/* Interested in this Property Form */}
                            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-5 shadow-sm scroll-animate" data-animation="animate-slide-top">
                                <h3 className="text-lg font-bold text-blue-600 mb-2">Interested in this Property</h3>
                                <p className="text-gray-600 text-xs mb-5">Fill your details for a customized quote</p>

                                <form className="space-y-3" onSubmit={async (e) => {
                                    e.preventDefault();
                                    setIsSubmittingInterest(true);

                                    try {
                                        const response = await fetch('/api/property-interest', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                                propertyName: property?.name,
                                                ...interestFormData,
                                            }),
                                        });

                                        const data = await response.json();

                                        if (data.success) {
                                            setInterestFormData({
                                                name: "",
                                                email: "",
                                                phone: "",
                                                message: "",
                                            });
                                            setShowSuccessTooltip(true);
                                            setTimeout(() => setShowSuccessTooltip(false), 5000);
                                        } else {
                                            alert('Failed to submit. Please try again.');
                                        }
                                    } catch (error) {
                                        console.error('Error submitting interest:', error);
                                        alert('An error occurred. Please try again.');
                                    } finally {
                                        setIsSubmittingInterest(false);
                                    }
                                }}>
                                    <input
                                        type="text"
                                        placeholder="Name *"
                                        required
                                        value={interestFormData.name}
                                        onChange={(e) => setInterestFormData({ ...interestFormData, name: e.target.value })}
                                        className="w-full px-3 py-2.5 border-0 rounded-lg bg-white shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email Address *"
                                        required
                                        value={interestFormData.email}
                                        onChange={(e) => setInterestFormData({ ...interestFormData, email: e.target.value })}
                                        className="w-full px-3 py-2.5 border-0 rounded-lg bg-white shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number *"
                                        required
                                        value={interestFormData.phone}
                                        onChange={(e) => setInterestFormData({ ...interestFormData, phone: e.target.value })}
                                        className="w-full px-3 py-2.5 border-0 rounded-lg bg-white shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                    />
                                    <textarea
                                        placeholder="Messages"
                                        rows={3}
                                        value={interestFormData.message}
                                        onChange={(e) => setInterestFormData({ ...interestFormData, message: e.target.value })}
                                        className="w-full px-3 py-2.5 border-0 rounded-lg bg-white shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmittingInterest}
                                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmittingInterest ? "Submitting..." : "Submit"}
                                    </button>

                                    {showSuccessTooltip && (
                                        <div className="bg-green-500 text-white px-4 py-3 rounded-lg text-center text-xs font-medium">
                                            Submission successful! We will contact you soon.
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Trusted Companies */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm scroll-animate" data-animation="animate-fade-up">
                                <h3 className="text-base font-bold text-gray-800 mb-3">Trusted Companies</h3>
                            </div>
                        </div>
                    </div>

                    {/* Full Width Sections - Location, Reviews, Layout, and Info */}
                    <div className="mt-6 space-y-6">

                        {/* Location & Landmark Section - Full Width */}
                        <div ref={locationRef} className="bg-white rounded-2xl p-5 mb-6 scroll-animate" data-animation="animate-slide-top">
                            <AnimatedText className="text-lg font-bold mb-3 inline-block" delay={1000} lineColor="#f8c02f">
                                <h3>Location & Landmark</h3>
                            </AnimatedText>

                            {/* Interactive Map */}
                            <div className="h-80 rounded-lg mb-5 mt-5 overflow-hidden scroll-animate" data-animation="animate-fade-up">
                                <GoogleMap
                                    center={mapCenter}
                                    zoom={mapZoom}
                                    markers={[
                                        {
                                            position: property.coordinates,
                                            title: property.name,
                                            useDefaultIcon: true,
                                            infoContent: `<div style="padding: 10px;"><strong>${property.name}</strong><br/>${property.address}<br/><span style="color: #ef4444; font-weight: bold;">Property Location</span></div>`
                                        },
                                        {
                                            position: { lat: 28.6149, lng: 77.2100 },
                                            title: 'Rajiv Chowk Metro Station',
                                            color: '#10b981',
                                            icon: 'M',
                                            infoContent: '<div style="padding: 10px;"><strong>Rajiv Chowk Metro</strong><br/>Blue & Yellow Line<br/>0.3 km away</div>'
                                        },
                                        {
                                            position: { lat: 28.6129, lng: 77.2080 },
                                            title: 'Max Hospital',
                                            color: '#ef4444',
                                            icon: 'H',
                                            infoContent: '<div style="padding: 10px;"><strong>Max Hospital</strong><br/>Multi-specialty Hospital<br/>0.5 km away</div>'
                                        },
                                        {
                                            position: { lat: 28.6159, lng: 77.2070 },
                                            title: 'DPS School',
                                            color: '#3b82f6',
                                            icon: 'S',
                                            infoContent: '<div style="padding: 10px;"><strong>Delhi Public School</strong><br/>Premium Education<br/>0.4 km away</div>'
                                        },
                                        {
                                            position: { lat: 28.6119, lng: 77.2110 },
                                            title: 'Shopping Mall',
                                            color: '#f59e0b',
                                            icon: '🛍',
                                            infoContent: '<div style="padding: 10px;"><strong>Connaught Place</strong><br/>Shopping & Dining<br/>0.2 km away</div>'
                                        }
                                    ]}
                                />
                            </div>

                            {/* Category Tabs */}
                            <div className="flex gap-2 mb-5 scroll-animate" data-animation="animate-fade-up">
                                {property.nearbyPlaces && Object.keys(property.nearbyPlaces).map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => {
                                            setActiveCategory(category);
                                            setShowMoreNearby(false);
                                        }}
                                        className={`px-4 py-1.5 rounded-lg font-medium text-sm capitalize hover:bg-blue-600 hover:text-white hover:cursor-pointer ${activeCategory === category
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white border border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>

                            {/* Places List */}
                            <div className="space-y-1 scroll-animate" data-animation="animate-fade-up">
                                {property.nearbyPlaces && property.nearbyPlaces[activeCategory] ?
                                    property.nearbyPlaces[activeCategory].slice(0, showMoreNearby ? 6 : 4).map((place, i) => (
                                        <div key={i} className="flex items-center justify-between py-2.5 border-b">
                                            <div>
                                                <h4 className="font-medium text-sm text-gray-900">{place.name}</h4>
                                                <p className="text-xs text-gray-500">{place.location}</p>
                                            </div>
                                            <span className="text-xs text-gray-500">{place.distance}</span>
                                        </div>
                                    ))
                                    : <p className="text-gray-500">No nearby places available</p>
                                }
                            </div>

                            {/* View More Button */}
                            {property.nearbyPlaces && property.nearbyPlaces[activeCategory] && property.nearbyPlaces[activeCategory].length > 4 && (
                                <button
                                    onClick={() => setShowMoreNearby(!showMoreNearby)}
                                    className="w-28 mt-3 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-medium text-sm hover:cursor-pointer transition-colors hover:bg-blue-600 hover:text-white"
                                >
                                    {showMoreNearby ? 'View Less' : 'View More'}
                                </button>
                            )}
                        </div>

                        {/* Rating & Reviews Section - Full Width */}
                        <div ref={reviewsRef} className="bg-white rounded-2xl p-5 mb- scroll-animate" data-animation="animate-slide-top6">
                            <div className="flex items-center justify-between mb-5">
                                <AnimatedText className="text-lg font-bold inline-block" delay={1500} lineColor="#f8c02f">
                                    <h3>Rating & Reviews</h3>
                                </AnimatedText>
                                <button
                                    onClick={() => setShowReviewsModal(true)}
                                    className="text-blue-600 font-medium text-xs hover:underline cursor-pointer"
                                >
                                    View All
                                </button>
                            </div>

                            {/* Stars and Rating */}
                            <div className="flex items-center gap-2 mb-5 scroll-animate" data-animation="animate-fade-up">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-5 h-5 ${star <= (property.ratings?.overall || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-base font-bold">
                                    {property.ratings?.overall || 'N/A'} – {property.ratings?.totalRatings || 0} Ratings
                                </span>
                            </div>

                            {/* Rating Bars */}
                            <div className="space-y-1.5 mb-6 scroll-animate" data-animation="animate-fade-up">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <div key={star} className="flex items-center gap-3">
                                        <span className="text-xs font-medium w-14">{star} Star</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-yellow-400 h-1.5 rounded-full"
                                                style={{
                                                    width: `${property.ratings?.breakdown && property.ratings?.totalRatings ?
                                                        (property.ratings.breakdown[star] / property.ratings.totalRatings) * 100 : 0}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium w-6">{property.ratings?.breakdown?.[star] || 0}</span>
                                    </div>
                                ))}
                            </div>

                            {/* What's Good */}
                            <div className="mb-5 scroll-animate" data-animation="animate-fade-up">
                                <div className="flex items-center gap-2 mb-2">
                                    <ThumbsUp className="w-4 h-4 text-yellow-500" />
                                    <h4 className="font-medium text-sm">What&apos;s Good</h4>
                                </div>
                                <div className="flex flex-col flex-wrap gap-3">
                                    {property.ratings?.whatsGood?.map((item, i) => (
                                        <span
                                            key={i}
                                            onClick={() => {
                                                setReviewText(item);
                                                setShowRatingModal(true);
                                            }}
                                            className="px-4 py-2 max-w-44 bg-gray-100 text-gray-700 rounded-full text-xs cursor-pointer hover:bg-gray-200 transition-colors"
                                        >
                                            {item}
                                        </span>
                                    )) || <span className="text-gray-500 text-xs">No reviews available</span>}
                                </div>
                            </div>

                            {/* What's Bad */}
                            <div className="scroll-animate" data-animation="animate-fade-up">
                                <div className="flex items-center gap-2 mb-2">
                                    <ThumbsDown className="w-4 h-4 text-red-500" />
                                    <h4 className="font-medium text-sm">What&apos;s Bad</h4>
                                </div>
                                <div className="flex flex-col flex-wrap gap-3">
                                    {property.ratings?.whatsBad?.map((item, i) => (
                                        <span
                                            key={i}
                                            onClick={() => {
                                                setReviewText(item);
                                                setShowRatingModal(true);
                                            }}
                                            className="px-4 py-2 max-w-44 bg-red-100 text-red-700 rounded-full text-xs cursor-pointer hover:bg-red-200 transition-colors"
                                        >
                                            {item}
                                        </span>
                                    )) || <span className="text-gray-500 text-xs">No negative reviews</span>}
                                </div>
                            </div>

                            {/* Property Layout Section - Full Width */}
                            <div ref={layoutRef} className="bg-white mt-6 rounded-2xl p-5 mb-6 scroll-animate" data-animation="animate-slide-top">
                                <div className="flex items-center justify-between mb-5">
                                    <AnimatedText className="text-lg font-bold inline-block" delay={2000} lineColor="#f8c02f">
                                        <h3>Property Layout</h3>
                                    </AnimatedText>
                                </div>

                                <div className="flex my-3 gap-2 justify-center scroll-animate" data-animation="animate-fade-up">
                                    {['6-15 Seats', '16-30 Seats', '31-60 Seats'].map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => setSelectedCapacity(option)}
                                            className={`px-6 py-3 rounded-full text-xs font-medium cursor-pointer transition-colors ${selectedCapacity === option
                                                ? 'bg-black text-white'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>

                                {/* Floor Plans */}
                                <div className="grid grid-cols-2 gap-3 mt-12 scroll-animate" data-animation="animate-fade-up">
                                    {property.floorPlans && property.floorPlans[selectedCapacity] ? (
                                        property.floorPlans[selectedCapacity].map((floorPlan, index) => (
                                            <div key={index} className="overflow-hidden rounded-lg">
                                                <img
                                                    src={floorPlan}
                                                    alt={`Floor Plan ${index + 1}`}
                                                    className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-110 cursor-pointer"
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div className="overflow-hidden rounded-lg">
                                                <img
                                                    src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600"
                                                    alt="Floor Plan 1"
                                                    className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-110 cursor-pointer"
                                                />
                                            </div>
                                            <div className="overflow-hidden rounded-lg">
                                                <img
                                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"
                                                    alt="Floor Plan 2"
                                                    className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-110 cursor-pointer"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>


                        </div>

                    </div>
                </div>

                {/* Promotional Banner Section - Full Width */}
                <div className="mt-6 md:mt-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg md:rounded-3xl p-3 md:p-6 scroll-animate" data-animation="animate-slide-top">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 items-center">
                            {/* Left Side - Content */}
                            <div className="space-y-2 md:space-y-6">
                                {/* House Icon */}
                                <div className="flex justify-center lg:justify-start scroll-animate" data-animation="animate-pop">
                                    <div className="w-8 h-8 md:w-14 md:h-14 border-2 md:border-4 border-blue-600 rounded-lg flex items-center justify-center">
                                        <Home className="w-4 h-4 md:w-7 md:h-7 text-blue-600" />
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="text-center lg:text-left">
                                    <h2 className="text-sm md:text-3xl font-bold text-blue-900 mb-2 md:mb-5 leading-tight scroll-animate" data-animation="animate-pop">
                                        Brokerage – Free Real Estate at Your Fingertips
                                    </h2>

                                    <p className="text-xs md:text-lg text-blue-800 leading-relaxed mb-3 md:mb-6 scroll-animate" data-animation="animate-fade-up">
                                        Find your dream home faster with our app—less searching, more living. Download now!
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center lg:justify-start scroll-animate" data-animation="animate-fade-up">
                                        <button
                                            onClick={() => window.open('https://apps.apple.com', '_blank')}
                                            className="flex items-center gap-1.5 md:gap-2.5 bg-black text-white px-3 py-1.5 md:px-6 md:py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-lg cursor-pointer"
                                        >
                                            <div className="w-4 h-4 md:w-7 md:h-7 bg-white rounded flex items-center justify-center">
                                                <span className="text-black font-bold text-xs md:text-sm">🍎</span>
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs">Download on the</div>
                                                <div className="font-bold text-xs md:text-base">App Store</div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => window.open('https://play.google.com', '_blank')}
                                            className="flex items-center gap-1.5 md:gap-2.5 bg-black text-white px-3 py-1.5 md:px-6 md:py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-lg cursor-pointer"
                                        >
                                            <div className="w-4 h-4 md:w-7 md:h-7 bg-white rounded flex items-center justify-center">
                                                <span className="text-black font-bold text-xs md:text-sm">▶</span>
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs">GET IT ON</div>
                                                <div className="font-bold text-xs md:text-base">Google Play</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Phone Image */}
                            <div className="hidden lg:flex justify-center lg:justify-end scroll-animate" data-animation="animate-slide-top">
                                <div className="relative overflow-hidden rounded-3xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=600&fit=crop&crop=center"
                                        alt="Hand holding smartphone with real estate app"
                                        className="w-72 h-[540px] object-cover rounded-3xl shadow-2xl transition-transform duration-300 hover:scale-105 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Modal - Desktop */}
                {showReviewsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                                <h3 className="text-2xl font-bold">All Ratings & Reviews</h3>
                                <button
                                    onClick={() => setShowReviewsModal(false)}
                                    className="text-gray-400 hover:text-gray-900 text-2xl w-10 h-10 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="overflow-y-auto p-6 flex-1">
                                {property.reviews && property.reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {property.reviews.map((review, index) => (
                                            <div key={index} className="border-b pb-6 last:border-b-0">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold text-gray-900 text-base">{review.user}</span>
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-gray-500">{review.date}</span>
                                                </div>
                                                <p className="text-gray-700 text-base leading-relaxed">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-10">No reviews available</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Rating Submit Modal - Desktop */}
                {showRatingModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-md p-8">
                            {/* Title with underline */}
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Rate Your Experience</h3>
                                <div className="w-32 h-1 bg-yellow-400 mx-auto"></div>
                            </div>

                            {/* Rating Section */}
                            <div className="mb-6">
                                <label className="block text-base font-medium text-gray-700 mb-3">Rating</label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            onClick={() => setSelectedRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className={`w-12 h-12 cursor-pointer transition-all ${star <= (hoverRating || selectedRating)
                                                ? 'text-gray-400 fill-gray-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Review Text Area */}
                            <div className="mb-6">
                                <label className="block text-base font-medium text-gray-700 mb-3">Review (optional)</label>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Share your experience..."
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowRatingModal(false);
                                        setSelectedRating(0);
                                        setReviewText('');
                                    }}
                                    className="flex-1 bg-transparent border-2 border-[#f8c02f] text-gray-800 py-3 rounded-lg font-semibold text-base hover:bg-[#f8c02f]/10 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        alert(`Rating submitted: ${selectedRating} stars\nReview: ${reviewText}`);
                                        setShowRatingModal(false);
                                        setSelectedRating(0);
                                        setReviewText('');
                                    }}
                                    className="flex-1 bg-[#f8c02f] text-gray-800 py-3 rounded-lg font-semibold text-base hover:bg-[#e0ad2a] transition-colors cursor-pointer"
                                >
                                    Submit Rating
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PropertyDetailsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading property details...</p>
                </div>
            </div>
        }>
            <PropertyDetailsContent />
        </Suspense>
    );
}