"use client";

import Image from "next/image";
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { PremiumFeaturesBanner } from '@/components/PremiumFeaturesBanner';

import 'swiper/css';
import 'swiper/css/navigation';

const testimonials = [
  {
    name: "Tulasi Krishna Chaitanya",
    title: "Director, Tulasi seeds",
    image: "/subscribe/testimonials/tulasikrishna.png",
    text: "We were looking to establish a seed processing unit on Vijayawada highway. The HMDA zoning on Buildersinfo.in's map helped me short list areas in conservation zone and made the search much easier."
  },
  {
    name: "Bharath Maguluri",
    title: "Partner, 99 Ventures",
    image: "/subscribe/testimonials/bharathmaguluri.png",
    text: "I was looking for land around Chevella. I could easily compare the prices and spot the cheapest lands on the Map."
  },
  {
    name: "Santosh Saladi",
    title: "IIMA Alumni",
    image: "/subscribe/testimonials/santoshsaladi.png",
    text: "For all my land investing research around Hyderabad, Buildersinfo.in has become a one stop destination. The listings give an amazing view of prices and trends. I find the lifetime subscription offers great value for money. A single trip to visit 4 lands costs 5k, same as the price of their lifetime subscription."
  },
  {
    name: "Dr. Santosh KrishnaMadikiri",
    title: "Radiation Oncologist, KIMS",
    image: "/subscribe/testimonials/santoshkrishna.png",
    text: "Map view on Buildersinfo.in is a great tool to quickly discover lands and agents especially with my hectic schedule."
  },
  {
    name: "YVST Sai",
    title: "Retd. Income-tax commissioner",
    image: "/subscribe/testimonials/yvstsai.png",
    text: "The MapView was extremely helpful, when I wanted to sell my land at Allipur and wanted to come up with the right pricing for it."
  }
];

export default function SubscribePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex flex-col items-center justify-center flex-grow w-full px-4 pt-8 pb-12">
        <section className="container mb-0 p-1 md:p-4 max-w-5xl">
          <Image
            src="/logo.png"
            alt="Buildersinfo Premium - Logo"
            className="mx-auto mb-8 h-[28px] w-[139px] object-contain lg:mb-6 lg:h-[70px] lg:w-[250px]"
            width="239"
            height="48"
          />
          <h1 className="mb-9 text-center font-bold text-gray-800 lg:mb-[68px] text-xl md:text-5xl">
            Your access to all good <br />Land Deals!
          </h1>
          <Image
            src="/subscribe/hero.png"
            alt="Buildersinfo Premium - Hero Image"
            className="mx-auto w-full max-w-[640px] md:h-full md:object-cover"
            width="900"
            height="500"
          />
        </section>

        <div className='w-full max-w-5xl mt-3 md:mt-6'>
          <PremiumFeaturesBanner />
        </div>

        <div className="w-full max-w-5xl my-5 px-6 text-center">
          <p className="text-base font-medium leading-relaxed text-gray-600 lg:text-lg">
            <span className="font-bold text-gray-900">Once you subscribe</span>, we will schedule a call <br className="lg:hidden" /> with you to get you started. 📞
          </p>
        </div>

        <section className="relative w-full max-w-5xl my-8">
          <div className="rounded-2xl bg-gray-50 p-6 lg:p-8">
            <h2 className="text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl mb-8">
              What people think <br className="md:hidden" /> about us?
            </h2>

            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: ".testimonial-prev",
                nextEl: ".testimonial-next",
              }}
              spaceBetween={24}
              slidesPerView={1}
              loop={true}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {testimonials.map((testimonial, i) => (
                <SwiperSlide key={i}>
                  <div className="bg-white mb-4 text-gray-800 h-[300px] rounded-2xl shadow-lg p-5 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-800 truncate mb-1">
                          {testimonial.name}
                        </h3>
                        <p className="text-xs font-normal text-gray-600">
                          {testimonial.title}
                        </p>
                      </div>
                      <div className="h-11 w-11 shrink-0 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="h-full w-full rounded-full object-cover"
                          width="44"
                          height="44"
                        />
                      </div>
                    </div>
                    <div className="flex-grow overflow-y-auto text-sm font-normal text-gray-600">
                      <p>{testimonial.text}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <button className="testimonial-prev absolute -left-15 top-1/2 -translate-y-1/2 z-10 hidden lg:block rounded-full p-2 bg-white shadow-md border border-gray-200 cursor-pointer">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="testimonial-next absolute -right-15 top-1/2 -translate-y-1/2 z-10 hidden lg:block rounded-full p-2 bg-white shadow-md border border-gray-200 cursor-pointer">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}