"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Sparkles, Scan, X, History as HistoryIcon } from "lucide-react";
import Link from "next/link";
import CameraCapture from "@/components/CameraCapture";
import ProductCard from "@/components/ProductCard";

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
  const [state, setState] = useState<AppState>("idle");
  const [mode, setMode] = useState<AppMode>("shop");
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [region, setRegion] = useState<string>("US");

  useEffect(() => {
    // 1. API Key Setup
    const key = localStorage.getItem("gemini_api_key");
    if (key) {
      setApiKey(key);
    } else {
      setApiKey("AIzaSyBNW_BnBJSPXSGlh-Gy9uah5xt5nFCNEiw");
      localStorage.setItem("gemini_api_key", "AIzaSyBNW_BnBJSPXSGlh-Gy9uah5xt5nFCNEiw");
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

  const handleCapture = async (imageSrc: string) => {
    try {
      // 1. Resize for UI/Analysis (Speed up Gemini Upload)
      const optimizedImage = await resizeImage(imageSrc, 800);
      setImage(optimizedImage);
      setState("analyzing");

      const storedKey = localStorage.getItem("gemini_api_key");
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

      let prompt = "";
      if (mode === "shop") {
        prompt = `Analyze this image and identify the main product.
        Also recommend 3 similar or alternative specific products that a user might be interested in.

        Return ONLY a JSON object with these fields:
        - productName: Short, precise search term for the main item
        - searchQuery: The best Amazon search query for the main item
        - category: Broad category (e.g. "Electronics")
        - priceEstimate: Rough estimate in ${currency} (e.g. "${currency}50-100")
        - reason: 1 short sentence on why this is the likely match.
        - confidence: 0.0 to 1.0 confidence score
        - similarProducts: Array of 3 objects, each containing:
            - name: Specific brand/model name of the similar product
            - price: Estimated price string (e.g. "${currency}45")
            - type: Short label (e.g. "Cheaper Option", "Premium Upgrade", "Best Seller")
            - reason: 1 short sentence on why you recommend this.
            - asin: A likely ASIN (Amazon Standard Identification Number) for this specific product (e.g. "B08N5LLDSG"). Try your best to guess a valid one for the region.`;
      } else {
        prompt = `Analyze this selfie for skin condition and makeup tone. 
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
      }

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

      setResult({ ...data, userTag: storedTag });

      // 2. Create tiny thumbnail for History (Save LocalStorage space)
      const historyThumbnail = await resizeImage(imageSrc, 150);
      saveToHistory(historyThumbnail, { ...data, userTag: storedTag });

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
          <span className="font-bold text-xl tracking-tighter">SnapShop</span>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
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
            className="flex flex-col items-center justify-center h-screen p-6 text-center space-y-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black -z-10" />

            {/* Tab Switcher */}
            <div className="flex glass p-1 rounded-full border border-white/20">
              <button
                onClick={() => setMode("shop")}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${mode === "shop" ? "bg-amber-500 text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                🛍️ Shop
              </button>
              <button
                onClick={() => setMode("skin")}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${mode === "skin" ? "bg-pink-500 text-black shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                ✨ Skin Analysis
              </button>
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
              <span className="text-sm font-medium">📁 {mode === "shop" ? "Upload Image" : "Upload Selfie"}</span>
            </label>

            <div>
              <h1 className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r transition-all ${mode === "shop" ? "from-orange-400 to-white" : "from-pink-400 to-rose-200"
                }`}>
                {mode === "shop" ? "Snap & Shop" : "Smart Skin Scan"}
              </h1>
              <p className="text-gray-400 mt-2">
                {mode === "shop"
                  ? "Find any product on Amazon instantly."
                  : "AI-powered skin analysis & recommendations."}
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
              <h2 className="text-2xl font-bold text-white text-glow">The Eye is Seeing...</h2>
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
              Scan Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
