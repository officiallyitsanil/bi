"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Star } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { calculatePrices } from "@/utils/priceUtils";
import {
  getSimilarProperties,
  getNumericPrice,
  isNewProperty,
  getRatingTag,
  getPropertyCity,
} from "@/utils/similarProperties";

const safeDisplay = (value, fallback = "-") => {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
};

function SimilarPropertyCard({ property, idx, minPrice, isDark }) {
  const isNew = isNewProperty(property);
  const pPrice = getNumericPrice(property);
  const isBestPriced = pPrice > 0 && pPrice === minPrice;

  let badgeText = "";
  let isBestPriceBadge = false;
  if (isBestPriced) {
    badgeText = "BEST PRICE GUARANTEED";
    isBestPriceBadge = true;
  } else if (isNew) {
    badgeText = "NEW";
  }

  const ratingVal = property?.ratings?.overall || property?.rating || (4.0 + (idx % 10) / 10).toFixed(1);
  const ratingTag = getRatingTag(ratingVal);
  const numericRating = parseFloat(ratingVal);

  const cardPrices = calculatePrices(property);
  const cardDisplayPrice =
    cardPrices.discountedPrice !== "₹XX"
      ? cardPrices.discountedPrice
      : property?.totalPrice ||
        (typeof property?.price === "string" && property.price.includes("₹")
          ? property.price
          : `₹ ${safeDisplay(property?.price) || "5,999"}`);

  const ratingStars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(numericRating)) {
      ratingStars.push(<Star key={i} className="w-[10px] h-[10px] text-[#ffb800] fill-[#ffb800]" />);
    } else if (i - 0.5 <= numericRating) {
      ratingStars.push(<Star key={i} className="w-[10px] h-[10px] text-[#ffb800] fill-[#ffb800] opacity-50" />);
    } else {
      ratingStars.push(<Star key={i} className="w-[10px] h-[10px] text-[#ffb800] fill-transparent" />);
    }
  }

  const propertyId = property?.id || property?._id;
  const type = property?.propertyCategory || property?.propertyType || "";

  return (
    <Link
      href={`/property-details?id=${propertyId}&type=${encodeURIComponent(type)}`}
      className="block h-full"
    >
      <div
        className={`rounded-[12px] overflow-hidden group h-full flex flex-col transition-all ${
          isDark
            ? "bg-[#1f2229] border border-gray-800"
            : "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-md"
        }`}
      >
        <div
          className={`relative h-[200px] w-full shrink-0 overflow-hidden ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <img
            src={
              property?.featuredImageUrl ||
              property?.image ||
              property?.images?.[0] ||
              "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
            }
            alt={property?.propertyName || property?.name || ""}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {badgeText ? (
            <div
              className={`absolute top-3 left-3 text-white text-[9px] font-bold px-2 py-0.5 rounded-[3px] shadow-sm flex items-center gap-1 uppercase tracking-wide ${
                isBestPriceBadge ? "bg-amber-600" : "bg-blue-600"
              }`}
            >
              {isBestPriceBadge && (
                <span className="bg-white/20 rounded-full w-3 h-3 inline-flex items-center justify-center font-serif leading-none">
                  ₹
                </span>
              )}
              {badgeText}
            </div>
          ) : property?.badge ? (
            <div className="absolute top-3 left-3 bg-[#1e8b4e] text-white text-[9px] font-bold px-2 py-0.5 rounded-[3px] shadow-sm uppercase tracking-wide">
              {property.badge}
            </div>
          ) : null}
        </div>
        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            <div className="flex justify-between items-start mb-0.5">
              <h3
                className={`font-bold text-[15px] leading-tight truncate pr-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {safeDisplay(property?.propertyName || property?.name)}
              </h3>
              <div className="flex items-center gap-[2px] shrink-0 pt-0.5">{ratingStars}</div>
            </div>
            <p className="text-[11px] text-gray-500 capitalize leading-snug">
              {safeDisplay(
                property?.address?.locality ||
                  property?.locality ||
                  property?.address?.city ||
                  property?.city
              )}
            </p>
          </div>
          <div className="flex justify-between items-end mt-5">
            <div className="flex items-center gap-2">
              <div className="bg-black text-white flex items-center justify-center rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold">
                {numericRating.toFixed(1)}
              </div>
              <span className={`text-[11px] font-extrabold ${isDark ? "text-gray-300" : "text-black"}`}>
                {ratingTag}
              </span>
            </div>
            <p className={`font-bold text-[1.15rem] leading-none tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              {cardDisplayPrice}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SimilarPropertiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();

  const propertyId = searchParams.get("id");
  const typeParam = searchParams.get("type") || "";
  const cityFilter = searchParams.get("city") || "";

  const [currentProperty, setCurrentProperty] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCity, setActiveCity] = useState(cityFilter);

  useEffect(() => {
    const load = async () => {
      if (!propertyId) {
        setLoading(false);
        return;
      }
      try {
        const [propRes, allRes] = await Promise.all([
          fetch(`/api/properties?id=${propertyId}&type=${encodeURIComponent(typeParam)}`),
          fetch("/api/properties"),
        ]);
        const propData = await propRes.json();
        const allData = await allRes.json();

        if (propData.success && propData.property) {
          setCurrentProperty(propData.property);
        } else {
          // Retry without type — API searches both collections
          const retryRes = await fetch(`/api/properties?id=${propertyId}`);
          const retryData = await retryRes.json();
          if (retryData.success && retryData.property) {
            setCurrentProperty(retryData.property);
          }
        }
        if (allData.success && allData.data) {
          setAllProperties(allData.data);
        }
      } catch (err) {
        console.error("Error loading similar properties page:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [propertyId, typeParam]);

  const similarProps = useMemo(
    () => (currentProperty ? getSimilarProperties(allProperties, currentProperty) : []),
    [allProperties, currentProperty]
  );

  const uniqueCities = useMemo(
    () => Array.from(new Set(similarProps.map((p) => getPropertyCity(p)).filter(Boolean))),
    [similarProps]
  );

  const filteredProps = useMemo(() => {
    if (!activeCity) return similarProps;
    return similarProps.filter((p) => getPropertyCity(p) === activeCity);
  }, [similarProps, activeCity]);

  const prices = filteredProps.map((p) => getNumericPrice(p)).filter((price) => price > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : Infinity;

  const backUrl = propertyId
    ? `/property-details?id=${propertyId}${typeParam ? `&type=${encodeURIComponent(typeParam)}` : ""}#similar-properties`
    : "/";

  if (loading) {
    return (
      <main className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#121418]" : "bg-[#F8FBFF]"}`}>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading similar properties...</p>
      </main>
    );
  }

  if (!currentProperty) {
    return (
      <main className={`min-h-screen flex flex-col items-center justify-center gap-4 px-4 ${isDark ? "bg-[#121418]" : "bg-[#F8FBFF]"}`}>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>Property not found.</p>
        <button onClick={() => router.push("/")} className="text-blue-500 font-medium">
          Go to Home
        </button>
      </main>
    );
  }

  return (
    <main className={`min-h-screen pb-10 transition-colors ${isDark ? "bg-[#121418]" : "bg-[#F8FBFF]"}`}>
      <div className="px-4 md:px-10 pt-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className={`text-xl md:text-2xl font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
            Similar Properties
          </h1>
        </div>
      </div>

      <div className="px-4 md:px-10 pb-6 max-w-7xl mx-auto">
        {uniqueCities.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide flex-nowrap mb-2">
            <button
              onClick={() => setActiveCity("")}
              className={`px-4 py-[7px] text-[11px] font-bold whitespace-nowrap shrink-0 transition-colors rounded-[6px] ${
                !activeCity
                  ? "bg-black text-white"
                  : isDark
                    ? "bg-gray-800 text-gray-300 border border-gray-700"
                    : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              All Cities
            </button>
            {uniqueCities.map((city) => (
              <button
                key={city}
                onClick={() => setActiveCity(city)}
                className={`px-4 py-[7px] text-[11px] font-bold whitespace-nowrap shrink-0 transition-colors rounded-[6px] ${
                  activeCity === city
                    ? "bg-black text-white"
                    : isDark
                      ? "bg-gray-800 text-gray-300 border border-gray-700"
                      : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}

        {filteredProps.length === 0 ? (
          <div
            className={`rounded-2xl border py-16 px-6 text-center ${
              isDark ? "border-gray-800 bg-[#1f2229]" : "border-gray-200 bg-white"
            }`}
          >
            <p className={`text-[15px] font-semibold ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              No similar properties found for this property&apos;s price range.
            </p>
            <button
              onClick={() => router.push(backUrl)}
              className="mt-4 text-blue-500 text-sm font-medium hover:underline"
            >
              Back to property
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProps.map((p, idx) => (
              <SimilarPropertyCard
                key={p?.id || p?._id || idx}
                property={p}
                idx={idx}
                minPrice={minPrice}
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SimilarPropertiesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[#F8FBFF]">
          <p className="text-gray-600">Loading...</p>
        </main>
      }
    >
      <SimilarPropertiesContent />
    </Suspense>
  );
}
