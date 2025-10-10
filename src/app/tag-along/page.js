"use client";

import React, { useState } from 'react';
import { Lock, ChevronLeft, ChevronRight, Check, Info, ArrowRight, ArrowUpRight } from 'lucide-react';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Faqs } from "@/components/Faqs";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from 'next/image';
import Link from 'next/link';
import { PremiumFeaturesBanner } from '@/components/PremiumFeaturesBanner';

const teamMembers = [
  {
    name: "Yashaswy Rao",
    title: "Head, Tag-along",
    description: "Alumnus, BITS Pilani",
    imageUrl: "/team-members/yashashwy.png",
  },
  {
    name: "Ratna Kiran",
    title: "Co-Founder, Buildersinfo.in",
    description: "Architect, School of Planning & Architecture, New Delhi.",
    imageUrl: "/team-members/co-founder2.png",
  },
  {
    name: "Satish Chandra",
    title: "Co-Founder, Buildersinfo.in",
    description: "Director- Mordor Intelligence, IIM Ahmedabad, BITS Pilani",
    imageUrl: "/team-members/co-founder1.png",
  }
];

const soldProperties = [
  {
    imageUrl: "/tag-along/sold/19.png",
    status: "Complete",
    date: "July '25",
    size: "8 Acres",
    price: "4.5 lakh / acre"
  },
  {
    imageUrl: "/tag-along/sold/21.png",
    status: "Complete",
    date: "July '25",
    size: "5 Acres",
    price: "4.9 lakh / acre"
  },
  {
    imageUrl: "/tag-along/sold/22.png",
    status: "Complete",
    date: "July '25",
    size: "2 Acres",
    price: "8 lakh / acre"
  },
  {
    imageUrl: "/tag-along/sold/23.png",
    status: "Complete",
    date: "July '25",
    size: "5 Acres",
    price: "4.5 lakh / acre"
  },
  {
    imageUrl: "/tag-along/sold/10.png",
    status: "Complete",
    date: "June '25",
    size: "5 Acres",
    price: "7 lakh / acre"
  },
  {
    imageUrl: "/tag-along/sold/3.png",
    status: "Complete",
    date: "May '25",
    size: "9 Acres",
    price: "3.75 lakh / acre"
  },
];

const testimonials = [
  {
    name: "V. Sai Teja",
    title: "Partner, A&T Law Partners",
    text: "Buildersinfo has made land investment incredibly accessible. I invested in a land parcel in Maharashtra through their tag-along model, and the experience was seamless. Their transparent process and professional team make it easy for individual investors to get started.",
    image: "/tag-along/testimonials/saiteja.png",
  },
  {
    name: "Rohith Sampathi",
    title: "Entrepreneur",
    text: "This is my first Land Purchase. I bought 10 acres and I would have never bought a Land if not for Buildersinfo. The way they took care of everything, made my life much easier and added a lot of Joy to my Land Ownership journey. Keep sending me good opportunities.",
    image: "/tag-along/testimonials/rohithsampathi.png",
  },
  {
    name: "Mithun Sagar",
    title: "Software Engineer",
    text: "I was here in Hyderabad, for a month in between my on-site at the USA and the entire process including the registration got finished in this time.",
    image: "/tag-along/testimonials/mithunsagar.png",
  },
  {
    name: "Dr. Neha",
    title: "Maxillofacial Surgeon",
    text: "I always kept postponing the idea of owning beautiful Land parcels (where I eventually want to settle with family). Buildersinfo helped me buy more than 25 acres beside a river, that too in two visits - one visit, to look at all the options and the other, for the registration.",
    image: "/tag-along/testimonials/neha.png",
  },
];

const availableProperties = [
  {
    imageUrl: "/tag-along/available/13.png",
    size: "12 acres",
    price: "6 lakh / acre"
  },
  {
    imageUrl: "/tag-along/available/11.png",
    size: "11 acres",
    price: "6 lakh / acre"
  },
  {
    imageUrl: "/tag-along/available/12.png",
    size: "5 acres",
    price: "7 lakh / acre"
  },
  {
    imageUrl: "/tag-along/available/4.png",
    size: "12 Acres",
    price: "3.75 lakh / acre"
  },
  {
    imageUrl: "/tag-along/available/9.png",
    size: "6 Acres",
    price: "3.75 lakh / acre"
  },
  {
    imageUrl: "/tag-along/available/3.png",
    size: "15 Acres",
    price: "5 lakh / acre"
  },
];

const features = [
  { text: "Unlimited Seller Contacts", hasInfo: false },
  { text: "Unlock All Landowner Listings", hasInfo: true },
  { text: "Exclusive Access To Facilitated Land Deals", hasInfo: true },
  { text: "Discover Exclusive Tag-Along Opportunities", hasInfo: true },
  { text: "Visualise with Premium Map Layers", hasInfo: false, hasButton: true },
  { text: "Early Access to Future Features", hasInfo: false },
];

