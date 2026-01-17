"use client";

import { motion } from "framer-motion";
import { ShoppingCart, ExternalLink, Volume2 } from "lucide-react";
import { Browser } from '@capacitor/browser';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductCardProps {
    result: {
        productName: string;
        searchQuery: string;
        category: string;
        priceEstimate: string;
        confidence: number;
        reason?: string;
        skinAnalysis?: {
            skinType: string;
            concerns: string[];
            undertone: string;
            advice: string;
        };
        similarProducts?: {
            name: string;
            price: string;
            type: string;
            reason?: string;
            asin?: string;
        }[];
    };
    imageSrc: string;
    userTag?: string;
    region?: string;
}

import { Sparkles, BrainCircuit, Droplets } from "lucide-react";

const REGION_DOMAINS: Record<string, string> = {
    "US": "amazon.com",
    "UK": "amazon.co.uk",
    "DE": "amazon.de",
    "FR": "amazon.fr",
    "JP": "amazon.co.jp",
    "CA": "amazon.ca",
    "AU": "amazon.com.au",
    "IN": "amazon.in",
};

const openExternalLink = async (url: string) => {
    try {
        // For Amazon Associate compliance, we need to open the URL in the default browser
        // which will automatically redirect to the Amazon app if installed
        // This ensures the associate tag is properly tracked
        window.open(url, '_system');
    } catch (error) {
        // Fallback for web (non-Capacitor environment)
        window.open(url, '_blank', 'noopener,noreferrer');
    }
};

// Function to speak skin analysis details
const speakSkinAnalysisDetails = (skinAnalysis: {
    skinType: string;
    concerns: string[];
    undertone: string;
    advice: string;
}, currentLang: string, t: (key: string) => string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const langMap: Record<string, string> = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'zh': 'zh-CN',
        'fr': 'fr-FR',
        'es': 'es-ES',
        'de': 'de-DE',
    };

    const utteranceLang = langMap[currentLang] || 'en-US';

    // Construct the text to speak
    const text = `${t('skin.skinType')}: ${skinAnalysis.skinType}. ${t('skin.undertone')}: ${skinAnalysis.undertone}. ${t('skin.concerns')}: ${skinAnalysis.concerns.join(', ')}. ${t('skin.advice')}: ${skinAnalysis.advice}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = utteranceLang;

    window.speechSynthesis.speak(utterance);
};

export default function ProductCard({ result, imageSrc, userTag = "bt200008-21", region = "US" }: ProductCardProps) {
    const domain = REGION_DOMAINS[region] || "amazon.com";
    const amazonUrl = `https://www.${domain}/s?k=${encodeURIComponent(result.searchQuery)}&tag=${userTag}`;
    const { t, currentLang } = useLanguage();

    return (
        <div className="w-full max-w-sm space-y-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full glass rounded-2xl overflow-hidden shadow-2xl border-t border-white/20"
            >
                <div className="relative h-64 w-full bg-black/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageSrc}
                        alt="Product"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-amber-300 border border-amber-500/30">
                        {(result.confidence * 100).toFixed(0)}% Match
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <div className="text-xs text-amber-500 font-bold tracking-wider uppercase mb-1">
                            {result.category}
                        </div>
                        <h2 className="text-2xl font-bold leading-tight">{result.productName}</h2>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400 border-y border-white/10 py-3">
                        <span>Est. Price</span>
                        <span className="text-white font-medium">{result.priceEstimate}</span>
                    </div>

                    {result.reason && (
                        <p className="text-sm text-gray-300 italic bg-white/5 p-3 rounded-lg border border-white/5">
                            &quot;{result.reason}&quot;
                        </p>
                    )}

                    {result.skinAnalysis && (
                        <div className="space-y-4 animate-in fade-in duration-500">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-amber-500">
                                    <BrainCircuit size={18} />
                                    <span className="font-bold text-sm uppercase tracking-wider">{t('skin.insights')}</span>
                                </div>
                                <button
                                    onClick={() => result.skinAnalysis && speakSkinAnalysisDetails(result.skinAnalysis, currentLang, t)}
                                    className="p-2 rounded-full transition-colors bg-white/5 text-amber-500 hover:bg-white/10"
                                    title={t('skin.readAloud')}
                                >
                                    <Volume2 size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t('skin.skinType')}</div>
                                    <div className="text-sm text-white font-medium">{result.skinAnalysis.skinType}</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">{t('skin.undertone')}</div>
                                    <div className="text-sm text-white font-medium">{result.skinAnalysis.undertone}</div>
                                </div>
                            </div>

                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">{t('skin.concerns')}</div>
                                <div className="flex flex-wrap gap-2">
                                    {result.skinAnalysis.concerns.map((concern, i) => (
                                        <span key={i} className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full border border-amber-500/20">
                                            {concern}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                                <div className="flex items-center gap-2 text-amber-500 mb-2">
                                    <Droplets size={16} />
                                    <span className="text-xs font-bold uppercase">{t('skin.advice')}</span>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                    {result.skinAnalysis.advice}
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => openExternalLink(amazonUrl)}
                        className="w-full bg-[#FF9900] text-black font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                        <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" />
                        {result.skinAnalysis ? t('results.browseSkin') : t('results.shopAmazon')}
                    </button>
                </div>
            </motion.div>

            {/* Similar Products Section */}
            {result.similarProducts && result.similarProducts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full"
                >
                    <div className="flex items-center gap-2 mb-2 px-2">
                        <span className="text-sm font-bold text-gray-300">{t('results.similarProducts')}</span>
                    </div>
                    <div className="space-y-4">
                        {result.similarProducts.map((item, idx) => {
                            const productUrl = `https://www.${domain}/s?k=${encodeURIComponent(item.name)}&tag=${userTag}`;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => openExternalLink(productUrl)}
                                    className="block p-3 glass rounded-xl hover:bg-white/10 transition-colors border border-white/5 active:scale-[0.98] cursor-pointer"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-20 h-20 rounded-lg bg-black/40 overflow-hidden border border-white/10 shrink-0 relative">
                                            {/* Try Amazon Image first via ASIN, Fallback to AI Generation */}
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.asin ? `https://images-na.ssl-images-amazon.com/images/P/${item.asin}.01._SS200_.jpg` : `https://image.pollinations.ai/prompt/${encodeURIComponent(item.name)}?width=160&height=160&nologo=true&seed=${idx}`}
                                                onError={(e) => {
                                                    // Fallback to AI image if Amazon image fails (404)
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null; // Prevent loop
                                                    target.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(item.name)}?width=160&height=160&nologo=true&seed=${idx}`;
                                                }}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{item.type}</span>
                                            </div>
                                            <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 mb-1">{item.name}</h3>
                                            <p className="text-sm text-gray-400">Est. {item.price}</p>
                                        </div>
                                        <div className="p-2 bg-white/5 rounded-full text-gray-400 self-center">
                                            <ShoppingCart size={16} />
                                        </div>
                                    </div>
                                    {item.reason && (
                                        <p className="mt-3 text-xs text-gray-400 italic pl-1 border-l-2 border-white/10 ml-2">
                                            &quot;{item.reason}&quot;
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
