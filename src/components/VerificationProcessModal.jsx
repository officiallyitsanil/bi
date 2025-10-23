"use client";
import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

const states = [
  "Andhra Pradesh", "Arunachal Pradesh",
  "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Delhi", "Jammu and Kashmir",
];

export default function VerificationProcessModal({ onClose }) {
  const [selectedTab, setSelectedTab] = useState("Residential");
  const [selectedState, setSelectedState] = useState("Select state");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center z-90 p-4"
    >
      <div
        onClick={(e) => {
          if (dropdownOpen) {
            setDropdownOpen(false)
          }
          e.stopPropagation();
        }}
        className="bg-white rounded-2xl shadow-lg w-full md:w-[400px] max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-3">
          <h2 className="text-base md:text-xl mr-2 font-medium text-gray-900">Verification Process</h2>
          <div className="pr-6 pb-6 flex-shrink-0 relative">
            <div
              className={`w-full bg-gray-100 rounded-full px-3 py-1 cursor-pointer flex justify-between items-center gap-2 ${
                dropdownOpen ? "border border-gray-600" : ""
              }`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="text-sm truncate max-w-[140px] overflow-hidden">{selectedState}</span>
              <ChevronDown className="text-gray-700 flex-shrink-0" size={16} />
            </div>

            {dropdownOpen && (
              <div className="absolute mt-1 w-full md:w-80 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg z-20 shadow-lg scrollbar-hide">
                {states.map((state) => (
                  <div
                    key={state}
                    className={`px-3 py-2 cursor-pointer hover:bg-[#feeead] ${selectedState === state ? "bg-gray-100 font-medium" : ""
                      }`}
                    onClick={() => {
                      setSelectedState(state);
                      setDropdownOpen(false);
                    }}
                  >
                    {state}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:cursor-pointer"
          >
            <X size={25} />
          </button>
        </div>

        <div className="px-6 pb-4 flex-shrink-0">
          <div className="inline-block space-x-2 bg-gray-50 rounded-full">
            <button
              onClick={() => setSelectedTab("Residential")}
              className={`px-3 py-2.5 rounded-full text-xs font-semibold hover:cursor-pointer ${selectedTab === "Residential"
                  ? "bg-[#ffdd57] text-black"
                  : "text-gray-600"
                }`}
            >
              Residential
            </button>
            <button
              onClick={() => setSelectedTab("Commercial")}
              className={`px-3 py-2.5 rounded-full text-xs font-semibold hover:cursor-pointer ${selectedTab === "Commercial"
                  ? "bg-[#ffdd57] text-black"
                  : "text-gray-600"
                }`}
            >
              Commercial
            </button>
          </div>
        </div>

        <div className="mt-3 px-6 pb-6 overflow-y-auto flex-1">
          {selectedTab === "Residential" && (
            <>
              <div className="relative">
                <div className="absolute left-[10px] top-12 bottom-0 border-l-2 border-dashed border-gray-500"></div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Residential Credentials
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Verifying residential credentials against online records in Bhu Bharati Portal.
                    </p>
                    <p className="text-sm font-medium text-gray-900 mb-2">Credentials:</p>
                    <ul className="space-y-1">
                      <li className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                        Owner Name
                      </li>
                      <li className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
n                        Extent Size
                      </li>
                      <li className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                        Survey & Subdivision Numbers
                      </li>
                      <li className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                        Residential Nature
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="relative mt-4">
                <div className="absolute left-[10px] top-12 bottom-0 border-l-2 border-dashed border-gray-500"></div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Location
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Match residential location with the corresponding survey number on cadastral maps.  
                      Access maps via the Bhuvan using location.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative mt-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Prohibited / Restricted Residentials
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Check on Bhu Bharati for any restricted category flags.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedTab === "Commercial" && (
            <>
              <div className="relative">
                <div className="absolute left-[10px] top-12 bottom-0 border-l-2 border-dashed border-gray-500"></div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Commercial Credentials
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      We verify the credentials on the Encumbrance Certificate (EC).
                    </p>
                    <p className="text-sm font-medium text-gray-900 mb-2">Credentials:</p>
                    <ul className="space-y-1">
                      <li className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                        Document Number
                      </li>
                      <li className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                        Survey Number
                      </li>
                      <li className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                        Commercial Number
                      </li>
                      <li className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                        Boundaries
                      </li>
                      <li className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                        Owner Name
                      </li>
                      <li className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                        Extent Size
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="relative mt-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Location
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Match commercial location with the corresponding survey number on cadastral maps.  
                      Access maps via the Bhuvan using location.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}