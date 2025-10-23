"use client"
import React, { useState, useEffect } from 'react';

const TermsAndConditionsPage = () => {
  const [sections, setSections] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTermsData = async () => {
      try {
        const response = await fetch('/api/terms');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const data = await response.json();
        setSections(data);
        if (data.length > 0) {
          setSelectedTab(data[0].identifier);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTermsData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }
    if (error) {
      return <div className="text-red-500">Error: {error}</div>;
    }
    const selectedSection = sections.find(sec => sec.identifier === selectedTab);
    if (!selectedSection) {
      return null;
    }
    return (
      <div dangerouslySetInnerHTML={{ __html: selectedSection.content }} />
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-[980px] mx-auto mt-4 mb-18 md:mb-0">
      <div className='flex flex-col items-start justify-start gap-4 md:gap-6 mb-6 px-4 py-6 bg-[#f9f8f9] rounded-md'>
        <h4 className='text-gray-600 font-semibold text-xs md:text-sm'>Choose from below</h4>
        <div className="flex flex-wrap gap-2 md:gap-3 justify-start items-start text-sm md:text-lg">
          {loading ? (
            <p>Loading tabs...</p>
          ) : (
            sections.map((tab) => (
              <button
                key={tab.identifier}
                className={`px-3 py-1.5 md:px-3.5 md:py-2 font-medium ${
                  selectedTab === tab.identifier ? 'bg-[#ffdf58]' : 'bg-white'
                } rounded-md hover:cursor-pointer text-xs md:text-base transition-colors duration-200`}
                onClick={() => setSelectedTab(tab.identifier)}
              >
                {tab.title}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 md:mt-14 mb-6 prose max-w-none">
        {renderContent()}
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;