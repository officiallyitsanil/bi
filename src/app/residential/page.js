"use client";

import SearchSection from "@/components/SearchSection";
import SelectCityBox from "@/components/SelectCityBox";

export default function ResidentialPage() {
  const cities = [
    {
      name: "Mumbai",
      image: "/residential/Mumbai.png",
      backgroundImage: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Hyderabad",
      image: "/residential/Hyderabad.png",
      backgroundImage: "https://images.unsplash.com/photo-1551161242-b5af797b7233?q=80&w=1151&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      name: "Bangalore",
      image: "/residential/Bangalore.png",
      backgroundImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Chennai",
      image: "/residential/Chennai.png",
      backgroundImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Pune",
      image: "/residential/Pune.png",
      backgroundImage: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Noida",
      image: "/residential/Noida.png",
      backgroundImage: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Delhi",
      image: "/residential/Delhi.png",
      backgroundImage: "https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Indore",
      image: "/residential/Indore.png",
      backgroundImage: "https://images.unsplash.com/photo-1526495124232-a04e1849168c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Ahmedabad",
      image: "/residential/Ahmedabad.png",
      backgroundImage: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Jaipur",
      image: "/residential/Jaipur.png",
      backgroundImage: "https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Kerala",
      image: "/residential/Kerala.png",
      backgroundImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Chandigarh",
      image: "/residential/Chandigarh.png",
      backgroundImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Kolkata",
      image: "/residential/Kolkata.png",
      backgroundImage: "https://images.unsplash.com/photo-1558431382-27e303142255?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Goa",
      image: "/residential/Goa.png",
      backgroundImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Bhubaneswar",
      image: "/residential/Bhubaneswar.png",
      backgroundImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Uttar Pradesh",
      image: "/residential/UttarPradesh.png",
      backgroundImage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Lucknow",
      image: "/residential/Lucknow.png",
      backgroundImage: "https://images.unsplash.com/photo-1605649487212-183049acb54f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    }
  ];

  return (
    <div>
      <SearchSection />
      <SelectCityBox
        title="Select by City"
        cities={cities}
      />
    </div>
  );
}