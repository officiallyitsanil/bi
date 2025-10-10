import { ArrowRight, Handshake, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BuyPage() {
  return (
    <>
      <div className="w-full h-36 md:h-80 relative">
        <Image
          src="/buy-properties/buy-property-hero.png"
          alt="buy-properties-hero"
          fill
          style={{objectFit: "cover"}}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="py-1 md:border-b border-gray-300">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-8">
          Buy <span className="text-lg md:text-[1.75rem] font-normal">Through Buildersinfo</span>
        </h1>
        </div>

        <div className="space-y-4 mb-12 md:mb-0 mt-4 md:mt-8">
          <Link href={'hand-holding'} className="block" >
            <div className="flex items-center justify-between border border-gray-200 bg-[#feeead] rounded-lg p-3 md:p-6">
              <div className="flex items-start gap-3">
                <Handshake className="w-6 h-6 text-gray-700 mt-1" />
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">
                    Hand holding
                  </h2>
                  <p className="text-xs md:text-sm text-gray-700">
                    We help you find, evaluate, and buy the right lands.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-7 h-7 self-start text-gray-700" />
            </div>
          </Link>

          <Link href={'tag-along'} className="block" >
            <div className="flex items-center justify-between border border-gray-200 rounded-lg p-3 md:p-6">
              <div className="flex items-start gap-3">
                <Users className="w-6 h-6 text-gray-700 mt-1" />
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">
                    Tag along
                  </h2>
                  <p className="text-xs md:text-sm text-gray-700">
                    We Buy Lands. You can tag-along with us. (Starting at 4 lakh/ acre)
                  </p>
                </div>
              </div>
              <ArrowRight className="w-7 h-7 self-start text-gray-700" />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}