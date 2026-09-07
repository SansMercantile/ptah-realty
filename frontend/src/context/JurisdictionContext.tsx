import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CountryOption, 
  ProvinceStateOption, 
  CityTownOption, 
  GLOBAL_COUNTRIES_DATA, 
  getJurisdictionByCode 
} from '../services/jurisdictionsData';
import { getDefaultLanguageCodeForCountry } from '../services/countryLanguages';
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
  landRegistryAuthority: string;
  legalIdentifierName: string;
  language: string;
  setLanguage: (languageCode: string) => void;
  selectCountry: (countryId: string) => void;
  selectProvince: (provinceId: string) => void;
  selectCity: (cityId: string) => void;
  setFullJurisdiction: (countryId: string, provinceId: string, cityId: string) => void;
}

const JurisdictionContext = createContext<JurisdictionContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'ptah_language';
const LANGUAGE_MANUALLY_SET_STORAGE_KEY = 'ptah_language_manually_set';

export const JurisdictionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to South Africa -> Western Cape -> Cape Town
  const [countryId, setCountryId] = useState<string>('ZA');
  const [provinceId, setProvinceId] = useState<string>('WC');
  const [cityId, setCityId] = useState<string>('CPT');

  // Language defaults to the selected country/jurisdiction's own official
  // language (English if it's among them -- see
  // services/countryLanguages.ts) UNLESS the user has explicitly picked
  // a language themselves, in which case that choice sticks regardless
  // of which country gets selected afterward. hasManuallySetLanguage is
  // the flag that distinguishes "still following the country" from
  // "user overrode it" -- both persisted so the override survives a
  // refresh.
  const [language, setLanguageState] = useState<string>(
    () => localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en-ZA'
  );
  const [hasManuallySetLanguage, setHasManuallySetLanguage] = useState<boolean>(
    () => localStorage.getItem(LANGUAGE_MANUALLY_SET_STORAGE_KEY) === 'true'
  );

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const setLanguage = (languageCode: string) => {
    setLanguageState(languageCode);
    setHasManuallySetLanguage(true);
    localStorage.setItem(LANGUAGE_MANUALLY_SET_STORAGE_KEY, 'true');
  };

  const applyCountryLanguageDefault = (newCountryId: string) => {
    if (hasManuallySetLanguage) return; // explicit user choice always wins
    const defaultLanguage = getDefaultLanguageCodeForCountry(newCountryId);
    if (defaultLanguage) setLanguageState(defaultLanguage);
    // If we don't have a UI language for this country yet, leave the
    // current selection alone rather than force a change to something
    // arbitrary/unsupported.
  };

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
    applyCountryLanguageDefault(targetCountry.id);
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
    applyCountryLanguageDefault(cId);
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
        landRegistryAuthority: country.landRegistryAuthority,
        legalIdentifierName: country.legalIdentifierName,
        language,
        setLanguage,
        selectCountry,
        selectProvince,
        selectCity,
        setFullJurisdiction
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
