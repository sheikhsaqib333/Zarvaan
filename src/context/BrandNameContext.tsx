import React, { createContext, useContext } from 'react';

const BrandNameContext = createContext('Zavraan');

interface BrandNameProviderProps {
  brandName: string;
  children: React.ReactNode;
}

export const BrandNameProvider: React.FC<BrandNameProviderProps> = ({ brandName, children }) => (
  <BrandNameContext.Provider value={brandName.trim() || 'Zavraan'}>
    {children}
  </BrandNameContext.Provider>
);

export const useBrandName = () => useContext(BrandNameContext);

export const replaceBrandName = (text: string, brandName: string): string =>
  text.replace(/zavraan/gi, (matched) => {
    if (matched === matched.toUpperCase()) {
      return brandName.toUpperCase();
    }
    if (matched === matched.toLowerCase()) {
      return brandName.toLowerCase();
    }
    return `${brandName.charAt(0).toUpperCase()}${brandName.slice(1)}`;
  });