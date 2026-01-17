"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Sparkles, Scan, X, History as HistoryIcon, Languages, Download, Smartphone, Apple } from "lucide-react";
import Link from "next/link";
import CameraCapture from "@/components/CameraCapture";
import ProductCard from "@/components/ProductCard";
import ApkInfo from "@/components/ApkInfo";
import { useLanguage } from "@/contexts/LanguageContext";

type AppState = "idle" | "camera" | "analyzing" | "results";
type AppMode = "shop" | "skin";

export interface ProductResult {
  productName: string;
  searchQuery: string;
  category: string;
  priceEstimate: string;
  reason: string;
  confidence: number;
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
    reason: string;
    asin?: string;
  }[];
}

import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Home() {
  const { t, secondaryLang, toggleLanguage, currentLang } = useLanguage();
  const [state, setState] = useState<AppState>("idle");
  const [mode] = useState<AppMode>("skin");
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [region, setRegion] = useState<string>("US");

  useEffect(() => {
    // 1. API Key Setup
    const key = localStorage.getItem("gemini_api_key");
    const defaultKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (key) {
      setApiKey(key);
    } else if (defaultKey) {
      setApiKey(defaultKey);
      localStorage.setItem("gemini_api_key", defaultKey);
    }

    // 2. Region Auto-Detect
    const storedRegion = localStorage.getItem("amazon_region");
    if (storedRegion) {
      setRegion(storedRegion);
    } else {
      // Auto-guess based on timezone
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let guessedRegion = "US";
      if (timeZone.includes("London") || timeZone.includes("Europe/London")) guessedRegion = "UK";
      else if (timeZone.includes("Berlin") || timeZone.includes("Europe/Berlin")) guessedRegion = "DE";
      else if (timeZone.includes("Paris") || timeZone.includes("Europe/Paris")) guessedRegion = "FR";
      else if (timeZone.includes("Tokyo") || timeZone.includes("Asia/Tokyo")) guessedRegion = "JP";
      else if (timeZone.includes("Toronto") || timeZone.includes("Canada")) guessedRegion = "CA";
      else if (timeZone.includes("Sydney") || timeZone.includes("Australia")) guessedRegion = "AU";
      else if (timeZone.includes("Calcutta") || timeZone.includes("Asia/Kolkata")) guessedRegion = "IN";

      setRegion(guessedRegion);
      localStorage.setItem("amazon_region", guessedRegion);
    }
  }, []);

  const saveToHistory = (img: string, res: ProductResult) => {
    try {
      const historyItem = {
        id: Date.now(),
        timestamp: Date.now(),
        image: img,
        result: res
      };
      const history = JSON.parse(localStorage.getItem("snapshop_history") || "[]");
      // Keep last 20
      const updatedHistory = [historyItem, ...history].slice(0, 20);
      localStorage.setItem("snapshop_history", JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Failed to save history:", error);
      // Fallback: Try saving without image if quota exceeded
      try {
        const historyItem = {
          id: Date.now(),
          timestamp: Date.now(),
          image: null,
          result: res
        };
        const history = JSON.parse(localStorage.getItem("snapshop_history") || "[]");
        const updatedHistory = [historyItem, ...history].slice(0, 20);
        localStorage.setItem("snapshop_history", JSON.stringify(updatedHistory));
      } catch (e) {
        console.error("Critical history save failure", e);
      }
    }
  };

  const resizeImage = (base64Str: string, maxWidth = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8)); // Compress to 0.8 quality
      };
    });
  };

  // Function to translate analysis results to the selected language
  const translateSkinResults = async (data: ProductResult, targetLang: string) => {
    try {
      const storedKey = localStorage.getItem("gemini_api_key") || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!storedKey) {
        console.error("No Gemini API key found for translation");
        return data; // Return original data if no API key
      }

      const genAI = new GoogleGenerativeAI(storedKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Prepare the content to translate in a structured way
      const contentToTranslate = {
        productName: data.productName,
        searchQuery: data.searchQuery,
        category: data.category,
        priceEstimate: data.priceEstimate,
        reason: data.reason,
        confidence: data.confidence,
        skinAnalysis: data.skinAnalysis ? {
          skinType: data.skinAnalysis.skinType,
          concerns: data.skinAnalysis.concerns,
          undertone: data.skinAnalysis.undertone,
          advice: data.skinAnalysis.advice
        } : undefined,
        similarProducts: data.similarProducts ? data.similarProducts.map(p => ({
          name: p.name,
          price: p.price,
          type: p.type,
          reason: p.reason
        })) : undefined
      };

      const languageMap: Record<string, string> = {
        'hi': 'Hindi',
        'zh': 'Chinese',
        'fr': 'French',
        'es': 'Spanish',
        'de': 'German'
      };

      const targetLanguage = languageMap[targetLang] || 'English';

      const translationPrompt = `
        Translate the following JSON object to ${targetLanguage}.
        Only translate the text content, keep all other values (numbers, arrays, booleans) unchanged.
        Only return the translated JSON object with the same structure, nothing else.

        Input JSON:
        ${JSON.stringify(contentToTranslate, null, 2)}
      `;

      const result = await model.generateContent(translationPrompt);
      const response = await result.response;
      let translatedText = response.text();

      // Clean up markdown code blocks if present
      translatedText = translatedText.replace(/```json/g, "").replace(/```/g, "").trim();

      // Parse the translated JSON
      const translatedContent = JSON.parse(translatedText);

      // Create the translated result object preserving non-translatable fields
      const translatedData = {
        ...data,
        productName: translatedContent.productName || data.productName,
        searchQuery: translatedContent.searchQuery || data.searchQuery,
        category: translatedContent.category || data.category,
        priceEstimate: translatedContent.priceEstimate || data.priceEstimate,
        reason: translatedContent.reason || data.reason,
        confidence: data.confidence, // Keep original confidence value
        ...(data.skinAnalysis && {
          skinAnalysis: {
            skinType: translatedContent.skinAnalysis?.skinType || data.skinAnalysis.skinType,
            concerns: translatedContent.skinAnalysis?.concerns || data.skinAnalysis.concerns,
            undertone: translatedContent.skinAnalysis?.undertone || data.skinAnalysis.undertone,
            advice: translatedContent.skinAnalysis?.advice || data.skinAnalysis.advice
          }
        }),
        ...(data.similarProducts && {
          similarProducts: data.similarProducts.map((originalProduct, index) => ({
            ...originalProduct,
            name: translatedContent.similarProducts?.[index]?.name || originalProduct.name,
            type: translatedContent.similarProducts?.[index]?.type || originalProduct.type,
            reason: translatedContent.similarProducts?.[index]?.reason || originalProduct.reason
          }))
        })
      };

      return translatedData;
    } catch (error) {
      console.error("Translation failed:", error);
      // Return original data if translation fails
      return data;
    }
  };

  const handleCapture = async (imageSrc: string) => {
    try {
      // 1. Resize for UI/Analysis (Speed up Gemini Upload)
      const optimizedImage = await resizeImage(imageSrc, 800);
      setImage(optimizedImage);
      setState("analyzing");

      const storedKey = localStorage.getItem("gemini_api_key") || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const storedTag = localStorage.getItem("amazon_tag");

      if (!storedKey) {
        alert("Please set your Gemini API Key in Settings first.");
        setState("idle");
        return;
      }

      // --- Client-Side Analysis Logic ---
      const currencyMap: Record<string, string> = {
        "US": "$", "UK": "£", "DE": "€", "FR": "€",
        "JP": "¥", "CA": "C$", "AU": "A$", "IN": "₹"
      };
      const currency = currencyMap[region] || "$";

      // --- Client-Side Analysis Logic ---
      const genAI = new GoogleGenerativeAI(storedKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Respond in ${currentLang === 'en' ? 'English' :
        currentLang === 'hi' ? 'Hindi' :
          currentLang === 'zh' ? 'Chinese' :
            currentLang === 'fr' ? 'French' :
              currentLang === 'es' ? 'Spanish' :
                currentLang === 'de' ? 'German' : 'English'}.

        Analyze this selfie for skin condition and makeup tone.
        Focus on identifying skin type, concerns, and undertone. Recommend 3 relevant skincare or makeup products available on Amazon.
        Be helpful and constructive. DO NOT give medical advice, just general cosmetic observations.

        Return ONLY a JSON object with these fields:
        - productName: "Skin Analysis"
        - searchQuery: "skincare routine"
        - category: "Personal Care"
        - priceEstimate: "Varies"
        - reason: "Analysis based on your selfie"
        - confidence: 0.9
        - skinAnalysis: {
            skinType: "e.g. Oily, Dry, Combination, Sensitive",
            concerns: ["list", "of", "top", "concerns"],
            undertone: "e.g. Warm, Cool, Neutral",
            advice: "Overall summary of advice"
        }
        - similarProducts: Array of 3 objects (skincare/makeup recommendations), each containing:
            - name: Specific brand/model name
            - price: Estimated price string in ${currency}
            - type: Label like "Cleanser", "Moisturizer", "Foundation Match"
            - reason: Why this fits the skin analysis
            - asin: A likely ASIN for the region.`;

      // Helper to strip data:image prefix
      const match = optimizedImage.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      const mimeType = match ? match[1] : "image/jpeg";
      const base64Data = match ? match[2] : optimizedImage;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
      ]);

      const response = await result.response;
      let text = response.text();

      // Clean markdown
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(text);
      // ----------------------------------

      // Translate results if not in English for both shop and skin modes
      let translatedData = { ...data, userTag: storedTag };
      if (currentLang !== 'en') {
        translatedData = await translateSkinResults(data, currentLang);
      }

      setResult(translatedData);

      // 2. Create tiny thumbnail for History (Save LocalStorage space)
      const historyThumbnail = await resizeImage(imageSrc, 150);
      saveToHistory(historyThumbnail, translatedData);

      setState("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to analyze image: ${errorMessage}`);
      setState("idle");
    }
  };

  const reset = () => {
    setState("idle");
    setImage(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Sparkles className="text-amber-500" />
          <span className="font-bold text-xl tracking-tighter">{t('app.title')}</span>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleLanguage}
            className="p-2 glass rounded-full hover:bg-white/20 transition-colors"
            title="Toggle Language"
          >
            <Languages size={20} className="text-amber-500" />
          </button>
          <Link href="/history" className="p-2 glass rounded-full hover:bg-white/20 transition-colors">
            <HistoryIcon size={20} className="text-amber-500" />
          </Link>
          <Link href="/settings" className="p-2 glass rounded-full hover:bg-white/20 transition-colors">
            <Settings size={20} />
          </Link>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-screen p-6 pb-20 text-center space-y-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black -z-10" />

            {/* Mobile App Download Banner - positioned at bottom for non-interference */}
            <div className="absolute bottom-4 right-4 z-50 flex flex-col items-end gap-2">
              <div className="flex gap-2">
                <a
                  href="/SnapShop.apk"
                  download="SnapShop.apk"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold py-2 px-3 rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Smartphone size={14} />
                  <span>Android</span>
                </a>

                <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white text-xs font-bold py-2 px-3 rounded-full shadow-lg shadow-gray-700/20 opacity-70 flex items-center gap-1 cursor-not-allowed">
                  <Apple size={14} />
                  <span>iOS</span>
                </div>
              </div>
              <ApkInfo />
            </div>



            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  mode === "shop" ? "0 0 20px rgba(255,153,0,0.2)" : "0 0 20px rgba(236,72,153,0.2)",
                  mode === "shop" ? "0 0 40px rgba(255,153,0,0.4)" : "0 0 40px rgba(236,72,153,0.4)",
                  mode === "shop" ? "0 0 20px rgba(255,153,0,0.2)" : "0 0 20px rgba(236,72,153,0.2)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-48 h-48 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${mode === "shop"
                ? "bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-amber-500/30"
                : "bg-gradient-to-br from-pink-500/20 to-rose-500/10 border-pink-500/30"
                }`}
              onClick={() => setState("camera")}
            >
              <Scan size={64} className={mode === "shop" ? "text-amber-500" : "text-pink-500"} />
            </motion.div>

            <label className="flex items-center gap-2 glass px-6 py-3 rounded-full text-white cursor-pointer hover:bg-white/20 transition-all">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onClick={(e) => { (e.target as HTMLInputElement).value = "" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleCapture(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <span className="text-sm font-medium">📁 {t('main.upload.selfie')}</span>
            </label>

            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-200">
                {t('main.title.skin')}
              </h1>
              <p className="text-gray-400 mt-2">
                {t('main.subtitle.skin')}
              </p>
            </div>

            {!apiKey && (
              <div className="glass p-3 rounded-lg text-sm text-amber-200 border-amber-500/30">
                ⚠️ API Key missing. Go to settings.
              </div>
            )}
          </motion.div>
        )}

        {state === "camera" && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40"
          >
            <CameraCapture onCapture={handleCapture} />

            {/* File Upload Fallback */}
            <div className="absolute bottom-8 left-8 z-50">
              <label className="flex items-center gap-2 bg-black/50 p-3 rounded-full text-white cursor-pointer hover:bg-black/70 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onClick={(e) => { (e.target as HTMLInputElement).value = "" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleCapture(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <span className="text-sm">📁 Upload</span>
              </label>
            </div>

            <button
              onClick={() => setState("idle")}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white"
            >
              <X />
            </button>
          </motion.div>
        )}

        {state === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-screen bg-black/90 z-50 relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image!} alt="capturing" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-white text-glow">{t('analyzing.title')}</h2>
            </div>
          </motion.div>
        )}

        {state === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 pt-20"
          >
            <ProductCard
              result={result}
              userTag={localStorage.getItem("amazon_tag") || undefined}
              region={region}
              imageSrc={image!}
            />

            <button
              onClick={reset}
              className="mt-8 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <Scan size={16} />
              {t('results.scanAnother')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
