"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Key, Tag, Languages, Download, Smartphone, Apple } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES, Language, detectSystemLanguage } from "@/lib/translations";

const REGIONS = [
    { code: "US", name: "United States (.com)", domain: "amazon.com", currency: "$" },
    { code: "UK", name: "United Kingdom (.co.uk)", domain: "amazon.co.uk", currency: "£" },
    { code: "DE", name: "Germany (.de)", domain: "amazon.de", currency: "€" },
    { code: "FR", name: "France (.fr)", domain: "amazon.fr", currency: "€" },
    { code: "JP", name: "Japan (.co.jp)", domain: "amazon.co.jp", currency: "¥" },
    { code: "CA", name: "Canada (.ca)", domain: "amazon.ca", currency: "C$" },
    { code: "AU", name: "Australia (.com.au)", domain: "amazon.com.au", currency: "A$" },
    { code: "IN", name: "India (.in)", domain: "amazon.in", currency: "₹" },
];

export default function SettingsPage() {
    const router = useRouter();
    const { primaryLang, secondaryLang, setPrimaryLang, setSecondaryLang, t } = useLanguage();
    const [apiKey, setApiKey] = useState("");
    const [amazonTag, setAmazonTag] = useState("");
    const [region, setRegion] = useState("US");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedKey = localStorage.getItem("gemini_api_key");
        const storedTag = localStorage.getItem("amazon_tag");
        const storedRegion = localStorage.getItem("amazon_region");

        if (storedKey) setApiKey(storedKey);
        if (storedTag) setAmazonTag(storedTag);

        if (storedRegion) {
            setRegion(storedRegion);
        } else {
            // Guess region based on timezone/locale
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (timeZone.includes("London") || timeZone.includes("Europe/London")) setRegion("UK");
            else if (timeZone.includes("Berlin") || timeZone.includes("Europe/Berlin")) setRegion("DE");
            else if (timeZone.includes("Paris") || timeZone.includes("Europe/Paris")) setRegion("FR");
            else if (timeZone.includes("Tokyo") || timeZone.includes("Asia/Tokyo")) setRegion("JP");
            else if (timeZone.includes("Toronto") || timeZone.includes("Vancouver") || timeZone.includes("America/Toronto")) setRegion("CA");
            else if (timeZone.includes("Sydney") || timeZone.includes("Australia")) setRegion("AU");
            else if (timeZone.includes("Calcutta") || timeZone.includes("Asia/Kolkata")) setRegion("IN");
            // Default to US otherwise
        }

        setIsLoading(false);
    }, []);

    // Initialize language settings with system language as default
    useEffect(() => {
        if (!isLoading) {
            const detectedLang = detectSystemLanguage();
            const storedPrimary = localStorage.getItem('primary_language') as Language;
            const storedSecondary = localStorage.getItem('secondary_language') as Language | null;

            if (!storedPrimary) {
                setPrimaryLang(detectedLang);
            }

            if (storedSecondary) {
                setSecondaryLang(storedSecondary);
            }
        }
    }, [isLoading]);

    const handleSave = () => {
        try {
            localStorage.setItem("gemini_api_key", apiKey);
            localStorage.setItem("amazon_tag", amazonTag);
            localStorage.setItem("amazon_region", region);
            alert("Settings saved successfully!");
            router.push("/");
        } catch (e) {
            console.error(e);
            alert("Failed to save settings.");
        }
    };

    if (isLoading) return <div className="min-h-screen bg-black text-white p-6">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black -z-10" />

            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 glass rounded-full hover:bg-white/20 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold">Settings</h1>
            </div>

            <div className="space-y-6 max-w-md mx-auto">
                {/* Gemini API Key Section */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-400 ml-1">Google Gemini API Key</label>
                    <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                    </div>
                    <p className="text-xs text-gray-500 ml-1">
                        Required for image analysis. Get one for free at <a href="https://aistudio.google.com/app/api-keys" target="_blank" className="text-amber-500 hover:underline">Google AI Studio</a>.
                    </p>
                </div>

                {/* Amazon Associate Tag Section */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-400 ml-1">Amazon Associate Tag</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            value={amazonTag}
                            onChange={(e) => setAmazonTag(e.target.value)}
                            placeholder="store-20"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                    </div>
                    <p className="text-xs text-gray-500 ml-1">
                        Your affiliate tag to earn commissions (optional). Default: bt200008-21
                    </p>
                </div>

                {/* Amazon Region Section */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-400 ml-1">Amazon Region</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                            🌍
                        </div>
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 focus:outline-none focus:border-amber-500 transition-colors appearance-none text-white"
                        >
                            {REGIONS.map((r) => (
                                <option key={r.code} value={r.code} className="bg-gray-900">
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <p className="text-xs text-gray-500 ml-1">
                        Determines which Amazon store to search (e.g. amazon.co.uk).
                    </p>
                </div>

                {/* Language Selection */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                    <h2 className="text-lg font-bold text-amber-500">Language Settings</h2>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">Primary Language</label>
                        <div className="relative">
                            <Languages className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <select
                                value={primaryLang}
                                onChange={(e) => setPrimaryLang(e.target.value as Language)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 focus:outline-none focus:border-amber-500 transition-colors appearance-none text-white"
                            >
                                {Object.entries(LANGUAGES).map(([code, lang]) => (
                                    <option key={code} value={code} className="bg-gray-900">
                                        {lang.flag} {lang.nativeName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">Secondary Language (Optional)</label>
                        <div className="relative">
                            <Languages className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <select
                                value={secondaryLang || ''}
                                onChange={(e) => setSecondaryLang(e.target.value as Language || null)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 focus:outline-none focus:border-amber-500 transition-colors appearance-none text-white"
                            >
                                <option value="" className="bg-gray-900">None</option>
                                {Object.entries(LANGUAGES).map(([code, lang]) => (
                                    <option key={code} value={code} className="bg-gray-900">
                                        {lang.flag} {lang.nativeName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <p className="text-xs text-gray-500 ml-1">
                            Toggle between languages on the main screen
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8"
                >
                    <Save size={20} />
                    {t('settings.save')}
                </button>

                {/* Mobile Apps Download Section */}
                <div className="mt-8 pt-6 border-t border-white/10">
                    <h2 className="text-lg font-bold text-amber-500 mb-3">Download Mobile Apps</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href="/SnapShop.apk"
                            download="SnapShop.apk"
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Smartphone size={20} />
                            Download for Android
                        </a>

                        <div className="w-full bg-gradient-to-r from-gray-600 to-gray-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-gray-700/20 opacity-70 flex items-center justify-center gap-2 cursor-not-allowed">
                            <Apple size={20} />
                            Coming Soon for iOS
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Install on your mobile device directly
                    </p>
                </div>
            </div>
        </div>
    );
}
