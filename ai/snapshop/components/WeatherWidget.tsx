'use client';

import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Zap, Droplets, Wind, Thermometer, Eye } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  icon: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string, iconCode: string) => {
    // Map weather conditions to appropriate icons
    if (iconCode.includes('01d') || iconCode.includes('01n')) {
      return <Sun className="w-8 h-8 text-yellow-400" />;
    } else if (iconCode.includes('02d') || iconCode.includes('02n')) {
      return <Cloud className="w-8 h-8 text-gray-400" />;
    } else if (iconCode.includes('03d') || iconCode.includes('03n') || iconCode.includes('04d') || iconCode.includes('04n')) {
      return <Cloud className="w-8 h-8 text-gray-500" />;
    } else if (iconCode.includes('09d') || iconCode.includes('09n') || iconCode.includes('10d') || iconCode.includes('10n')) {
      return <CloudRain className="w-8 h-8 text-blue-400" />;
    } else if (iconCode.includes('11d') || iconCode.includes('11n')) {
      return <Zap className="w-8 h-8 text-yellow-500" />;
    } else if (iconCode.includes('13d') || iconCode.includes('13n')) {
      return <CloudSnow className="w-8 h-8 text-blue-200" />;
    } else if (iconCode.includes('50d') || iconCode.includes('50n')) {
      return <Eye className="w-8 h-8 text-gray-300" />;
    }
    return <Sun className="w-8 h-8 text-yellow-400" />;
  };

  // Get weather description based on condition
  const getWeatherDescription = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear')) return 'Clear skies';
    if (conditionLower.includes('clouds')) return 'Cloudy';
    if (conditionLower.includes('rain')) return 'Rainy';
    if (conditionLower.includes('snow')) return 'Snowy';
    if (conditionLower.includes('thunderstorm')) return 'Thunderstorms';
    if (conditionLower.includes('drizzle')) return 'Drizzle';
    if (conditionLower.includes('mist') || conditionLower.includes('fog')) return 'Misty';
    return condition;
  };

  // Fetch weather data based on user's location
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's location using browser geolocation API
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by your browser');
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          });
        });

        const { latitude, longitude } = position.coords;

        // Use OpenWeatherMap API to get weather data
        // Note: In a real implementation, you would use an environment variable for the API key
        // For now, we'll simulate the data
        const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'YOUR_API_KEY_HERE';
        
        // Simulate API call with mock data for demonstration
        // In a real implementation, uncomment the following code:
        /*
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
          throw new Error('Weather data unavailable');
        }
        
        const data = await response.json();
        
        const weatherData: WeatherData = {
          location: data.name,
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          visibility: data.visibility ? Math.round(data.visibility / 1000) : 10, // Convert to km
          icon: data.weather[0].icon
        };
        */

        // Mock data for demonstration purposes
        const weatherData: WeatherData = {
          location: 'Current Location',
          temperature: 22,
          feelsLike: 24,
          condition: 'Clear',
          humidity: 65,
          windSpeed: 12,
          visibility: 10,
          icon: '01d'
        };

        setWeather(weatherData);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError(err instanceof Error ? err.message : 'Failed to get weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-300 flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
        <span>Loading weather...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="text-sm text-gray-300 flex items-center gap-2">
        <Cloud className="w-4 h-4 text-gray-500" />
        <span>Weather unavailable</span>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-300 flex items-center gap-2">
      <Sun className="w-4 h-4 text-yellow-400" />
      <span>{weather.temperature}°C • {getWeatherDescription(weather.condition)}</span>
    </div>
  );
}
