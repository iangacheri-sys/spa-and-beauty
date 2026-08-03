import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavouritesContextType {
  savedSpaIds: string[];
  toggleSpaFavourite: (id: string) => void;
  isSpaSaved: (id: string) => boolean;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [savedSpaIds, setSavedSpaIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('favourites').then((data) => {
      if (data) {
        try {
          setSavedSpaIds(JSON.parse(data));
        } catch (e) {}
      }
    });
  }, []);

  const toggleSpaFavourite = async (id: string) => {
    let newSaved: string[];
    if (savedSpaIds.includes(id)) {
      newSaved = savedSpaIds.filter((x) => x !== id);
    } else {
      newSaved = [...savedSpaIds, id];
    }
    setSavedSpaIds(newSaved);
    await AsyncStorage.setItem('favourites', JSON.stringify(newSaved));
  };

  const isSpaSaved = (id: string) => savedSpaIds.includes(id);

  return (
    <FavouritesContext.Provider value={{ savedSpaIds, toggleSpaFavourite, isSpaSaved }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
}
