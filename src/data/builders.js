// Shared builders data - used by builders list and detail pages
// Dummy images: unsplash (configured in next.config), local paths, placeholder URLs
const DUMMY_IMAGES = {
  logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
  building: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
  interior1: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
  interior2: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400',
  award1: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=200',
  award2: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200',
  avatar: (seed) => `https://i.pravatar.cc/150?img=${seed || 1}`,
  city: (city) => `https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=100`,
};

function buildExtendedBuilder(base) {
  const projects = base.projects || [];
  const newLaunch = projects.filter(p => p.type === 'newLaunch').length;
  const upcoming = projects.filter(p => p.type === 'upcoming').length;
  const ongoing = projects.filter(p => p.type === 'readyToMove').length;
  return {
    ...base,
    logo: base.logo || DUMMY_IMAGES.logo,
    mission: base.mission || "To create exceptional spaces that enhance people's lives.",
    vision: base.vision || "To be the most trusted and preferred real estate brand.",
    licenseNumber: base.licenseNumber || 'RERA-KAR-2021-0012345',
    certificate: base.certificate || 'ISO 9001:2015 Certified',
    category: base.category || 'Premium Developer',
    totalCenters: base.totalCenters || '250+',
    specialties: base.specialties || ['Residential', 'Commercial', 'Hospitality', 'Retail'],
    operatingRegions: base.operatingRegions || ['Bangalore', 'Chennai', 'Hyderabad', 'Kochi', 'Mangalore', 'Mumbai', 'Mysore', 'Goa', 'Pune', 'Coimbatore', 'Dubai'],
    moreDetails: base.moreDetails || [
      { label: 'Largest Campus', value: 'HSR Layout, 8000+ seats' },
      { label: 'Minimum Lock-in', value: '12 months' },
      { label: 'Expansion/Contraction Flexibility', value: 'Yes' },
    ],
    awards: base.awards || [
      { title: 'Best Developer Award 2023', organisation: 'CREDAI', image: DUMMY_IMAGES.award1 },
      { title: 'Customer Satisfaction Award', organisation: 'Real Estate Summit', image: DUMMY_IMAGES.award2 },
    ],
    phone: base.phone || '+91 83 2886 8333',
    email: base.email || 'info@prestigeconstructions.com',
    socialLinks: base.socialLinks || { facebook: '#', twitter: '#', linkedin: '#', instagram: '#' },
    testimonials: base.testimonials || [
      { quote: 'Working with Brigade Group was a seamless experience. Their professionalism and attention to detail are commendable. The quality of construction is top-notch.', author: 'Aarav Sharma', avatar: DUMMY_IMAGES.avatar(1) },
      { quote: 'From start to finish, the team was supportive and transparent. We are extremely happy with our new home. Highly recommend Brigade for their commitment to excellence.', author: 'Priya Patel', avatar: DUMMY_IMAGES.avatar(2) },
    ],
    relationshipManager: base.relationshipManager || {
      name: 'Ananya Rao',
      title: 'Senior Manager',
      tag: 'Buildersinfo Expert',
      avatar: DUMMY_IMAGES.avatar(5),
      assisted: '500+ corporates in Bangalore to move into their new office.',
      companyLogos: [
        'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100',
        'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100',
        'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=100',
        'https://images.unsplash.com/photo-1529612700005-e35377bf1415?w=100',
        'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=100',
      ],
    },
    faqs: base.faqs || [
      { q: 'How many projects is the builder working on currently?', a: 'The builder has multiple ongoing and upcoming projects across key cities.' },
      { q: 'Who undertakes the builder\'s CSR projects?', a: 'The builder has a dedicated CSR wing for community initiatives.' },
      { q: 'How old is the builder?', a: `Established in ${base.founded || '1986'}, the builder has decades of experience.` },
      { q: 'Which is the best builder in Bengaluru?', a: 'The builder ranks among the top developers in Bangalore for quality and delivery.' },
      { q: 'How are the working conditions?', a: 'The builder maintains high standards for workplace safety and employee satisfaction.' },
    ],
    shortDescription: base.shortDescription || `${base.name} is one of India's leading real estate developers, renowned for creating world-class residential, commercial, retail, and hospitality spaces.`,
    detailedDescription: base.detailedDescription || `Since its foundation in ${base.founded || '1986'}, ${base.name} has consistently delivered iconic projects that blend innovation with quality. With a strong presence across South India, the company has developed over 280 projects covering more than 150 million square feet.`,
    keyDifferentiators: base.keyDifferentiators || [
      'Focus on quality and architectural excellence.',
      'Customer-centric approach with a commitment to transparency.',
      'Innovative designs that are both functional and sustainable.',
    ],
    galleryImages: base.galleryImages || [
      { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', alt: 'Building exterior' },
      { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', alt: 'Interior' },
      { url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400', alt: 'Office space' },
      { url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400', alt: 'Swimming pool' },
      { url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400', alt: 'Gym' },
      { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400', alt: 'Clubhouse' },
    ],
    featuredProject: base.featuredProject || {
      name: projects[0]?.name || 'The Prestige City Hyderabad',
      location: projects[0]?.location || 'Budvel, Hyderabad',
      image: DUMMY_IMAGES.building,
      units: '405',
      size: '4 Acre',
      launchDate: 'Aug 2024',
      possession: 'Sep 2028',
      plotSize: '1,200 - 3,000 sqft',
      configurations: ['2BHK', '3BHK', '4BHK'],
      priceRange: '₹1.16 Cr - ₹2.91 Cr',
      dealsClosed: 42,
      inProgress: 132,
    },
    keyProjects: (base.projects || []).slice(0, 5).map((p, i) => ({
      ...p,
      image: `https://picsum.photos/seed/${base.id || 'builder'}${i}/400/300`,
      href: '#',
    })),
    team: base.team || [
      { name: 'Irfan Razack', role: 'Chairman & Managing Director', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', quote: "Our success lies in our unwavering commitment to quality and our ability to anticipate and exceed customer expectations.", bio: 'Visionary leader behind the company\'s success.' },
      { name: 'Jane Doe', role: 'Chief Executive Officer', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', quote: "Innovation is at the heart of everything we do.", bio: 'Over 20 years of experience in real estate.' },
      { name: 'John Smith', role: 'Chief Architect', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', quote: null, bio: 'Creative force behind iconic designs.' },
    ],
    operationalSegments: base.operationalSegments || [
      { name: 'Residential', cities: ['Mumbai', 'Hyderabad', 'Bangalore', 'Chennai', 'Kolkata', 'Goa', 'Delhi', 'Pune', 'Ahmedabad', 'Noida', 'Gurgaon'] },
      { name: 'Commercial', cities: [] },
      { name: 'Hospitality', cities: [] },
      { name: 'Retail', cities: [] },
    ],
    ongoingCount: ongoing,
    upcomingCount: newLaunch + upcoming,
  };
}

export const BUILDERS_BY_ID = {
  brigade: buildExtendedBuilder({
    id: 'brigade',
    name: 'Brigade Group',
    logo: '/builders/subscribers/subscriber-1.png',
    isBrigade: true,
    stats: { projects: '220+', cities: '12', sqft: '1.8+', clients: '1000+', experience: '33 Yrs', experienceNum: 33, projectsNum: 220 },
    description: "BHIVE Workspace, established in 2014, specializes in providing Zero CapEx, Enterprise Grade, Customized managed office spaces. With 26+ locations in Bangalore and an expansion to Mumbai, BHIVE'S flagship HSR campus is the largest in India, offering over 8,000 seats. BHIVE offers cost-efficient, maintenance-free office solutions tailored to enterprise needs. Notable clients include leading tech companies and startups.",
    projects: [
      { name: 'Brigade Horizon', location: 'Mysore Road, Bangalore', area: 'Mysore Road', status: 'Coming Soon', type: 'newLaunch', price: 85, seats: 150 },
      { name: 'Brigade El Dorado', location: 'Devanahalli, Bangalore', area: 'Devanahalli', status: 'Coming Soon', type: 'newLaunch', price: 45, seats: 80 },
      { name: 'Brigade Cornerstone Utopia', location: 'Varthur, Bangalore', area: 'Varthur', status: 'Coming Soon', type: 'newLaunch', price: 120, seats: 200 },
      { name: 'Brigade Orchards', location: 'Devanahalli, Bangalore', area: 'Devanahalli', status: 'Coming Soon', type: 'upcoming', price: 65, seats: 100 },
      { name: 'Brigade Caladium', location: 'Hebbal, Bangalore', area: 'Hebbal', status: 'Coming Soon', type: 'upcoming', price: 95, seats: 120 },
      { name: 'Brigade Atmosphere', location: 'Devanahalli, Bangalore', area: 'Devanahalli', status: 'Ready', type: 'readyToMove', price: 110, seats: 180 },
      { name: 'Brigade Komarla Heights', location: 'Padmanabhanagar, Bangalore', area: 'Padmanabhanagar', status: 'Ready', type: 'readyToMove', price: 75, seats: 90 },
      { name: 'Brigade Tech Gardens', location: 'Brookefield, Bangalore', area: 'Brookefield', status: 'Ready', type: 'readyToMove', price: 130, seats: 250 },
      { name: 'Brigade Mini Space', location: 'Hebbal, Bangalore', area: 'Hebbal', status: 'Coming Soon', type: 'newLaunch', price: 25, seats: 30 },
    ],
    founded: '1986',
    headquarters: 'Bangalore',
    tagline: 'Building a better tomorrow, today.',
  }),
  'builder-10': buildExtendedBuilder({
    id: 'builder-10',
    name: 'Builder Name 10',
    logo: null,
    stats: { projects: '20+', cities: '12', sqft: '1.8+', clients: '1000+', experience: '40 Yrs', experienceNum: 40, projectsNum: 20 },
    description: "BHIVE Workspace, established in 2014, specializes in providing Zero CapEx, Enterprise Grade, Customized managed office spaces. With 26+ locations in Bangalore and Mumbai.",
    projects: [
      { name: 'Upcoming Project 1', location: 'Electronic City, Bangalore', area: 'Electronic City', status: 'TBD', type: 'newLaunch', price: 55, seats: 60 },
      { name: 'Ready Tower A', location: 'Whitefield, Bangalore', area: 'Whitefield', status: 'Ready', type: 'readyToMove', price: 90, seats: 110 },
      { name: 'Ready Tower B', location: 'Whitefield, Bangalore', area: 'Whitefield', status: 'Ready', type: 'readyToMove', price: 88, seats: 95 },
      { name: 'Ready Tower C', location: 'Sarjapur, Bangalore', area: 'Sarjapur', status: 'Ready', type: 'readyToMove', price: 78, seats: 70 },
    ],
    founded: '1984',
    headquarters: 'Bangalore',
    tagline: 'Quality construction for over 40 years',
  }),
  'builder-9': buildExtendedBuilder({
    id: 'builder-9',
    name: 'Builder Name 9',
    logo: null,
    stats: { projects: '25+', cities: '12', sqft: '1.8+', clients: '1000+', experience: '11 Yrs', experienceNum: 11, projectsNum: 25 },
    description: "BHIVE Workspace specializes in providing Zero CapEx, Enterprise Grade office spaces.",
    projects: [
      { name: 'Upcoming Project 1', location: 'Electronic City, Bangalore', area: 'Electronic City', status: 'TBD', type: 'upcoming', price: 62, seats: 85 },
      { name: 'Ready Complex', location: 'Hebbal, Bangalore', area: 'Hebbal', status: 'Ready', type: 'readyToMove', price: 100, seats: 140 },
      { name: 'Launch Project', location: 'Varthur, Bangalore', area: 'Varthur', status: 'Coming Soon', type: 'newLaunch', price: 70, seats: 75 },
    ],
    founded: '2013',
    headquarters: 'Bangalore',
    tagline: 'Modern spaces for modern businesses',
  }),
  'builder-8': buildExtendedBuilder({
    id: 'builder-8',
    name: 'Builder Name 8',
    logo: null,
    stats: { projects: '350+', cities: '12', sqft: '1.8+', clients: '1000+', experience: '11 Yrs', experienceNum: 11, projectsNum: 350 },
    description: "BHIVE Workspace specializes in Enterprise Grade office spaces across India.",
    projects: [
      { name: 'New Launch Tower', location: 'Electronic City, Bangalore', area: 'Electronic City', status: 'Coming Soon', type: 'newLaunch', price: 58, seats: 65 },
      { name: 'Upcoming Project 1', location: 'Electronic City, Bangalore', area: 'Electronic City', status: 'TBD', type: 'upcoming', price: 58, seats: 65 },
    ],
    founded: '2013',
    headquarters: 'Bangalore',
    tagline: 'Scaling excellence across India',
  }),
};

export function getBuilderById(id) {
  return BUILDERS_BY_ID[id] || null;
}

export function transformLocalBuilderToDetailFormat(builder) {
  if (!builder) return null;
  return {
    ...builder,
    name: builder.name || 'N/A',
    tagline: builder.tagline || '',
    founded: builder.founded || 'N/A',
    headquarters: builder.headquarters || 'N/A',
    projectsCompleted: builder.stats?.projects || '0',
    ongoingProjects: String(builder.ongoingCount ?? 0),
    upcomingProjects: String(builder.upcomingCount ?? 0),
    experience: builder.stats?.experience || 'N/A',
    cities: builder.stats?.cities || 'N/A',
  };
}
