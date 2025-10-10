"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function FiltersModal() {
  const [filters, setFilters] = useState({
    type: {
      lands: true,
      plots: true,
    },
    listedBy: {
      owner: false,
      agent: true,
      iacre: false,
    },
    budget: [0, 30],
    size: [0, 50000],
  });

  const handleTypeToggle = (type) => {
    setFilters((prev) => ({
      ...prev,
      type: { ...prev.type, [type]: !prev.type[type] },
    }));
  };

  const handleListedByToggle = (option) => {
    setFilters((prev) => ({
      ...prev,
      listedBy: { ...prev.listedBy, [option]: !prev.listedBy[option] },
    }));
  };

  const handleBudgetChange = (index, value) => {
    setFilters((prev) => {
      const newBudget = [...prev.budget];
      newBudget[index] = value;
      return { ...prev, budget: newBudget };
    });
  };

  const handleSizeChange = (index, value) => {
    setFilters((prev) => {
      const newSize = [...prev.size];
      newSize[index] = value;
      return { ...prev, size: newSize };
    });
  };

  const clearAll = () => {
    setFilters({
      type: { lands: false, plots: false },
      listedBy: { owner: false, agent: false, iacre: false },
      budget: [0, 30],
      size: [0, 50000],
    });
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
              {["lands", "plots"].map((t) => (
                <label
                  key={t}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium cursor-pointer flex items-center gap-2 capitalize ${
                    filters.type[t]
                      ? "border-black bg-gray-100"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {t}
                  <input
                    type="checkbox"
                    checked={filters.type[t]}
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
                    filters.listedBy[opt]
                      ? "border-black bg-gray-100"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {opt === "iacre" ? "Buildersinfo" : opt}
                  <input
                    type="checkbox"
                    checked={filters.listedBy[opt]}
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
            <div className="mb-2 pl-1 pr-5">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>{Math.min(filters.budget[0], filters.budget[1])}cr</span>
                <span>{Math.max(filters.budget[0], filters.budget[1])}cr+</span>
              </div>
              <div className="relative h-2">
                <div className="absolute inset-0 h-1 my-auto bg-gray-200 rounded-full"></div>
                <div
                  className="absolute h-1 my-auto bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full"
                  style={{
                    left: `${
                      (Math.min(filters.budget[0], filters.budget[1]) / 30) *
                      100
                    }%`,
                    right: `${
                      100 -
                      (Math.max(filters.budget[0], filters.budget[1]) / 30) *
                        100
                    }%`,
                  }}
                />
                {filters.budget.map((val, idx) => (
                  <input
                    key={idx}
                    type="range"
                    min="0"
                    max="30"
                    value={val}
                    onChange={(e) =>
                      handleBudgetChange(idx, parseInt(e.target.value))
                    }
                    className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer"
                    style={{ zIndex: idx === 0 ? 10 : 20 }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base font-medium text-gray-900">Size</h3>
              <select className="px-3 hover:cursor-pointer py-1.5 border border-gray-300 rounded-full text-sm bg-gray-100">
                <option>Square Yards</option>
                <option>Square Feet</option>
              </select>
            </div>
            <div className="mb-2 pl-1 pr-5">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>{Math.min(filters.size[0], filters.size[1])}</span>
                <span>{Math.max(filters.size[0], filters.size[1])}+</span>
              </div>
              <div className="relative h-2">
                <div className="absolute inset-0 h-1 my-auto bg-gray-200 rounded-full"></div>
                <div
                  className="absolute h-1 my-auto bg-black rounded-full"
                  style={{
                    left: `${
                      (Math.min(filters.size[0], filters.size[1]) / 50000) * 100
                    }%`,
                    right: `${
                      100 -
                      (Math.max(filters.size[0], filters.size[1]) / 50000) * 100
                    }%`,
                  }}
                />
                {filters.size.map((val, idx) => (
                  <input
                    key={idx}
                    type="range"
                    min="0"
                    max="50000"
                    value={val}
                    onChange={(e) =>
                      handleSizeChange(idx, parseInt(e.target.value))
                    }
                    className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer"
                    style={{ zIndex: idx === 0 ? 10 : 20 }}
                  />
                ))}
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
        <button className="flex-1 bg-[#ffdd57] text-black py-2.5 px-4 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-yellow-400">
          Apply
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}