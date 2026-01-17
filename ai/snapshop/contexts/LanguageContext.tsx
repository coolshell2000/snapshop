"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, detectSystemLanguage, getTranslation } from '@/lib/translations';

interface LanguageContextType {
    primaryLang: Language;
    secondaryLang: Language | null;
    currentLang: Language;
    setPrimaryLang: (lang: Language) => void;
    setSecondaryLang: (lang: Language | null) => void;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [primaryLang, setPrimaryLangState] = useState<Language>('en');
    const [secondaryLang, setSecondaryLangState] = useState<Language | null>(null);
    const [currentLang, setCurrentLang] = useState<Language>('en');

    useEffect(() => {
        // Load from localStorage or detect system language
        const storedPrimary = localStorage.getItem('primary_language') as Language;
        const storedSecondary = localStorage.getItem('secondary_language') as Language | null;

        if (storedPrimary) {
            setPrimaryLangState(storedPrimary);
            setCurrentLang(storedPrimary);
        } else {
            const detected = detectSystemLanguage();
            setPrimaryLangState(detected);
            setCurrentLang(detected);
            localStorage.setItem('primary_language', detected);
        }

        if (storedSecondary) {
            setSecondaryLangState(storedSecondary);
        }
    }, []);

    const setPrimaryLang = (lang: Language) => {
        setPrimaryLangState(lang);
        setCurrentLang(lang);
        localStorage.setItem('primary_language', lang);
    };

    const setSecondaryLang = (lang: Language | null) => {
        setSecondaryLangState(lang);
        if (lang) {
            localStorage.setItem('secondary_language', lang);
        } else {
            localStorage.removeItem('secondary_language');
        }
    };

    const toggleLanguage = () => {
        if (secondaryLang) {
            setCurrentLang(currentLang === primaryLang ? secondaryLang : primaryLang);
        } else {
            // If no secondary language is set, navigate to settings to select one
            if (typeof window !== 'undefined') {
                window.location.href = '/settings';
            }
        }
    };

    const t = (key: string) => getTranslation(currentLang, key);

    return (
        <LanguageContext.Provider value={{
            primaryLang,
            secondaryLang,
            currentLang,
            setPrimaryLang,
            setSecondaryLang,
            toggleLanguage,
            t,
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
