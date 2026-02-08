"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BadgeInfo,
  Building2,
  BarChart3,
  MapPin,
  Settings,
  BadgeCheck,
  Users,
  Megaphone,
  CloudUpload,
  Link2,
  Facebook,
  Linkedin,
  Instagram,
  Youtube,
  ChevronDown,
  Plus,
} from 'lucide-react';

const inputClass =
  'flex h-8 max-[425px]:h-7 w-full min-w-0 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 max-[425px]:px-2 max-[425px]:py-1 text-xs max-[425px]:text-[11px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50';
const textareaClass =
  'flex min-h-[60px] max-[425px]:min-h-[52px] w-full min-w-0 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 max-[425px]:px-2 max-[425px]:py-1 text-xs max-[425px]:text-[11px] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50';
const labelClass = 'text-xs max-[425px]:text-[11px] font-medium text-gray-700 block mb-1.5 max-[425px]:mb-1';
const cardClass = 'rounded-md border border-gray-200 bg-white shadow-sm';
const dividerClass = 'shrink-0 bg-gray-200 h-px w-full';
const addButtonClass = 'inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors cursor-pointer';

const QuickLink = ({ href, icon: Icon, children }) => (
  <a
    href={href}
    className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100 text-gray-600 text-xs font-medium transition-colors"
  >
    <Icon className="h-4 w-4 shrink-0" />
    <span>{children}</span>
  </a>
);

