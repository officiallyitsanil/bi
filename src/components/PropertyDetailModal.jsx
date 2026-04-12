"use client";

import { useState, useEffect } from "react";
import { loginUser } from "@/utils/auth";
import { mapAmenitiesToObjects } from "@/utils/amenityMapping";
import { calculatePrices } from "@/utils/priceUtils";
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

const safeNumber = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

import {
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
    Building2,
    Users,
    User,
    Bell,
    Package,
    Flame,
    ChevronDown,
    Info
} from "lucide-react";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import LoginModal from "./LoginModal";



export default function PropertyDetailModal({ property, onClose, onViewDetailsClick, isPropertyListVisible = false, centerInMapArea = false }) {
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
    const [mobileSwiperIndex, setMobileSwiperIndex] = useState(0);

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
            const propertyType = property.propertyCategory || (property.propertyType === 'residential' ? 'residential' : 'commercial');
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
        const propertyType = property.propertyCategory || (property.propertyType === 'residential' ? 'residential' : 'commercial');
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
        const lat = property.coordinates?.latitude ?? property.coordinates?.lat ?? property.position?.lat;
        const lng = property.coordinates?.longitude ?? property.coordinates?.lng ?? property.position?.lng;
        const cleanName = (property.propertyName || property.name || 'property').toLowerCase().replace(/\s+/g, '-');
        const mapUrl = (lat != null && lng != null)
            ? `https://maps.google.com/maps?q=${lat},${lng}&z=14&t=h`
            : `${window.location.origin}/property-details/${cleanName}`;

        try {
            await navigator.clipboard.writeText(mapUrl);
            alert('URL copied to clipboard!');
        } catch (err) {
            console.error('Share copy failed:', err);
            alert('Could not copy. Please copy the link manually.');
        }
    };

    const handleViewDetailsClick = async () => {
        onViewDetailsClick?.();
        try {
            const propertyId = property._id || property.id;
            const propertyType = property.propertyCategory || (property.propertyType === 'residential' ? 'residential' : 'commercial');

            await fetch('/api/properties/visitor-count', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: propertyId,
                    type: propertyType
                }),
            });
        } catch (error) {
            console.error('Error incrementing visitor count:', error);
        }
    };

    // Schema: totalPrice, discountPercent, pricePerSeat, pricePerSqft
    const prices = calculatePrices(property);

    // Schema field names: propertyName, address.locality, address.district, agentDetails, brandDetails
    const name = property.propertyName || property.name;
    const is_verified = property.verificationStatus === 'verified' || property.verificationStatus === 'confirmed' || property.is_verified;
    const location_district = property.address?.district || property.location_district;
    const layer_location = property.address?.locality || property.layer_location;
    const sellerPhoneNumber = property.agentDetails?.phone || property.sellerPhoneNumber;
    const handlePhoneClick = (e, phone) => {
        if (e) e.preventDefault();
        if (!phone) return;
        const num = String(phone).replace(/[^0-9+]/g, '');
        const fullNum = num.startsWith('91') ? num : (num.length === 10 ? '91' + num : num);
        const telUrl = `tel:+${fullNum}`;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            window.location.href = telUrl;
        } else {
            navigator.clipboard.writeText('+' + fullNum).then(() => {
                alert('Phone number copied to clipboard! Paste in your phone or a calling app (Skype, Teams, etc.) to call.');
            }).catch(() => {
                window.location.href = telUrl;
            });
        }
    };
    const createdBy = property.agentDetails ? { name: property.agentDetails.name } : property.createdBy;
    const {
        images = [],
        amenities = [],
        ratings = {},
        reviews = [],
        floorPlans = {},
        propertyType,
        visitorCount = 0
    } = property;

    const originalPrice = prices.originalPrice;
    const discountedPrice = prices.discountedPrice;
    // Schema: propertyCategory is commercial/residential; propertyType is subtype (Office Space, Plot)
    const propertyCategory = property.propertyCategory || (propertyType === 'residential' ? 'residential' : 'commercial');

    // Map amenities (handles both string arrays and object arrays)
    const mappedAmenities = mapAmenitiesToObjects(amenities);
    const displayedAmenities = mappedAmenities;
    const displayedReviews = reviews.slice(0, 3);
    const whatsGood = ratings?.whatsGood || [];
    const whatsBad = ratings?.whatsBad || [];
    const floorPlanCategories = Object.keys(floorPlans);

    // Schema: brandDetails
    const brandName = safeDisplay(property.brandDetails?.name || property.brandName);
    const brandStats = property.brandDetails ? {
        cities: property.brandDetails.cities ?? property.brandStats?.cities ?? 0,
        clients: property.brandDetails.clients ?? property.brandStats?.clients ?? 0,
        spaces: property.brandDetails.spaces ?? property.brandStats?.spaces ?? 0,
        seats: property.brandDetails.seats ?? property.brandStats?.seats ?? 0
    } : (property.brandStats || { cities: 0, clients: 0, spaces: 0, seats: 0 });
    const brandDescription = safeDisplay(property.brandDetails?.description || property.brandDescription);
    const rating = safeNumber(property.ratings?.overall);
    const isTopRated = property.isTopRated !== undefined ? property.isTopRated : true;

    // Calculate discount percentage for Best Price badge
    const originalPriceNum = parseFloat(String(originalPrice || 0).replace(/[^0-9.]/g, ''));
    const discountedPriceNum = parseFloat(String(discountedPrice || 0).replace(/[^0-9.]/g, ''));
    const discountPct = (originalPriceNum && discountedPriceNum && originalPriceNum > discountedPriceNum)
        ? Math.round(((originalPriceNum - discountedPriceNum) / originalPriceNum) * 100)
        : 0;

    // Mobile view (< md breakpoint) - Exact design for screens < 480px
    const availabilityStatus = safeDisplay(property.availability, 'Available');

    const mobileModal = (
        <div
            role="dialog"
            className="md:hidden fixed inset-0 z-50 flex items-end"
            tabIndex="-1"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

            {/* Modal Content - max 85vh on mobile so top is never cut off */}
            <div className={`relative pb-20 max-[480px]:pb-28 w-full max-h-[min(88vh,88svh)] max-[480px]:max-h-[82vh] rounded-t-3xl transition-colors ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`}>
                {/* Top RATED Badge - Mobile */}
                {isTopRated && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30">
                        <Image
                            src="/property-details/top-rated-badge.svg"
                            alt="Top Rated"
                            width={46}
                            height={46}
                            className="object-contain drop-shadow-xl"
                            unoptimized
                        />
                    </div>
                )}
                {/* Drag Handle */}
                <div className="flex justify-center py-2">
                    <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                </div>

                {/* Scrollable Content - smaller max on mobile so modal top stays visible */}
                <div className="overflow-y-auto max-h-[calc(92vh-120px)] max-[480px]:max-h-[calc(85vh-140px)]">
                    {/* Image Carousel - with padding around for max-[480px] */}
                    <div className={`relative mx-3 rounded-2xl overflow-hidden h-44 max-[480px]:h-40 max-[480px]:mx-3 max-[480px]:mt-2 max-[480px]:rounded-2xl ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                        {/* Close - Top Left (mobile < 480px) */}
                        <button
                            onClick={onClose}
                            className={`absolute top-3 left-3 z-20 w-9 h-9 rounded-full flex items-center justify-center ${isDark ? 'bg-black/40' : 'bg-white/90'}`}
                            aria-label="Close"
                        >
                            <X className={`w-5 h-5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`} />
                        </button>

                        {/* Share & Heart - Top Right (matching design) */}
                        <div className="absolute top-3 right-3 z-20 flex gap-2">
                            <button
                                onClick={handleShare}
                                className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? 'bg-black/40' : 'bg-white/90'}`}
                                aria-label="Share"
                            >
                                <Share2 className={`w-5 h-5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`} />
                            </button>
                            <button
                                onClick={handleFavouriteToggle}
                                className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? 'bg-black/40' : 'bg-white/90'}`}
                                aria-label="Favorite"
                            >
                                <Heart className={`w-5 h-5 ${isFavourite ? 'fill-red-500 text-red-500' : isDark ? 'text-gray-200' : 'text-gray-700'}`} />
                            </button>
                        </div>

                        <Swiper
                            modules={[Navigation]}
                            navigation={{
                                prevEl: ".mobile-prop-prev",
                                nextEl: ".mobile-prop-next",
                            }}
                            spaceBetween={0}
                            slidesPerView={1}
                            loop={true}
                            onSlideChange={(sw) => setMobileSwiperIndex(sw.realIndex)}
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
                                    <div className={`h-full w-full flex items-center justify-center ${isDark ? 'bg-[#282c34]' : 'bg-gray-200'}`}>
                                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>No Image</span>
                                    </div>
                                </SwiperSlide>
                            )}
                        </Swiper>

                        {/* Navigation Arrows - circular semi-transparent */}
                        <button className={`mobile-prop-prev absolute top-1/2 -translate-y-1/2 left-2 h-9 w-9 rounded-full flex items-center justify-center z-10 ${isDark ? 'bg-black/40' : 'bg-white/90'}`}>
                            <ChevronLeft className={`h-5 w-5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`} />
                        </button>
                        <button className={`mobile-prop-next absolute top-1/2 -translate-y-1/2 right-2 h-9 w-9 rounded-full flex items-center justify-center z-10 ${isDark ? 'bg-black/40' : 'bg-white/90'}`}>
                            <ChevronRight className={`h-5 w-5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`} />
                        </button>

                        {/* Pagination dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                            {(images.length > 0 ? images : [null]).slice(0, 5).map((_, i) => {
                                const count = images.length || 1;
                                const isActive = i === (mobileSwiperIndex % count);
                                return (
                                    <div key={i} className={`w-2 h-2 rounded-full ${isActive ? (isDark ? 'bg-white' : 'bg-gray-800/80') : isDark ? 'bg-white/50' : 'bg-gray-500/50'}`} />
                                );
                            })}
                        </div>
                    </div>

                    {/* Content - design matching image, extra bottom padding for scroll on max-[480px] */}
                    <div className="px-4 pt-4 pb-24 max-[480px]:px-4 max-[480px]:pt-4 max-[480px]:pb-40">
                        {/* Property Header - Name | Badge | Rating, Location below */}
                        <div className="flex items-start justify-between gap-2 mb-3 max-[480px]:mb-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between w-full">
                                    <h1 className={`text-[15px] max-[480px]:text-[13px] font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{safeDisplay(name)}</h1>
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex items-center gap-0.5 px-2 py-0.5 max-[480px]:px-1.5 max-[480px]:py-0.5 rounded-full bg-[#fff4e5]">
                                            <Star className="w-5 h-5 max-[480px]:w-4.5 max-[480px]:h-4.5 fill-[#f97316] text-[#f97316]" />
                                            <span className="text-[13px] max-[480px]:text-[11.5px] font-bold text-[#f97316]">{rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between w-full mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <Image src="/property-details/red-map-icon.svg" alt="Location" width={22} height={22} className="flex-shrink-0 object-contain" unoptimized />
                                        <span className={`text-[15.5px] max-[480px]:text-[14.5px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            in {safeDisplay(layer_location)}{location_district ? `, ${safeDisplay(location_district)}` : ''}{property.state_name ? `, ${safeDisplay(property.state_name)}` : ''}
                                        </span>
                                    </div>
                                    {is_verified && (
                                        <Image src="/property-details/verfication-badge.svg" alt="Verified" width={26} height={26} className="object-contain" unoptimized />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Property Features - 3 horizontal boxes */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            <span className={`px-2.5 py-1.5 max-[480px]:px-2 max-[480px]:py-1 rounded-xl max-[480px]:rounded-lg text-[11px] max-[480px]:text-[10px] font-medium flex items-center gap-1.5 max-[480px]:gap-1 ${isDark ? 'bg-[#282c34] text-blue-400' : 'bg-gray-100 text-gray-600'}`}>
                                <Building2 className="w-3.5 h-3.5 max-[480px]:w-3 max-[480px]:h-3 flex-shrink-0" />
                                {(property.propertyCategory || propertyType) === 'commercial' ? 'Commercial' : 'Residential'}
                            </span>
                            <span className={`px-2.5 py-1.5 max-[480px]:px-2 max-[480px]:py-1 rounded-xl max-[480px]:rounded-lg text-[11px] max-[480px]:text-[10px] font-medium flex items-center gap-1.5 max-[480px]:gap-1 ${isDark ? 'bg-[#282c34] text-blue-400' : 'bg-gray-100 text-gray-600'}`}>
                                <svg className="w-3.5 h-3.5 max-[480px]:w-3 max-[480px]:h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                {safeNumber(property.propertySize || property.carpetArea)} sq.ft
                            </span>
                            <span className={`px-2.5 py-1.5 max-[480px]:px-2 max-[480px]:py-1 rounded-xl max-[480px]:rounded-lg text-[11px] max-[480px]:text-[10px] font-medium flex items-center gap-1.5 max-[480px]:gap-1 ${isDark ? 'bg-[#282c34] text-blue-400' : 'bg-gray-100 text-gray-600'}`}>
                                <svg className="w-3.5 h-3.5 max-[480px]:w-3 max-[480px]:h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                {safeDisplay(property.furnishingLevel || property.furnishingStatus || property.furnishing, 'Furnished')}
                            </span>
                        </div>

                        {/* Best Price Guaranteed Mobile */}
                        <div className="flex items-start gap-1.5 mb-3 px-2 py-1 max-[480px]:py-0.5 rounded-l-2xl bg-gradient-to-r from-[#e3f2e6] via-[#e3f2e6]/70 to-transparent w-fit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5">
                                <path d="M11.455 1.579a1.5 1.5 0 011.09 0l2.365.882a1.5 1.5 0 001.32-.158l2.094-1.424a1.5 1.5 0 011.838.252l1.79 1.79a1.5 1.5 0 01.252 1.838l-1.424 2.094a1.5 1.5 0 00-.158 1.32l.882 2.365a1.5 1.5 0 010 1.09l-.882 2.365a1.5 1.5 0 00.158 1.32l1.424 2.094a1.5 1.5 0 01-.252 1.838l-1.79 1.79a1.5 1.5 0 01-1.838.252l-2.094-1.424a1.5 1.5 0 00-1.32-.158l-2.365.882a1.5 1.5 0 01-1.09 0l-2.365-.882a1.5 1.5 0 00-1.32.158l-2.094 1.424a1.5 1.5 0 01-1.838-.252l-1.79-1.79a1.5 1.5 0 01-.252-1.838l1.424-2.094a1.5 1.5 0 00.158-1.32l-.882-2.365a1.5 1.5 0 010-1.09l.882-2.365a1.5 1.5 0 00-.158-1.32l-1.424-2.094a1.5 1.5 0 01.252-1.838l1.79-1.79a1.5 1.5 0 011.838-.252l2.094 1.424a1.5 1.5 0 001.32.158l2.365-.882z" fill="#307f43" />
                                <path d="M9 10.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-6.2-5.8l6.4-6.4 1.4 1.4-6.4 6.4-1.4-1.4z" fill="white" />
                            </svg>
                            <span className="text-[9px] font-medium text-[#307f43] leading-tight max-w-[160px]">
                                Best price guaranteed - save up to {discountPct}% with <strong className="font-serif">Buildersinfo</strong>
                            </span>
                            <Info className="w-3 h-3 text-[#307f43] opacity-70 shrink-0 mt-0.5" strokeWidth={1.5} />
                        </div>

                        {/* Amenities - Show all with scrollbar */}
                        {(() => {
                            const defaultAmenities = [
                                { name: "Guest Check-in", image: "/amenities/Guest%20Check%20in.png", Icon: User },
                                { name: "Delivery Acceptance", image: "/amenities/Delivery.png", Icon: Bell },
                                { name: "Package Notification", image: "/amenities/Package%20Notification.png", Icon: Package },
                                { name: "Fire Safety", image: "/amenities/Fire%20%26%20seafty.png", Icon: Flame }
                            ];
                            const amenitiesToShow = displayedAmenities.length > 0
                                ? displayedAmenities.map((a, i) => ({ ...a, Icon: a.Icon || defaultAmenities[i % defaultAmenities.length]?.Icon || User }))
                                : defaultAmenities;
                            return (
                                <div className={`mb-4 max-h-[200px] overflow-y-auto pr-2 p-2 scrollbar-ultra-thin rounded-2xl border ${isDark ? 'bg-[#282c34] border-gray-700 shadow-none' : 'bg-white border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)]'}`}>
                                    <div className="p-2">
                                        <div className="grid grid-cols-4 gap-3">
                                            {amenitiesToShow.map((amenity, index) => {
                                                const IconComp = amenity.Icon || User;
                                                return (
                                                    <div key={index} className="flex flex-col items-center gap-1.5 pb-2">
                                                        <div className={`w-10 h-10 max-[480px]:w-8 max-[480px]:h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-[#282c34]' : 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]'}`}>
                                                            {amenity.image ? (
                                                                <Image src={amenity.image} alt={amenity.name} width={18} height={18} className="object-contain" unoptimized />
                                                            ) : (
                                                                <IconComp className={`w-4 h-4 max-[480px]:w-3.5 max-[480px]:h-3.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} strokeWidth={2} />
                                                            )}
                                                        </div>
                                                        <span className={`text-[8px] max-[480px]:text-[7px] text-center leading-tight ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{amenity.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Key Info - Price | Status | Reviews - 3 boxes */}
                        <div className="grid grid-cols-3 gap-1.5 mb-3 mt-2">
                            <div className={`rounded-xl py-2 px-1.5 max-[480px]:py-1.5 max-[480px]:px-1 text-center flex flex-col items-center justify-center ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                                <p className={`text-[11px] max-[480px]:text-[9px] mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Price</p>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 ${isDark ? 'bg-black/20' : 'bg-white'}`}>
                                    {originalPrice && originalPrice !== discountedPrice ? (
                                        <>
                                            <div className="relative px-0.5">
                                                <span className={`italic font-serif text-[10px] ${isDark ? 'text-green-500' : 'text-green-700'}`}>
                                                    {String(originalPrice).replace(/[₹,]/g, '')}
                                                </span>
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                        <line x1="10" y1="90" x2="90" y2="10" stroke="#ef4444" strokeWidth="8" />
                                                        <line x1="10" y1="10" x2="90" y2="90" stroke="#ef4444" strokeWidth="8" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <svg width="20" height="10" viewBox="0 0 24 12" fill="none" className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                                <path d="M1 6H23M23 6L17 1M23 6L17 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </>
                                    ) : null}
                                    <span className={`italic font-serif text-xs font-bold ${isDark ? 'text-green-500' : 'text-green-700'}`}>
                                        {String(discountedPrice).replace(/[₹,]/g, '')}
                                    </span>
                                </div>
                                <p className={`text-[10px] max-[480px]:text-[8px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>/sq.ft</p>
                            </div>
                            <div className={`rounded-xl py-2 px-1.5 max-[480px]:py-1.5 max-[480px]:px-1 text-center ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                                <p className={`text-[11px] max-[480px]:text-[9px] mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Status</p>
                                <p className={`text-[13px] max-[480px]:text-[11px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{availabilityStatus}</p>
                            </div>
                            <div className={`rounded-xl py-2 px-1.5 max-[480px]:py-1.5 max-[480px]:px-1 text-center ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                                <p className={`text-[11px] max-[480px]:text-[9px] mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Reviews</p>
                                <p className={`text-[13px] max-[480px]:text-[11px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{safeNumber(reviews.length)}</p>
                            </div>
                        </div>

                        {/* About the Brand - Mobile Card (as per design) */}
                        <div className={`mb-5 p-3 ${isDark ? 'bg-[#282c34]' : 'bg-white'}`}>
                            <div className="mb-1.5">
                                <h3 className={`text-[9px] font-extrabold uppercase ${isDark ? 'text-gray-200' : 'text-[#2e2e2e]'}`}>ABOUT THE BRAND</h3>
                                <div className="w-6 h-0.5 bg-blue-800 mt-0.5"></div>
                            </div>

                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white shadow-sm flex items-center justify-center p-1">
                                    <Image
                                        src={property.brandDetails?.image || property.brandDetails?.logo || '/property-details/builder-details/builder-logo.png'}
                                        alt="Brand Logo"
                                        width={30}
                                        height={30}
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className={`text-[11px] font-extrabold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{brandName}</h4>
                                    <span className={`text-[8.5px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Workspace</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-2.5">
                                <div className="flex items-center gap-1.5">
                                    <Image src="/property-details/builder-details/cities.png" alt="Cities" width={10} height={10} />
                                    <span className={`text-[8.5px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {typeof brandStats.cities === 'number' ? `${brandStats.cities}+ Cities` : (String(brandStats.cities || '').toLowerCase().includes('cities') ? brandStats.cities : `${safeDisplay(brandStats.cities)} Cities`)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Image src="/property-details/builder-details/coworking.png" alt="Coworking" width={10} height={10} />
                                    <span className={`text-[8.5px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {(() => {
                                            const v = typeof brandStats.spaces === 'number' ? `${brandStats.spaces}+` : String(safeDisplay(brandStats.spaces)).replace(/Coworking\s*/gi, '').trim();
                                            return v.toLowerCase().endsWith('spaces') ? v : `${v} Coworking Spaces`;
                                        })()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Image src="/property-details/builder-details/clients.png" alt="Clients" width={10} height={10} />
                                    <span className={`text-[8.5px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {typeof brandStats.clients === 'number' ? `${brandStats.clients}+ Clients` : (String(brandStats.clients || '').toLowerCase().includes('clients') ? brandStats.clients : `${safeDisplay(brandStats.clients)} Clients`)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Image src="/property-details/builder-details/seats.png" alt="Seats" width={10} height={10} />
                                    <span className={`text-[8.5px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {typeof brandStats.seats === 'number' ? `${brandStats.seats}+ Seats` : (String(brandStats.seats || '').toLowerCase().includes('seats') ? brandStats.seats : `${safeDisplay(brandStats.seats)} Seats`)}
                                    </span>
                                </div>
                            </div>

                            <p className={`text-[10px] leading-relaxed mb-1 line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {brandDescription}
                            </p>
                            <a
                                href={`/property-details/${(property.propertyName || property.name || 'property').toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={handleViewDetailsClick}
                                className="text-blue-700 text-[10px] font-bold flex items-center gap-0.5 hover:underline transition-all"
                            >
                                Read more <ChevronDown className="w-3 h-3" />
                            </a>
                        </div>

                        {/* Contact - Provider + Phone + WhatsApp */}
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex flex-col">
                                <span className={`text-[9px] uppercase font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Contact Provider</span>
                                <h4 className={`text-[14px] max-[480px]:text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{brandName}</h4>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <a
                                    href={sellerPhoneNumber ? `tel:${String(sellerPhoneNumber).replace(/[^0-9+]/g, '')}` : '#'}
                                    onClick={(e) => sellerPhoneNumber && handlePhoneClick(e, sellerPhoneNumber)}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-900/40' : 'bg-blue-100'}`}
                                    aria-label="Call"
                                >
                                    <svg className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </a>
                                <a
                                    href={`https://wa.me/${safeDisplay(sellerPhoneNumber)?.replace(/[^0-9]/g, '') || '918151915199'}?text=Hi, I am interested in ${encodeURIComponent(name || 'this property')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-green-500/90"
                                    aria-label="WhatsApp"
                                >
                                    <Image src="/whatsapp.svg" alt="WhatsApp" width={20} height={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed CTA Button - extra bottom padding on mobile for safe area + nav clearance */}
                <div className={`p-3 max-[480px]:pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] border-t transition-colors ${isDark ? 'bg-[#1f2229] border-gray-700' : 'bg-white border-gray-100'}`}>
                    <a
                        href={`/property-details/${(property.propertyName || property.name || 'property').toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={handleViewDetailsClick}
                        className="block w-[70%] mx-auto bg-blue-600 hover:bg-blue-700 text-white py-3 max-[480px]:py-2.5 rounded-xl text-center font-semibold text-[14px] max-[480px]:text-xs"
                    >
                        View Details
                    </a>
                </div>
            </div>
        </div>
    );

    // Desktop view (>= md breakpoint) - Exact match to image design
    const desktopModal = (
        <div
            role="dialog"
            className={`hidden md:block z-50 shadow-2xl rounded-2xl transition-colors ${centerInMapArea ? 'absolute left-1/2 bottom-4 -translate-x-1/2' : 'fixed bottom-4 left-1/2 -translate-x-1/2'} ${isDark ? 'bg-[#1f2229]' : 'bg-white'}`}
            style={{ width: '780px', maxWidth: '95vw', height: '240px' }}
            tabIndex="-1"
        >
            <div className="flex h-full relative">
                {/* Top RATED Badge - Ultra compact version of the original structure */}
                {isTopRated && (
                    <div className="absolute -top-2 left-[240px] -translate-x-1/2 z-30">
                        <Image
                            src="/property-details/top-rated-badge.svg"
                            alt="Top Rated"
                            width={46}
                            height={46}
                            className="object-contain drop-shadow-xl"
                            unoptimized
                        />
                    </div>
                )}
                {/* Left Section - Image Carousel (40% width) */}
                <div className={`w-[240px] relative flex-shrink-0 rounded-l-2xl overflow-hidden ${isDark ? 'bg-[#282c34]' : 'bg-gray-100'}`}>
                    <div className="relative h-full">


                        {/* Action Icons - Top Left (close, favourite, share, ...) */}
                        <div className="absolute top-1.5 left-1.5 z-20 flex gap-0.5">
                            <button
                                onClick={onClose}
                                className={`w-5 h-5 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-md ${isDark ? 'bg-[#282c34]/80 hover:bg-[#282c34]' : 'bg-white/80 hover:bg-white'}`}
                                aria-label="Close"
                            >
                                <X className={`w-2.5 h-2.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                            </button>
                            <button
                                onClick={handleFavouriteToggle}
                                className={`w-5 h-5 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-md ${isDark ? 'bg-[#282c34]/80 hover:bg-[#282c34]' : 'bg-white/80 hover:bg-white'}`}
                            >
                                <Heart className={`w-2.5 h-2.5 ${isFavourite ? 'fill-red-500 text-red-500' : isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                            </button>
                            <button
                                onClick={handleShare}
                                className={`w-5 h-5 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-md ${isDark ? 'bg-[#282c34]/80 hover:bg-[#282c34]' : 'bg-white/80 hover:bg-white'}`}
                            >
                                <Share2 className={`w-2.5 h-2.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                            </button>
                            <a
                                href={`https://maps.google.com/maps?q=${property.coordinates?.latitude ?? property.coordinates?.lat ?? property.position?.lat},${property.coordinates?.longitude ?? property.coordinates?.lng ?? property.position?.lng}&z=14&t=h`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-5 h-5 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-md ${isDark ? 'bg-[#282c34]/80 hover:bg-[#282c34]' : 'bg-white/80 hover:bg-white'}`}
                            >
                                <CornerUpRight className={`w-2.5 h-2.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                            </a>
                            <a
                                href={`/property-details/${(property.propertyName || property.name || 'property').toLowerCase().replace(/\s+/g, '-')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleViewDetailsClick}
                                className={`w-5 h-5 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-md ${isDark ? 'bg-[#282c34]/80 hover:bg-[#282c34]' : 'bg-white/80 hover:bg-white'}`}
                            >
                                <SquareArrowOutUpRight className={`w-2.5 h-2.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                            </a>
                        </div>

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
                                                width={240}
                                                height={240}
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
                                            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No Image</span>
                                        </div>
                                    </SwiperSlide>
                                )}
                            </Swiper>

                            {/* Navigation Arrows */}
                            <button className={`prop-prev absolute top-1/2 -translate-y-1/2 left-1 h-5 w-5 rounded-full backdrop-blur-sm items-center justify-center flex z-10 shadow-lg transition-colors ${isDark ? 'bg-[#282c34]/80 hover:bg-[#282c34]' : 'bg-white/80 hover:bg-white'}`}>
                                <ChevronLeft className={`h-2.5 w-2.5 ${isDark ? 'text-gray-200' : 'text-gray-800'}`} />
                            </button>
                            <button className={`prop-next absolute top-1/2 -translate-y-1/2 right-1 h-5 w-5 rounded-full backdrop-blur-sm items-center justify-center flex z-10 shadow-lg transition-colors ${isDark ? 'bg-[#282c34]/80 hover:bg-[#282c34]' : 'bg-white/80 hover:bg-white'}`}>
                                <ChevronRight className={`h-2.5 w-2.5 ${isDark ? 'text-gray-200' : 'text-gray-800'}`} />
                            </button>

                            {/* Image Indicators (dots) */}
                            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 z-10 flex gap-0.5">
                                {images.slice(0, 5).map((_, i) => (
                                    <div key={i} className="w-0.5 h-0.5 rounded-full bg-white/80 backdrop-blur-sm"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Details (60% width) */}
                <div className="flex-1 flex flex-col overflow-hidden rounded-r-2xl relative">
                    <div className="flex-1 flex flex-col pl-5 pr-8 p-2 pb-0">
                        {/* Property Header - Title/rating on left, Price on right */}
                        <section className="mb-1.5">
                            <div className="flex items-start justify-between mb-1">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between w-full mb-0.5">
                                        <h1 className={`text-[14px] font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{safeDisplay(name)}</h1>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#fff4e5]">
                                                <Star className="w-3.5 h-3.5 fill-[#f97316] text-[#f97316]" />
                                                <span className="text-[12px] font-bold text-[#f97316]">{rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between w-full mb-0">
                                        <div className="flex items-center gap-1.5">
                                            <Image src="/property-details/red-map-icon.svg" alt="Location" width={20} height={20} className="object-contain" unoptimized />
                                            <span className={`text-[13.5px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                in {safeDisplay(layer_location)}{location_district ? `, ${safeDisplay(location_district)}` : ''}
                                                {property.state_name ? `, ${safeDisplay(property.state_name)}` : ''}
                                            </span>
                                        </div>
                                        {is_verified && (
                                            <Image src="/property-details/verfication-badge.svg" alt="Verified" width={24} height={24} className="object-contain" unoptimized />
                                        )}
                                    </div>
                                    <div className="flex items-start gap-1 mt-0.5 max-w-full overflow-hidden">
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-l-2xl bg-gradient-to-r from-[#e3f2e6] via-[#e3f2e6]/70 to-transparent shrink-0">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5">
                                                <path d="M11.455 1.579a1.5 1.5 0 011.09 0l2.365.882a1.5 1.5 0 001.32-.158l2.094-1.424a1.5 1.5 0 011.838.252l1.79 1.79a1.5 1.5 0 01.252 1.838l-1.424 2.094a1.5 1.5 0 00-.158 1.32l.882 2.365a1.5 1.5 0 010 1.09l-.882 2.365a1.5 1.5 0 00.158 1.32l1.424 2.094a1.5 1.5 0 01-.252 1.838l-1.79 1.79a1.5 1.5 0 01-1.838.252l-2.094-1.424a1.5 1.5 0 00-1.32-.158l-2.365.882a1.5 1.5 0 01-1.09 0l-2.365-.882a1.5 1.5 0 00-1.32.158l-2.094 1.424a1.5 1.5 0 01-1.838-.252l-1.79-1.79a1.5 1.5 0 01-.252-1.838l1.424-2.094a1.5 1.5 0 00.158-1.32l-.882-2.365a1.5 1.5 0 010-1.09l.882-2.365a1.5 1.5 0 00-.158-1.32l-1.424-2.094a1.5 1.5 0 01.252-1.838l1.79-1.79a1.5 1.5 0 011.838-.252l2.094 1.424a1.5 1.5 0 001.32.158l2.365-.882z" fill="#307f43" />
                                                <path d="M9 10.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-6.2-5.8l6.4-6.4 1.4 1.4-6.4 6.4-1.4-1.4z" fill="white" />
                                            </svg>
                                            <span className="text-[6.5px] font-medium text-[#307f43] leading-[1.1] max-w-[100px]">
                                                Best price guaranteed - save up to {discountPct}% with <strong className="font-serif">Buildersinfo</strong>
                                            </span>
                                            <Info className="w-2 h-2 text-[#307f43] opacity-70 shrink-0 mt-0.5" strokeWidth={1.5} />
                                        </div>
                                        <a
                                            href={sellerPhoneNumber ? `tel:${String(sellerPhoneNumber).replace(/[^0-9+]/g, '')}` : '#'}
                                            onClick={(e) => sellerPhoneNumber && handlePhoneClick(e, sellerPhoneNumber)}
                                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-[#282c34] hover:bg-[#3a3f4b]' : 'bg-gray-100 hover:bg-gray-200'}`}
                                        >
                                            <svg className={`w-3 h-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </a>
                                        <a
                                            href={`https://wa.me/${safeDisplay(sellerPhoneNumber)?.replace(/[^0-9]/g, '') || '918151915199'}?text=Hi, I am interested in ${encodeURIComponent(name || 'this property')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-[#282c34] hover:bg-[#3a3f4b]' : 'bg-gray-100 hover:bg-gray-200'}`}
                                        >
                                            <Image src="/whatsapp.svg" alt="WhatsApp" width={14} height={14} />
                                        </a>
                                    </div>
                                </div>
                                {/* Price on Right Side - Stacked vertically */}
                                <div className="flex-1 ml-4 mt-1.5 flex flex-col items-end">
                                    <div className={`flex items-center gap-2.5 px-5 py-2 w-full justify-center ${isDark ? 'bg-[#282c34]' : 'bg-white'}`}>
                                        {originalPrice && originalPrice !== discountedPrice ? (
                                            <>
                                                <div className="relative px-1">
                                                    <span className={`italic font-serif text-xs ${isDark ? 'text-green-500 text-opacity-80' : 'text-green-700 text-opacity-80'}`}>
                                                        {safeDisplay(originalPrice)}
                                                    </span>
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                            <line x1="0" y1="100" x2="100" y2="0" stroke="#ef4444" strokeWidth="6" />
                                                            <line x1="0" y1="0" x2="100" y2="100" stroke="#ef4444" strokeWidth="6" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <svg width="24" height="12" viewBox="0 0 24 12" fill="none" className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                                    <path d="M1 6H23M23 6L17 1M23 6L17 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </>
                                        ) : null}
                                        <span className={`italic font-serif text-base font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                                            {safeDisplay(discountedPrice)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Bottom Section - Amenities and About Brand Side by Side - Aligned to bottom with fixed height */}
                        <div className="flex items-start gap-2 h-auto min-h-[90px]">
                            {/* Left Column - Amenities - Show all with scrollbar - Full Height */}
                            <section className={`flex-1 max-h-[120px] overflow-y-auto pr-2 p-2 scrollbar-ultra-thin rounded-2xl border ${isDark ? 'bg-[#282c34] border-gray-700 shadow-none' : 'bg-white border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)]'}`}>
                                <div className="p-2">
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {(displayedAmenities.length > 0 ? displayedAmenities : [
                                            { name: "Guest Check-in", icon: "👤" },
                                            { name: "Delivery Acceptance", icon: "🔔" },
                                            { name: "Package Notification", icon: "📦" },
                                            { name: "Fire Safety", icon: "🚨" },
                                            { name: "Guest Management", icon: "⚙️" },
                                            { name: "Video Surveillance", icon: "📹" },
                                            { name: "Keycard Access", icon: "🔑" },
                                            { name: "Tea", icon: "☕" }
                                        ]).map((amenity, index) => (
                                            <div key={index} className="flex flex-col items-center gap-0.5 pb-1.5">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDark ? 'bg-[#282c34]' : 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]'}`}>
                                                    {amenity.image ? (
                                                        <Image
                                                            src={amenity.image}
                                                            alt={amenity.name}
                                                            width={12}
                                                            height={12}
                                                            className="object-contain"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <span className="text-[8px]">{amenity.icon || '📦'}</span>
                                                    )}
                                                </div>
                                                <span className={`text-[6.5px] text-center leading-tight ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>{amenity.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Right Column - About the Brand - Ultra Compact */}
                            <section className={`ml-6 flex-1 flex flex-col p-2 pb-1.5 ${isDark ? 'bg-[#282c34]' : 'bg-white'}`}>
                                <div className="mb-1">
                                    <h3 className={`text-[8.5px] font-extrabold uppercase ${isDark ? 'text-gray-200' : 'text-[#2e2e2e]'}`}>ABOUT THE BRAND</h3>
                                    <div className="w-6 h-0.5 bg-blue-800 mt-0.5"></div>
                                </div>

                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-white shadow-sm flex items-center justify-center p-0.5">
                                        <Image
                                            src={property.brandDetails?.image || property.brandDetails?.logo || '/property-details/builder-details/builder-logo.png'}
                                            alt="Brand Logo"
                                            width={22}
                                            height={22}
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className={`text-[9px] font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{brandName}</h4>
                                        <span className={`text-[6.5px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Workspace</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Image src="/property-details/builder-details/cities.png" alt="Cities" width={7} height={7} />
                                        <span className={`text-[7.5px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {typeof brandStats.cities === 'number' ? `${brandStats.cities}+ Cities` : (String(brandStats.cities || '').toLowerCase().includes('cities') ? brandStats.cities : `${safeDisplay(brandStats.cities)} Cities`)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Image src="/property-details/builder-details/coworking.png" alt="Coworking" width={7} height={7} />
                                        <span className={`text-[7.5px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {(() => {
                                                const v = typeof brandStats.spaces === 'number' ? `${brandStats.spaces}+` : String(safeDisplay(brandStats.spaces)).replace(/Coworking\s*/gi, '').trim();
                                                const final = v.toLowerCase().endsWith('spaces') ? v : `${v} Coworking Spaces`;
                                                return final.length > 20 ? v : final;
                                            })()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Image src="/property-details/builder-details/clients.png" alt="Clients" width={7} height={7} />
                                        <span className={`text-[7.5px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {typeof brandStats.clients === 'number' ? `${brandStats.clients}+ Clients` : (String(brandStats.clients || '').toLowerCase().includes('clients') ? brandStats.clients : `${safeDisplay(brandStats.clients)} Clients`)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Image src="/property-details/builder-details/seats.png" alt="Seats" width={7} height={7} />
                                        <span className={`text-[7.5px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {typeof brandStats.seats === 'number' ? `${brandStats.seats}+ Seats` : (String(brandStats.seats || '').toLowerCase().includes('seats') ? brandStats.seats : `${safeDisplay(brandStats.seats)} Seats`)}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <p className={`text-[8px] leading-[1.1] mb-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {brandDescription}
                                    </p>
                                    <a
                                        href={`/property-details/${(property.propertyName || property.name || 'property').toLowerCase().replace(/\s+/g, '-')}`}
                                        onClick={handleViewDetailsClick}
                                        className="text-blue-700 text-[8px] font-bold flex items-center gap-0.5 hover:underline transition-all"
                                    >
                                        Read more <ChevronDown className="w-2 h-2" />
                                    </a>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* View Details Button - HALF inside, HALF outside, 70% height, ROTATED to point left, THIN text, FIXED position */}
                <a
                    href={`/property-details/${(property.propertyName || property.name || 'property').toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={handleViewDetailsClick}
                    className="absolute -right-[9px] top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-none shadow-xl transition-all cursor-pointer writing-vertical-rl text-[9px] h-[70%] w-[20px] flex items-center justify-center z-50 py-3 rotate-180"
                    style={{ writingMode: 'vertical-rl' }}
                >
                    View Details
                </a>
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
                                <a href={sellerPhoneNumber ? `tel:${String(sellerPhoneNumber).replace(/[^0-9+]/g, '')}` : '#'} onClick={(e) => sellerPhoneNumber && handlePhoneClick(e, sellerPhoneNumber)} className="font-semibold text-blue-600 hover:underline ml-2 cursor-pointer">{safeDisplay(sellerPhoneNumber)}</a>
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
                                        const propertyType = property.propertyCategory || (property.propertyType === 'residential' ? 'residential' : 'commercial');

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
                        className={`rounded-2xl shadow-lg w-full max-w-md relative max-h-[min(90vh,90svh)] overflow-y-auto ${isDark ? 'bg-[#282c34]' : 'bg-white'}`}
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
                        <form className="p-6 pb-32 max-[525px]:pb-36 space-y-4" onSubmit={async (e) => {
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