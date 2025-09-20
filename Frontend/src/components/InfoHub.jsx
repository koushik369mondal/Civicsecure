import React, { useMemo, useState } from "react";
import { FaQuestionCircle, FaBook, FaExclamationTriangle, FaPhone, FaEnvelope, FaChevronLeft, FaChevronRight, FaInfoCircle } from "react-icons/fa";
import Layout from "./Layout";

// Local images for the carousel
import scheme1 from "../../src/assets/scheme1.png";
import scheme2 from "../../src/assets/scheme2.png";
import scheme3 from "../../src/assets/scheme3.png";

// Carousel schemes (image-based)
const carouselSchemes = [
    {
        id: "c1",
        title: "PM Awas Yojana",
        description: "Affordable housing scheme for all sections of society.",
        image: scheme1,
    },
    {
        id: "c2",
        title: "Digital India",
        description: "Transforming India into a digitally empowered society.",
        image: scheme2,
    },
    {
        id: "c3",
        title: "Skill India Mission",
        description: "Enhancing employability through skill development programs.",
        image: scheme3,
    },
];

// Quick access info cards
const infoCards = [
    {
        icon: FaBook,
        title: "User Guide",
        description:
            "Step-by-step instructions on how to submit complaints, track status, and use all features of CivicSecure.",
        buttonText: "Read Guide",
        color: "bg-blue-50 text-blue-600",
    },
    {
        icon: FaQuestionCircle,
        title: "FAQs",
        description:
            "Find answers to commonly asked questions about the grievance redressal process and platform usage.",
        buttonText: "View FAQs",
        color: "bg-purple-50 text-purple-600",
    },
    {
        icon: FaExclamationTriangle,
        title: "Emergency Protocols",
        description:
            "Important information about what to do in emergency situations and how to quickly get help.",
        buttonText: "Learn More",
        color: "bg-red-50 text-red-600",
    },
];

