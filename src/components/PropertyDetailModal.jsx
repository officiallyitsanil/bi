"use client";

import { useState, useEffect } from "react";
import { loginUser } from "@/utils/auth";
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
    ThumbsDown
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

    useEffect(() => {
        try {
            const userJson = localStorage.getItem('currentUser');
            if (userJson) {
                setCurrentUser(JSON.parse(userJson));
            }

            // Check if property is in favourites
            const favourites = JSON.parse(localStorage.getItem('favourites') || '[]');
            setIsFavourite(favourites.some(fav => fav.id === property.id));
        } catch (error) {
            console.error("Failed to parse user data from localStorage:", error);
        }
    }, [property.id]);

    if (!property) return null;

    const handleLoginSuccess = (userData) => {
        loginUser(userData);
        setCurrentUser(userData);
        setIsLoginModalOpen(true);
        setIsContactModalOpen(false);
    };

    const handleFavouriteToggle = () => {
        try {
            const favourites = JSON.parse(localStorage.getItem('favourites') || '[]');

            if (isFavourite) {
                // Remove from favourites
                const updatedFavourites = favourites.filter(fav => fav.id !== property.id);
                localStorage.setItem('favourites', JSON.stringify(updatedFavourites));
                setIsFavourite(false);
            } else {
                // Add to favourites
                favourites.push(property);
                localStorage.setItem('favourites', JSON.stringify(favourites));
                setIsFavourite(true);
            }
        } catch (error) {
            console.error("Failed to update favourites:", error);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: `${name} in ${location_district}`,
            text: `Check out this property: ${name} at ${discountedPrice} in ${layer_location}, ${location_district}`,
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

    const {
        name = "N/A",
        originalPrice = "N/A",
        discountedPrice = "N/A",
        additionalPrice = "N/A",
        location_district = "N/A",
        images = [],
        date_added = "N/A",
        is_verified = false,
        sellerPhoneNumber = "N/A",
        layer_location,
        createdBy,
        amenities = [],
        ratings = {},
        reviews = [],
        floorPlans = {},
        propertyType = "N/A"
    } = property;

    const displayedAmenities = amenities.slice(0, 8);
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
                                <div className="text-lg font-semibold text-gray-800 lg:text-xl">{name}</div>
                                {is_verified && <BadgeCheck width="18" height="18" className="text-blue-500 fill-current" />}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="shrink-0" height="14" width="14" />
                                <div className="text-left text-sm font-medium capitalize text-gray-600">
                                    {layer_location}, {location_district}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div>
                                    <span className="text-sm font-semibold text-gray-800">{discountedPrice}</span>
                                    <span className="text-xs font-medium text-gray-500 line-through ml-2">{originalPrice}</span>
                                    <span className="text-xs font-medium text-gray-800"> (+{additionalPrice})</span>
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
                            <button className="prop-prev absolute top-1/2 -translate-y-1/2 left-2 h-8 w-8 rounded-full bg-white/70 items-center justify-center flex z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronLeft className="h-5 w-5 text-gray-800" />
                            </button>
                            <button className="prop-next absolute top-1/2 -translate-y-1/2 right-2 h-8 w-8 rounded-full bg-white/70 items-center justify-center flex z-10 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                    href={`/property-details?id=${property.id}`}
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
                                <div className="flex gap-2"><span className="flex-1 text-sm font-medium text-gray-500">Date Added</span><span className="flex-1 text-sm font-semibold capitalize text-gray-800">{date_added}</span></div>
                            </div>
                        </div>
                    </section>

                    {amenities.length > 0 && (
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
                                            />
                                        </div>
                                        <span className="text-[10px] text-center text-gray-600 leading-tight">{amenity.name}</span>
                                    </div>
                                ))}
                            </div>
                            {amenities.length > 8 && (
                                <a
                                    href={`/property-details?id=${property.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline mt-3 inline-block"
                                >
                                    +{amenities.length - 8} more amenities
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
                                    href={`/property-details?id=${property.id}`}
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
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-semibold text-gray-800">{ratings.overall}</span>
                                    <span className="text-xs text-gray-500">({ratings.totalRatings})</span>
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
                                                    <span key={index} className="text-[10px] bg-white px-2 py-1 rounded-full text-gray-700">
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
                                                    <span key={index} className="text-[10px] bg-white px-2 py-1 rounded-full text-gray-700">
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
                                                <span className="text-xs font-medium text-gray-800">{review.user}</span>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-xs font-medium text-gray-700">{review.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-1">{review.comment}</p>
                                            <span className="text-[10px] text-gray-500">{review.date}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {reviews.length > 3 && (
                                <a
                                    href={`/property-details?id=${property.id}`}
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
                                    <BadgeCheck className="text-blue-500 fill-current" />
                                    <span className="text-sm font-normal text-gray-600">Preliminary verification done.</span>
                                </span>
                            </div>
                        </div>
                        <div className="shrink-0 h-[1px] w-full my-3 bg-gray-200"></div>
                        <div
                            onClick={() => setIsReportModalOpen(true)}
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
                        onClick={() => window.open(`https://wa.me/${sellerPhoneNumber.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in ${name}`, '_blank')}
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
                        onClick={() => window.location.href = `tel:${sellerPhoneNumber}`}
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
                            <p className="text-base"><span className="font-medium text-gray-600">Owner Name:</span> <span className="font-semibold text-gray-900">{createdBy?.name || 'N/A'}</span></p>
                            <p className="text-base"><span className="font-medium text-gray-600">Contact:</span>
                                <a href={`tel:${sellerPhoneNumber}`} className="font-semibold text-blue-600 hover:underline ml-2">{sellerPhoneNumber}</a>
                            </p>
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
                                        propertyName: name,
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