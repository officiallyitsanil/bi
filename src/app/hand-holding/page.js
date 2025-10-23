"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from 'next/image';
import Link from 'next/link';

const testimonials = [
  {
    name: "Suryakamal",
    title: "Founder, Everrise Infra",
    image: "/hand-holding/testimonials/suryakamal.png",
    text: "The team is highly supportive, always accessible to address any queries promptly. They are young, enthusiastic, and proactive, offering valuable insights into market dynamics and helping us evaluate the feasibility of various deals. Their handholding process is smooth, transparent, and reassuring throughout. What sets them apart is their approach to connecting clients directly with property owners, actively participating in negotiations while maintaining a neutral stance—unlike other brokers who often withhold crucial information.",
  },
  {
    name: "Vishwanadh Malladi",
    title: "Founder, Sky Reach Villas",
    image: "/hand-holding/testimonials/vishwanadh.png",
    text: "Real estate is a largely unorganized sector, and with that comes the fundamental challenge of building trust. In such an open and fragmented space, anyone can enter the market—so finding a team with a scientific, process-oriented approach is rare. That's where Buildersinfo.in truly stands out. The biggest value they bring is their structured and trustworthy process. They don't just help bridge the trust gap—they save time and effort. What usually takes two or three meetings to establish credibility can now be cut down significantly. The team is incredibly friendly, proactive, and responsive. Every interaction is met with energy and genuine feedback, which makes the entire experience more positive and seamless. I see immense potential in this service. As Buildersinfo.in continues to grow and refine their offering, I believe more people in the real estate ecosystem will benefit from what they're building. Thank you for the great service",
  },
  {
    name: "Sushanth",
    title: "Actor",
    image: "/hand-holding/testimonials/sushanth.png",
    text: "My experience with Buildersinfo's handholding service was seamless and incredibly valuable. Vishal, who was assigned to me, helped me discover a wide range of land options with fully verified documents—something that's often hard to come by in real estate. The time and effort their team saved me, especially around legal due diligence and document verification, was immense. Their intuitive zoning map tool also made land selection much simpler compared to navigating official portals. With Buildersinfo, I felt confident and well-supported throughout the process.",
  },
  {
    name: "Namit Agarwal",
    title: "Director, Mohan Steels",
    image: "/hand-holding/testimonials/namit-agarwal.png",
    text: "I had a great experience with Buildersinfo.in. The team is extremely efficient, responsive and quick to understand the needs of the client and address them in an apt manner. I was able to short list lands very quickly. As the process is very transperant you are only paying for the sellers price and no hidden cuts that brokers usually dupe the clients into paying. I would highly recommend them for buying/selling lands.",
  },
  {
    name: "Umakanth Katta",
    title: "Director, Anuktha Avenues",
    image: "/hand-holding/testimonials/umakanth-katta.png",
    text: "Handholding is really useful as they give us exact properties matching our criteria. Team is always listening and they gave us lot of filtered properties matching our requirement.",
  },
  {
    name: "Prasanna",
    title: "Entrepreneur & Developer",
    image: "/hand-holding/testimonials/prasanna.png",
    text: "I would like to extend my sincere appreciation for the excellent service provided by Vishal from Buildersinfo team. Throughout the property search process, he demonstrated exceptional diligence, professionalism, and integrity. Vishal took the time to understand my needs and consistently presented a variety of suitable properties, always following up promptly and thoroughly. I particularly appreciated his transparency in discussing the commission and terms right from the outset, which helped build a strong foundation of trust. It was a pleasure working with someone so knowledgeable, proactive, and honest. I would not hesitate to recommend Vishal to anyone in need of a reliable and committed real estate professional.",
  },
];

