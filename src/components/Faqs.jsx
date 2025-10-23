"use client";

import React, { useState } from "react";

export const Faqs = () => {
  const faqs = [
    {
      question: "Is the Land Registered in my name or is it group-buying?",
      answer:
        "The Land will be registered directly in your name. It is a simple purchase, where we are just helping you with the entire process.",
    },
    {
      question: "Who will take care of the Land after I Purchase?",
      answer:
        "We do provide ‘Land Monitoring’, as a service after you purchase. You can opt for it, at 30k per year (for any size of land below 30 acres). We will visit twice a month and send you pictures. Additional help with Land development or agriculture can be discussed on a case-by-case basis.",
    },
    {
      question: "Will you help me sell?",
      answer:
        "Of course (but no guarantees). We are an active market place. Once you decide to sell, you can let us know and we’ll do our best to help you find a Buyer. Also, we’ll intimate you whenever we have an offer from a qualified Buyer.",
    },
    {
      question: "Can NRIs also buy?",
      answer:
        "Generally, NRIs cannot directly purchase agricultural land in India. However, there are some exceptions, such as inheriting agricultural land from a resident Indian or receiving it as a gift from a family member.",
    },
    {
      question: "What is a Lifetime subscription?",
      answer:
        "Once you’re a Premium Subscriber, your access is valid for life—either as long as you’re around or as long as we’re in business. You’ll always get the full set of Premium benefits whenever you choose to use them.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="mb-0 mt-10 bg-gray-800 lg:px-6">
      <div className="container max-w-2xl mx-auto py-8">
        <div id="faq-section">
          <h2 className="m-0 px-4 text-center text-xl font-semibold text-white lg:text-[40px] lg:leading-[48px]">
            Frequently Asked Questions
          </h2>

          <div className="space-y-1 divide-y divide-gray-600 px-4 mt-6">
            {faqs.map((faq, index) => (
              <div key={index} className="group">
                <h3 className="flex">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="flex flex-1 items-center justify-between gap-4 text-left text-sm md:text-base font-normal text-white w-full pt-3 pb-2"
                  >
                    {faq.question}
                    <span className="ml-4">
                      {openIndex === index ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6"
                        >
                          <path d="M5 12h14"></path>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6"
                        >
                          <path d="M5 12h14"></path>
                          <path d="M12 5v14"></path>
                        </svg>
                      )}
                    </span>
                  </button>
                </h3>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="pb-2 text-xs md:text-base font-normal text-white">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
