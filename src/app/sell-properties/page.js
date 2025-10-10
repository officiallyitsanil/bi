"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SellPage() {
  const [isOwnerAccordionOpen, setIsOwnerAccordionOpen] = useState(false);
  const [isAgentAccordionOpen, setIsAgentAccordionOpen] = useState(false);

  const toggleOwnerAccordion = () => {
    setIsOwnerAccordionOpen((prev) => !prev);
  };

  const toggleAgentAccordion = () => {
    setIsAgentAccordionOpen((prev) => !prev);
  };

  return (
    <>
      <div className="w-full h-36 md:h-80 relative">
        <Image
          src="/sell-properties/sell-property-hero.png"
          alt="sell-properties-hero"
          fill
          style={{objectFit: "cover"}}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="py-1 md:border-b border-gray-300">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 md:mb-8">
            Sell{" "}
            <span className="text-lg md:text-[1.75rem] font-normal">Through Buildersinfo</span>
          </h1>
        </div>

        <div className="space-y-2 pt-5">
          <p className="text-3xl md:text-[2.5rem] font-light text-gray-600 mb-4 leading-snug">
            Go Beyond Your Network – Let Thousands of Buyers Find You
          </p>
          <p className="text-xl">Join 2400+ sellers already listing lands.</p>
        </div>

        <div className="mx-auto max-w-4xl space-y-6 rounded-2xl bg-[#fef6d7] p-6 lg:space-y-10 lg:rounded-3xl lg:p-8 my-8">
          <h2 className="text-lg font-semibold text-gray-900 lg:text-xl">
            Why List With Buildersinfo?
          </h2>

          <div className="space-y-6">
            {[
              {
                icon: "/sell-properties/free-tag.png",
                title: "FREE Listings!",
                desc: "Post your land at zero cost.",
              },
              {
                icon: "/sell-properties/phone.png",
                title: "Direct Buyer Calls",
                desc: "Your number is listed, and buyers reach out to you.",
              },
              {
                icon: "/sell-properties/timer.png",
                title: "Faster Discovery",
                desc: "Our interactive map helps serious buyers, including NRIs and investors, find your land quickly.",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex h-15 w-15 flex-shrink-0 items-center justify-center rounded-lg bg-[#ffefad]">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="mb-1 text-lg font-semibold text-gray-900 lg:text-xl">
                    {item.title}
                  </div>
                  <div className="text-sm text-gray-600 lg:text-base">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <Link
              className="flex items-center justify-center gap-2 bg-[#ffdc56] text-dark-800 font-medium px-6 py-3 rounded-full w-fit lg:w-full"
              target="_blank"
              rel="noopener noreferrer"
              href="https://wa.me/+918151915199/?text=Hi,%20I%20want%20to%20list%20my%20land%20on%20buildersinfo."
            >
              <span className="text-base lg:text-lg">List For Free</span>
              <Image src="/whatsapp.svg" alt="WhatsApp" width={20} height={20} />
            </Link>
          </div>
        </div>

        <div
          className={`accordion cursor-pointer p-5 ${isOwnerAccordionOpen ? "bg-[#fbfafb]" : ""
            } border border-gray-300 mt-6 rounded-lg`}
          onClick={toggleOwnerAccordion}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-lg md:text-xl font-semibold text-gray-900">
              <Image
                src="/sell-properties/land-owner.svg"
                alt="For Land Owners"
                width={24}
                height={24}
                className="w-4 md:w-6 h-4 md:h-6"
              />
              For Land Owners
            </div>
            <span
              className={`transition-transform duration-300 ${isOwnerAccordionOpen ? "rotate-180" : ""
                }`}
            >
              <ChevronDown />
            </span>
          </div>

          <div
            className={`transition-all duration-500 overflow-hidden ${isOwnerAccordionOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
              }`}
          >
            <div className="space-y-4 text-sm md:text-lg text-gray-700">
              <div className="flex flex-col gap-3">
                <p>
                  <strong>Choose Who Contacts You</strong> – Open inquiries to all buyers
                  or limit to Premium Subscribers for serious interest.
                </p>
                <Link
                  href="https://wa.me/+918151915199/?text=Hi,%20I%20want%20to%20list%20my%20land%20on%20buildersinfo."
                  className="flex items-center gap-2 bg-[#ffdc56] px-7 py-3 font-semibold rounded-full w-fit"
                >
                  List for Free
                  <Image src="/whatsapp.svg" alt="" width={20} height={20} />
                </Link>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-200 pt-5">
                <p>
                  <strong>Need Help Selling?</strong> <br />
                  Let us handle buyer calls and coordination with our Facilitation
                  Service.
                </p>
                <Link
                  href="https://wa.me/+918151915199/?text=Hi,%20I%20am%20interested%20to%20learn%20more%20about%20Land%20Facilitation%20by%20buildersinfo.in"
                  className="flex items-center gap-2 border border-gray-200 bg-white px-5 py-2 rounded-full w-fit font-semibold"
                >
                  Know About Facilitation
                  <Image src="/whatsapp.svg" alt="" width={20} height={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`accordion cursor-pointer p-5 ${isAgentAccordionOpen ? "bg-[#fbfafb]" : ""
            } border border-gray-300 mt-6 rounded-lg`}
          onClick={toggleAgentAccordion}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-lg md:text-xl font-semibold text-gray-900">
              <Image
                src="/sell-properties/agent.svg"
                alt="For Agents"
                width={24}
                height={24}
                className="w-4 md:w-6 h-4 md:h-6"
              />
              For Agents
            </div>
            <span
              className={`transition-transform duration-300 ${isAgentAccordionOpen ? "rotate-180" : ""
                }`}
            >
              <ChevronDown />
            </span>
          </div>

          <div
            className={`transition-all duration-500 overflow-hidden ${isAgentAccordionOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
              }`}
          >
            <div className="space-y-4 text-sm md:text-lg text-gray-800">
              <div>
                <p className="mb-3">
                  <strong>List for Free</strong> – Your contact is displayed, and
                  buyers reach out directly.
                </p>
                <strong>More Leads, Less Effort</strong> – Get quality inquiries
                without extra work.
              </div>
              <Link
                href="https://wa.me/+918151915199/?text=Hi,%20I%20want%20to%20list%20my%20land%20on%20buildersinfo."
                className="flex items-center gap-2 bg-[#ffdc56] px-7 py-3 font-medium rounded-full transition w-fit"
              >
                List for Free
                <Image src="/whatsapp.svg" alt="" width={20} height={20} />
              </Link>
            </div>
          </div>
        </div>



        <div className="mx-auto mt-2 mb-4 md:mb-0 md:mt-6 max-w-[400px] text-center text-base font-medium text-gray-900 lg:text-lg py-6">
          We have connected 1,000+ sellers with 50,000+ buyers and counting!
        </div>
      </div>
    </>
  );
}
