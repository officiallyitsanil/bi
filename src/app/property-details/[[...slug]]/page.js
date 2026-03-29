"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import {
    Share2,
    CornerUpRight,
    SquareArrowOutUpRight,
    Home,
    Star,
    ThumbsUp,
    ThumbsDown,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    CircleCheckBig,
    Wrench,
    MessageCircle,
    Heart,
    Edit,
    Trash2,
    MapPin,
    Building2,
    Armchair,
    Building,
    Users,
    User,
    UserCheck,
    DoorClosed,
    ConciergeBell,
    Coffee,
    Gamepad2,
    CirclePlay,
    Camera,
    Briefcase,
    Banknote,
    School,
    Phone,
    Mail,
    BadgePercent,
    Info,
    ArrowRight,
    ArrowLeft,
    Check,
    Hotel,
    Hospital,
    BellRing,
    Package,
    Siren,
    KeyRound,
    CupSoda,
    GlassWater,
    Milk,
    CirclePlus,
    Video,
    Clock,
    Car,
    ArrowDown,
    Calendar,
    X,
    Wifi,
    Footprints
} from "lucide-react";
import PDFViewer from "@/components/PDFViewer";
import GoogleMap from "@/components/GoogleMap";
import LoginModal from "@/components/LoginModal";
import PlacesAutocompleteInput from "@/components/PlacesAutocompleteInput";
import { loginUser } from "@/utils/auth";
import { AMENITY_CATEGORY_ORDER, AMENITY_CATEGORY_LABELS, getAmenityCategory, mapAmenityToObject } from "@/utils/amenityMapping";
import Link from "next/link";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "../animations.css";
import "../property-details.css";
import { calculatePrices } from "@/utils/priceUtils";

// Dummy data for nearby landmarks (extended array when API returns empty)
const NEARBY_CATEGORIES = [
    { id: "school", label: "Schools", icon: "school", localIcon: "/property-details/view-in-map/schools.svg" },
    { id: "bus", label: "Bus Stops", icon: "building", localIcon: "/property-details/view-in-map/bus-stops.svg" },
    { id: "hospital", label: "Hospitals", icon: "hospital", localIcon: "/property-details/view-in-map/hospitals.svg" },
    { id: "bank", label: "Banks", icon: "banknote", localIcon: "/property-details/view-in-map/banks.svg" },
    { id: "temple", label: "Temples", icon: "building2", localIcon: "/property-details/view-in-map/temples.svg" },
    { id: "atm", label: "ATMs", icon: "briefcase", localIcon: "/property-details/view-in-map/atms.svg" },
    { id: "mall", label: "Malls", icon: "hotel" },
];
// Defaults for icon fallbacks
const DEFAULT_AMENITY_ICON = "/amenities/security.svg";
const DEFAULT_CUSTOM_INFRA_ICON = "/custom-infra/Meeting%20Room.svg";

function getCustomInfraIconSrc(name, fallbackId) {
    if (!name) return DEFAULT_CUSTOM_INFRA_ICON;
    const n = String(name).toLowerCase();

    if (n.includes("meeting") && n.includes("room")) return "/custom-infra/Meeting%20Room.svg";
    if (n.includes("private") && n.includes("cabin")) return "/custom-infra/Private%20Cabin.svg";
    if (n.includes("reception") && n.includes("area")) return "/custom-infra/Reception%20Area.svg";
    // Filename casing in assets: `Recreational area.svg`
    if (n.includes("recreational") && n.includes("area")) return "/custom-infra/Recreational%20area.svg";
    if (n.includes("pantry")) return "/custom-infra/Pantry.svg";

    // Last-resort (only if backend provides numeric ids matching filenames)
    if (fallbackId != null) return `/custom-infra/${fallbackId}.svg`;

    return DEFAULT_CUSTOM_INFRA_ICON;
}

