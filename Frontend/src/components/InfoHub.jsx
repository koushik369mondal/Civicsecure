import React, { useMemo, useState } from "react";
import Layout from "./Layout";

function InfoHub() {
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Data
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
                benefits:
                    "Digital infrastructure, online services, digital literacy",
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

    const filtered = selectedCategory === "All"
        ? schemes
        : schemes.filter((s) => s.category === selectedCategory);

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

    return (
        <Layout>
            <div className="space-y-8 w-full max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Information Hub
                        </h1>
                        <p className="text-gray-700 text-base">
                            Explore government schemes and initiatives designed to benefit citizens
                        </p>
                    </div>
                </div>

            {/* Category filter card (same card style as Dashboard) */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6">
                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map((c) => {
                            const active = selectedCategory === c;
                            return (
                                <button
                                    key={c}
                                    onClick={() => setSelectedCategory(c)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${active
                                            ? "bg-green-600 text-white shadow-sm"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {c}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Schemes grid (balanced heights via flex-col + mt-auto) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((s) => (
                    <div
                        key={s.id}
                        className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                    >
                        <div className="p-6 h-full flex flex-col">
                            {/* Top row: icon left, badge right to align across cards */}
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

                            {/* Title */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {s.title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                {s.description}
                            </p>

                            {/* Meta */}
                            <div className="space-y-2 mb-4">
                                <div>
                                    <span className="text-xs font-semibold text-gray-700">
                                        Eligibility:
                                    </span>
                                    <p className="text-xs text-gray-600">{s.eligibility}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-700">
                                        Benefits:
                                    </span>
                                    <p className="text-xs text-gray-600">{s.benefits}</p>
                                </div>
                            </div>

                            {/* Actions pinned to bottom so buttons align in each row */}
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

            {/* Additional Resources card (keeps same card style and spacing) */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Additional Resources
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                icon: "📋",
                                title: "Application Forms",
                                sub: "Download required forms",
                            },
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
            </div>
        </Layout>
    );
}

export default InfoHub;
