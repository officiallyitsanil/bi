"use client";
import MenuSideBar from '@/components/MenuSideBar';
import FiltersModal from '@/components/FiltersModal';
import LayersModal from '@/components/LayersModal';
import { Search, X, Plus, Share2, SlidersHorizontal, Layers, Copy, CopyCheck, Menu, ArrowRight, List } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from "next/dynamic";
import PropertyDetailModal from '@/components/PropertyDetailModal';

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

function Modal({ children, style, onClose, hideClose = false, className = "" }) {
  return (
    <div className="fixed inset-0 bg-black/50 md:bg-transparent z-50 pointer-events-none">
      <div
        className={`absolute rounded-xl shadow-xl pointer-events-auto ${className}`}
        style={style}
      >
        {!hideClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 bg-[#f2f2f2] p-2 rounded-full hover:text-gray-600 z-10 hover:cursor-pointer mt-0 m-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [modalPos, setModalPos] = useState({ top: 0, right: 0 });
  const [copied, setCopied] = useState(false);

  const [layersProceeded, setLayersProceeded] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPropertyListVisible, setPropertyListVisible] = useState(false);

  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [markers, setMarkers] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  const [zoomLevel, setZoomLevel] = useState(5);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/residential');
        const result = await response.json();

        if (result.success && result.data.residentialProperties) {
          const formattedMarkers = result.data.residentialProperties.map(prop => {
            const allImages = Object.values(prop.images || {}).flat().map(img => img.url);
            return {
              id: prop._id,
              state_name: prop.state,
              coordinates: {
                lat: prop.latitude,
                lng: prop.longitude,
              },
              position: {
                lat: prop.latitude,
                lng: prop.longitude,
              },
              size: `${prop.landSize} Acres`,
              price_per_acre: `${prop.pricePerAcreLakhs} Lakh`,
              total_price: `${prop.totalValue} Lakh`,
              listed_by: prop.sellerType ? prop.sellerType.charAt(0).toUpperCase() + prop.sellerType.slice(1) : 'N/A',
              images: allImages.length > 0 ? allImages : [prop.featuredImageUrl || '/placeholder.png'],
              zoning: prop.zoneType ? prop.zoneType.charAt(0).toUpperCase() + prop.zoneType.slice(1) : 'N/A',
              approach_road: prop.approachRoad ? 'Available' : 'Not Available',
              date_added: new Date(prop.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
              is_verified: prop.physicalVerificationCompleted,
              sellerPhoneNumber: prop.sellerPhoneNumber,
              layer_location: prop.state,
              location_district: prop.state,
              createdBy: prop.createdBy,
            };
          });
          setMarkers(formattedMarkers);
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    };

    fetchProperties();
  }, []);

  const filtersBtnRef = useRef(null);
  const layersBtnRef = useRef(null);
  const addBtnRef = useRef(null);
  const shareBtnRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const pos = { lat, lng };

        const newMarker = {
          id: Date.now(),
          layer_location: data.results[0].formatted_address,
          popup_text: 'This is the location you searched for.',
          position: pos,
        };

        setZoomLevel(14);

        setMapCenter(pos);
        setMarkers(prevMarkers => [...prevMarkers, newMarker]);
        setSearchQuery("");
      } else {
        console.error("Geocoding failed:", data.status, data.error_message);
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleMarkerClick = (marker) => {
    if (marker.position) {
      setMapCenter(marker.position);
    }
    setSelectedCity(marker);
  };

  const closeCityModal = () => {
    setSelectedCity(null);
  };

  const openModal = (modalType, ref) => {
    if (!ref.current) return;

    if (activeModal === modalType) {
      setActiveModal(null);
      return;
    }

    setActiveModal(null);
    setTimeout(() => {
      const rect = ref.current.getBoundingClientRect();
      let pos = { top: rect.bottom + window.scrollY + 8, right: window.innerWidth - rect.right - window.scrollX };

      if (modalType === "filters") {
        const layersRect = layersBtnRef.current?.getBoundingClientRect();
        if (layersRect) pos = { top: layersRect.bottom + window.scrollY + 8, right: window.innerWidth - layersRect.right - window.scrollX };
      } else if (modalType === "add") {
        pos = { top: rect.top + window.scrollY, right: window.innerWidth - rect.left - window.scrollX + 8 };
      } else if (modalType === "share") {
        const addRect = addBtnRef.current?.getBoundingClientRect();
        if (addRect) pos = { top: addRect.top + window.scrollY, right: window.innerWidth - addRect.left - window.scrollX + 8 };
      }

      setModalPos(pos);
      setActiveModal(modalType);
      if (modalType !== "share") setCopied(false);
    }, 150);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("https://buildersinfo.in/");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[90vh] md:h-[87vh] bg-[#1f2229] flex flex-col">
      <main className="flex-1 relative flex">
        {isPropertyListVisible && (
          <div className="hidden md:block w-[380px] bg-white shadow-lg overflow-y-auto">
            <div className="p-4 sticky top-0 bg-white z-10 border-b">
              <h2 className="text-xl font-bold text-gray-800">Properties</h2>
              <p className="text-sm text-gray-500">{markers.length} lands found</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {markers.map(marker => (
                <li key={marker.id} className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleMarkerClick(marker)}>
                  <div className="flex gap-4">
                    <Image
                      src={marker.images[0] || '/placeholder.png'}
                      alt="Property Image"
                      width={100}
                      height={80}
                      className="rounded-md object-cover w-28 h-20"
                      unoptimized
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{marker.size} in {marker.state_name}</p>
                      <p className="text-sm text-gray-600">{marker.price_per_acre} / Acre</p>
                      <p className="text-sm text-gray-600">Total: {marker.total_price}</p>
                      <p className="text-xs text-gray-400 mt-1">Added on: {marker.date_added}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex-1 relative">
          <form
            onSubmit={handleSearch}
            className="flex absolute top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-10 w-full px-4 md:px-0 md:w-auto"
          >
            <div className="bg-white rounded-full pl-5 pr-3 py-1 md:py-2.5 shadow-xl w-full md:min-w-96 flex items-center gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Location"
                className="flex-1 outline-none text-gray-700 text-[0.9rem] font-medium placeholder-gray-400"
              />
              <Search className="hidden md:block text-gray-500 w-5 h-5 hover:text-gray-950 hover:cursor-pointer" onClick={handleSearch} />
              <button
                type="button"
                className="block md:hidden p-2 rounded-md hover:cursor-pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="w-6 h-6 text-gray-800" />
              </button>
            </div>
          </form>

          <div className="flex absolute top-20 w-full md:w-auto md:top-8 md:right-4 z-10 justify-between md:gap-3 px-5 md:px-0">
            <button
              ref={filtersBtnRef}
              onClick={() => openModal("filters", filtersBtnRef)}
              className="bg-white px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className='text-[0.8rem]'>Filters</span>
            </button>
            <button
              ref={layersBtnRef}
              onClick={() => openModal("layers", layersBtnRef)}
              className="bg-white px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span className='text-[0.8rem]'>Layers</span>
            </button>
          </div>

          <button
            onClick={() => setPropertyListVisible(!isPropertyListVisible)}
            className="hidden md:flex bg-white p-2.5 rounded-lg shadow-xl absolute bottom-24 left-4 z-10 items-center gap-2 text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
          >
            <List className="w-5 h-5" />
          </button>

          <MapView
            center={mapCenter}
            markers={markers}
            onMarkerClick={handleMarkerClick}
            zoom={zoomLevel}
          />

          <div className="absolute bottom-6 right-4 flex flex-col gap-3 z-10">
            <button
              ref={addBtnRef}
              onClick={() => openModal("add", addBtnRef)}
              className="bg-[#ffdd57] hover:cursor-pointer text-slate-800 p-2.5 rounded-lg shadow-xl"
            >
              {activeModal === "add" ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </button>
            <button
              ref={shareBtnRef}
              onClick={() => openModal("share", shareBtnRef)}
              className="bg-white hover:cursor-pointer text-slate-800 p-2.5 rounded-lg shadow-xl transition-colors"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </main>

      {isMenuOpen && <MenuSideBar onClose={() => setIsMenuOpen(false)} />}

      {selectedCity && (
        <PropertyDetailModal property={selectedCity} onClose={closeCityModal} />
      )}

      {activeModal === "filters" && (
        <Modal
          style={{ top: modalPos.top + 10, maxWidth: 370, maxHeight: 'calc(100vh - 120px)', "--filters-modal-right": `${((modalPos.right - 15 ?? 0))}px`, }}
          onClose={() => setActiveModal(null)}
          className={`p-4 pr-0 bg-white bottom-0 w-[100%] right-0 md:right-[var(--filters-modal-right)] md:w-[90%] md:bottom-auto`}
        >
          <FiltersModal />
        </Modal>
      )}

      {activeModal === "layers" && (
        layersProceeded ? (
          <Modal
            style={{
              top: modalPos.top + 10,
              maxWidth: 350,
              maxHeight: "calc(100vh - 120px)",
              "--layers-modal-right": `${((modalPos.right - 15 ?? 0))}px`,
            }}
            onClose={() => {
              setActiveModal(null);
              setLayersProceeded(false);
            }}
            className="p-6 bg-white bottom-0 w-[100%] md:w-[90%] right-0 md:right-[var(--layers-modal-right)]"
          >
            <LayersModal />
          </Modal>
        ) : (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 w-full h-full z-50"
            onClick={() => setActiveModal(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-lg h-auto w-[90%] max-w-md px-4 py-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pb-3 border-b border-gray-300 flex flex-row justify-between items-center">
                <div className="text-base md:text-lg">Layers Declaration</div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="hover:cursor-pointer text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-2 text-xs md:text-sm overflow-y-auto mt-3 space-y-2 max-h-[60vh] md:max-h-[20rem] py-2 pr-2">
                <p>
                  Disclaimer: The map layers on <b>Buildersinfo.in</b> are created using
                  publicly available data and are intended for general informational
                  purposes only. While we have made best efforts to ensure accuracy by
                  referencing sources like HMDA.gov.in, Bhuvan-ISRO, and others,
                  limitations such as outdated records, digitisation errors, satellite
                  distortions, and missing cadastral data may affect the accuracy of
                  the visual overlays.
                </p>
                <p>
                  These maps are not substitutes for official government surveys or
                  legal verification. Users are advised to independently verify all
                  details with the appropriate authorities before making any land or
                  investment decisions.
                </p>
                <p>
                  By using these layers, you acknowledge and accept these limitations.
                  Click on the info icon (in layers section) to know more about
                  individual layers.
                </p>
              </div>

              <button
                onClick={() => setLayersProceeded(true)}
                className="px-4 py-2 w-full rounded-full bg-[#fee47b] hover:shadow-lg hover:cursor-pointer flex flex-row justify-center mt-4 text-sm md:text-base"
              >
                Proceed <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        )
      )}

      {activeModal === "add" && (
        <Modal
          style={{ top: modalPos.top + 2, right: modalPos.right, width: 200 }}
          onClose={() => setActiveModal(null)}
          hideClose={true}
          className="bg-[#dddedf]"
        >
          <Link
            href="https://wa.me/+918151915199/?text=Hi,%20I%20want%20to%20list%20my%20land%20on%20buildersinfo."
            className="flex items-center gap-3 text-gray-700 font-medium px-1 py-3 rounded-lg align-middle justify-center bg-[#dddedf] text-[0.9rem]"
          >
            <Image src='/whatsapp.svg' alt='whatsapp' width={24} height={24} /> List My Land (Free)
          </Link>
        </Modal>
      )}

      {activeModal === "share" && (
        <Modal
          style={{ top: modalPos.top - 4, right: modalPos.right + 2 }}
          onClose={() => setActiveModal(null)}
          hideClose={true}
          className="bg-[#dddedf] w-52 md:w-[270px] p-1 md:p-2.5"
        >
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-gray-800 font-medium mb-2 p-2 rounded-sm justify-between w-full text-sm md:text-[0.9rem] hover:cursor-pointer"
          >
            Copy Link
            {copied ? <CopyCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
          <Link
            href="https://wa.me/?text=Check%20Verified%20Lands%20on%20Map%20View%3A%20%0A%20https%3A%2F%2Fwww.buildersinfo.in%2F%3Fcenter_lng%3D79.17%26center_lat%3D18.73%26zoom%3D18"
            className="flex items-center text-sm md:text-[0.9rem] gap-2 text-gray-800 font-medium p-2 rounded justify-between"
          >
            Share via WhatsApp <Image src='/whatsapp.svg' alt="whatsapp" width={24} height={24} />
          </Link>
        </Modal>
      )}
    </div>
  );
}