function resolveCorporateLogoSrc(val) {
    if (!val) return null;
    let str = String(val).trim();
    if (!str) return null;

    // Common dummy-value cleanup (e.g. "Dell.url")
    str = str.replace(/^\./, "").trim();
    str = str.replace(/\.url$/i, "").trim();

    // If it's already a URL or a local path, use it as-is.
    if (/^https?:\/\//i.test(str)) {
        // If the URL points to a corporates-logo SVG, convert it to our local public path.
        const match = str.match(/\/([^\/?#]+\.svg)(?:[?#]|$)/i) || str.match(/\/([^\/?#]+\.svg)$/i);
        if (match?.[1]) {
            try {
                const decoded = decodeURIComponent(match[1]);
                return `/corporates-logo/${encodeURIComponent(decoded)}`;
            } catch {
                // Fall through to null
            }
        }
        return str;
    }
    if (str.startsWith("/")) return str;

    // If backend provides just a filename like `Dell.svg`
    if (str.toLowerCase().endsWith(".svg")) {
        return `/corporates-logo/${str}`;
    }

    // Normalize to match our small set of available logos.
    const key = str.toLowerCase().replace(/\s+/g, "");
    const fileByKey = {
        "dell": "Dell.svg",
        "hp": "Hp.svg",
        "ge": "GE.svg",
        "pepsi": "Pepsi.svg",
        "p&g": "p&G.svg",
    };

    const file = fileByKey[key];
    if (!file) return null;

    // Encode for filenames with `&` (e.g. `p&G.svg`)
    return `/corporates-logo/${encodeURIComponent(file)}`;
}

function getCorporateLogoDisplayName(val) {
    if (!val) return "";
    let str = String(val).trim();
    str = str.replace(/\.url$/i, "").replace(/^\./, "").trim();

    // If it's a URL or path, use last segment
    const seg = str.split("/").pop() || str;
    // Remove query/hash
    const noQ = seg.split("?")[0].split("#")[0];
    // Remove .svg extension
    const noExt = noQ.replace(/\.svg$/i, "");

    try {
        return decodeURIComponent(noExt);
    } catch {
        return noExt;
    }
}

// Helper function to safely display database values
const safeDisplay = (value, fallback = "-") => {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }
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
    const [activeCategory, setActiveCategory] = useState('schools');
    const [showModal, setShowModal] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [property, setProperty] = useState(null);
    const [showMoreNearby, setShowMoreNearby] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewGoodThings, setReviewGoodThings] = useState('');
    const [reviewBadThings, setReviewBadThings] = useState('');
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [interestFormData, setInterestFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
        companyName: "",
        numberOfSeats: "",
        preferredCallbackTime: "",
        interestType: "",
    });
    const [interestFormType, setInterestFormType] = useState("property");
    const [interestFormErrors, setInterestFormErrors] = useState({});
    const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);
    const [showSuccessTooltip, setShowSuccessTooltip] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
    const [userName, setUserName] = useState('');
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const [showAllPhotosModal, setShowAllPhotosModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [galleryInlineVideoActive, setGalleryInlineVideoActive] = useState(false);
    const galleryInlineVideoRef = useRef(null);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedPDF, setSelectedPDF] = useState(null);
    const [showDownloadBrochureModal, setShowDownloadBrochureModal] = useState(false);
    const [pendingBrochureUrl, setPendingBrochureUrl] = useState("");
    const [hasUserSubmittedReview, setHasUserSubmittedReview] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [isEditingReview, setIsEditingReview] = useState(false);
    const [showBrandDescription, setShowBrandDescription] = useState(false);
    const [selectedTourDate, setSelectedTourDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [tourType, setTourType] = useState("in-person");
    const [tourFormData, setTourFormData] = useState({ name: "", phone: "", email: "", message: "" });
    const [selectedTourTime, setSelectedTourTime] = useState("");
    const [showTimeDropdown, setShowTimeDropdown] = useState(false);
    const [similarLocationFilter, setSimilarLocationFilter] = useState("Koramangala");
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [showStickyHeader, setShowStickyHeader] = useState(false);
    const [showTourModal, setShowTourModal] = useState(false);
    const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
    const [isSubmittingTour, setIsSubmittingTour] = useState(false);
    const [tourFormErrors, setTourFormErrors] = useState({});
    const [sliderBanner, setSliderBanner] = useState({ show: false, msg: "" });
    const sliderBannerTimerRef = useRef(null);
    const [travelOrigin, setTravelOrigin] = useState(null);
    const [travelOriginInput, setTravelOriginInput] = useState("");
    const [travelResults, setTravelResults] = useState([]);
    const [travelLoading, setTravelLoading] = useState(false);
    const [travelError, setTravelError] = useState("");
    const handleSliderNavClick = (e, isPrev) => {
        if (e.currentTarget.classList.contains("swiper-button-disabled")) {
            setSliderBanner({ show: true, msg: isPrev ? "First slide" : "No more slides" });
            if (sliderBannerTimerRef.current) clearTimeout(sliderBannerTimerRef.current);
            sliderBannerTimerRef.current = setTimeout(() => setSliderBanner((s) => ({ ...s, show: false })), 2000);
        }
    };

    const handleTourInputChange = (e) => {
        const { name, value } = e.target;
        setTourFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleInterestInputChange = (e) => {
        const { name, value } = e.target;
        setInterestFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateTourForm = () => {
        const err = {};
        if (!tourFormData.name?.trim()) err.name = "Name is required";
        if (!selectedTourTime) err.tourTime = "Please select a tour time";
        if (tourFormData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tourFormData.email)) err.email = "Enter a valid email";
        setTourFormErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleTourSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateTourForm()) return;
        try {
            setIsSubmittingTour(true);
            const res = await fetch('/api/properties/schedule-tour', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...tourFormData,
                    tourDate: selectedTourDate,
                    tourTime: selectedTourTime,
                    tourType: tourType,
                    propertyId: property?._id,
                    propertyName: property?.name,
                    propertyType: property?.propertyType || 'commercial',
                }),
            });
            const data = await res.json();
            if (data.success) {
                setTourFormData({ name: "", phone: "", email: "", message: "" });
                setSelectedTourTime("");
                setTourFormErrors({});
                setShowTourModal(false);
                alert(data.message || 'Submitted successfully!');
            } else {
                setTourFormErrors({ submit: data.message || data.error || 'Failed to submit. Please try again.' });
            }
        } catch (err) {
            console.error('Error scheduling tour:', err);
            setTourFormErrors({ submit: 'An error occurred. Please try again.' });
        } finally {
            setIsSubmittingTour(false);
        }
    };
    const locationFilterRef = useRef(null);
    const locationDropdownRef = useRef(null);
    const timeDropdownRef = useRef(null);

    const router = useRouter();

    const TOUR_TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

    useEffect(() => {
        const locs = property?.similarLocations;
        if (locs?.length) {
            setSimilarLocationFilter(prev => (prev && locs.includes(prev)) ? prev : locs[0]);
        }
    }, [property?.similarLocations]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (timeDropdownRef.current && !timeDropdownRef.current.contains(e.target)) setShowTimeDropdown(false);
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) setShowLocationDropdown(false);
        };
        if (showTimeDropdown || showLocationDropdown) document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [showTimeDropdown, showLocationDropdown]);

    useEffect(() => {
        return () => {
            if (sliderBannerTimerRef.current) clearTimeout(sliderBannerTimerRef.current);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowStickyHeader(true);
            } else {
                setShowStickyHeader(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Generate dates for tour scheduling (next 14 days)
    const tourDates = [...Array(14)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });
    const searchParams = useSearchParams();
    const params = useParams();

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

        // Check reviews - handle different possible field names (DB: reviews)
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
            const idParamFromQuery = searchParams.get('id');
            const typeParam = searchParams.get('type');
            
            // Handle slug for SEO-friendly URL: /property-details/[property-name]
            const slug = params?.slug;
            let slugString = "";
            if (Array.isArray(slug)) {
                slugString = slug.join('/');
            } else if (typeof slug === 'string') {
                slugString = slug;
            }

            // The slug IS the property name (normalized with hyphens)
            const idParam = idParamFromQuery; // No ID from slug anymore
            const nameParam = !idParam ? (slugString || searchParams.get('name')) : null;

            if (!idParam && !nameParam) {
                console.error('No property ID or Name provided');
                return;
            }

            try {
                let apiUrl = "";
                if (idParam) {
                    apiUrl = `/api/properties?id=${idParam}&type=${typeParam || ''}`;
                } else if (nameParam) {
                    apiUrl = `/api/properties?name=${encodeURIComponent(nameParam)}&type=${typeParam || ''}`;
                }

                const response = await fetch(apiUrl);

                const data = await response.json();

                if (data.success && data.property) {
                    // Increment visitor count
                    try {
                        await fetch('/api/properties/visitor-count', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                id: idParam,
                                type: typeParam || data.property.propertyCategory || data.property.propertyType || 'commercial'
                            }),
                        });
                    } catch (error) {
                        console.error('Error incrementing visitor count:', error);
                    }

                    const p = data.property;
                    const coord = p.coordinates || p.position;
                    const lat = coord?.latitude ?? coord?.lat;
                    const lng = coord?.longitude ?? coord?.lng;
                    const position = lat != null && lng != null ? { lat: parseFloat(lat), lng: parseFloat(lng) } : (coord ?? null);
                    const formattedProperty = {
                        ...p,
                        id: String(p._id || p.id),
                        _id: String(p._id || p.id),
                        position,
                        coordinates: position ?? coord,
                        amenities: p.amenities || [],
                        images: Array.isArray(p.images) ? p.images : (Array.isArray(p.interiorImages) ? p.interiorImages.map((i) => (i && typeof i === 'object' && i.url) ? i.url : (typeof i === 'string' ? i : '')).filter(Boolean) : [])
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

    // Map configuration - normalized coords use lat/lng (DB: coordinates.latitude/longitude)
    const coord = property?.coordinates || property?.position;
    const mapCenter = property && coord ? { lat: coord.lat ?? coord.latitude, lng: coord.lng ?? coord.longitude } : { lat: 28.6139, lng: 77.2090 };
    const mapZoom = 14; // Match main map ZOOM_LOCATION for consistent scale

    const openGoogleMaps = () => {
        const c = property?.coordinates || property?.position;
        const lat = c?.latitude ?? c?.lat;
        const lng = c?.longitude ?? c?.lng;
        if (lat != null && lng != null) {
            window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank', 'noopener,noreferrer');
        }
    };

    const mapLinkLat = coord?.latitude ?? coord?.lat;
    const mapLinkLng = coord?.longitude ?? coord?.lng;
    const mapsExternalUrl =
        mapLinkLat != null && mapLinkLng != null
            ? `https://maps.google.com/maps?q=${mapLinkLat},${mapLinkLng}&z=14&t=h`
            : null;
    const propertyIdForLink = property?._id ?? property?.id;
    const typeParam = searchParams.get("type");
    const propertyDetailsFullUrl =
        propertyIdForLink != null
            ? `/property-details?id=${propertyIdForLink}${typeParam ? `&type=${encodeURIComponent(typeParam)}` : ""}`
            : null;

    const handleTravelOriginSelect = useCallback((place) => {
        setTravelOrigin(place);
        setTravelOriginInput(place?.description || "");
        setTravelError("");
    }, []);

    const handleShowTravelTime = useCallback(async () => {
        if (travelOrigin?.lat == null || travelOrigin?.lng == null) {
            setTravelError("Please select a starting point to calculate travel time.");
            return;
        }
        const c = property?.coordinates || property?.position;
        const destLat = c?.latitude ?? c?.lat;
        const destLng = c?.longitude ?? c?.lng;
        if (destLat == null || destLng == null) {
            setTravelError("Property location is not available.");
            return;
        }
        const originDesc = (travelOrigin.description || "").trim();
        const alreadyShown = travelResults.some(
            (r) => (r.originAddress && originDesc && r.originAddress.trim() === originDesc) || (r.originLatLng === `${travelOrigin.lat},${travelOrigin.lng}`)
        );
        if (alreadyShown) {
            setTravelError("Travel time for this starting point is already shown.");
            return;
        }
        setTravelError("");
        setTravelLoading(true);
        const originStr = `${travelOrigin.lat},${travelOrigin.lng}`;
        const destStr = `${destLat},${destLng}`;
        try {
            const [driveRes, walkRes] = await Promise.all([
                fetch("/api/distance-matrix", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ origin: originStr, destination: destStr, mode: "driving" }),
                }).then((r) => r.json()),
                fetch("/api/distance-matrix", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ origin: originStr, destination: destStr, mode: "walking" }),
                }).then((r) => r.json()),
            ]);
            if (!driveRes.success || !walkRes.success) {
                setTravelError(driveRes.error || walkRes.error || "Unable to calculate travel time.");
                return;
            }
            const driving = driveRes.duration && driveRes.distance ? { duration: driveRes.duration, distance: driveRes.distance } : null;
            const walking = walkRes.duration && walkRes.distance ? { duration: walkRes.duration, distance: walkRes.distance } : null;
            if (!driving && !walking) {
                setTravelError("No route found between these locations.");
                return;
            }
            const newResult = {
                originAddress: driveRes.origin_addresses?.[0] || travelOrigin.description,
                originLatLng: `${travelOrigin.lat},${travelOrigin.lng}`,
                driving,
                walking,
            };
            setTravelResults((prev) => [...prev, newResult]);
        } catch (err) {
            setTravelError(err.message || "Something went wrong.");
        } finally {
            setTravelLoading(false);
        }
    }, [travelOrigin, property, travelResults]);



    const isCommercial = property?.propertyCategory === 'commercial' || (property?.propertyType && property.propertyType !== 'residential');
    const isResidential = property?.propertyCategory === 'residential' || property?.propertyType === 'residential';

    const tabs = [
        { id: 'amenities', label: 'Amenities' },
        { id: 'location', label: 'Location & Landmark' },
        { id: 'reviews', label: 'Rating & Reviews' },
        ...(isCommercial ? [{ id: 'layout', label: 'Property Layout' }] : [])
    ];

    const images = property?.images ?? [];
    const galleryVideoUrl = property?.propertyVideos?.[0]?.url || property?.video;
    const galleryVideoContentType = property?.propertyVideos?.[0]?.contentType;
    const galleryVideoThumb = property?.propertyVideos?.[0]?.thumbnail || images[2] || images[0];

    useEffect(() => {
        setGalleryInlineVideoActive(false);
    }, [property?._id, property?.id]);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % Math.max(1, images.length));
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + Math.max(1, images.length)) % Math.max(1, images.length));
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
        const c = property?.coordinates || property?.position;
        const lat = c?.latitude ?? c?.lat;
        const lng = c?.longitude ?? c?.lng;
        const mapUrl = (lat != null && lng != null) ? `https://www.google.com/maps?q=${lat},${lng}` : window.location.href;
        navigator.clipboard.writeText(mapUrl).then(() => {
            alert(lat != null && lng != null ? 'Location link copied to clipboard!' : 'Link copied to clipboard!');
        }).catch(() => {
            alert('Could not copy. Please copy the link manually.');
        });
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

    // Agent contact - DB: agentDetails (phone, email, whatsapp)
    const agentContactPhone = property?.agentDetails?.phone || property?.agentPhone || property?.sellerPhoneNumber;
    const agentContactWhatsApp = property?.agentDetails?.whatsapp || property?.agentDetails?.phone || property?.agentPhone || property?.sellerPhoneNumber;
    const agentContactEmail = property?.agentDetails?.email;

    const handleMessage = () => {
        if (agentContactWhatsApp) {
            window.open(`https://wa.me/${String(agentContactWhatsApp).replace(/[^0-9]/g, '')}?text=Hi, I'm interested in ${encodeURIComponent(property?.propertyName || property?.name || '')}`, '_blank');
        }
    };

    const handleWhatsApp = () => {
        if (agentContactWhatsApp) {
            window.open(`https://wa.me/${String(agentContactWhatsApp).replace(/[^0-9]/g, '')}?text=Hi, I'm interested in ${encodeURIComponent(property?.propertyName || property?.name || '')}`, '_blank');
        }
    };

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

    const handleCall = () => {
        if (agentContactPhone) {
            handlePhoneClick(null, agentContactPhone);
        }
    };

    const handleEmailClick = (e, email, subject = '') => {
        if (e) e.preventDefault();
        if (!email) return;
        const mailtoUrl = subject
            ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
            : `mailto:${email}`;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            window.location.href = mailtoUrl;
        } else {
            navigator.clipboard.writeText(email).then(() => {
                alert('Email address copied to clipboard! Paste in Outlook, Gmail, or your email app to send a message.');
            }).catch(() => {
                window.location.href = mailtoUrl;
            });
        }
    };

    const handleEmail = () => {
        if (agentContactEmail) {
            handleEmailClick(null, agentContactEmail, `Inquiry: ${property?.propertyName || property?.name || ''}`);
        }
    };

    const handleShowInterestModal = (formType = "property") => {
        setInterestFormType(formType);
        setInterestFormErrors({});
        setInterestFormData({ name: "", email: "", phone: "", message: "", companyName: "", numberOfSeats: "", preferredCallbackTime: "", interestType: "" });
        setShowModal(true);
    };

    const validateInterestForm = () => {
        const err = {};
        if (!interestFormData.name?.trim()) err.name = "Name is required";
        if (!interestFormData.email?.trim()) err.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(interestFormData.email)) err.email = "Enter a valid email";
        if (!interestFormData.phone?.trim()) err.phone = "Phone is required";
        setInterestFormErrors(err);
        return Object.keys(err).length === 0;
    };

    const getApiUrlAndBody = () => {
        const base = {
            propertyName: property?.propertyName || property?.name || "",
            propertyId: property?._id,
            name: interestFormData.name,
            email: interestFormData.email,
            phone: interestFormData.phone,
            message: interestFormData.message,
        };
        if (interestFormType === "callback") {
            return { url: "/api/callback-request", body: { ...base, preferredCallbackTime: interestFormData.preferredCallbackTime } };
        }
        if (interestFormType === "consultation") {
            return { url: "/api/consultation-request", body: { ...base, companyName: interestFormData.companyName, numberOfSeats: interestFormData.numberOfSeats } };
        }
        if (interestFormType === "brand") {
            return { url: "/api/brand-interest", body: { ...base, brandName: property?.builderName || property?.brandDetails?.name || property?.builder || property?.propertyName, interestType: interestFormData.interestType } };
        }
        return { url: "/api/property-interest", body: base };
    };

    const handleInterestModalSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateInterestForm()) return;
        try {
            setIsSubmittingInterest(true);
            const { url, body } = getApiUrlAndBody();
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                setInterestFormData({ name: "", email: "", phone: "", message: "", companyName: "", numberOfSeats: "", preferredCallbackTime: "", interestType: "" });
                setInterestFormErrors({});
                setShowModal(false);
                alert(data.message || "Submitted successfully! We will get back to you soon.");
            } else {
                setInterestFormErrors({ submit: data.message || "Failed to submit. Please try again." });
            }
        } catch (err) {
            console.error(err);
            setInterestFormErrors({ submit: "An error occurred. Please try again." });
        } finally {
            setIsSubmittingInterest(false);
        }
    };

    const handleAddReview = () => {
        if (!currentUser) {
            setIsLoginOpen(true);
            return;
        }
        setIsEditingReview(false);
        setSelectedRating(0);
        setReviewText('');
        setReviewGoodThings('');
        setReviewBadThings('');
        setUserName(currentUser?.name || '');
        setShowRatingModal(true);
    };

    const handleEditReview = (reviewToEdit = null) => {
        const review = reviewToEdit || userReview;
        if (!review) return;
        setUserReview(review);
        setIsEditingReview(true);
        setSelectedRating(review.rating || 0);
        setReviewText(review.comment || '');
        setReviewGoodThings(review.goodThings || '');
        setReviewBadThings(review.badThings || '');
        setUserName(review.user || currentUser?.name || '');
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

            if (!userPhoneNumber) {
                alert('Unable to get your phone number from session. Please make sure you are logged in.');
                setIsSubmittingReview(false);
                return;
            }

            const response = await fetch(`/api/reviews?propertyId=${propertyId}&propertyType=${propertyType}&reviewId=${reviewId}&userPhoneNumber=${encodeURIComponent(userPhoneNumber)}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                // Refresh property data
                const updatedProperty = await refreshPropertyData();

                if (updatedProperty) {
                    // Update property state
                    setProperty(prev => ({
                        ...prev,
                        reviews: updatedProperty.reviews || [],
                        ratings: updatedProperty.ratings || prev.ratings
                    }));

                    // Check for user review after refresh (should be false now)
                    checkUserReview(updatedProperty);
                }

                setHasUserSubmittedReview(false);
                setUserReview(null);

                // Don't show alert - deletion is complete
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
                const p = data.property;
                const formattedProperty = {
                    ...p,
                    id: String(p._id || p.id),
                    _id: String(p._id || p.id),
                    position: p.position || p.coordinates,
                    coordinates: p.coordinates || p.position,
                    amenities: p.amenities || []
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
        // Ensure phone number is properly extracted from Firebase user object
        // Firebase user object has phoneNumber property directly
        const userWithPhone = {
            ...userData,
            phoneNumber: userData.phoneNumber || userData.phone || userData.userPhoneNumber || null
        };

        loginUser(userWithPhone);
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
        // Small delay so tab state updates before scroll
        setTimeout(() => {
            if (refs[sectionId]?.current) {
                refs[sectionId].current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 50);
    };

    const openGallery = () => {
        setShowAllPhotosModal(true);
    };

    // Show loading if property data is not yet loaded
    if (!property) {
        return (
            <div className="property-details-compact min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading property details...</p>
                    <p className="text-gray-500 text-sm mt-2">Property ID: {searchParams.get('id')}</p>
                </div>
            </div>
        );
    }

    // DB: nearbyPlaces { schools, busStops, hospitals, banks, temples, atms, malls }
    const categoryToSchemaKey = { school: "schools", bus: "busStops", hospital: "hospitals", bank: "banks", temple: "temples", atm: "atms", mall: "malls" };
    const getNearbyByCategory = (cat) => {
        const key = categoryToSchemaKey[cat] || cat;
        const arr = property.nearbyPlaces?.[key] || property.nearbyPlaces?.[cat] || property.nearbyPlaces?.bank || property.nearbyPlaces?.business || [];
        return Array.isArray(arr) ? arr.slice(0, 6).map(p => ({ name: p?.name || p, distance: p?.distance || p?.dist || "-" })) : [];
    };
    // Rating & Reviews - DB: ratings (overall, totalRatings, breakdown), reviews array
    const ratingDisplay = (() => {
        const reviews = property?.reviews && Array.isArray(property.reviews) ? property.reviews : [];
        const r = property?.ratings || {};
        let overall = r.overall ?? r.average;
        let totalRatings = r.totalRatings ?? reviews.length;
        let breakdown = r.breakdown && typeof r.breakdown === "object" ? { ...r.breakdown } : null;
        if (reviews.length > 0 && (breakdown == null || totalRatings === 0)) {
            const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            reviews.forEach((rev) => {
                const star = Math.min(5, Math.max(1, Number(rev.rating) || 0));
                counts[star] = (counts[star] || 0) + 1;
            });
            breakdown = counts;
            totalRatings = reviews.length;
            if (overall == null || overall === 0) {
                const sum = reviews.reduce((acc, rev) => acc + (Number(rev.rating) || 0), 0);
                overall = reviews.length ? Math.round((sum / reviews.length) * 10) / 10 : 0;
            }
        }
        return { overall: overall ?? 0, totalRatings: totalRatings || 0, breakdown: breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    })();

    // Schema: totalPrice, discountPercent, pricePerSeat, pricePerSqft, isNegotiablePrice
    const { originalPrice, discountedPrice, originalPricePerSeat, discountedPricePerSeat, isNegotiablePrice } = calculatePrices(property);
    const isCommercialProperty = (property.propertyCategory || property.propertyType || "").toLowerCase() === "commercial";
    const specsCardTitle = (() => {
        const name = safeDisplay(property.propertyName || property.name, "");
        if (!name || name === "-") return safeDisplay(property.propertyName || property.name);
        if (!isCommercialProperty) return name;
        const lt = String(property.listingType || "").toLowerCase();
        const prefix = lt.includes("managed") ? "Managed office" : "Office space";
        return `${prefix} at ${name}`;
    })();
    const discountPct = property.discountPercent != null && property.discountPercent !== "" ? Number(property.discountPercent) : 15;
    const showSeatOriginalStrike =
        originalPricePerSeat &&
        discountedPricePerSeat &&
        String(originalPricePerSeat).replace(/[₹,\s]/g, "") !== String(discountedPricePerSeat).replace(/[₹,\s]/g, "");

    const bd = property.brandDetails || {};
    const brandDisplayName = safeDisplay(property.builderName || bd.name || property.builder || property.propertyName);
    const brandStats = {
        cities: bd.cities ?? 2,
        spaces: bd.spaces ?? 27,
        clients: bd.clients ?? 1000,
        seats: bd.seats ?? 8000,
    };
    const hasBrandDesc = typeof bd.description === "string" && bd.description.trim();
    const brandShortDesc = hasBrandDesc
        ? bd.description.trim()
        : `${brandDisplayName} Workspace, established in 2014, specializes in providing Zero CapEx, Enterprise Grade, Customized managed office spaces.`;
    const brandLongDesc = hasBrandDesc
        ? `${brandShortDesc} With ${brandStats.spaces}+ coworking spaces and ${brandStats.seats}+ seats across ${brandStats.cities}+ cities, ${brandDisplayName} continues to expand across India.`
        : `${brandDisplayName} Workspace, established in 2014, specializes in providing Zero CapEx, Enterprise Grade, Customized managed office spaces. With 26+ locations in Bangalore and an expansion to Mumbai, ${brandDisplayName}'s flagship HSR campus is the largest in India, offering over 8,000 seats...`;

    return (
        <main className="property-details-compact min-h-screen bg-secondary pb-44 md:pb-0">
            {/* Slider boundary banner - shows when prev/next at first/last slide */}
            {sliderBanner.show && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg bg-gray-900/90 text-white text-sm font-medium shadow-lg animate-fade-in" role="status">
                    {sliderBanner.msg}
                </div>
            )}
            {/* Sticky Header - Desktop Only */}
            {showStickyHeader && (
                <div className="hidden md:block fixed top-[48px] left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-b border-gray-100 shadow-sm animate-fade-in">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold truncate">{safeDisplay(property.propertyName || property.name)}</h1>
                                <div className="inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 border-amber-200">
                                    {safeDisplay(property.ratings?.overall)} <Star className="h-3 w-3 ml-1 fill-current" />
                                </div>
                                <img src="https://cdn-icons-png.flaticon.com/512/5253/5253968.png" alt="Verified" className="w-5 h-5 object-contain" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 pl-8">
                            <div className="flex items-end gap-2">
                                <p className="text-lg font-bold text-blue-600">{safeDisplay(discountedPrice)}</p>
                                <p className="text-sm text-gray-400 line-through">{safeDisplay(originalPrice)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCall}
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 h-11 rounded-lg cursor-pointer"
                                >
                                    Contact
                                </button>
                                <button
                                    onClick={handleWhatsApp}
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 h-11 rounded-lg cursor-pointer"
                                >
                                    <img src="https://www.buildersinfo.in/property-details/whatsapp.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
                                    <span className="ml-2">WhatsApp</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full px-4 sm:px-6 lg:px-8 pt-6">
                {/* Title row spans full content width (above gallery + sidebar), like listing reference */}
                <div id="info" className="md:pt-0 mb-6 w-full min-w-0">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-4">
                        <div className="flex-1 min-w-0">
                            {/* Title and Badge Row */}
                            <div className="flex flex-wrap items-center gap-3 md:gap-4">
                                <h1 className="text-3xl md:text-[2.75rem] md:leading-[1.1] font-bold tracking-tight text-black">{safeDisplay(property.propertyName || property.name)}</h1>
                                <div className="inline-flex items-center rounded-full px-3 py-1 md:px-4 md:py-1.5 text-sm md:text-base font-bold bg-[#fff4e5] text-[#f97316]">
                                    <Star className="h-4 w-4 md:h-4 md:w-4 mr-1.5 fill-current" />
                                    {safeDisplay(property.ratings?.overall)}
                                </div>
                            </div>

                            {/* Location and Verification Row */}
                            <div className="flex items-center gap-4 mt-4 md:mt-6">
                                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl border border-gray-100 bg-[#faf9f6] shrink-0">
                                    <MapPin className="h-5 w-5 md:h-6 md:w-6 text-[#f97316] fill-[#f97316]/20" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-sm md:text-[15px] text-gray-700 leading-tight">in {safeDisplay(property.displayAddress || property.addressDisplay || property.location)}</p>
                                    <button type="button" onClick={openGoogleMaps} className="text-[#f97316] text-sm md:text-[15px] font-medium hover:underline text-left mt-0.5">View on Map</button>
                                </div>
                                {/* Verified tick */}
                                <div className="ml-2 md:ml-6 flex items-center justify-center">
                                    <img src="https://cdn-icons-png.flaticon.com/512/5253/5253968.png" alt="Verified" className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex shrink-0 items-center gap-2 md:gap-3 lg:-mt-1 mt-2">
                            <button type="button" onClick={handleLike} className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#f4f4f5] hover:bg-[#e4e4e7] text-gray-700 transition" aria-label="Save">
                                <Heart className={`h-4 w-4 md:h-[1.15rem] md:w-[1.15rem] ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                            </button>
                            <button type="button" onClick={handleShare} className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#f4f4f5] hover:bg-[#e4e4e7] text-gray-700 transition" aria-label="Share">
                                <Share2 className="h-4 w-4 md:h-[1.15rem] md:w-[1.15rem]" />
                            </button>
                            {mapsExternalUrl && (
                                <a href={mapsExternalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#f4f4f5] hover:bg-[#e4e4e7] text-gray-700 transition" aria-label="Directions — open in Google Maps">
                                    <CornerUpRight className="h-4 w-4 md:h-[1.15rem] md:w-[1.15rem]" />
                                </a>
                            )}
                            {propertyDetailsFullUrl && (
                                <a href={propertyDetailsFullUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#f4f4f5] hover:bg-[#e4e4e7] text-gray-700 transition" aria-label="Open property page in new tab">
                                    <SquareArrowOutUpRight className="h-4 w-4 md:h-[1.15rem] md:w-[1.15rem]" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start gap-6 w-full min-w-0">
                    {/* Main Content - ~65% on desktop: gallery + details */}
                    <div className="w-full lg:flex-[13] lg:min-w-0">
                        <div className="space-y-6">
                            {/* Image Gallery - Mobile: single image with arrows */}
                            <div
                                className="relative group w-full min-w-0"
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                {/* Single column wrapper so thumb row is same width as the 3-col grid above */}
                                <div className="grid w-full min-w-0 grid-cols-1 gap-y-2">
                                    <div className="property-details-gallery grid w-full min-w-0 grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-2 md:h-[450px]">
                                        <div className="relative md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden group cursor-pointer aspect-[4/3] md:aspect-auto bg-muted">
                                            {images[currentImageIndex] ? (
                                                <img
                                                    src={images[currentImageIndex]}
                                                    alt={safeDisplay(property.propertyName || property.name)}
                                                    className="w-full h-full object-cover transition-transform duration-300 cursor-pointer"
                                                    onClick={() => setFullScreenImage(images[currentImageIndex])}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-muted" aria-hidden />
                                            )}
                                        </div>
                                        <div className="relative md:col-span-1 md:row-span-1 aspect-[4/3] md:aspect-auto z-[1] overflow-visible">
                                            <div
                                                className="relative h-full w-full rounded-2xl overflow-hidden cursor-pointer bg-muted"
                                                onClick={() => setFullScreenImage(images[1] || images[0])}
                                                role="presentation"
                                            >
                                                {(images[1] || images[0]) ? (
                                                    <img src={images[1] || images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-muted" aria-hidden />
                                                )}
                                            </div>
                                            {((property.seatLayoutPDFs?.[0]?.url || property.seatLayoutPDFs?.[0]) || property.pdf) && (
                                                <div className="gallery-pdf-cta-float pointer-events-none absolute z-[20]">
                                                    <img
                                                        src="/property-details/pdf-download.svg"
                                                        alt="Download PDF Brochure"
                                                        className="pointer-events-auto cursor-pointer drop-shadow-md hover:scale-105 transition-transform w-[50px] h-[50px]"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const pdfObj = property.seatLayoutPDFs?.[0]
                                                                ? (typeof property.seatLayoutPDFs[0] === 'string' ? { url: property.seatLayoutPDFs[0], originalName: 'Property Brochure' } : property.seatLayoutPDFs[0])
                                                                : { url: property.pdf, originalName: 'Property Brochure' };
                                                            setSelectedPDF(pdfObj);
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative md:col-span-1 md:row-span-1 aspect-[4/3] md:aspect-auto z-[1] overflow-visible">
                                            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-muted shadow-sm">
                                                {galleryInlineVideoActive && galleryVideoUrl ? (
                                                    <video
                                                        ref={galleryInlineVideoRef}
                                                        className="h-full w-full object-cover bg-black"
                                                        controls
                                                        playsInline
                                                        autoPlay
                                                        poster={galleryVideoThumb || undefined}
                                                        onLoadedData={(e) => {
                                                            e.currentTarget.play().catch(() => { });
                                                        }}
                                                    >
                                                        <source src={galleryVideoUrl} type={getVideoMimeType(galleryVideoUrl, galleryVideoContentType)} />
                                                    </video>
                                                ) : (
                                                    <>
                                                        {galleryVideoThumb ? (
                                                            <img src={galleryVideoThumb} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full bg-muted" aria-hidden />
                                                        )}
                                                        <div className="pointer-events-none absolute inset-0 bg-black/25" aria-hidden />
                                                        <button
                                                            type="button"
                                                            disabled={!galleryVideoUrl}
                                                            className="absolute left-1/2 top-1/2 z-[5] flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (galleryVideoUrl) setGalleryInlineVideoActive(true);
                                                            }}
                                                            aria-label="Play video in gallery"
                                                        >
                                                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800/80 text-white shadow-lg ring-2 ring-white/25 md:h-[4.25rem] md:w-[4.25rem]">
                                                                <CirclePlay className="h-10 w-10 text-white drop-shadow-md md:h-11 md:w-11" strokeWidth={1.25} />
                                                            </span>
                                                        </button>
                                                        <div className="pointer-events-none absolute bottom-3 left-3 right-3 md:bottom-3.5 md:left-4 md:right-4" aria-hidden>
                                                            <div className="relative h-0.5 w-full rounded-full bg-white/50">
                                                                <span className="absolute -left-px -top-1.5 h-3 w-3 rounded-full bg-white shadow-md ring-2 ring-white/90" />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="gallery-watch-video-float pointer-events-none absolute z-[20]">
                                                <button
                                                    type="button"
                                                    className="gallery-watch-video-pill pointer-events-auto"
                                                    disabled={!galleryVideoUrl}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!galleryVideoUrl) return;
                                                        galleryInlineVideoRef.current?.pause?.();
                                                        setGalleryInlineVideoActive(false);
                                                        setShowVideoModal(true);
                                                    }}
                                                >
                                                    WATCH VIDEO
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full min-w-0 self-stretch pb-2 relative col-span-1">
                                        <div className="gallery-thumb-strip flex w-full min-w-0 flex-nowrap items-center justify-start gap-2">
                                            {images.length === 0 ? null : (() => {
                                                const total = images.length;
                                                /** Max 9 cells: if more than 9 images, 8 thumbs + "Show all" on the 9th */
                                                const MAX_THUMB_STRIP = 9;
                                                const cellClass =
                                                    "relative m-0 h-20 w-28 shrink-0 cursor-pointer overflow-hidden rounded-xl";
                                                if (total <= MAX_THUMB_STRIP) {
                                                    return images.map((img, i) => (
                                                        <div key={i} className={cellClass} onClick={() => setCurrentImageIndex(i)}>
                                                            <img src={img} alt="" className="h-full w-full object-cover" />
                                                        </div>
                                                    ));
                                                }
                                                const plainCount = MAX_THUMB_STRIP - 1;
                                                return [
                                                    ...images.slice(0, plainCount).map((img, i) => (
                                                        <div key={`t-${i}`} className={cellClass} onClick={() => setCurrentImageIndex(i)}>
                                                            <img src={img} alt="" className="h-full w-full object-cover" />
                                                        </div>
                                                    )),
                                                    <button
                                                        key="show-all-thumb"
                                                        type="button"
                                                        className={`${cellClass} gallery-see-all-thumb border-0 p-0 text-left`}
                                                        onClick={() => setShowAllPhotosModal(true)}
                                                        aria-label={`See all ${total} photos`}
                                                    >
                                                        <img src={images[plainCount]} alt="" className="gallery-see-all-thumb__img h-full w-full object-cover" />
                                                        <div className="gallery-see-all-thumb__wash" aria-hidden />
                                                        <div className="absolute inset-0 flex items-center justify-center p-2">
                                                            <span className="gallery-see-all-pill">See all</span>
                                                        </div>
                                                    </button>,
                                                ];
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Specs Card — layout aligned to listing summary reference */}
                            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm" id="specs">
                                <div className="p-5 md:p-6">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-[20px] font-normal leading-snug tracking-tight text-gray-900 md:text-[22px]">{specsCardTitle}</h2>
                                            <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                                                <span className="text-[13.5px] text-gray-900">
                                                    Quoted price{isNegotiablePrice ? " (negotiable)" : ""}
                                                </span>
                                                {showSeatOriginalStrike && (
                                                    <span className="text-[16px] text-gray-500 line-through">
                                                        {safeDisplay(originalPricePerSeat)}
                                                    </span>
                                                )}
                                                <span className="font-serif text-[30px] font-bold tracking-tight text-[#17592f] md:text-[34px]">
                                                    {safeDisplay(discountedPricePerSeat ?? discountedPrice)}
                                                </span>
                                                <span className="text-[13.5px] text-gray-900">/ seat / month</span>
                                            </div>
                                        </div>
                                        <div
                                            className="relative inline-flex w-full max-w-full shrink-0 items-start justify-between gap-3 rounded-l-[2rem] bg-gradient-to-r from-[#e3f2e6] via-[#e3f2e6]/70 to-transparent py-2.5 pl-3 pr-2 lg:w-auto lg:max-w-fit mt-1 lg:mt-0"
                                            role="note"
                                        >
                                            <div className="flex flex-1 items-start gap-2.5">
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5">
                                                    <path d="M11.455 1.579a1.5 1.5 0 011.09 0l2.365.882a1.5 1.5 0 001.32-.158l2.094-1.424a1.5 1.5 0 011.838.252l1.79 1.79a1.5 1.5 0 01.252 1.838l-1.424 2.094a1.5 1.5 0 00-.158 1.32l.882 2.365a1.5 1.5 0 010 1.09l-.882 2.365a1.5 1.5 0 00.158 1.32l1.424 2.094a1.5 1.5 0 01-.252 1.838l-1.79 1.79a1.5 1.5 0 01-1.838.252l-2.094-1.424a1.5 1.5 0 00-1.32-.158l-2.365.882a1.5 1.5 0 01-1.09 0l-2.365-.882a1.5 1.5 0 00-1.32.158l-2.094 1.424a1.5 1.5 0 01-1.838-.252l-1.79-1.79a1.5 1.5 0 01-.252-1.838l1.424-2.094a1.5 1.5 0 00.158-1.32l-.882-2.365a1.5 1.5 0 010-1.09l.882-2.365a1.5 1.5 0 00-.158-1.32l-1.424-2.094a1.5 1.5 0 01.252-1.838l1.79-1.79a1.5 1.5 0 011.838-.252l2.094 1.424a1.5 1.5 0 001.32.158l2.365-.882z" fill="#307f43" />
                                                    <path d="M9 10.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-6.2-5.8l6.4-6.4 1.4 1.4-6.4 6.4-1.4-1.4z" fill="white" />
                                                </svg>
                                                <span className="min-w-0 text-[15px] font-medium leading-snug tracking-tight text-[#307f43] max-w-[240px]">
                                                    Best price guaranteed - save up to {discountPct}% with{" "}
                                                    <strong className="font-serif font-medium tracking-wide">Buildersinfo</strong>
                                                </span>
                                            </div>
                                            <Info className="h-[20px] w-[20px] shrink-0 text-[#307f43] opacity-80 mt-[3px]" strokeWidth={1.5} aria-label="More info" />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-5 md:px-6">
                                    <div className="h-px w-full bg-gray-200 dark:bg-border" />
                                </div>

                                <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-3 md:px-6 md:py-5">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-background">
                                            <img src="/property-details/other-details/property.svg" alt="Property Type" className="h-[22px] w-[22px] object-contain drop-shadow-sm" />
                                        </div>
                                        <div className="min-w-0 pt-0.5">
                                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                Property Type
                                                <Info className="h-3 w-3 shrink-0 text-sky-500" aria-hidden />
                                            </p>
                                            <p className="mt-1 break-words text-sm font-bold text-foreground">
                                                {safeDisplay(
                                                    property.displayPropertyType ||
                                                    property.propertySubtype ||
                                                    property.propertyTypeDisplay ||
                                                    (String(property.propertyType || "").toLowerCase() === "commercial"
                                                        ? ""
                                                        : property.propertyType),
                                                    "Tech Park"
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-background">
                                            <img src="/property-details/other-details/furnshing.svg" alt="Furnishing" className="h-[22px] w-[22px] object-contain drop-shadow-sm" />
                                        </div>
                                        <div className="min-w-0 pt-0.5">
                                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                Furnishing level
                                                <Info className="h-3 w-3 shrink-0 text-sky-500" aria-hidden />
                                            </p>
                                            <p className="mt-1 break-words text-sm font-bold text-foreground">
                                                {safeDisplay(property.furnishingLevel || property.furnishingStatus || property.furnishing)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-background">
                                            <img src="/property-details/other-details/building.svg" alt="Building Lease" className="h-[22px] w-[22px] object-contain drop-shadow-sm" />
                                        </div>
                                        <div className="min-w-0 pt-0.5">
                                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                Building Lease
                                                <Info className="h-3 w-3 shrink-0 text-sky-500" aria-hidden />
                                            </p>
                                            <p className="mt-1 break-words text-sm font-bold text-foreground">
                                                {safeDisplay(property.buildingLease)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-5 md:px-6">
                                    <div className="h-px w-full bg-gray-200 dark:bg-border" />
                                </div>

                                <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-3 md:px-6 md:py-5">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-background">
                                            <img src="/property-details/other-details/property.svg" alt="Min Inventory" className="h-[22px] w-[22px] object-contain drop-shadow-sm" />
                                        </div>
                                        <div className="min-w-0 pt-0.5">
                                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                Min. inventory unit
                                                <Info className="h-3 w-3 shrink-0 text-sky-500" aria-hidden />
                                            </p>
                                            <p className="mt-1 break-words text-sm font-bold text-foreground">
                                                {safeDisplay(property.minInventoryUnit)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-background">
                                            <img src="/property-details/other-details/property.svg" alt="Max Inventory" className="h-[22px] w-[22px] object-contain drop-shadow-sm" />
                                        </div>
                                        <div className="min-w-0 pt-0.5">
                                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                Max. inventory unit
                                                <Info className="h-3 w-3 shrink-0 text-sky-500" aria-hidden />
                                            </p>
                                            <p className="mt-1 break-words text-sm font-bold text-foreground">
                                                {safeDisplay(property.maxInventoryUnit)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-background">
                                            <img src="/property-details/other-details/property.svg" alt="Capacity" className="h-[22px] w-[22px] object-contain drop-shadow-sm" />
                                        </div>
                                        <div className="min-w-0 pt-0.5">
                                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                Single floor Capacity
                                                <Info className="h-3 w-3 shrink-0 text-sky-500" aria-hidden />
                                            </p>
                                            <p className="mt-1 break-words text-sm font-bold text-foreground">
                                                {safeDisplay(property.singleFloorCapacity)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Infrastructure - DB: customInfrastructure */}
                            {property.customInfrastructure && property.customInfrastructure.length > 0 && (
                                <div
                                    className="rounded-xl border border-gray-200/90 bg-[#f4f4fb] px-5 py-6 shadow-sm dark:border-border dark:bg-muted/25"
                                    id="custom-infra"
                                >
                                    <h3 className="mb-6 text-left text-lg font-bold leading-snug text-foreground md:text-xl">
                                        Custom infrastructure possible in your Managed Office <span aria-hidden>✨</span>
                                    </h3>
                                    <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 md:gap-x-2 md:gap-y-0 lg:gap-x-6">
                                        {property.customInfrastructure.map((item, i) => {
                                            const name = typeof item === "object" ? item?.name : item;
                                            const id = typeof item === "object" && item?.id != null ? item.id : i + 1;
                                            const iconSrc = getCustomInfraIconSrc(name, id);
                                            return (
                                                <div
                                                    key={`${name}-${i}`}
                                                    className="flex w-full max-w-[8.5rem] flex-col items-center justify-start text-center md:max-w-none"
                                                >
                                                    <div className="flex h-9 w-9 items-center justify-center md:h-8 md:w-8">
                                                        <img
                                                            src={iconSrc}
                                                            alt={name}
                                                            className="h-8 w-8 object-contain opacity-90 dark:opacity-100"
                                                            width={32}
                                                            height={32}
                                                        />
                                                    </div>
                                                    <p className="mt-2.5 text-center text-xs font-normal leading-tight text-gray-700 dark:text-gray-300 md:text-sm">
                                                        {name}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Amenities - DB: amenities (id, name, category) */}
                            <div className="rounded-lg border theme-bg-card theme-shadow-sm" id="amenities">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="text-lg font-bold leading-none tracking-tight">Amenities</h3>
                                </div>
                                <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full" />
                                <div className="p-6 pt-6">
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-x-4 gap-y-6">
                                        {(property.amenities || []).map((amenity, i) => {
                                            const name = typeof amenity === 'object' ? amenity?.name : amenity;
                                            const iconSrc = mapAmenityToObject(name)?.image || DEFAULT_AMENITY_ICON;
                                            return (
                                                <div key={`${name}-${i}`} className="flex flex-col items-center text-center gap-2">
                                                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                                                        <img src={iconSrc} alt={name} className="h-8 w-8 text-primary object-contain" />
                                                    </div>
                                                    <p className="text-xs font-medium text-muted-foreground truncate w-full">{name}</p>
                                                </div>
                                            );
                                        })}
                                        <div className="flex flex-col items-center gap-2">
                                            <button
                                                onClick={() => setShowAmenitiesModal(true)}
                                                className="flex items-center justify-center h-16 w-16 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:bg-gray-50 transition-colors cursor-pointer"
                                            >
                                                <CirclePlus className="h-8 w-8 text-primary" />
                                            </button>
                                            <button onClick={() => setShowAmenitiesModal(true)} className="text-xs font-medium text-muted-foreground hover:underline truncate w-full cursor-pointer">View All</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Why choose Buildersinfo — horizontal banner (reference layout) */}
                            <div className="rounded-xl border border-gray-200/90 bg-[#f4f6f9] p-6 shadow-sm dark:border-border dark:bg-muted/30 md:p-8">
                                <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
                                    <div className="shrink-0 lg:max-w-[14rem]">
                                        <h3 className="text-left text-lg font-bold leading-snug text-neutral-900 dark:text-foreground">
                                            Why choose Buildersinfo?
                                        </h3>
                                    </div>
                                    <ul className="flex min-w-0 flex-1 flex-col gap-3.5">
                                        {[
                                            "Zero brokerage fee",
                                            "Design & layout support",
                                            "Largest network of offices",
                                            "Your own office consultant",
                                        ].map((line) => (
                                            <li key={line} className="flex items-center gap-3">
                                                <span
                                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                                                    aria-hidden
                                                >
                                                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                                                </span>
                                                <span className="text-sm font-medium text-neutral-900 dark:text-foreground">{line}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex shrink-0 justify-start lg:justify-end lg:pt-0.5">
                                        <button
                                            type="button"
                                            onClick={() => handleShowInterestModal("consultation")}
                                            className="inline-flex w-full items-center justify-center rounded-md border border-indigo-600 bg-white px-5 py-2.5 text-sm font-medium text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-indigo-400 dark:bg-card dark:text-indigo-400 dark:hover:bg-indigo-950/40 sm:w-auto"
                                        >
                                            Get Free Consultation
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Nearby Landmarks */}
                            <div
                                id="nearby"
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white text-card-foreground shadow-sm dark:border-border dark:bg-card"
                            >
                                <div className="px-6 pb-4 pt-6">
                                    <h3 className="text-lg font-bold leading-tight tracking-tight text-neutral-900 dark:text-foreground">
                                        Nearby Landmarks - {safeDisplay(property.propertyName || property.name)}
                                    </h3>
                                </div>
                                <div className="h-px w-full bg-border" />
                                <div className="p-6 pt-5">
                                    <div className="relative mb-6 h-56 w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-muted dark:via-muted/80 dark:to-muted">
                                        <div
                                            className="pointer-events-none absolute inset-0 opacity-[0.35]"
                                            style={{
                                                backgroundImage:
                                                    "repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(0,0,0,0.06) 11px, rgba(0,0,0,0.06) 12px), repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(0,0,0,0.06) 11px, rgba(0,0,0,0.06) 12px)",
                                            }}
                                            aria-hidden
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={openGoogleMaps}
                                                className="inline-flex items-center gap-2 rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                                            >
                                                <MapPin className="h-4 w-4 shrink-0 text-white" strokeWidth={2} />
                                                View on Map
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                        {NEARBY_CATEGORIES.map((cat) => {
                                            const schemaKey = categoryToSchemaKey[cat.id] || cat.id;
                                            const isActive = activeCategory === schemaKey;
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveCategory(schemaKey);
                                                        setShowMoreNearby(false);
                                                    }}
                                                    className={`flex h-10 shrink-0 items-center gap-2 rounded-md border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${isActive
                                                        ? "border-black bg-black text-white hover:bg-neutral-900 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                                                        : "border-gray-200 bg-white text-neutral-900 hover:bg-gray-50 dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted"
                                                        }`}
                                                >
                                                    {cat.localIcon ? (
                                                        <img src={cat.localIcon} alt={cat.label} className="h-[22px] w-[22px] shrink-0 object-contain transition-all" style={isActive ? { filter: 'brightness(0) invert(1)' } : {}} />
                                                    ) : (
                                                        <>
                                                            {cat.id === "school" && (
                                                                <School className={`h-4 w-4 shrink-0 ${isActive ? "text-white dark:text-black" : "text-neutral-900 dark:text-foreground"}`} />
                                                            )}
                                                            {cat.id === "bus" && (
                                                                <Building className={`h-4 w-4 shrink-0 ${isActive ? "text-white dark:text-black" : "text-neutral-900 dark:text-foreground"}`} />
                                                            )}
                                                            {cat.id === "hospital" && (
                                                                <Hospital className={`h-4 w-4 shrink-0 ${isActive ? "text-white dark:text-black" : "text-neutral-900 dark:text-foreground"}`} />
                                                            )}
                                                            {cat.id === "bank" && (
                                                                <Banknote className={`h-4 w-4 shrink-0 ${isActive ? "text-white dark:text-black" : "text-neutral-900 dark:text-foreground"}`} />
                                                            )}
                                                            {cat.id === "temple" && (
                                                                <Building2 className={`h-4 w-4 shrink-0 ${isActive ? "text-white dark:text-black" : "text-neutral-900 dark:text-foreground"}`} />
                                                            )}
                                                            {cat.id === "atm" && (
                                                                <Briefcase className={`h-4 w-4 shrink-0 ${isActive ? "text-white dark:text-black" : "text-neutral-900 dark:text-foreground"}`} />
                                                            )}
                                                            {cat.id === "mall" && (
                                                                <Hotel className={`h-4 w-4 shrink-0 ${isActive ? "text-white dark:text-black" : "text-neutral-900 dark:text-foreground"}`} />
                                                            )}
                                                        </>
                                                    )}
                                                    <span>{cat.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {(() => {
                                        const nearbyLabel =
                                            NEARBY_CATEGORIES.find(
                                                (c) => (categoryToSchemaKey[c.id] || c.id) === activeCategory
                                            )?.label || activeCategory;
                                        const propNm = safeDisplay(property.propertyName || property.name);
                                        return (
                                            <p className="mb-3 text-sm font-bold text-neutral-900 dark:text-foreground">
                                                {nearbyLabel} Near by {propNm}
                                            </p>
                                        );
                                    })()}

                                    <ul className="divide-y divide-gray-200 dark:divide-border">
                                        {getNearbyByCategory(activeCategory)
                                            .slice(0, showMoreNearby ? undefined : 3)
                                            .map((b, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-center justify-between gap-3 py-3 text-sm first:pt-0"
                                                >
                                                    <span className="min-w-0 flex-1 font-medium text-neutral-900 dark:text-foreground">
                                                        {b.name}
                                                    </span>
                                                    <div className="flex shrink-0 items-center gap-1.5">
                                                        <img src="/property-details/step-location.svg" alt="Distance" className="h-[20px] w-[20px] object-contain opacity-70" aria-hidden />
                                                        <span className="text-muted-foreground tabular-nums">{b.distance}</span>
                                                    </div>
                                                </li>
                                            ))}
                                    </ul>

                                    {getNearbyByCategory(activeCategory).length > 3 && (
                                        <div className="mt-6 flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() => setShowMoreNearby(!showMoreNearby)}
                                                className="rounded-md border border-gray-200 bg-white px-8 py-2 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted"
                                            >
                                                {showMoreNearby ? "View Less" : "View More"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Check Travel Time */}
                            <div className="rounded-lg border theme-bg-card theme-shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="text-lg font-bold leading-none tracking-tight">Check Travel Time</h3>
                                </div>
                                <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full" />
                                <div className="p-6 space-y-4 pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 p-4 border rounded-lg">
                                        <div className="relative">
                                            <PlacesAutocompleteInput
                                                value={travelOriginInput}
                                                onChange={(v) => { setTravelOriginInput(v); if (!v) { setTravelOrigin(null); setTravelError(""); } }}
                                                onSelect={handleTravelOriginSelect}
                                                placeholder="Choose Starting Point (like office or kid's school)"
                                                type="travel"
                                                mapCenter={mapCenter}
                                                className="w-full"
                                            />
                                            {travelError && (
                                                <p className="text-xs text-red-500 mt-1">{travelError}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center my-2 md:my-0 shrink-0">
                                            <div className="hidden md:flex items-center justify-center gap-0 min-w-[120px]">
                                                <div className="w-3 h-3 rounded-full border-2 border-gray-800 dark:border-gray-200 bg-white shrink-0" aria-hidden />
                                                <div className="flex-1 h-0 border-t border-dashed border-gray-400 min-w-[20px]" />
                                                <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center shrink-0">
                                                    <img src="/property-details/car-path.svg" alt="Car" className="h-5 w-5 object-contain drop-shadow-sm" />
                                                </div>
                                                <div className="flex-1 h-0 border-t border-dashed border-gray-400 min-w-[20px]" />
                                                <div className="w-3 h-3 rounded-full border-2 border-gray-800 dark:border-gray-200 bg-white shrink-0" aria-hidden />
                                            </div>
                                            <div className="md:hidden flex items-center justify-center gap-1">
                                                <div className="w-3 h-3 rounded-full border-2 border-gray-800 bg-white" />
                                                <ArrowDown className="h-5 w-5 text-violet-600" />
                                                <div className="w-3 h-3 rounded-full border-2 border-gray-800 bg-white" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 border rounded-lg">
                                            <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 bg-muted">
                                                {images[0] ? (
                                                    <img src={images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-muted" aria-hidden />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{safeDisplay(property.propertyName || property.name)}</p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[140px]">{safeDisplay(property.displayAddress || property.addressDisplay || property.location)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleShowTravelTime}
                                        disabled={travelLoading}
                                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {travelLoading ? (
                                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                                        ) : (
                                            <CirclePlus className="mr-2 h-4 w-4" />
                                        )}
                                        Show Travel Time
                                    </button>
                                    {travelResults.length > 0 && (
                                        <div className="space-y-3">
                                            {travelResults.map((r, idx) => (
                                                <div key={idx} className="rounded-lg border bg-muted/30 p-4 space-y-3 relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setTravelResults((prev) => prev.filter((_, i) => i !== idx))}
                                                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                        aria-label="Remove travel time"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                    <div className="flex items-start gap-2 pr-8">
                                                        <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                        <p className="text-sm text-muted-foreground line-clamp-2">{r.originAddress}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4">
                                                        {r.driving && (
                                                            <div className="flex items-center gap-2">
                                                                <img src="/property-details/car-path.svg" alt="Car" className="h-5 w-5 object-contain drop-shadow-sm" />
                                                                <span className="text-sm font-medium">{r.driving.duration.text} ({r.driving.distance.text})</span>
                                                            </div>
                                                        )}
                                                        {r.walking && (
                                                            <div className="flex items-center gap-2">
                                                                <Footprints className="h-5 w-5 text-primary" />
                                                                <span className="text-sm font-medium">{r.walking.duration.text} ({r.walking.distance.text})</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Sidebar - right column, top aligns with left section */}
                    <div className="w-full lg:flex-[7] lg:flex-shrink-0 lg:self-start lg:min-w-0">
                        <div className="sticky top-20 space-y-4">
                            {/* Interested + social proof + Why Clients — single card (layout matches reference) */}
                            <div className="rounded-xl border-none bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] dark:bg-card overflow-hidden">
                                {(() => {
                                    const agentName = safeDisplay(property.agentDetails?.name || property.agentName);
                                    const agentPhone = property.agentDetails?.phone || property.agentPhone || "";
                                    const agentEmail = property.agentDetails?.email || property.agentEmail || "";
                                    const agentImage = property.agentImage || property.agentDetails?.image || "";
                                    const agentTag = safeDisplay(property.agentDetails?.tag) || "Buildersinfo Expert";
                                    const agentTagline = safeDisplay(property.agentDetails?.tagline);
                                    const assistedLogos = property.agentDetails?.assistedCorporates || [];
                                    const propTitle = safeDisplay(property.propertyName || property.name);
                                    const maskedPhone = agentPhone
                                        ? (() => {
                                            const digits = agentPhone.replace(/[^0-9]/g, "");
                                            const num = digits.length >= 12 && digits.startsWith("91") ? digits.slice(2) : digits.slice(-10);
                                            if (num.length >= 4) return `+91 ${num.slice(0, 2)}******${num.slice(-2)}`;
                                            return agentPhone;
                                        })()
                                        : "";
                                    return (
                                        <>
                                            <div className="px-5 pt-5 pb-5">
                                                <h3 className="text-[15.5px] text-gray-900 dark:text-gray-100 leading-snug">
                                                    Interested in <span className="font-bold">{propTitle}</span> ?
                                                </h3>

                                                <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 justify-between">
                                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                                        <div className="relative h-[90px] w-[75px] shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800 border-none rounded-[2px]">
                                                            {agentImage ? (
                                                                <img src={agentImage} alt={agentName} className="h-full w-full object-cover object-top" />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground" aria-hidden>
                                                                    {agentName ? agentName.charAt(0) : "-"}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col min-w-0 flex-1 pt-0.5">
                                                            <p className="text-[14.5px] text-gray-900 dark:text-gray-100 mb-2">
                                                                Say Hi To <span className="font-bold">{agentName}</span>
                                                            </p>
                                                            <div className="flex items-center gap-4 flex-wrap w-full mb-3">
                                                                {agentPhone && (
                                                                    <a
                                                                        href={`tel:${agentPhone.replace(/[^0-9+]/g, "")}`}
                                                                        onClick={(e) => handlePhoneClick(e, agentPhone)}
                                                                        className="text-[12.5px] text-gray-900 dark:text-gray-300 tracking-wide hover:underline"
                                                                    >
                                                                        {maskedPhone}
                                                                    </a>
                                                                )}
                                                                <div className="flex items-center gap-2.5">
                                                                    {agentPhone && (
                                                                        <a
                                                                            href={`tel:${agentPhone.replace(/[^0-9+]/g, "")}`}
                                                                            onClick={(e) => handlePhoneClick(e, agentPhone)}
                                                                            className="inline-flex shrink-0 hover:opacity-80 transition-opacity"
                                                                            title="Call"
                                                                        >
                                                                            <img src="/property-details/agent-social/call.svg" alt="Call" className="h-[26px] w-[26px] object-contain drop-shadow-sm" />
                                                                        </a>
                                                                    )}
                                                                    {agentEmail && (
                                                                        <a
                                                                            href={`mailto:${agentEmail}`}
                                                                            onClick={(e) => handleEmailClick(e, agentEmail, `Inquiry: ${propTitle || ""}`)}
                                                                            className="inline-flex shrink-0 hover:opacity-80 transition-opacity"
                                                                            title="Message"
                                                                        >
                                                                            <img src="/property-details/agent-social/message.svg" alt="Message" className="h-[26px] w-[26px] object-contain drop-shadow-sm" />
                                                                        </a>
                                                                    )}
                                                                    {(property.agentDetails?.whatsapp || agentPhone) && (
                                                                        <a
                                                                            href={`https://wa.me/${(property.agentDetails?.whatsapp || agentPhone).replace(/[^0-9]/g, "")}?text=Hi, I'm interested in ${encodeURIComponent(propTitle)}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex shrink-0 hover:opacity-80 transition-opacity"
                                                                            title="WhatsApp"
                                                                        >
                                                                            <img src="/property-details/agent-social/whatsapp.svg" alt="WhatsApp" className="h-[22px] w-[22px] object-contain drop-shadow-sm" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="inline-flex items-center rounded-md border border-[#86cfa2] bg-[#f0f9f3] px-2.5 py-0.5 text-[11px] font-bold text-[#1f8c4c] dark:bg-[#1a8e48]/10 dark:border-[#1a8e48]/40 dark:text-[#4ade80]">
                                                                    {agentTag}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0 sm:pt-4 sm:pr-2">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => agentPhone && handlePhoneClick(e, agentPhone)}
                                                            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-[6px] border border-[#a4ecbe] bg-[#f1fdf5] px-5 sm:px-6 text-[18px] font-bold text-[#208346] hover:bg-[#e6fceb] dark:bg-[#1f5431] dark:border-[#2d7644] dark:text-white dark:hover:bg-[#1b482a] transition-colors shadow-sm"
                                                        >
                                                            Contact {(agentName && agentName.split(" ")[0]) || agentName || "Agent"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-5 pb-6">
                                                <div className="bg-[#eff2f4] dark:bg-gray-800/60 rounded-[4px] p-5">
                                                    {agentTagline ? (
                                                        <p className="text-[15px] leading-relaxed text-[#414d55] dark:text-gray-300">
                                                            {agentTagline}
                                                        </p>
                                                    ) : (
                                                        <p className="text-[15px] leading-[1.6] text-[#414d55] dark:text-gray-300">
                                                            {agentName ? agentName.split(" ")[0] : "Agent"}&apos;s team assisted 500+ corporates in Bangalore to move into their new office.
                                                        </p>
                                                    )}
                                                    <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-6">
                                                        {(assistedLogos.length > 0 ? assistedLogos.slice(0, 5) : [
                                                            { name: "Pepsi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pepsi_logo_2014.svg/120px-Pepsi_logo_2014.svg.png" },
                                                            { name: "GE", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/General_Electric_logo.svg/120px-General_Electric_logo.svg.png" },
                                                            { name: "P&G", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Procter_%26_Gamble_logo.svg/120px-Procter_%26_Gamble_logo.svg.png" },
                                                            { name: "HP", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/120px-HP_logo_2012.svg.png" },
                                                            { name: "Dell", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dell_logo_2016.svg/120px-Dell_logo_2016.svg.png" }
                                                        ]).map((item, i) => {
                                                            const rawVal = typeof item === "string" ? item : (item?.name || item?.url || item?.logo || "");
                                                            if (!rawVal) return null;

                                                            const logoSrc = typeof item === "object" && item.logo ? item.logo : resolveCorporateLogoSrc(rawVal);
                                                            const logoName = getCorporateLogoDisplayName(rawVal);

                                                            return logoSrc ? (
                                                                <div
                                                                    key={i}
                                                                    className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center p-1.5"
                                                                >
                                                                    <img alt={logoName || ""} src={logoSrc} className="h-full w-full object-contain" />
                                                                </div>
                                                            ) : (
                                                                <span
                                                                    key={i}
                                                                    className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-bold text-gray-600 shadow-sm"
                                                                >
                                                                    {safeDisplay(logoName || rawVal)}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-5 pb-6 pt-3">
                                                <h3 className="mb-4 text-[15px] font-bold tracking-tight text-gray-900 dark:text-gray-100">Why Clients Choose Us for Consultation</h3>
                                                <div className="rounded-[8px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-card">
                                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        <li className="flex gap-4 px-4 py-3.5 md:px-5 md:py-4">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                                                                <img src="/why-us/zero-brokerage.svg" alt="" className="h-10 w-10 object-contain" />
                                                            </div>
                                                            <div className="min-w-0 pt-0.5">
                                                                <h4 className="text-[13.5px] font-bold text-[#354048] dark:text-gray-200 mb-0.5">Zero Brokerage</h4>
                                                                <p className="text-[12.5px] text-[#6b7b8a] dark:text-gray-400">100% Service, 0% Brokerage</p>
                                                            </div>
                                                        </li>
                                                        <li className="flex gap-4 px-4 py-3.5 md:px-5 md:py-4">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                                                                <img src="/why-us/low-price.svg" alt="" className="h-10 w-10 object-contain" />
                                                            </div>
                                                            <div className="min-w-0 pt-0.5">
                                                                <h4 className="text-[13.5px] font-bold text-[#354048] dark:text-gray-200 mb-0.5">Lowest Price Guaranteed</h4>
                                                                <p className="text-[12.5px] leading-[1.4] text-[#6b7b8a] dark:text-gray-400">
                                                                    Highly unlikely, but if you find a lower price anywhere, tell us and we will match it.
                                                                </p>
                                                            </div>
                                                        </li>
                                                        <li className="flex gap-4 px-4 py-3.5 md:px-5 md:py-4">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                                                                <img src="/why-us/full-service.svg" alt="" className="h-10 w-10 object-contain" />
                                                            </div>
                                                            <div className="min-w-0 pt-0.5">
                                                                <h4 className="text-[13.5px] font-bold text-[#354048] dark:text-gray-200 mb-0.5">Full Service Support</h4>
                                                                <p className="text-[12.5px] leading-[1.4] text-[#6b7b8a] dark:text-gray-400">
                                                                    Our sales personnel are accountable for every step
                                                                </p>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleShowInterestModal("callback")}
                                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#f8d01d] px-4 py-[13px] text-[15px] font-bold text-[#141414] shadow-sm hover:bg-[#e6bf15] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80"
                                                >
                                                    <Phone className="h-[18px] w-[18px] shrink-0 fill-current" strokeWidth={2.5} />
                                                    Request More Information or a Callback
                                                </button>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            {/* About the brand */}
                            <div
                                id="brand"
                                className="rounded-xl border border-gray-200/90 bg-white p-6 shadow-sm dark:border-border dark:bg-card md:p-8"
                            >
                                <div>
                                    <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900 dark:text-slate-100 md:text-xs">
                                        About the Brand
                                    </h3>
                                    <div className="mt-2.5 h-1 w-9 rounded-sm bg-blue-600 dark:bg-blue-500" aria-hidden />
                                </div>

                                <div className="mt-6 flex items-center gap-4">
                                    <img
                                        alt={`${brandDisplayName} logo`}
                                        src="/property-details/builder-details/builder-logo.svg"
                                        className="h-12 w-12 shrink-0 object-contain md:h-14 md:w-14"
                                    />
                                    <div className="min-w-0">
                                        <h4 className="text-lg font-bold leading-tight text-foreground md:text-xl">{brandDisplayName}</h4>
                                        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                            Workspace
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <img src="/property-details/builder-details/cities.svg" alt="Cities" className="h-[20px] w-[20px] shrink-0 object-contain drop-shadow-sm" />
                                        <span className="font-medium text-foreground">
                                            {brandStats.cities}+ Cities
                                        </span>
                                    </div>
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <img src="/property-details/builder-details/coworking.svg" alt="Coworking Spaces" className="h-[20px] w-[20px] shrink-0 object-contain drop-shadow-sm" />
                                        <span className="font-medium text-foreground">
                                            {brandStats.spaces}+ Coworking Spaces
                                        </span>
                                    </div>
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <img src="/property-details/builder-details/clients.svg" alt="Clients" className="h-[20px] w-[20px] shrink-0 object-contain drop-shadow-sm" />
                                        <span className="font-medium text-foreground">
                                            {brandStats.clients}+ Clients
                                        </span>
                                    </div>
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <img src="/property-details/builder-details/seats.svg" alt="Seats" className="h-[20px] w-[20px] shrink-0 object-contain drop-shadow-sm" />
                                        <span className="font-medium text-foreground">
                                            {brandStats.seats}+ Seats
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                    {showBrandDescription ? brandLongDesc : brandShortDesc}{" "}
                                    <button
                                        type="button"
                                        onClick={() => setShowBrandDescription(!showBrandDescription)}
                                        className="inline-flex items-center gap-0.5 p-0 align-baseline text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        {showBrandDescription ? "Read less" : "Read more"}
                                        {showBrandDescription ? (
                                            <ChevronUp className="h-4 w-4 shrink-0" aria-hidden />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                                        )}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleShowInterestModal("brand")}
                                    className="mt-8 flex w-full items-center justify-start gap-1 p-0 text-left text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Interested in {brandDisplayName} Workspace? Connect with us
                                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                                </button>
                            </div>
                            {/* Floor Plan */}
                            <div className="rounded-lg border bg-card shadow-sm">
                                <div className="p-6"><h3 className="text-lg font-bold">Floor Plan</h3></div>
                                <div className="border-t" />
                                <div className="p-6">
                                    <div className="relative w-full rounded-lg overflow-hidden border bg-gray-50" style={{ aspectRatio: '4/3', minHeight: 200 }}>
                                        {(typeof property.floorPlan === 'string' && property.floorPlan.trim()) ? (
                                            <Image
                                                src={property.floorPlan.startsWith('http') ? property.floorPlan : `https://admin.buildersinfo.in${property.floorPlan.startsWith('/') ? property.floorPlan : '/' + property.floorPlan}`}
                                                alt="Floor plan"
                                                fill
                                                className="object-contain p-4 cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={(e) => setFullScreenImage(e.currentTarget.src)}
                                                unoptimized
                                                sizes="(max-width: 400px) 100vw, 400px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No floor plan available</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Opening Hours */}
                            <div className="rounded-lg border theme-bg-card theme-shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="text-lg font-bold leading-none tracking-tight">Opening Hours</h3>
                                </div>
                                <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full" />
                                <div className="p-6 pt-6">
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Monday - Friday</span>
                                            <span className="font-medium">{(() => {
                                                const v = property?.openingHours?.mondayFriday;
                                                return typeof v === 'string' ? (v.trim() || '-') : (v?.enabled ? (`${v.open || ''} - ${v.close || ''}`.trim() || '-') : '-');
                                            })()}</span>
                                        </li>
                                        <li className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Saturday</span>
                                            {(() => {
                                                const v = property?.openingHours?.saturday;
                                                const str = typeof v === 'string' ? (v.trim() || '') : (v?.enabled ? `${v.open || ''} - ${v.close || ''}`.trim() : '');
                                                return str ? <span className="font-medium">{str}</span> : <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-500 text-white">Closed</span>;
                                            })()}
                                        </li>
                                        <li className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Sunday</span>
                                            {(() => {
                                                const v = property?.openingHours?.sunday;
                                                const str = typeof v === 'string' ? (v.trim() || '') : (v?.enabled ? `${v.open || ''} - ${v.close || ''}`.trim() : '');
                                                return str ? <span className="font-medium">{str}</span> : <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-500 text-white">Closed</span>;
                                            })()}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Schedule a Tour Sidebar Section - Redesigned to match Reference */}
                            <div className="tour-card border border-gray-100 mb-6">
                                <div className="tour-header-box">
                                    <h3>SCHEDULE A TOUR</h3>
                                </div>

                                <div className="tour-dates-container">
                                    <Swiper
                                        modules={[Navigation]}
                                        navigation={{ prevEl: ".tour-dates-prev", nextEl: ".tour-dates-next" }}
                                        spaceBetween={8}
                                        slidesPerView={4}
                                        className="w-full"
                                    >
                                        {tourDates.map((date, i) => {
                                            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                                            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                            const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                                            const selectedStr = `${selectedTourDate.getFullYear()}-${selectedTourDate.getMonth()}-${selectedTourDate.getDate()}`;
                                            const isSelected = dateStr === selectedStr;
                                            return (
                                                <SwiperSlide key={i}>
                                                    <div
                                                        onClick={() => setSelectedTourDate(date)}
                                                        className={`date-card-item ${isSelected ? "active" : ""}`}
                                                    >
                                                        <span className="day-name">{dayNames[date.getDay()]}</span>
                                                        <span className="day-num">{date.getDate()}</span>
                                                        <span className="month-name">{monthNames[date.getMonth()]}</span>
                                                    </div>
                                                </SwiperSlide>
                                            );
                                        })}
                                    </Swiper>
                                    <button type="button" onClick={(e) => handleSliderNavClick(e, true)} className="tour-dates-prev tour-nav-btn tour-nav-prev"><ChevronLeft className="h-4 w-4" /></button>
                                    <button type="button" onClick={(e) => handleSliderNavClick(e, false)} className="tour-dates-next tour-nav-btn tour-nav-next"><ChevronRight className="h-4 w-4" /></button>
                                </div>

                                <h4 className="tour-label">Tour Type</h4>
                                <div className="tour-type-toggle">
                                    <button
                                        type="button"
                                        onClick={() => setTourType("in-person")}
                                        className={`tour-type-option ${tourType === "in-person" || tourType === "in-person" ? "active" : ""}`}
                                    >
                                        In Person
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTourType("video-chat")}
                                        className={`tour-type-option ${tourType === "video-chat" ? "active" : ""}`}
                                    >
                                        Video Chat
                                    </button>
                                </div>

                                <form className="tour-form-container" onSubmit={handleTourSubmit}>
                                    <div className="tour-select-wrapper">
                                        <select
                                            className={`tour-field ${tourFormErrors.tourTime ? 'border-red-500' : ''}`}
                                            value={selectedTourTime}
                                            onChange={(e) => { setSelectedTourTime(e.target.value); setTourFormErrors((p) => ({ ...p, tourTime: '' })); }}
                                        >
                                            <option value="" disabled>Time</option>
                                            {TOUR_TIME_SLOTS.map(slot => (
                                                <option key={slot} value={slot}>{slot}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <input
                                            name="name"
                                            className={`tour-field ${tourFormErrors.name ? 'border-red-500' : ''}`}
                                            placeholder="Name"
                                            value={tourFormData.name}
                                            onChange={(e) => { setTourFormData((p) => ({ ...p, name: e.target.value })); setTourFormErrors((p) => ({ ...p, name: '' })); }}
                                        />
                                        {tourFormErrors.name && <p className="text-[10px] text-red-500 -mt-2 mb-2 ml-1">{tourFormErrors.name}</p>}
                                    </div>

                                    <input
                                        className="tour-field"
                                        placeholder="Phone"
                                        value={tourFormData.phone}
                                        onChange={(e) => setTourFormData((p) => ({ ...p, phone: e.target.value }))}
                                    />

                                    <div>
                                        <input
                                            name="email"
                                            className={`tour-field ${tourFormErrors.email ? 'border-red-500' : ''}`}
                                            placeholder="Email"
                                            type="email"
                                            value={tourFormData.email}
                                            onChange={(e) => { setTourFormData((p) => ({ ...p, email: e.target.value })); setTourFormErrors((p) => ({ ...p, email: '' })); }}
                                        />
                                        {tourFormErrors.email && <p className="text-[10px] text-red-500 -mt-2 mb-2 ml-1">{tourFormErrors.email}</p>}
                                    </div>

                                    <textarea
                                        className="tour-field min-h-[100px] resize-none"
                                        placeholder="Enter your Message"
                                        value={tourFormData.message}
                                        onChange={(e) => setTourFormData((p) => ({ ...p, message: e.target.value }))}
                                    />

                                    {tourFormErrors.submit && (
                                        <p className="text-xs text-red-500 mb-2">{tourFormErrors.submit}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmittingTour}
                                        className="tour-submit"
                                    >
                                        {isSubmittingTour ? "Submitting..." : "Submit a Tour Request"}
                                    </button>
                                </form>

                                <button
                                    type="button"
                                    onClick={handleTourSubmit}
                                    className="tour-footer-box"
                                >
                                    BOOK YOUR VIDEO TOUR NOW
                                </button>
                            </div>

                            {/* Rating & Reviews - Right sidebar (DB: ratings, reviews) */}
                            <div ref={reviewsRef} id="ratings-reviews" className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold leading-none tracking-tight">Rating &amp; Reviews</h3>
                                        {!hasUserSubmittedReview ? (
                                            <button onClick={handleAddReview} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-lg px-3 cursor-pointer">
                                                Rate property
                                            </button>
                                        ) : (
                                            <button onClick={() => handleEditReview()} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-lg px-3 cursor-pointer">
                                                Edit Review
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full" />
                                <div className="p-6 space-y-8 pt-6">
                                    <div>
                                        <p className="text-sm mb-4">Overall rating based on {ratingDisplay.totalRatings} reviews.</p>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="flex flex-col items-center justify-center">
                                                <p className="text-4xl font-bold">{ratingDisplay.overall}</p>
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={star} className={`w-5 h-5 ${star <= Math.round(ratingDisplay.overall) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{ratingDisplay.totalRatings} ratings</p>
                                            </div>
                                            <div>
                                                {[5, 4, 3, 2, 1].map((star) => {
                                                    const count = ratingDisplay.breakdown[star] ?? ratingDisplay.breakdown[String(star)] ?? 0;
                                                    const total = ratingDisplay.totalRatings || 1;
                                                    const percentage = Math.round((count / total) * 100);
                                                    return (
                                                        <div key={star} className="flex items-center gap-3">
                                                            <span className="text-sm w-16 whitespace-nowrap flex-shrink-0">{star} star</span>
                                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden leading-none">
                                                                <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }} />
                                                            </div>
                                                            <span className="text-sm w-10 text-right flex-shrink-0">{percentage}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full" />
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">User Reviews ({property?.reviews?.length || 0})</h3>
                                            {property?.reviews?.length > 0 && (
                                                <button onClick={() => setShowReviewsModal(true)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium underline-offset-4 hover:underline text-primary p-0 h-auto cursor-pointer">
                                                    View All
                                                </button>
                                            )}
                                        </div>
                                        {property?.reviews && property.reviews.length > 0 ? (
                                            <div className="relative w-full">
                                                <Swiper
                                                    modules={[Navigation]}
                                                    navigation={{ prevEl: ".reviews-prev", nextEl: ".reviews-next" }}
                                                    spaceBetween={16}
                                                    slidesPerView={1}
                                                    className="w-full -mx-4 px-4"
                                                >
                                                    {property.reviews.slice(0, 5).map((review, idx) => (
                                                        <SwiperSlide key={review._id || idx}>
                                                            <div className="p-1">
                                                                <div className="rounded-lg bg-card text-card-foreground shadow-sm border">
                                                                    <div className="p-4 space-y-3">
                                                                        <div className="flex justify-between items-start">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                                                    <UserCheck className="w-6 h-6 text-primary" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="font-semibold text-sm truncate max-w-[120px]">{safeDisplay(review.user)}</p>
                                                                                    <p className="text-[10px] text-muted-foreground">{safeDisplay(review.date)}</p>
                                                                                </div>
                                                                            </div>
                                                                            <span className="inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-green-200">{review.rating} <Star className="h-3 w-3 ml-1 fill-current" /></span>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            {review.goodThings && (
                                                                                <div>
                                                                                    <h4 className="font-semibold text-[11px] flex items-center gap-1.5"><CircleCheckBig className="h-3 w-3 text-green-500" /> Good things here</h4>
                                                                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{review.goodThings}</p>
                                                                                </div>
                                                                            )}
                                                                            {review.badThings && (
                                                                                <div>
                                                                                    <h4 className="font-semibold text-[11px] flex items-center gap-1.5"><Wrench className="h-3 w-3 text-orange-500" /> Things to improve</h4>
                                                                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{review.badThings}</p>
                                                                                </div>
                                                                            )}
                                                                            {!review.goodThings && !review.badThings && review.comment && (
                                                                                <p className="text-xs text-muted-foreground line-clamp-2">{review.comment}</p>
                                                                            )}
                                                                            <button onClick={() => setShowReviewsModal(true)} className="text-primary text-[11px] font-medium hover:underline cursor-pointer">read more</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </SwiperSlide>
                                                    ))}
                                                </Swiper>
                                                {property.reviews.length > 1 && (
                                                    <>
                                                        <button type="button" onClick={(e) => handleSliderNavClick(e, true)} className="reviews-prev swiper-nav-btn inline-flex items-center justify-center h-8 w-8 rounded-full border border-input bg-background hover:bg-accent absolute -left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer" aria-label="Previous slide"><ChevronLeft className="h-4 w-4" /></button>
                                                        <button type="button" onClick={(e) => handleSliderNavClick(e, false)} className="reviews-next swiper-nav-btn inline-flex items-center justify-center h-8 w-8 rounded-full border border-input bg-background hover:bg-accent absolute -right-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer" aria-label="Next slide"><ChevronRight className="h-4 w-4" /></button>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-muted/30 rounded-lg">
                                                <p className="text-sm text-muted-foreground mb-3">No reviews yet. Be the first to share your experience!</p>
                                                <button onClick={handleAddReview} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
                                                    Rate Now
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Properties - Boxed design */}
            <div id="similar-properties" className="w-full px-4 sm:px-6 lg:px-8 mt-12 mb-8">
                <section className="py-8 md:py-10 px-6 md:px-10 bg-[#fdf8e7] rounded-[24px] relative shadow-sm border border-[#f0e4c3]/10">
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                        <div>
                            <h2 className="text-3xl md:text-[2.2rem] font-bold text-black mb-1.5 tracking-tight">Similar Properties</h2>
                            <p className="text-gray-800 text-[13px] font-medium">Handpicked properties for you.</p>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex-nowrap shrink-0">
                            {(property.similarLocations && property.similarLocations.length > 0 ? property.similarLocations : ["Koramangala", "MG Road", "HSR", "Indiranagar", "Hebbal"]).map((loc) => (
                                <button
                                    key={loc}
                                    onClick={() => setSimilarLocationFilter(loc)}
                                    className={`px-4 py-[7px] text-[11px] font-bold whitespace-nowrap shrink-0 transition-colors ${similarLocationFilter === loc ? "bg-black text-white rounded-[6px]" : "bg-white text-gray-600 border border-gray-200/80 hover:border-gray-300 rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"}`}
                                >
                                    {loc}
                                </button>
                            ))}
                            <div className="relative shrink-0 flex items-center" ref={locationDropdownRef}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowLocationDropdown(!showLocationDropdown); }}
                                    className="text-[#f97316] text-[12px] font-bold hover:underline flex items-center gap-[2px] cursor-pointer ml-3 bg-transparent"
                                >
                                    View all <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} />
                                </button>
                                {showLocationDropdown && (
                                    <div className="absolute top-full right-0 mt-2 z-20 w-48 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl p-1 custom-scrollbar">
                                        {(property.allSimilarLocations || property.similarLocations || []).map((loc) => (
                                            <button
                                                key={loc}
                                                onClick={() => { setSimilarLocationFilter(loc); setShowLocationDropdown(false); }}
                                                className={`w-full px-3 py-2 text-left text-sm font-medium rounded-md transition-colors cursor-pointer ${similarLocationFilter === loc ? "bg-amber-100 text-[#f97316]" : "hover:bg-gray-50 text-gray-700"}`}
                                            >
                                                {loc}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {(() => {
                        const similarProps = (property.similarProperties || []).filter(p => p && (p.id || p.name));
                        const filteredProps = (!similarLocationFilter || similarProps.filter((p) => p?.locality === similarLocationFilter).length === 0)
                            ? similarProps
                            : similarProps.filter((p) => p?.locality === similarLocationFilter);

                        return (
                            <div className="relative mx-[-10px] md:mx-0 px-[10px] md:px-0">
                                <Swiper
                                    key={similarLocationFilter}
                                    modules={[Navigation]}
                                    navigation={{ prevEl: ".similar-prev", nextEl: ".similar-next" }}
                                    spaceBetween={20}
                                    slidesPerView={1.2}
                                    breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 4 } }}
                                    slidesPerGroup={1}
                                    className="w-full !pb-2"
                                >
                                    {filteredProps.map((p, idx) => (
                                        <SwiperSlide key={p?.id || p?.name || idx} className="h-auto">
                                            <Link href={`/property-details?id=${p?.id || '#'}`} className="block h-full">
                                                <div className="rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden group h-full border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                                                    <div className="relative h-[200px] md:h-[180px] w-full shrink-0 overflow-hidden bg-gray-100">
                                                        <img src={p?.image || p?.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'} alt={p?.name || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform" />
                                                        {p?.badge ? (
                                                            <div className="absolute top-3 left-3 bg-[#1e8b4e] text-white text-[9px] font-bold px-2 py-0.5 rounded-[3px] shadow-sm uppercase tracking-wide">
                                                                {p.badge}
                                                            </div>
                                                        ) : (
                                                            <div className="absolute top-3 left-3 bg-[#1e8b4e] text-white text-[9px] font-bold px-2 py-0.5 rounded-[3px] shadow-sm flex items-center gap-1 uppercase tracking-wide">
                                                                <span className="bg-white/20 rounded-full w-3 h-3 inline-flex items-center justify-center font-serif leading-none">₹</span> BEST PRICE GUARANTEE
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4 flex flex-col flex-1 justify-between bg-white z-10">
                                                        <div>
                                                            <div className="flex justify-between items-start mb-0.5">
                                                                <h3 className="font-bold text-gray-900 text-[15px] md:text-[16px] leading-tight truncate pr-2">{safeDisplay(p?.name)}</h3>
                                                                {(p?.ratingCount || idx === 0) && (
                                                                    <div className="flex items-center gap-[2px] shrink-0 pt-0.5">
                                                                        {[1, 2, 3, 4].map(star => <Star key={star} className="w-[10px] h-[10px] text-[#ffb800] fill-[#ffb800]" />)}
                                                                        <Star className="w-[10px] h-[10px] text-[#ffb800] fill-transparent" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-gray-500 capitalize leading-snug">{safeDisplay(p?.locality)}</p>
                                                        </div>
                                                        <div className="flex justify-between items-end mt-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="bg-black text-white w-7 h-6 flex items-center justify-center rounded-[4px]">
                                                                    <img src="https://cdn-icons-png.flaticon.com/512/3593/3593976.png" className="w-3.5 h-3.5 invert brightness-0" alt="Workspace" style={{ filter: 'brightness(0) invert(1)' }} />
                                                                </div>
                                                                <span className="text-[11px] font-extrabold text-black">{p?.ratingLabel || "Excellent"}</span>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <p className="font-bold text-[1.15rem] text-gray-900 leading-none tracking-tight">
                                                                    {typeof p?.price === 'string' && p.price.includes('₹') ? p.price : `₹ ${safeDisplay(p?.price) || "5,999"}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                                {filteredProps.length > 1 && (
                                    <>
                                        <button type="button" onClick={(e) => handleSliderNavClick(e, true)} className="similar-prev swiper-nav-btn absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-5 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#0070f3] text-white shadow-[0_4px_12px_rgba(0,112,243,0.3)] flex items-center justify-center hover:bg-[#005bb5] transition-colors cursor-pointer" aria-label="Previous properties"><ChevronLeft className="h-5 w-5" /></button>
                                        <button type="button" onClick={(e) => handleSliderNavClick(e, false)} className="similar-next swiper-nav-btn absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-5 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#0070f3] text-white shadow-[0_4px_12px_rgba(0,112,243,0.3)] flex items-center justify-center hover:bg-[#005bb5] transition-colors cursor-pointer" aria-label="Next properties"><ChevronRight className="h-5 w-5" /></button>
                                    </>
                                )}
                            </div>
                        );
                    })()}
                </section>
            </div>

            {/* Explore Top Coworking Locations */}
            <div className="w-full px-4 sm:px-6 lg:px-8 mb-16">
                <section className="py-8 md:py-10 px-6 md:px-10 bg-[#fdf8e7] rounded-[24px] relative shadow-sm border border-[#f0e4c3]/10">
                    <h2 className="text-[1.2rem] md:text-xl font-bold mb-6 text-black tracking-tight">Explore Top Coworking Locations in Bangalore</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
                        {((property.exploreLocations && property.exploreLocations.length > 0) ? property.exploreLocations : [
                            { name: "HSR Layout", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800" },
                            { name: "Koramangala", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800" },
                            { name: "MG Road", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800" },
                            { name: "Indiranagar", image: "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=800" },
                            { name: "Whitefield", image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&q=80&w=800" },
                            { name: "Sanjay Nagar", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800" },
                            { name: "Electronic city", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800" },
                            { name: "JP Nagar", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800" },
                            { name: "Jayanagar", image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&q=80&w=800" },
                            { name: "Hebbal", image: "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=800" }
                        ]).map((loc, i) => (
                            <Link key={i} href="#" className="rounded-[8px] border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden group flex flex-col hover:shadow-md transition-shadow">
                                <div className="relative aspect-[16/10] w-full bg-gray-100 overflow-hidden border-b border-gray-100">
                                    <img src={loc?.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'} alt={loc?.name || 'Explore'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform" />
                                </div>
                                <div className="p-3">
                                    <p className="text-[11px] text-gray-500 font-medium leading-none mb-1">Coworking Space in</p>
                                    <h3 className="font-semibold text-[13px] text-gray-800 truncate mb-1.5 leading-tight">{safeDisplay(loc?.name)}</h3>
                                    <p className="text-[11.5px] font-bold text-[#0070f3] hover:underline cursor-pointer leading-none">Explore Spaces</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>

            {/* Download App - Full width at bottom */}
            < section className="relative bg-primary text-primary-foreground overflow-hidden py-16" >
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary-foreground/10 rounded-full"></div>
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary-foreground/10 rounded-full"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-2 items-center gap-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl md:text-4xl font-bold mb-4">Brokerage - Free Real Estate at Your Fingertips</h2>
                            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto md:mx-0 text-sm md:text-base">Buildersinfo is India&apos;s first brokerage-free real estate discovery platform. Find properties, projects and builders in your city.</p>
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <a className="inline-block transition-transform hover:scale-105" href="#">
                                    <img
                                        alt="Download on the App Store"
                                        src="https://c.housingcdn.com/demand/s/client/common/assets/app-store.10009972.png"
                                        width="144"
                                        height="48"
                                        className="h-12 w-auto"
                                    />
                                </a>
                                <a className="inline-block transition-transform hover:scale-105" href="#">
                                    <img
                                        alt="Get it on Google Play"
                                        src="https://c.housingcdn.com/demand/s/client/common/assets/google-play.2c209e8c.png"
                                        width="144"
                                        height="48"
                                        className="h-12 w-auto"
                                    />
                                </a>
                            </div>
                        </div>
                        <div className="relative h-full min-h-[250px] md:min-h-[300px] hidden md:flex items-center justify-center">
                            <img
                                alt="BuildersInfo App on a phone"
                                src="https://i.ibb.co/v6CN21Pt/image-Photoroom.png"
                                width="300"
                                height="300"
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            </section >

            {/* Fixed Bottom Action Bar - sits above footer nav (footer ~56px) */}
            <div className="fixed left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-30" style={{ bottom: '56px' }}>
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
            </div >

            {/* Floating Chat Icon - above CTA bar, below Schedule FAB */}
            <div className="fixed right-4 z-40 md:hidden" style={{ bottom: '200px' }}>
                <button
                    onClick={handleShowInterestModal}
                    className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            </div >

            {/* Interest / Callback / Consultation Modal - all screens */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 pb-32 max-[525px]:pb-36 max-h-[min(90vh,90svh)] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-blue-600">
                                {interestFormType === "callback" && "Request More Information or Callback"}
                                {interestFormType === "consultation" && "Get Free Consultation"}
                                {interestFormType === "brand" && "Connect with us"}
                                {interestFormType === "property" && "Interested in this Property"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 cursor-pointer">✕</button>
                        </div>
                        <p className="text-gray-600 text-sm mb-6">
                            {interestFormType === "callback" && "Share your details and we'll call you back soon."}
                            {interestFormType === "consultation" && "Get a free workspace consultation tailored to your needs."}
                            {interestFormType === "brand" && "Let us know how we can help with your workspace needs."}
                            {interestFormType === "property" && "Fill your details for a customized quote."}
                        </p>
                        <form onSubmit={handleInterestModalSubmit} className="space-y-4">
                            {interestFormErrors.submit && (
                                <p className="text-xs text-red-500">{interestFormErrors.submit}</p>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Enter your name"
                                    value={interestFormData.name}
                                    onChange={(e) => { handleInterestInputChange(e); setInterestFormErrors((p) => ({ ...p, name: '' })); }}
                                    className={`w-full px-3 py-2 border rounded-lg ${interestFormErrors.name ? "border-red-500" : "border-gray-300"}`}
                                />
                                {interestFormErrors.name && <p className="text-xs text-red-500 mt-1">{interestFormErrors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Enter your email"
                                    value={interestFormData.email}
                                    onChange={handleInterestInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg ${interestFormErrors.email ? "border-red-500" : "border-gray-300"}`}
                                />
                                {interestFormErrors.email && <p className="text-xs text-red-500 mt-1">{interestFormErrors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    placeholder="Enter phone number"
                                    value={interestFormData.phone}
                                    onChange={handleInterestInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg ${interestFormErrors.phone ? "border-red-500" : "border-gray-300"}`}
                                />
                                {interestFormErrors.phone && <p className="text-xs text-red-500 mt-1">{interestFormErrors.phone}</p>}
                            </div>
                            {interestFormType === "callback" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred callback time</label>
                                    <select
                                        name="preferredCallbackTime"
                                        value={interestFormData.preferredCallbackTime}
                                        onChange={handleInterestInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="">Select preferred time</option>
                                        <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                                        <option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM - 5 PM)</option>
                                        <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                                        <option value="Anytime">Anytime</option>
                                    </select>
                                </div>
                            )}
                            {interestFormType === "consultation" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            placeholder="Your company (optional)"
                                            value={interestFormData.companyName}
                                            onChange={handleInterestInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of seats needed</label>
                                        <input
                                            type="text"
                                            name="numberOfSeats"
                                            placeholder="e.g. 10, 20-30 (optional)"
                                            value={interestFormData.numberOfSeats}
                                            onChange={handleInterestInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                </>
                            )}
                            {interestFormType === "brand" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">I'm interested in</label>
                                    <select
                                        name="interestType"
                                        value={interestFormData.interestType}
                                        onChange={handleInterestInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="">Select interest</option>
                                        <option value="New workspace">New workspace</option>
                                        <option value="Expansion">Expansion</option>
                                        <option value="Custom solution">Custom solution</option>
                                        <option value="General inquiry">General inquiry</option>
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    name="message"
                                    placeholder={interestFormType === "callback" ? "What information do you need? (optional)" : "Enter your message (optional)"}
                                    rows={3}
                                    value={interestFormData.message}
                                    onChange={handleInterestInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmittingInterest}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmittingInterest ? "Submitting..." : "Submit"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Reviews Modal */}
            {
                showReviewsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-xl max-h-[min(90vh,90svh)] overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                                <h3 className="text-xl font-bold">All Ratings & Reviews</h3>
                                <div className="flex items-center gap-3">
                                    {/* Show Add Review button if: not logged in OR logged in but no review submitted */}
                                    {(!currentUser || (currentUser && !hasUserSubmittedReview)) && (
                                        <button
                                            onClick={() => {
                                                setShowReviewsModal(false);
                                                handleAddReview();
                                            }}
                                            className="bg-[#f8c02f] text-gray-800 px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-[#e0ad2a] cursor-pointer transition-colors"
                                        >
                                            Add Review
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowReviewsModal(false)}
                                        className="text-gray-400 hover:text-gray-900 text-2xl w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="overflow-y-auto p-5 pb-32 max-[525px]:pb-36 flex-1">
                                {property.reviews && property.reviews.length > 0 ? (
                                    <div className="space-y-5">
                                        {property.reviews.map((review, index) => {
                                            const isUserReview = isReviewByCurrentUser(review);

                                            return (
                                                <div key={review._id || review.id || index} className="border-b pb-5 last:border-b-0 pt-2">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                                <UserCheck className="w-6 h-6 text-primary" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-gray-900">{safeDisplay(review.user)}</span>
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                                                                        {review.rating} <Star className="h-2.5 w-2.5 ml-0.5 fill-current" />
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-gray-500">{safeDisplay(review.date)}</p>
                                                            </div>
                                                        </div>
                                                        {isUserReview && (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setShowReviewsModal(false);
                                                                        handleEditReview(review);
                                                                    }}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                                                    title="Edit review"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteReview(review);
                                                                    }}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                                                    title="Delete review"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3 ml-13">
                                                        {review.goodThings && (
                                                            <div>
                                                                <h4 className="font-semibold text-sm flex items-center gap-2 text-green-700">
                                                                    <CircleCheckBig className="h-4 w-4" /> Good things here
                                                                </h4>
                                                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.goodThings}</p>
                                                            </div>
                                                        )}
                                                        {review.badThings && (
                                                            <div>
                                                                <h4 className="font-semibold text-sm flex items-center gap-2 text-orange-700">
                                                                    <Wrench className="h-4 w-4" /> Things to improve
                                                                </h4>
                                                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.badThings}</p>
                                                            </div>
                                                        )}
                                                        {!review.goodThings && !review.badThings && review.comment && (
                                                            <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500 mb-4">No reviews available</p>
                                        {currentUser && !hasUserSubmittedReview && (
                                            <button
                                                onClick={() => {
                                                    setShowReviewsModal(false);
                                                    handleAddReview();
                                                }}
                                                className="bg-[#f8c02f] text-gray-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#e0ad2a] cursor-pointer transition-colors"
                                            >
                                                Be the first to review
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* All Amenities Modal - grouped by category (DB: amenities) */}
            {showAmenitiesModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="amenities-modal-title" onClick={() => setShowAmenitiesModal(false)}>
                    <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-xl max-h-[min(90vh,90svh)] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg flex flex-col" onClick={(e) => e.stopPropagation()} style={{ maxHeight: 'min(90vh, 90svh)' }}>
                        <div className="flex flex-col space-y-1.5 text-center sm:text-left shrink-0">
                            <h2 id="amenities-modal-title" className="tracking-tight text-2xl font-bold">All Amenities</h2>
                        </div>
                        <button type="button" onClick={() => setShowAmenitiesModal(false)} className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 p-1 z-10" aria-label="Close">
                            <X className="h-5 w-5" />
                        </button>
                        <div className="overflow-y-auto flex-1 min-h-0 pt-4 -mt-2 pr-2 pb-32 max-[525px]:pb-36">
                            <div className="space-y-6">
                                {(() => {
                                    const amenities = property?.amenities || [];
                                    const grouped = amenities.reduce((acc, a) => {
                                        const name = typeof a === 'object' ? a?.name : a;
                                        if (!name) return acc;
                                        const category = getAmenityCategory(a, name);
                                        if (!acc[category]) acc[category] = [];
                                        const iconSrc = mapAmenityToObject(name)?.image || DEFAULT_AMENITY_ICON;
                                        acc[category].push({ name, iconSrc });
                                        return acc;
                                    }, {});
                                    return AMENITY_CATEGORY_ORDER.map((cat) => (
                                        <div key={cat}>
                                            <h3 className="font-semibold text-lg mb-4">{AMENITY_CATEGORY_LABELS[cat]}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(grouped[cat] || []).map((item, i) => (
                                                    <div key={`${item.name}-${i}`} className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] shrink-0">
                                                            <img src={item.iconSrc} alt={item.name} className="h-5 w-5 object-contain" />
                                                        </div>
                                                        <span className="text-sm">{item.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Submit Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
                    <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg sm:max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                            <h2 className="tracking-tight text-xl font-bold">Rate Property</h2>
                            <p className="text-sm text-muted-foreground">Share your experience with the community.</p>
                        </div>
                        <form className="space-y-6 p-4 md:p-0" onSubmit={async (e) => {
                            e.preventDefault();
                            if (!selectedRating) {
                                alert('Please select a rating');
                                return;
                            }
                            if (!reviewGoodThings.trim()) {
                                alert('Please share what you liked about this property');
                                return;
                            }

                            setIsSubmittingReview(true);
                            setReviewSubmitSuccess(false);

                            try {
                                const propertyId = property._id || property.id;
                                const propertyType = property.propertyType;

                                // Always get the latest user data from localStorage
                                let latestUser = currentUser;
                                try {
                                    const userJson = localStorage.getItem('currentUser');
                                    if (userJson) {
                                        latestUser = JSON.parse(userJson);
                                    }
                                } catch (e) {
                                    console.error('Error reading user from localStorage in submit:', e);
                                }

                                // Get phone number
                                let userPhoneNumber = latestUser?.phoneNumber ||
                                    latestUser?.phone ||
                                    latestUser?.userPhoneNumber ||
                                    (latestUser?.user && latestUser.user.phoneNumber) ||
                                    null;

                                if (userPhoneNumber && typeof userPhoneNumber === 'string') {
                                    userPhoneNumber = userPhoneNumber.trim();
                                }

                                if (!userPhoneNumber) {
                                    alert('Unable to get your phone number from session. Please make sure you are logged in.');
                                    setIsSubmittingReview(false);
                                    return;
                                }

                                const requestBody = {
                                    propertyId,
                                    propertyType,
                                    user: (userName || latestUser?.name || 'Anonymous').trim(),
                                    rating: selectedRating,
                                    comment: reviewGoodThings.trim(),
                                    goodThings: reviewGoodThings.trim(),
                                    badThings: reviewBadThings.trim(),
                                    userPhoneNumber: userPhoneNumber
                                };

                                if (isEditingReview && userReview) {
                                    requestBody.reviewId = userReview._id || userReview.id;
                                }

                                let response;
                                if (isEditingReview && userReview) {
                                    response = await fetch('/api/reviews', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(requestBody),
                                    });
                                } else {
                                    response = await fetch('/api/reviews', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(requestBody),
                                    });
                                }

                                const data = await response.json();

                                if (data.success) {
                                    setReviewSubmitSuccess(true);
                                    const updatedProperty = await refreshPropertyData();
                                    if (updatedProperty) {
                                        setProperty(prev => ({
                                            ...prev,
                                            reviews: updatedProperty.reviews || [],
                                            ratings: updatedProperty.ratings || prev.ratings
                                        }));
                                        checkUserReview(updatedProperty);
                                    }
                                    setTimeout(() => {
                                        setShowRatingModal(false);
                                        setReviewSubmitSuccess(false);
                                    }, 1500);
                                } else {
                                    alert('Failed to submit review: ' + (data.message || 'Unknown error'));
                                }
                            } catch (error) {
                                console.error('Error submitting review:', error);
                                alert('An error occurred. Please try again.');
                            } finally {
                                setIsSubmittingReview(false);
                            }
                        }}>
                            <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setSelectedRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none cursor-pointer group"
                                        >
                                            <Star
                                                className={`h-8 w-8 transition-all group-hover:scale-110 ${star <= (hoverRating || selectedRating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {reviewSubmitSuccess && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg text-center text-sm animate-in fade-in slide-in-from-top-1">
                                    {isEditingReview ? 'Review updated successfully!' : 'Review submitted successfully!'}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm leading-none flex items-center gap-2 font-semibold">
                                    <CircleCheckBig className="h-5 w-5 text-green-500" />
                                    Good things here
                                </label>
                                <textarea
                                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px] transition-all"
                                    placeholder="Share what you liked about this property..."
                                    value={reviewGoodThings}
                                    onChange={(e) => setReviewGoodThings(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm leading-none flex items-center gap-2 font-semibold">
                                    <Wrench className="h-5 w-5 text-orange-500" />
                                    Things to improve
                                </label>
                                <textarea
                                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px] transition-all"
                                    placeholder="What could be better? Your feedback helps..."
                                    value={reviewBadThings}
                                    onChange={(e) => setReviewBadThings(e.target.value)}
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-lg px-8 w-full shadow-lg shadow-primary/20 active:scale-[0.98]"
                                    type="submit"
                                    disabled={isSubmittingReview}
                                >
                                    {isSubmittingReview ? (isEditingReview ? 'Updating...' : 'Submitting...') : (isEditingReview ? 'Update Review' : 'Submit Review')}
                                </button>
                            </div>
                        </form>
                        <button
                            type="button"
                            onClick={() => setShowRatingModal(false)}
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-50 cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Desktop Layout (md and above) - hidden; using unified responsive layout above */}
            <div className="hidden">
                {/* Main Content */}
                <div className="w-full px-12 py-6">
                    <div className="mb-6 scroll-animate" data-animation="animate-pop">
                        <AnimatedText className="text-lg font-bold inline-block" lineColor="#f8c02f">
                            <h1>Showing Spaces in {safeDisplay(property.address?.city || property.city) !== "-" ? safeDisplay(property.address?.city || property.city) : (safeDisplay(property.displayAddress || property.addressDisplay || property.location) !== "-" ? (property.displayAddress || property.addressDisplay || property.location)?.split(',').pop()?.trim() : 'Delhi')}</h1>
                        </AnimatedText>
                    </div>

                    {/* Image Gallery - Full Width */}
                    <div className="relative mb-6 scroll-animate" data-animation="animate-slide-top">
                        <div className="flex gap-3">
                            {/* Main Image */}
                            <div className="flex-1 relative group h-80 overflow-hidden rounded-xl">
                                <img
                                    src={images[currentImageIndex]}
                                    alt="Property"
                                    className="w-full h-full object-cover transition-transform duration-300 cursor-pointer"
                                    onClick={() => setFullScreenImage(images[currentImageIndex])}
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

                                {/* Bottom Right - Show all X photos overlay */}
                                {images.length > 1 && (
                                    <div className="absolute bottom-4 right-4 cursor-pointer">
                                        <button
                                            onClick={openGallery}
                                            className="bg-black/50 backdrop-blur-sm text-white rounded-xl border-2 border-white/60 px-4 py-3 flex flex-col items-center justify-center hover:bg-black/60 transition-all duration-200 shadow-lg cursor-pointer"
                                        >
                                            <Camera className="h-8 w-8 mb-1" strokeWidth={2} stroke="currentColor" fill="none" />
                                            <span className="text-sm font-semibold leading-tight">Show all {images.length} photos</span>
                                        </button>
                                    </div>
                                )}

                                {/* Dots */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                                    {images.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-2 h-2 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Thumbnail Grid - 2x2 + Show all */}
                            <div className="w-80 grid grid-cols-2 gap-2">
                                <div className="aspect-square overflow-hidden rounded-xl cursor-pointer scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: '100ms' }}>
                                    <img
                                        src={images[1] || images[0]}
                                        alt="Thumbnail 1"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        onClick={() => setFullScreenImage(images[1] || images[0])}
                                    />
                                </div>
                                <div className="aspect-square overflow-hidden rounded-xl cursor-pointer scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: '200ms' }}>
                                    <img
                                        src={images[2] || images[0]}
                                        alt="Thumbnail 2"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        onClick={() => setFullScreenImage(images[2] || images[0])}
                                    />
                                </div>
                                <div className="aspect-square overflow-hidden rounded-xl cursor-pointer scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: '300ms' }}>
                                    <img
                                        src={images[3] || images[0]}
                                        alt="Thumbnail 3"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        onClick={() => setFullScreenImage(images[3] || images[0])}
                                    />
                                </div>
                                <div className="aspect-square overflow-hidden rounded-xl cursor-pointer scroll-animate relative" data-animation="animate-fade-up" style={{ animationDelay: '400ms' }} onClick={images.length > 4 ? openGallery : () => setFullScreenImage(images[4] || images[0])}>
                                    <img
                                        src={images[4] || images[0]}
                                        alt="Thumbnail 4"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                    />
                                    {images.length > 4 && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                                            <Camera className="h-8 w-8 mb-1" strokeWidth={2} stroke="currentColor" fill="none" />
                                            <span className="text-xs font-semibold text-center px-1">Show all {images.length} photos</span>
                                        </div>
                                    )}
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
                                <h2 className="text-xl font-bold mb-2 scroll-animate" data-animation="animate-pop">{safeDisplay(property.propertyName || property.name)}</h2>
                                <p className="text-sm text-gray-600 mb-3 scroll-animate" data-animation="animate-fade-up">{safeDisplay(property.displayAddress || property.addressDisplay || property.location)}</p>

                                {/* Price */}
                                <div className="flex items-center gap-3 mb-5 scroll-animate" data-animation="animate-fade-up">
                                    <span className="text-lg text-red-500 line-through">{safeDisplay(originalPrice)}</span>
                                    <img
                                        src="/property-details/right-arrow.png"
                                        alt="Arrow"
                                        className="w-8 h-8 object-contain"
                                    />
                                    <span className="text-xl font-bold">{safeDisplay(discountedPrice)}</span>
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
                                            const name = typeof amenity === 'string' ? amenity : amenity?.name;
                                            if (!name) return null;
                                            const truncatedName = name.length > 15 ? name.substring(0, 15) + '...' : name;
                                            const iconSrc = mapAmenityToObject(name)?.image || DEFAULT_AMENITY_ICON;
                                            return (
                                                <div key={`${name}-${i}`} className="text-center relative group p-3 scroll-animate" data-animation="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                                                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white shadow-md flex items-center justify-center">
                                                        <img src={iconSrc} alt={name} className="w-5 h-5 text-primary object-contain" />
                                                    </div>
                                                    <p className="text-[0.6rem] text-gray-700">{truncatedName}</p>
                                                    {name.length > 15 && (
                                                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-[9999]">
                                                            {name}
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
                                            {property.openingHours?.mondayFriday != null && (
                                                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                                    <span className="text-base font-semibold text-gray-800">Monday - Friday</span>
                                                    <span className="text-base font-semibold text-green-600">
                                                        {(() => {
                                                            const v = property.openingHours.mondayFriday;
                                                            return typeof v === 'string' ? (v.trim() || '-') : (v?.enabled ? `${safeDisplay(v.open)} - ${safeDisplay(v.close)}`.trim() || 'Open All Day' : 'Closed');
                                                        })()}
                                                    </span>
                                                </div>
                                            )}
                                            {property.openingHours?.saturday != null && (
                                                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                                    <span className="text-base font-semibold text-gray-800">Saturday</span>
                                                    <span className="text-base font-semibold text-green-600">
                                                        {(() => {
                                                            const v = property.openingHours.saturday;
                                                            return typeof v === 'string' ? (v.trim() || '-') : (v?.enabled ? `${safeDisplay(v.open)} - ${safeDisplay(v.close)}`.trim() || 'Open All Day' : 'Closed');
                                                        })()}
                                                    </span>
                                                </div>
                                            )}
                                            {property.openingHours?.sunday != null && (
                                                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                                    <span className="text-base font-semibold text-gray-800">Sunday</span>
                                                    <span className="text-base font-semibold text-green-600">
                                                        {(() => {
                                                            const v = property.openingHours.sunday;
                                                            return typeof v === 'string' ? (v.trim() || '-') : (v?.enabled ? `${safeDisplay(v.open)} - ${safeDisplay(v.close)}`.trim() || 'Open All Day' : 'Closed');
                                                        })()}
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
                                    if (!interestFormData.name?.trim() || !interestFormData.email?.trim() || !interestFormData.phone?.trim()) {
                                        alert("Name, email, and phone are required.");
                                        return;
                                    }
                                    setIsSubmittingInterest(true);
                                    try {
                                        const response = await fetch('/api/property-interest', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                propertyName: property?.propertyName || property?.name,
                                                propertyId: property?._id,
                                                name: interestFormData.name,
                                                email: interestFormData.email,
                                                phone: interestFormData.phone,
                                                message: interestFormData.message,
                                            }),
                                        });
                                        const data = await response.json();
                                        if (data.success) {
                                            setInterestFormData({ name: "", email: "", phone: "", message: "" });
                                            setShowSuccessTooltip(true);
                                            setTimeout(() => setShowSuccessTooltip(false), 5000);
                                            alert('Submitted successfully! We will get back to you soon.');
                                        } else {
                                            alert(data.message || 'Failed to submit. Please try again.');
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
                                        name="name"
                                        placeholder="Name *"
                                        required
                                        value={interestFormData.name}
                                        onChange={handleInterestInputChange}
                                        className="w-full px-3 py-2.5 border-0 rounded-lg bg-white shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address *"
                                        required
                                        value={interestFormData.email}
                                        onChange={handleInterestInputChange}
                                        className="w-full px-3 py-2.5 border-0 rounded-lg bg-white shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                    />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone Number *"
                                        required
                                        value={interestFormData.phone}
                                        onChange={handleInterestInputChange}
                                        className="w-full px-3 py-2.5 border-0 rounded-lg bg-white shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                    />
                                    <textarea
                                        name="message"
                                        placeholder="Messages"
                                        rows={3}
                                        value={interestFormData.message}
                                        onChange={handleInterestInputChange}
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
                                    {(property.isNegotiablePrice ?? property.isNegotiable) !== undefined && (property.isNegotiablePrice ?? property.isNegotiable) !== null && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Negotiable</span>
                                            <span className={`text-base font-semibold ${(property.isNegotiablePrice ?? property.isNegotiable) ? 'text-green-600' : 'text-red-600'}`}>
                                                {(property.isNegotiablePrice ?? property.isNegotiable) ? 'Yes' : 'No'}
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
                                    {(property.builderName || property.brandDetails?.name || property.builder) && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Builder Name</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.builderName || property.brandDetails?.name || property.builder)}</span>
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
                                    {((typeof property.facilities === 'string' && property.facilities.trim()) || (Array.isArray(property.facilities) && property.facilities.length > 0)) && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate col-span-3" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Facilities</span>
                                            <span className="text-base font-semibold text-gray-800">{typeof property.facilities === 'string' ? property.facilities.trim() : property.facilities.map(f => f?.name || f).filter(Boolean).join(', ')}</span>
                                        </div>
                                    )}
                                    {(property.builderName || property.brandDetails?.name || property.builder) && (
                                        <div className="bg-gray-50 p-4 rounded-lg scroll-animate" data-animation="animate-fade-up">
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Builder Name</span>
                                            <span className="text-base font-semibold text-gray-800">{safeDisplay(property.builderName || property.brandDetails?.name || property.builder)}</span>
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
                                            title: property.propertyName || property.name,
                                            useDefaultIcon: true,
                                            infoContent: `<div style="padding: 10px;"><strong>${property.propertyName || property.name}</strong><br/>${property.displayAddress || property.addressDisplay || property.location || ''}<br/><span style="color: #ef4444; font-weight: bold;">Property Location</span></div>`
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
                                    property.nearbyPlaces[activeCategory].slice(0, showMoreNearby ? undefined : 3).map((place, i) => (
                                        <div key={i} className="flex items-center justify-between py-2.5 border-b">
                                            <span className="font-medium text-sm text-gray-900">{safeDisplay(place.name)}</span>
                                            <span className="text-xs text-gray-500">{safeDisplay(place.distance)}</span>
                                        </div>
                                    ))
                                    : <p className="text-gray-500">No nearby places available</p>
                                }
                            </div>

                            {/* View More Button */}
                            {property.nearbyPlaces && property.nearbyPlaces[activeCategory] && property.nearbyPlaces[activeCategory].length > 3 && (
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
                                    {/* Show Add Review button if: not logged in OR logged in but no review submitted */}
                                    {(!currentUser || (currentUser && !hasUserSubmittedReview)) && (
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
                                            className={`w-5 h-5 ${(property.ratings?.overall > 0 && star <= property.ratings.overall) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
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
                                        <div key={star} className="flex items-center gap-4">
                                            <span className="text-xs font-medium w-16 whitespace-nowrap flex-shrink-0">{star} Star</span>
                                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-yellow-400 h-1.5 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium w-10 text-right flex-shrink-0">{Math.round(percentage)}%</span>
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
                        </div>

                        {/* Property Videos Section - Full Width */}
                        {((property.propertyVideos && property.propertyVideos.length > 0) || property.video) && (
                            <div className="bg-white rounded-2xl p-5 mb-6 scroll-animate" data-animation="animate-slide-top">
                                <AnimatedText className="text-lg font-bold mb-3 inline-block" delay={1700} lineColor="#f8c02f">
                                    <h3>Property Videos</h3>
                                </AnimatedText>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                                    {(property.propertyVideos?.length ? property.propertyVideos : (property.video ? [{ url: property.video, thumbnail: images[0] || '' }] : [])).filter(v => v?.url).map((video, i) => {
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
                        {property.propertyType === 'commercial' && ((property.seatLayoutPDFs && property.seatLayoutPDFs.length > 0) || property.pdf) && (
                            <div className="bg-white rounded-2xl p-5 mb-6 scroll-animate" data-animation="animate-slide-top">
                                <AnimatedText className="text-lg font-bold mb-3 inline-block" delay={1800} lineColor="#f8c02f">
                                    <h3>Property Documents</h3>
                                </AnimatedText>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                                    {(property.seatLayoutPDFs?.length ? property.seatLayoutPDFs : [{ url: property.pdf, originalName: 'Property Brochure' }]).filter(p => p?.url).map((pdf, i) => (
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
                                    {property.floorPlans && property.floorPlans[selectedCapacity] && property.floorPlans[selectedCapacity].length > 0 ? (
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
                                        <div className="col-span-full flex items-center justify-center text-muted-foreground text-sm py-8">No floor plans available</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Promotional Banner Section - Full Width */}
                <section className="relative bg-primary text-primary-foreground overflow-hidden py-16 mt-6 md:mt-12 rounded-lg md:rounded-3xl scroll-animate" data-animation="animate-slide-top">
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary-foreground/10 rounded-full"></div>
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary-foreground/10 rounded-full"></div>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid md:grid-cols-2 items-center gap-8">
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl md:text-4xl font-bold mb-4">Brokerage - Free Real Estate at Your Fingertips</h2>
                                <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto md:mx-0 text-sm md:text-base">Buildersinfo is India&apos;s first brokerage-free real estate discovery platform. Find properties, projects and builders in your city.</p>
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <a className="inline-block transition-transform hover:scale-105" href="#">
                                        <img
                                            alt="Download on the App Store"
                                            src="https://c.housingcdn.com/demand/s/client/common/assets/app-store.10009972.png"
                                            width="144"
                                            height="48"
                                            className="h-12 w-auto"
                                        />
                                    </a>
                                    <a className="inline-block transition-transform hover:scale-105" href="#">
                                        <img
                                            alt="Get it on Google Play"
                                            src="https://c.housingcdn.com/demand/s/client/common/assets/google-play.2c209e8c.png"
                                            width="144"
                                            height="48"
                                            className="h-12 w-auto"
                                        />
                                    </a>
                                </div>
                            </div>
                            <div className="relative h-full min-h-[250px] md:min-h-[300px] hidden md:flex items-center justify-center">
                                <img
                                    alt="BuildersInfo App on a phone"
                                    src="https://i.ibb.co/v6CN21Pt/image-Photoroom.png"
                                    width="300"
                                    height="300"
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Reviews Modal - Desktop */}
                {showReviewsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-xl max-h-[min(90vh,90svh)] overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                                <h3 className="text-2xl font-bold">All Ratings & Reviews</h3>
                                <div className="flex items-center gap-3">
                                    {/* Show Add Review button if: not logged in OR logged in but no review submitted */}
                                    {(!currentUser || (currentUser && !hasUserSubmittedReview)) && (
                                        <button
                                            onClick={() => {
                                                setShowReviewsModal(false);
                                                handleAddReview();
                                            }}
                                            className="bg-[#f8c02f] text-gray-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#e0ad2a] cursor-pointer transition-colors"
                                        >
                                            Add Review
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowReviewsModal(false)}
                                        className="text-gray-400 hover:text-gray-900 text-2xl w-10 h-10 flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="overflow-y-auto p-6 pb-32 max-[525px]:pb-36 flex-1">
                                {property.reviews && property.reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {property.reviews.map((review, index) => {
                                            const isUserReview = isReviewByCurrentUser(review);

                                            return (
                                                <div key={review._id || review.id || index} className="border-b pb-6 last:border-b-0">
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
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setShowReviewsModal(false);
                                                                            handleEditReview(review);
                                                                        }}
                                                                        className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                                                                        title="Edit review"
                                                                    >
                                                                        <Edit className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteReview(review);
                                                                        }}
                                                                        className="text-red-600 hover:text-red-800 cursor-pointer transition-colors"
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
                                    <div className="text-center py-10">
                                        <p className="text-gray-500 mb-4">No reviews available</p>
                                        {currentUser && !hasUserSubmittedReview && (
                                            <button
                                                onClick={() => {
                                                    setShowReviewsModal(false);
                                                    handleAddReview();
                                                }}
                                                className="bg-[#f8c02f] text-gray-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#e0ad2a] cursor-pointer transition-colors"
                                            >
                                                Be the first to review
                                            </button>
                                        )}
                                    </div>
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

                                            if (!userPhoneNumber) {
                                                alert('Unable to get your phone number from session. Please make sure you are logged in.');
                                                setIsSubmittingReview(false);
                                                return;
                                            }

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
                                                        userPhoneNumber: userPhoneNumber
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
                                                        userPhoneNumber: userPhoneNumber
                                                    }),
                                                });
                                            }

                                            const data = await response.json();

                                            if (data.success) {
                                                setReviewSubmitSuccess(true);

                                                // Refresh property data to get updated reviews
                                                const updatedProperty = await refreshPropertyData();

                                                if (updatedProperty) {
                                                    // Update property state with fresh data
                                                    setProperty(prev => ({
                                                        ...prev,
                                                        reviews: updatedProperty.reviews || [],
                                                        ratings: updatedProperty.ratings || prev.ratings
                                                    }));

                                                    // Immediately check for user review with updated property data
                                                    // This will set hasUserSubmittedReview to true if review exists
                                                    checkUserReview(updatedProperty);

                                                    // Also force a re-check after a brief delay to ensure state is updated
                                                    setTimeout(() => {
                                                        checkUserReview(updatedProperty);
                                                    }, 100);
                                                }

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

            {/* Show All Photos Modal */}
            {/* All Photos Modal - images only */}
            {showAllPhotosModal && images.length > 0 && (
                <div className="fixed inset-0 bg-black/90 flex flex-col z-[9999]" onClick={() => setShowAllPhotosModal(false)}>
                    <div className="flex items-center justify-between p-4 bg-black/50">
                        <h3 className="text-white text-lg font-bold">All Photos ({images.length})</h3>
                        <button onClick={(e) => { e.stopPropagation(); setShowAllPhotosModal(false); }} className="p-2 rounded-full hover:bg-white/20 text-white cursor-pointer"><X className="h-6 w-6" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 pb-32 max-[525px]:pb-36" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {images.map((img, i) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => { setFullScreenImage(img); setShowAllPhotosModal(false); }}>
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Video Modal - separate modal for video */}
            {showVideoModal && (property.propertyVideos?.[0]?.url || property.video) && (
                <div className="fixed inset-0 bg-black/90 flex flex-col z-[9999]" onClick={() => setShowVideoModal(false)}>
                    <div className="flex items-center justify-between p-4 bg-black/50">
                        <h3 className="text-white text-lg font-bold">Video</h3>
                        <button onClick={(e) => { e.stopPropagation(); setShowVideoModal(false); }} className="p-2 rounded-full hover:bg-white/20 text-white cursor-pointer"><X className="h-6 w-6" /></button>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                        <video controls autoPlay className="max-w-full max-h-[80vh] rounded-xl" src={property.propertyVideos?.[0]?.url || property.video}>
                            <source src={property.propertyVideos?.[0]?.url || property.video} type={getVideoMimeType(property.propertyVideos?.[0]?.url || property.video)} />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            )}

            {/* Full Screen Image Modal */}
            {
                fullScreenImage && (
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
                )
            }

            {/* PDF Viewer Modal */}
            {
                selectedPDF && (
                    <PDFViewer
                        pdf={selectedPDF}
                        onClose={() => setSelectedPDF(null)}
                    />
                )
            }

            {/* Login Modal */}
            {
                isLoginOpen && (
                    <LoginModal
                        onClose={() => setIsLoginOpen(false)}
                        onProceed={handleLoginSuccess}
                    />
                )
            }
            {/* Fixed bottom-right: Schedule a Tour FAB - above footer + CTA on mobile so no overlap */}
            <div className="fixed bottom-[130px] md:bottom-6 right-4 max-[525px]:right-3 z-50 flex flex-col items-end">
                {/* Schedule a Tour Modal - Anchored floating popup */}
                {showTourModal && (
                    <div className="relative w-[360px] max-[425px]:w-[calc(100vw-32px)] mb-3 group/modal">
                        {/* Compact Backdrop for anchored modal */}
                        <div className="fixed inset-0 z-[-1] bg-black/5 md:bg-transparent" onClick={() => setShowTourModal(false)} />

                        <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-slide-up-fade flex flex-col max-h-[min(80vh,80svh)]">
                            {/* Gradient Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Schedule a Tour
                                        </h3>
                                        <p className="text-blue-100 text-xs mt-0.5">Quickly book your property visit</p>
                                    </div>
                                    <button
                                        onClick={() => setShowTourModal(false)}
                                        className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 pb-32 max-[525px]:pb-36 overflow-y-auto space-y-5 custom-scrollbar">
                                {/* Date Selection */}
                                <div className="space-y-3">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">1. Choose Date</p>
                                    <div className="relative">
                                        <Swiper
                                            modules={[Navigation]}
                                            navigation={{ prevEl: ".tour-dates-modal-prev", nextEl: ".tour-dates-modal-next" }}
                                            spaceBetween={8}
                                            slidesPerView="auto"
                                            slidesPerGroup={2}
                                            breakpoints={{ 320: { slidesPerView: 4 } }}
                                            className="w-full"
                                        >
                                            {tourDates.map((date, i) => {
                                                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                                                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                                const isSelected = date.toDateString() === selectedTourDate.toDateString();
                                                return (
                                                    <SwiperSlide key={i} className="!w-[64px]">
                                                        <div
                                                            onClick={() => setSelectedTourDate(date)}
                                                            className={`p-2 border rounded-xl text-center cursor-pointer transition-all ${isSelected
                                                                ? "bg-blue-600 border-blue-600 text-white shadow-md scale-105"
                                                                : "bg-gray-50 border-gray-100 hover:border-blue-200 text-gray-600"
                                                                }`}
                                                        >
                                                            <p className="text-[9px] font-bold uppercase">{dayNames[date.getDay()]}</p>
                                                            <p className="font-bold text-base leading-tight">{date.getDate()}</p>
                                                            <p className="text-[9px] uppercase">{monthNames[date.getMonth()]}</p>
                                                        </div>
                                                    </SwiperSlide>
                                                );
                                            })}
                                        </Swiper>
                                        <button type="button" onClick={(e) => handleSliderNavClick(e, true)} className="tour-dates-modal-prev swiper-nav-btn absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full border bg-white shadow flex items-center justify-center cursor-pointer text-gray-600 hover:bg-gray-50"><ArrowLeft className="h-4 w-4" /></button>
                                        <button type="button" onClick={(e) => handleSliderNavClick(e, false)} className="tour-dates-modal-next swiper-nav-btn absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full border bg-white shadow flex items-center justify-center cursor-pointer text-gray-600 hover:bg-gray-50"><ArrowRight className="h-4 w-4" /></button>
                                    </div>
                                </div>

                                {/* Tour Type & Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">2. Tour Type</p>
                                        <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                                            <button
                                                onClick={() => setTourType("in-person")}
                                                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${tourType === "in-person" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
                                            >
                                                In Person
                                            </button>
                                            <button
                                                onClick={() => setTourType("video-chat")}
                                                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${tourType === "video-chat" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
                                            >
                                                Video
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 relative" ref={timeDropdownRef}>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">3. Pick Time</p>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setShowTimeDropdown(!showTimeDropdown); setTourFormErrors((p) => ({ ...p, tourTime: '' })); }}
                                            className={`w-full flex items-center justify-between bg-gray-50 border rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-gray-700 ${tourFormErrors.tourTime ? 'border-red-500' : 'border-gray-100'}`}
                                        >
                                            <span className="truncate">{selectedTourTime || "Time"}</span>
                                            <ChevronDown className="h-3 w-3 text-gray-400" />
                                        </button>
                                        {tourFormErrors.tourTime && <p className="text-[10px] text-red-500 mt-0.5">{tourFormErrors.tourTime}</p>}
                                        {showTimeDropdown && (
                                            <div className="absolute bottom-full left-0 right-0 mb-1 z-[60] max-h-40 overflow-y-auto bg-white border border-gray-100 rounded-lg shadow-xl p-1">
                                                {TOUR_TIME_SLOTS.map((slot) => (
                                                    <button
                                                        key={slot}
                                                        onClick={() => { setSelectedTourTime(slot); setShowTimeDropdown(false); }}
                                                        className={`w-full px-2 py-1.5 text-left text-[10px] rounded hover:bg-blue-50 transition-colors ${selectedTourTime === slot ? "bg-blue-600 text-white" : "text-gray-600"}`}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Form Fields - Updated to match User Snippet */}
                                <form className="space-y-3" onSubmit={handleTourSubmit}>
                                    {tourFormErrors.submit && (
                                        <p className="text-xs text-red-500">{tourFormErrors.submit}</p>
                                    )}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <input
                                                name="name"
                                                className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium ${tourFormErrors.name ? 'border-red-500' : 'border-gray-100'}`}
                                                placeholder="Name"
                                                value={tourFormData.name}
                                                onChange={(e) => { handleTourInputChange(e); setTourFormErrors((p) => ({ ...p, name: '' })); }}
                                            />
                                            {tourFormErrors.name && <p className="text-[10px] text-red-500 mt-0.5">{tourFormErrors.name}</p>}
                                        </div>
                                        <input
                                            name="phone"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                                            placeholder="Phone"
                                            value={tourFormData.phone}
                                            onChange={handleTourInputChange}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            name="email"
                                            className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium ${tourFormErrors.email ? 'border-red-500' : 'border-gray-100'}`}
                                            placeholder="Email"
                                            type="email"
                                            value={tourFormData.email}
                                            onChange={(e) => { handleTourInputChange(e); setTourFormErrors((p) => ({ ...p, email: '' })); }}
                                        />
                                        {tourFormErrors.email && <p className="text-[10px] text-red-500 mt-0.5">{tourFormErrors.email}</p>}
                                    </div>
                                    <textarea
                                        name="message"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium resize-none h-20"
                                        placeholder="Enter your Message"
                                        value={tourFormData.message}
                                        onChange={handleTourInputChange}
                                    />
                                    {tourType === "in-person" ? (
                                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs">
                                            Submit a Tour Request
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    ) : (
                                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs">
                                            BOOK YOUR VIDEO TOUR NOW
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Primary Floating Action Button */}
                <button
                    type="button"
                    onClick={() => { if (!showTourModal) setTourFormErrors({}); setShowTourModal(!showTourModal); }}
                    className={`inline-flex items-center justify-center rounded-full shadow-2xl h-14 w-14 cursor-pointer transition-all duration-300 group ${showTourModal ? 'bg-gray-900 rotate-90 scale-90' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {showTourModal ? (
                        <X className="h-6 w-6 text-white" />
                    ) : (
                        <Calendar className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                    )}
                    {!showTourModal && (
                        <span className="absolute right-full mr-4 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg block max-[425px]:hidden">
                            Schedule a Tour
                        </span>
                    )}
                </button>
            </div>

            {/* Download Brochure Modal */}
            {showDownloadBrochureModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" onClick={() => setShowDownloadBrochureModal(false)} />
                    <div className="relative bg-white rounded-[32px] p-6 w-full max-w-[380px] shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Download Brochure</h2>
                            <p className="text-gray-500 text-sm font-medium">
                                Do you want to download the property brochure?
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowDownloadBrochureModal(false)}
                                className="px-6 py-2 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all active:scale-95 text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const url = pendingBrochureUrl?.url || pendingBrochureUrl;
                                    if (url && url !== "#") {
                                        window.open(url, '_blank');
                                    } else {
                                        alert("Brochure not available yet.");
                                    }
                                    setShowDownloadBrochureModal(false);
                                }}
                                className="px-6 py-2 rounded-full bg-[#0052cc] text-white font-bold hover:bg-[#0047b3] transition-all active:scale-95 shadow-lg shadow-blue-100 text-xs"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function PropertyDetailsPage() {
    return (
        <Suspense fallback={
            <div className="property-details-compact min-h-screen bg-gray-50 flex items-center justify-center">
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




