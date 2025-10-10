"use client";
import React, { useState, useEffect } from 'react';

const PrivacyPolicyPage = () => {
  const [sections, setSections] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        const response = await fetch('/api/policy');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
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

    fetchPolicyData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <div>Loading policy...</div>;
    }

    if (error) {
      return <div className="text-red-500">Error: {error}</div>;
    }

    const selectedSection = sections.find(sec => sec.identifier === selectedTab);

    if (!selectedSection) {
      return <div>Please select a section.</div>;
    }

    return (
      <div dangerouslySetInnerHTML={{ __html: selectedSection.content }} />
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-[980px] mx-auto mt-4 mb-18 md:mb-0">
      <div className='flex flex-col items-start justify-start gap-4 mb-6 px-4 py-6 bg-[#f9f8f9] rounded-md'>
        <h4 className='text-gray-600 font-semibold'>Choose from below</h4>
        <div className="flex flex-wrap gap-2 md:gap-4 justify-start items-start text-sm md:text-lg">
          {loading ? (
            <p>Loading tabs...</p>
          ) : (
            sections.map((section) => (
              <button
                key={section.identifier}
                className={`px-3 py-1 md:px-3.5 md:py-1.5 ${
                  selectedTab === section.identifier ? 'bg-[#ffdf58]' : 'bg-white'
                } rounded-md hover:cursor-pointer transition-colors duration-200`}
                onClick={() => setSelectedTab(section.identifier)}
              >
                {section.title}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 md:mt-14 prose max-w-none">
        {renderContent()}
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;