"use client";

import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';

export default function BuildersPage() {
  const router = useRouter();

  const builders = [
    {
      id: 'prestige-group',
      name: 'Prestige Group',
      tagline: 'Building Dreams, Creating Landmarks',
      founded: '1986',
      headquarters: 'Bangalore',
      projectsCompleted: '280+',
      ongoingProjects: '45',
      upcomingProjects: '25',
      experience: '37+',
      cities: '12',
    },
    {
      id: 'brigade-group',
      name: 'Brigade Group',
      tagline: 'Excellence in Real Estate',
      founded: '1986',
      headquarters: 'Bangalore',
      projectsCompleted: '200+',
      ongoingProjects: '35',
      upcomingProjects: '20',
      experience: '37+',
      cities: '8',
    },
    {
      id: 'sobha-limited',
      name: 'Sobha Limited',
      tagline: 'Passion at Work',
      founded: '1995',
      headquarters: 'Bangalore',
      projectsCompleted: '150+',
      ongoingProjects: '30',
      upcomingProjects: '15',
      experience: '28+',
      cities: '10',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-4xl font-semibold text-gray-900">Builders</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Explore top real estate developers</p>
        </div>
      </div>

      {/* Builders Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {builders.map((builder) => (
            <div key={builder.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Builder Header */}
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 p-6 text-white">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-center mb-2">{builder.name}</h2>
                <p className="text-sm italic text-center opacity-90">&quot;{builder.tagline}&quot;</p>
              </div>

              {/* Builder Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Founded</div>
                    <div className="text-lg font-bold text-gray-900">{builder.founded}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">HQ</div>
                    <div className="text-lg font-bold text-gray-900">{builder.headquarters}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{builder.projectsCompleted}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{builder.ongoingProjects}</div>
                    <div className="text-xs text-gray-600">Ongoing</div>
                  </div>
                </div>

                {/* More Details Button */}
                <button
                  onClick={() => router.push(`/builders/${builder.id}`)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  More Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
