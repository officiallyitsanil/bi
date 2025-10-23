"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function LayersModal() {
  const [selectedState, setSelectedState] = useState("Telangana");
  const [selected, setSelected] = useState({
    listings: true,
    masterplan: false,
    ncrMasterplan: false,
    ncrListings: false,
  });
  const [appliedFilters, setAppliedFilters] = useState({});

  // Reset selections when state changes
  const handleStateChange = (newState) => {
    setSelectedState(newState);
    // Reset selections based on new state
    if (newState === "Haryana") {
      setSelected({
        listings: false,
        masterplan: false,
        ncrMasterplan: false,
        ncrListings: false,
      });
    } else if (newState === "Telangana") {
      setSelected({
        listings: true,
        masterplan: false,
        ncrMasterplan: false,
        ncrListings: false,
      });
    } else {
      setSelected({
        listings: false,
        masterplan: false,
        ncrMasterplan: false,
        ncrListings: false,
      });
    }
  };

  const states = [
    "Telangana",
    "Andhra Pradesh", 
    "Karnataka",
    "Haryana",
    "Maharashtra",
    "Tamil Nadu",
    "Gujarat",
    "Rajasthan",
    "Uttar Pradesh",
    "Delhi"
  ];

  const getStateContent = (state) => {
    switch (state) {
      case "Haryana":
        return {
          title: "Haryana",
          sections: [
            {
              title: "NCR Masterplan",
              description: "NCR Planning Board, Haryana Urban Development Authority",
              options: [
                {
                  name: "NCR Masterplan",
                  type: "checkbox",
                  key: "ncrMasterplan",
                  premium: false
                },
                {
                  name: "Listings",
                  type: "checkbox", 
                  key: "ncrListings",
                  premium: false
                }
              ]
            }
          ]
        };
      case "Telangana":
        return {
          title: "Telangana",
          sections: [
            {
              title: "Survey Numbers",
              description: "Based on Bhuvan data",
              options: [
                {
                  name: "Listings",
                  type: "checkbox",
                  key: "listings",
                  premium: false
                }
              ]
            },
            {
              title: "Hyderabad",
              description: "HMDA, HUDA, HADA, CDA",
              options: [
                {
                  name: "Masterplan",
                  type: "checkbox",
                  key: "masterplan",
                  premium: false
                }
              ]
            }
          ]
        };
      case "Andhra Pradesh":
        return {
          title: "Andhra Pradesh",
          sections: [
            {
              title: "Survey Numbers",
              description: "Based on Bhuvan data",
              options: [
                {
                  name: "Listings",
                  type: "checkbox",
                  key: "listings",
                  premium: false
                }
              ]
            }
          ]
        };
      case "Karnataka":
        return {
          title: "Karnataka", 
          sections: [
            {
              title: "Survey Numbers",
              description: "Based on Bhuvan data",
              options: [
                {
                  name: "Listings",
                  type: "checkbox",
                  key: "listings",
                  premium: false
                }
              ]
            }
          ]
        };
      default:
        return {
          title: state,
          sections: [
            {
              title: "Survey Numbers",
              description: "Based on Bhuvan data",
              options: [
                {
                  name: "Listings",
                  type: "checkbox",
                  key: "listings",
                  premium: false
                }
              ]
            }
          ]
        };
    }
  };

  const handleApply = () => {
    const currentFilters = {
      state: selectedState,
      filters: selected
    };
    setAppliedFilters(currentFilters);
    console.log("Applied Filters:", currentFilters);
    // You can add additional logic here to apply the filters
  };

  const stateContent = getStateContent(selectedState);

  return (
    <div className="w-full flex flex-col h-full max-h-[70vh]">
      <div className="flex items-center gap-3 border-b pb-3 border-gray-300">
        <h2 className="text-lg font-medium text-gray-900">Layers</h2>
        <select 
          className="bg-gray-200 rounded px-2 py-1 text-sm"
          value={selectedState}
          onChange={(e) => handleStateChange(e.target.value)}
        >
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {stateContent.sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="font-medium text-gray-800 mb-2">{section.title}</h3>
            {section.description && (
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {section.title}
                  </p>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
              </div>
            )}

            {section.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center justify-between py-2 cursor-pointer">
                <span className="font-medium text-sm text-gray-500">{option.name}</span>
                <div className="flex items-center gap-2">
                  <input
                    type={option.type}
                    checked={selected[option.key]}
                    onChange={() => {
                      // All inputs are now checkboxes - simple toggle
                      setSelected(prev => ({
                        ...prev,
                        [option.key]: !prev[option.key]
                      }));
                    }}
                    className="w-4 h-4 accent-yellow-500"
                  />
                </div>
              </label>
            ))}
          </div>
        ))}
      </div>

      <div className="flex p-4 pb-0 border-t border-gray-300">
        <button 
          className="w-full bg-[#ffdd57] text-black py-2.5 px-4 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-yellow-400"
          onClick={handleApply}
        >
          Apply
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {Object.keys(appliedFilters).length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Applied Filters:</h4>
          <div className="text-xs text-gray-600">
            <p><strong>State:</strong> {appliedFilters.state}</p>
            <p><strong>Active Filters:</strong> {Object.entries(appliedFilters.filters)
              .filter(([key, value]) => value)
              .map(([key, value]) => key)
              .join(", ") || "None"}</p>
          </div>
        </div>
      )}
    </div>
  );
}