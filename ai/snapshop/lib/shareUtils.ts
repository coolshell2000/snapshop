import type { ProductResult } from '@/app/page';

/**
 * Format skin analysis results as shareable text
 */
export function formatShareText(
    result: ProductResult,
    options: {
        includeAnalysis: boolean;
        includeProducts: boolean;
        includeBranding: boolean;
    },
    t: (key: string) => string
): string {
    let text = '';

    if (options.includeBranding) {
        text += `✨ ${t('share.title')}\n\n`;
    }

    if (options.includeAnalysis && result.skinAnalysis) {
        const { skinType, undertone, concerns } = result.skinAnalysis;
        text += `🔍 ${t('skin.skinType')}: ${skinType}\n`;
        text += `💡 ${t('skin.undertone')}: ${undertone}\n`;
        text += `⚠️ ${t('skin.concerns')}: ${concerns.join(', ')}\n\n`;
    }

    if (options.includeProducts && result.similarProducts && result.similarProducts.length > 0) {
        text += `💄 ${t('share.recommendedProducts')}:\n`;
        result.similarProducts.forEach((product, index) => {
            text += `${index + 1}. ${product.name} (${product.type})\n`;
        });
        text += '\n';
    }

    if (options.includeBranding) {
        text += `${t('share.tryApp')}: https://snapbeautyshot.app`;
    }

    return text.trim();
}

/**
 * Generate a shareable image using Canvas API
 */
export async function generateShareImage(
    result: ProductResult,
    options: {
        includeImage: boolean;
        includeAnalysis: boolean;
        includeProducts: boolean;
        includeBranding: boolean;
    },
    imageSrc: string | null,
    t: (key: string) => string
): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Canvas not supported');
    }

    // Set canvas size (Instagram-optimized square)
    canvas.width = 1080;
    canvas.height = 1080;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(0.5, '#2d1810');
    gradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add optional selfie image in corner
    if (options.includeImage && imageSrc) {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageSrc;
            });

            // Draw circular image in top-right corner
            const imgSize = 200;
            const imgX = canvas.width - imgSize - 40;
            const imgY = 40;

            ctx.save();
            ctx.beginPath();
            ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
            ctx.restore();
        } catch (error) {
            console.error('Failed to load image:', error);
        }
    }

    // Add branding/logo
    if (options.includeBranding) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 48px system-ui';
        ctx.fillText('✨ SnapBeautyShot', 40, 80);
    }

    let yOffset = options.includeBranding ? 160 : 60;

    // Add skin analysis details
    if (options.includeAnalysis && result.skinAnalysis) {
        const { skinType, undertone, concerns } = result.skinAnalysis;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px system-ui';
        ctx.fillText(t('skin.skinType'), 40, yOffset);
        ctx.font = '32px system-ui';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(skinType, 40, yOffset + 45);

        yOffset += 120;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px system-ui';
        ctx.fillText(t('skin.undertone'), 40, yOffset);
        ctx.font = '32px system-ui';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(undertone, 40, yOffset + 45);

        yOffset += 120;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px system-ui';
        ctx.fillText(t('skin.concerns'), 40, yOffset);
        ctx.font = '28px system-ui';
        ctx.fillStyle = '#d1d5db';

        // Wrap concerns text
        const concernsText = concerns.join(', ');
        const maxWidth = canvas.width - 80;
        const words = concernsText.split(' ');
        let line = '';
        let lineY = yOffset + 45;

        for (const word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line, 40, lineY);
                line = word + ' ';
                lineY += 40;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 40, lineY);
        yOffset = lineY + 80;
    }

    // Add product recommendations
    if (options.includeProducts && result.similarProducts && result.similarProducts.length > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px system-ui';
        ctx.fillText(t('share.recommendedProducts'), 40, yOffset);
        yOffset += 60;

        ctx.font = '28px system-ui';
        result.similarProducts.slice(0, 3).forEach((product, index) => {
            ctx.fillStyle = '#f59e0b';
            ctx.fillText(`${index + 1}.`, 40, yOffset);
            ctx.fillStyle = '#d1d5db';
            ctx.fillText(product.name, 80, yOffset);
            ctx.fillStyle = '#9ca3af';
            ctx.font = '24px system-ui';
            ctx.fillText(product.type, 80, yOffset + 30);
            ctx.font = '28px system-ui';
            yOffset += 80;
        });
    }

    // Add watermark at bottom
    if (options.includeBranding) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '24px system-ui';
        ctx.fillText('snapbeautyshot.app', 40, canvas.height - 40);
    }

    return canvas.toDataURL('image/png');
}

/**
 * Get social media share URLs
 */
export function getSocialShareUrls(text: string) {
    const encodedText = encodeURIComponent(text);
    const appUrl = encodeURIComponent('https://snapbeautyshot.app');

    return {
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${appUrl}&quote=${encodedText}`,
        whatsapp: `https://wa.me/?text=${encodedText}`,
    };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Download image as file
 */
export function downloadImage(dataUrl: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
