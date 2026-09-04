import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CountryOption, 
  ProvinceStateOption, 
  CityTownOption, 
  GLOBAL_COUNTRIES_DATA, 
  getJurisdictionByCode 
} from '../services/jurisdictionsData';
import { PropertyRecord } from '../types';

interface JurisdictionContextType {
  countries: CountryOption[];
  currentCountry: CountryOption;
  currentProvince: ProvinceStateOption;
  currentCity: CityTownOption;
  availableProvinces: ProvinceStateOption[];
  availableCities: CityTownOption[];
  currentProperties: PropertyRecord[];
  currencySymbol: string;
  currencyCode: string;
  language: string;
  theme: string;
  landRegistryAuthority: string;
  legalIdentifierName: string;
  selectCountry: (countryId: string) => void;
  selectProvince: (provinceId: string) => void;
  selectCity: (cityId: string) => void;
  setFullJurisdiction: (countryId: string, provinceId: string, cityId: string) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: string) => void;
}

const JurisdictionContext = createContext<JurisdictionContextType | undefined>(undefined);

export const JurisdictionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to South Africa -> Western Cape -> Cape Town
  const [countryId, setCountryId] = useState<string>(() => localStorage.getItem('ptah_country') || 'ZA');
  const [provinceId, setProvinceId] = useState<string>(() => localStorage.getItem('ptah_province') || 'WC');
  const [cityId, setCityId] = useState<string>(() => localStorage.getItem('ptah_city') || 'CPT');
  const [language, setLanguage] = useState<string>(() => localStorage.getItem('ptah_language') || navigator.language || 'en-ZA');
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('ptah_theme') || 'system');

  useEffect(() => {
    localStorage.setItem('ptah_country', countryId);
    localStorage.setItem('ptah_province', provinceId);
    localStorage.setItem('ptah_city', cityId);
    localStorage.setItem('ptah_currency', country.currency.code);
  }, [countryId, provinceId, cityId]);

  useEffect(() => {
    localStorage.setItem('ptah_language', language);
    document.documentElement.lang = language;
    window.dispatchEvent(new CustomEvent('ptah-language-changed', { detail: language }));
  }, [language]);

  useEffect(() => {
    const resolvedTheme = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'onyx' : 'emerald')
      : theme;
    localStorage.setItem('ptah_theme', theme);
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.classList.toggle('dark', resolvedTheme === 'onyx');
  }, [theme]);

  const { country, province, city } = getJurisdictionByCode(countryId, provinceId, cityId);

  const availableProvinces = country.provinces;
  const availableCities = province.cities;

  const selectCountry = (newCountryId: string) => {
    const targetCountry = GLOBAL_COUNTRIES_DATA.find(c => c.id === newCountryId) || GLOBAL_COUNTRIES_DATA[0];
    const defaultProv = targetCountry.provinces[0];
    const defaultCity = defaultProv.cities[0];
    setCountryId(targetCountry.id);
    setProvinceId(defaultProv.id);
    setCityId(defaultCity.id);
  };

  const selectProvince = (newProvinceId: string) => {
    const targetProv = availableProvinces.find(p => p.id === newProvinceId) || availableProvinces[0];
    const defaultCity = targetProv.cities[0];
    setProvinceId(targetProv.id);
    setCityId(defaultCity.id);
  };

  const selectCity = (newCityId: string) => {
    const targetCity = availableCities.find(c => c.id === newCityId) || availableCities[0];
    setCityId(targetCity.id);
  };

  const setFullJurisdiction = (cId: string, pId: string, ctId: string) => {
    setCountryId(cId);
    setProvinceId(pId);
    setCityId(ctId);
  };

  return (
    <JurisdictionContext.Provider
      value={{
        countries: GLOBAL_COUNTRIES_DATA,
        currentCountry: country,
        currentProvince: province,
        currentCity: city,
        availableProvinces,
        availableCities,
        currentProperties: city.properties,
        currencySymbol: country.currency.symbol,
        currencyCode: country.currency.code,
        language,
        theme,
        landRegistryAuthority: country.landRegistryAuthority,
        legalIdentifierName: country.legalIdentifierName,
        selectCountry,
        selectProvince,
        selectCity,
        setFullJurisdiction,
        setLanguage,
        setTheme
      }}
    >
      {children}
    </JurisdictionContext.Provider>
  );
};

export const useJurisdiction = (): JurisdictionContextType => {
  const context = useContext(JurisdictionContext);
  if (!context) {
    throw new Error('useJurisdiction must be used within a JurisdictionProvider');
  }
  return context;
};
