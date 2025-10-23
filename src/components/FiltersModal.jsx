"use client";

import { useState, useEffect } from "react";

import { ArrowRight } from "lucide-react";



export default function FiltersModal({

  filters,

  setFilters,

  sizeUnit,

  setSizeUnit,

  onApply

}) {

  const [localFilters, setLocalFilters] = useState(filters);



  // Update local filters when props change

  useEffect(() => {

    setLocalFilters(filters);

  }, [filters]);



  const handleTypeToggle = (type) => {

    setLocalFilters((prev) => ({

      ...prev,

      type: { ...prev.type, [type]: !prev.type[type] },

    }));

    // Don't apply immediately - wait for Apply button

  };



  const handleListedByToggle = (option) => {

    setLocalFilters((prev) => ({

      ...prev,

      listedBy: { ...prev.listedBy, [option]: !prev.listedBy[option] },

    }));

    // Don't apply immediately - wait for Apply button

  };



  const handleBudgetChange = (index, value) => {

    setLocalFilters((prev) => {

      const newBudget = [...prev.budget];

      newBudget[index] = value;

      return { ...prev, budget: newBudget };

    });

    // Don't apply immediately - wait for Apply button

  };



  const handleSizeChange = (index, value) => {

    setLocalFilters((prev) => {

      const newSize = [...prev.size];

      newSize[index] = value;

      return { ...prev, size: newSize };

    });

    // Don't apply immediately - wait for Apply button

  };

  const handleSizeUnitChange = (unit) => {
    setSizeUnit(unit);
    
    // Convert current size values when unit changes
    setLocalFilters((prev) => {
      const newSize = [...prev.size];
      
      if (unit === 'Square Feet' && sizeUnit === 'Square Yards') {
        // Convert from square yards to square feet (1 sq yard = 9 sq feet)
        newSize[0] = Math.round(prev.size[0] * 9);
        newSize[1] = Math.round(prev.size[1] * 9);
      } else if (unit === 'Square Yards' && sizeUnit === 'Square Feet') {
        // Convert from square feet to square yards
        newSize[0] = Math.round(prev.size[0] / 9);
        newSize[1] = Math.round(prev.size[1] / 9);
      }
      
      return { ...prev, size: newSize };
    });
  };



  const clearAll = () => {

    const defaultFilters = {

      type: { commercial: false, residential: false }, // Uncheck all

      listedBy: { owner: false, agent: false, iacre: false }, // Uncheck all

      budget: [0, 30],

      size: [0, 50000],

    };

    setLocalFilters(defaultFilters);

    setFilters(defaultFilters);

    setSizeUnit('Square Yards'); // Reset to default unit

    // Close modal after clearing

    onApply && onApply(defaultFilters);

  };



  const handleApply = () => {

    setFilters(localFilters);

    onApply && onApply(localFilters);

  };



  return (

    <div className="w-full flex flex-col h-full max-h-[90vh] md:max-h-[67vh]">

      <div className="flex items-center justify-between border-b p-1 border-gray-300">

        <h2 className="text-lg font-medium text-gray-900">Filters</h2>

      </div>



      <div className="flex-1 overflow-y-auto p-4">

        <div className="space-y-6">

          <div className="pb-4 border-b border-gray-300">

            <h3 className="text-base font-medium text-gray-900 mb-3">Type</h3>

            <div className="flex gap-3">

              {["commercial", "residential"].map((t) => (

                <label

                  key={t}

                  className={`px-3 py-1.5 rounded-full border text-sm font-medium cursor-pointer flex items-center gap-2 capitalize ${

                    localFilters.type[t]

                      ? "border-black bg-gray-100"

                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"

                  }`}

                >

                  {t}

                  <input

                    type="checkbox"

                    checked={localFilters.type[t]}

                    onChange={() => handleTypeToggle(t)}

                    className="w-4 h-4 accent-black cursor-pointer rounded-none"

                  />

                </label>

              ))}

            </div>

          </div>



          <div className="pb-4 border-b border-gray-300">

            <h3 className="text-base font-medium text-gray-900 mb-3">

              Listed By:

            </h3>

            <div className="flex flex-wrap gap-3">

              {["owner", "agent", "iacre"].map((opt) => (

                <label

                  key={opt}

                  className={`px-3 py-1.5 rounded-full border text-sm font-medium cursor-pointer flex items-center gap-2 capitalize ${

                    localFilters.listedBy[opt]

                      ? "border-black bg-gray-100"

                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"

                  }`}

                >

                  {opt === "iacre" ? "Buildersinfo" : opt}

                  <input

                    type="checkbox"

                    checked={localFilters.listedBy[opt]}

                    onChange={() => handleListedByToggle(opt)}

                    className="w-4 h-4 accent-black cursor-pointer"

                  />

                </label>

              ))}

            </div>

          </div>



          <div className="pb-4 border-b border-gray-300">

            <h3 className="text-base font-medium text-gray-900 mb-3">

              Budget{" "}

              <span className="text-sm font-normal text-gray-500">

                (In Crores)

              </span>

            </h3>

            <div className="mt-4">

              <div className="flex flex-row justify-between lg:mr-14 text-xs lg:text-sm text-gray-700 mb-4">

                <p>Range:</p>

                <p>₹{localFilters.budget[0]}cr – ₹{localFilters.budget[1]}cr</p>

              </div>

              <div className="relative">

                <div className="h-2 bg-gray-200 rounded-full relative">

                  <div

                    className="absolute h-2 bg-blue-500 rounded-full"

                    style={{

                      left: `${(localFilters.budget[0] / 30) * 100}%`,

                      right: `${100 - ((localFilters.budget[1] / 30) * 100)}%`,

                    }}

                  />

                </div>

                <input

                  type="range"

                  min="0"

                  max="30"

                  value={localFilters.budget[0]}

                  onChange={(e) => {

                    const newMin = Number(e.target.value);

                    const currentMax = localFilters.budget[1];

                    if (newMin <= currentMax) {

                      setLocalFilters((prev) => ({

                        ...prev,

                        budget: [newMin, currentMax]

                      }));

                    }

                  }}

                  className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-10

                    [&::-webkit-slider-thumb]:appearance-none 

                    [&::-webkit-slider-thumb]:h-4 

                    [&::-webkit-slider-thumb]:w-4 

                    [&::-webkit-slider-thumb]:rounded-full 

                    [&::-webkit-slider-thumb]:bg-blue-600 

                    [&::-webkit-slider-thumb]:cursor-pointer

                    [&::-webkit-slider-thumb]:pointer-events-auto

                    [&::-webkit-slider-thumb]:border-2

                    [&::-webkit-slider-thumb]:border-white

                    [&::-webkit-slider-thumb]:shadow-md

                    [&::-moz-range-thumb]:appearance-none 

                    [&::-moz-range-thumb]:h-4 

                    [&::-moz-range-thumb]:w-4 

                    [&::-moz-range-thumb]:rounded-full 

                    [&::-moz-range-thumb]:bg-blue-600 

                    [&::-moz-range-thumb]:cursor-pointer

                    [&::-moz-range-thumb]:border-2

                    [&::-moz-range-thumb]:border-white

                    [&::-moz-range-thumb]:shadow-md"

                  style={{ top: '0px' }}

                />

                <input

                  type="range"

                  min="0"

                  max="30"

                  value={localFilters.budget[1]}

                  onChange={(e) => {

                    const newMax = Number(e.target.value);

                    const currentMin = localFilters.budget[0];

                    if (newMax >= currentMin) {

                      setLocalFilters((prev) => ({

                        ...prev,

                        budget: [currentMin, newMax]

                      }));

                    }

                  }}

                  className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-20

                    [&::-webkit-slider-thumb]:appearance-none 

                    [&::-webkit-slider-thumb]:h-4 

                    [&::-webkit-slider-thumb]:w-4 

                    [&::-webkit-slider-thumb]:rounded-full 

                    [&::-webkit-slider-thumb]:bg-blue-600 

                    [&::-webkit-slider-thumb]:cursor-pointer

                    [&::-webkit-slider-thumb]:pointer-events-auto

                    [&::-webkit-slider-thumb]:border-2

                    [&::-webkit-slider-thumb]:border-white

                    [&::-webkit-slider-thumb]:shadow-md

                    [&::-moz-range-thumb]:appearance-none 

                    [&::-moz-range-thumb]:h-4 

                    [&::-moz-range-thumb]:w-4 

                    [&::-moz-range-thumb]:rounded-full 

                    [&::-moz-range-thumb]:bg-blue-600 

                    [&::-moz-range-thumb]:cursor-pointer

                    [&::-moz-range-thumb]:border-2

                    [&::-moz-range-thumb]:border-white

                    [&::-moz-range-thumb]:shadow-md"

                  style={{ top: '0px' }}

                />

              </div>

            </div>

          </div>



          <div>

            <div className="flex items-center gap-2 mb-3">

              <h3 className="text-base font-medium text-gray-900">Size</h3>

              <select 
                value={sizeUnit}
                onChange={(e) => handleSizeUnitChange(e.target.value)}
                className="px-3 hover:cursor-pointer py-1.5 border border-gray-300 rounded-full text-sm bg-gray-100"
              >
                <option value="Square Yards">Square Yards</option>
                <option value="Square Feet">Square Feet</option>
              </select>

            </div>

            <div className="mt-4">

              <div className="flex flex-row justify-between lg:mr-14 text-xs lg:text-sm text-gray-700 mb-4">

                <p>Range:</p>

                <p>{localFilters.size[0].toLocaleString()} – {localFilters.size[1].toLocaleString()} {sizeUnit === 'Square Feet' ? 'sq ft' : 'sq yd'}</p>

              </div>

              <div className="relative">

                <div className="h-2 bg-gray-200 rounded-full relative">

                  <div

                    className="absolute h-2 bg-blue-500 rounded-full"

                    style={{

                      left: `${(localFilters.size[0] / (sizeUnit === 'Square Feet' ? 450000 : 50000)) * 100}%`,

                      right: `${100 - ((localFilters.size[1] / (sizeUnit === 'Square Feet' ? 450000 : 50000)) * 100)}%`,

                    }}

                  />

                </div>

                <input

                  type="range"

                  min="0"

                  max={sizeUnit === 'Square Feet' ? '450000' : '50000'}

                  value={localFilters.size[0]}

                  onChange={(e) => {

                    const newMin = Number(e.target.value);

                    const currentMax = localFilters.size[1];

                    if (newMin <= currentMax) {

                      setLocalFilters((prev) => ({

                        ...prev,

                        size: [newMin, currentMax]

                      }));

                    }

                  }}

                  className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-10

                    [&::-webkit-slider-thumb]:appearance-none 

                    [&::-webkit-slider-thumb]:h-4 

                    [&::-webkit-slider-thumb]:w-4 

                    [&::-webkit-slider-thumb]:rounded-full 

                    [&::-webkit-slider-thumb]:bg-blue-600 

                    [&::-webkit-slider-thumb]:cursor-pointer

                    [&::-webkit-slider-thumb]:pointer-events-auto

                    [&::-webkit-slider-thumb]:border-2

                    [&::-webkit-slider-thumb]:border-white

                    [&::-webkit-slider-thumb]:shadow-md

                    [&::-moz-range-thumb]:appearance-none 

                    [&::-moz-range-thumb]:h-4 

                    [&::-moz-range-thumb]:w-4 

                    [&::-moz-range-thumb]:rounded-full 

                    [&::-moz-range-thumb]:bg-blue-600 

                    [&::-moz-range-thumb]:cursor-pointer

                    [&::-moz-range-thumb]:border-2

                    [&::-moz-range-thumb]:border-white

                    [&::-moz-range-thumb]:shadow-md"

                  style={{ top: '0px' }}

                />

                <input

                  type="range"

                  min="0"

                  max={sizeUnit === 'Square Feet' ? '450000' : '50000'}

                  value={localFilters.size[1]}

                  onChange={(e) => {

                    const newMax = Number(e.target.value);

                    const currentMin = localFilters.size[0];

                    if (newMax >= currentMin) {

                      setLocalFilters((prev) => ({

                        ...prev,

                        size: [currentMin, newMax]

                      }));

                    }

                  }}

                  className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-20

                    [&::-webkit-slider-thumb]:appearance-none 

                    [&::-webkit-slider-thumb]:h-4 

                    [&::-webkit-slider-thumb]:w-4 

                    [&::-webkit-slider-thumb]:rounded-full 

                    [&::-webkit-slider-thumb]:bg-blue-600 

                    [&::-webkit-slider-thumb]:cursor-pointer

                    [&::-webkit-slider-thumb]:pointer-events-auto

                    [&::-webkit-slider-thumb]:border-2

                    [&::-webkit-slider-thumb]:border-white

                    [&::-webkit-slider-thumb]:shadow-md

                    [&::-moz-range-thumb]:appearance-none 

                    [&::-moz-range-thumb]:h-4 

                    [&::-moz-range-thumb]:w-4 

                    [&::-moz-range-thumb]:rounded-full 

                    [&::-moz-range-thumb]:bg-blue-600 

                    [&::-moz-range-thumb]:cursor-pointer

                    [&::-moz-range-thumb]:border-2

                    [&::-moz-range-thumb]:border-white

                    [&::-moz-range-thumb]:shadow-md"

                  style={{ top: '0px' }}

                />

              </div>

            </div>

          </div>

        </div>

      </div>



      <div className="flex gap-3 p-4 pb-1 border-t border-gray-300">

        <button

          onClick={clearAll}

          className="flex-1 py-2.5 px-4 text-gray-700 font-medium border border-gray-300 rounded-full hover:bg-gray-100"

        >

          Clear all

        </button>

        <button

          onClick={handleApply}

          className="flex-1 bg-[#ffdd57] text-black py-2.5 px-4 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-yellow-400"

        >

          Apply

          <ArrowRight className="w-5 h-5" />

        </button>

      </div>

    </div>

  );

}