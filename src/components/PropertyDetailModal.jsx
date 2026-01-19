"use client";

import { useState, useEffect } from "react";
import { loginUser } from "@/utils/auth";
import { mapAmenitiesToObjects } from "@/utils/amenityMapping";
import { useTheme } from "@/context/ThemeContext";

// Helper function to safely display database values
const safeDisplay = (value, fallback = "-") => {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }
    // Handle arrays and objects
    if (Array.isArray(value) && value.length === 0) {
        return fallback;
    }
    if (typeof value === "object" && Object.keys(value).length === 0) {
        return fallback;
    }
    return value;
};
import {
    BadgeCheck,
    MapPin,
    X,
    Heart,
    Share2,
    CornerUpRight,
    SquareArrowOutUpRight,
    TriangleAlert,
    ChevronLeft,
    ChevronRight,
    Star,
    ThumbsUp,
    ThumbsDown,
    Check,
    Edit,
    Trash2,
    Building2
} from "lucide-react";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import LoginModal from "./LoginModal";



export default function PropertyDetailModal({ property, onClose, isPropertyListVisible = false }) {
    const { isDark } = useTheme();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportFormData, setReportFormData] = useState({
        reporterName: "",
        reporterEmail: "",
        reporterPhone: "",
        reason: "",
        details: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [userName, setUserName] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
    const [hasUserSubmittedReview, setHasUserSubmittedReview] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [isEditingReview, setIsEditingReview] = useState(false);

    // Initialize current user from localStorage
    useEffect(() => {
        const syncUser = () => {
            try {
                const userJson = localStorage.getItem('currentUser');
                if (userJson) {
                    const user = JSON.parse(userJson);
                    setCurrentUser(user);
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Failed to parse user data from localStorage:", error);
                setCurrentUser(null);
            }
        };

        syncUser();
        window.addEventListener('onAuthChange', syncUser);

        return () => {
            window.removeEventListener('onAuthChange', syncUser);
        };
    }, []);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            try {
                const propertyId = property._id || property.id;
                
                // Check localStorage first
                const favourites = JSON.parse(localStorage.getItem('favorites') || '[]');
                const isFavoritedLocal = favourites.some(fav => (fav._id || fav.id) === propertyId);
                
                if (isFavoritedLocal) {
                    setIsFavourite(true);
                }

                // If user is logged in, sync with database
                if (currentUser && currentUser.phoneNumber) {
                    try {
                        const response = await fetch(`/api/favorites?userPhoneNumber=${encodeURIComponent(currentUser.phoneNumber)}`);
                        const data = await response.json();
                        
                        if (data.success) {
                            const isFavoritedDB = data.data.some(fav => fav.propertyId === propertyId);
                            setIsFavourite(isFavoritedDB);
                            
                            // Sync localStorage with DB
                            if (isFavoritedDB && !isFavoritedLocal) {
                                const updatedFavorites = [...favourites, { _id: propertyId, id: propertyId }];
                                localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                            } else if (!isFavoritedDB && isFavoritedLocal) {
                                const updatedFavorites = favourites.filter(fav => (fav._id || fav.id) !== propertyId);
                                localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                            }
                        }
                    } catch (error) {
                        console.error('Error checking favorite status:', error);
                    }
                }
            } catch (error) {
                console.error("Failed to check favorite status:", error);
            }
        };

        checkFavoriteStatus();
    }, [property._id, property.id, currentUser]);

    if (!property) return null;

    // Helper function to normalize phone numbers for comparison
    const normalizePhone = (phone) => {
        if (!phone) return '';
        // Remove all non-digit characters except leading +
        let normalized = phone.toString().trim();
        // Remove spaces, dashes, parentheses
        normalized = normalized.replace(/[\s\-\(\)]/g, '');
        // Ensure consistent format - remove + if present, we'll compare digits only
        normalized = normalized.replace(/^\+/, '');
        return normalized;
    };

    // Helper function to check if a review belongs to current user
    // Uses phoneNumber as primary field (matching dashboard pattern)
    const isReviewByCurrentUser = (review) => {
        if (!review) return false;
        
        // Always get the latest user data from localStorage
        let latestUser = currentUser;
        try {
            const userJson = localStorage.getItem('currentUser');
            if (userJson) {
                latestUser = JSON.parse(userJson);
            }
        } catch (e) {
            console.error('Error reading user from localStorage in isReviewByCurrentUser:', e);
        }
        
        if (!latestUser) return false;
        
        // Get user phone number - try multiple possible field names and formats
        const userPhone = latestUser?.phoneNumber || 
                         latestUser?.phone || 
                         latestUser?.userPhoneNumber || 
                         (latestUser?.user && latestUser.user.phoneNumber) ||
                         null;
        
        const reviewPhone = review.userPhoneNumber || review.userPhone || review.phoneNumber || review.phone;
        
        if (!userPhone || !reviewPhone) return false;
        
        const normalizedUserPhone = normalizePhone(userPhone);
        const normalizedReviewPhone = normalizePhone(reviewPhone);
        
        return normalizedUserPhone === normalizedReviewPhone;
    };

    // Helper function to check if user has submitted a review
    const checkUserReview = (propertyToCheck = null) => {
        const propToCheck = propertyToCheck || property;
        
        // Always get the latest user data from localStorage to ensure we have the phone number
        let latestUser = currentUser;
        try {
            const userJson = localStorage.getItem('currentUser');
            if (userJson) {
                latestUser = JSON.parse(userJson);
            }
        } catch (e) {
            console.error('Error reading user from localStorage in checkUserReview:', e);
        }
        
        if (!propToCheck || !propToCheck.reviews || !Array.isArray(propToCheck.reviews) || !latestUser) {
            setHasUserSubmittedReview(false);
            setUserReview(null);
            return;
        }

        // Get user phone number - try multiple possible field names and formats
        const userPhone = latestUser?.phoneNumber || 
                         latestUser?.phone || 
                         latestUser?.userPhoneNumber || 
                         (latestUser?.user && latestUser.user.phoneNumber) ||
                         null;
        
        if (!userPhone) {
            setHasUserSubmittedReview(false);
            setUserReview(null);
            return;
        }
        
        const normalizedUserPhone = normalizePhone(userPhone);

        // Check reviews - handle different possible field names in review schema
        const userReviewFound = propToCheck.reviews.find(review => {
            const reviewPhone = review.userPhoneNumber || review.userPhone || review.phoneNumber || review.phone;
            if (!reviewPhone) return false;
            const normalizedReviewPhone = normalizePhone(reviewPhone);
            return normalizedReviewPhone === normalizedUserPhone;
        });

        if (userReviewFound) {
            setHasUserSubmittedReview(true);
            setUserReview(userReviewFound);
        } else {
            setHasUserSubmittedReview(false);
            setUserReview(null);
        }
    };

    // Check if user has submitted a review for this property
    useEffect(() => {
        if (property && property.reviews && Array.isArray(property.reviews)) {
            checkUserReview();
        }
    }, [property, property?.reviews?.length, currentUser?.phoneNumber]);

    const handleLoginSuccess = (userData) => {
        // Ensure phone number is properly extracted from Firebase user object
        // Firebase user object has phoneNumber property directly
        const userWithPhone = {
            ...userData,
            phoneNumber: userData.phoneNumber || userData.phone || userData.userPhoneNumber || null
        };
        
        loginUser(userWithPhone);
        setCurrentUser(userWithPhone);
        setIsLoginModalOpen(false);
        setIsContactModalOpen(false);
    };

    const handleAddReview = () => {
        // Check if user is logged in
        if (!currentUser) {
            setIsLoginModalOpen(true);
            return;
        }
        setIsEditingReview(false);
        setSelectedRating(0);
        setReviewText('');
        setUserName('');
        setShowRatingModal(true);
    };

    const handleEditReview = (reviewToEdit = null) => {
        const review = reviewToEdit || userReview;
        if (!review) return;
        setUserReview(review);
        setIsEditingReview(true);
        setSelectedRating(review.rating || 0);
        setReviewText(review.comment || '');
        setUserName(review.user || '');
        setShowRatingModal(true);
    };

    const handleDeleteReview = async (reviewToDelete = null) => {
        const review = reviewToDelete || userReview;
        if (!review) return;
        
        if (!confirm('Are you sure you want to delete your review?')) {
            return;
        }

        try {
            const propertyId = property._id || property.id;
            const propertyType = property.propertyType || 'commercial';
            const reviewId = review._id || review.id;
            
            // Always get the latest user data from localStorage to ensure we have the phone number
            let latestUser = currentUser;
            try {
                const userJson = localStorage.getItem('currentUser');
                if (userJson) {
                    latestUser = JSON.parse(userJson);
                }
            } catch (e) {
                console.error('Error reading user from localStorage:', e);
            }
            
            // Get phone number - try multiple possible field names and formats
            let userPhoneNumber = latestUser?.phoneNumber || 
                                 latestUser?.phone || 
                                 latestUser?.userPhoneNumber || 
                                 (latestUser?.user && latestUser.user.phoneNumber) ||
                                 null;

            // If phone number has + prefix, keep it; otherwise ensure it's properly formatted
            if (userPhoneNumber && typeof userPhoneNumber === 'string') {
                userPhoneNumber = userPhoneNumber.trim();
            }

            if (!userPhoneNumber || !latestUser) {
                alert('Unable to get your phone number from session. Please make sure you are logged in.');
                return;
            }

            const response = await fetch(`/api/reviews?propertyId=${propertyId}&propertyType=${propertyType}&reviewId=${reviewId}&userPhoneNumber=${encodeURIComponent(userPhoneNumber)}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setHasUserSubmittedReview(false);
                setUserReview(null);
                
                // Refresh property data to update the review list
                try {
                    const propResponse = await fetch(`/api/properties?id=${propertyId}&type=${propertyType}`);
                    const propData = await propResponse.json();
                    
                    if (propData.success && propData.property) {
                        // Update the property object with fresh data
                        property.reviews = propData.property.reviews || [];
                        property.ratings = propData.property.ratings || property.ratings;
                        
                        // Re-check if user has review (should be false now)
                        checkUserReview(propData.property);
                    }
                } catch (error) {
                    console.error('Error refreshing property data:', error);
                    // Don't reload - just update state
                }
                // Don't show alert - deletion is complete
            } else {
                alert(data.message || 'Failed to delete review. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleFavouriteToggle = async () => {
        // Check if user is logged in
        if (!currentUser) {
            setIsLoginModalOpen(true);
            return;
        }

        const propertyId = property._id || property.id;
        const propertyType = property.propertyType || 'commercial';
        const newFavoriteState = !isFavourite;

        // Optimistically update UI
        setIsFavourite(newFavoriteState);

        // Update localStorage
        try {
            const favourites = JSON.parse(localStorage.getItem('favorites') || '[]');
            if (newFavoriteState) {
                // Add to favourites
                const exists = favourites.some(fav => (fav._id || fav.id) === propertyId);
                if (!exists) {
                    favourites.push({ _id: propertyId, id: propertyId });
                    localStorage.setItem('favorites', JSON.stringify(favourites));
                }
            } else {
                // Remove from favourites
                const updatedFavourites = favourites.filter(fav => (fav._id || fav.id) !== propertyId);
                localStorage.setItem('favorites', JSON.stringify(updatedFavourites));
            }
        } catch (error) {
            console.error("Failed to update favourites:", error);
        }

        // Sync with database
        if (currentUser.phoneNumber) {
            try {
                const response = await fetch('/api/favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userPhoneNumber: currentUser.phoneNumber,
                        propertyId: propertyId,
                        propertyType: propertyType,
                        action: newFavoriteState ? 'add' : 'remove',
                    }),
                });

                const data = await response.json();

                if (!data.success) {
                    // Revert UI if API call failed
                    setIsFavourite(!newFavoriteState);
                    alert('Failed to update favorite. Please try again.');
                }
            } catch (error) {
                console.error('Error updating favorite:', error);
                // Revert UI if API call failed
                setIsFavourite(!newFavoriteState);
                alert('Failed to update favorite. Please try again.');
            }
        }
    };

    const handleShare = async () => {
        // Check if user is logged in
        if (!currentUser) {
            setIsLoginModalOpen(true);
            return;
        }

        const shareData = {
            title: `${safeDisplay(name)} in ${safeDisplay(location_district)}`,
            text: `Check out this property: ${safeDisplay(name)} at ${safeDisplay(discountedPrice)} in ${safeDisplay(layer_location)}, ${safeDisplay(location_district)}`,
            url: `${window.location.origin}/property-details?id=${property.id}`
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(shareData.url);
                alert('Property link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    // Calculate prices based on property type
    const calculatePrices = (property) => {
        let originalPriceValue = 0;
        
        if (property.propertyType === 'residential') {
            // For residential: use expectedRent
            const expectedRent = property.expectedRent || '0';
            originalPriceValue = parseFloat(expectedRent.toString().replace(/[₹,]/g, '')) || 0;
        } else if (property.propertyType === 'commercial') {
            // For commercial: calculate from floorConfigurations
            if (property.floorConfigurations && property.floorConfigurations.length > 0) {
                const firstFloor = property.floorConfigurations[0];
                if (firstFloor.dedicatedCabin && firstFloor.dedicatedCabin.seats && firstFloor.dedicatedCabin.pricePerSeat) {
                    // Extract lower values from ranges like "70 - 90" and "6000-8000"
                    const seatsStr = firstFloor.dedicatedCabin.seats.toString();
                    const pricePerSeatStr = firstFloor.dedicatedCabin.pricePerSeat.toString();
                    
                    const seatsMatch = seatsStr.match(/(\d+)/);
                    const pricePerSeatMatch = pricePerSeatStr.match(/(\d+)/);
                    
                    if (seatsMatch && pricePerSeatMatch) {
                        const seatsLower = parseFloat(seatsMatch[1]);
                        const pricePerSeatLower = parseFloat(pricePerSeatMatch[1]);
                        originalPriceValue = seatsLower * pricePerSeatLower;
                    }
                }
            }
        }
        
        // Calculate discounted price (5% off = 95% of original)
        const discountedPriceValue = originalPriceValue * 0.95;
        
        // Format prices
        const formatPrice = (price) => {
            if (price === 0) return '₹XX';
            return `₹${Math.round(price).toLocaleString('en-IN')}`;
        };
        
        return {
            originalPrice: formatPrice(originalPriceValue),
            discountedPrice: formatPrice(discountedPriceValue)
        };
    };

    const prices = calculatePrices(property);

    const {
        name,
        location_district,
        images = [],
        date_added,
        is_verified = false,
        sellerPhoneNumber,
        layer_location,
        createdBy,
        amenities = [],
        ratings = {},
        reviews = [],
        floorPlans = {},
        propertyType
    } = property;

    const originalPrice = prices.originalPrice;
    const discountedPrice = prices.discountedPrice;

    // Map amenities (handles both string arrays and object arrays)
    const mappedAmenities = mapAmenitiesToObjects(amenities);
    const displayedAmenities = mappedAmenities.slice(0, 8);
    const displayedReviews = reviews.slice(0, 3);
    const whatsGood = ratings?.whatsGood || [];
    const whatsBad = ratings?.whatsBad || [];
    const floorPlanCategories = Object.keys(floorPlans);

    // Dummy data for missing fields
    const brandName = property.brandName || "BHIVE Workspace";
    const brandStats = property.brandStats || {
        cities: "2+ Cities",
        clients: "1000+ Clients",
        spaces: "27+ Coworking Spaces",
        seats: "8000+ Seats"
    };
    const brandDescription = property.brandDescription || "BHIVE Workspace, established in 2014, specializes in providing Zero CapEx, Enterprise Grade, Customized...";
    const rating = property.ratings?.overall || 4.8;
    const isTopRated = property.isTopRated !== undefined ? property.isTopRated : true;

    // Mobile view (< md breakpoint)
    const mobileModal = (
        <div
            role="dialog"
            className="md:hidden fixed inset-0 z-50 flex items-end"
            tabIndex="-1"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
            
            {/* Modal Content */}
            <div className={`relative pb-32 w-full rounded-t-3xl overflow-hidden transition-colors ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`} style={{ maxHeight: '90vh' }}>
                {/* Drag Handle */}
                <div className="flex justify-center py-3">
                    <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                    {/* Image Carousel */}
                    <div className={`relative mx-4 rounded-2xl overflow-hidden h-48 ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                        {/* Action Icons - Top Left */}
                        <div className="absolute top-3 left-3 z-20 flex gap-2">
                            <button
                                onClick={handleFavouriteToggle}
                                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md ${isDark ? 'bg-[#282c34]/95' : 'bg-white/95'}`}
                            >
                                <Heart className={`w-5 h-5 ${isFavourite ? 'fill-red-500 text-red-500' : isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                            </button>
                            <button
                                onClick={handleShare}
                                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md ${isDark ? 'bg-[#282c34]/95' : 'bg-white/95'}`}
                            >
                                <Share2 className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                            </button>
                        </div>

                        {/* Close Button - Top Right */}
                        <button 
                            aria-label="Close" 
                            className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-md ${isDark ? 'bg-[#282c34]/95' : 'bg-white/95'}`}
                            onClick={onClose}
                        >
                            <X className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                        </button>

                        <Swiper
                            modules={[Navigation]}
                            navigation={{
                                prevEl: ".mobile-prop-prev",
                                nextEl: ".mobile-prop-next",
                            }}
                            spaceBetween={0}
                            slidesPerView={1}
                            loop={true}
                            className="h-full"
                        >
                            {images.length > 0 ? images.map((img, i) => (
                                <SwiperSlide key={i}>
                                    <Image 
                                        alt="Property" 
                                        width={400} 
                                        height={200}
                                        className="h-full w-full object-cover" 
                                        src={img} 
                                        unoptimized 
                                    />
                                </SwiperSlide>
                            )) : (
                                <SwiperSlide>
                                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-400">No Image</span>
                                    </div>
                                </SwiperSlide>
                            )}
                        </Swiper>
                        
                        {/* Navigation Arrows */}
                        <button className={`mobile-prop-prev absolute top-1/2 -translate-y-1/2 left-2 h-8 w-8 rounded-full flex items-center justify-center z-10 shadow ${isDark ? 'bg-[#282c34]/90' : 'bg-white/90'}`}>
                            <ChevronLeft className={`h-5 w-5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`} />
                        </button>
                        <button className={`mobile-prop-next absolute top-1/2 -translate-y-1/2 right-2 h-8 w-8 rounded-full flex items-center justify-center z-10 shadow ${isDark ? 'bg-[#282c34]/90' : 'bg-white/90'}`}>
                            <ChevronRight className={`h-5 w-5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`} />
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                            {images.slice(0, 5).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-white/80"></div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-4 pt-4 pb-6">
                        {/* Title & Rating */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 pr-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{safeDisplay(name)}</h1>
                                    {is_verified && (
                                        <BadgeCheck className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        in{safeDisplay(layer_location)}{location_district ? `, ${safeDisplay(location_district)}` : ''}
                                    </span>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                                <Star className="w-4 h-4 fill-green-500 text-green-500" />
                                <span className={`text-sm font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{rating.toFixed(1)}</span>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${isDark ? 'bg-[#282c34] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                <Building2 className="w-3.5 h-3.5" />
                                {propertyType === 'commercial' ? 'Commercial' : 'Residential'}
                            </span>
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${isDark ? 'bg-[#282c34] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                {safeDisplay(property.carpetArea, '5000')} sq.ft
                            </span>
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${isDark ? 'bg-[#282c34] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                <Check className="w-3.5 h-3.5" />
                                {safeDisplay(property.furnishing, 'Furnished')}
                            </span>
                        </div>

                        {/* Amenities */}
                        <div className="grid grid-cols-4 gap-4 mb-5">
                            {(displayedAmenities.length > 0 ? displayedAmenities.slice(0, 4) : [
                                { name: "Guest Check-in", image: null },
                                { name: "Delivery Acceptance", image: null },
                                { name: "Package Notification", image: null },
                                { name: "Fire Safety", image: null }
                            ]).map((amenity, index) => (
                                <div key={index} className="flex flex-col items-center gap-2">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                                        {amenity.image ? (
                                            <Image src={amenity.image} alt={amenity.name} width={28} height={28} className="object-contain" unoptimized />
                                        ) : (
                                            <span className="text-2xl">
                                                {index === 0 ? '👤' : index === 1 ? '📦' : index === 2 ? '🔔' : '🔥'}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-[10px] text-center leading-tight ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{amenity.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* Info Boxes */}
                        <div className="grid grid-cols-3 gap-3 mb-5">
                            <div className={`border rounded-xl py-3 px-2 text-center ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <p className={`text-[11px] mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Price</p>
                                <p className="text-base font-bold text-blue-600">₹120</p>
                                <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/sq.ft</p>
                            </div>
                            <div className={`border rounded-xl py-3 px-2 text-center ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <p className={`text-[11px] mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Status</p>
                                <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Available</p>
                            </div>
                            <div className={`border rounded-xl py-3 px-2 text-center ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <p className={`text-[11px] mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Reviews</p>
                                <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{reviews.length || 120}</p>
                            </div>
                        </div>

                        {/* Brand + Contact */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{brandName}</h4>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Workspace</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={`tel:${safeDisplay(sellerPhoneNumber)}`}
                                    className={`w-11 h-11 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}
                                >
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </a>
                                <a
                                    href={`https://wa.me/${safeDisplay(sellerPhoneNumber)?.replace(/[^0-9]/g, '') || '918151915199'}?text=Hi, I am interested in ${encodeURIComponent(name || 'this property')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-11 h-11 rounded-full flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}
                                >
                                    <Image src="/whatsapp.svg" alt="WhatsApp" width={24} height={24} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Button */}
                <div className={`p-4 pb-20 mt-5 border-t transition-colors ${isDark ? 'bg-[#1f2229] border-gray-700' : 'bg-white border-gray-100'}`}>
                    <a
                        href={`/property-details?id=${property._id || property.id}&type=${propertyType}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-blue-600 text-white py-4 rounded-xl text-center font-semibold text-base"
                    >
                        View Full Details
                    </a>
                </div>
            </div>
        </div>
    );

    // Desktop view (>= md breakpoint)
    const desktopModal = (
        <div
            role="dialog"
            className={`hidden md:block fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 shadow-2xl rounded-2xl overflow-hidden transition-colors ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`}
            style={{ width: '750px', maxWidth: '95vw', height: '450px' }}
            tabIndex="-1"
        >
            <div className="flex h-full relative">
                {/* Left Section - Image Carousel */}
                <div className={`w-[350px] relative flex-shrink-0 ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                    <div className="relative h-full">
                        {/* Top RATED Badge */}
                        {isTopRated && (
                            <div className="absolute top-3 right-3 z-20 bg-red-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                                <span className="text-[10px] font-bold">TOP RATED</span>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3].map((i) => (
                                        <Star key={i} className="w-2.5 h-2.5 fill-white text-white" />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Action Icons - Top Left */}
                        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                            <button
                                onClick={handleFavouriteToggle}
                                className={`w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-md ${isDark ? 'bg-[#282c34]/80 hover:bg-[#282c34]' : 'bg-white/80 hover:bg-white'}`}
                            >
                                <Heart className={`w-3.5 h-3.5 ${isFavourite ? 'fill-red-500 text-red-500' : isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                            </button>
                            <button
                                onClick={handleShare}
                                className={`w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-md ${isDark ? 'bg-[#282c34]/80 hover:bg-[#282c34]' : 'bg-white/80 hover:bg-white'}`}
                            >
                                <Share2 className={`w-3.5 h-3.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                            </button>
                            <a
                                href={`https://maps.google.com/maps?q=${property.coordinates?.lat || property.position?.lat},${property.coordinates?.lng || property.position?.lng}&z=16&t=h`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-md ${isDark ? 'bg-[#282c34]/80 hover:bg-[#282c34]' : 'bg-white/80 hover:bg-white'}`}
                            >
                                <CornerUpRight className={`w-3.5 h-3.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                            </a>
                            <a
                                href={`/property-details?id=${property._id || property.id}&type=${propertyType}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-md ${isDark ? 'bg-[#282c34]/80 hover:bg-[#282c34]' : 'bg-white/80 hover:bg-white'}`}
                            >
                                <SquareArrowOutUpRight className={`w-3.5 h-3.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                            </a>
                        </div>

                        {/* Close Button - Top Right */}
                        <button 
                            aria-label="Close" 
                            className={`absolute top-3 right-12 z-20 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-md ${isDark ? 'bg-[#282c34]/80 hover:bg-[#282c34]' : 'bg-white/80 hover:bg-white'}`}
                            onClick={onClose}
                        >
                            <X className={`w-3.5 h-3.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                        </button>

                        {/* Image Carousel */}
                        <div className="relative h-full">
                            <Swiper
                                modules={[Navigation]}
                                navigation={{
                                    prevEl: ".prop-prev",
                                    nextEl: ".prop-next",
                                }}
                                spaceBetween={0}
                                slidesPerView={1}
                                loop={true}
                                className="h-full"
                            >
                                {images.length > 0 ? images.map((img, i) => (
                                    <SwiperSlide key={i}>
                                        <div className="relative h-full w-full">
                                            <Image 
                                                alt="Property image" 
                                                width={350} 
                                                height={450}
                                                className="h-full w-full object-cover" 
                                                loading="lazy" 
                                                src={img} 
                                                unoptimized 
                                            />
                                        </div>
                                    </SwiperSlide>
                                )) : (
                                    <SwiperSlide>
                                        <div className={`relative h-full w-full flex items-center justify-center ${isDark ? 'bg-[#282c34]' : 'bg-gray-200'}`}>
                                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>No Image</span>
                                        </div>
                                    </SwiperSlide>
                                )}
                            </Swiper>
                            
                            {/* Navigation Arrows */}
                            <button className={`prop-prev absolute top-1/2 -translate-y-1/2 left-2 h-8 w-8 rounded-full backdrop-blur-sm items-center justify-center flex z-10 shadow-lg transition-colors ${isDark ? 'bg-[#282c34]/80 hover:bg-[#282c34]' : 'bg-white/80 hover:bg-white'}`}>
                                <ChevronLeft className={`h-5 w-5 ${isDark ? 'text-gray-200' : 'text-gray-800'}`} />
                            </button>
                            <button className={`prop-next absolute top-1/2 -translate-y-1/2 right-2 h-8 w-8 rounded-full backdrop-blur-sm items-center justify-center flex z-10 shadow-lg transition-colors ${isDark ? 'bg-[#282c34]/80 hover:bg-[#282c34]' : 'bg-white/80 hover:bg-white'}`}>
                                <ChevronRight className={`h-5 w-5 ${isDark ? 'text-gray-200' : 'text-gray-800'}`} />
                            </button>

                            {/* Image Indicators (dots) */}
                            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10 flex gap-1">
                                {images.slice(0, 5).map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/80 backdrop-blur-sm"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Details */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-4 pr-10">
                        <main>
                            {/* Header Section */}
                            <section className="mb-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{safeDisplay(name)}</h1>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <MapPin className={`w-3.5 h-3.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                in {safeDisplay(layer_location)}{location_district ? `, ${safeDisplay(location_district)}` : ''}
                                                {property.state_name ? `, ${safeDisplay(property.state_name)}` : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                                <Check className="w-2.5 h-2.5" />
                                                Best price guaranteed
                                            </span>
                                            <a
                                                href={`tel:${safeDisplay(sellerPhoneNumber)}`}
                                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-[#282c34] hover:bg-[#3a3f4b]' : 'bg-gray-100 hover:bg-gray-200'}`}
                                            >
                                                <svg className={`w-3.5 h-3.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </a>
                                            <a
                                                href={`https://wa.me/${safeDisplay(sellerPhoneNumber)?.replace(/[^0-9]/g, '') || '918151915199'}?text=Hi, I am interested in ${encodeURIComponent(name || 'this property')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-[#282c34] hover:bg-[#3a3f4b]' : 'bg-gray-100 hover:bg-gray-200'}`}
                                            >
                                                <Image src="/whatsapp.svg" alt="WhatsApp" width={16} height={16} />
                                            </a>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-blue-600">{safeDisplay(discountedPrice)}</span>
                                            {originalPrice && originalPrice !== discountedPrice && (
                                                <span className={`text-base line-through ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{safeDisplay(originalPrice)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Amenities Section */}
                            <section className="mb-4">
                                <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Amenities</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {displayedAmenities.length > 0 ? displayedAmenities.map((amenity, index) => (
                                        <div key={index} className="flex flex-col items-center gap-1.5">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                                                <Image
                                                    src={amenity.image}
                                                    alt={amenity.name}
                                                    width={24}
                                                    height={24}
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                            </div>
                                            <span className={`text-[10px] text-center leading-tight ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>{amenity.name}</span>
                                        </div>
                                    )) : (
                                        [
                                            { name: "Guest Check-in", icon: "👤" },
                                            { name: "Delivery Acceptance", icon: "🔔" },
                                            { name: "Package Notification", icon: "📦" },
                                            { name: "Fire Safety", icon: "🚨" },
                                            { name: "Guest Management", icon: "⚙️" },
                                            { name: "Video Surveillance", icon: "📹" },
                                            { name: "Keycard Access", icon: "🔑" },
                                            { name: "Tea", icon: "☕" }
                                        ].map((amenity, index) => (
                                            <div key={index} className="flex flex-col items-center gap-1.5">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                                                    <span className="text-xl">{amenity.icon}</span>
                                                </div>
                                                <span className={`text-[10px] text-center leading-tight ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>{amenity.name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>

                            {/* About the Brand Section */}
                            <section className="mb-4">
                                <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-800'}`}>ABOUT THE BRAND</h3>
                                <h4 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{brandName}</h4>
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                        <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{brandStats.cities}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{brandStats.clients}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                        <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{brandStats.spaces}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{brandStats.seats}</span>
                                    </div>
                                </div>
                                <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {brandDescription}
                                    <a
                                        href={`/property-details?id=${property._id || property.id}&type=${propertyType}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline ml-1"
                                    >
                                        Read more
                                    </a>
                                </p>
                            </section>

                        </main>
                    </div>
                </div>
                
                {/* View Details Button - Right Edge */}
                <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center">
                    <a
                        href={`/property-details?id=${property._id || property.id}&type=${propertyType}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-6 rounded-l-lg shadow-lg transition-colors cursor-pointer writing-vertical-rl text-xs font-medium"
                        style={{ writingMode: 'vertical-rl' }}
                    >
                        View Details
                    </a>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {mobileModal}
            {desktopModal}

            {isLoginModalOpen && (
                <LoginModal onClose={() => setIsLoginModalOpen(false)} onProceed={handleLoginSuccess} />
            )}

            {isContactModalOpen && (
                <div
                    onClick={() => setIsContactModalOpen(false)}
                    style={{ background: "rgba(0,0,0,0.7)" }}
                    className="fixed inset-0 flex items-center justify-center z-50"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`rounded-2xl shadow-lg w-11/12 md:w-96 relative p-6 ${isDark ? 'bg-[#282c34]' : 'bg-white'}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Owner Details</h2>
                            <button onClick={() => setIsContactModalOpen(false)} className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <p className="text-base"><span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Owner Name:</span> <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{safeDisplay(createdBy?.name)}</span></p>
                            <p className="text-base"><span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Contact:</span>
                                <a href={`tel:${sellerPhoneNumber}`} className="font-semibold text-blue-600 hover:underline ml-2">{safeDisplay(sellerPhoneNumber)}</a>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {showRatingModal && (
                <div
                    onClick={() => {
                        setShowRatingModal(false);
                        setSelectedRating(0);
                        setReviewText('');
                        setUserName('');
                        setReviewSubmitSuccess(false);
                    }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`rounded-xl w-full max-w-sm p-5 ${isDark ? 'bg-[#282c34]' : 'bg-white'}`}
                    >
                        <div className="text-center mb-5">
                            <h3 className={`text-lg font-bold mb-1.5 ${isDark ? 'text-white' : 'text-gray-800'}`}>{isEditingReview ? 'Edit Your Review' : 'Rate Your Experience'}</h3>
                            <div className="w-24 h-0.5 bg-yellow-400 mx-auto"></div>
                        </div>

                        {reviewSubmitSuccess && (
                            <div className={`mb-3 border px-3 py-2 rounded-lg text-center text-sm ${isDark ? 'bg-green-900/30 border-green-600 text-green-400' : 'bg-green-100 border-green-400 text-green-700'}`}>
                                {isEditingReview ? 'Review updated successfully!' : 'Review submitted successfully!'}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Your Name *</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${isDark ? 'bg-[#1f2229] border-gray-600 text-white placeholder:text-gray-500' : 'border-gray-300 text-gray-800'}`}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Rating *</label>
                            <div className="flex justify-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        onClick={() => setSelectedRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className={`w-9 h-9 cursor-pointer transition-all ${star <= (hoverRating || selectedRating)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : isDark ? 'text-gray-600' : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Review *</label>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${isDark ? 'bg-[#1f2229] border-gray-600 text-white placeholder:text-gray-500' : 'border-gray-300 text-gray-800'}`}
                                placeholder="Share your experience..."
                                required
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowRatingModal(false);
                                    setIsEditingReview(false);
                                    setSelectedRating(0);
                                    setReviewText('');
                                    setUserName('');
                                    setReviewSubmitSuccess(false);
                                }}
                                className={`flex-1 bg-transparent border-2 border-[#f8c02f] py-3 rounded-lg font-semibold text-base hover:bg-[#f8c02f]/10 transition-colors cursor-pointer ${isDark ? 'text-white' : 'text-gray-800'}`}
                                disabled={isSubmittingReview}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!selectedRating) {
                                        alert('Please select a rating');
                                        return;
                                    }
                                    if (!userName.trim()) {
                                        alert('Please enter your name');
                                        return;
                                    }
                                    if (!reviewText.trim()) {
                                        alert('Please enter your review comment');
                                        return;
                                    }

                                    setIsSubmittingReview(true);
                                    setReviewSubmitSuccess(false);

                                    try {
                                        const propertyId = property._id || property.id;
                                        const propertyType = property.propertyType || 'commercial';
                                        
                                        // Always get the latest user data from localStorage to ensure we have the phone number
                                        let latestUser = currentUser;
                                        try {
                                            const userJson = localStorage.getItem('currentUser');
                                            if (userJson) {
                                                latestUser = JSON.parse(userJson);
                                            }
                                        } catch (e) {
                                            console.error('Error reading user from localStorage:', e);
                                        }
                                        
                                        // Get phone number - try multiple possible field names and formats
                                        let userPhoneNumber = latestUser?.phoneNumber || 
                                                             latestUser?.phone || 
                                                             latestUser?.userPhoneNumber || 
                                                             (latestUser?.user && latestUser.user.phoneNumber) ||
                                                             null;

                                        // If phone number has + prefix, keep it; otherwise ensure it's properly formatted
                                        if (userPhoneNumber && typeof userPhoneNumber === 'string') {
                                            userPhoneNumber = userPhoneNumber.trim();
                                        }

                                        console.log('Review Submit - Latest user from localStorage:', latestUser);
                                        console.log('Review Submit - Extracted userPhoneNumber:', userPhoneNumber);

                                        if (!userPhoneNumber) {
                                            alert('Unable to get your phone number from session. Please make sure you are logged in.');
                                            setIsSubmittingReview(false);
                                            return;
                                        }

                                        const requestBody = {
                                            propertyId,
                                            propertyType,
                                            user: userName.trim(),
                                            rating: selectedRating,
                                            comment: reviewText.trim(),
                                            userPhoneNumber: userPhoneNumber
                                        };
                                        
                                        if (isEditingReview && userReview) {
                                            requestBody.reviewId = userReview._id || userReview.id;
                                        }
                                        
                                        console.log('Review Submit - Sending to API:', requestBody);
                                        
                                        let response;
                                        if (isEditingReview && userReview) {
                                            // Edit existing review
                                            response = await fetch('/api/reviews', {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify(requestBody),
                                            });
                                        } else {
                                            // Create new review
                                            response = await fetch('/api/reviews', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify(requestBody),
                                            });
                                        }

                                        const data = await response.json();

                                        if (data.success) {
                                            setReviewSubmitSuccess(true);
                                            
                                            // Refresh property data to get updated reviews
                                            try {
                                                const propResponse = await fetch(`/api/properties?id=${propertyId}&type=${propertyType}`);
                                                const propData = await propResponse.json();
                                                
                                                if (propData.success && propData.property) {
                                                    // Update the property object with fresh data (since it's passed by reference)
                                                    property.reviews = propData.property.reviews || [];
                                                    property.ratings = propData.property.ratings || property.ratings;
                                                    
                                                    // Force a re-render by updating a dependency
                                                    // Immediately check for user review with updated property data
                                                    // This will set hasUserSubmittedReview to true if review exists
                                                    checkUserReview(propData.property);
                                                    
                                                    // Also force a re-check after a brief delay to ensure state is updated
                                                    setTimeout(() => {
                                                        checkUserReview(propData.property);
                                                        // Force component update by setting state that depends on property
                                                        if (propData.property.reviews) {
                                                            setHasUserSubmittedReview(prev => {
                                                                // Re-check to ensure state is correct
                                                                checkUserReview(propData.property);
                                                                return prev;
                                                            });
                                                        }
                                                    }, 100);
                                                }
                                            } catch (error) {
                                                console.error('Error refreshing property data:', error);
                                            }
                                            
                                            setTimeout(() => {
                                                setShowRatingModal(false);
                                                setIsEditingReview(false);
                                                setSelectedRating(0);
                                                setReviewText('');
                                                setUserName('');
                                                setReviewSubmitSuccess(false);
                                            }, 1500);
                                        } else {
                                            alert(data.message || 'Failed to submit review. Please try again.');
                                        }
                                    } catch (error) {
                                        console.error('Error submitting review:', error);
                                        alert('An error occurred. Please try again.');
                                    } finally {
                                        setIsSubmittingReview(false);
                                    }
                                }}
                                className="flex-1 bg-[#f8c02f] text-gray-800 py-3 rounded-lg font-semibold text-base hover:bg-[#e0ad2a] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmittingReview || !selectedRating || !userName.trim() || !reviewText.trim()}
                            >
                                {isSubmittingReview ? (isEditingReview ? 'Updating...' : 'Submitting...') : (isEditingReview ? 'Update Rating' : 'Submit Rating')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isReportModalOpen && (
                <div
                    onClick={() => {
                        setIsReportModalOpen(false);
                        setReportFormData({
                            reporterName: "",
                            reporterEmail: "",
                            reporterPhone: "",
                            reason: "",
                            details: "",
                        });
                    }}
                    style={{ background: "rgba(0,0,0,0.7)" }}
                    className="fixed inset-0 flex items-center justify-center z-[60] p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`rounded-2xl shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#282c34]' : 'bg-white'}`}
                    >
                        <div className={`flex justify-between items-center p-6 border-b sticky top-0 z-10 rounded-t-2xl ${isDark ? 'bg-[#282c34] border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Report this Property</h2>
                            <button
                                onClick={() => {
                                    setIsReportModalOpen(false);
                                    setReportFormData({
                                        reporterName: "",
                                        reporterEmail: "",
                                        reporterPhone: "",
                                        reason: "",
                                        details: "",
                                    });
                                }}
                                className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form className="p-6 space-y-4" onSubmit={async (e) => {
                            e.preventDefault();
                            setIsSubmitting(true);

                            try {
                                const response = await fetch('/api/report-property', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        propertyId: property.id,
                                        propertyName: safeDisplay(name),
                                        ...reportFormData,
                                    }),
                                });

                                const data = await response.json();

                                if (data.success) {
                                    setIsReportModalOpen(false);
                                    setReportFormData({
                                        reporterName: "",
                                        reporterEmail: "",
                                        reporterPhone: "",
                                        reason: "",
                                        details: "",
                                    });
                                } else {
                                    alert('Failed to submit report. Please try again.');
                                }
                            } catch (error) {
                                console.error('Error submitting report:', error);
                                alert('An error occurred. Please try again.');
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Your Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={reportFormData.reporterName}
                                    onChange={(e) => setReportFormData({ ...reportFormData, reporterName: e.target.value })}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDark ? 'bg-[#1f2229] border-gray-600 text-white placeholder:text-gray-500' : 'border-gray-300 text-gray-800'}`}
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={reportFormData.reporterEmail}
                                    onChange={(e) => setReportFormData({ ...reportFormData, reporterEmail: e.target.value })}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDark ? 'bg-[#1f2229] border-gray-600 text-white placeholder:text-gray-500' : 'border-gray-300 text-gray-800'}`}
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={reportFormData.reporterPhone}
                                    onChange={(e) => setReportFormData({ ...reportFormData, reporterPhone: e.target.value })}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDark ? 'bg-[#1f2229] border-gray-600 text-white placeholder:text-gray-500' : 'border-gray-300 text-gray-800'}`}
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Reason for Report <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={reportFormData.reason}
                                    onChange={(e) => setReportFormData({ ...reportFormData, reason: e.target.value })}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDark ? 'bg-[#1f2229] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                                >
                                    <option value="">Select a reason</option>
                                    <option value="incorrect_info">Incorrect Information</option>
                                    <option value="fraud">Fraudulent Listing</option>
                                    <option value="duplicate">Duplicate Listing</option>
                                    <option value="sold">Property Already Sold</option>
                                    <option value="inappropriate">Inappropriate Content</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Additional Details <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows="4"
                                    value={reportFormData.details}
                                    onChange={(e) => setReportFormData({ ...reportFormData, details: e.target.value })}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none ${isDark ? 'bg-[#1f2229] border-gray-600 text-white placeholder:text-gray-500' : 'border-gray-300 text-gray-800'}`}
                                    placeholder="Please provide more details about your report..."
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsReportModalOpen(false);
                                        setReportFormData({
                                            reporterName: "",
                                            reporterEmail: "",
                                            reporterPhone: "",
                                            reason: "",
                                            details: "",
                                        });
                                    }}
                                    className={`flex-1 px-4 py-2.5 border-2 border-yellow-400 rounded-lg font-medium transition-colors cursor-pointer ${isDark ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-yellow-600 hover:bg-yellow-50'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Report"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}