"use client";

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChevronRight, ChevronDown, ChevronLeft, ArrowUpRight, ShieldCheck, Star, Building2, Calendar, CalendarDays, ChartArea, Users, Briefcase, Phone, Mail, MessageCircle, MessageSquare, X, CircleCheck, Facebook, Twitter, Linkedin, Instagram, Download, CirclePlay, Camera } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getBuilderById } from '@/data/builders';

export default function BuilderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const builderId = params?.id;
  const [builder, setBuilder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeSegment, setActiveSegment] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [testimonialDirection, setTestimonialDirection] = useState('next');
  const [activeTeamMember, setActiveTeamMember] = useState(0);
  const [teamDirection, setTeamDirection] = useState('next');
  const [scrolled, setScrolled] = useState(false);
  const [touchModalOpen, setTouchModalOpen] = useState(false);

  useEffect(() => {
    fetchBuilderData();
  }, [builderId]);

  useEffect(() => {
    const onScroll = () => setScrolled(typeof window !== 'undefined' && window.scrollY > 400);
    if (typeof window !== 'undefined') {
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }
  }, []);

  const fetchBuilderData = async () => {
    if (!builderId) {
      setError('No builder ID provided');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/builders/${builderId}`);
      const data = await response.json();

      if (data.success) {
        const apiBuilder = data.builder || data.data;
        setBuilder(transformApiToLocal(apiBuilder));
      } else {
        const local = getBuilderById(builderId);
        if (local) setBuilder(local);
        else setError(data.message || 'Builder not found');
      }
    } catch (err) {
      const local = getBuilderById(builderId);
      if (local) setBuilder(local);
      else setError('Error fetching builder data');
    } finally {
      setLoading(false);
    }
  };

  function transformApiToLocal(api) {
    if (!api) return null;
    return {
      id: api._id,
      name: api.builderName || api.name,
      tagline: api.tagline || '',
      founded: api.foundedYear || api.founded,
      headquarters: api.headquarters || '',
      stats: {
        projects: api.projectsCompleted?.toString() || '0',
        cities: api.citiesPresence || api.cities || '0',
        sqft: '1.8+',
        clients: '1000+',
        experience: api.yearsOfExperience ? `${api.yearsOfExperience}+` : 'N/A',
      },
      logo: api.builderLogo?.url || api.logo,
      description: api.description || '',
      mission: api.missionStatement || api.mission,
      vision: api.visionStatement || api.vision,
      phone: api.phoneNumber || api.phone,
      email: api.contactEmail || api.email,
      licenseNumber: 'RERA-KAR-2021-0012345',
      certificate: 'ISO 9001:2015 Certified',
      category: api.builderCategory || 'Premium Developer',
      totalCenters: '250+',
      specialties: ['Residential', 'Commercial', 'Hospitality', 'Retail'],
      operatingRegions: ['Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Pune'],
      moreDetails: [
        { label: 'Largest Campus', value: 'HSR Layout, 8000+ seats' },
        { label: 'Minimum Lock-in', value: '12 months' },
        { label: 'Expansion/Contraction Flexibility', value: 'Yes' },
      ],
      awards: api.awards?.map(a => ({ ...a, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200' })) || [],
      shortDescription: api.description?.slice(0, 150) + '...',
      detailedDescription: api.description || '',
      keyDifferentiators: ['Quality focus', 'Customer-centric', 'Innovative designs'],
      projects: [],
      ongoingCount: api.ongoingProjects || 9,
      upcomingCount: api.upcomingProjects || 9,
      relationshipManager: { name: 'Ananya Rao', title: 'Senior Manager', tag: 'Buildersinfo Expert', avatar: 'https://i.pravatar.cc/150?img=5', assisted: '500+ corporates', companyLogos: [] },
      testimonials: [],
      faqs: [],
      galleryImages: api.galleryImages?.map(g => ({ url: g.url || g, alt: 'Gallery' })) || [],
      featuredProject: null,
      keyProjects: [],
      team: api.keyPeople || [],
      operationalSegments: [{ name: 'Residential', cities: ['Bangalore', 'Mumbai', 'Chennai'] }],
      socialLinks: api.socialMedia || {},
    };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading builder information...</p>
        </div>
      </div>
    );
  }

  if (error || !builder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Builder not found'}</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const stats = builder.stats || {};
  const rm = builder.relationshipManager || {};
  const location = builder.headquarters || builder.operatingRegions?.[0] || 'Bangalore';
  const expNum = (stats.experience || '').replace(/\D/g, '');
  const experienceDisplay = expNum ? `${expNum} Yrs` : (stats.experience && stats.experience !== 'N/A' ? stats.experience : '33 Yrs');

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Sticky header on scroll - desktop only */}
      {scrolled && (
        <div className="hidden md:block fixed top-20 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-[425px]:px-3 h-16 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-white">
                {builder.logo ? (
                  <Image src={builder.logo} alt={`${builder.name} logo`} fill className="object-contain p-0.5" sizes="40px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold truncate">{builder.name}</h1>
                <p className="text-xs text-gray-500 truncate">{location}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="font-bold text-lg">{stats.projects || '220+'}</p>
                <p className="text-xs text-gray-500">Projects</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{experienceDisplay}</p>
                <p className="text-xs text-gray-500">Experience</p>
              </div>
              <button
                type="button"
                onClick={() => document.getElementById('contact-info')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 transition-colors"
              >
                Contact Builder
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-[425px]:px-3 py-10 pt-10 md:pt-7 pb-40 md:pb-10 max-[425px]:pb-36 max-[425px]:py-6">
        {/* Back + Breadcrumb */}
        <div className="flex items-center gap-2 -mt-2 mb-6 max-[425px]:mb-4">
          <button onClick={() => router.back()} className="md:hidden p-2 -ml-2 hover:bg-gray-200 rounded-lg max-[425px]:p-1.5">
            <ArrowLeft className="w-5 h-5 max-[425px]:w-4 max-[425px]:h-4 text-gray-600" />
          </button>
          <div className="hidden md:flex items-center text-sm max-[425px]:text-xs text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/builders" className="hover:text-blue-600">Builders</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="font-medium text-gray-900">{builder.name}</span>
          </div>
        </div>

        {/* Header - breadcrumbs + title + clients */}
        <div className="flex md:hidden mt-3 max-[425px]:mt-2">
          <h1 className="text-lg font-bold text-gray-900 max-[425px]:text-base truncate">{builder.name}</h1>
        </div>
        <div className="hidden md:flex justify-between items-start mt-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{builder.name}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Explore projects, and more from {builder.name}.</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">{stats.clients || '1000+'}</p>
            <p className="text-xs text-gray-500">Clients</p>
          </div>
        </div>

        {/* Top section: left (profile+stats + colored + About the Builder) | right (gallery). Same height. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mt-4 max-[425px]:mt-3 max-[425px]:gap-3">
          {/* Left half: same total height as right card; About the Builder row grows to fill */}
          <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 max-[425px]:gap-3 h-full min-h-0 grid-rows-[auto_1fr]">
            {/* Left part - Profile + White stats */}
            <div className="space-y-3 max-[425px]:space-y-2">
              {/* Profile Card - taller, larger logo */}
              <div className="rounded-lg border bg-white shadow-sm p-5 md:p-6 max-[425px]:p-4 min-h-[200px] max-[425px]:min-h-[160px] flex flex-col items-center text-center justify-center">
                <div className="w-24 h-24 max-[425px]:w-20 max-[425px]:h-20 md:w-36 md:h-36 relative mb-3 max-[425px]:mb-2 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  {builder.isBrigade ? (
                    <div className="flex flex-col items-center justify-center w-full h-full p-2">
                      <div className="relative flex flex-col gap-1 items-start">
                        <div className="w-5 h-1 bg-blue-600 rounded" />
                        <div className="w-4 h-1 bg-blue-600 rounded ml-0.5" />
                        <div className="w-3 h-1 bg-blue-600 rounded ml-1" />
                        <div className="w-2.5 h-1 bg-blue-600 rounded ml-1" />
                        <div className="absolute -top-0.5 right-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-900 uppercase mt-1.5">BRIGADE</span>
                    </div>
                  ) : builder.logo ? (
                    <Image src={builder.logo} alt={`${builder.name} logo`} fill className="object-contain" sizes="144px" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <h2 className="text-base font-bold text-gray-900 max-[425px]:text-sm truncate">{builder.name}</h2>
                <p className="text-xs max-[425px]:text-[11px] text-gray-500 mt-1 line-clamp-2">{builder.tagline}</p>
              </div>

              {/* White stat cards - Years, Cities, M Sq.Ft. - full width of profile card */}
              <div className="grid grid-cols-3 gap-2 max-[425px]:gap-1.5 w-full">
                <div className="rounded-lg border bg-white shadow-sm p-3 max-[425px]:p-2 min-h-[72px] max-[425px]:min-h-[56px] flex flex-col justify-center text-center min-w-0">
                  <p className="text-base max-[425px]:text-sm font-bold text-gray-900">{stats.experience || '33+'}</p>
                  <p className="text-[11px] max-[425px]:text-[9px] text-gray-500 mt-0.5">Years of Exp.</p>
                </div>
                <div className="rounded-lg border bg-white shadow-sm p-3 max-[425px]:p-2 min-h-[72px] max-[425px]:min-h-[56px] flex flex-col justify-center text-center min-w-0">
                  <p className="text-base max-[425px]:text-sm font-bold text-gray-900">{stats.cities || '12'}</p>
                  <p className="text-[11px] max-[425px]:text-[9px] text-gray-500 mt-0.5">Cities</p>
                </div>
                <div className="rounded-lg border bg-white shadow-sm p-3 max-[425px]:p-2 min-h-[72px] max-[425px]:min-h-[56px] flex flex-col justify-center text-center min-w-0">
                  <p className="text-base max-[425px]:text-sm font-bold text-gray-900">{stats.sqft || '1.8+'}</p>
                  <p className="text-[11px] max-[425px]:text-[9px] text-gray-500 mt-0.5">M Sq.Ft.</p>
                </div>
              </div>
            </div>

            {/* Middle part - Colored cards + Mission + Vision (equal height to left column) */}
            <div className="space-y-3 max-[425px]:space-y-2 flex flex-col h-full min-h-0">
              {/* Colored stat cards - grows to fill so middle matches left column height */}
              <div className="grid grid-cols-2 gap-2 max-[425px]:gap-1.5 flex-1 min-h-0 grid-rows-[1fr_auto]">
                <div className="bg-blue-600 text-white p-3 max-[425px]:p-2 rounded-xl relative flex flex-col justify-center text-center min-h-[100px] max-[425px]:min-h-[72px]">
                  <button className="absolute top-1.5 right-1.5 w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                  <p className="text-lg max-[425px]:text-base font-bold">{stats.projects || '220+'}</p>
                  <p className="text-[10px] max-[425px]:text-[9px]">Projects</p>
                </div>
                <div className="bg-amber-500 text-white p-3 max-[425px]:p-2 rounded-xl relative flex flex-col justify-center text-center min-h-[100px] max-[425px]:min-h-[72px]">
                  <button className="absolute top-1.5 right-1.5 w-5 h-5 max-[425px]:w-4 max-[425px]:h-4 bg-black/10 rounded flex items-center justify-center">
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                  <p className="text-lg max-[425px]:text-base font-bold">{builder.ongoingCount ?? 9}</p>
                  <p className="text-[10px] max-[425px]:text-[9px]">Ongoing</p>
                </div>
                <div className="bg-green-600 text-white p-3 max-[425px]:p-2 rounded-xl relative flex flex-col justify-center text-center col-span-2 min-h-[60px] max-[425px]:min-h-[48px]">
                  <button className="absolute top-1.5 right-1.5 w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                  <p className="text-lg max-[425px]:text-base font-bold">{builder.upcomingCount ?? 9}</p>
                  <p className="text-[10px] max-[425px]:text-[9px]">Upcoming</p>
                </div>
              </div>

              {/* Mission & Vision - compact */}
              <div className="rounded-lg border bg-white shadow-sm p-2.5 max-[425px]:p-2">
                <h3 className="font-semibold text-[10px] max-[425px]:text-[9px] mb-0.5">Our Mission</h3>
                <p className="text-[9px] max-[425px]:text-[8px] text-gray-500 leading-tight line-clamp-3">{builder.mission}</p>
              </div>
              <div className="rounded-lg border bg-white shadow-sm p-2.5 max-[425px]:p-2">
                <h3 className="font-semibold text-[10px] max-[425px]:text-[9px] mb-0.5">Our Vision</h3>
                <p className="text-[9px] max-[425px]:text-[8px] text-gray-500 leading-tight line-clamp-3">{builder.vision}</p>
              </div>
            </div>

            {/* About the Builder - bottom card, full width; grows so left section = right card height */}
            <div className="md:col-span-2 rounded-lg border bg-white shadow-sm flex flex-col min-h-0 mt-2 md:mt-0">
              <div className="p-5 pt-5 pb-2 max-[425px]:p-3 max-[425px]:pt-3 max-[425px]:pb-1">
                <h3 className="text-sm max-[425px]:text-xs font-bold">About the Builder</h3>
              </div>
              <div className="h-px w-full bg-gray-200" />
              <div className="p-5 pt-4 pb-5 max-[425px]:p-3 max-[425px]:pt-3 max-[425px]:pb-4 text-gray-600 space-y-3 text-xs max-[425px]:text-[11px] flex-1 min-h-0">
                <p><strong className="text-gray-900">Short Description:</strong> {builder.shortDescription}</p>
                <p><strong className="text-gray-900">Detailed Description:</strong> {builder.detailedDescription}</p>
                {builder.keyDifferentiators?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-xs">Key Differentiators / USPs</h4>
                    <ul className="list-disc pl-4 space-y-0.5 text-xs">
                      {builder.keyDifferentiators.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right half - Gallery + Featured Project (Brigade Horizon) in one card - same row height as left */}
          <div className="lg:col-span-6 h-full min-h-0 flex flex-col min-w-0">
            {(builder.galleryImages?.length > 0 || builder.featuredProject) && (
            <div className="rounded-lg border bg-white shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
              {/* Gallery */}
              {builder.galleryImages?.length > 0 && (
                <div className="p-3 max-[425px]:p-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-1.5 max-[425px]:gap-1 md:h-[220px]">
                    <div className="relative md:col-span-2 md:row-span-2 rounded-lg overflow-hidden aspect-[4/3] md:aspect-auto min-h-[120px] max-[425px]:min-h-[100px] md:min-h-0">
                      <Image src={builder.galleryImages[0]?.url || builder.galleryImages[0]} alt="Featured" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                    </div>
                    {builder.galleryImages[1] && (
                      <div className="relative md:col-span-1 md:row-span-1 rounded-lg overflow-hidden aspect-[4/3] md:aspect-auto min-h-[60px] md:min-h-0">
                        <Image src={builder.galleryImages[1]?.url || builder.galleryImages[1]} alt="Gallery" fill className="object-cover" sizes="16vw" />
                        <div className="absolute top-1 right-1">
                          <button className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded bg-black/50 text-white hover:bg-black/70">
                            <Download className="w-2.5 h-2.5" />
                            PDF FILE
                          </button>
                        </div>
                      </div>
                    )}
                    {builder.galleryImages[2] && (
                      <div className="relative md:col-span-1 md:row-span-1 rounded-lg overflow-hidden aspect-[4/3] md:aspect-auto min-h-[60px] md:min-h-0 group cursor-pointer">
                        <Image src={builder.galleryImages[2]?.url || builder.galleryImages[2]} alt="Video" fill className="object-cover" sizes="16vw" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                          <CirclePlay className="w-8 h-8 text-white/80" />
                          <span className="text-white text-[10px] font-medium mt-1 underline">WATCH VIDEO</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 max-[425px]:gap-1 mt-2 overflow-x-auto pb-1 max-[425px]:-mx-2 max-[425px]:px-2">
                    {builder.galleryImages.slice(0, 5).map((img, i) => (
                      <div key={i} className="relative w-20 h-14 max-[425px]:w-16 max-[425px]:h-12 rounded overflow-hidden shrink-0 cursor-pointer">
                        <Image src={img?.url || img} alt={img?.alt || 'Gallery'} fill className="object-cover" sizes="80px" />
                      </div>
                    ))}
                    <div className="relative w-20 h-14 max-[425px]:w-16 max-[425px]:h-12 rounded overflow-hidden shrink-0 cursor-pointer flex items-center justify-center bg-black/60">
                      <div className="flex flex-col items-center justify-center text-white text-center p-0.5">
                        <Camera className="w-4 h-4 max-[425px]:w-3.5 max-[425px]:h-3.5 mb-0.5" />
                        <p className="text-[9px] max-[425px]:text-[8px] font-semibold leading-tight">Show all {builder.galleryImages?.length || 6} photos</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Featured Project (e.g. Brigade Horizon) - merged into same card */}
              {builder.featuredProject && (
                <>
                  {builder.galleryImages?.length > 0 && <div className="h-px w-full bg-gray-200 mx-3 max-[425px]:mx-2" />}
                  <div className="p-4 max-[425px]:p-3">
                    <h2 className="text-sm max-[425px]:text-xs font-bold truncate">{builder.featuredProject.name}</h2>
                    <p className="text-xs max-[425px]:text-[11px] text-gray-500 truncate">{builder.featuredProject.location}</p>
                    <div className="grid grid-cols-2 max-[425px]:grid-cols-2 md:grid-cols-4 gap-4 max-[425px]:gap-2 mt-4 max-[425px]:mt-3 text-sm max-[425px]:text-xs">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-gray-500 text-xs">Project Units</p>
                          <p className="font-semibold">{builder.featuredProject.units}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChartArea className="h-5 w-5 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-gray-500 text-xs">Project Size</p>
                          <p className="font-semibold">{builder.featuredProject.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-gray-500 text-xs">Launch Date</p>
                          <p className="font-semibold">{builder.featuredProject.launchDate}</p>
                        </div>
                      </div>
                    </div>
                    {builder.featuredProject.configurations?.length > 0 && (
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                        {builder.featuredProject.configurations.map((c, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-lg border text-xs font-semibold">{c}</span>
                        ))}
                      </div>
                    )}
                    {/* Deal Bar card - between configurations and Total Range */}
                    <div className="rounded-lg border shadow-sm mt-4 max-[425px]:mt-3 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800/50">
                      <div className="p-3 max-[425px]:p-2">
                        <div className="flex justify-between items-center text-sm max-[425px]:text-xs mb-2 max-[425px]:mb-1">
                          <p className="font-semibold text-yellow-800 dark:text-yellow-200">Deal Bar</p>
                          <a className="text-blue-600 font-semibold hover:underline" href="#">›</a>
                        </div>
                        <div className="flex flex-col max-[425px]:flex-col sm:flex-row items-stretch sm:items-center gap-2 max-[425px]:gap-1 sm:gap-4">
                          <p className="text-xs max-[425px]:text-[10px] text-gray-500 whitespace-nowrap">42 Closed Deals</p>
                          <div className="relative w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 h-2 min-w-0" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={24}>
                            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: '24%' }} />
                          </div>
                          <p className="text-xs max-[425px]:text-[10px] text-gray-500 whitespace-nowrap">132 In Progress</p>
                        </div>
                      </div>
                    </div>
                    {/* Possession / Plot / Propscore row */}
                    <div className="grid grid-cols-3 max-[425px]:grid-cols-3 gap-4 max-[425px]:gap-2 mt-4 max-[425px]:mt-3 text-sm max-[425px]:text-xs text-center">
                      <div>
                        <p className="text-gray-500 text-xs max-[425px]:text-[10px]">Possession</p>
                        <p className="font-semibold max-[425px]:text-[11px]">{builder.featuredProject.possession || 'Sep 2028'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs max-[425px]:text-[10px]">Plot</p>
                        <p className="font-semibold max-[425px]:text-[11px] truncate">{builder.featuredProject.plotSize || '1,200 - 3,000 sqft'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs max-[425px]:text-[10px]">Propscore</p>
                        <div className="flex items-center justify-center gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className={`h-4 w-4 max-[425px]:h-3 max-[425px]:w-3 ${i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 max-[425px]:mt-3 flex flex-col max-[425px]:flex-col sm:flex-row justify-between items-stretch max-[425px]:items-stretch sm:items-center gap-3">
                      <div>
                        <p className="text-[10px] max-[425px]:text-[9px] text-gray-500">Total Range</p>
                        <p className="text-base max-[425px]:text-sm font-bold text-blue-600">{builder.featuredProject.priceRange}</p>
                      </div>
                      <button className="bg-blue-600 text-white text-xs max-[425px]:text-[11px] font-medium px-5 py-1.5 max-[425px]:py-2 rounded-lg hover:bg-blue-700 shrink-0">
                        Contact Builder
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            )}
          </div>
        </div>

        {/* Lower section - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mt-6 max-[425px]:mt-4 max-[425px]:gap-3">
          {/* Left - About, Company, Contact, etc. */}
          <div className="lg:col-span-6 space-y-4 max-[425px]:space-y-3">
            {/* Company Information */}
            <div className="rounded-lg border bg-white shadow-sm min-w-0">
              <div className="p-4 max-[425px]:p-3">
                <h3 className="text-sm max-[425px]:text-xs font-bold">Company Information</h3>
              </div>
              <div className="h-px w-full bg-gray-200" />
              <div className="p-4 pt-3 max-[425px]:p-3 space-y-4 max-[425px]:space-y-3 text-xs max-[425px]:text-[11px]">
                <div className="grid grid-cols-2 max-[425px]:grid-cols-1 gap-4 max-[425px]:gap-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">License Number</p>
                      <p className="font-semibold text-xs">{builder.licenseNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">Certificate</p>
                      <p className="font-semibold text-xs">{builder.certificate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">Category</p>
                      <p className="font-semibold text-xs">{builder.category}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">Founded</p>
                      <p className="font-semibold text-xs">{builder.founded}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">Total Clients</p>
                      <p className="font-semibold text-xs">{stats.clients || '1000+'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">Total Centers</p>
                      <p className="font-semibold text-xs">{builder.totalCenters || '250+'}</p>
                    </div>
                  </div>
                </div>
                {builder.specialties?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {builder.specialties.map((s, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-lg bg-gray-100 text-xs font-semibold">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {builder.operatingRegions?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Operating Regions</h4>
                    <div className="flex flex-wrap gap-2">
                      {builder.operatingRegions.map((r, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-lg border text-xs font-semibold">{r}</span>
                      ))}
                    </div>
                  </div>
                )}
                {builder.moreDetails?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">More Details</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                      {builder.moreDetails.map((d, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{d.label}:</span>
                          <span className="font-medium text-gray-900">{d.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div id="contact-info" className="rounded-lg border bg-white shadow-sm scroll-mt-24 min-w-0">
              <div className="p-6 max-[425px]:p-4">
                <h3 className="text-lg max-[425px]:text-base font-bold">Contact Information</h3>
              </div>
              <div className="h-px w-full bg-gray-200" />
              <div className="p-6 pt-6 max-[425px]:p-4 max-[425px]:pt-4 space-y-4 max-[425px]:space-y-3">
                {builder.phone && (
                  <a href={`tel:${builder.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-gray-500 hover:text-blue-600">
                    <Phone className="w-5 h-5" />
                    <span>{builder.phone}</span>
                  </a>
                )}
                {builder.email && (
                  <a href={`mailto:${builder.email}`} className="flex items-center gap-3 text-gray-500 hover:text-blue-600">
                    <Mail className="w-5 h-5" />
                    <span>{builder.email}</span>
                  </a>
                )}
                <div className="flex items-center gap-2 pt-2">
                  {builder.socialLinks?.facebook && <a href={builder.socialLinks.facebook} className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100"><Facebook className="w-5 h-5" /></a>}
                  {builder.socialLinks?.twitter && <a href={builder.socialLinks.twitter} className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100"><Twitter className="w-5 h-5" /></a>}
                  {builder.socialLinks?.linkedin && <a href={builder.socialLinks.linkedin} className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100"><Linkedin className="w-5 h-5" /></a>}
                  {builder.socialLinks?.instagram && <a href={builder.socialLinks.instagram} className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100"><Instagram className="w-5 h-5" /></a>}
                  {!builder.socialLinks?.facebook && !builder.socialLinks?.linkedin && (
                    <>
                      <a href="#" className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100"><Facebook className="w-5 h-5" /></a>
                      <a href="#" className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100"><Linkedin className="w-5 h-5" /></a>
                      <a href="#" className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100"><Instagram className="w-5 h-5" /></a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Awards */}
            {builder.awards?.length > 0 && (
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-bold">Awards & Recognition</h3>
                </div>
                <div className="h-px w-full bg-gray-200" />
                <div className="p-6 pt-6">
                  <ul className="space-y-4">
                    {builder.awards.map((a, i) => (
                      <li key={i} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-gray-100">
                          {a.image && <Image src={a.image} alt={a.title} width={64} height={64} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-semibold">{a.title}</p>
                          <p className="text-sm text-gray-500">{a.organisation}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Testimonials - Slider */}
            {builder.testimonials?.length > 0 && (
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-bold">Client Testimonials</h3>
                </div>
                <div className="h-px w-full bg-gray-200" />
                <div className="p-6 pt-6">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveTestimonial((prev) => (prev <= 0 ? builder.testimonials.length - 1 : prev - 1))}
                      className="w-10 h-10 shrink-0 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                      aria-label="Previous testimonial"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 flex flex-col items-center text-center gap-4 min-w-0 px-2">
                      {(() => {
                        const idx = Math.min(activeTestimonial, builder.testimonials.length - 1);
                        const t = builder.testimonials[idx];
                        if (!t) return null;
                        return (
                          <>
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 shrink-0">
                              {t.avatar && <Image src={t.avatar} alt={t.author} width={80} height={80} className="w-full h-full object-cover" />}
                            </div>
                            <p className="italic text-gray-500 text-sm md:text-base">{t.quote}</p>
                            <p className="font-semibold">{t.author}</p>
                          </>
                        );
                      })()}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTestimonial((prev) => (prev >= builder.testimonials.length - 1 ? 0 : prev + 1))}
                      className="w-10 h-10 shrink-0 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                      aria-label="Next testimonial"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Relationship Manager */}
            {rm.name && (
              <div className="rounded-lg border bg-white shadow-sm min-w-0">
                <div className="p-6 max-[425px]:p-4">
                  <h3 className="text-lg max-[425px]:text-base font-bold">Your Relationship Manager</h3>
                </div>
                <div className="h-px w-full bg-gray-200" />
                <div className="p-6 space-y-4 pt-6 max-[425px]:p-4 max-[425px]:pt-4 max-[425px]:space-y-3">
                  <div className="flex flex-col max-[425px]:flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-[425px]:gap-3">
                    <div className="flex items-center gap-4 max-[425px]:gap-3 min-w-0">
                      <div className="w-24 h-24 max-[425px]:w-16 max-[425px]:h-16 overflow-hidden rounded-lg bg-gray-200 shrink-0">
                        {rm.avatar && <Image src={rm.avatar} alt={rm.name} width={96} height={96} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <h3 className="font-semibold">{rm.name}</h3>
                        <p className="text-sm text-gray-500">{rm.title}</p>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg border text-xs font-medium">{rm.tag}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="w-9 h-9 rounded-full bg-green-100 border border-green-200 text-green-600 flex items-center justify-center hover:bg-green-200" aria-label="Call">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button type="button" className="w-9 h-9 rounded-full bg-green-100 border border-green-200 text-green-600 flex items-center justify-center hover:bg-green-200" aria-label="Email">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button type="button" className="w-9 h-9 rounded-full bg-green-100 border border-green-200 text-green-600 flex items-center justify-center hover:bg-green-200" aria-label="WhatsApp">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button type="button" className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700">
                    Contact {rm.name}
                  </button>
                  <div className="bg-gray-50 p-4 rounded-lg -m-2">
                    {rm.assisted && <p className="text-sm text-center text-gray-500 mb-4">{rm.assisted}</p>}
                    <div className="flex justify-around items-center flex-wrap gap-4">
                      {(() => {
                        const placeholders = [
                          'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=96',
                          'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=96',
                          'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=96',
                          'https://images.unsplash.com/photo-1529612700005-e35377bf1415?w=96',
                          'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=96',
                        ];
                        const fromData = (rm.companyLogos || []).slice(0, 5).map(l => typeof l === 'string' ? l : l?.url || '');
                        const logos = fromData.length >= 5 ? fromData : [...fromData, ...placeholders.slice(0, 5 - fromData.length)];
                        return logos.slice(0, 5).map((logo, i) => (
                          <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
                            <Image src={logo || placeholders[i]} alt="Company" fill className="object-cover" sizes="48px" />
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ */}
            {builder.faqs?.length > 0 && (
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-4">
                  <h3 className="text-sm font-bold">Frequently Asked Questions</h3>
                </div>
                <div className="h-px w-full bg-gray-200" />
                <div className="p-4 pt-3">
                  {builder.faqs.map((faq, i) => (
                    <div key={i} className="border-b last:border-b-0">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="flex items-center justify-between py-3 text-xs font-medium text-left w-full hover:underline"
                      >
                        {faq.q}
                        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === i && <div className="pb-3 text-[11px] text-gray-500">{faq.a}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Key Projects, Team, Operational (Featured Project merged into gallery card above) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Key Projects */}
            {builder.keyProjects?.length > 0 && (
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-4">
                  <h3 className="text-sm font-bold">Key Projects</h3>
                </div>
                <div className="h-px w-full bg-gray-200" />
                <div className="p-4 pt-3">
                  <ul className="space-y-2">
                    {builder.keyProjects.map((p, i) => (
                      <li key={i}>
                        <Link href={p.href || '#'} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50">
                          <div className="w-12 h-12 rounded overflow-hidden shrink-0 bg-gray-200">
                            {p.image && <Image src={p.image} alt={p.name} width={48} height={48} className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-semibold text-xs">{p.name}</p>
                            <p className="text-[10px] text-gray-500">{p.location}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Projects from builder.projects */}
            {builder.projects?.length > 0 && !builder.keyProjects?.length && (
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-bold">Key Projects</h3>
                </div>
                <div className="h-px w-full bg-gray-200" />
                <div className="p-6 pt-6">
                  <ul className="space-y-4">
                    {builder.projects.slice(0, 5).map((p, i) => (
                      <li key={i}>
                        <Link href="#" className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50">
                          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-200 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-xs">{p.name}</p>
                            <p className="text-[10px] text-gray-500">{p.location}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Meet the Team - Slider */}
            {builder.team?.length > 0 && (
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-bold">Meet the Team</h3>
                </div>
                <div className="h-px w-full bg-gray-200" />
                <div className="p-6 pt-6">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setTeamDirection('prev');
                        setActiveTeamMember((prev) => (prev <= 0 ? builder.team.length - 1 : prev - 1));
                      }}
                      className="w-10 h-10 shrink-0 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                      aria-label="Previous team member"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 flex flex-col md:flex-row items-center gap-6 text-center md:text-left min-w-0 overflow-hidden">
                      {(() => {
                        const idx = Math.min(activeTeamMember, builder.team.length - 1);
                        const member = builder.team[idx];
                        if (!member) return null;
                        return (
                          <div
                            key={activeTeamMember}
                            className={`flex flex-col md:flex-row items-center gap-6 w-full ${teamDirection === 'prev' ? 'animate-testimonial-from-left' : 'animate-testimonial-from-right'}`}
                          >
                            <div className="w-32 h-32 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                              {member.image && <Image src={member.image} alt={member.name} width={128} height={128} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold">{member.name}</h3>
                              <p className="text-blue-600 font-semibold">{member.role}</p>
                              {member.quote && <p className="text-gray-500 italic mt-2">"{member.quote}"</p>}
                              {member.bio && <p className="text-gray-500 mt-2 text-sm">{member.bio}</p>}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTeamDirection('next');
                        setActiveTeamMember((prev) => (prev >= builder.team.length - 1 ? 0 : prev + 1));
                      }}
                      className="w-10 h-10 shrink-0 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                      aria-label="Next team member"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Operational Segments */}
            {builder.operationalSegments?.length > 0 && (
              <div className="rounded-lg border bg-white shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-bold">Operational Segments</h3>
                </div>
                <div className="h-px w-full bg-gray-200" />
                <div className="p-6 pt-6">
                  <div className="grid grid-cols-2 max-[425px]:grid-cols-2 sm:grid-cols-4 border-b overflow-x-auto">
                    {builder.operationalSegments.map((seg, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSegment(i)}
                        className={`px-3 py-1.5 max-[425px]:px-2 max-[425px]:py-1 text-sm max-[425px]:text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeSegment === i ? 'border-blue-600 text-gray-900' : 'border-transparent text-gray-500'}`}
                      >
                        {seg.name}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 max-[425px]:mt-3">
                    {(() => {
                      const cities = builder.operationalSegments[activeSegment]?.cities || [];
                      const segmentName = (builder.operationalSegments[activeSegment]?.name || 'segment').toLowerCase();
                      if (!cities.length) {
                        return (
                          <p className="text-sm max-[425px]:text-xs text-gray-500 py-4 max-[425px]:py-3">
                            No {segmentName} segments to display.
                          </p>
                        );
                      }
                      return (
                        <div className="grid grid-cols-3 max-[425px]:grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-4 gap-y-6 max-[425px]:gap-2 max-[425px]:gap-y-4">
                          {cities.slice(0, 8).map((city, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 text-center">
                              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                                <Image
                                  src={`https://picsum.photos/seed/${city}/100/100`}
                                  alt={city}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <p className="text-xs font-medium">{city}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed bottom-right: modal (above) + Get in Touch button */}
      <div className="fixed bottom-6 right-4 max-[425px]:bottom-5 max-[425px]:right-3 z-50 flex flex-col items-end gap-2">
        {/* Get in Touch modal - small, anchored above the button */}
        {touchModalOpen && (
          <div className="relative w-64 max-[425px]:w-[calc(100vw-24px)] max-[425px]:max-w-[280px] rounded-lg border bg-white shadow-lg z-[60] mb-2 mr-0" role="dialog" aria-modal="true">
            <div className="rounded-lg border bg-white shadow-sm">
              <div className="flex flex-col space-y-1 p-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold leading-none tracking-tight">Get in Touch</h3>
                  <button type="button" onClick={() => setTouchModalOpen(false)} className="p-0.5 rounded hover:bg-gray-100 text-gray-500 cursor-pointer" aria-label="Close">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <CircleCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span>Our team will respond within 1 hr</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CircleCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span>Loan Quotes within 1 day</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 bg-gray-200 h-px w-full" />
              <div className="p-3 pt-2">
                <form className="space-y-2.5" onSubmit={(e) => { e.preventDefault(); setTouchModalOpen(false); }}>
                  <input type="text" placeholder="Name" className="flex h-8 w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
                  <input type="email" placeholder="Email ID" className="flex h-8 w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
                  <div className="flex">
                    <span className="inline-flex items-center px-2 text-xs text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">+91</span>
                    <input type="tel" placeholder="Phone" className="flex h-8 flex-1 min-w-0 rounded-r-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-l-none" />
                  </div>
                  <button type="submit" className="inline-flex items-center justify-center w-full rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 h-8 px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                    Contact Now
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setTouchModalOpen(true)}
          className="inline-flex items-center justify-center rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-300 ease-in-out h-11 w-11 max-[425px]:h-10 max-[425px]:w-10 cursor-pointer"
          aria-haspopup="dialog"
          aria-expanded={touchModalOpen}
        >
          <MessageSquare className="h-5 w-5 max-[425px]:h-4 max-[425px]:w-4 shrink-0 text-white" />
        </button>
      </div>

      {/* Backdrop when modal open - click to close */}
      {touchModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setTouchModalOpen(false)} aria-hidden="true" />
      )}
    </div>
  );
}
