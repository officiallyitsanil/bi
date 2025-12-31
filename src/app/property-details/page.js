"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Share2,
    Home,
    Star,
    ThumbsUp,
    ThumbsDown,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Heart,
    Edit,
    Trash2
} from "lucide-react";
import PDFViewer from "../../components/PDFViewer";
import GoogleMap from "../../components/GoogleMap";
import LoginModal from "../../components/LoginModal";
import { loginUser } from "../../utils/auth";
import { mapAmenitiesToObjects } from "../../utils/amenityMapping";

import "./animations.css";

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

// Helper function to get video MIME type from URL or contentType
const getVideoMimeType = (url, contentType) => {
    if (contentType) return contentType;
    
    const urlLower = url.toLowerCase();
    if (urlLower.endsWith('.mp4')) return 'video/mp4';
    if (urlLower.endsWith('.mov')) return 'video/quicktime';
    if (urlLower.endsWith('.mpeg') || urlLower.endsWith('.mpg')) return 'video/mpeg';
    if (urlLower.endsWith('.avi')) return 'video/x-msvideo';
    if (urlLower.endsWith('.webm')) return 'video/webm';
    if (urlLower.endsWith('.mkv')) return 'video/x-matroska';
    if (urlLower.endsWith('.flv')) return 'video/x-flv';
    if (urlLower.endsWith('.wmv')) return 'video/x-ms-wmv';
    
    // Default to mp4 if unknown
    return 'video/mp4';
};

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
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
    const [userName, setUserName] = useState('');
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedPDF, setSelectedPDF] = useState(null);
    const [hasUserSubmittedReview, setHasUserSubmittedReview] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [isEditingReview, setIsEditingReview] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    // Check login status
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

    // Check if property is favorited (from localStorage and DB)
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!property || !property._id) return;

            const propertyId = property._id || property.id;
            
            // Check localStorage first
            try {
                const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                const isFavoritedLocal = favorites.some(fav => (fav._id || fav.id) === propertyId);
                
                if (isFavoritedLocal) {
                    setIsLiked(true);
                }

                // If user is logged in, sync with database
                if (currentUser && currentUser.phoneNumber) {
                    try {
                        const response = await fetch(`/api/favorites?userPhoneNumber=${encodeURIComponent(currentUser.phoneNumber)}`);
                        const data = await response.json();
                        
                        if (data.success) {
                            const isFavoritedDB = data.data.some(fav => fav.propertyId === propertyId);
                            setIsLiked(isFavoritedDB);
                            
                            // Sync localStorage with DB
                            if (isFavoritedDB && !isFavoritedLocal) {
                                const updatedFavorites = [...favorites, { _id: propertyId, id: propertyId }];
                                localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                            } else if (!isFavoritedDB && isFavoritedLocal) {
                                const updatedFavorites = favorites.filter(fav => (fav._id || fav.id) !== propertyId);
                                localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                            }
                        }
                    } catch (error) {
                        console.error('Error checking favorite status:', error);
                    }
                }
            } catch (error) {
                console.error('Error reading favorites from localStorage:', error);
            }
        };

        checkFavoriteStatus();
    }, [property, currentUser]);

    // Helper function to normalize phone numbers for comparison
    const normalizePhone = (phone) => {
        if (!phone) return '';
        return phone.toString().replace(/[\s\-\(\)\+]/g, '');
    };

    // Check if user has submitted a review for this property
    useEffect(() => {
        if (!property || !property.reviews || !currentUser) {
            setHasUserSubmittedReview(false);
            setUserReview(null);
            return;
        }

        // Get user phone number - handle different possible field names
        const userPhone = currentUser.phoneNumber || currentUser.phone || currentUser.userPhoneNumber;
        
        if (!userPhone) {
            setHasUserSubmittedReview(false);
            setUserReview(null);
            return;
        }

        const normalizedUserPhone = normalizePhone(userPhone);

        // Check reviews - handle different possible field names in review schema
        const userReviewFound = property.reviews.find(review => {
            const reviewPhone = review.userPhoneNumber || review.userPhone || review.phoneNumber || review.phone;
            if (!reviewPhone) return false;
            return normalizePhone(reviewPhone) === normalizedUserPhone;
        });

        if (userReviewFound) {
            setHasUserSubmittedReview(true);
            setUserReview(userReviewFound);
        } else {
            setHasUserSubmittedReview(false);
            setUserReview(null);
        }
    }, [property, property?.reviews, currentUser]);

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
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                        const animationClass = entry.target.dataset.animation;
                        if (animationClass) {
                            entry.target.classList.add(animationClass);
                            entry.target.classList.add('animated');
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

                // Check if element is in viewport
                const rect = el.getBoundingClientRect();
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                const isInViewport = rect.top < windowHeight && rect.bottom > 0;

                if (isInViewport && rect.top < windowHeight * 0.8) {
                    // Element is already visible in upper portion, animate immediately
                    setTimeout(() => {
                        if (animationClass) {
                            el.classList.add(animationClass);
                            el.classList.add('animated');
                        }
                    }, index * 30);
                } else {
                    // Element not in viewport, observe it
                    observer.observe(el);
                }
            });

            return () => observer.disconnect();
        }, 100);

        return () => clearTimeout(timer);
    }, [property]);


    // Fetch property data from MongoDB based on ID and type
    useEffect(() => {
        const fetchPropertyFromAPI = async () => {
            const idParam = searchParams.get('id');
            const typeParam = searchParams.get('type');

            if (!idParam) {
                console.error('No property ID provided');
                router.push('/');
                return;
            }

            try {
                const apiUrl = `/api/properties?id=${idParam}&type=${typeParam || ''}`;

                const response = await fetch(apiUrl);

                const data = await response.json();

                if (data.success && data.property) {

                    // Helper function to format location from address object
                    const formatLocation = (address) => {
                        if (!address || typeof address === 'string') return address || 'Address not available';

                        const parts = [];
                        if (address.flat) parts.push(address.flat);
                        if (address.street) parts.push(address.street);
                        if (address.locality) parts.push(address.locality);
                        if (address.city) parts.push(address.city);
                        if (address.district) parts.push(address.district);
                        if (address.state) parts.push(address.state);
                        if (address.pincode) parts.push(address.pincode);
                        if (address.country) parts.push(address.country);

                        return parts.length > 0 ? parts.join(', ') : 'Address not available';
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

                    const calculatedPrices = calculatePrices(data.property);

                    const formattedProperty = {
                        ...data.property,
                        id: data.property._id || data.property.id,
                        _id: data.property._id || data.property.id,
                        position: data.property.position || data.property.coordinates || { lat: 28.6139, lng: 77.2090 },
                        coordinates: data.property.coordinates || data.property.position || { lat: 28.6139, lng: 77.2090 },
                        images: data.property.images && data.property.images.length > 0 ? data.property.images : ['/placeholder.png'],
                        featuredImageUrl: data.property.featuredImageUrl || data.property.images?.[0] || '/placeholder.png',
                        amenities: mapAmenitiesToObjects(data.property.amenities || []),
                        nearbyPlaces: data.property.nearbyPlaces || { school: [], hospital: [], hotel: [], business: [] },
                        floorPlans: data.property.floorPlans || {},
                        propertyVideos: data.property.propertyVideos || [],
                        seatLayoutPDFs: data.property.seatLayoutPDFs || [],
                        ratings: data.property.ratings || {
                            overall: 0,
                            totalRatings: 0,
                            breakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
                            whatsGood: [],
                            whatsBad: []
                        },
                        reviews: data.property.reviews || [],
                        name: safeDisplay(data.property.name, 'Property Name'),
                        address: safeDisplay(data.property.address, 'Address not available'),
                        location: data.property.location || formatLocation(data.property.address),
                        originalPrice: calculatedPrices.originalPrice,
                        discountedPrice: calculatedPrices.discountedPrice,
                        sellerPhoneNumber: data.property.sellerPhoneNumber || '+91 XXXXXXXXXX'
                    };

                    setProperty(formattedProperty);
                } else {
                    console.error('❌ Property not found in database');
                    console.error('Response was:', data);
                    console.error('data.success:', data.success);
                    console.error('data.property:', data.property);
                    console.error('Full response:', JSON.stringify(data, null, 2));
                }
            } catch (error) {
                console.error('❌ Error fetching property from API:', error);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
        };

        fetchPropertyFromAPI();
    }, [searchParams, router]);

    // Map configuration - using property data as reference
    const mapCenter = property ? { lat: property.coordinates.lat, lng: property.coordinates.lng } : { lat: 28.6139, lng: 77.2090 };
    const mapZoom = 15;



    const tabs = [
        { id: 'amenities', label: 'Amenities' },
        { id: 'location', label: 'Location & Landmark' },
        { id: 'reviews', label: 'Rating & Reviews' },
        ...(property?.propertyType === 'commercial' ? [{ id: 'layout', label: 'Property Layout' }] : [])
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
        if (!currentUser) {
            setIsLoginOpen(true);
            return;
        }
        if (navigator.share) {
            navigator.share({
                title: property.name,
                text: `Check out this property: ${property.name}`,
                url: window.location.href
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const handleLike = async () => {
        if (!currentUser) {
            setIsLoginOpen(true);
            return;
        }

        if (!property || !property._id) return;

        const propertyId = property._id || property.id;
        const propertyType = property.propertyType || 'commercial';
        const newFavoriteState = !isLiked;

        // Optimistically update UI
        setIsLiked(newFavoriteState);

        // Update localStorage
        try {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            if (newFavoriteState) {
                // Add to favorites
                const exists = favorites.some(fav => (fav._id || fav.id) === propertyId);
                if (!exists) {
                    favorites.push({ _id: propertyId, id: propertyId });
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                }
            } else {
                // Remove from favorites
                const updatedFavorites = favorites.filter(fav => (fav._id || fav.id) !== propertyId);
                localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            }
        } catch (error) {
            console.error('Error updating localStorage:', error);
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
                    setIsLiked(!newFavoriteState);
                    alert('Failed to update favorite. Please try again.');
                }
            } catch (error) {
                console.error('Error updating favorite:', error);
                // Revert UI if API call failed
                setIsLiked(!newFavoriteState);
                alert('Failed to update favorite. Please try again.');
            }
        }
    };

    const handleMessage = () => {
        if (!currentUser) {
            setIsLoginOpen(true);
            return;
        }
        window.open(`https://wa.me/${property.sellerPhoneNumber?.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in ${property.name}`, '_blank');
    };

    const handleWhatsApp = () => {
        if (!currentUser) {
            setIsLoginOpen(true);
            return;
        }
        window.open(`https://wa.me/${property.sellerPhoneNumber?.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in ${property.name}`, '_blank');
    };

    const handleCall = () => {
        if (!currentUser) {
            setIsLoginOpen(true);
            return;
        }
        window.location.href = `tel:${property.sellerPhoneNumber}`;
    };

    const handleShowInterestModal = () => {
        if (!currentUser) {
            setIsLoginOpen(true);
            return;
        }
        setShowModal(true);
    };

    const handleAddReview = () => {
        if (!currentUser) {
            setIsLoginOpen(true);
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
        if (!review || !currentUser) return;
        
        if (!confirm('Are you sure you want to delete your review?')) {
            return;
        }

        try {
            const propertyId = property._id || property.id;
            const propertyType = property.propertyType;
            const reviewId = review._id || review.id;

            const response = await fetch(`/api/reviews?propertyId=${propertyId}&propertyType=${propertyType}&reviewId=${reviewId}&userPhoneNumber=${encodeURIComponent(currentUser.phoneNumber)}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                // Refresh property data
                const apiUrl = `/api/properties?id=${propertyId}&type=${propertyType}`;
                const propResponse = await fetch(apiUrl);
                const propData = await propResponse.json();

                if (propData.success && propData.property) {
                    setProperty(prev => ({
                        ...prev,
                        ratings: propData.property.ratings || prev.ratings,
                        reviews: propData.property.reviews || prev.reviews
                    }));
                }

                setHasUserSubmittedReview(false);
                setUserReview(null);
                alert('Review deleted successfully');
            } else {
                alert(data.message || 'Failed to delete review. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const refreshPropertyData = async () => {
        if (!property) return null;
        
        try {
            const propertyId = property._id || property.id;
            const typeParam = searchParams.get('type');
            const apiUrl = `/api/properties?id=${propertyId}&type=${typeParam || ''}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.success && data.property) {
                const formatLocation = (address) => {
                    if (!address || typeof address === 'string') return address || 'Address not available';
                    const parts = [];
                    if (address.flat) parts.push(address.flat);
                    if (address.street) parts.push(address.street);
                    if (address.locality) parts.push(address.locality);
                    if (address.city) parts.push(address.city);
                    if (address.district) parts.push(address.district);
                    if (address.state) parts.push(address.state);
                    if (address.pincode) parts.push(address.pincode);
                    if (address.country) parts.push(address.country);
                    return parts.length > 0 ? parts.join(', ') : 'Address not available';
                };

                const calculatePrices = (property) => {
                    let originalPriceValue = 0;
                    if (property.propertyType === 'residential') {
                        const expectedRent = property.expectedRent || '0';
                        originalPriceValue = parseFloat(expectedRent.toString().replace(/[₹,]/g, '')) || 0;
                    } else if (property.propertyType === 'commercial') {
                        if (property.floorConfigurations && property.floorConfigurations.length > 0) {
                            const firstFloor = property.floorConfigurations[0];
                            if (firstFloor.dedicatedCabin && firstFloor.dedicatedCabin.seats && firstFloor.dedicatedCabin.pricePerSeat) {
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
                    const discountedPriceValue = originalPriceValue * 0.95;
                    const formatPrice = (price) => {
                        if (price === 0) return '₹XX';
                        return `₹${Math.round(price).toLocaleString('en-IN')}`;
                    };
                    return {
                        originalPrice: formatPrice(originalPriceValue),
                        discountedPrice: formatPrice(discountedPriceValue)
                    };
                };

                const calculatedPrices = calculatePrices(data.property);
                const formattedProperty = {
                    ...data.property,
                    id: data.property._id || data.property.id,
                    _id: data.property._id || data.property.id,
                    position: data.property.position || data.property.coordinates || { lat: 28.6139, lng: 77.2090 },
                    coordinates: data.property.coordinates || data.property.position || { lat: 28.6139, lng: 77.2090 },
                    images: data.property.images && data.property.images.length > 0 ? data.property.images : ['/placeholder.png'],
                    featuredImageUrl: data.property.featuredImageUrl || data.property.images?.[0] || '/placeholder.png',
                    amenities: mapAmenitiesToObjects(data.property.amenities || []),
                    nearbyPlaces: data.property.nearbyPlaces || { school: [], hospital: [], hotel: [], business: [] },
                    floorPlans: data.property.floorPlans || {},
                    propertyVideos: data.property.propertyVideos || [],
                    seatLayoutPDFs: data.property.seatLayoutPDFs || [],
                    ratings: data.property.ratings || {
                        overall: 0,
                        totalRatings: 0,
                        breakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
                        whatsGood: [],
                        whatsBad: []
                    },
                    reviews: data.property.reviews || [],
                    name: safeDisplay(data.property.name, 'Property Name'),
                    address: safeDisplay(data.property.address, 'Address not available'),
                    location: data.property.location || formatLocation(data.property.address),
                    originalPrice: calculatedPrices.originalPrice,
                    discountedPrice: calculatedPrices.discountedPrice,
                    sellerPhoneNumber: data.property.sellerPhoneNumber || '+91 XXXXXXXXXX'
                };

                setProperty(formattedProperty);
                return formattedProperty;
            }
        } catch (error) {
            console.error('Error refreshing property data:', error);
        }
        return null;
    };

    const handleLoginSuccess = (userData) => {
        loginUser(userData);
        setIsLoginOpen(false);
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
                    <p className="text-gray-500 text-sm mt-2">Property ID: {searchParams.get('id')}</p>
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
                        className="w-full h-96 object-cover transition-transform duration-300 cursor-pointer"
                        onClick={() => setFullScreenImage(property.images[currentImageIndex])}
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
                    <div className="absolute bottom-4 right-4 cursor-pointer">
                        <button
                            onClick={openGallery}
                            className="bg-black/30 backdrop-blur-sm text-white rounded-xl border-2 border-white/80 w-12 h-12 flex flex-col items-center justify-center hover:bg-black/40 transition-all duration-200 shadow-lg cursor-pointer rotate-12"
                        >
                            <span className="text-sm font-bold leading-none cursor-pointer">+{property.images.length - 1}</span>
                            <span className="text-xs font-medium leading-none mt-0.5 cursor-pointer">More</span>
                        </button>
                    </div>

                    {/* More Images Button Overlay - Shifted Right Side */}
                    <div className="absolute bottom-4 right-6 cursor-pointer">
                        <button
                            onClick={openGallery}
                            className="bg-black/30 backdrop-blur-sm text-white rounded-xl border-2 border-white/80 w-12 h-12 flex flex-col items-center justify-center hover:bg-black/40 transition-all duration-200 shadow-lg cursor-pointer"
                        >
                            <span className="text-sm font-bold leading-none cursor-pointer">+{property.images.length - 1}</span>
                            <span className="text-xs font-medium leading-none mt-0.5 cursor-pointer">More</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Property Info */}
                <div className="w-full px-4 py-5 max-[425px]:px-3 min-[426px]:w-3/4 min-[426px]:mx-auto">
                    <h2 className="text-xl font-bold mb-2 scroll-animate" data-animation="animate-pop">{safeDisplay(property.name)}</h2>
                    <p className="text-xs text-gray-600 mb-3 scroll-animate" data-animation="animate-fade-up">{safeDisplay(property.address)}</p>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-5 scroll-animate" data-animation="animate-slide-top">
                        <span className="text-base text-red-500 line-through">{safeDisplay(property.originalPrice)}</span>
                        <img
                            src="/property-details/right-arrow.png"
                            alt="Arrow"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="text-xl font-bold">{safeDisplay(property.discountedPrice)}</span>
                        <img
                            src="/property-details/limited-offer.png"
                            alt="Limited Time Offer"
                            className="h-8 object-contain"
                        />
                    </div>



                    {/* Amenities */}
                    <div className="mb-5 scroll-animate" data-animation="animate-slide-top">
                        <AnimatedText className="text-base font-bold mb-3 text-black inline-block" delay={500} lineColor="#f8c02f">
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
                                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-[9999]">
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

                    {/* Opening Hours - Only for commercial properties */}
                    {property.propertyType === 'commercial' && property.openingHours && (
                        <div className="mb-5 scroll-animate" data-animation="animate-slide-top">
                            <AnimatedText className="text-base font-bold mb-3 text-black inline-block" delay={700} lineColor="#f8c02f">
                                <h3>Opening Hours</h3>
                            </AnimatedText>
                            <div className="space-y-2">
                                {property.openingHours.mondayFriday && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-sm font-semibold text-gray-800">Monday - Friday</span>
                                        <span className={`text-sm font-medium ${property.openingHours.mondayFriday.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                            {property.openingHours.mondayFriday.enabled
                                                ? (safeDisplay(property.openingHours.mondayFriday.open) === 'Open' && safeDisplay(property.openingHours.mondayFriday.close) === 'Close'
                                                    ? 'Open All Day'
                                                    : `${safeDisplay(property.openingHours.mondayFriday.open)} - ${safeDisplay(property.openingHours.mondayFriday.close)}`)
                                                : 'Closed'}
                                        </span>
                                    </div>
                                )}
                                {property.openingHours.saturday && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-sm font-semibold text-gray-800">Saturday</span>
                                        <span className={`text-sm font-medium ${property.openingHours.saturday.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                            {property.openingHours.saturday.enabled
                                                ? (safeDisplay(property.openingHours.saturday.open) === 'Open' && safeDisplay(property.openingHours.saturday.close) === 'Close'
                                                    ? 'Open All Day'
                                                    : `${safeDisplay(property.openingHours.saturday.open)} - ${safeDisplay(property.openingHours.saturday.close)}`)
                                                : 'Closed'}
                                        </span>
                                    </div>
                                )}
                                {property.openingHours.sunday && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-sm font-semibold text-gray-800">Sunday</span>
                                        <span className={`text-sm font-medium ${property.openingHours.sunday.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                            {property.openingHours.sunday.enabled
                                                ? (safeDisplay(property.openingHours.sunday.open) === 'Open' && safeDisplay(property.openingHours.sunday.close) === 'Close'
                                                    ? 'Open All Day'
                                                    : `${safeDisplay(property.openingHours.sunday.open)} - ${safeDisplay(property.openingHours.sunday.close)}`)
                                                : 'Closed'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Property Details - Residential */}
                    {property.propertyType === 'residential' && (
                        <div className="mb-5 scroll-animate" data-animation="animate-slide-top">
                            <AnimatedText className="text-base font-bold mb-3 text-black inline-block" delay={700} lineColor="#f8c02f">
                                <h3>Property Details</h3>
                            </AnimatedText>
                            <div className="grid grid-cols-2 gap-2">
                                {(property.category || property.Category) && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Category</span>
                                        <span className="text-sm font-semibold text-gray-800 capitalize">{safeDisplay(property.category || property.Category)}</span>
                                    </div>
                                )}
                                {property.selectedType && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Type</span>
                                        <span className="text-sm font-semibold text-gray-800 capitalize">{safeDisplay(property.selectedType)}</span>
                                    </div>
                                )}
                                {property.availableFor && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Available For</span>
                                        <span className="text-sm font-semibold text-gray-800 capitalize">{safeDisplay(property.availableFor)}</span>
                                    </div>
                                )}
                                {property.bhkType && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">BHK Type</span>
                                        <span className="text-sm font-semibold text-gray-800 uppercase">{safeDisplay(property.bhkType)}</span>
                                    </div>
                                )}
                                {property.apartmentType && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Apartment Type</span>
                                        <span className="text-sm font-semibold text-gray-800 capitalize">{safeDisplay(property.apartmentType) !== "-" ? safeDisplay(property.apartmentType).replace(/-/g, ' ') : "-"}</span>
                                    </div>
                                )}
                                {property.facing && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Facing</span>
                                        <span className="text-sm font-semibold text-gray-800 capitalize">{safeDisplay(property.facing) !== "-" ? safeDisplay(property.facing).replace(/-/g, ' ') : "-"}</span>
                                    </div>
                                )}
                                {property.propertyAge && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Property Age</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.propertyAge) !== "-" ? `${safeDisplay(property.propertyAge)} Years` : "-"}</span>
                                    </div>
                                )}
                                {property.propertySize && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Property Size</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.propertySize) !== "-" ? `${safeDisplay(property.propertySize)} sq.ft` : "-"}</span>
                                    </div>
                                )}
                                {property.carpetArea && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Carpet Area</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.carpetArea) !== "-" ? `${safeDisplay(property.carpetArea)} sq.ft` : "-"}</span>
                                    </div>
                                )}
                                {(property.floor || property.totalFloors) && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Floor</span>
                                        <span className="text-sm font-semibold text-gray-800">
                                            {safeDisplay(property.floor) !== "-" ? safeDisplay(property.floor) : ''}{safeDisplay(property.totalFloors) !== "-" ? ` of ${safeDisplay(property.totalFloors)}` : ''}
                                        </span>
                                    </div>
                                )}
                                {property.furnishing && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Furnishing</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.furnishing)}</span>
                                    </div>
                                )}
                                {property.parking && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Parking</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.parking)}</span>
                                    </div>
                                )}
                                {property.bathrooms !== undefined && property.bathrooms !== null && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Bathrooms</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.bathrooms)}</span>
                                    </div>
                                )}
                                {property.balconies !== undefined && property.balconies !== null && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Balconies</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.balconies)}</span>
                                    </div>
                                )}
                                {property.availableFrom && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Available From</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.availableFrom) !== "-" ? (typeof property.availableFrom === 'string' ? property.availableFrom : new Date(property.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })) : "-"}</span>
                                    </div>
                                )}
                                {property.monthlyMaintenance && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Maintenance</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.monthlyMaintenance)}</span>
                                    </div>
                                )}
                                {property.expectedDeposit && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Security Deposit</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.expectedDeposit) !== "-" ? `₹${Number(property.expectedDeposit).toLocaleString('en-IN')}` : "-"}</span>
                                    </div>
                                )}
                                {property.isNegotiable !== undefined && property.isNegotiable !== null && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Negotiable</span>
                                        <span className={`text-sm font-semibold ${property.isNegotiable ? 'text-green-600' : 'text-red-600'}`}>
                                            {property.isNegotiable ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                )}
                                {property.gatedSecurity !== undefined && property.gatedSecurity !== null && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Gated Security</span>
                                        <span className={`text-sm font-semibold ${property.gatedSecurity ? 'text-green-600' : 'text-red-600'}`}>
                                            {property.gatedSecurity ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                )}
                                {property.gym !== undefined && property.gym !== null && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Gym</span>
                                        <span className={`text-sm font-semibold ${property.gym ? 'text-green-600' : 'text-red-600'}`}>
                                            {property.gym ? 'Available' : 'Not Available'}
                                        </span>
                                    </div>
                                )}
                                {property.nonVegAllowed !== undefined && property.nonVegAllowed !== null && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Non-Veg Allowed</span>
                                        <span className={`text-sm font-semibold ${property.nonVegAllowed ? 'text-green-600' : 'text-red-600'}`}>
                                            {property.nonVegAllowed ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                )}
                                {property.waterSupply && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Water Supply</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.waterSupply)}</span>
                                    </div>
                                )}
                                {property.currentSituation && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Current Situation</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.currentSituation)}</span>
                                    </div>
                                )}
                                {property.directionsTip && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm col-span-2">
                                        <span className="text-xs font-medium text-gray-500">Directions Tip</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.directionsTip)}</span>
                                    </div>
                                )}
                                {property.whoWillShow && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Who Will Show</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.whoWillShow)}</span>
                                    </div>
                                )}
                                {property.builder && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Builder Name</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.builder)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Property Details - Commercial */}
                    {property.propertyType === 'commercial' && (
                        <div className="mb-5 scroll-animate" data-animation="animate-slide-top">
                            <AnimatedText className="text-base font-bold mb-3 text-black inline-block" delay={700} lineColor="#f8c02f">
                                <h3>Property Details</h3>
                            </AnimatedText>
                            <div className="grid grid-cols-2 gap-2">
                                {(property.category || property.Category) && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Category</span>
                                        <span className="text-sm font-semibold text-gray-800 capitalize">{safeDisplay(property.category || property.Category)}</span>
                                    </div>
                                )}
                                {(property.displayPropertyType || property.propertyType) && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Property Type</span>
                                        <span className="text-sm font-semibold text-gray-800 capitalize">{safeDisplay(property.displayPropertyType || property.propertyType)}</span>
                                    </div>
                                )}
                                {property.isUnderManagement && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Under Management</span>
                                        <span className={`text-sm font-semibold ${property.isUnderManagement === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                                            {property.isUnderManagement === 'yes' ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                )}
                                {property.selectedFloors && property.selectedFloors.length > 0 && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm col-span-2">
                                        <span className="text-xs font-medium text-gray-500">Available Floors</span>
                                        <span className="text-sm font-semibold text-gray-800">{property.selectedFloors.join(', ')}</span>
                                    </div>
                                )}
                                {property.floorConfigurations && property.floorConfigurations.length > 0 && (
                                    <div className="flex flex-col bg-white p-3 rounded-lg shadow-sm col-span-2">
                                        <span className="text-xs font-medium text-gray-500 mb-2">Office Space Solutions</span>
                                        <div className="space-y-2">
                                            {property.floorConfigurations.map((config, idx) => (
                                                <div key={idx} className="text-xs">
                                                    {config.floor && <span className="font-semibold text-gray-800">Floor {config.floor}: </span>}
                                                    {config.dedicatedCabin?.enabled && (
                                                        <span className="text-gray-700">Dedicated Cabin ({config.dedicatedCabin.seats || 'N/A'} seats, {config.dedicatedCabin.pricePerSeat || 'N/A'}/seat)</span>
                                                    )}
                                                    {config.dedicatedFloor?.enabled && (
                                                        <span className="text-gray-700 ml-2">Dedicated Floor ({config.dedicatedFloor.seats || 'N/A'} seats, {config.dedicatedFloor.pricePerSeat || 'N/A'}/seat)</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {property.facilities && property.facilities.length > 0 && (
                                    <div className="flex flex-col bg-white p-3 rounded-lg shadow-sm col-span-2">
                                        <span className="text-xs font-medium text-gray-500 mb-2">Facilities</span>
                                        <span className="text-sm font-semibold text-gray-800">{property.facilities.join(', ')}</span>
                                    </div>
                                )}
                                {property.builder && (
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                        <span className="text-xs font-medium text-gray-500">Builder Name</span>
                                        <span className="text-sm font-semibold text-gray-800">{safeDisplay(property.builder)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Location & Landmark */}
                    <div className="mb-5 scroll-animate" data-animation="animate-slide-top">
                        <AnimatedText className="text-base font-bold mb-3 text-black inline-block" delay={1000} lineColor="#f8c02f">
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
                                            <h4 className="font-medium text-sm text-gray-900">{safeDisplay(place.name)}</h4>
                                            <p className="text-xs text-gray-500">{safeDisplay(place.location)}</p>
                                        </div>
                                        <span className="text-xs text-gray-500">{safeDisplay(place.distance)}</span>
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
                            <div className="flex gap-2">
                                {!hasUserSubmittedReview && (
                                    <button
                                        onClick={handleAddReview}
                                        className="bg-[#f8c02f] text-gray-800 px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-[#e0ad2a] cursor-pointer transition-colors"
                                    >
                                        Add Review
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowReviewsModal(true)}
                                    className="text-blue-600 font-medium text-xs hover:underline cursor-pointer"
                                >
                                    View All
                                </button>
                            </div>
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
                                {safeDisplay(property.ratings?.overall, 'N/A')} – {safeDisplay(property.ratings?.totalRatings, 0)} Rating
                            </span>
                        </div>

                        {/* Rating Bars */}
                        <div className="space-y-1.5 mb-5 scroll-animate" data-animation="animate-fade-up">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const getBreakdownCount = (star) => {
                                    if (!property.ratings?.breakdown) return 0;
                                    // Handle both Map and object formats
                                    const breakdown = property.ratings.breakdown;
                                    return breakdown[star] || breakdown[String(star)] || 0;
                                };
                                const count = getBreakdownCount(star);
                                const percentage = property.ratings?.totalRatings ? (count / property.ratings.totalRatings) * 100 : 0;

                                return (
                                    <div key={star} className="flex items-center gap-2">
                                        <span className="text-xs font-medium w-10">{star} Star</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-yellow-400 h-1.5 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium w-5">{count}</span>
                                    </div>
                                );
                            })}
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
                                            if (!currentUser) {
                                                setIsLoginOpen(true);
                                                return;
                                            }
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
                                            if (!currentUser) {
                                                setIsLoginOpen(true);
                                                return;
                                            }
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

                    {/* Property Videos */}
                    {property.propertyVideos && property.propertyVideos.length > 0 && (
                        <div className="mb-5 scroll-animate" data-animation="animate-slide-top">
                            <AnimatedText className="text-base font-bold mb-3 text-black inline-block" delay={1700} lineColor="#f8c02f">
                                <h3>Property Videos</h3>
                            </AnimatedText>
                            <div className="grid grid-cols-1 gap-3">
                                {property.propertyVideos.map((video, i) => {
                                    const mimeType = getVideoMimeType(video.url, video.contentType);
                                    return (
                                        <div key={i} className="relative rounded-lg overflow-hidden bg-black scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                                            <video
                                                controls
                                                preload="metadata"
                                                className="w-full h-48 object-contain"
                                                poster={video.thumbnail}
                                            >
                                                <source src={video.url} type={mimeType} />
                                                <source src={video.url} type="video/mp4" />
                                                <source src={video.url} type="video/webm" />
                                                Your browser does not support the video tag.
                                            </video>
                                            {video.originalName && (
                                                <p className="text-xs text-gray-600 mt-1 px-2">{video.originalName}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Property PDFs - Only for commercial properties */}
                    {property.propertyType === 'commercial' && property.seatLayoutPDFs && property.seatLayoutPDFs.length > 0 && (
                        <div className="mb-5 scroll-animate" data-animation="animate-slide-top">
                            <AnimatedText className="text-base font-bold mb-3 text-black inline-block" delay={1800} lineColor="#f8c02f">
                                <h3>Property Documents</h3>
                            </AnimatedText>
                            <div className="grid grid-cols-1 gap-3">
                                {property.seatLayoutPDFs.map((pdf, i) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {pdf.originalName || pdf.filename || `Document ${i + 1}`}
                                                    </p>
                                                    {pdf.size && (
                                                        <p className="text-xs text-gray-500">
                                                            {(pdf.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedPDF(pdf)}
                                                className="ml-3 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                                            >
                                                View PDF
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Property Layout - Only show for commercial properties */}
                    {property.propertyType === 'commercial' && (
                        <div className="mb-5 scroll-animate" data-animation="animate-slide-top">
                            <AnimatedText className="text-base font-bold mb-3 inline-block" delay={2000} lineColor="#f8c02f">
                                <h3>Property Layout</h3>
                            </AnimatedText>

                            <div className="flex my-3 gap-2 justify-center scroll-animate" data-animation="animate-fade-up">
                                {['6-15 Seats', '16-30 Seats', '31-60 Seats'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setSelectedCapacity(option)}
                                        className={`px-3 py-2 rounded-full text-xs font-medium cursor-pointer transition-colors ${selectedCapacity === option
                                            ? 'bg-black text-white'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>

                            {/* Floor Plans */}
                            <div className="grid grid-cols-2 gap-2 mt-5 scroll-animate" data-animation="animate-fade-up">
                                {property.floorPlans && property.floorPlans[selectedCapacity] ? (
                                    property.floorPlans[selectedCapacity].map((floorPlan, index) => (
                                        <div key={index} className="overflow-hidden rounded-lg">
                                            <img
                                                src={floorPlan}
                                                alt={`Floor Plan ${index + 1}`}
                                                className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-110 cursor-pointer"
                                                onClick={() => setFullScreenImage(floorPlan)}
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
                                                onClick={() => setFullScreenImage("https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600")}
                                            />
                                        </div>
                                        <div className="overflow-hidden rounded-lg">
                                            <img
                                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"
                                                alt="Floor Plan 2"
                                                className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-110 cursor-pointer"
                                                onClick={() => setFullScreenImage("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600")}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Promotional Banner Section - Mobile */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 mx-4 mb-20 scroll-animate" data-animation="animate-slide-top">
                    <div className="space-y-2">
                        {/* House Icon */}
                        <div className="flex justify-center scroll-animate" data-animation="animate-pop">
                            <div className="w-8 h-8 border-2 border-blue-600 rounded-lg flex items-center justify-center">
                                <Home className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="text-center">
                            <h2 className="text-sm font-bold text-blue-900 mb-2 leading-tight scroll-animate" data-animation="animate-pop">
                                Brokerage – Free Real Estate at Your Fingertips
                            </h2>

                            <p className="text-xs text-blue-800 leading-relaxed mb-3 scroll-animate" data-animation="animate-fade-up">
                                Find your dream home faster with our app—less searching, more living. Download now!
                            </p>

                            <div className="flex flex-col gap-2 scroll-animate" data-animation="animate-fade-up">
                                <button
                                    onClick={() => window.open('https://apps.apple.com', '_blank')}
                                    className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors shadow-lg cursor-pointer justify-center"
                                >
                                    <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
                                        <span className="text-black font-bold text-xs">🍎</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs">Download on the</div>
                                        <div className="font-bold text-xs">App Store</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => window.open('https://play.google.com', '_blank')}
                                    className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors shadow-lg cursor-pointer justify-center"
                                >
                                    <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
                                        <span className="text-black font-bold text-xs">▶</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs">GET IT ON</div>
                                        <div className="font-bold text-xs">Google Play</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-30" style={{ bottom: '60px' }}>
                <div className="flex gap-3">
                    <button
                        onClick={handleWhatsApp}
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
                        onClick={handleCall}
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
                    onClick={handleShowInterestModal}
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
                                    placeholder="Enter your name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="Enter phone number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Messages</label>
                                <textarea
                                    placeholder="Enter your message..."
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
                                    {property.reviews.map((review, index) => {
                                        // Check if this is the user's review - handle different phone field names
                                        const userPhone = currentUser?.phoneNumber || currentUser?.phone || currentUser?.userPhoneNumber;
                                        const reviewPhone = review.userPhoneNumber || review.userPhone || review.phoneNumber || review.phone;
                                        
                                        const isUserReview = userPhone && reviewPhone && normalizePhone(userPhone) === normalizePhone(reviewPhone);
                                        
                                        return (
                                            <div key={index} className="border-b pb-5 last:border-b-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900">{safeDisplay(review.user)}</span>
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`w-4 h-4 ${star <= (review.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isUserReview && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEditReview(review)}
                                                                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                                                    title="Edit review"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteReview(review)}
                                                                    className="text-red-600 hover:text-red-800 cursor-pointer"
                                                                    title="Delete review"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <span className="text-sm text-gray-500">{safeDisplay(review.date)}</span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed">{safeDisplay(review.comment)}</p>
                                            </div>
                                        );
                                    })}
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
                    <div className="bg-white rounded-xl w-full max-w-sm p-5">
                        {/* Title with underline */}
                        <div className="text-center mb-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-1.5">{isEditingReview ? 'Edit Your Review' : 'Rate Your Experience'}</h3>
                            <div className="w-24 h-0.5 bg-yellow-400 mx-auto"></div>
                        </div>

                        {/* Success Message */}
                        {reviewSubmitSuccess && (
                            <div className="mb-3 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg text-center text-sm">
                                {isEditingReview ? 'Review updated successfully!' : 'Review submitted successfully!'}
                            </div>
                        )}

                        {/* User Name Input */}
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

                        {/* Rating Section */}
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

                        {/* Review Text Area */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Review *</label>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Share your experience..."
                                required
                            />
                        </div>

                        {/* Action Buttons */}
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
                                    if (!reviewText.trim()) {
                                        alert('Please enter your review comment');
                                        return;
                                    }

                                    setIsSubmittingReview(true);
                                    setReviewSubmitSuccess(false);

                                    try {
                                        const propertyId = property._id || property.id;
                                        const propertyType = property.propertyType;
                                        const userPhoneNumber = currentUser?.phoneNumber || null;

                                        let response;
                                        if (isEditingReview && userReview) {
                                            // Edit existing review
                                            response = await fetch('/api/reviews', {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({
                                                    propertyId,
                                                    propertyType,
                                                    reviewId: userReview._id || userReview.id,
                                                    user: userName.trim(),
                                                    rating: selectedRating,
                                                    comment: reviewText.trim(),
                                                    userPhoneNumber
                                                }),
                                            });
                                        } else {
                                            // Create new review
                                            response = await fetch('/api/reviews', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({
                                                    propertyId,
                                                    propertyType,
                                                    user: userName.trim(),
                                                    rating: selectedRating,
                                                    comment: reviewText.trim(),
                                                    userPhoneNumber
                                                }),
                                            });
                                        }

                                        const data = await response.json();

                                        if (data.success) {
                                            // Refresh property data to get updated reviews
                                            const updatedProperty = await refreshPropertyData();
                                            
                                            // Check for user review in the updated property data
                                            if (updatedProperty && updatedProperty.reviews && currentUser) {
                                                const userPhone = currentUser.phoneNumber || currentUser.phone || currentUser.userPhoneNumber;
                                                if (userPhone) {
                                                    const normalizedUserPhone = normalizePhone(userPhone);
                                                    const userReviewFound = updatedProperty.reviews.find(review => {
                                                        const reviewPhone = review.userPhoneNumber || review.userPhone || review.phoneNumber || review.phone;
                                                        if (!reviewPhone) return false;
                                                        return normalizePhone(reviewPhone) === normalizedUserPhone;
                                                    });
                                                    
                                                    if (userReviewFound) {
                                                        setHasUserSubmittedReview(true);
                                                        setUserReview(userReviewFound);
                                                    }
                                                }
                                            }

                                            setReviewSubmitSuccess(true);

                                            // Close modal after showing success
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

            {/* Desktop Layout (md and above) */}
            <div className="hidden md:block">
                {/* Main Content */}
                <div className="w-full px-12 py-6">
                    <div className="mb-6 scroll-animate" data-animation="animate-pop">
                        <AnimatedText className="text-lg font-bold inline-block" lineColor="#f8c02f">
                            <h1>Showing Spaces in {safeDisplay(property.city) !== "-" ? safeDisplay(property.city) : (safeDisplay(property.address) !== "-" ? property.address?.split(',').pop()?.trim() : 'Delhi')}</h1>
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
                                    className="w-full h-full object-cover transition-transform duration-300 cursor-pointer"
                                    onClick={() => setFullScreenImage(property.images[currentImageIndex])}
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
                                        className="bg-black/30 backdrop-blur-sm text-white rounded-xl border-2 border-white/80 w-16 h-16 flex flex-col items-center justify-center hover:bg-black/40 transition-all duration-200 shadow-lg cursor-pointer rotate-12"
                                    >
                                        <span className="text-lg font-bold leading-none cursor-pointer">+{property.images.length - 1}</span>
                                        <span className="text-sm font-medium leading-none mt-0.5 cursor-pointer">More</span>
                                    </button>
                                </div>

                                {/* Bottom Right Counter Overlay - Shifted Right Side */}
                                <div className="absolute bottom-4 right-6 cursor-pointer">
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
                                        onClick={() => setFullScreenImage(property.images[1] || property.images[0])}
                                    />
                                </div>
                                <div className="aspect-square overflow-hidden rounded-xl cursor-pointer scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: '200ms' }}>
                                    <img
                                        src={property.images[2] || property.images[0]}
                                        alt="Thumbnail 2"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        onClick={() => setFullScreenImage(property.images[2] || property.images[0])}
                                    />
                                </div>
                                <div className="aspect-square overflow-hidden rounded-xl cursor-pointer scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: '300ms' }}>
                                    <img
                                        src={property.images[3] || property.images[0]}
                                        alt="Thumbnail 3"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        onClick={() => setFullScreenImage(property.images[3] || property.images[0])}
                                    />
                                </div>
                                <div className="aspect-square overflow-hidden rounded-xl cursor-pointer scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: '400ms' }}>
                                    <img
                                        src={property.images[4] || property.images[0]}
                                        alt="Thumbnail 4"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        onClick={() => setFullScreenImage(property.images[4] || property.images[0])}
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
                                <h2 className="text-xl font-bold mb-2 scroll-animate" data-animation="animate-pop">{safeDisplay(property.name)}</h2>
                                <p className="text-sm text-gray-600 mb-3 scroll-animate" data-animation="animate-fade-up">{safeDisplay(property.address)}</p>

                                {/* Price */}
                                <div className="flex items-center gap-3 mb-5 scroll-animate" data-animation="animate-fade-up">
                                    <span className="text-lg text-red-500 line-through">{safeDisplay(property.originalPrice)}</span>
                                    <img
                                        src="/property-details/right-arrow.png"
                                        alt="Arrow"
                                        className="w-8 h-8 object-contain"
                                    />
                                    <span className="text-xl font-bold">{safeDisplay(property.discountedPrice)}</span>
                                    <img
                                        src="/property-details/limited-offer.png"
                                        alt="Limited Time Offer"
                                        className="h-8 object-contain"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 mb-5 scroll-animate" data-animation="animate-fade-up">
                                    <button
                                        onClick={handleWhatsApp}
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
                                        onClick={handleCall}
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
                                                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-[9999]">
                                                            {amenity.name}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }) || <p className="text-gray-500 col-span-6">No amenities available</p>}
                                    </div>
                                </div>

                                {/* Opening Hours - Only for commercial properties */}
                                {property.propertyType === 'commercial' && property.openingHours && (
                                    <div className="mb-10">
                                        <AnimatedText className="text-lg font-bold mb-3 inline-block" delay={700} lineColor="#f8c02f">
                                            <h3>Opening Hours</h3>
                                        </AnimatedText>
                                        <div className="space-y-3 mt-5">
                                            {property.openingHours.mondayFriday && (
                                                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                                    <span className="text-base font-semibold text-gray-800">Monday - Friday</span>
                                                    <span className={`text-base font-semibold ${property.openingHours.mondayFriday.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                                        {property.openingHours.mondayFriday.enabled
                                                            ? (safeDisplay(property.openingHours.mondayFriday.open) === 'Open' && safeDisplay(property.openingHours.mondayFriday.close) === 'Close'
                                                                ? 'Open All Day'
                                                                : `${safeDisplay(property.openingHours.mondayFriday.open)} - ${safeDisplay(property.openingHours.mondayFriday.close)}`)
                                                            : 'Closed'}
                                                    </span>
                                                </div>
                                            )}
                                            {property.openingHours.saturday && (
                                                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                                    <span className="text-base font-semibold text-gray-800">Saturday</span>
                                                    <span className={`text-base font-semibold ${property.openingHours.saturday.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                                        {property.openingHours.saturday.enabled
                                                            ? (safeDisplay(property.openingHours.saturday.open) === 'Open' && safeDisplay(property.openingHours.saturday.close) === 'Close'
                                                                ? 'Open All Day'
                                                                : `${safeDisplay(property.openingHours.saturday.open)} - ${safeDisplay(property.openingHours.saturday.close)}`)
                                                            : 'Closed'}
                                                    </span>
                                                </div>
                                            )}
                                            {property.openingHours.sunday && (
                                                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                                    <span className="text-base font-semibold text-gray-800">Sunday</span>
                                                    <span className={`text-base font-semibold ${property.openingHours.sunday.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                                        {property.openingHours.sunday.enabled
                                                            ? (safeDisplay(property.openingHours.sunday.open) === 'Open' && safeDisplay(property.openingHours.sunday.close) === 'Close'
                                                                ? 'Open All Day'
                                                                : `${safeDisplay(property.openingHours.sunday.open)} - ${safeDisplay(property.openingHours.sunday.close)}`)
                                                            : 'Closed'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

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

                                    if (!currentUser) {
                                        setIsLoginOpen(true);
                                        return;
                                    }

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
                        </div>
                    </div>

                    {/* Full Width Sections - Location, Reviews, Layout, and Info */}
                    <div className="mt-6 space-y-6">

                        {/* Property Details - Residential - Full Width */}
                        {property.propertyType === 'residential' && (
                            <div className="bg-white rounded-2xl p-5 mb-6 scroll-animate" data-animation="animate-slide-top">
                                <AnimatedText className="text-lg font-bold mb-3 inline-block" delay={700} lineColor="#f8c02f">
                                    <h3>Property Details</h3>
                                </AnimatedText>
                                <div className="grid grid-cols-3 gap-4 mt-5">
                                    {(property.category || property.Category) && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Category</span>
                                            <span className="text-base font-semibold text-gray-800 capitalize">{safeDisplay(property.category || property.Category)}</span>
                                        </div>
                                    )}
                                    {property.selectedType && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Type</span>
                                            <span className="text-base font-semibold text-gray-800 capitalize">{safeDisplay(property.selectedType)}</span>
                                        </div>
                                    )}
                                    {property.availableFor && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Available For</span>
                                            <span className="text-base font-semibold text-gray-800 capitalize">{safeDisplay(property.availableFor)}</span>
                                        </div>
                                    )}
                                    {property.bhkType && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">BHK Type</span>
                                            <span className="text-base font-semibold text-gray-800 uppercase">{safeDisplay(property.bhkType)}</span>
                                        </div>
                                    )}
                                    {property.apartmentType && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Apartment Type</span>
                                            <span className="text-base font-semibold text-gray-800 capitalize">{safeDisplay(property.apartmentType) !== "-" ? safeDisplay(property.apartmentType).replace(/-/g, ' ') : "-"}</span>
                                        </div>
                                    )}
                                    {property.facing && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Facing</span>
                                            <span className="text-base font-semibold text-gray-800 capitalize">{safeDisplay(property.facing) !== "-" ? safeDisplay(property.facing).replace(/-/g, ' ') : "-"}</span>
                                        </div>
                                    )}
                                    {property.propertyAge && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Property Age</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.propertyAge) !== "-" ? `${safeDisplay(property.propertyAge)} Years` : "-"}</span>
                                        </div>
                                    )}
                                    {property.propertySize && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Property Size</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.propertySize) !== "-" ? `${safeDisplay(property.propertySize)} sq.ft` : "-"}</span>
                                        </div>
                                    )}
                                    {property.carpetArea && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Carpet Area</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.carpetArea) !== "-" ? `${safeDisplay(property.carpetArea)} sq.ft` : "-"}</span>
                                        </div>
                                    )}
                                    {(property.floor || property.totalFloors) && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Floor</span>
                                            <span className="text-base font-semibold text-gray-800">
                                                {safeDisplay(property.floor) !== "-" ? safeDisplay(property.floor) : ''}{safeDisplay(property.totalFloors) !== "-" ? ` of ${safeDisplay(property.totalFloors)}` : ''}
                                            </span>
                                        </div>
                                    )}
                                    {property.furnishing && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Furnishing</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.furnishing)}</span>
                                        </div>
                                    )}
                                    {property.parking && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Parking</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.parking)}</span>
                                        </div>
                                    )}
                                    {property.bathrooms !== undefined && property.bathrooms !== null && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Bathrooms</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.bathrooms)}</span>
                                        </div>
                                    )}
                                    {property.balconies !== undefined && property.balconies !== null && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Balconies</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.balconies)}</span>
                                        </div>
                                    )}
                                    {property.availableFrom && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Available From</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.availableFrom) !== "-" ? (typeof property.availableFrom === 'string' ? property.availableFrom : new Date(property.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })) : "-"}</span>
                                        </div>
                                    )}
                                    {property.monthlyMaintenance && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Maintenance</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.monthlyMaintenance)}</span>
                                        </div>
                                    )}
                                    {property.expectedDeposit && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Security Deposit</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.expectedDeposit) !== "-" ? `₹${Number(property.expectedDeposit).toLocaleString('en-IN')}` : "-"}</span>
                                        </div>
                                    )}
                                    {property.isNegotiable !== undefined && property.isNegotiable !== null && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Negotiable</span>
                                            <span className={`text-base font-semibold ${property.isNegotiable ? 'text-green-600' : 'text-red-600'}`}>
                                                {property.isNegotiable ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    )}
                                    {property.gatedSecurity !== undefined && property.gatedSecurity !== null && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Gated Security</span>
                                            <span className={`text-base font-semibold ${property.gatedSecurity ? 'text-green-600' : 'text-red-600'}`}>
                                                {property.gatedSecurity ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    )}
                                    {property.gym !== undefined && property.gym !== null && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Gym</span>
                                            <span className={`text-base font-semibold ${property.gym ? 'text-green-600' : 'text-red-600'}`}>
                                                {property.gym ? 'Available' : 'Not Available'}
                                            </span>
                                        </div>
                                    )}
                                    {property.nonVegAllowed !== undefined && property.nonVegAllowed !== null && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Non-Veg Allowed</span>
                                            <span className={`text-base font-semibold ${property.nonVegAllowed ? 'text-green-600' : 'text-red-600'}`}>
                                                {property.nonVegAllowed ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    )}
                                    {property.waterSupply && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Water Supply</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.waterSupply)}</span>
                                        </div>
                                    )}
                                    {property.currentSituation && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Current Situation</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.currentSituation)}</span>
                                        </div>
                                    )}
                                    {property.directionsTip && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate col-span-3" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Directions Tip</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.directionsTip)}</span>
                                        </div>
                                    )}
                                    {property.whoWillShow && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Who Will Show</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.whoWillShow)}</span>
                                        </div>
                                    )}
                                    {property.builder && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Builder Name</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.builder)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Property Details - Commercial - Full Width */}
                        {property.propertyType === 'commercial' && (
                            <div className="bg-white rounded-2xl p-5 mb-6 scroll-animate" data-animation="animate-slide-top">
                                <AnimatedText className="text-lg font-bold mb-3 inline-block" delay={700} lineColor="#f8c02f">
                                    <h3>Property Details</h3>
                                </AnimatedText>
                                <div className="grid grid-cols-3 gap-4 mt-5">
                                    {(property.category || property.Category) && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Category</span>
                                            <span className="text-base font-semibold text-gray-800 capitalize">{safeDisplay(property.category || property.Category)}</span>
                                        </div>
                                    )}
                                    {(property.displayPropertyType || property.propertyType) && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Property Type</span>
                                            <span className="text-base font-semibold text-gray-800 capitalize">{safeDisplay(property.displayPropertyType || property.propertyType)}</span>
                                        </div>
                                    )}
                                    {property.isUnderManagement && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Under Management</span>
                                            <span className={`text-base font-semibold ${property.isUnderManagement === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                                                {property.isUnderManagement === 'yes' ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    )}
                                    {property.selectedFloors && property.selectedFloors.length > 0 && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate col-span-3" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Available Floors</span>
                                            <span className="text-base font-semibold text-gray-800">{property.selectedFloors.join(', ')}</span>
                                        </div>
                                    )}
                                    {property.floorConfigurations && property.floorConfigurations.length > 0 && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate col-span-3" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-2">Office Space Solutions</span>
                                            <div className="space-y-2">
                                                {property.floorConfigurations.map((config, idx) => (
                                                    <div key={idx} className="text-sm">
                                                        {config.floor && <span className="font-semibold text-gray-800">Floor {config.floor}: </span>}
                                                        {config.dedicatedCabin?.enabled && (
                                                            <span className="text-gray-700">Dedicated Cabin ({config.dedicatedCabin.seats || 'N/A'} seats, {config.dedicatedCabin.pricePerSeat || 'N/A'}/seat)</span>
                                                        )}
                                                        {config.dedicatedFloor?.enabled && (
                                                            <span className="text-gray-700 ml-2">Dedicated Floor ({config.dedicatedFloor.seats || 'N/A'} seats, {config.dedicatedFloor.pricePerSeat || 'N/A'}/seat)</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {property.facilities && property.facilities.length > 0 && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate col-span-3" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Facilities</span>
                                            <span className="text-base font-semibold text-gray-800">{property.facilities.join(', ')}</span>
                                        </div>
                                    )}
                                    {property.builder && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Builder Name</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.builder)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

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
                                                <h4 className="font-medium text-sm text-gray-900">{safeDisplay(place.name)}</h4>
                                                <p className="text-xs text-gray-500">{safeDisplay(place.location)}</p>
                                            </div>
                                            <span className="text-xs text-gray-500">{safeDisplay(place.distance)}</span>
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
                        <div ref={reviewsRef} className="bg-white rounded-2xl p-5 mb-6 scroll-animate" data-animation="animate-slide-top">
                            <div className="flex items-center justify-between mb-5">
                                <AnimatedText className="text-lg font-bold inline-block" delay={1500} lineColor="#f8c02f">
                                    <h3>Rating & Reviews</h3>
                                </AnimatedText>
                                <div className="flex gap-3">
                                    {!hasUserSubmittedReview && (
                                        <button
                                            onClick={handleAddReview}
                                            className="bg-[#f8c02f] text-gray-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#e0ad2a] cursor-pointer transition-colors"
                                        >
                                            Add Review
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowReviewsModal(true)}
                                        className="text-blue-600 font-medium text-sm hover:underline cursor-pointer"
                                    >
                                        View All
                                    </button>
                                </div>
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
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const getBreakdownCount = (star) => {
                                        if (!property.ratings?.breakdown) return 0;
                                        // Handle both Map and object formats
                                        const breakdown = property.ratings.breakdown;
                                        return breakdown[star] || breakdown[String(star)] || 0;
                                    };
                                    const count = getBreakdownCount(star);
                                    const percentage = property.ratings?.totalRatings ? (count / property.ratings.totalRatings) * 100 : 0;

                                    return (
                                        <div key={star} className="flex items-center gap-3">
                                            <span className="text-xs font-medium w-14">{star} Star</span>
                                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-yellow-400 h-1.5 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium w-6">{count}</span>
                                        </div>
                                    );
                                })}
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
                                                if (!currentUser) {
                                                    setIsLoginOpen(true);
                                                    return;
                                                }
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
                                                if (!currentUser) {
                                                    setIsLoginOpen(true);
                                                    return;
                                                }
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

                        {/* Property Videos Section - Full Width */}
                        {property.propertyVideos && property.propertyVideos.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 mb-6 scroll-animate" data-animation="animate-slide-top">
                                <AnimatedText className="text-lg font-bold mb-3 inline-block" delay={1700} lineColor="#f8c02f">
                                    <h3>Property Videos</h3>
                                </AnimatedText>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                                    {property.propertyVideos.map((video, i) => {
                                        const mimeType = getVideoMimeType(video.url, video.contentType);
                                        return (
                                            <div key={i} className="relative rounded-lg overflow-hidden bg-black scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                                                <video
                                                    controls
                                                    preload="metadata"
                                                    className="w-full h-64 object-contain"
                                                    poster={video.thumbnail}
                                                >
                                                    <source src={video.url} type={mimeType} />
                                                    <source src={video.url} type="video/mp4" />
                                                    <source src={video.url} type="video/webm" />
                                                    Your browser does not support the video tag.
                                                </video>
                                                {video.originalName && (
                                                    <p className="text-sm text-gray-700 mt-2 px-2 font-medium">{video.originalName}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Property PDFs Section - Full Width - Only for commercial properties */}
                        {property.propertyType === 'commercial' && property.seatLayoutPDFs && property.seatLayoutPDFs.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 mb-6 scroll-animate" data-animation="animate-slide-top">
                                <AnimatedText className="text-lg font-bold mb-3 inline-block" delay={1800} lineColor="#f8c02f">
                                    <h3>Property Documents</h3>
                                </AnimatedText>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                                    {property.seatLayoutPDFs.map((pdf, i) => (
                                        <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-5 scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-semibold text-gray-900 truncate">
                                                            {pdf.originalName || pdf.filename || `Document ${i + 1}`}
                                                        </p>
                                                        {pdf.size && (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {(pdf.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedPDF(pdf)}
                                                    className="ml-4 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
                                                >
                                                    View PDF
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Property Layout Section - Full Width - Only show for commercial properties */}
                        {property.propertyType === 'commercial' && (
                            <div ref={layoutRef} className="bg-white rounded-2xl p-5 mb-6 scroll-animate" data-animation="animate-slide-top">
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
                                                    onClick={() => setFullScreenImage(floorPlan)}
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
                                                    onClick={() => setFullScreenImage("https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600")}
                                                />
                                            </div>
                                            <div className="overflow-hidden rounded-lg">
                                                <img
                                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"
                                                    alt="Floor Plan 2"
                                                    className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-110 cursor-pointer"
                                                    onClick={() => setFullScreenImage("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600")}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
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
                                        {property.reviews.map((review, index) => {
                                            // Check if this is the user's review - handle different phone field names
                                            const userPhone = currentUser?.phoneNumber || currentUser?.phone || currentUser?.userPhoneNumber;
                                            const reviewPhone = review.userPhoneNumber || review.userPhone || review.phoneNumber || review.phone;
                                            
                                            const isUserReview = userPhone && reviewPhone && normalizePhone(userPhone) === normalizePhone(reviewPhone);
                                            
                                            return (
                                                <div key={index} className="border-b pb-6 last:border-b-0">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-semibold text-gray-900 text-base">{safeDisplay(review.user)}</span>
                                                            <div className="flex">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`w-5 h-5 ${star <= (review.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {isUserReview && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleEditReview(review)}
                                                                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                                                        title="Edit review"
                                                                    >
                                                                        <Edit className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteReview(review)}
                                                                        className="text-red-600 hover:text-red-800 cursor-pointer"
                                                                        title="Delete review"
                                                                    >
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <span className="text-sm text-gray-500">{safeDisplay(review.date)}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 text-base leading-relaxed">{safeDisplay(review.comment)}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-10">No reviews available</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Rating Submit Modal - Desktop (Same as Mobile) */}
                {showRatingModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl w-full max-w-sm p-5">
                            {/* Title with underline */}
                            <div className="text-center mb-5">
                                <h3 className="text-lg font-bold text-gray-800 mb-1.5">{isEditingReview ? 'Edit Your Review' : 'Rate Your Experience'}</h3>
                                <div className="w-24 h-0.5 bg-yellow-400 mx-auto"></div>
                            </div>

                            {/* Success Message */}
                            {reviewSubmitSuccess && (
                                <div className="mb-3 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg text-center text-sm">
                                    {isEditingReview ? 'Review updated successfully!' : 'Review submitted successfully!'}
                                </div>
                            )}

                            {/* User Name Input */}
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

                            {/* Rating Section */}
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

                            {/* Review Text Area */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Review *</label>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Share your experience..."
                                    required
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRatingModal(false);
                                        setIsEditingReview(false);
                                        setSelectedRating(0);
                                        setReviewText('');
                                        setUserName('');
                                        setReviewSubmitSuccess(false);
                                    }}
                                    className="flex-1 bg-transparent border-2 border-[#f8c02f] text-gray-800 py-2 rounded-lg font-medium text-sm hover:bg-[#f8c02f]/10 transition-colors cursor-pointer"
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
                                            const propertyType = property.propertyType;
                                            const userPhoneNumber = currentUser?.phoneNumber || null;

                                            let response;
                                            if (isEditingReview && userReview) {
                                                // Edit existing review
                                                response = await fetch('/api/reviews', {
                                                    method: 'PUT',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        propertyId,
                                                        propertyType,
                                                        reviewId: userReview._id || userReview.id,
                                                        user: userName.trim(),
                                                        rating: selectedRating,
                                                        comment: reviewText.trim(),
                                                        userPhoneNumber
                                                    }),
                                                });
                                            } else {
                                                // Create new review
                                                response = await fetch('/api/reviews', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        propertyId,
                                                        propertyType,
                                                        user: userName.trim(),
                                                        rating: selectedRating,
                                                        comment: reviewText.trim(),
                                                        userPhoneNumber
                                                    }),
                                                });
                                            }

                                            const data = await response.json();

                                            if (data.success) {
                                                // Refresh property data to get updated reviews
                                                const updatedProperty = await refreshPropertyData();
                                                
                                                // Check for user review in the updated property data
                                                if (updatedProperty && updatedProperty.reviews && currentUser) {
                                                    const userPhone = currentUser.phoneNumber || currentUser.phone || currentUser.userPhoneNumber;
                                                    if (userPhone) {
                                                        const normalizedUserPhone = normalizePhone(userPhone);
                                                        const userReviewFound = updatedProperty.reviews.find(review => {
                                                            const reviewPhone = review.userPhoneNumber || review.userPhone || review.phoneNumber || review.phone;
                                                            if (!reviewPhone) return false;
                                                            return normalizePhone(reviewPhone) === normalizedUserPhone;
                                                        });
                                                        
                                                        if (userReviewFound) {
                                                            setHasUserSubmittedReview(true);
                                                            setUserReview(userReviewFound);
                                                        }
                                                    }
                                                }

                                                setReviewSubmitSuccess(true);

                                                // Close modal after showing success
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
                                    className="flex-1 bg-[#f8c02f] text-gray-800 py-2 rounded-lg font-medium text-sm hover:bg-[#e0ad2a] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmittingReview || !selectedRating || !userName.trim() || !reviewText.trim()}
                                >
                                    {isSubmittingReview ? (isEditingReview ? 'Updating...' : 'Submitting...') : (isEditingReview ? 'Update Rating' : 'Submit Rating')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Full Screen Image Modal */}
            {fullScreenImage && (
                <div
                    className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4"
                    onClick={() => setFullScreenImage(null)}
                >
                    <button
                        onClick={() => setFullScreenImage(null)}
                        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl font-bold transition-colors z-[10000]"
                    >
                        ✕
                    </button>
                    <img
                        src={fullScreenImage}
                        alt="Full screen view"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* PDF Viewer Modal */}
            {selectedPDF && (
                <PDFViewer
                    pdf={selectedPDF}
                    onClose={() => setSelectedPDF(null)}
                />
            )}

            {/* Login Modal */}
            {isLoginOpen && (
                <LoginModal
                    onClose={() => setIsLoginOpen(false)}
                    onProceed={handleLoginSuccess}
                />
            )}
        </div >
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




