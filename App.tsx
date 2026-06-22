import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Droplets, Thermometer, MapPin, RefreshCw } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { WeatherIcon, getWeatherDescription } from './components/WeatherIcon';
import { cn } from './lib/utils';

interface WeatherData {
  current: {
    temp: number;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
  };
  daily: Array<{
    date: string;
    weatherCode: number;
    tempMax: number;
    tempMin: number;
  }>;
}

export default function App() {
  const [city, setCity] = useState({ name: 'Warszawa', lat: 52.2297, lon: 21.0122 });
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const res = await response.json();
      
      setData({
        current: {
          temp: res.current.temperature_2m,
          weatherCode: res.current.weather_code,
          windSpeed: res.current.wind_speed_10m,
          humidity: res.current.relative_humidity_2m,
        },
        daily: res.daily.time.map((time: string, i: number) => ({
          date: time,
          weatherCode: res.daily.weather_code[i],
          tempMax: res.daily.temperature_2m_max[i],
          tempMin: res.daily.temperature_2m_min[i],
        })),
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city.lat, city.lon);
  }, [city]);

  const getBackgroundClass = (code: number) => {
    if (code === 0) return 'from-blue-400 to-blue-600';
    if (code >= 1 && code <= 3) return 'from-blue-500 to-indigo-600';
    if (code >= 51 && code <= 65) return 'from-gray-600 to-blue-800';
    if (code >= 71 && code <= 77) return 'from-slate-300 to-blue-200';
    return 'from-indigo-700 to-purple-800';
  };

  return (
    <div 
      className={cn(
        "min-h-screen transition-all duration-1000 bg-gradient-to-br flex flex-col p-6 md:p-12 overflow-hidden items-center justify-center",
        data ? getBackgroundClass(data.current.weatherCode) : 'from-blue-500 to-indigo-700'
      )}
    >
      <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />
      
      <div className="w-full max-w-4xl relative z-10 flex flex-col gap-12">
        <header className="flex flex-col items-center gap-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <h1 className="text-white text-5xl font-black tracking-tighter uppercase drop-shadow-lg">
              Pogoda
            </h1>
            <div className="h-1 w-20 bg-white/50 rounded-full" />
          </motion.div>
          <SearchBar onCitySelect={(c) => setCity({ name: c.name, lat: c.latitude, lon: c.longitude })} />
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-20"
            >
              <RefreshCw className="h-12 w-12 text-white animate-spin opacity-50" />
            </motion.div>
          ) : data && (
            <motion.main
              key="content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] p-8 md:p-12 flex flex-col justify-between shadow-2xl overflow-hidden relative group">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-semibold tracking-widest uppercase">{city.name}</span>
                  </div>
                  <h2 className="text-white text-8xl font-thin tracking-tighter flex items-start">
                    {Math.round(data.current.temp)}
                    <span className="text-4xl mt-4">°</span>
                  </h2>
                  <p className="text-white/90 text-2xl font-light">
                    {getWeatherDescription(data.current.weatherCode)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-12">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-white/60">
                      <Wind className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Wiatr</span>
                    </div>
                    <span className="text-white font-medium">{data.current.windSpeed} <span className="text-xs opacity-60">km/h</span></span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-white/60">
                      <Droplets className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Wilgoć</span>
                    </div>
                    <span className="text-white font-medium">{data.current.humidity}<span className="text-xs opacity-60">%</span></span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-white/60">
                      <Thermometer className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Odczuwalna</span>
                    </div>
                    <span className="text-white font-medium">{Math.round(data.current.temp)}<span className="text-xs font-light ml-1 opacity-60">°C</span></span>
                  </div>
                </div>

                <WeatherIcon 
                  code={data.current.weatherCode} 
                  className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:text-white/10 transition-colors rotate-12" 
                />
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] ml-2">Prognoza na 7 dni</h3>
                <div className="grid grid-cols-1 gap-3">
                  {data.daily.map((day, i) => (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between transition-colors cursor-default"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-white/60 text-xs font-medium w-8">
                          {i === 0 ? 'Dziś' : new Intl.DateTimeFormat('pl-PL', { weekday: 'short' }).format(new Date(day.date))}
                        </span>
                        <WeatherIcon code={day.weatherCode} className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="text-white font-semibold w-8 text-right">{Math.round(day.tempMax)}°</span>
                        <div className="h-1 w-12 bg-white/20 rounded-full overflow-hidden relative">
                           <div className="absolute inset-y-0 bg-white/40 rounded-full" style={{ left: '20%', right: '20%' }} />
                        </div>
                        <span className="text-white/40 font-medium w-8">{Math.round(day.tempMin)}°</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}