function InfoHub() {
    const [currentSchemeIndex, setCurrentSchemeIndex] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Rich schemes list (text/emoji based) with metadata
    const schemes = useMemo(
        () => [
            {
                id: 1,
                title: "Pradhan Mantri Awas Yojana",
                description:
                    "Housing for All scheme providing financial assistance to eligible families for construction/purchase of houses.",
                category: "Housing",
                eligibility: "Annual family income below ₹18 lakhs",
                benefits: "Interest subsidy up to ₹2.67 lakhs",
                applyLink: "#",
                image: "🏠",
            },
            {
                id: 2,
                title: "Swachh Bharat Mission",
                description:
                    "Clean India campaign focusing on sanitation, waste management and creating clean cities and villages.",
                category: "Sanitation",
                eligibility: "All citizens can participate",
                benefits: "Cleaner environment, improved public health",
                applyLink: "#",
                image: "🧹",
            },
            {
                id: 3,
                title: "Digital India Initiative",
                description:
                    "Program to transform India into digitally empowered society and knowledge economy.",
                category: "Technology",
                eligibility: "All citizens",
                benefits: "Digital infrastructure, online services, digital literacy",
                applyLink: "#",
                image: "💻",
            },
            {
                id: 4,
                title: "PM-KISAN Scheme",
                description:
                    "Direct income support to farmer families owning cultivable land.",
                category: "Agriculture",
                eligibility: "Small and marginal farmer families",
                benefits: "₹6,000 per year in three installments",
                applyLink: "#",
                image: "🌾",
            },
            {
                id: 5,
                title: "Ayushman Bharat",
                description:
                    "National Health Protection Scheme providing health insurance coverage.",
                category: "Healthcare",
                eligibility: "Socio-economic caste census eligible families",
                benefits: "Health cover up to ₹5 lakhs per family per year",
                applyLink: "#",
                image: "🏥",
            },
            {
                id: 6,
                title: "Make in India",
                description:
                    "Initiative to encourage companies to manufacture products in India.",
                category: "Business",
                eligibility: "Manufacturers and businesses",
                benefits: "Ease of doing business, investment opportunities",
                applyLink: "#",
                image: "🏭",
            },
        ],
        []
    );

    const categories = [
        "All",
        "Housing",
        "Healthcare",
        "Agriculture",
        "Technology",
        "Sanitation",
        "Business",
    ];

    const filtered = selectedCategory === "All" ? schemes : schemes.filter((s) => s.category === selectedCategory);

    const getCategoryColor = (category) => {
        const map = {
            Housing: "bg-blue-500",
            Healthcare: "bg-red-500",
            Agriculture: "bg-green-600",
            Technology: "bg-purple-600",
            Sanitation: "bg-amber-500",
            Business: "bg-indigo-600",
        };
        return map[category] || "bg-gray-500";
    };

    // Carousel logic
    const nextScheme = () => setCurrentSchemeIndex((prev) => (prev + 1) % carouselSchemes.length);
    const prevScheme = () => setCurrentSchemeIndex((prev) => (prev - 1 + carouselSchemes.length) % carouselSchemes.length);
    const getVisibleSchemes = () => {
        const visible = [];
        for (let i = 0; i < 3; i++) {
            visible.push(carouselSchemes[(currentSchemeIndex + i) % carouselSchemes.length]);
        }
        return visible;
    };

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center mb-2">
                    <FaInfoCircle className="text-3xl text-emerald-600 mr-3" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Information Hub</h1>
                        <p className="text-gray-700 text-base">
                            Explore government schemes and platform resources designed to benefit citizens
                        </p>
                    </div>
                </div>

                {/* Government Schemes Carousel */}
                <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Latest Government Schemes & Policies</h2>
                        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-sm transition-colors duration-200">
                            View All
                        </button>
                    </div>

                    <div className="relative">
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={prevScheme}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md transition-colors duration-200 flex items-center justify-center"
                                aria-label="Previous schemes"
                            >
                                <FaChevronLeft />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 max-w-4xl">
                                {getVisibleSchemes().map((scheme, index) => (
                                    <div
                                        key={`${scheme.id}-${index}`}
                                        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden"
                                    >
                                        <img src={scheme.image} alt={scheme.title} className="w-full h-32 object-cover" />
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 text-sm mb-2">{scheme.title}</h3>
                                            <p className="text-gray-600 text-xs">{scheme.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={nextScheme}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md transition-colors duration-200 flex items-center justify-center"
                                aria-label="Next schemes"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 text-sm text-center">
                            <span className="mr-2">💡</span>
                            <strong>Tip:</strong> Stay updated with these schemes to unlock benefits for you and your community!
                        </p>
                    </div>
                </section>

                {/* Category Filter */}
                <section className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="p-6">
                        <div className="flex flex-wrap justify-center gap-2">
                            {categories.map((c) => {
                                const active = selectedCategory === c;
                                return (
                                    <button
                                        key={c}
                                        onClick={() => setSelectedCategory(c)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${active ? "bg-green-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {c}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Schemes Grid with metadata */}
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((s) => (
                            <div
                                key={s.id}
                                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                            >
                                <div className="p-6 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-4xl" aria-hidden>
                                            {s.image}
                                        </span>
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(
                                                s.category
                                            )}`}
                                        >
                                            {s.category}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{s.description}</p>

                                    <div className="space-y-2 mb-4">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-700">Eligibility:</span>
                                            <p className="text-xs text-gray-600">{s.eligibility}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-gray-700">Benefits:</span>
                                            <p className="text-xs text-gray-600">{s.benefits}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex gap-2">
                                        <a
                                            href={s.applyLink || "#"}
                                            className="inline-flex justify-center items-center px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors flex-1"
                                        >
                                            Learn More
                                        </a>
                                        <a
                                            href={s.applyLink || "#"}
                                            className="inline-flex justify-center items-center px-4 py-2 rounded-md border border-green-300 text-gray-900 hover:bg-green-50 hover:border-green-400 text-sm font-medium transition-colors"
                                        >
                                            Apply
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Quick Access Resources */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Access Resources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {infoCards.map((card) => {
                            const IconComponent = card.icon;
                            return (
                                <div
                                    key={card.title}
                                    className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                                >
                                    <div className={`w-16 h-16 rounded-full ${card.color} flex items-center justify-center mb-4 mx-auto`}>
                                        <IconComponent className="text-2xl" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 text-center mb-3">{card.title}</h3>
                                    <p className="text-gray-600 text-sm text-center mb-4 leading-relaxed">{card.description}</p>
                                    <button className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-sm transition-colors duration-200">
                                        {card.buttonText}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Contact Support */}
                <section>
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Support</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                    <FaPhone className="text-lg" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Helpline</h3>
                                    <p className="text-gray-600 text-sm">
                                        1800-XXX-XXXX <span className="text-gray-500">(Toll-free)</span>
                                    </p>
                                    <p className="text-gray-500 text-xs">Available 24/7</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                    <FaEnvelope className="text-lg" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Email Support</h3>
                                    <p className="text-gray-600 text-sm">support@civicsecure.gov.in</p>
                                    <p className="text-gray-500 text-xs">Response within 24 hours</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Additional Help */}
                {/* <section className="mt-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Additional Help?</h3>
                            <p className="text-blue-700 text-sm mb-4">
                                Our support team is here to assist with any questions or concerns about using CivicSecure.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm transition-colors duration-200">
                                    Submit a Support Ticket
                                </button>
                                <button className="px-6 py-2 border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 font-semibold rounded-md transition-colors duration-200">
                                    Live Chat Support
                                </button>
                            </div>
                        </div>
                    </div>
                </section> */}

                {/* Additional Resources */}
                {/* <section>
                    <div className="bg-white rounded-lg shadow-md border border-gray-200">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Resources</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { icon: "📋", title: "Application Forms", sub: "Download required forms" },
                                    { icon: "📞", title: "Helpline", sub: "Get assistance" },
                                    { icon: "📰", title: "News & Updates", sub: "Latest announcements" },
                                    { icon: "❓", title: "FAQ", sub: "Common questions" },
                                ].map((r) => (
                                    <a
                                        key={r.title}
                                        href="#"
                                        className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                                    >
                                        <span className="text-2xl mr-3" aria-hidden>
                                            {r.icon}
                                        </span>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{r.title}</h4>
                                            <p className="text-sm text-gray-600">{r.sub}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </section> */}
            </div>
        </Layout>
    );
}

export default InfoHub;
