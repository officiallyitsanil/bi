"use client";

import { useState, useRef } from "react";
import {
    ArrowLeft,
    Bookmark,
    Share2,
    Phone,
    MapPin,
    Home,
    Star,
    ThumbsUp,
    ThumbsDown,
    Building,
    Droplets,
    Zap,
    Shield,
    Camera,
    Car,
    ChevronLeft,
    ChevronRight,
    Calendar,
    ArrowRight,
    MessageCircle
} from "lucide-react";
import MapView from "../../components/MapView";

export default function PropertyDetailsPage() {
    const [activeTab, setActiveTab] = useState('amenities');
    const [selectedCapacity, setSelectedCapacity] = useState('6-15 Seats');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState('school');
    const [showModal, setShowModal] = useState(false);
    
    // Refs for scroll-to-section functionality
    const amenitiesRef = useRef(null);
    const locationRef = useRef(null);
    const reviewsRef = useRef(null);
    const layoutRef = useRef(null);
    const infoRef = useRef(null);

    // Map configuration - using property data as reference
    const mapCenter = { lat: 28.6139, lng: 77.2090 }; // Delhi coordinates
    const mapZoom = 15;

    const property = {
        name: 'Statesman house',
        address: 'J6JF+53C, Connaught Lane, Barakhamba, New Delhi, Delhi 110001, India, Delhi, Delhi, 110001.',
        originalPrice: '₹18,000',
        discountedPrice: '₹16,000',
        additionalPrice: '₹1XX0',
        images: [
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
            'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
            'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800',
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
        ],
        amenities: [
            { name: 'OC Certificate', icon: Shield },
            { name: 'SEZ Approved', icon: Building },
            { name: 'Fire NOC', icon: Shield },
            { name: 'Water Supply', icon: Droplets },
            { name: 'HVAC', icon: Building },
            { name: 'Electricity', icon: Zap },
            { name: 'Elevators', icon: Building },
            { name: 'Sewage Syst...', icon: Droplets },
            { name: 'Property Insu...', icon: Shield },
            { name: 'Power Suppl...', icon: Zap },
            { name: 'Fire Alarm', icon: Shield },
            { name: 'Smoke Detec...', icon: Shield },
            { name: '2W Parking', icon: Car },
            { name: '4W Parking', icon: Car },
            { name: 'Visitor Parking', icon: Car },
            { name: 'Building Sec...', icon: Building },
            { name: 'First Aid Kit', icon: Shield },
            { name: 'DG Backup', icon: Zap },
            { name: 'Fire Extinguisher', icon: Shield },
            { name: 'Ramp', icon: Building },
            { name: 'Waste Disposal', icon: Building },
            { name: 'CCTV', icon: Camera },
            { name: 'Intercom', icon: Building },
            { name: 'Package Deli...', icon: Building }
        ],
        locationAmenities: [
            { name: 'Paper shredd...', icon: Building },
            { name: 'Envelopes', icon: Building },
            { name: 'Open desk', icon: Building }
        ],
        nearbyPlaces: {
            school: [
                { name: 'Max Mueller Bhavan', location: 'New Delhi', distance: '0.75 km >' },
                { name: 'Smarg Education', location: 'New Delhi', distance: '0.64 km >' },
                { name: 'Maitrigram', location: 'Delhi', distance: '0.59 km >' },
                { name: 'Helping Hand Welfare Association', location: 'New Delhi', distance: '0.11 km >' }
            ],
            hospital: [
                { name: 'AIIMS Delhi', location: 'New Delhi', distance: '2.3 km >' },
                { name: 'Safdarjung Hospital', location: 'New Delhi', distance: '1.8 km >' }
            ],
            hotel: [
                { name: 'The Taj Palace', location: 'New Delhi', distance: '1.2 km >' },
                { name: 'The Oberoi', location: 'New Delhi', distance: '0.8 km >' }
            ],
            business: [
                { name: 'Connaught Place', location: 'New Delhi', distance: '0.5 km >' }
            ]
        },
        ratings: {
            overall: 4.0,
            totalRatings: 17,
            breakdown: { 5: 2, 4: 14, 3: 0, 2: 1, 1: 0 },
            whatsGood: [
                'Near Metro of Good Transport',
                'Centrally Located with Good Connectivity',
                'Business Hubs & Offices in Close Proximity',
                'Reputed Schools or Hospitals in the Vicinity'
            ],
            whatsBad: ['Smaller Room Sizes']
        }
    };

    const tabs = [
        { id: 'amenities', label: 'Amenities' },
        { id: 'location', label: 'Location & Landmark' },
        { id: 'reviews', label: 'Rating & Reviews' },
        { id: 'layout', label: 'Property Layout' },
        { id: 'info', label: 'Property Info' }
    ];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    };

    const scrollToSection = (sectionId) => {
        setActiveTab(sectionId);
        const refs = {
            'amenities': amenitiesRef,
            'location': locationRef,
            'reviews': reviewsRef,
            'layout': layoutRef,
            'info': infoRef
        };
        
        if (refs[sectionId]?.current) {
            refs[sectionId].current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Mobile Layout (below md) */}
            <div className="md:hidden">
                {/* Mobile Hero Section */}
                <div className="relative">
                    <img 
                        src={property.images[currentImageIndex]} 
                        alt="Property" 
                        className="w-full h-80 object-cover"
                    />
                    
                    {/* Back Button */}
                    <button className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    
                    {/* Action Icons */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                            <Bookmark className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg"
                        >
                            <span className="text-sm">≡</span>
                        </button>
                    </div>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                        {property.images.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                    i === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                            />
                        ))}
                    </div>
                    
                    {/* More Images Button */}
                    <div className="absolute bottom-4 right-4">
                        <div className="bg-gray-800/80 text-white px-4 py-2 rounded-lg text-sm">
                            +{property.images.length - 1} more
                        </div>
                    </div>
                </div>

                {/* Mobile Property Info */}
                <div className="px-4 py-6">
                    <h2 className="text-2xl font-bold mb-2">{property.name}</h2>
                    <p className="text-sm text-gray-600 mb-4">{property.address}</p>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg text-red-500 line-through">{property.originalPrice}</span>
                        <span className="text-2xl text-red-500">→</span>
                        <span className="text-2xl font-bold">{property.discountedPrice}</span>
                    </div>
                    
                    {/* Limited Offer Badge */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-yellow-400 text-black px-3 py-1 rounded font-bold text-xs flex items-center gap-1">
                            <span>⏰</span>
                            <span>LIMITED OFFER</span>
                        </div>
                        <span className="text-lg">{property.additionalPrice}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-6">
                        <button className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                                <span className="text-green-500 text-xs font-bold">W</span>
                            </div>
                            Whatsapp
                        </button>
                        <button className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                            <Phone className="w-5 h-5" />
                            Request for call
                        </button>
                    </div>
                    
                    {/* Amenities */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-4 text-red-600 border-b-2 border-red-500 pb-1 inline-block">Amenities</h3>
                        <div className="grid grid-cols-5 gap-4">
                            {property.amenities.slice(0, 10).map((amenity, i) => {
                                const Icon = amenity.icon;
                                return (
                                    <div key={i} className="text-center">
                                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <p className="text-xs text-gray-700 text-center">{amenity.name}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Location & Landmark */}
                    <div className="mb-6">
                        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold mb-4">
                            Location & Landmark
                        </button>
                        
                        {/* Map */}
                        <div className="h-64 rounded-lg mb-4 overflow-hidden">
                            <MapView
                                center={mapCenter}
                                zoom={mapZoom}
                            />
                        </div>
                        
                        {/* Category Filters */}
                        <div className="flex gap-2 mb-4 overflow-x-auto">
                            {Object.keys(property.nearbyPlaces).map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap ${
                                        activeCategory === category
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white border border-gray-300 text-gray-700'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                        
                        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
                            View More
                        </button>
                    </div>

                    {/* Rating & Reviews */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Rating & Reviews</h3>
                            <button className="text-blue-600 font-medium text-sm">View All</button>
                        </div>
                        
                        {/* Stars and Rating */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-5 h-5 ${
                                            star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="font-bold">
                                {property.ratings.overall} – {property.ratings.totalRatings} Rating
                            </span>
                        </div>
                        
                        {/* Rating Bars */}
                        <div className="space-y-2 mb-6">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-sm font-medium w-12">{star} Star</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-yellow-400 h-2 rounded-full"
                                            style={{
                                                width: `${(property.ratings.breakdown[star] / property.ratings.totalRatings) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium w-6">{property.ratings.breakdown[star]}</span>
                                </div>
                            ))}
                        </div>
                        
                        {/* What's Good */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <ThumbsUp className="w-5 h-5 text-blue-500" />
                                {/*<h4 className="font-semibold">What&apos;s good</h4>*/}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {property.ratings.whatsGood.map((item, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        {/* What&apos;s Bad */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <ThumbsDown className="w-5 h-5 text-blue-500" />
                                {/*<h4 className="font-semibold">What&apos;s Bad</h4>*/}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {property.ratings.whatsBad.map((item, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Properties Nearby */}
                    <div className="mb-20">
                        <h3 className="text-lg font-bold mb-4 text-center">Properties Nearby</h3>
                        <div className="w-8 h-1 bg-red-500 mx-auto mb-6"></div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {/* Property Cards */}
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                                <div key={item} className="relative">
                                    <img 
                                        src={property.images[0]} 
                                        alt="Property" 
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-blue-500">
                                        <span className="text-blue-500 text-xs font-bold">Ne</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 rounded-b-lg">
                                        <p className="text-sm text-center">Statesman house</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Fixed Bottom Action Bar */}
                <div className="fixed left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden" style={{ bottom: '60px' }}>
                    <div className="flex gap-3">
                        <button className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                                <span className="text-green-500 text-xs font-bold">W</span>
                            </div>
                            Whatsapp
                        </button>
                        <button className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                            <Phone className="w-5 h-5" />
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
                                    onClick={() => setShowModal(false)}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Layout (md and above) */}
            <div className="hidden md:block">
                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <h1 className="text-3xl font-bold mb-2">Showing Spaces in Delhi</h1>
                    <div className="h-1 w-32 bg-red-500 mb-8"></div>

                    {/* Image Gallery - Full Width */}
                    <div className="relative mb-8">
                        <div className="flex gap-4">
                            {/* Main Image */}
                            <div className="flex-1 relative group">
                                <img 
                                    src={property.images[currentImageIndex]} 
                                    alt="Property" 
                                    className="w-full h-80 object-cover rounded-xl"
                                />
                                <button 
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>

                                {/* Top Right Actions */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                    <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                                        <span className="text-sm">≡</span>
                                    </button>
                                </div>

                                {/* Bottom Right Counter */}
                                <div className="absolute bottom-4 right-4">
                                    <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">
                                        +{property.images.length - 1} More
                                    </div>
                                </div>

                                {/* Dots */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                                    {property.images.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-2 h-2 rounded-full ${
                                                i === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Thumbnail Grid - 2x2 */}
                            <div className="w-80 grid grid-cols-2 gap-2">
                                <img 
                                    src={property.images[1] || property.images[0]} 
                                    alt="Thumbnail 1" 
                                    className="w-full h-39 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setCurrentImageIndex(1)}
                                />
                                <img 
                                    src={property.images[2] || property.images[0]} 
                                    alt="Thumbnail 2" 
                                    className="w-full h-39 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setCurrentImageIndex(2)}
                                />
                                <img 
                                    src={property.images[3] || property.images[0]} 
                                    alt="Thumbnail 3" 
                                    className="w-full h-39 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setCurrentImageIndex(3)}
                                />
                                <img 
                                    src={property.images[4] || property.images[0]} 
                                    alt="Thumbnail 4" 
                                    className="w-full h-39 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setCurrentImageIndex(4)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Layout - Grid with sidebar */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                        {/* Property Info */}
                        <div className="bg-white rounded-2xl p-6">
                            <h2 className="text-2xl font-bold mb-2">{property.name}</h2>
                            <p className="text-sm text-gray-600 mb-4">{property.address}</p>

                            {/* Price */}
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-xl text-red-500 line-through">{property.originalPrice}</span>
                                <span className="text-2xl">→</span>
                                <span className="text-2xl font-bold">{property.discountedPrice}</span>
                                <div className="bg-yellow-400 text-black px-3 py-1 rounded font-bold text-xs flex items-center gap-1">
                                    <span>LIMITED OFFER</span>
                                </div>
                                <span className="text-xl">{property.additionalPrice}</span>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 mb-6">
                                <button className="flex-1 border-2 border-green-500 text-green-500 py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">W</span>
                                    </div>
                                    WhatsApp
                                </button>
                                <button className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                                    <Phone className="w-5 h-5" />
                                    Request for call
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="border-b mb-6">
                                <div className="flex">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => scrollToSection(tab.id)}
                                            className={`px-4 py-3 font-medium text-sm border-b-2 ${
                                                activeTab === tab.id
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-600'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* All Sections - Single Page Layout */}
                            
                            {/* Amenities Section */}
                            <div ref={amenitiesRef} className="mb-12">
                                <h3 className="text-xl font-bold mb-4 border-b-2 border-red-500 pb-1 inline-block">Amenities</h3>
                                <div className="grid grid-cols-6 gap-6 mt-6">
                                    {property.amenities.map((amenity, i) => {
                                        const Icon = amenity.icon;
                                        return (
                                            <div key={i} className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                                    <Icon className="w-7 h-7 text-blue-500" />
                                                </div>
                                                <p className="text-xs text-gray-700">{amenity.name}</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Location Amenities */}
                                <div className="flex gap-6 mt-8">
                                    {property.locationAmenities.map((amenity, i) => {
                                        const Icon = amenity.icon;
                                        return (
                                            <div key={i} className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-2 rounded-full border border-gray-300 flex items-center justify-center">
                                                    <Icon className="w-7 h-7 text-blue-500" />
                                                </div>
                                                <p className="text-xs text-gray-700">{amenity.name}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Location & Landmark Section */}
                            <div ref={locationRef} className="mb-12">
                                <h3 className="text-xl font-bold mb-4 border-b-2 border-red-500 pb-1 inline-block">Location & Landmark</h3>
                                
                                {/* Interactive Map */}
                                <div className="h-96 rounded-lg mb-6 mt-6 overflow-hidden">
                                    <MapView
                                        center={mapCenter}
                                        zoom={mapZoom}
                                    />
                                </div>

                                {/* Category Tabs */}
                                <div className="flex gap-2 mb-6">
                                    {Object.keys(property.nearbyPlaces).map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setActiveCategory(category)}
                                            className={`px-6 py-2 rounded-lg font-medium capitalize ${
                                                activeCategory === category
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white border border-gray-300 text-gray-700'
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>

                                {/* Places List */}
                                <div className="space-y-1">
                                    {property.nearbyPlaces[activeCategory].map((place, i) => (
                                        <div key={i} className="flex items-center justify-between py-3 border-b">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{place.name}</h4>
                                                <p className="text-sm text-gray-500">{place.location}</p>
                                            </div>
                                            <span className="text-sm text-gray-500">{place.distance}</span>
                                        </div>
                                    ))}
                                </div>

                                <button className="w-full mt-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium">
                                    View More
                                </button>
                            </div>

                            {/* Rating & Reviews Section */}
                            <div ref={reviewsRef} className="mb-12">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold border-b-2 border-red-500 pb-1 inline-block">Rating & Reviews</h3>
                                    <button className="text-blue-600 font-medium text-sm">View All</button>
                                </div>

                                {/* Stars and Rating */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-6 h-6 ${
                                                    star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-lg font-bold">
                                        {property.ratings.overall} – {property.ratings.totalRatings} Ratings
                                    </span>
                                </div>

                                {/* Rating Bars */}
                                <div className="space-y-2 mb-8">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <div key={star} className="flex items-center gap-4">
                                            <span className="text-sm font-medium w-16">{star} Star</span>
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-orange-500 h-2 rounded-full"
                                                    style={{
                                                        width: `${(property.ratings.breakdown[star] / property.ratings.totalRatings) * 100}%`
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium w-8">{property.ratings.breakdown[star]}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* What&apos;s Good */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ThumbsUp className="w-5 h-5 text-yellow-500" />
                                        {/*<h4 className="font-semibold">What&apos;s Good</h4>*/}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {property.ratings.whatsGood.map((item, i) => (
                                            <span
                                                key={i}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* What&apos;s Bad */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <ThumbsDown className="w-5 h-5 text-red-500" />
                                        {/*<h4 className="font-semibold">What&apos;s Bad</h4>*/}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {property.ratings.whatsBad.map((item, i) => (
                                            <span
                                                key={i}
                                                className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Property Layout Section */}
                            <div ref={layoutRef} className="mb-12">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold border-b-2 border-red-500 pb-1 inline-block">Property Layout</h3>
                                    <div className="flex gap-2">
                                        {['6-15 Seats', '16-30 Seats', '31-60 Seats'].map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => setSelectedCapacity(option)}
                                                className={`px-5 py-2 rounded-full text-sm font-medium ${
                                                    selectedCapacity === option
                                                        ? 'bg-black text-white'
                                                        : 'bg-white border border-gray-300 text-gray-700'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Floor Plans */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <img 
                                        src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600" 
                                        alt="Floor Plan 1" 
                                        className="w-full rounded-lg"
                                    />
                                    <img 
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600" 
                                        alt="Floor Plan 2" 
                                        className="w-full rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Property Info Section */}
                            <div ref={infoRef} className="mb-12">
                                <h3 className="text-xl font-bold mb-4 border-b-2 border-red-500 pb-1 inline-block">Property Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="font-medium text-gray-600">Property Type</span>
                                            <span className="text-gray-900">Commercial Office Space</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="font-medium text-gray-600">Built Year</span>
                                            <span className="text-gray-900">2020</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="font-medium text-gray-600">Furnishing</span>
                                            <span className="text-gray-900">Semi-Furnished</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="font-medium text-gray-600">Floor</span>
                                            <span className="text-gray-900">3rd Floor</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="font-medium text-gray-600">Carpet Area</span>
                                            <span className="text-gray-900">1200 sq ft</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="font-medium text-gray-600">Super Area</span>
                                            <span className="text-gray-900">1500 sq ft</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="font-medium text-gray-600">Parking</span>
                                            <span className="text-gray-900">Available</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b">
                                            <span className="font-medium text-gray-600">Security</span>
                                            <span className="text-gray-900">24/7 Security</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8">
                                    <h4 className="font-semibold text-lg mb-4">Property Description</h4>
                                    <p className="text-gray-700 leading-relaxed">
                                        This modern commercial office space is located in the heart of Delhi, offering excellent connectivity and premium amenities. 
                                        The property features contemporary design with natural lighting, modern HVAC systems, and high-speed internet connectivity. 
                                        Perfect for corporate offices, co-working spaces, or business centers. The location provides easy access to major business districts, 
                                        metro stations, and essential services.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Quote Form */}
                        <div className="bg-gray-100 rounded-2xl p-6">
                            <div className="bg-gray-200 p-4 rounded-lg mb-6">
                                <h3 className="font-semibold">Fill your details for a customized quote</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                />
                                <textarea
                                    placeholder="Messages"
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                                />
                                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
                                    Submit
                                </button>
                            </div>
                        </div>

                        {/* Trusted Companies */}
                        <div className="bg-white rounded-2xl p-6">
                            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                <h3 className="font-semibold">Trusted Companies</h3>
                            </div>
                            <p className="text-center text-gray-500 text-sm">Coming Soon</p>
                        </div>

                        {/* Schedule Visit */}
                        <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Schedule Visit
                        </button>
                    </div>
                </div>

                {/* Promotional Banner Section */}
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
                                <div className="relative">
                                    <img 
                                        src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=600&fit=crop&crop=center" 
                                        alt="Hand holding smartphone with real estate app"
                                        className="w-80 h-[600px] object-cover rounded-3xl shadow-2xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
