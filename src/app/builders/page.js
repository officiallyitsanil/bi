"use client";

import { useRouter } from 'next/navigation';
import { Building2, MapPin, Calendar, TrendingUp, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BuildersPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    fetchBuilders();
  }, []);

  const fetchBuilders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/builders');
      const data = await response.json();

      if (data.success) {
        // Transform MongoDB data to match UI structure
        const transformedBuilders = data.data.map((builder, index) => ({
          id: builder._id,
          name: builder.builderName || 'N/A',
          tagline: builder.tagline || '',
          founded: builder.foundedYear || 'N/A',
          headquarters: builder.headquarters || 'N/A',
          projectsCompleted: builder.projectsCompleted?.toString() || '0',
          ongoingProjects: builder.ongoingProjects?.toString() || '0',
          upcomingProjects: builder.upcomingProjects?.toString() || '0',
          experience: builder.yearsOfExperience ? `${builder.yearsOfExperience}+` : 'N/A',
          cities: builder.citiesPresence || 'N/A',
          gradient: ['from-emerald-500 via-teal-500 to-cyan-600', 'from-blue-500 via-indigo-500 to-purple-600', 'from-orange-500 via-red-500 to-pink-600'][index % 3],
          accentColor: ['emerald', 'blue', 'orange'][index % 3],
        }));
        setBuilders(transformedBuilders);
      }
    } catch (err) {
      console.error('Error fetching builders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAccentColors = (color) => {
    const colors = {
      emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        hover: 'hover:bg-emerald-600',
        border: 'border-emerald-200',
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-600',
        border: 'border-blue-200',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        hover: 'hover:bg-orange-600',
        border: 'border-orange-200',
      },
    };
    return colors[color];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading builders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Builders Grid with Staggered Animation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-12">
        {builders.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No builders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {builders.map((builder, index) => {
            const colors = getAccentColors(builder.accentColor);
            return (
              <div
                key={builder.id}
                className={`group transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
                  }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
                  {/* Builder Header with Gradient */}
                  <div className={`bg-gradient-to-br ${builder.gradient} p-8 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <Building2 className={`w-10 h-10 ${colors.text}`} />
                      </div>
                      <h2 className="text-2xl font-bold text-center mb-2 drop-shadow-md">{builder.name}</h2>
                      <p className="text-sm text-center opacity-95 font-light italic">&quot;{builder.tagline}&quot;</p>
                    </div>
                  </div>

                  {/* Builder Stats */}
                  <div className="p-6">
                    {/* Key Info */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className={`text-center p-4 ${colors.bg} rounded-xl border ${colors.border} transition-all hover:scale-105`}>
                        <Calendar className={`w-5 h-5 ${colors.text} mx-auto mb-2`} />
                        <div className="text-xs text-gray-500 mb-1">Founded</div>
                        <div className={`text-xl font-bold ${colors.text}`}>{builder.founded}</div>
                      </div>
                      <div className={`text-center p-4 ${colors.bg} rounded-xl border ${colors.border} transition-all hover:scale-105`}>
                        <MapPin className={`w-5 h-5 ${colors.text} mx-auto mb-2`} />
                        <div className="text-xs text-gray-500 mb-1">Headquarters</div>
                        <div className={`text-xl font-bold ${colors.text}`}>{builder.headquarters}</div>
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-gray-700 font-medium">Completed</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">{builder.projectsCompleted}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-amber-600" />
                          <span className="text-sm text-gray-700 font-medium">Ongoing</span>
                        </div>
                        <span className="text-xl font-bold text-amber-600">{builder.ongoingProjects}</span>
                      </div>
                    </div>

                    {/* More Details Button */}
                    <button
                      onClick={() => router.push(`/builders/${builder.id}`)}
                      className={`w-full bg-gradient-to-r ${builder.gradient} ${colors.hover} text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 group`}
                    >
                      <span>View Details</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
