"use client";

import { useState, useEffect } from "react";
import { loginUser } from "@/utils/auth";
import {
    BadgeCheck,
    MapPin,
    X,
    Bookmark,
    Share2,
    CornerUpRight,
    SquareArrowOutUpRight,
    TriangleAlert,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import LoginModal from "./LoginModal";

export default function PropertyDetailModal({ property, onClose }) {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    useEffect(() => {
        try {
            const userJson = localStorage.getItem('currentUser');
            if (userJson) {
                setCurrentUser(JSON.parse(userJson));
            }
        } catch (error) {
            console.error("Failed to parse user data from localStorage:", error);
        }
    }, []);

    if (!property) return null;

    const handleLoginSuccess = (userData) => {
        loginUser(userData);
        setCurrentUser(userData);
        setIsLoginModalOpen(true);
        setIsContactModalOpen(false);
    };

    const {
        size = "N/A",
        price_per_acre = "N/A",
        total_price = "N/A",
        location_district = "N/A",
        listed_by = "Owner",
        images = [],
        zoning = "N/A",
        approach_road = "N/A",
        date_added = "N/A",
        is_verified = false,
        sellerPhoneNumber = "N/A",
        layer_location,
        createdBy
    } = property;

    return (
        <div
            role="dialog"
            className="z-50 bg-white shadow-lg flex max-w-sm flex-col overflow-hidden rounded-2xl p-0 text-left absolute bottom-5 w-[360px] top-[9rem] left-[3.5rem] h-full max-h-[calc(100%-96px-70px)]"
            tabIndex="-1"
        >
            <div className="sticky top-0 mx-4 flex flex-row justify-between space-y-0 border-b py-4 pb-2 text-left items-start gap-4 lg:pt-6 bg-white">
                <div className="flex w-full items-start justify-between">
                    <div className="flex-1">
                        <div className="mb-3 flex w-full items-center justify-between text-left lg:mb-2">
                            <div className="flex items-center gap-1.5">
                                <div className="text-lg font-semibold text-gray-800 lg:text-xl">{size}</div>
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
                                <span className="ml-[3px] text-sm font-semibold text-gray-800">₹</span>
                                <div>
                                    <span className="text-sm font-semibold text-gray-800">{price_per_acre} /acre</span>
                                    <span className="text-xs font-medium text-gray-800"> (Total - {total_price})</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center justify-center">
                                    <Image src={createdBy?.avatarUrl || "/owner-icon.svg"} width={14} height={14} alt="Listed by" className="rounded-full" />
                                </div>
                                <span className="text-xs font-medium text-gray-600">{listed_by} Listed</span>
                            </div>
                        </div>
                    </div>
                    <button aria-label="Close" className="text-gray-500 hover:text-gray-800" onClick={onClose}>
                        <X />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pt-0 lg:pt-4">
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
                        <div className="flex gap-4 px-7 justify-around">
                            <div className="flex flex-1 flex-col items-center gap-2">
                                <button className="cursor-pointer rounded-full bg-gray-100 p-3"><Bookmark className="w-5 h-5" /></button>
                                <div className="text-xs text-gray-800">Shortlist</div>
                            </div>
                            <div className="flex flex-1 flex-col items-center gap-2">
                                <button className="cursor-pointer rounded-full bg-gray-100 p-3"><Share2 className="w-5 h-5" /></button>
                                <div className="text-xs text-gray-800">Share</div>
                            </div>
                            <div className="flex flex-1 flex-col items-center gap-2">
                                <a target="_blank" href={`https://maps.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lng}&z=16&t=h`} className="cursor-pointer rounded-full bg-gray-100 p-3"><CornerUpRight className="w-5 h-5" /></a>
                                <div className="text-xs text-gray-800">Directions</div>
                            </div>
                            <div className="flex flex-1 flex-col items-center gap-2">
                                <a target="_blank" href="/" className="cursor-pointer rounded-full bg-gray-100 p-3"><SquareArrowOutUpRight className="w-5 h-5" /></a>
                                <div className="text-xs text-gray-800">New tab</div>
                            </div>
                        </div>
                        <div className="shrink-0 h-[1px] w-full my-4 bg-gray-200"></div>
                    </section>

                    <section>
                        <div className="flex flex-col">
                            <div className="space-y-2">
                                <div className="flex gap-2"><span className="flex-1 text-sm font-medium text-gray-500">Zoning</span><span className="flex-1 text-sm font-semibold capitalize text-gray-800">{zoning}</span></div>
                            </div>
                            <div className="shrink-0 h-[1px] w-full my-4 bg-gray-200"></div>
                        </div>
                        <div className="flex flex-col">
                            <div className="space-y-2">
                                <div className="flex gap-2"><span className="flex-1 text-sm font-medium text-gray-500">Approach road</span><span className="flex-1 text-sm font-semibold capitalize text-gray-800">{approach_road}</span></div>
                            </div>
                            <div className="shrink-0 h-[1px] w-full my-4 bg-gray-200"></div>
                        </div>
                        <div className="flex flex-col">
                            <div className="space-y-2">
                                <div className="flex gap-2"><span className="flex-1 text-sm font-medium text-gray-500">Date Added</span><span className="flex-1 text-sm font-semibold capitalize text-gray-800">{date_added}</span></div>
                            </div>
                        </div>
                    </section>

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
                        <div className="flex cursor-pointer items-center gap-2 ">
                            <TriangleAlert className="h-4 w-4 text-gray-800" />
                            <span className="text-sm font-normal text-gray-800 underline underline-offset-2">Report this listing</span>
                        </div>
                    </div>
                </main>
            </div>

            <div className="sticky bottom-0 z-20 w-full bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
                <button
                    onClick={() => {
                        if (!currentUser) {
                            setIsLoginModalOpen(true);
                        } else {
                            setIsContactModalOpen(true);
                        }
                    }}
                    className="inline-flex items-center text-wrap h-auto justify-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-medium text-gray-800 w-full"
                >
                    Contact owner
                </button>
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
        </div>
    );
}