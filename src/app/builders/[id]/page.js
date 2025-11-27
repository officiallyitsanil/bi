"use client";

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Home, Building2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BuilderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const builderId = params.id;
  const [isVisible, setIsVisible] = useState(false);
  const [builderData, setBuilderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchBuilderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builderId]);

  const fetchBuilderData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/builders/${builderId}`);
      const data = await response.json();

      if (data.success) {
        const builderInfo = data.builder || data.data;
        setBuilderData(builderInfo);
      } else {
        setError(data.message || 'Failed to fetch builder data');
      }
    } catch (err) {
      setError('Error fetching builder data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading builder information...</p>
        </div>
      </div>
    );
  }

  if (error || !builderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Builder not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Transform MongoDB data to match UI structure
  const transformedData = {
    name: builderData.builderName || 'N/A',
    tagline: builderData.tagline || '',
    founded: builderData.foundedYear || 'N/A',
    headquarters: builderData.headquarters || 'N/A',
    projectsCompleted: builderData.projectsCompleted?.toString() || '0',
    ongoingProjects: builderData.ongoingProjects?.toString() || '0',
    upcomingProjects: builderData.upcomingProjects?.toString() || '0',
    experience: builderData.yearsOfExperience ? `${builderData.yearsOfExperience}+` : 'N/A',
    cities: builderData.citiesPresence || 'N/A',
    ceoName: builderData.directorName || 'N/A',
    ceoTitle: builderData.directorPosition || '',
    ceoQuote: builderData.directorQuote || builderData.description || '',
    about: builderData.description ? [builderData.description] : [],
    mission: builderData.missionStatement || '',
    vision: builderData.visionStatement || '',
    logo: builderData.builderLogo?.url || null,
    galleryImages: builderData.galleryImages || [],
    awards: builderData.awards || [],
    socialMedia: builderData.socialMedia || {},
    website: builderData.officialWebsite || '',
    email: builderData.contactEmail || '',
    phone: builderData.phoneNumber || '',
    address: builderData.corporateOfficeAddress || '',
    category: builderData.builderCategory || '',
    testimonial: builderData.clientTestimonial || '',
    videoUrl: builderData.promotionalVideoUrl || '',
    keyPeople: builderData.keyPeople || []
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Modal */}
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-1 sm:p-4"
          onClick={closeImageModal}
        >
          <button
            onClick={closeImageModal}
            className="absolute top-1 right-1 sm:top-4 sm:right-4 text-white hover:bg-white hover:text-black rounded-full p-1.5 sm:p-2 transition-colors z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-8 sm:h-8" />
          </button>
          <div
            className="max-w-full max-h-full w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
      {/* Header Section */}
      <div
        className={`bg-white border-b transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
          }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl sm:text-4xl font-semibold text-gray-900">
                {builderData?.builderName || 'Builder Details'}
              </h1>
            </div>

            {/* Right: Stats Cards */}
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto overflow-x-auto">
              {/* Stats removed as per request */}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-3 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
          {/* Left Column - Company Info */}
          <div
            className={`lg:col-span-5 space-y-4 sm:space-y-6 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
              }`}
            style={{ transitionDelay: '100ms' }}
          >
            {/* Builder Logo */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-8 shadow-sm">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-2.5 sm:mb-4">
                    {transformedData.logo ? (
                      <div className="w-16 h-16 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openImageModal(transformedData.logo)}>
                        <img
                          src={transformedData.logo}
                          alt={transformedData.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 sm:w-16 sm:h-16 text-white" />
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">{transformedData.name.split(' ')[0]}</h2>
                  {transformedData.name.split(' ')[1] && (
                    <h3 className="text-lg sm:text-2xl font-semibold text-gray-700 mb-1.5 sm:mb-2">{transformedData.name.split(' ')[1]}</h3>
                  )}
                  <p className="text-xs sm:text-sm text-gray-500 italic">{transformedData.tagline}</p>
                </div>
              </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {/* Projects Completed */}
              <div className="bg-blue-500 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-white shadow-lg">
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <Home className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-4xl font-bold mb-0.5 sm:mb-1">{transformedData.projectsCompleted}</div>
                  <div className="text-[10px] sm:text-sm opacity-90 leading-tight">Projects Completed</div>
                </div>
              </div>

              {/* Ongoing Projects */}
              <div className="bg-orange-500 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-white shadow-lg">
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <Building2 className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-4xl font-bold mb-0.5 sm:mb-1">{transformedData.ongoingProjects}</div>
                  <div className="text-[10px] sm:text-sm opacity-90 leading-tight">Ongoing Projects</div>
                </div>
              </div>
            </div>

            {/* Upcoming Projects */}
            <div className="bg-green-500 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-2xl sm:text-5xl font-bold">{transformedData.upcomingProjects}</div>
                <div className="text-sm sm:text-xl font-medium">Upcoming Projects</div>
              </div>
            </div>

            {/* Experience and Cities */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {/* Years of Experience */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm text-center">
                <div className="text-2xl sm:text-5xl font-bold text-purple-500 mb-0.5 sm:mb-2">{transformedData.experience}</div>
                <div className="text-[10px] sm:text-sm text-gray-500 leading-tight">Years of Experience</div>
              </div>

              {/* Cities Presence */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm text-center">
                <div className="text-2xl sm:text-5xl font-bold text-blue-500 mb-0.5 sm:mb-2">{transformedData.cities}</div>
                <div className="text-[10px] sm:text-sm text-gray-500 leading-tight">Cities Presence</div>
              </div>
            </div>

            {/* Mission */}
            {transformedData.mission && (
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-3 text-center">Our Mission</h3>
                <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
                  {transformedData.mission}
                </p>
              </div>
            )}

            {/* Vision */}
            {transformedData.vision && (
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-3 text-center">Our Vision</h3>
                <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
                  {transformedData.vision}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Gallery */}
          {transformedData.galleryImages.length > 0 && (
            <div
              className={`lg:col-span-7 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
                }`}
              style={{ transitionDelay: '250ms' }}
            >
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
                {/* Gallery Images */}
                <div className="relative">
                  <div className="grid grid-cols-4 gap-1 sm:gap-2 p-1 sm:p-2">
                    {/* Main large image */}
                    {transformedData.galleryImages[0] && (
                      <div className="col-span-4 sm:col-span-3 row-span-1 sm:row-span-2">
                        <div className="relative h-full rounded-lg sm:rounded-xl overflow-hidden min-h-[150px] sm:min-h-[250px] cursor-pointer hover:opacity-90 transition-opacity" onClick={() => openImageModal(transformedData.galleryImages[0].url)}>
                          <img
                            src={transformedData.galleryImages[0].url}
                            alt="Gallery image 1"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Small images on right */}
                    {transformedData.galleryImages[1] && (
                      <div className="col-span-2 sm:col-span-1">
                        <div className="rounded-lg sm:rounded-xl h-full overflow-hidden cursor-pointer hover:opacity-90 transition-opacity min-h-[75px] sm:min-h-[90px]" onClick={() => openImageModal(transformedData.galleryImages[1].url)}>
                          <img
                            src={transformedData.galleryImages[1].url}
                            alt="Gallery image 2"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {transformedData.galleryImages[2] && (
                      <div className="col-span-2 sm:col-span-1 relative">
                        <div className="rounded-lg sm:rounded-xl h-full overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity min-h-[75px] sm:min-h-[90px]" onClick={() => openImageModal(transformedData.galleryImages[2].url)}>
                          <img
                            src={transformedData.galleryImages[2].url}
                            alt="Gallery image 3"
                            className="w-full h-full object-cover"
                          />
                          {transformedData.galleryImages.length > 3 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none">
                              <span className="text-base sm:text-3xl font-bold text-white">+{transformedData.galleryImages.length - 3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Details */}
                <div className="p-3 sm:p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 sm:mb-6">Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 sm:gap-4">
                    {transformedData.galleryImages.map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer hover:opacity-90 transition-opacity" onClick={() => openImageModal(image.url)}>
                        <img
                          src={image.url}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* About the Builder Section */}
        <div
          className={`mt-4 sm:mt-8 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
            }`}
          style={{ transitionDelay: '400ms' }}
        >
          {/* Purple Header Section */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 rounded-t-xl sm:rounded-t-2xl p-4 sm:p-12">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-8">
              {/* Logo */}
              <div className="w-16 h-16 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity" onClick={() => transformedData.logo && openImageModal(transformedData.logo)}>
                {transformedData.logo ? (
                  <img
                    src={transformedData.logo}
                    alt={transformedData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-8 h-8 sm:w-16 sm:h-16 text-indigo-600" />
                )}
              </div>

              {/* Company Info */}
              <div className="text-white text-center sm:text-left">
                <h2 className="text-xl sm:text-5xl font-bold mb-1.5 sm:mb-3">{transformedData.name}</h2>
                <p className="text-sm sm:text-xl italic mb-3 sm:mb-6 opacity-90">&quot;{transformedData.tagline}&quot;</p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-xs sm:text-base">
                  <div>
                    <span className="font-semibold">Founded:</span> {transformedData.founded}
                  </div>
                  <div>
                    <span className="font-semibold">Headquarters:</span> {transformedData.headquarters}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* White About Section */}
          <div className="bg-white rounded-b-xl sm:rounded-b-2xl p-6 sm:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12">
              {/* Left - About Text */}
              <div className="lg:col-span-8">
                {transformedData.about.length > 0 && (
                  <>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">About the Builder</h3>
                    <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                      {transformedData.about.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </>
                )}

                {/* Awards Section */}
                {transformedData.awards.length > 0 && (
                  <div className="mt-6 sm:mt-8">
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Awards & Recognition</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {transformedData.awards.map((award, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <h5 className="font-semibold text-gray-900 mb-1">{award.title}</h5>
                          <p className="text-sm text-gray-600">{award.organisation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="mt-6 sm:mt-8">
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Contact Information</h4>
                  <div className="space-y-2">
                    {transformedData.email && (
                      <p className="text-sm sm:text-base text-gray-700">
                        <span className="font-semibold">Email:</span> {transformedData.email}
                      </p>
                    )}
                    {transformedData.phone && (
                      <p className="text-sm sm:text-base text-gray-700">
                        <span className="font-semibold">Phone:</span> {transformedData.phone}
                      </p>
                    )}
                    {transformedData.address && (
                      <p className="text-sm sm:text-base text-gray-700">
                        <span className="font-semibold">Corporate Office:</span> {transformedData.address}
                      </p>
                    )}
                    {transformedData.website && (
                      <p className="text-sm sm:text-base text-gray-700">
                        <span className="font-semibold">Website:</span>{' '}
                        <a href={`https://${transformedData.website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          {transformedData.website}
                        </a>
                      </p>
                    )}
                    {transformedData.category && (
                      <p className="text-sm sm:text-base text-gray-700">
                        <span className="font-semibold">Category:</span>{' '}
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium uppercase">
                          {transformedData.category}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Social Media */}
                {(transformedData.socialMedia.facebook || transformedData.socialMedia.linkedin ||
                  transformedData.socialMedia.instagram || transformedData.socialMedia.youtube) && (
                    <div className="mt-6 sm:mt-8">
                      <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Connect With Us</h4>
                      <div className="flex gap-3 flex-wrap">
                        {transformedData.socialMedia.facebook && (
                          <a
                            href={`https://facebook.com/${transformedData.socialMedia.facebook}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Facebook
                          </a>
                        )}
                        {transformedData.socialMedia.linkedin && (
                          <a
                            href={`https://linkedin.com/company/${transformedData.socialMedia.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
                          >
                            LinkedIn
                          </a>
                        )}
                        {transformedData.socialMedia.instagram && (
                          <a
                            href={`https://instagram.com/${transformedData.socialMedia.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
                          >
                            Instagram
                          </a>
                        )}
                        {transformedData.socialMedia.youtube && (
                          <a
                            href={`https://youtube.com/${transformedData.socialMedia.youtube}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            YouTube
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                {/* Client Testimonial */}
                {transformedData.testimonial && (
                  <div className="mt-6 sm:mt-8">
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Client Testimonial</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-600">
                      <p className="text-sm sm:text-base text-gray-700 italic">&quot;{transformedData.testimonial}&quot;</p>
                    </div>
                  </div>
                )}

                {/* Promotional Video */}
                {transformedData.videoUrl && (
                  <div className="mt-6 sm:mt-8">
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Promotional Video</h4>
                    <a
                      href={transformedData.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Watch Video
                    </a>
                  </div>
                )}
              </div>

              {/* Right - Profile Card */}
              {(transformedData.ceoName || transformedData.ceoTitle || transformedData.ceoQuote || (transformedData.keyPeople.length > 0 && transformedData.keyPeople[0].photo?.url)) && (
                <div className="lg:col-span-4">
                  <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                    {transformedData.keyPeople.length > 0 && transformedData.keyPeople[0].photo?.url && (
                      <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openImageModal(transformedData.keyPeople[0].photo.url)}>
                        <img
                          src={transformedData.keyPeople[0].photo.url}
                          alt={transformedData.ceoName || 'Director'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {transformedData.ceoName && (
                      <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">{transformedData.ceoName}</h4>
                    )}
                    {transformedData.ceoTitle && (
                      <p className="text-xs sm:text-sm text-indigo-600 font-medium mb-4 sm:mb-6">{transformedData.ceoTitle}</p>
                    )}
                    {transformedData.ceoQuote && (
                      <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">
                        &quot;{transformedData.ceoQuote}&quot;
                      </p>
                    )}
                  </div>

                  {/* Key People Section */}
                  {transformedData.keyPeople.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">Key People</h4>
                      <div className="space-y-3">
                        {transformedData.keyPeople.map((person, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                            <h5 className="font-semibold text-gray-900">{person.name}</h5>
                            <p className="text-sm text-indigo-600 mb-1">{person.designation}</p>
                            {person.shortBio && (
                              <p className="text-xs text-gray-600">{person.shortBio}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
