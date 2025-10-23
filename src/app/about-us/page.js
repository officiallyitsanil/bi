"use client";
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="bg-white">
      <main className="py-10 md:py-12 px-4">
        <div className="max-w-[40rem] mx-auto">
          
          <section className="flex flex-col gap-7 md:gap-9">
            <h2 className="text-lg md:text-3xl font-semibold text-gray-700 mb-1 md:px-2.5">About Us</h2>

            <div className="bg-[#fafafa] py-6 rounded-lg shadow flex flex-col space-y-4">
                <div className="ml-3 md:ml-6"> <Image src='/about/idea.svg' alt='idea' width={48} height={48} className='w-6 h-6 md:w-12 md:h-12' /> </div>
                <h3 className="text-base md:text-xl py-1 px-3 md:px-6 inline-block font-bold bg-[#ffefad] self-start rounded">Our Hypothesis:</h3>
                <p className="text-sm md:text-base text-gray-700 mx-3 md:mx-6">
                Land, is the most opaque market. If we can solve the information problem for this market, 
                we&apos;ll be of immense value to tens of millions of people (buyers, owners, agents, builders).
                </p>
            </div>

            <div className="bg-[#fafafa] py-6 rounded-lg shadow flex flex-col space-y-4">
                <div className="ml-3 md:ml-6"> <Image src='/about/justice.svg' alt='idea' width={48} height={48} className='w-6 h-6 md:w-12 md:h-12' /> </div>
                <h3 className="text-base md:text-xl py-1 px-3 md:px-6 inline-block font-bold bg-[#ffefad] self-start rounded">The Truth</h3>
                <p className="text-sm md:text-[0.95rem] text-gray-700 mx-3 md:mx-6">
                All the information, that is required to solve the Land Market completely, is already there with &apos;someone&apos; at this current moment <br /><br />
                (Consider all these pieces of information, like the pieces of large jigsaw puzzle) <br /><br />
                Since, all the pieces already exist, there is scope for such an algorithm, that can put together &apos;all these pieces&apos; and solve the information problem ,almost instantly
                </p>
            </div>

            <div className="bg-[#fafafa] py-6 rounded-lg shadow flex flex-col space-y-4">
                <div className="ml-3 md:ml-6"> <Image src='/about/goal.svg' alt='idea' width={48} height={48} className='w-6 h-6 md:w-12 md:h-12' /> </div>
                <h3 className="text-base md:text-xl py-1 px-3 md:px-6 inline-block font-bold bg-[#ffefad] self-start rounded">Our Mission</h3>
                <p className="text-sm md:text-[0.95rem] text-gray-700 mx-3 md:mx-6">
                    At Buildersinfo.in, we exist to design such an algorithm, that can solve the Land Market,
                    completely and instantly.<br /><br />

                    The key to such an algorithm is simple - Incentivise the good players heavily & instantly. Align the incentives of all the good players (Buyers, Agents, Owners & Builders).<br /><br />

                    <b>We took a few steps towards that -</b><br />
                    Our first step, was Verification.<br />
                    We do a &apos;Preliminary Verification&apos; before we list any Land or Plot on Buildersinfo. There is a
                    distinct & pre-defined process for every state and UT . This process eliminates 90% of the potential issues.<br /><br /><br />

                    <b>Our next step is-</b><br />
                    Making discovery of these Verified Lands, instant! With the Latest MapView, that is Free
                    for all, anyone looking to Buy Land anywhere in India, should find the best Land instantly and anybody, that is looking to Sell Land anywhere in India whether it is an owner or an agent, should find the best possible Buyer, almost instantly<br /><br />

                    That it Our Goal at Buildersinfo this year (2025). To bring instant discoverability, to all Verified Lands for sale, for all of India, through the MapView, that is Free for all.<br /><br /><br />

                    <b>Does that solve the Land Market completely?</b><br /><br />
                    No. As we mentioned, Land is the most opaque market and verifying and solving for
                    instant discovery are only the beginning of it.
                    <br /><br />
                    We want to help people transact Land, at scale, by getting involved in the transactions.
                    We want to solve &apos; for all property&apos; like how we are solving &apos;for all Land&apos;.
                    <br /><br />
                    We want to take this global, because why not help many more people, billions of them?
                    The nature of the problem does not change. Only the players.
                    <br /><br />
                    <b>Every problem, is an information problem.</b>
                </p>
            </div>

            <div className="bg-[#fafafa] py-8 rounded-lg shadow-md flex flex-col space-y-4 md:space-y-6">
              <div className="ml-3 md:ml-6">
                <Image src="/about/crowd.svg" alt="idea" width={48} height={48} className="w-6 h-6 md:w-12 md:h-12"/>
              </div>

              <h3 className="text-lg md:text-xl py-1 px-3 md:px-6 inline-block font-bold bg-[#ffefad] self-start rounded">
                Meet the Founders!
              </h3>

              <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0 px-6">
                <div className="flex flex-1 items-center space-x-4">
                  <div>
                    <h4 className="font-bold text-md">Ratna Kiran</h4>
                    <p className="text-xs md:text-sm text-gray-700">Co-Founder</p>
                    <p className="text-xs md:text-sm text-gray-500">
                      Architect, School of Planning & Architecture, New Delhi.
                    </p>
                  </div>
                  <Image
                    src="/team-members/co-founder2.png"
                    alt="Ratna Kiran"
                    width={80}
                    height={80}
                    className="rounded-full object-cover w-[90px] h-[90px] md:w-20 md:h-20"
                  />
                </div>

                <div className="flex flex-1 items-center space-x-4">
                  <div>
                    <h4 className="font-bold text-md">Satish Chandra</h4>
                    <p className="text-xs md:text-sm text-gray-700">Co-Founder</p>
                    <p className="text-xs md:text-sm text-gray-500">
                      Director, Mordor Intelligence,
                      <br />
                      IIM Ahmedabad, BITS Pilani
                    </p>
                  </div>
                  <Image
                    src="/team-members/co-founder1.png"
                    alt="Satish Chandra"
                    width={80}
                    height={80}
                    className="rounded-full object-cover w-[90px] h-[90px] md:w-20 md:h-20"
                  />
                </div>
              </div>

              <div className='px-6'>
                <Image
                  src="/about/team-photo-desktop.avif"
                  alt="Office space"
                  width={1200}
                  height={800}
                  className="w-full max-w-4xl rounded-xl shadow mx-auto"
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}