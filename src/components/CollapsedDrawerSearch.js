"use client";

import { Search, SlidersHorizontal, Globe } from "lucide-react";

/**
 * Same UI as drawer search bar, but with lesser width.
 * Shown in top-left when left drawer is collapsed.
 */
export default function CollapsedDrawerSearch({
  searchQuery,
  onSearchChange,
  onSearch,
  onSuggestionSelect,
  suggestions,
  showSuggestions,
  onFocus,
  onBlur,
  isSearchFocused,
  onFilterClick,
  onGlobeClick,
  isDark,
  isLoadingProperties,
}) {
  return (
    <div className="absolute top-3 left-3 z-10 w-[260px]">
      <form onSubmit={onSearch} className="relative search-container">
          <div className={`rounded-lg pl-3 pr-2.5 py-2.5 w-full flex items-center gap-2 min-h-[40px] ${isDark ? "bg-[#282c34]" : "bg-gray-100"}`}>
            <Search className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            <div
              className="flex-1 flex items-center gap-1.5 min-w-0 relative cursor-text"
              onClick={() => {
                if (!isSearchFocused) {
                  const input = document.querySelector(".collapsed-search-input");
                  if (input) {
                    input.focus();
                    onFocus?.();
                  }
                }
              }}
            >
              <span className={`text-sm font-medium whitespace-nowrap ${isDark ? "text-gray-400" : "text-gray-500"}`}>Search</span>
              <div className="flex-1 relative min-w-0">
                {searchQuery && !isSearchFocused ? (
                  <span className={`text-sm font-medium cursor-text pointer-events-none ${isDark ? "text-white" : "text-gray-700"}`}>&quot;{searchQuery}&quot;</span>
                ) : null}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder=""
                  disabled={isLoadingProperties}
                  className={`collapsed-search-input w-full outline-none text-sm font-medium bg-transparent ${isDark ? "text-white" : "text-gray-700"} ${searchQuery && !isSearchFocused ? "absolute inset-0 opacity-0" : ""} ${isLoadingProperties ? "cursor-not-allowed" : ""}`}
                  style={{ background: "transparent", border: "none", padding: 0 }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFilterClick?.();
                }}
                disabled={isLoadingProperties}
                className={`transition-colors ${isLoadingProperties ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onGlobeClick?.();
                }}
                disabled={isLoadingProperties}
                className={`transition-colors ${isLoadingProperties ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showSuggestions && (
            <div className={`absolute top-full left-0 right-0 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto z-[500] border ${isDark ? "bg-[#282c34] border-gray-700" : "bg-white border-gray-200"}`}>
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSuggestionSelect?.(suggestion);
                    }}
                    className={`px-4 py-2.5 cursor-pointer border-b last:border-b-0 transition-all duration-200 ${isDark ? "hover:bg-gray-700 border-gray-700" : "hover:bg-gray-100 border-gray-100"}`}
                  >
                    <div className={`text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}>{suggestion.displayText}</div>
                  </div>
                ))
              ) : (
                <div className={`px-4 py-2.5 text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                  No suggestions found
                </div>
              )}
            </div>
          )}
        </form>
    </div>
  );
}