export default function HandHoldingPage() {
  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-12">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8">Hand Holding</h1>

        <Image
          src="/hand-holding/hero.png"
          alt="Hand Holding"
          className="w-full mb-6"
          width={900}
          height={500}
        />

        <p className="text-base md:text-lg text-gray-700">
          If you are actively looking to buy Lands and want our help with it, we
          can help you find, evaluate and buy the right Lands, through our
          Hand-holding Service.
        </p>

        <div className="mx-auto max-w-4xl space-y-10 my-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            The Advantage:
          </h2>

          <div className="space-y-6">
            {[
              {
                icon: "/residential/timer.png",
                title: "Find More Options Faster",
                desc: "We tap into our 1200+ seller network to source the best available lands, even those not listed on Buildersinfo.in",
              },
              {
                icon: "/hand-holding/emergency.png",
                title: "Avoid Common Pitfalls",
                desc: "We share what we know about the land—commercials, risks, and paperwork—so you can decide with confidence.",
              },
              {
                icon: "/hand-holding/with-you.png",
                title: "With You Till The End",
                desc: "From search to final transaction, we stay involved to make sure things go smoothly.",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 md:gap-6">
                <div className="flex h-12 w-12 md:h-16 md:w-16 flex-shrink-0 items-center justify-center rounded-lg bg-[#ffefad]">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={28}
                    height={28}
                    className="object-contain md:w-8 md:h-8"
                  />
                </div>
                <div>
                  <div className="mb-1 text-base md:text-lg font-semibold text-gray-900 lg:text-xl">
                    {item.title}
                  </div>
                  <div className="text-base md:text-lg text-gray-600">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-4xl my-8">
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
              slidesPerView={1}
              breakpoints={{
                768: {
                  slidesPerView: 2,
                  spaceBetween: 24,
                },
              }}
              loop={true}
              speed={600}
              className="pb-10"
            >
              {testimonials.map((testimonial, i) => (
                <SwiperSlide key={i}>
                  <div className="bg-white text-gray-800 h-[320px] md:h-[350px] rounded-2xl shadow-lg">
                    <div className="flex items-start justify-between gap-4 p-4 md:p-5">
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-bold text-gray-800 truncate mb-1">
                          {testimonial.name}
                        </h3>
                        <p className="text-sm font-normal text-gray-600 truncate">
                          {testimonial.title}
                        </p>
                      </div>
                      <div className="h-10 w-10 md:h-11 md:w-11 shrink-0 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={44}
                          height={44}
                          className="h-full w-full rounded-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="p-4 md:p-5 pt-0 max-h-[220px] md:max-h-[260px] overflow-y-auto text-sm font-normal text-gray-600">
                      <p>{testimonial.text}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <button className="testimonial-prev absolute -left-4 md:-left-24 top-1/2 -translate-y-1/2 z-10 border rounded-full p-2 bg-white shadow hidden md:block">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="testimonial-next absolute -right-4 md:-right-24 top-1/2 -translate-y-1/2 z-10 border rounded-full p-2 bg-white shadow hidden md:block">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="bg-[#fafafa] py-8 md:py-10 px-4 md:px-6 my-6 rounded-lg flex flex-col space-y-6">
          <h3 className="text-xl md:text-2xl font-bold">Fair & Transparent Terms:</h3>

          <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-x-6">
            <div className="bg-white p-3 rounded-md flex-1">
              <p className="text-base md:text-lg font-semibold mb-3">2%</p>
              <p className="text-sm md:text-base text-gray-600">Fee On Transaction</p>
            </div>

            <div className="bg-white p-3 rounded-md flex-1">
              <p className="text-base md:text-lg font-semibold mb-3">₹50K</p>
              <p className="text-sm md:text-base text-gray-600">Screening Fee (Deductible)</p>
            </div>

            <div className="bg-white p-3 rounded-md flex-1">
              <p className="text-base md:text-lg font-semibold mb-3">₹3cr</p>
              <p className="text-sm md:text-base text-gray-600">Min Budget</p>
            </div>
          </div>
        </div>

        <div className="my-8">
          <Link
            className="flex items-center justify-center gap-2 bg-[#ffdc56] text-dark-800 font-medium px-6 py-3 rounded-full w-full"
            target="_blank"
            rel="noopener noreferrer"
            href="https://calendar.app.google/hdj6bkThhjvx8DER7"
          >
            <span className="text-base lg:text-lg">Book a free call</span>
            <Image src="/phone-call-line.svg" alt="Call" width={20} height={20} />
          </Link>
        </div>

        <div className="bg-[#fafafa] mb-12 md:mb-0 py-8 md:py-10 px-4 md:px-6 rounded-lg flex flex-col space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-xl md:text-2xl font-bold">Meet the Team</h3>
          </div>

          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
            <div className="flex flex-1 items-center space-x-4">
              <div>
                <h4 className="font-bold text-base md:text-md">Vishal Ponugoti</h4>
                <p className="text-base text-gray-700">
                  Head, Transactions Telangana & AP
                </p>
                <p className="text-sm text-gray-500">Alumnus, BITS Pilani</p>
              </div>
              <Image
                src="/team-members/vishal-ponugoti.png"
                alt="Ratna Kiran"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            </div>

            <div className="flex flex-1 items-center space-x-4">
              <div>
                <h4 className="font-bold text-base md:text-md">Pavan Chandana</h4>
                <p className="text-xs text-gray-700">
                  Head, Transactions Bangalore, Goa & Chennai
                </p>
                <p className="text-sm text-gray-500">Alumnus, BITS Pilani</p>
              </div>
              <Image
                src="/team-members/pavan-chandana.png"
                alt="Satish Chandra"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
            <div className="flex flex-1 items-center space-x-4">
              <div>
                <h4 className="font-bold text-base md:text-md">Ratna Kiran</h4>
                <p className="text-sm text-gray-700">Co-Founder</p>
                <p className="text-xs text-gray-500">
                  Architect, School of Planning & Architecture, New Delhi.
                </p>
              </div>
              <Image
                src="/team-members/co-founder2.png"
                alt="Ratna Kiran"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            </div>

            <div className="flex flex-1 items-center space-x-4">
              <div>
                <h4 className="font-bold text-base md:text-md">Satish Chandra</h4>
                <p className="text-sm text-gray-700">Co-Founder</p>
                <p className="text-xs text-gray-500">
                  Director, Mordor Intelligence,
                  IIM Ahmedabad, BITS Pilani
                </p>
              </div>
              <Image
                src="/team-members/co-founder1.png"
                alt="Satish Chandra"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}