import React, { ReactNode, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '@/context/AuthContextFirebase';

interface WeatherData {
  location: {
    name: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}

const CardDataStats: React.FC = () => {
  const { user } = useContext(AuthContext);
  const apiKey = '2cbb3a7e734542e4bfe162855232608';
  const [cities, setCities] = useState<string[]>(['São Paulo', 'Rio de Janeiro']);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData>>({});

  useEffect(() => {
    if (user && user.cidade && !cities.includes(user.cidade)) {
      setCities(prevCities => [...prevCities, user.cidade]);
    }
  }, [user]);

  const handleWeather = async (city: string): Promise<void> => {
    try {
      const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;
      const response = await axios.get<WeatherData>(apiUrl);
      setWeatherData(prevWeatherData => ({
        ...prevWeatherData,
        [city]: response.data,
      }));
    } catch (error) {
      console.error('Erro ao buscar dados de tempo para', city, ':', error);
    }
  };

  useEffect(() => {
    cities.forEach(city => {
      handleWeather(city);
    });
  }, []);

  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      {cities.map(city => (
        <div key={city} className="mt-4 flex items-end justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {weatherData[city]?.location.name}
            </h4>
            
          </div>

          {weatherData[city] && (
            <div className="flex items-center gap-1 text-sm font-medium">  

              {/* Ícone e temperatura */}
              <img
                src={weatherData[city].current.condition.icon}
                alt={weatherData[city].current.condition.text}
                className="w-5 h-5"
              />
              <span>{weatherData[city].current.temp_c}°C</span>
            </div>
          )}


        
        </div>
      ))}
    </div>
  );
};

export default CardDataStats;
