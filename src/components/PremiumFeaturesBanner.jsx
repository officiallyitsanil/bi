"use client"; 

import React from 'react';
import { Info, Check, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script'; 
import { useTheme } from '@/context/ThemeContext';

export const PremiumFeaturesBanner = () => {
  const { isDark } = useTheme();

  const features = [
    { text: "Unlimited Seller Contacts", hasInfo: false },
    { text: "Unlock All Landowner Listings", hasInfo: true },
    { text: "Exclusive Access To Facilitated Land Deals", hasInfo: true },
    { text: "Discover Exclusive Tag-Along Opportunities", hasInfo: true },
    { text: "Early Access to Future Features", hasInfo: false },
  ];

  const subscribers = [
    { src: "/builders/subscribers/subscriber-1.png", alt: "Subscriber 1" },
    { src: "/builders/subscribers/subscriber-2.png", alt: "Subscriber 2" },
    { src: "/builders/subscribers/subscriber-3.png", alt: "Subscriber 3" },
    { src: "/builders/subscribers/subscriber-4.png", alt: "Subscriber 4" },
    { src: "/builders/subscribers/subscriber-5.png", alt: "Subscriber 5" },
    { src: "/builders/subscribers/subscriber-6.png", alt: "Subscriber 6" },
    { src: "/builders/subscribers/subscriber-7.png", alt: "Subscriber 7" },
    { src: "/builders/subscribers/subscriber-8.png", alt: "Subscriber 8" },
  ];

  const makePayment = async ({ amount }) => {
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY || "YOUR_KEY_ID"; // Replace with your key
    if (!key) {
        console.error("Razorpay Key ID is not defined.");
        alert("Payment gateway is not configured. Please contact support.");
        return;
    }

    const orderId = `order_${Date.now()}`;

    const options = {
      key: key,
      amount: amount * 100, 
      currency: "INR",
      name: "Buildersinfo.in",
      description: "Lifetime Premium Membership",
      image: "/logo.png", 
      order_id: orderId, 
      handler: function (response) {
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: {
        name: "Ankit Kumar",
        email: "ankit.kumar@example.com",
        contact: "9999999999",
      },
      notes: {
        address: "BuildersInfo Office, Sonipat",
      },
      theme: {
        color: "#FBBF24", 
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response) {
        alert("Payment failed. Please try again.");
        console.error("Payment failed:", response.error);
    });
    paymentObject.open();
  };


  return (
    <section className="flex justify-center items-center my-10">
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <div className={`flex flex-col md:flex-row w-full border rounded-2xl shadow-xs overflow-hidden pb-8 transition-colors duration-300 ${isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200'}`}>

        <div className="w-full md:w-3/5 p-4 md:p-6">
          <button className="rounded-full bg-[#ffe57b] text-black font-semibold h-8 px-4 text-sm w-fit mb-5 hover:cursor-pointer hover:shadow-md">
            Premium
          </button>
          <h2 className={`text-2xl md:text-3xl font-bold leading-tight mb-4 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
            What's Included?
          </h2>
          <div className={`h-px w-full mb-6 transition-colors ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

          <div className="flex flex-col gap-3 md:px-3">
            {features.map((feature, index) => (
              <div key={index} className={`flex ${feature.hasButton ? 'flex-col' : 'flex-row'} items-center justify-between transition-colors ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                <div className={`flex items-center gap-4 ${feature.hasButton ? 'self-start' : ''}`}>
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className={`text-xs md:text-base font-medium transition-colors ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{feature.text}</p>
                </div>
                {feature.hasInfo && (
                  <button className={`transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                    <Info className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                )}
                {feature.hasButton && (
                  <button className={`ml-8 self-start text-sm font-semibold border rounded-full px-3 py-1 transition-colors ${isDark ? 'text-gray-300 border-gray-700 hover:bg-gray-700' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                    See Full List
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/2 p-3 md:p-6 flex flex-col justify-center items-center gap-8">
          <div className="text-center">
            <h3 className={`text-lg transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Join our community of <br />
              <span className={`font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>3000+ premium members</span>
            </h3>
            <div className="flex justify-center items-center -space-x-3 md:-space-x-1 mt-4">
              {subscribers.map((subscriber, index) => (
                <div key={index} className="relative h-10 w-10">
                  <Image
                    className={`w-7 h-7 md:h-full md:w-full rounded-full object-cover border-2 transition-colors ${isDark ? 'border-gray-800' : 'border-white'}`}
                    src={subscriber.src}
                    alt={subscriber.alt}
                    width={40}
                    height={40}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm flex flex-col items-center gap-4">
            <button
              onClick={() => makePayment({ amount: 5000 })}
              className="flex w-[90%] md:w-[80%] items-center justify-between rounded-xl bg-yellow-400 p-4 shadow-lg hover:bg-yellow-500 transition-colors py-6 cursor-pointer"
            >
              <div className="text-left">
                <div className="text-xl font-bold text-gray-900">Rs 5000</div>
                <div className="text-xs font-medium text-gray-700">Validity: Life time</div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white py-1 px-1 md:py-2 md:px-4">
                <span className="text-xs md:text-lg font-semibold text-gray-900">Subscribe</span>
                <ArrowRight className="w-5 h-5 text-gray-900" />
              </div>
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Secured by</span>
              <div className="relative h-6 w-24">
                <Image
                  src="/builders/razorpay.png"
                  alt="Razorpay logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  className={isDark ? 'brightness-0 invert' : ''}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}