const SectionCard = ({ id, title, subtitle, children }) => (
  <div className={`${cardClass} min-w-0`} id={id}>
    <div className="p-4 max-[425px]:p-3">
      <h3 className="text-sm max-[425px]:text-xs font-bold leading-none">{title}</h3>
      {subtitle && <p className="text-xs max-[425px]:text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    <div className={dividerClass} />
    <div className="p-4 pt-3 max-[425px]:p-3 max-[425px]:pt-3">{children}</div>
  </div>
);

export default function NewBuilderPage() {
  const router = useRouter();
  const [personsCount, setPersonsCount] = useState(1);
  const [awardsCount, setAwardsCount] = useState(1);
  const [testimonialsCount, setTestimonialsCount] = useState(1);
  const [faqsCount, setFaqsCount] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-[425px]:px-3 pt-4 pb-8 md:pt-6 md:pb-10 max-[425px]:pt-3 max-[425px]:pb-6">
        <Link
          href="/builders"
          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-xs max-[425px]:text-[11px] font-medium mb-3 max-[425px]:mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 max-[425px]:w-3 max-[425px]:h-3" />
          Back to Builders
        </Link>

        <div className="text-center mb-6 md:mb-8 max-[425px]:mb-4">
          <h1 className="text-2xl max-[425px]:text-xl font-extrabold text-gray-900">Add New Builder</h1>
          <p className="mt-0.5 text-xs max-[425px]:text-[11px] text-gray-500">Fill in the details below to list a new builder on the platform.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-[425px]:gap-3">
          {/* Sidebar - Quick Links */}
          <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-20 self-start">
            <div className={cardClass}>
              <div className="p-4">
                <h3 className="text-sm font-bold leading-none tracking-tight">Quick Links</h3>
              </div>
              <div className={dividerClass} />
              <nav className="scrollbar-hide p-1.5 flex flex-col gap-0.5 max-h-[calc(100vh-10rem)] overflow-y-auto">
                <QuickLink href="#overview" icon={BadgeInfo}>Company Overview</QuickLink>
                <QuickLink href="#description" icon={Building2}>Company Description</QuickLink>
                <QuickLink href="#social" icon={BarChart3}>Social Media & Website</QuickLink>
                <QuickLink href="#basic-details" icon={MapPin}>Basic Details</QuickLink>
                <QuickLink href="#specialties" icon={Settings}>Specialties</QuickLink>
                <QuickLink href="#availability" icon={BadgeCheck}>Availability Status</QuickLink>
                <QuickLink href="#director" icon={Users}>Director/Chairman Information</QuickLink>
                <QuickLink href="#key-people" icon={Users}>Key People</QuickLink>
                <QuickLink href="#relationship-manager" icon={Users}>Relationship Manager</QuickLink>
                <QuickLink href="#awards" icon={Megaphone}>Awards & Recognition</QuickLink>
                <QuickLink href="#testimonials" icon={Megaphone}>Client Testimonials</QuickLink>
                <QuickLink href="#faq" icon={Megaphone}>Frequently Asked Questions</QuickLink>
                <QuickLink href="#seo" icon={Settings}>SEO Settings</QuickLink>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3 space-y-4 max-[425px]:space-y-3 min-w-0">
            {/* Company Overview */}
            <SectionCard id="overview" title="Company Overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-[425px]:gap-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>Brand / Company Name</label>
                  <input className={inputClass} placeholder="e.g., Prestige Group" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Tagline/Slogan</label>
                  <input className={inputClass} placeholder="Enter Tagline or Slogan" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Headquarters</label>
                  <input className={inputClass} placeholder="Enter Headquarters Location" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Year of Establishment</label>
                  <input className={inputClass} placeholder="e.g., 1986" type="number" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Projects Completed</label>
                  <input className={inputClass} placeholder="e.g., 280" type="number" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Ongoing Projects</label>
                  <input className={inputClass} placeholder="e.g., 20" type="number" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Upcoming Projects</label>
                  <input className={inputClass} placeholder="e.g., 10" type="number" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Total Years of Experience</label>
                  <input className={inputClass} placeholder="e.g., 35" type="number" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Company Logo (PNG/SVG)</label>
                  <label
                    htmlFor="dropzone-logo"
                    className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 aspect-square h-24"
                  >
                    <div className="flex flex-col items-center justify-center py-4">
                      <CloudUpload className="w-6 h-6 mb-2 text-gray-400" />
                      <p className="mb-1 text-xs text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">1:1 Ratio Recommended (SVG, PNG, JPG)</p>
                    </div>
                    <input id="dropzone-logo" className="hidden" type="file" />
                  </label>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Builder Category</label>
                  <button
                    type="button"
                    className="flex h-8 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span>Select Category</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Cities of Operation (Comma separated)</label>
                  <input className={inputClass} placeholder="e.g., Bangalore, Chennai, Hyderabad" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Total Number of Centers</label>
                  <input className={inputClass} placeholder="e.g., 250" type="number" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Total Built-up Area (in million sq. ft.)</label>
                  <input className={inputClass} placeholder="e.g., 150" type="number" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Total Clients Served</label>
                  <input className={inputClass} placeholder="e.g., 5000" type="number" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>License Number</label>
                  <input className={inputClass} placeholder="e.g., RERA-KAR-2021-0012345" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Certificate</label>
                  <input className={inputClass} placeholder="e.g., ISO 9001:2015 Certified" />
                </div>
              </div>
            </SectionCard>

            {/* Company Description */}
            <SectionCard id="description" title="Company Description">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-[425px]:gap-3">
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Short Description (100-120 words)</label>
                  <textarea className={textareaClass} placeholder="A brief introduction to the company..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Detailed Description (200-300 words)</label>
                  <textarea
                    className={textareaClass}
                    placeholder="More details about the company's history, vision, and values..."
                    rows={5}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Mission Statement</label>
                  <textarea className={textareaClass} placeholder="Enter mission statement" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Vision Statement</label>
                  <textarea className={textareaClass} placeholder="Enter vision statement" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Key Differentiators / USPs (Bullet points)</label>
                  <textarea
                    className={textareaClass}
                    placeholder="- Focus on quality - Customer-centric approach - Innovative designs"
                    rows={4}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Largest Campus Details</label>
                  <input className={inputClass} placeholder="Location + Seating Capacity" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Other Flagship Locations (optional)</label>
                  <input className={inputClass} placeholder="e.g., Location 1, Location 2" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Minimum Lock-in Period</label>
                  <input className={inputClass} placeholder="e.g., 12 Months" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Expansion / Contraction Flexibility</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="flex" defaultChecked className="rounded-full" />
                      <span className="text-xs font-medium">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="flex" className="rounded-full" />
                      <span className="text-xs font-medium">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Social Media & Website */}
            <SectionCard id="social" title="Social Media & Website">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-[425px]:gap-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>Official Website</label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input className={`${inputClass} pl-8`} placeholder="https://www.builder.com" type="url" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Facebook URL</label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input className={`${inputClass} pl-8`} placeholder="https://facebook.com/builder" type="url" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>LinkedIn URL</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input className={`${inputClass} pl-8`} placeholder="https://linkedin.com/company/builder" type="url" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Instagram URL</label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input className={`${inputClass} pl-8`} placeholder="https://instagram.com/builder" type="url" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>YouTube URL</label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input className={`${inputClass} pl-8`} placeholder="https://youtube.com/@builder" type="url" />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Basic Details */}
            <SectionCard id="basic-details" title="Basic Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-[425px]:gap-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>Center Name</label>
                  <input className={inputClass} placeholder="e.g., Prestige Tech Park" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Micromarket / Area</label>
                  <input className={inputClass} placeholder="e.g., Marathahalli-Sarjapur Outer Ring Road" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>City</label>
                  <input className={inputClass} placeholder="e.g., Bangalore" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Full Address</label>
                  <textarea className={textareaClass} placeholder="Enter the full address" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Google Map Location Link</label>
                  <input className={inputClass} placeholder="https://maps.google.com/..." type="url" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Contact Email*</label>
                  <input className={inputClass} placeholder="contact@builder.com" type="email" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Phone Number*</label>
                  <input className={inputClass} placeholder="+91 XXXXXXXXXX" type="tel" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Center Images (5-8 photos)</label>
                  <label
                    htmlFor="dropzone-center"
                    className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 aspect-video h-auto min-h-[100px]"
                  >
                    <div className="flex flex-col items-center justify-center py-4">
                      <CloudUpload className="w-6 h-6 mb-2 text-gray-400" />
                      <p className="mb-1 text-xs text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-[10px] text-gray-400">16:9 Ratio (High-res images)</p>
                    </div>
                    <input id="dropzone-center" className="hidden" type="file" multiple />
                  </label>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Promotional Video URL</label>
                  <input className={inputClass} placeholder="https://youtube.com/watch?v=..." type="url" />
                  <p className="text-[10px] text-gray-400 mt-0.5">YouTube, Vimeo, or other video URL</p>
                </div>
              </div>
            </SectionCard>

            {/* Specialties */}
            <SectionCard id="specialties" title="Specialties" subtitle="Select all specialties of the builder.">
              <div className="grid grid-cols-2 max-[425px]:grid-cols-2 md:grid-cols-4 gap-4 max-[425px]:gap-3">
                {['Residential', 'Commercial', 'Hospitality', 'Retail'].map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs font-medium">{s}</span>
                  </label>
                ))}
              </div>
            </SectionCard>

            {/* Availability Status */}
            <SectionCard id="availability" title="Availability Status">
              <div className="flex flex-col md:flex-row gap-4 max-[425px]:gap-3">
                <span className="text-xs max-[425px]:text-[11px] font-semibold text-gray-700">Listing Category:</span>
                <div className="flex flex-wrap items-center gap-3 max-[425px]:gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="availability" className="rounded-full" />
                    <span className="text-sm font-medium">New Launch</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="availability" className="rounded-full" />
                    <span className="text-xs font-medium">Upcoming</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="availability" defaultChecked className="rounded-full" />
                    <span className="text-xs font-medium">Ready to Move In</span>
                  </label>
                </div>
              </div>
            </SectionCard>

            {/* Director/Chairman */}
            <SectionCard id="director" title="Director/Chairman Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-[425px]:gap-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>Director Name</label>
                  <input className={inputClass} placeholder="Enter Director's Name" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Position</label>
                  <input className={inputClass} placeholder="e.g., CEO, Managing Director" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Quote/Profile</label>
                  <textarea className={textareaClass} placeholder="Enter director's quote or brief profile" />
                </div>
              </div>
            </SectionCard>

            {/* Key People */}
            <SectionCard id="key-people" title="Key People">
              <div className="space-y-3">
                {Array.from({ length: personsCount }, (_, i) => (
                  <div key={`person-${i}`} className="p-3 border rounded-md space-y-3 bg-gray-50">
                    <h4 className="text-xs font-semibold">Person {i + 1}</h4>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className={labelClass}>Photo Upload</label>
                        <label
                          htmlFor={`dropzone-person-${i}`}
                          className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 py-6"
                        >
                          <CloudUpload className="w-6 h-6 mb-2 text-gray-400" />
                          <p className="text-xs text-gray-500">Click to upload (1:1 Ratio)</p>
                          <input id={`dropzone-person-${i}`} className="hidden" type="file" />
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className={labelClass}>Name</label>
                          <input className={inputClass} placeholder="Enter name" />
                        </div>
                        <div className="space-y-1.5">
                          <label className={labelClass}>Designation</label>
                          <input className={inputClass} placeholder="e.g., Chief Architect" />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className={labelClass}>Short Bio</label>
                          <textarea className={textareaClass} placeholder="Enter a brief biography" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setPersonsCount((c) => c + 1)}
                  className={addButtonClass}
                >
                  <Plus className="h-4 w-4" />
                  Add Person
                </button>
              </div>
            </SectionCard>

            {/* Relationship Manager */}
            <SectionCard id="relationship-manager" title="Relationship Manager">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>RM Name</label>
                  <input className={inputClass} placeholder="e.g., Jane Doe" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>RM Designation</label>
                  <input className={inputClass} placeholder="e.g., Senior Manager" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>RM Profile Photo</label>
                  <label
                    htmlFor="dropzone-rm"
                    className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 py-6"
                  >
                    <CloudUpload className="w-6 h-6 mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">1:1 Ratio (Profile Picture)</p>
                    <input id="dropzone-rm" className="hidden" type="file" />
                  </label>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Contact Number (Call)</label>
                  <input className={inputClass} placeholder="+91 98765 43210" type="tel" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>WhatsApp Number</label>
                  <input className={inputClass} placeholder="+91 98765 43210" type="tel" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Email ID</label>
                  <input className={inputClass} placeholder="jane.doe@example.com" type="email" />
                </div>
              </div>
            </SectionCard>

            {/* Awards & Recognition */}
            <SectionCard id="awards" title="Awards & Recognition">
              <div className="space-y-3">
                {Array.from({ length: awardsCount }, (_, i) => (
                  <div key={`award-${i}`} className="p-3 border rounded-md space-y-3 bg-gray-50">
                    <h4 className="text-xs font-semibold">Award {i + 1}</h4>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className={labelClass}>Award Icon/Image</label>
                        <label
                          htmlFor={`dropzone-award-${i}`}
                          className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 py-6"
                        >
                          <CloudUpload className="w-6 h-6 mb-2 text-gray-400" />
                          <p className="text-xs text-gray-500">Click to upload or drag and drop</p>
                          <p className="text-[10px] text-gray-400">Upload Icon</p>
                          <input id={`dropzone-award-${i}`} className="hidden" type="file" />
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className={labelClass}>Award Title</label>
                          <input className={inputClass} placeholder="Enter award title" />
                        </div>
                        <div className="space-y-1.5">
                          <label className={labelClass}>Award Organisation</label>
                          <input className={inputClass} placeholder="Enter awarding organisation" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setAwardsCount((c) => c + 1)}
                  className={addButtonClass}
                >
                  <Plus className="h-4 w-4" />
                  Add Award
                </button>
              </div>
            </SectionCard>

            {/* Client Testimonials */}
            <SectionCard id="testimonials" title="Client Testimonials">
              <div className="space-y-3">
                {Array.from({ length: testimonialsCount }, (_, i) => (
                  <div key={`testimonial-${i}`} className="p-3 border rounded-md space-y-3 bg-gray-50">
                    <h4 className="text-xs font-semibold">Testimonial {i + 1}</h4>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className={labelClass}>Client Photo</label>
                        <label
                          htmlFor={`dropzone-testimonial-${i}`}
                          className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 py-6"
                        >
                          <CloudUpload className="w-6 h-6 mb-2 text-gray-400" />
                          <p className="text-xs text-gray-500">Click to upload or drag and drop</p>
                          <p className="text-[10px] text-gray-400">1:1 Ratio Recommended</p>
                          <input id={`dropzone-testimonial-${i}`} className="hidden" type="file" />
                        </label>
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Client Name</label>
                        <input className={inputClass} placeholder="Enter client's name" />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>Testimonial</label>
                        <textarea
                          className={textareaClass}
                          placeholder="Enter the client testimonial or review"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setTestimonialsCount((c) => c + 1)}
                  className={addButtonClass}
                >
                  <Plus className="h-4 w-4" />
                  Add Testimonial
                </button>
              </div>
            </SectionCard>

            {/* FAQ */}
            <SectionCard id="faq" title="Frequently Asked Questions">
              <div className="space-y-3">
                {Array.from({ length: faqsCount }, (_, i) => (
                  <div key={`faq-${i}`} className="p-3 border rounded-md space-y-3 bg-gray-50">
                    <h4 className="text-xs font-semibold">FAQ {i + 1}</h4>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Question</label>
                      <input className={inputClass} placeholder="Enter question" />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Answer</label>
                      <textarea className={textareaClass} placeholder="Enter answer" />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFaqsCount((c) => c + 1)}
                  className={addButtonClass}
                >
                  <Plus className="h-4 w-4" />
                  Add FAQ
                </button>
              </div>
            </SectionCard>

            {/* SEO Settings */}
            <SectionCard id="seo" title="SEO Settings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-[425px]:gap-3">
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Meta Title</label>
                  <input className={inputClass} placeholder="Auto-generated from Builder Name" />
                  <p className="text-[10px] text-gray-400 text-right mt-0.5">0 characters</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>URL Slug</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-2.5 text-xs text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                      /builders/
                    </span>
                    <input
                      className={`${inputClass} rounded-l-none`}
                      placeholder="auto-generated-slug"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Meta Description</label>
                  <textarea
                    className={textareaClass}
                    placeholder="Enter meta description (max 160 characters)"
                  />
                  <p className="text-[10px] text-gray-400 text-right mt-0.5">0 / 160</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Keywords</label>
                  <input
                    className={inputClass}
                    placeholder="real estate, builder, construction (comma separated)"
                  />
                </div>
              </div>
            </SectionCard>

            {/* Actions */}
            <div className="flex flex-col-reverse max-[425px]:flex-col-reverse sm:flex-row justify-end gap-3 max-[425px]:gap-2 pt-4 max-[425px]:pt-3">
              <button
                type="button"
                onClick={() => router.push('/builders')}
                className="inline-flex items-center justify-center h-9 max-[425px]:h-8 rounded-md px-6 max-[425px]:px-4 text-xs max-[425px]:text-[11px] font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center h-9 max-[425px]:h-8 rounded-md px-6 max-[425px]:px-4 text-xs max-[425px]:text-[11px] font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                Submit Builder
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
