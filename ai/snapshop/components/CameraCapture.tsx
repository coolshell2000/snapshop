"use client";

import { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import { Camera, SwitchCamera } from "lucide-react";
import { motion } from "framer-motion";

interface CameraCaptureProps {
    onCapture: (imageSrc: string) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
    const webcamRef = useRef<Webcam>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            onCapture(imageSrc);
        } else {
            console.error("Webcam returned null screenshot");
            alert("Failed to capture image. Camera might be initializing or blocked.");
        }
    }, [webcamRef, onCapture]);

    const toggleCamera = () => {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    };

    const [error, setError] = useState<string | null>(null);

    const handleError = (error: string | DOMException) => {
        console.error("Camera Error:", error);
        setError("Camera access failed. Check permissions or try HTTPS.");
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-full bg-black text-white p-6 text-center">
                <div>
                    <p className="text-red-500 font-bold mb-2">Camera Error</p>
                    <p className="text-sm text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                onUserMediaError={handleError}
                videoConstraints={{
                    facingMode: facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                }}
                className="w-full h-full object-cover"
            />

            {/* Overlay UI */}
            <div className="absolute bottom-10 flex items-center justify-center gap-8 w-full z-20">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleCamera}
                    className="p-4 rounded-full bg-white/20 backdrop-blur-md text-white"
                >
                    <SwitchCamera size={24} />
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={capture}
                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 backdrop-blur-sm"
                >
                    <div className="w-16 h-16 bg-white rounded-full" />
                </motion.button>

                <div className="w-12" /> {/* Spacer for balance */}
            </div>

            {/* Grid Overlay for aiming */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-white/30" />
                    ))}
                </div>
            </div>
        </div>
    );
}