const subscribers = [
  { src: "/subscribe/subscribers/subscriber-1.png", alt: "Subscriber 1" },
  { src: "/subscribe/subscribers/subscriber-2.png", alt: "Subscriber 2" },
  { src: "/subscribe/subscribers/subscriber-3.png", alt: "Subscriber 3" },
  { src: "/subscribe/subscribers/subscriber-4.png", alt: "Subscriber 4" },
  { src: "/subscribe/subscribers/subscriber-5.png", alt: "Subscriber 5" },
  { src: "/subscribe/subscribers/subscriber-6.png", alt: "Subscriber 6" },
  { src: "/subscribe/subscribers/subscriber-7.png", alt: "Subscriber 7" },
  { src: "/subscribe/subscribers/subscriber-8.png", alt: "Subscriber 8" },
];

export default function Page() {
  return (
    <>
      <div className="max-w-3xl mx-auto px-4 pt-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Tag along</h1>

        <Image
          src="/tag-along/hero.png"
          alt="Hand Holding"
          className="w-full md:w-[90%] mb-6"
          width={900}
          height={500}
        />

        <p className="text-base md:text-lg text-gray-700">
          We invest ourselves, in agricultural Lands in regions that we believe have the maximum potential for returns. While at it, we can help you acquire lands around us, in the same areas.
        </p>

        <section className="my-12 md:my-16">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
            Already Bought:
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-6">
            Below are the properties we helped our subscribers to acquire:
          </p>

          <div className="relative">
            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: ".sold-prev",
                nextEl: ".sold-next",
              }}
              spaceBetween={16}
              loop={true}
              speed={600}
              slidesPerView={1}
              breakpoints={{
                768: { slidesPerView: 2, spaceBetween: 24 },
              }}
            >
              {soldProperties.map((property, i) => (
                <SwiperSlide key={i}>
                  <div className="flex flex-col rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="relative">
                      <Image
                        src={property.imageUrl}
                        alt={`Property sold in ${property.date}`}
                        className="w-full h-40 md:h-48 object-cover"
                        width={435}
                        height={270}
                      />
                      <div className="absolute top-3 left-0 right-0 px-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs text-gray-700 shadow">
                          <span>Registration:</span>
                          <span className="font-medium">{property.status}</span>
                        </div>
                        <div className="rounded-full bg-blue-500 text-white px-2 py-0.5 text-xs font-semibold">
                          {property.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-white p-3 md:p-4">
                      <div className="text-sm text-gray-800 font-medium">{property.size}</div>
                      <div className="text-sm text-gray-800 font-semibold">{property.price}</div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <button className="sold-prev absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 border rounded-full p-2 bg-white shadow-md hover:bg-gray-100 transition-colors hidden md:block">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button className="sold-next absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 border rounded-full p-2 bg-white shadow-md hover:bg-gray-100 transition-colors hidden md:block">
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </section>

        <section className="my-10">
          <div className="relative mx-auto max-w-4xl">
            <div className="rounded-2xl bg-gray-50 p-4 md:p-6 lg:p-8">
              <h2 className="text-left text-lg md:text-xl font-semibold text-gray-800 lg:text-2xl mb-6">
                What Customers Say:
              </h2>

              <Swiper
                modules={[Navigation]}
                navigation={{
                  prevEl: ".testimonial-prev",
                  nextEl: ".testimonial-next",
                }}
                spaceBetween={16}
                loop={true}
                speed={600}
                slidesPerView={1}
                breakpoints={{
                  768: { slidesPerView: 2, spaceBetween: 24 },
                }}
                className="pb-2"
              >
                {testimonials.map((testimonial, i) => (
                  <SwiperSlide key={i}>
                    <div className="bg-white text-gray-800 h-[280px] md:h-[320px] rounded-xl shadow-md flex flex-col">
                      <div className="flex items-start justify-between gap-4 p-4 md:p-5">
                        <div className="flex-1">
                          <h3 className="text-base md:text-lg font-bold text-gray-900 truncate mb-1">
                            {testimonial.name}
                          </h3>
                          <p className="text-sm font-normal text-gray-600">
                            {testimonial.title}
                          </p>
                        </div>
                        <div className="h-10 w-10 md:h-11 md:w-11 shrink-0 rounded-full overflow-hidden bg-gray-200">
                          <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="h-full w-full object-cover"
                            width={44}
                            height={44}
                          />
                        </div>
                      </div>

                      <div className="p-4 md:p-5 pt-0 text-sm font-normal text-gray-700 overflow-y-auto">
                        <p>{testimonial.text}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <button className="testimonial-prev absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 border rounded-full p-2 bg-white shadow-md hover:bg-gray-100 transition-colors hidden md:block">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button className="testimonial-next absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 border rounded-full p-2 bg-white shadow-md hover:bg-gray-100 transition-colors hidden md:block">
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </section>

        <section className="mb-10 max-w-6xl mx-auto px-0 md:px-4">
          <h2 className="mb-5 text-xl md:text-2xl font-semibold text-gray-800 lg:mb-6">
            Currently Available:
          </h2>
          <div className="relative">
            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: ".available-prev",
                nextEl: ".available-next",
              }}
              spaceBetween={16}
              loop={true}
              slidesPerView={1}
              breakpoints={{
                768: { slidesPerView: 2, spaceBetween: 24 },
              }}
            >
              {availableProperties.map((property, i) => (
                <SwiperSlide key={i}>
                  <div className="flex flex-col rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="relative">
                      <Image
                        src={property.imageUrl}
                        alt={`Property of ${property.size}`}
                        className="w-full h-40 md:h-48 object-cover"
                        width={435}
                        height={270}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm opacity-70">
                        <Lock className="h-8 w-8 md:h-10 md:w-10 text-gray-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-white p-3 md:p-4">
                      <div className="text-sm text-gray-800 font-medium">{property.size}</div>
                      <div className="text-sm text-gray-800 font-semibold">{property.price}</div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <button className="available-prev absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white border rounded-full shadow-md hover:bg-gray-100 transition-colors hidden md:block">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button className="available-next absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white border rounded-full shadow-md hover:bg-gray-100 transition-colors hidden md:block">
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </section>


        <p className="mb-4 text-center font-normal text-gray-700 md:mb-10 md:text-lg md:font-medium">
          <span>Tag-along opportunities are only </span>
          <span className="font-bold text-gray-900">accessible by our Premium Subscribers.</span>
        </p>


        <div className='w-full max-w-5xl mx-auto'>
          <PremiumFeaturesBanner />
        </div>

        <div className="my-8 md:mb-10 text-center">
          <p className="text-sm md:text-base font-medium text-gray-600 lg:text-lg leading-relaxed">
            <span className="font-bold text-gray-900">Once you subscribe</span>, we will schedule a call
            <br className="lg:hidden" /> with you to get you started. 📞
          </p>
        </div>

        <div className="mx-auto mb-10 mt-6 flex items-center justify-center gap-3">
          <span className="text-sm md:text-base font-normal text-gray-800">Already A Premium Subscriber?</span>
          <Link href="/login" className="flex cursor-pointer items-center gap-1 group">
            <span className="text-sm md:text-base font-semibold text-gray-900 underline">Login</span>
            <ArrowUpRight className="w-4 h-4 text-gray-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>


        <div className="bg-gray-100 py-8 md:py-10 px-4 md:px-6 rounded-2xl flex flex-col space-y-6 my-8">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">Meet the Team</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-base md:text-lg font-bold text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-700 mb-1">{member.title}</p>
                  <p className="text-sm text-gray-500">{member.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover bg-gray-200"
                    width={80}
                    height={80}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Faqs />

      <div className="mx-auto mt-6 mb-24 md:my-6 max-w-2xl px-4 md:px-5 lg:my-10">
        <div className="flex flex-col items-center gap-4">

          <button
            id="razorpay-button-subscribePage"
            className="flex w-full flex-wrap items-center justify-between gap-4 rounded-xl bg-[#FFE57A] px-4 py-5 md:py-6 shadow-md transition-shadow hover:shadow-lg md:gap-8"
          >
            <div className="flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-1">
              <div className="text-xl md:text-2xl font-bold text-gray-900 lg:text-3xl">Rs 5000</div>
              <div className="text-sm md:text-base font-medium text-gray-800 lg:text-lg">Validity: Lifetime</div>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-white py-2 pl-3 md:pl-4 pr-2 md:pr-3 shadow-sm lg:py-3 lg:pl-5 lg:pr-4">
              <span className="text-base md:text-lg font-semibold text-gray-900 lg:text-xl">Subscribe</span>
              <ArrowRight className="h-5 w-5 text-gray-900" />
            </div>
          </button>

          <div className="flex w-fit items-center gap-3">
            <span className="text-xs md:text-sm font-semibold text-gray-800">Secured by</span>
            <Image
              src="/subscribe/razorpay.png"
              alt="Razorpay logo"
              width={94}
              height={24}
              className="h-5 md:h-6 w-auto"
            />
          </div>

        </div>
      </div>
    </>
  );
}