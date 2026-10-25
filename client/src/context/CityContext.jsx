import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CityContext = createContext(null);

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState(() => {
    return localStorage.getItem('imovies_city') || 'New York';
  });

  const [cities, setCities] = useState(['New York', 'Los Angeles', 'Chicago']);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get('/theatres/cities');
        if (res.success && res.cities && res.cities.length > 0) {
          setCities(res.cities);
        }
      } catch (e) {
        // Fallback default cities
      }
    };
    fetchCities();
  }, []);

  const setSelectedCity = (city) => {
    setSelectedCityState(city);
    localStorage.setItem('imovies_city', city);
  };

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, cities }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
