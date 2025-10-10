"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function LayersModal() {
  const [selected, setSelected] = useState({
    listings: true,
    masterplan: false,
  });

  return (
    <div className="w-full flex flex-col h-full max-h-[70vh]">
      <div className="flex items-center gap-3 border-b pb-3 border-gray-300">
        <h2 className="text-lg font-medium text-gray-900">Layers</h2>
        <select className="bg-gray-200 rounded px-2 py-1 text-sm">
          <option>Telangana</option>
          <option>Andhra Pradesh</option>
          <option>Karnataka</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="font-medium text-gray-800 mb-2">Telangana</h3>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm text-gray-900">
                Survey Numbers
              </p>
              <p className="text-xs text-gray-500">Based on Bhuvan data</p>
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
              Premium
            </span>
          </div>

          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="font-medium text-sm text-gray-500">Listings</span>
            <input
              type="checkbox"
              checked={selected.listings}
              onChange={() =>
                setSelected((p) => ({ ...p, listings: !p.listings }))
              }
              className="w-4 h-4 accent-yellow-500"
            />
          </label>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-2">Hyderabad</h3>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div>
              <p className="font-medium text-sm text-gray-900">Masterplan</p>
              <p className="text-xs text-gray-500">HMDA, HUDA, HADA, CDA</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                Premium
              </span>
              <input
                type="radio"
                name="hyderabad"
                checked={selected.masterplan}
                onChange={() =>
                  setSelected((p) => ({ ...p, masterplan: !p.masterplan }))
                }
                className="w-4 h-4 accent-yellow-500"
              />
            </div>
          </label>
        </div>
      </div>

      <div className="flex p-4 pb-0 border-t border-gray-300">
        <button className="w-full bg-[#ffdd57] text-black py-2.5 px-4 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-yellow-400">
          Apply
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}