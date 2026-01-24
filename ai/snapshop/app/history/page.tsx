"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Trash2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { ProductResult } from "@/app/page";

interface HistoryItem {
    id: number;
    timestamp: number;
    image: string | null;
    result: ProductResult;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("snapshop_history");
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const clearHistory = () => {
        if (confirm("Are you sure you want to clear all history?")) {
            localStorage.removeItem("snapshop_history");
            setHistory([]);
        }
    };

    const deleteItem = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        const updated = history.filter(item => item.id !== id);
        setHistory(updated);
        localStorage.setItem("snapshop_history", JSON.stringify(updated));
        if (selectedItem?.id === id) setSelectedItem(null);
    };

    const formatDate = (ts: number) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        }).format(new Date(ts));
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 pt-[calc(1rem+env(safe-area-inset-top))]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pt-2">
                <Link href="/" className="p-2 glass rounded-full hover:bg-white/20 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold">History</h1>
                {history.length > 0 ? (
                    <button
                        onClick={clearHistory}
                        className="p-2 glass rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    >
                        <Trash2 size={20} />
                    </button>
                ) : <div className="w-9" />}
            </div>

            {selectedItem ? (
                // Detailed View
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <button
                        onClick={() => setSelectedItem(null)}
                        className="mb-4 text-sm text-gray-400 hover:text-white flex items-center gap-2"
                    >
                        <ArrowLeft size={16} /> Back to list
                    </button>
                    <div className="flex justify-center">
                        <ProductCard
                            result={selectedItem.result}
                            imageSrc={selectedItem.image || "/placeholder.png"}
                            region={localStorage.getItem("amazon_region") || "US"}
                        />
                    </div>
                </div>
            ) : (
                // List View
                <div className="space-y-3">
                    {history.length === 0 && (
                        <div className="text-center text-gray-500 py-20">
                            <Clock size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No scans yet.</p>
                        </div>
                    )}

                    {history.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="glass rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors active:scale-[0.99]"
                        >
                            {/* Thumbnail */}
                            <div className="w-16 h-16 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0 border border-white/10">
                                {item.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={item.image} alt="scan" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <ScanIcon size={20} />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-white truncate">{item.result.productName}</h3>
                                    <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap ml-2">{formatDate(item.timestamp)}</span>
                                </div>
                                <p className="text-xs text-amber-500 mb-1">{item.result.category}</p>
                                <p className="text-xs text-gray-400 truncate">{item.result.reason}</p>
                            </div>

                            <button
                                onClick={(e) => deleteItem(e, item.id)}
                                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ScanIcon({ size }: { size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        </svg>
    );
}
