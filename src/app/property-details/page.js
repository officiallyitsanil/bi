"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Share2,
    Home,
    Star,
    ThumbsUp,
    ThumbsDown,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
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
    Download,
    Camera,
    ShieldCheck,
    Layers,
    Briefcase,
    CircleParking,
    Banknote,
    School,
    Phone,
    Mail,
    BadgePercent,
    TrendingDown,
    Cog,
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
    X
} from "lucide-react";
import PDFViewer from "../../components/PDFViewer";
import GoogleMap from "../../components/GoogleMap";
import LoginModal from "../../components/LoginModal";
import { loginUser } from "../../utils/auth";
import { mapAmenitiesToObjects } from "../../utils/amenityMapping";
import Link from "next/link";
import Image from "next/image";

import "./animations.css";
import "./property-details.css";

// Dummy data for nearby landmarks (extended array when API returns empty)
const DUMMY_NEARBY_BANKS = [
    { name: "Kotak Mahindra Bank", distance: "1.22 KM" },
    { name: "Icici Bank Ltd", distance: "1.37 KM" },
    { name: "Andhra Bank", distance: "1.43 KM" },
    { name: "HDFC Bank", distance: "1.8 KM" },
    { name: "State Bank of India", distance: "2.1 KM" },
];
const DUMMY_NEARBY_SCHOOLS = [
    { name: "Delhi Public School", distance: "0.8 KM" },
    { name: "Euro School", distance: "1.2 KM" },
    { name: "Inventure Academy", distance: "1.5 KM" },
];
const DUMMY_NEARBY_HOSPITALS = [
    { name: "Apollo Hospital", distance: "2.5 KM" },
    { name: "Manipal Hospital", distance: "3.2 KM" },
];
const DUMMY_NEARBY_BUS = [
    { name: "Marathahalli Bridge", distance: "0.5 KM" },
    { name: "Kalamandir Bus Stop", distance: "1.1 KM" },
];
const DUMMY_NEARBY_TEMPLE = [
    { name: "ISKCON Temple", distance: "3 KM" },
    { name: "Maruthi Temple", distance: "1.5 KM" },
];
const DUMMY_NEARBY_ATM = [
    { name: "SBI ATM", distance: "0.8 KM" },
    { name: "HDFC ATM", distance: "1.2 KM" },
    { name: "ICICI ATM", distance: "1.4 KM" },
];
const DUMMY_NEARBY_MALL = [
    { name: "Phoenix Mall", distance: "2 KM" },
    { name: "Orion Mall", distance: "3.5 KM" },
    { name: "Forum Mall", distance: "4 KM" },
];
const SIMILAR_LOCATIONS = ["Koramangala", "MG Road", "HSR", "Indiranagar", "Hebbal"];
const ALL_SIMILAR_LOCATIONS = [
    "Koramangala", "MG Road", "HSR", "Indiranagar", "Hebbal",
    "Whitefield", "Bellandur", "Sanjay Nagar", "Electronic City",
    "JP Nagar", "Jayanagar", "Banashankari", "Rajajinagar",
    "Malleshwaram", "BTM Layout", "Marathahalli"
];
const DUMMY_SIMILAR_PROPERTIES = [
    { id: "workshaala", name: "Workshaala", locality: "Koramangala", price: "₹7,999", rating: 4.8, badge: "44% off", image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80" },
    { id: "incubex", name: "INCUBEX", locality: "Koramangala", price: "₹5,999", rating: 4.2, badge: "Best Price Guarantee", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80" },
    { id: "smart-space", name: "Smart Space", locality: "Koramangala", price: "₹4,999", rating: 3.9, badge: "34% off", image: "https://images.unsplash.com/photo-1579487785973-74d2ca7abdd5?w=600&q=80" },
    { id: "urban-vault", name: "Urban Vault", locality: "Koramangala", price: "₹5,999", rating: 4.2, badge: "Best Price Guarantee", image: "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=600&q=80" },
    { id: "indiqube", name: "Indiqube", locality: "Koramangala", price: "₹5,999", rating: 4.2, badge: "Best Price Guarantee", image: "https://picsum.photos/seed/corporate-office-space/400/300" },
];
const NEARBY_CATEGORIES = [
    { id: "school", label: "Schools", icon: "school" },
    { id: "bus", label: "Bus Stops", icon: "building" },
    { id: "hospital", label: "Hospitals", icon: "hospital" },
    { id: "bank", label: "Banks", icon: "banknote" },
    { id: "temple", label: "Temples", icon: "building2" },
    { id: "atm", label: "ATMs", icon: "briefcase" },
    { id: "mall", label: "Malls", icon: "hotel" },
];
const EXPLORE_LOCATIONS = [
    { name: "Coworking Space in HSR Layout", image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400&q=80" },
    { name: "Coworking Space in Koramangala", image: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=400&q=80" },
    { name: "Coworking Space in MG Road", image: "https://images.unsplash.com/photo-1605797491749-0c6989a44356?w=400&q=80" },
    { name: "Coworking Space in Indiranagar", image: "https://images.unsplash.com/photo-1601762429744-46fe92ccd903?w=400&q=80" },
    { name: "Coworking Space in Whitefield", image: "https://images.unsplash.com/photo-1614070776241-fb47cec38278?w=400&q=80" },
    { name: "Coworking Space in Sanjay Nagar", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80" },
    { name: "Coworking Space in Electronic city", image: "https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?w=400&q=80" },
    { name: "Coworking Space in JP Nagar", image: "https://images.unsplash.com/photo-1559209537-dafe2fe2886b?w=400&q=80" },
    { name: "Coworking Space in Jayanagar", image: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=400&q=80" },
    { name: "Coworking Space in Hebbal", image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&q=80" },
];
const CUSTOM_INFRA_ITEMS = [
    { label: "Meeting Rooms", icon: "users" },
    { label: "Private cabins", icon: "door-closed" },
    { label: "Reception area", icon: "concierge-bell" },
    { label: "Pantry", icon: "coffee" },
    { label: "Recreational Area", icon: "gamepad2" },
];
const DUMMY_AMENITIES = [
    { label: "Guest Check-in", icon: "User" },
    { label: "Delivery Acceptance", icon: "BellRing" },
    { label: "Package Notification", icon: "Package" },
    { label: "Fire Safety", icon: "Siren" },
    { label: "Guest Management", icon: "User" },
    { label: "Video Surveillance", icon: "Video" },
    { label: "Keycard Access", icon: "KeyRound" },
    { label: "Tea", icon: "CupSoda" },
    { label: "Coffee", icon: "Coffee" },
    { label: "Water", icon: "GlassWater" },
    { label: "Milk & Sweeteners", icon: "Milk" },
    { label: "Cups & Mugs", icon: "CupSoda" },
    { label: "24/7 Pantry", icon: "Clock" },
    { label: "Cafeteria", icon: "Building" },
    { label: "Food Vendor", icon: "User" },
    { label: "Daily Cleaning", icon: "Trash2" },
    { label: "Trash Removal", icon: "Trash2" },
    { label: "Deep Cleaning", icon: "Trash2" },
    { label: "24/7 Cleaning", icon: "Clock" },
    { label: "Pest Control", icon: "ShieldCheck" },
];

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
    const [reviewGoodThings, setReviewGoodThings] = useState('');
    const [reviewBadThings, setReviewBadThings] = useState('');
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
    const [showDownloadBrochureModal, setShowDownloadBrochureModal] = useState(false);
    const [pendingBrochureUrl, setPendingBrochureUrl] = useState("");
    const [hasUserSubmittedReview, setHasUserSubmittedReview] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [isEditingReview, setIsEditingReview] = useState(false);
    const [reviewCarouselIndex, setReviewCarouselIndex] = useState(0);
    const [showBrandDescription, setShowBrandDescription] = useState(true);
    const [selectedTourDate, setSelectedTourDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [tourType, setTourType] = useState("in-person");
    const [tourFormData, setTourFormData] = useState({ name: "", phone: "", email: "", message: "" });
    const [selectedTourTime, setSelectedTourTime] = useState("");
    const [showTimeDropdown, setShowTimeDropdown] = useState(false);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(true);
    const [similarPropertiesIndex, setSimilarPropertiesIndex] = useState(0);
    const [similarLocationFilter, setSimilarLocationFilter] = useState("Koramangala");
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [showStickyHeader, setShowStickyHeader] = useState(false);
    const [showTourModal, setShowTourModal] = useState(false);
    const [isSubmittingTour, setIsSubmittingTour] = useState(false);

    const handleTourInputChange = (e) => {
        const { name, value } = e.target;
        setTourFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleInterestInputChange = (e) => {
        const { name, value } = e.target;
        setInterestFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTourSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!tourFormData.name) {
            alert("Please fill in the Name field, it is mandatory.");
            return;
        }
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
                alert('Submitted successfully!');
                setTourFormData({ name: "", phone: "", email: "", message: "" });
                setSelectedTourTime("");
            } else {
                alert('Failed: ' + data.error);
            }
        } catch (err) {
            console.error('Error scheduling tour:', err);
            alert('An error occurred.');
        } finally {
            setIsSubmittingTour(false);
        }
    };
    const dateCarouselRef = useRef(null);
    const locationFilterRef = useRef(null);
    const locationDropdownRef = useRef(null);
    const timeDropdownRef = useRef(null);

    const router = useRouter();

    const TOUR_TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

    const scrollDateCarousel = (direction) => {
        const el = dateCarouselRef.current;
        if (!el) return;
        const cardWidth = 80;
        const scrollAmount = direction === "next" ? cardWidth * 2 : -cardWidth * 2;
        el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    useEffect(() => {
        if (!property) return;
        const el = dateCarouselRef.current;
        if (!el) return;
        const onScroll = () => {
            const maxScroll = el.scrollWidth - el.clientWidth;
            setCanScrollPrev(el.scrollLeft > 1);
            setCanScrollNext(maxScroll > 1 && el.scrollLeft < maxScroll - 1);
        };
        const timer = setTimeout(() => {
            onScroll();
        }, 100);
        el.addEventListener("scroll", onScroll);
        const ro = new ResizeObserver(onScroll);
        ro.observe(el);
        return () => {
            clearTimeout(timer);
            el.removeEventListener("scroll", onScroll);
            ro.disconnect();
        };
    }, [property]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (timeDropdownRef.current && !timeDropdownRef.current.contains(e.target)) setShowTimeDropdown(false);
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) setShowLocationDropdown(false);
        };
        if (showTimeDropdown || showLocationDropdown) document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [showTimeDropdown, showLocationDropdown]);

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
                    // Increment visitor count
                    try {
                        await fetch('/api/properties/visitor-count', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                id: idParam,
                                type: typeParam || data.property.propertyType || 'commercial'
                            }),
                        });
                    } catch (error) {
                        console.error('Error incrementing visitor count:', error);
                    }

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
                        sellerPhoneNumber: data.property.sellerPhoneNumber || '+91 XXXXXXXXXX',
                        visitorCount: data.property.visitorCount || 0
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
            <div className="property-details-compact min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading property details...</p>
                    <p className="text-gray-500 text-sm mt-2">Property ID: {searchParams.get('id')}</p>
                </div>
            </div>
        );
    }

    const nearbyBanks = (property.nearbyPlaces?.bank || property.nearbyPlaces?.business || [])?.length > 0
        ? (property.nearbyPlaces.bank || property.nearbyPlaces.business).slice(0, 5).map(p => ({ name: p.name || p, distance: p.distance || p.dist || "-" }))
        : DUMMY_NEARBY_BANKS;
    const dateAdded = property.createdAt ? new Date(property.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "15 July 2024";

    return (
        <main className="property-details-compact min-h-screen bg-secondary">
            {/* Sticky Header - Desktop Only */}
            {showStickyHeader && (
                <div className="hidden md:block fixed top-[48px] left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-b border-gray-100 shadow-sm animate-fade-in">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold truncate">{safeDisplay(property.name)}</h1>
                                <div className="inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 border-amber-200">
                                    {property.ratings?.overall || 4.8} <Star className="h-3 w-3 ml-1 fill-current" />
                                </div>
                                <img src="https://cdn-icons-png.flaticon.com/512/5253/5253968.png" alt="Verified" className="w-5 h-5 object-contain" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 pl-8">
                            <div className="flex items-end gap-2">
                                <p className="text-lg font-bold text-blue-600">{safeDisplay(property.discountedPrice)}</p>
                                <p className="text-sm text-gray-400 line-through">{safeDisplay(property.originalPrice)}</p>
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

            {/* Breadcrumb - hidden on mobile */}
            <div className="w-full px-8 py-4">
                <div className="hidden md:flex justify-between items-center text-sm">
                    <div className="flex items-center text-muted-foreground">
                        <Link href="/" className="hover:text-primary">Home</Link>
                        <ChevronRight className="h-4 w-4 mx-1" />
                        <Link href="/" className="hover:text-primary">Properties</Link>
                        <ChevronRight className="h-4 w-4 mx-1" />
                        <span className="text-foreground font-medium truncate max-w-[200px]">{safeDisplay(property.name)}</span>
                    </div>
                    <p className="text-muted-foreground">Date Added: <span className="font-medium text-foreground">{dateAdded}</span></p>
                </div>
            </div>

            <div className="w-full px-8 mt-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Main Content - 65% on desktop */}
                    <div className="w-full lg:flex-[13] lg:min-w-0">
                        <div className="space-y-6">
                            {/* Header + Gallery */}
                            <div id="info" className="md:pt-0">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-xl md:text-3xl font-bold">{safeDisplay(property.name)}</h1>
                                            <div className="inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 border-amber-200">
                                                {property.ratings?.overall || 4.8} <Star className="h-3 w-3 ml-1 fill-current" />
                                            </div>
                                            <img src="https://cdn-icons-png.flaticon.com/512/5253/5253968.png" alt="Verified" className="md:w-7 md:h-7 w-6 h-6" />
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground mt-2 text-sm md:text-base">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm">{safeDisplay(property.location)}</p>
                                            <button onClick={() => scrollToSection("location")} className="text-primary text-sm hover:underline">(View on Map)</button>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center gap-2">
                                        <button onClick={handleLike} className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-input bg-background hover:bg-accent">
                                            <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                                        </button>
                                        <button onClick={handleShare} className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-input bg-background hover:bg-accent">
                                            <Share2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Image Gallery - Mobile: single image with arrows */}
                            <div
                                className="relative group"
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <div className="property-details-gallery grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-2 md:h-[450px]">
                                    <div className="relative md:col-span-2 md:row-span-2 rounded-lg overflow-hidden group cursor-pointer aspect-[4/3] md:aspect-auto">
                                        <img
                                            src={property.images[currentImageIndex]}
                                            alt={property.name}
                                            className="w-full h-full object-cover transition-transform duration-300 cursor-pointer"
                                            onClick={() => setFullScreenImage(property.images[currentImageIndex])}
                                        />
                                    </div>
                                    <div className="relative md:col-span-1 md:row-span-1 rounded-lg overflow-hidden cursor-pointer aspect-[4/3] md:aspect-auto">
                                        <img src={property.images[1] || property.images[0]} alt="" className="w-full h-full object-cover" onClick={() => setFullScreenImage(property.images[1] || property.images[0])} />
                                        {property.seatLayoutPDFs?.[0] && (
                                            <div className="absolute top-2 right-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPendingBrochureUrl(property.seatLayoutPDFs[0]);
                                                        setShowDownloadBrochureModal(true);
                                                        // setSelectedPDF(property.seatLayoutPDFs[0]) // User wants to keep logic but maybe just not use it for now
                                                    }}
                                                    className="rounded-lg h-auto px-2 py-1 text-xs bg-black/50 text-white hover:bg-black/70"
                                                >
                                                    <Download className="h-3 w-3 mr-1 inline" /> PDF FILE
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative md:col-span-1 md:row-span-1 rounded-lg overflow-hidden cursor-pointer aspect-[4/3] md:aspect-auto" onClick={() => property.propertyVideos?.[0]?.url && window.open(property.propertyVideos[0].url, "_blank")}>
                                        <img src={property.propertyVideos?.[0]?.thumbnail || property.images[2] || property.images[0]} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                                            <CirclePlay className="h-12 w-12 text-white/80" />
                                            <span className="text-white text-xs mt-2">WATCH VIDEO</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 pb-2 overflow-x-auto mt-2">
                                    {property.images?.slice(0, 15).map((img, i) => (
                                        <div key={i} className="relative h-20 w-28 rounded-md overflow-hidden shrink-0 cursor-pointer" onClick={() => setCurrentImageIndex(i)}>
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            {i === 14 && property.images?.length > 15 && (
                                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-center p-1">
                                                    <Camera className="h-6 w-6 mb-1" />
                                                    <p className="text-xs font-semibold">Show all {property.images.length} photos</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Specs Card */}
                            <div className="rounded-lg border theme-bg-card theme-shadow-sm" id="specs">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold">{safeDisplay(property.name)}</h2>
                                            <div className="flex items-end gap-2 mt-2">
                                                <p className="text-2xl font-bold text-primary">{safeDisplay(property.discountedPrice)} <span className="text-sm font-normal text-muted-foreground">/ seat / month</span></p>
                                                <p className="text-md text-muted-foreground line-through">{safeDisplay(property.originalPrice)}</p>
                                                <p className="text-sm text-muted-foreground">(negotiable)</p>
                                            </div>
                                        </div>
                                        <div className="inline-flex items-center rounded-lg border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/80 bg-green-100 border-green-200 text-green-700 text-sm py-2 px-4">
                                            <span className="font-bold text-lg mr-2">%</span> Best price guaranteed - save up to 15% with Buildersinfo
                                            <Info className="h-4 w-4 ml-2" />
                                        </div>
                                    </div>
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-muted p-3 rounded-lg"><Building2 className="w-5 h-5 text-primary" /></div>
                                            <div><p className="text-sm text-muted-foreground flex items-center">Property Type <Info className="h-3 w-3 ml-1" /></p><p className="font-bold">{safeDisplay(property.displayPropertyType || property.propertyType, "Tech Park")}</p></div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-muted p-3 rounded-lg"><Armchair className="w-5 h-5 text-primary" /></div>
                                            <div><p className="text-sm text-muted-foreground flex items-center">Furnishing level <Info className="h-3 w-3 ml-1" /></p><p className="font-bold">{safeDisplay(property.furnishing, "Ready to move-in")}</p></div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-muted p-3 rounded-lg"><Building className="w-5 h-5 text-primary" /></div>
                                            <div><p className="text-sm text-muted-foreground flex items-center">Building Lease <Info className="h-3 w-3 ml-1" /></p><p className="font-bold">Full Building / Partial Floors</p></div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-muted p-3 rounded-lg"><Users className="w-5 h-5 text-primary" /></div>
                                            <div><p className="text-sm text-muted-foreground flex items-center">Min. inventory unit <Info className="h-3 w-3 ml-1" /></p><p className="font-bold">{property.floorConfigurations?.[0]?.dedicatedCabin?.seats || "30"} seats ({property.floorConfigurations?.[0]?.dedicatedCabin?.areaSqft ? property.floorConfigurations[0].dedicatedCabin.areaSqft.toLocaleString() : "1,500"} sq. ft)</p></div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-muted p-3 rounded-lg"><Users className="w-5 h-5 text-primary" /></div>
                                            <div><p className="text-sm text-muted-foreground flex items-center">Max. inventory unit <Info className="h-3 w-3 ml-1" /></p><p className="font-bold">300 seats (15,000 sq. ft)</p></div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-muted p-3 rounded-lg"><User className="w-5 h-5 text-primary" /></div>
                                            <div><p className="text-sm text-muted-foreground flex items-center">Single floor Capacity <Info className="h-3 w-3 ml-1" /></p><p className="font-bold">200 seats (10,000 sq. ft)</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Infrastructure */}
                            <div className="rounded-lg border bg-card shadow-sm" id="custom-infra">
                                <div className="p-6"><h3 className="font-bold text-xl">Custom infrastructure possible in your Managed Office ✨</h3></div>
                                <div className="border-t" />
                                <div className="p-6 pt-6">
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                                        {CUSTOM_INFRA_ITEMS.map((item, i) => (
                                            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted">
                                                {item.icon === "users" && <Users className="h-8 w-8 text-primary" />}
                                                {item.icon === "door-closed" && <DoorClosed className="h-8 w-8 text-primary" />}
                                                {item.icon === "concierge-bell" && <ConciergeBell className="h-8 w-8 text-primary" />}
                                                {item.icon === "coffee" && <Coffee className="h-8 w-8 text-primary" />}
                                                {item.icon === "gamepad2" && <Gamepad2 className="h-8 w-8 text-primary" />}
                                                <p className="font-semibold text-sm">{item.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="rounded-lg border theme-bg-card theme-shadow-sm" id="amenities">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="text-lg font-bold leading-none tracking-tight">Amenities</h3>
                                </div>
                                <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full" />
                                <div className="p-6 pt-6">
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-x-4 gap-y-6">
                                        {DUMMY_AMENITIES.map((amenity, i) => (
                                            <div key={i} className="flex flex-col items-center text-center gap-2">
                                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted">
                                                    {amenity.icon === "User" && <User className="h-8 w-8 text-primary" />}
                                                    {amenity.icon === "BellRing" && <BellRing className="h-8 w-8 text-primary" />}
                                                    {amenity.icon === "Package" && <Package className="h-8 w-8 text-primary" />}
                                                    {amenity.icon === "Siren" && <Siren className="h-8 w-8 text-primary" />}
                                                    {amenity.icon === "Video" && <Video className="h-8 w-8 text-primary" />}
                                                    {amenity.icon === "KeyRound" && <KeyRound className="h-8 w-8 text-primary" />}
                                                    {amenity.icon === "CupSoda" && <CupSoda className="h-8 w-8 text-primary" />}
                                                    {amenity.icon === "Coffee" && <Coffee className="h-8 w-8 text-primary" />}
                                                    {amenity.icon === "GlassWater" && <GlassWater className="h-8 w-8 text-primary" />}
                                                    {amenity.icon === "Milk" && <Milk className="h-8 w-8 text-primary" />}
                                                    {amenity.icon === "Clock" && <Clock className="h-8 w-8 text-primary" />}
                                                    {amenity.icon === "Building" && <Building className="h-8 w-8 text-primary" />}
                                                    {amenity.icon === "Trash2" && <Trash2 className="h-8 w-8 text-primary" />}
                                                    {amenity.icon === "ShieldCheck" && <ShieldCheck className="h-8 w-8 text-primary" />}
                                                </div>
                                                <p className="text-xs font-medium text-muted-foreground truncate w-full">{amenity.label}</p>
                                            </div>
                                        ))}
                                        <div className="flex flex-col items-center gap-2">
                                            <button className="flex items-center justify-center h-16 w-16 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                                                <CirclePlus className="h-8 w-8 text-primary" />
                                            </button>
                                            <button className="text-xs font-medium text-muted-foreground hover:underline truncate w-full">View All</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Property Details - Card */}
                            <div id="details" className="rounded-lg border theme-bg-card theme-shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="text-lg font-bold leading-none tracking-tight">Property Details</h3>
                                </div>
                                <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full" />
                                <div className="p-6 pt-6">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 text-sm">
                                        <div className="flex items-start gap-3">
                                            <Building className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                            <div><p className="text-muted-foreground">Category</p><p className="font-semibold capitalize">{safeDisplay(property.category || property.Category, "Commercial")}</p></div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Building2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                            <div><p className="text-muted-foreground">Property Type</p><p className="font-semibold capitalize">{safeDisplay(property.displayPropertyType || property.propertyType, "Techpark")}</p></div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                            <div><p className="text-muted-foreground">Under Management</p><p className="font-semibold">{property.underManagement !== undefined ? (property.underManagement ? "Yes" : "No") : "Yes"}</p></div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Layers className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                            <div><p className="text-muted-foreground">Available Floors</p><p className="font-semibold">{safeDisplay(property.availableFloors, "10th")}</p></div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Briefcase className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                            <div><p className="text-muted-foreground">Office Space Solutions</p><p className="font-semibold">{safeDisplay(property.officeSpaceSolutions || property.availableFloors, "Floor 10th")}</p></div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CircleParking className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                            <div><p className="text-muted-foreground">Facilities</p><p className="font-semibold">{safeDisplay(property.facilities, "4W PARKING, 2W PARKING")}</p></div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <User className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                            <div><p className="text-muted-foreground">Builder Name</p><p className="font-semibold">{safeDisplay(property.builder || property.builderName, "A")}</p></div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Users className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                            <div><p className="text-muted-foreground">Visitors</p><p className="font-semibold">{property.visitorCount || 42}</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Why choose Buildersinfo */}
                            <div className="rounded-lg border text-card-foreground shadow-sm bg-muted/50">
                                <div className="p-4 md:p-6">
                                    <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-6">
                                        <div className="text-center md:text-left">
                                            <h3 className="font-bold text-lg">Why choose Buildersinfo?</h3>
                                        </div>
                                        <ul className="grid grid-cols-2 gap-x-4 gap-y-3 w-full md:flex-grow">
                                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" /><span className="text-sm font-medium">Zero brokerage fee</span></li>
                                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" /><span className="text-sm font-medium">Design & layout support</span></li>
                                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" /><span className="text-sm font-medium">Largest network of offices</span></li>
                                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" /><span className="text-sm font-medium">Your own office consultant</span></li>
                                        </ul>
                                        <button onClick={handleShowInterestModal} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shrink-0 w-full md:w-auto">Get Free Consultation</button>
                                    </div>
                                </div>
                            </div>

                            {/* Nearby Landmarks - matches provided HTML layout */}
                            <div id="nearby" className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="text-lg font-bold leading-none tracking-tight">Nearby Landmarks - {safeDisplay(property.name)}</h3>
                                </div>
                                <div className="shrink-0 bg-border h-[1px] w-full" />
                                <div className="p-6 pt-6">
                                    <div className="relative h-60 w-full rounded-lg overflow-hidden mb-4">
                                        <img src="https://images.unsplash.com/photo-1577086664693-894d8405334a?w=800" alt="Map location" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80">View on Map</button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                                        {NEARBY_CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setActiveCategory(cat.id)}
                                                className={`justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 flex items-center gap-2 shrink-0 ${activeCategory === cat.id
                                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                                    }`}
                                            >
                                                {cat.id === "school" && <School className="h-5 w-5" />}
                                                {cat.id === "bus" && <Building className="h-5 w-5" />}
                                                {cat.id === "hospital" && <Hospital className="h-5 w-5" />}
                                                {cat.id === "bank" && <Banknote className="h-5 w-5" />}
                                                {cat.id === "temple" && <Building2 className="h-5 w-5" />}
                                                {cat.id === "atm" && <Briefcase className="h-5 w-5" />}
                                                {cat.id === "mall" && <Hotel className="h-5 w-5" />}
                                                <span>{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <h4 className="font-semibold mb-2 capitalize">
                                        {NEARBY_CATEGORIES.find((c) => c.id === activeCategory)?.label || activeCategory} near {safeDisplay(property.name)}
                                    </h4>
                                    <ul className="space-y-2">
                                        {(activeCategory === "bank" ? nearbyBanks : activeCategory === "school" ? DUMMY_NEARBY_SCHOOLS : activeCategory === "hospital" ? DUMMY_NEARBY_HOSPITALS : activeCategory === "bus" ? DUMMY_NEARBY_BUS : activeCategory === "temple" ? DUMMY_NEARBY_TEMPLE : activeCategory === "atm" ? DUMMY_NEARBY_ATM : activeCategory === "mall" ? DUMMY_NEARBY_MALL : nearbyBanks).map((b, i) => (
                                            <li key={i} className="flex justify-between p-2 rounded-md hover:bg-muted text-sm">
                                                <span className="font-medium">{b.name}</span>
                                                <span className="text-muted-foreground">{b.distance}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="text-center mt-4">
                                        <button className="border border-input px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground">View More</button>
                                    </div>
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
                                        <div>
                                            <button type="button" className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-accent hover:text-accent-foreground">
                                                <span>Choose Starting Point (like office or kid&apos;s school)</span>
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-center my-2 md:my-0">
                                            <div className="hidden md:flex items-center gap-2 text-muted-foreground">
                                                <div className="w-4 h-4 rounded-full border-2 border-primary" />
                                                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                                                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                                                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                                                <Car className="h-6 w-6 text-primary" />
                                                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                                                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                                                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                                                <div className="w-4 h-4 rounded-full border-2 border-primary" />
                                            </div>
                                            <div className="md:hidden">
                                                <ArrowDown className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 border rounded-lg">
                                            <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0">
                                                <img src={property.images?.[0] || "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=96"} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{safeDisplay(property.name)}</p>
                                                <p className="text-xs text-muted-foreground">{safeDisplay(property.address || property.location)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
                                        <CirclePlus className="mr-2 h-4 w-4" />
                                        Show Travel Time
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Sidebar - right column, top aligns with left section */}
                    <div className="w-full lg:flex-[7] lg:flex-shrink-0 lg:self-start lg:min-w-0">
                        <div className="sticky top-20 space-y-4">
                            {/* Interested Card - first so it aligns with property title */}
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="font-bold tracking-tight text-base">Interested in {safeDisplay(property.name)}?</h3>
                                </div>
                                <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full" />
                                <div className="p-6 space-y-4 pt-6">
                                    <div className="flex justify-between items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-24 h-24 overflow-hidden rounded-lg">
                                                <img src={property.agentImage || "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=96"} alt={property.agentName || "Rohit"} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">Say Hi To {property.agentName || "Rohit"}</h3>
                                                <p className="text-sm text-muted-foreground">{property.agentPhone || "+91 89*****896"}</p>
                                                <span className="inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground mt-1 font-medium">Buildersinfo Expert</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={handleCall} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border hover:text-accent-foreground h-9 w-9 rounded-full bg-green-100 border-green-200 text-green-600 hover:bg-green-200"><Phone className="h-4 w-4" /></button>
                                            <button onClick={handleMessage} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border hover:text-accent-foreground h-9 w-9 rounded-full bg-green-100 border-green-200 text-green-600 hover:bg-green-200"><Mail className="h-4 w-4" /></button>
                                            <button onClick={handleWhatsApp} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border hover:text-accent-foreground h-9 w-9 rounded-full bg-green-100 border-green-200 text-green-600 hover:bg-green-200"><img src="/property-details/whatsapp.png" alt="WhatsApp" className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                    <button onClick={handleShowInterestModal} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">Contact {property.agentName || "Rohit"}</button>
                                    <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full" />
                                    <div className="theme-bg-tertiary p-4 rounded-lg -m-2">
                                        <p className="text-sm text-center text-muted-foreground mb-4">{(property.agentName || "Rohit")}&apos;s team assisted 500+ corporates in Bangalore to move into their new office.</p>
                                        <div className="flex justify-around items-center flex-wrap gap-4">
                                            <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                                                <img alt="Google logo" src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=96" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                                                <img alt="Facebook logo" src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=96" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                                                <img alt="Netflix logo" src="https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=96" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                                                <img alt="Amazon logo" src="https://images.unsplash.com/photo-1529612700005-e35377bf1415?w=96" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                                                <img alt="Instagram logo" src="https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=96" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Why Clients Choose Us */}
                            <div className="rounded-lg border theme-bg-card shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="font-bold tracking-tight text-base">Why Clients Choose Us for Consultation</h3>
                                </div>
                                <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full" />
                                <div className="p-6 pt-6 space-y-6">
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-4 pb-4 border-b">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <BadgePercent className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm">Zero Brokerage</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5">100% Service, 0% Brokerage</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-4 pb-4 border-b">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <TrendingDown className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm">Lowest Price Guaranteed</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5">Highly unlikely, but if you find a lower price anywhere, tell us and we will match it.</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <Cog className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm">Full Service Support</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5">Our sales personnel are accountable for every step.</p>
                                            </div>
                                        </li>
                                    </ul>
                                    <button onClick={handleCall} className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg px-8 w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-14 text-base">
                                        <Phone className="mr-2 h-5 w-5" />
                                        Request More Information or a Callback
                                    </button>
                                </div>
                            </div>
                            {/* About the brand */}
                            <div id="brand" className="rounded-lg border theme-bg-card theme-shadow-sm">
                                <div className="flex flex-col space-y-1.5 p-6">
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">About the brand</h3>
                                    <div className="w-10 h-1 bg-primary" />
                                </div>
                                <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full" />
                                <div className="p-6 pt-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <img alt={`${safeDisplay(property.builder || property.builderName || property.name)} Logo`} src={property.brandLogo || "https://cdn-icons-png.flaticon.com/512/90/90830.png"} className="w-10 h-10 object-contain" />
                                        <div>
                                            <h3 className="text-xl font-bold">{safeDisplay(property.builder || property.builderName || property.name)}</h3>
                                            <p className="text-sm font-semibold text-muted-foreground">WORKSPACE</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-bold">2+</p>
                                                <p className="text-xs text-muted-foreground">Cities</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-bold">1000+</p>
                                                <p className="text-xs text-muted-foreground">Clients</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-bold">27+</p>
                                                <p className="text-xs text-muted-foreground">Coworking Spaces</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Armchair className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-bold">8000+</p>
                                                <p className="text-xs text-muted-foreground">Seats</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {showBrandDescription
                                            ? `${safeDisplay(property.builder || property.builderName || property.name)} Workspace, established in 2014, specializes in providing Zero CapEx, Enterprise Grade, Customized managed office spaces. With 26+ locations in Bangalore and an expansion to Mumbai, ${safeDisplay(property.builder || property.builderName || property.name)}'s flagship HSR campus is the largest in India, offering over 8,000 seats... `
                                            : `${safeDisplay(property.builder || property.builderName || property.name)} Workspace, established in 2014, specializes in providing Zero CapEx, Enterprise Grade, Customized managed office spaces. `
                                        }
                                        <button type="button" onClick={() => setShowBrandDescription(!showBrandDescription)} className="inline-flex items-center p-0 h-auto text-primary text-sm underline-offset-4 hover:underline font-medium">
                                            {showBrandDescription ? "Read less" : "Read more"}
                                        </button>
                                    </p>
                                    <button onClick={handleShowInterestModal} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                                        Interested in {safeDisplay(property.builder || property.builderName || property.name)} Workspace? Connect with us
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </button>
                                </div>
                            </div>
                            {/* Floor Plan */}
                            {property.floorPlans?.[selectedCapacity]?.[0] && (
                                <div className="rounded-lg border bg-card shadow-sm">
                                    <div className="p-6"><h3 className="text-lg font-bold">Floor Plan</h3></div>
                                    <div className="border-t" />
                                    <div className="p-6">
                                        <div className="aspect-[4/3] rounded-lg overflow-hidden border">
                                            <img src={property.floorPlans[selectedCapacity][0]} alt="Floor plan" className="w-full h-full object-contain p-4" />
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                            <span className="font-medium">{property?.openingHours?.mondayFriday?.enabled ? `${property.openingHours.mondayFriday.open || "9:00 AM"} - ${property.openingHours.mondayFriday.close || "6:00 PM"}` : "9:00 AM - 6:00 PM"}</span>
                                        </li>
                                        <li className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Saturday</span>
                                            {property?.openingHours?.saturday?.enabled ? (
                                                <span className="font-medium">{property.openingHours.saturday.open || "9:00 AM"} - {property.openingHours.saturday.close || "6:00 PM"}</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-500 text-white">Closed</span>
                                            )}
                                        </li>
                                        <li className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Sunday</span>
                                            {property?.openingHours?.sunday?.enabled ? (
                                                <span className="font-medium">{property.openingHours.sunday.open || "9:00 AM"} - {property.openingHours.sunday.close || "6:00 PM"}</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-500 text-white">Closed</span>
                                            )}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Schedule a Tour Sidebar Section - Updated to match User Snippet */}
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col space-y-1.5 text-center p-0">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider bg-primary/10 text-primary py-3">Schedule a Tour</h3>
                                </div>
                                <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full" />
                                <div className="p-4 space-y-4">
                                    <div className="relative">
                                        <div className="relative" role="region" aria-roledescription="carousel">
                                            <div className="overflow-hidden">
                                                <div ref={dateCarouselRef} className="flex gap-2 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide -ml-2" style={{ scrollSnapType: "x mandatory" }}>
                                                    {tourDates.map((date, i) => {
                                                        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                                                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                                        const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                                                        const selectedStr = `${selectedTourDate.getFullYear()}-${selectedTourDate.getMonth()}-${selectedTourDate.getDate()}`;
                                                        const isSelected = dateStr === selectedStr;
                                                        return (
                                                            <div key={i} role="group" aria-roledescription="slide" className="min-w-0 shrink-0 grow-0 basis-1/4 pl-2" style={{ scrollSnapAlign: "start" }}>
                                                                <div
                                                                    onClick={() => setSelectedTourDate(date)}
                                                                    className={`p-2 border rounded-lg text-center cursor-pointer transition-colors ${isSelected ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                                                                >
                                                                    <p className="text-xs">{dayNames[date.getDay()]}</p>
                                                                    <p className="font-bold text-lg">{date.getDate()}</p>
                                                                    <p className="text-xs">{monthNames[date.getMonth()]}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => scrollDateCarousel("prev")}
                                                disabled={!canScrollPrev}
                                                className="inline-flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                <span className="sr-only">Previous slide</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => scrollDateCarousel("next")}
                                                disabled={!canScrollNext}
                                                className="inline-flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
                                            >
                                                <ArrowRight className="h-4 w-4" />
                                                <span className="sr-only">Next slide</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-2 text-sm">Tour Type</p>
                                        <div className="w-full">
                                            <div className="items-center justify-center text-muted-foreground h-auto rounded-lg bg-muted p-1 gap-1 grid w-full grid-cols-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setTourType("in-person")}
                                                    className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all px-4 py-2 rounded-md ${tourType === "in-person" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50"}`}
                                                >
                                                    In Person
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setTourType("video-chat")}
                                                    className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all px-4 py-2 rounded-md ${tourType === "video-chat" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50"}`}
                                                >
                                                    Video Chat
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative" ref={timeDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setShowTimeDropdown(!showTimeDropdown); }}
                                            className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                        >
                                            <span className={selectedTourTime ? "" : "text-muted-foreground"}>{selectedTourTime || "Time"}</span>
                                            <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${showTimeDropdown ? "rotate-180" : ""}`} />
                                        </button>
                                        {showTimeDropdown && (
                                            <div className="absolute top-full left-0 right-0 mt-1 z-20 max-h-48 overflow-y-auto rounded-lg border border-input bg-background shadow-lg">
                                                {TOUR_TIME_SLOTS.map((slot) => (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        onClick={() => { setSelectedTourTime(slot); setShowTimeDropdown(false); }}
                                                        className={`w-full px-3 py-2.5 text-left text-sm hover:bg-muted transition-colors ${selectedTourTime === slot ? "bg-amber-100 text-amber-900 font-medium" : ""}`}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <form className="space-y-3" onSubmit={handleTourSubmit}>
                                        <input
                                            className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            placeholder="Name"
                                            value={tourFormData.name}
                                            onChange={(e) => setTourFormData((p) => ({ ...p, name: e.target.value }))}
                                        />
                                        <input
                                            className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            placeholder="Phone"
                                            value={tourFormData.phone}
                                            onChange={(e) => setTourFormData((p) => ({ ...p, phone: e.target.value }))}
                                        />
                                        <input
                                            className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            placeholder="Email"
                                            type="email"
                                            value={tourFormData.email}
                                            onChange={(e) => setTourFormData((p) => ({ ...p, email: e.target.value }))}
                                        />
                                        <textarea
                                            className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            placeholder="Enter your Message"
                                            value={tourFormData.message}
                                            onChange={(e) => setTourFormData((p) => ({ ...p, message: e.target.value }))}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSubmittingTour}
                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full transition-colors disabled:opacity-50"
                                        >
                                            {isSubmittingTour ? "Submitting..." : "Submit a Tour Request"}
                                        </button>
                                        <button type="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full transition-colors">
                                            BOOK YOUR VIDEO TOUR NOW
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Rating & Reviews - Right sidebar bottom, dummy data only */}
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
                                        <p className="text-sm mb-4">Overall rating based on {property?.reviews?.length || 0} reviews.</p>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="flex flex-col items-center justify-center">
                                                <p className="text-4xl font-bold">{property?.ratings?.average || 0}</p>
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={star} className={`w-5 h-5 ${star <= (property?.ratings?.average || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{property?.reviews?.length || 0} ratings</p>
                                            </div>
                                            {property?.ratings && (
                                                <div>
                                                    {[5, 4, 3, 2, 1].map((star) => {
                                                        const count = property.ratings[`star${star}`] || 0;
                                                        const total = property.reviews?.length || 1;
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
                                            )}
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
                                                <div className="overflow-hidden">
                                                    <div className="flex -ml-4 transition-transform duration-300" style={{ transform: `translate3d(${-reviewCarouselIndex * 100}%, 0px, 0px)` }}>
                                                        {property.reviews.slice(0, 5).map((review, idx) => (
                                                            <div key={review._id || idx} role="group" aria-roledescription="slide" className="min-w-0 shrink-0 grow-0 basis-full pl-4">
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
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                {property.reviews.length > 1 && (
                                                    <>
                                                        <button onClick={() => setReviewCarouselIndex(Math.max(0, reviewCarouselIndex - 1))} disabled={reviewCarouselIndex === 0} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 rounded-full absolute -left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Previous slide"><ChevronLeft className="h-4 w-4" /></button>
                                                        <button onClick={() => setReviewCarouselIndex(Math.min(Math.min(4, property.reviews.length - 1), reviewCarouselIndex + 1))} disabled={reviewCarouselIndex >= Math.min(4, property.reviews.length - 1)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 rounded-full absolute -right-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Next slide"><ChevronRight className="h-4 w-4" /></button>
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

            {/* Similar Properties - Full width */}
            <section id="similar-properties" className="py-12 bg-muted/30 mt-12">
                <div className="w-full px-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-1">Similar Properties</h2>
                            <p className="text-muted-foreground">Handpicked properties for you.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-2 flex-wrap scroll-smooth">
                                {SIMILAR_LOCATIONS.map((loc) => (
                                    <button
                                        key={loc}
                                        onClick={() => { setSimilarLocationFilter(loc); setSimilarPropertiesIndex(0); }}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${similarLocationFilter === loc ? "bg-primary text-primary-foreground" : "bg-background border border-input hover:bg-accent cursor-pointer"}`}
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </div>
                            <div className="relative" ref={locationDropdownRef}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowLocationDropdown(!showLocationDropdown); }}
                                    className="text-primary text-sm font-medium shrink-0 hover:underline flex items-center gap-0.5 cursor-pointer"
                                >
                                    View all
                                    <ChevronDown className={`h-3 w-3 transition-transform ${showLocationDropdown ? "rotate-180" : ""}`} />
                                </button>
                                {showLocationDropdown && (
                                    <div className="absolute top-full right-0 mt-2 z-20 w-48 max-h-60 overflow-y-auto rounded-lg border border-input bg-background shadow-lg p-1 scrollbar-hide">
                                        {ALL_SIMILAR_LOCATIONS.map((loc) => (
                                            <button
                                                key={loc}
                                                onClick={() => { setSimilarLocationFilter(loc); setSimilarPropertiesIndex(0); setShowLocationDropdown(false); }}
                                                className={`w-full px-3 py-2 text-left text-sm rounded-md transition-colors cursor-pointer ${similarLocationFilter === loc ? "bg-amber-100 text-amber-900 font-medium" : "hover:bg-muted"}`}
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
                        const filteredProps = similarLocationFilter === "Koramangala" || DUMMY_SIMILAR_PROPERTIES.filter((p) => p.locality === similarLocationFilter).length === 0
                            ? DUMMY_SIMILAR_PROPERTIES
                            : DUMMY_SIMILAR_PROPERTIES.filter((p) => p.locality === similarLocationFilter);
                        const cardsPerPage = 4;
                        const maxPage = Math.max(0, Math.ceil(filteredProps.length / cardsPerPage) - 1);
                        const pageIndex = Math.min(similarPropertiesIndex, maxPage);
                        const visibleProps = filteredProps.slice(pageIndex * cardsPerPage, pageIndex * cardsPerPage + cardsPerPage);
                        return (
                            <div className="relative">
                                <button
                                    onClick={() => setSimilarPropertiesIndex((i) => Math.max(0, i - 1))}
                                    disabled={pageIndex === 0}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10 w-10 h-10 rounded-full border bg-background shadow-md flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Previous properties"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {visibleProps.map((p) => (
                                        <Link key={p.id} href={`/property-details?id=${p.id}`} className="block">
                                            <div className="rounded-lg border bg-card shadow-sm overflow-hidden group h-full">
                                                <div className="relative aspect-[4/3]">
                                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                    {p.badge && <span className={`absolute top-2 left-2 px-2.5 py-0.5 text-xs font-semibold rounded-lg ${p.badge.includes("%") ? "bg-destructive text-destructive-foreground" : "bg-green-600 text-white"}`}>{p.badge}</span>}
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-bold">{p.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{p.locality}</p>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <div className="flex items-center gap-1">
                                                            <span className="px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg">{p.rating}</span>
                                                            <span className="text-sm font-medium">Excellent</span>
                                                        </div>
                                                        <p className="font-bold text-lg">{p.price}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setSimilarPropertiesIndex((i) => Math.min(maxPage, i + 1))}
                                    disabled={pageIndex >= maxPage}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10 w-10 h-10 rounded-full border bg-background shadow-md flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Next properties"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        );
                    })()}
                </div>
            </section >

            {/* Explore Top Coworking Locations */}
            < section className="py-12 bg-yellow-50 dark:bg-yellow-900/30" >
                <div className="w-full px-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-8">Explore Top Coworking Locations in Bangalore</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {EXPLORE_LOCATIONS.map((loc, i) => (
                            <Link key={i} href="#" className="rounded-lg border bg-card shadow-sm overflow-hidden group">
                                <div className="relative aspect-[4/3]">
                                    <img src={loc.image} alt={loc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold">{loc.name}</h3>
                                    <p className="text-sm text-primary group-hover:underline mt-1">Explore Spaces</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section >

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

            {/* Fixed Bottom Action Bar */}
            < div className="fixed left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-30" style={{ bottom: '60px' }
            }>
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

            {/* Floating Chat Icon */}
            < div className="fixed right-4 z-40 md:hidden" style={{ bottom: '140px' }}>
                <button
                    onClick={handleShowInterestModal}
                    className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            </div >

            {/* Mobile Modal */}
            {
                showModal && (
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
                )
            }

            {/* Reviews Modal */}
            {
                showReviewsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
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
                            <div className="overflow-y-auto p-5 flex-1">
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

            {/* Rating Submit Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
                    <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg sm:max-w-md animate-in fade-in zoom-in duration-300">
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
                        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
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
                            <div className="overflow-y-auto p-6 flex-1">
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
            {/* Fixed bottom-right: floating action container */}
            <div className="fixed bottom-6 right-4 max-[425px]:bottom-[210px] max-[425px]:right-3 z-50 flex flex-col items-end">
                {/* Schedule a Tour Modal - Anchored floating popup */}
                {showTourModal && (
                    <div className="relative w-[360px] max-[425px]:w-[calc(100vw-32px)] mb-3 group/modal">
                        {/* Compact Backdrop for anchored modal */}
                        <div className="fixed inset-0 z-[-1] bg-black/5 md:bg-transparent" onClick={() => setShowTourModal(false)} />

                        <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-slide-up-fade flex flex-col max-h-[80vh]">
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

                            <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
                                {/* Date Selection */}
                                <div className="space-y-3">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">1. Choose Date</p>
                                    <div className="relative group/carousel">
                                        <div ref={dateCarouselRef} className="flex gap-2 overflow-x-auto scrollbar-hide py-1 snap-x">
                                            {tourDates.map((date, i) => {
                                                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                                                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                                const isSelected = date.toDateString() === selectedTourDate.toDateString();
                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => setSelectedTourDate(date)}
                                                        className={`min-w-[64px] snap-start p-2 border rounded-xl text-center cursor-pointer transition-all ${isSelected
                                                            ? "bg-blue-600 border-blue-600 text-white shadow-md scale-105"
                                                            : "bg-gray-50 border-gray-100 hover:border-blue-200 text-gray-600"
                                                            }`}
                                                    >
                                                        <p className="text-[9px] font-bold uppercase">{dayNames[date.getDay()]}</p>
                                                        <p className="font-bold text-base leading-tight">{date.getDate()}</p>
                                                        <p className="text-[9px] uppercase">{monthNames[date.getMonth()]}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
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
                                            onClick={(e) => { e.stopPropagation(); setShowTimeDropdown(!showTimeDropdown); }}
                                            className="w-full flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-gray-700"
                                        >
                                            <span className="truncate">{selectedTourTime || "Time"}</span>
                                            <ChevronDown className="h-3 w-3 text-gray-400" />
                                        </button>
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
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            name="name"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                                            placeholder="Name"
                                            value={tourFormData.name}
                                            onChange={handleTourInputChange}
                                        />
                                        <input
                                            name="phone"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                                            placeholder="Phone"
                                            value={tourFormData.phone}
                                            onChange={handleTourInputChange}
                                        />
                                    </div>
                                    <input
                                        name="email"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                                        placeholder="Email"
                                        type="email"
                                        value={tourFormData.email}
                                        onChange={handleTourInputChange}
                                    />
                                    <textarea
                                        name="message"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium resize-none h-20"
                                        placeholder="Enter your Message"
                                        value={tourFormData.message}
                                        onChange={handleTourInputChange}
                                    />
                                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs">
                                        Submit a Tour Request
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                    <button type="button" className="w-full border border-gray-200 bg-white text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs">
                                        BOOK YOUR VIDEO TOUR NOW
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Primary Floating Action Button */}
                <button
                    type="button"
                    onClick={() => setShowTourModal(!showTourModal)}
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




