import React, { useState } from "react";

const InfoHub = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const schemes = [
    {
      id: 1,
      title: "Pradhan Mantri Awas Yojana",
      description: "Housing for All scheme providing financial assistance to eligible families for construction/purchase of houses.",
      category: "Housing",
      eligibility: "Annual family income below ₹18 lakhs",
      benefits: "Interest subsidy up to ₹2.67 lakhs",
      applyLink: "#",
      image: "🏠"
    },
    {
      id: 2,
      title: "Swachh Bharat Mission",
      description: "Clean India campaign focusing on sanitation, waste management and creating clean cities and villages.",
      category: "Sanitation",
      eligibility: "All citizens can participate",
      benefits: "Cleaner environment, improved public health",
      applyLink: "#",
      image: "🧹"
    },
    {
      id: 3,
      title: "Digital India Initiative",
      description: "Program to transform India into digitally empowered society and knowledge economy.",
      category: "Technology",
      eligibility: "All citizens",
      benefits: "Digital infrastructure, online services, digital literacy",
      applyLink: "#",
      image: "💻"
    },
    {
      id: 4,
      title: "PM-KISAN Scheme",
      description: "Direct income support to farmer families owning cultivable land.",
      category: "Agriculture",
      eligibility: "Small and marginal farmer families",
      benefits: "₹6,000 per year in three installments",
      applyLink: "#",
      image: "🌾"
    },
    {
      id: 5,
      title: "Ayushman Bharat",
      description: "National Health Protection Scheme providing health insurance coverage.",
      category: "Healthcare",
      eligibility: "Socio-economic caste census eligible families",
      benefits: "Health cover up to ₹5 lakhs per family per year",
      applyLink: "#",
      image: "🏥"
    },
    {
      id: 6,
      title: "Make in India",
      description: "Initiative to encourage companies to manufacture products in India.",
      category: "Business",
      eligibility: "Manufacturers and businesses",
      benefits: "Ease of doing business, investment opportunities",
      applyLink: "#",
      image: "🏭"
    }
  ];

  const categories = ["All", "Housing", "Healthcare", "Agriculture", "Technology", "Sanitation", "Business"];

  const filteredSchemes = selectedCategory === "All" 
    ? schemes 
    : schemes.filter(scheme => scheme.category === selectedCategory);

  const getCategoryColor = (category) => {
    const colors = {
      "Housing": "bg-blue-500",
      "Healthcare": "bg-red-500",
      "Agriculture": "bg-green-500",
      "Technology": "bg-purple-500",
      "Sanitation": "bg-yellow-500",
      "Business": "bg-indigo-500"
    };
    return colors[category] || "bg-gray-500";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">Information Hub</h2>
      <p className="text-gray-600 text-center mb-8">
        Explore government schemes and initiatives designed to benefit citizens
      </p>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemes.map(scheme => (
          <div key={scheme.id} className="bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-3">{scheme.image}</span>
                <div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(scheme.category)}`}>
                    {scheme.category}
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {scheme.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {scheme.description}
              </p>

              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-xs font-semibold text-gray-700">Eligibility:</span>
                  <p className="text-xs text-gray-600">{scheme.eligibility}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-700">Benefits:</span>
                  <p className="text-xs text-gray-600">{scheme.benefits}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none flex-1">
                  Learn More
                </button>
                <button className="btn btn-sm btn-outline btn-sm">
                  Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Resources */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="#" className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <span className="text-2xl mr-3">📋</span>
            <div>
              <h4 className="font-medium text-gray-900">Application Forms</h4>
              <p className="text-sm text-gray-600">Download required forms</p>
            </div>
          </a>
          
          <a href="#" className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <span className="text-2xl mr-3">📞</span>
            <div>
              <h4 className="font-medium text-gray-900">Helpline</h4>
              <p className="text-sm text-gray-600">Get assistance</p>
            </div>
          </a>
          
          <a href="#" className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <span className="text-2xl mr-3">📰</span>
            <div>
              <h4 className="font-medium text-gray-900">News & Updates</h4>
              <p className="text-sm text-gray-600">Latest announcements</p>
            </div>
          </a>
          
          <a href="#" className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <span className="text-2xl mr-3">❓</span>
            <div>
              <h4 className="font-medium text-gray-900">FAQ</h4>
              <p className="text-sm text-gray-600">Common questions</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default InfoHub;
