"use client";

import { useState, useEffect } from "react";
import { loginUser } from "@/utils/auth";
import { mapAmenitiesToObjects } from "@/utils/amenityMapping";

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
    Check
} from "lucide-react";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import LoginModal from "./LoginModal";



export default function PropertyDetailModal({ property, onClose, isPropertyListVisible = false }) {
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

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            try {
                const userJson = localStorage.getItem('currentUser');
                if (userJson) {
                    setCurrentUser(JSON.parse(userJson));
                }

                const propertyId = property._id || property.id;
                
                // Check localStorage first
                const favourites = JSON.parse(localStorage.getItem('favorites') || '[]');
                const isFavoritedLocal = favourites.some(fav => (fav._id || fav.id) === propertyId);
                
                if (isFavoritedLocal) {
                    setIsFavourite(true);
                }

                // If user is logged in, sync with database
                if (userJson) {
                    const user = JSON.parse(userJson);
                    if (user.phoneNumber) {
                        try {
                            const response = await fetch(`/api/favorites?userPhoneNumber=${encodeURIComponent(user.phoneNumber)}`);
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
                }
            } catch (error) {
                console.error("Failed to parse user data from localStorage:", error);
            }
        };

        checkFavoriteStatus();
    }, [property._id, property.id]);

    if (!property) return null;

    const handleLoginSuccess = (userData) => {
        loginUser(userData);
        setCurrentUser(userData);
        setIsLoginModalOpen(false);
        setIsContactModalOpen(false);
    };

    const handleAddReview = () => {
        // Check if user is logged in
        if (!currentUser) {
            setIsLoginModalOpen(true);
            return;
        }
        setShowRatingModal(true);
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

    return (
        <div
            role="dialog"
            className={`z-50 bg-white shadow-lg flex max-w-xl md:max-w-sm flex-col overflow-hidden rounded-2xl p-0 text-left absolute bottom-5 w-[420px] md:w-[360px] left-0 h-full max-h-[calc(100%-96px-70px)] max-[425px]:!w-full max-[425px]:!left-0 max-[425px]:!right-0 max-[425px]:!top-0 max-[425px]:!bottom-0 max-[425px]:!max-h-full max-[425px]:!rounded-none transition-all duration-300 ${isPropertyListVisible ? 'md:left-[400px] md:top-[11rem]' : 'md:left-[3.5rem] top-[9rem]'}`}
            tabIndex="-1"
        >
            <div className="sticky top-0 mx-4 flex flex-row justify-between space-y-0 border-b py-4 pb-2 text-left items-start gap-4 lg:pt-6 bg-white max-[375px]:mx-2 max-[375px]:py-3">
                <div className="flex w-full items-start justify-between">
                    <div className="flex-1">
                        <div className="mb-3 flex w-full items-center justify-between text-left lg:mb-2">
                            <div className="flex items-center gap-1.5">
                                <div className="text-lg font-semibold text-gray-800 lg:text-xl">{safeDisplay(name)}</div>
                                {is_verified && <BadgeCheck width="18" height="18" className="text-white fill-blue-500" />}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="shrink-0" height="14" width="14" />
                                <div className="text-left text-sm font-medium capitalize text-gray-600">
                                    {safeDisplay(layer_location)}{location_district ? `, ${safeDisplay(location_district)}` : ''}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div>
                                    <span className="text-sm font-semibold text-gray-800">{safeDisplay(discountedPrice)}</span>
                                    <span className="text-xs font-medium text-gray-500 line-through ml-2">{safeDisplay(originalPrice)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button aria-label="Close" className="text-gray-500 hover:text-gray-800" onClick={onClose}>
                        <X />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pt-0 lg:pt-4 max-[375px]:p-2">
                <main>
                    <section className="mb-4">
                        <div className="relative group">
                            <Swiper
                                modules={[Navigation]}
                                navigation={{
                                    prevEl: ".prop-prev",
                                    nextEl: ".prop-next",
                                }}
                                spaceBetween={10}
                                slidesPerView={1}
                                loop={true}
                            >
                                {images.map((img, i) => (
                                    <SwiperSlide key={i}>
                                        <Image alt="An image of land" width="400" className="h-[180px] w-full rounded-2xl object-cover" height="180" loading="lazy" src={img} unoptimized />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            <button className="prop-prev absolute top-1/2 -translate-y-1/2 left-2 h-8 w-8 rounded-full bg-white/70 items-center justify-center flex z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <ChevronLeft className="h-5 w-5 text-gray-800" />
                            </button>
                            <button className="prop-next absolute top-1/2 -translate-y-1/2 right-2 h-8 w-8 rounded-full bg-white/70 items-center justify-center flex z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="h-5 w-5 text-gray-800" />
                            </button>
                        </div>
                    </section>

                    <section>
                        <div className="flex gap-4 px-7 justify-around max-[375px]:px-2 max-[375px]:gap-2">
                            <div className="flex flex-1 flex-col items-center gap-2">
                                <button
                                    onClick={handleFavouriteToggle}
                                    className="cursor-pointer rounded-full bg-gray-100 p-3 hover:bg-gray-200 transition-colors"
                                >
                                    <Heart
                                        className={`w-5 h-5 ${isFavourite ? 'fill-red-500 text-red-500' : 'text-gray-800'}`}
                                    />
                                </button>
                                <div className="text-xs text-gray-800">Favourite</div>
                            </div>
                            <div className="flex flex-1 flex-col items-center gap-2">
                                <button
                                    onClick={handleShare}
                                    className="cursor-pointer rounded-full bg-gray-100 p-3 hover:bg-gray-200 transition-colors"
                                >
                                    <Share2 className="w-5 h-5 text-gray-800" />
                                </button>
                                <div className="text-xs text-gray-800">Share</div>
                            </div>
                            <div className="flex flex-1 flex-col items-center gap-2">
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`https://maps.google.com/maps?q=${property.coordinates?.lat || property.position?.lat},${property.coordinates?.lng || property.position?.lng}&z=16&t=h`}
                                    className="cursor-pointer rounded-full bg-gray-100 p-3 hover:bg-gray-200 transition-colors"
                                >
                                    <CornerUpRight className="w-5 h-5 text-gray-800" />
                                </a>
                                <div className="text-xs text-gray-800">Directions</div>
                            </div>
                            <div className="flex flex-1 flex-col items-center gap-2">
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`/property-details?id=${property._id || property.id}&type=${propertyType}`}
                                    className="cursor-pointer rounded-full bg-gray-100 p-3 hover:bg-gray-200 transition-colors"
                                >
                                    <SquareArrowOutUpRight className="w-5 h-5 text-gray-800" />
                                </a>
                                <div className="text-xs text-gray-800">New tab</div>
                            </div>
                        </div>
                        <div className="shrink-0 h-[1px] w-full my-4 bg-gray-200"></div>
                    </section>

                    <section>
                        <div className="flex flex-col">
                            <div className="space-y-2">
                                <div className="flex gap-2"><span className="flex-1 text-sm font-medium text-gray-500">Date Added</span><span className="flex-1 text-sm font-semibold capitalize text-gray-800">{safeDisplay(date_added)}</span></div>
                            </div>
                        </div>
                    </section>

                    {mappedAmenities.length > 0 && (
                        <section className="my-4">
                            <div className="shrink-0 h-[1px] w-full mb-4 bg-gray-200"></div>
                            <h3 className="text-base font-semibold text-gray-800 mb-3">Amenities</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {displayedAmenities.map((amenity, index) => (
                                    <div key={index} className="flex flex-col items-center gap-1.5">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <Image
                                                src={amenity.image}
                                                alt={amenity.name}
                                                width={24}
                                                height={24}
                                                className="object-contain"
                                                unoptimized
                                            />
                                        </div>
                                        <span className="text-[10px] text-center text-gray-600 leading-tight">{amenity.name}</span>
                                    </div>
                                ))}
                            </div>
                            {mappedAmenities.length > 8 && (
                                <a
                                    href={`/property-details?id=${property._id || property.id}&type=${propertyType}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline mt-3 inline-block"
                                >
                                    +{mappedAmenities.length - 8} more amenities
                                </a>
                            )}
                        </section>
                    )}

                    {floorPlanCategories.length > 0 && (
                        <section className="my-4">
                            <div className="shrink-0 h-[1px] w-full mb-4 bg-gray-200"></div>
                            <h3 className="text-base font-semibold text-gray-800 mb-3">Property Layout</h3>
                            <div className="space-y-3">
                                {floorPlanCategories.slice(0, 2).map((category, index) => (
                                    <div key={index}>
                                        <p className="text-xs font-medium text-gray-700 mb-2">{category}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {floorPlans[category].slice(0, 2).map((img, imgIndex) => (
                                                <Image
                                                    key={imgIndex}
                                                    src={img}
                                                    alt={`${category} layout`}
                                                    width={150}
                                                    height={100}
                                                    className="w-full h-20 object-cover rounded-lg"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {floorPlanCategories.length > 2 && (
                                <a
                                    href={`/property-details?id=${property._id || property.id}&type=${propertyType}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline mt-3 inline-block"
                                >
                                    View all layouts
                                </a>
                            )}
                        </section>
                    )}

                    {ratings?.overall && (
                        <section className="my-4">
                            <div className="shrink-0 h-[1px] w-full mb-4 bg-gray-200"></div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-semibold text-gray-800">Ratings & Reviews</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleAddReview}
                                        className="bg-[#f8c02f] text-gray-800 px-3 py-1 rounded-lg font-medium text-xs hover:bg-[#e0ad2a] cursor-pointer transition-colors"
                                    >
                                        Add Review
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(ratings.overall)}</span>
                                        <span className="text-xs text-gray-500">({safeDisplay(ratings.totalRatings)})</span>
                                    </div>
                                </div>
                            </div>

                            {(whatsGood.length > 0 || whatsBad.length > 0) && (
                                <div className="mb-4 space-y-3">
                                    {whatsGood.length > 0 && (
                                        <div className="bg-green-50 rounded-lg p-3">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <ThumbsUp className="w-4 h-4 text-green-600" />
                                                <span className="text-xs font-semibold text-green-800">What's Good</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {whatsGood.slice(0, 3).map((item, index) => (
                                                    <span
                                                        key={index}
                                                        onClick={() => {
                                                            if (!currentUser) {
                                                                setIsLoginModalOpen(true);
                                                                return;
                                                            }
                                                            setReviewText(item);
                                                            setShowRatingModal(true);
                                                        }}
                                                        className="text-[10px] bg-white px-2 py-1 rounded-full text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                                                    >
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {whatsBad.length > 0 && (
                                        <div className="bg-red-50 rounded-lg p-3">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <ThumbsDown className="w-4 h-4 text-red-600" />
                                                <span className="text-xs font-semibold text-red-800">What's Bad</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {whatsBad.slice(0, 2).map((item, index) => (
                                                    <span
                                                        key={index}
                                                        onClick={() => {
                                                            if (!currentUser) {
                                                                setIsLoginModalOpen(true);
                                                                return;
                                                            }
                                                            setReviewText(item);
                                                            setShowRatingModal(true);
                                                        }}
                                                        className="text-[10px] bg-white px-2 py-1 rounded-full text-gray-700 cursor-pointer hover:bg-red-100 transition-colors"
                                                    >
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {displayedReviews.length > 0 && (
                                <div className="space-y-3">
                                    {displayedReviews.map((review, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-medium text-gray-800">{safeDisplay(review.user)}</span>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-xs font-medium text-gray-700">{safeDisplay(review.rating)}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-1">{safeDisplay(review.comment)}</p>
                                            <span className="text-[10px] text-gray-500">{safeDisplay(review.date)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {reviews.length > 3 && (
                                <a
                                    href={`/property-details?id=${property._id || property.id}&type=${propertyType}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline mt-3 inline-block"
                                >
                                    View all {reviews.length} reviews
                                </a>
                            )}
                        </section>
                    )}

                    <div className="border bg-card text-card-foreground shadow-sm my-4 rounded-2xl border-gray-200 p-4">
                        <div className="space-y-2">
                            <div>
                                <span className="flex items-center gap-2">
                                    <BadgeCheck className="text-white fill-blue-500" />
                                    <span className="text-sm font-normal text-gray-600">Preliminary verification done.</span>
                                </span>
                            </div>
                        </div>
                        <div className="shrink-0 h-[1px] w-full my-3 bg-gray-200"></div>
                        <div
                            onClick={() => {
                                // Check if user is logged in
                                if (!currentUser) {
                                    setIsLoginModalOpen(true);
                                    return;
                                }
                                setIsReportModalOpen(true);
                            }}
                            className="flex cursor-pointer items-center gap-2 "
                        >
                            <TriangleAlert className="h-4 w-4 text-gray-800" />
                            <span className="text-sm font-normal text-gray-800 underline underline-offset-2">Report this listing</span>
                        </div>
                    </div>
                </main>
            </div>

            <div className="sticky bottom-0 z-20 w-full bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] max-[375px]:p-2">
                <div className="flex gap-3 max-[375px]:gap-2">
                    <button
                        onClick={() => {
                            const phone = safeDisplay(sellerPhoneNumber);
                            const propName = safeDisplay(name);
                            if (phone !== "-" && propName !== "-") {
                                window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in ${propName}`, '_blank');
                            }
                        }}
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
                        onClick={() => window.location.href = `tel:${safeDisplay(sellerPhoneNumber)}`}
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
            </div>

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
                        className="bg-white rounded-2xl shadow-lg w-11/12 md:w-96 relative p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Owner Details</h2>
                            <button onClick={() => setIsContactModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <p className="text-base"><span className="font-medium text-gray-600">Owner Name:</span> <span className="font-semibold text-gray-900">{safeDisplay(createdBy?.name)}</span></p>
                            <p className="text-base"><span className="font-medium text-gray-600">Contact:</span>
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
                        className="bg-white rounded-xl w-full max-w-sm p-5"
                    >
                        <div className="text-center mb-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-1.5">Rate Your Experience</h3>
                            <div className="w-24 h-0.5 bg-yellow-400 mx-auto"></div>
                        </div>

                        {reviewSubmitSuccess && (
                            <div className="mb-3 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg text-center text-sm">
                                Review submitted successfully!
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating *</label>
                            <div className="flex justify-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        onClick={() => setSelectedRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className={`w-9 h-9 cursor-pointer transition-all ${star <= (hoverRating || selectedRating)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Review *</label>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Share your experience..."
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowRatingModal(false);
                                    setSelectedRating(0);
                                    setReviewText('');
                                    setUserName('');
                                    setReviewSubmitSuccess(false);
                                }}
                                className="flex-1 bg-transparent border-2 border-[#f8c02f] text-gray-800 py-3 rounded-lg font-semibold text-base hover:bg-[#f8c02f]/10 transition-colors cursor-pointer"
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

                                    setIsSubmittingReview(true);
                                    setReviewSubmitSuccess(false);

                                    try {
                                        const propertyId = property._id || property.id;
                                        const propertyType = property.propertyType;
                                        const response = await fetch('/api/reviews', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                                propertyId,
                                                propertyType,
                                                user: userName.trim(),
                                                rating: selectedRating,
                                                comment: reviewText.trim()
                                            }),
                                        });

                                        const data = await response.json();

                                        if (data.success) {
                                            setReviewSubmitSuccess(true);
                                            setTimeout(() => {
                                                setShowRatingModal(false);
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
                                disabled={isSubmittingReview || !selectedRating || !userName.trim()}
                            >
                                {isSubmittingReview ? 'Submitting...' : 'Submit Rating'}
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
                        className="bg-white rounded-2xl shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
                            <h2 className="text-xl font-semibold text-gray-800">Report this Property</h2>
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
                                className="text-gray-500 hover:text-gray-800"
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={reportFormData.reporterName}
                                    onChange={(e) => setReportFormData({ ...reportFormData, reporterName: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={reportFormData.reporterEmail}
                                    onChange={(e) => setReportFormData({ ...reportFormData, reporterEmail: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={reportFormData.reporterPhone}
                                    onChange={(e) => setReportFormData({ ...reportFormData, reporterPhone: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Report <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={reportFormData.reason}
                                    onChange={(e) => setReportFormData({ ...reportFormData, reason: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Details <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows="4"
                                    value={reportFormData.details}
                                    onChange={(e) => setReportFormData({ ...reportFormData, details: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
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
                                    className="flex-1 px-4 py-2.5 border-2 border-yellow-400 text-yellow-600 rounded-lg font-medium hover:bg-yellow-50 transition-colors cursor-pointer"
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
        </div>
    );
}