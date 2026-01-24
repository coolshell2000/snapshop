"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Download, Copy, Check, Twitter, Facebook, MessageCircle } from 'lucide-react';
import type { ProductResult } from '@/app/page';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    formatShareText,
    generateShareImage,
    getSocialShareUrls,
    copyToClipboard,
    downloadImage,
} from '@/lib/shareUtils';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: ProductResult;
    imageSrc: string;
}

export default function ShareModal({ isOpen, onClose, result, imageSrc }: ShareModalProps) {
    const { t, currentLang } = useLanguage();
    const [includeImage, setIncludeImage] = useState(false); // Privacy: default OFF
    const [includeAnalysis, setIncludeAnalysis] = useState(true);
    const [includeProducts, setIncludeProducts] = useState(true);
    const [includeBranding, setIncludeBranding] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleNativeShare = async () => {
        try {
            const text = formatShareText(
                result,
                { includeAnalysis, includeProducts, includeBranding },
                t
            );

            // Check if we're in Capacitor (mobile)
            if ((window as any).Capacitor) {
                const { Share } = await import('@capacitor/share');
                await Share.share({
                    title: t('share.title'),
                    text: text,
                    dialogTitle: t('share.shareVia'),
                });
            } else if (navigator.share) {
                // Web Share API
                await navigator.share({
                    title: t('share.title'),
                    text: text,
                });
            } else {
                // Fallback: copy to clipboard
                const success = await copyToClipboard(text);
                if (success) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }
            }
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const handleCopyToClipboard = async () => {
        const text = formatShareText(
            result,
            { includeAnalysis, includeProducts, includeBranding },
            t
        );
        const success = await copyToClipboard(text);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadImage = async () => {
        setIsGenerating(true);
        try {
            const imageDataUrl = await generateShareImage(
                result,
                { includeImage, includeAnalysis, includeProducts, includeBranding },
                imageSrc,
                t
            );
            const timestamp = Date.now();
            downloadImage(imageDataUrl, `snapbeautyshot-analysis-${timestamp}.png`);
        } catch (error) {
            console.error('Failed to generate image:', error);
            alert(t('share.imageError'));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSocialShare = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
        const text = formatShareText(
            result,
            { includeAnalysis, includeProducts, includeBranding },
            t
        );
        const urls = getSocialShareUrls(text);
        window.open(urls[platform], '_blank', 'noopener,noreferrer');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Share2 className="text-amber-500" />
                            {t('share.title')}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Privacy Controls */}
                    <div className="mb-6 space-y-3">
                        <h3 className="text-sm font-bold text-gray-400 uppercase">{t('share.privacyControls')}</h3>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeImage}
                                onChange={(e) => setIncludeImage(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-sm">{t('share.includeImage')}</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeAnalysis}
                                onChange={(e) => setIncludeAnalysis(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-sm">{t('share.includeAnalysis')}</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeProducts}
                                onChange={(e) => setIncludeProducts(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-sm">{t('share.includeProducts')}</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeBranding}
                                onChange={(e) => setIncludeBranding(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-sm">{t('share.includeBranding')}</span>
                        </label>
                    </div>

                    {/* Share Options */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-400 uppercase">{t('share.shareOptions')}</h3>

                        {/* Native/Web Share */}
                        <button
                            onClick={handleNativeShare}
                            className="w-full flex items-center gap-3 p-4 glass rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <Share2 className="text-amber-500" size={24} />
                            <span className="font-medium">{t('share.nativeShare')}</span>
                        </button>

                        {/* Download as Image */}
                        <button
                            onClick={handleDownloadImage}
                            disabled={isGenerating}
                            className="w-full flex items-center gap-3 p-4 glass rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
                        >
                            <Download className="text-blue-500" size={24} />
                            <span className="font-medium">
                                {isGenerating ? t('share.generating') : t('share.downloadImage')}
                            </span>
                        </button>

                        {/* Copy to Clipboard */}
                        <button
                            onClick={handleCopyToClipboard}
                            className="w-full flex items-center gap-3 p-4 glass rounded-xl hover:bg-white/10 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="text-green-500" size={24} />
                                    <span className="font-medium text-green-500">{t('share.copied')}</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="text-purple-500" size={24} />
                                    <span className="font-medium">{t('share.copyText')}</span>
                                </>
                            )}
                        </button>

                        {/* Social Media Links */}
                        <div className="grid grid-cols-3 gap-3 pt-3">
                            <button
                                onClick={() => handleSocialShare('twitter')}
                                className="flex flex-col items-center gap-2 p-4 glass rounded-xl hover:bg-white/10 transition-colors"
                            >
                                <Twitter className="text-blue-400" size={24} />
                                <span className="text-xs">Twitter</span>
                            </button>

                            <button
                                onClick={() => handleSocialShare('facebook')}
                                className="flex flex-col items-center gap-2 p-4 glass rounded-xl hover:bg-white/10 transition-colors"
                            >
                                <Facebook className="text-blue-600" size={24} />
                                <span className="text-xs">Facebook</span>
                            </button>

                            <button
                                onClick={() => handleSocialShare('whatsapp')}
                                className="flex flex-col items-center gap-2 p-4 glass rounded-xl hover:bg-white/10 transition-colors"
                            >
                                <MessageCircle className="text-green-500" size={24} />
                                <span className="text-xs">WhatsApp</span>
                            </button>
                        </div>
                    </div>

                    {/* Privacy Notice */}
                    <p className="text-xs text-gray-500 mt-6 text-center">
                        {t('share.privacyNotice')}
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
