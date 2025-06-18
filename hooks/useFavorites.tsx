import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Facility {
  id: number;
  name: string;
  category: string;
  address: string;
  rating: number;
  distance: string;
  features: string[];
  image: string;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface FavoritesContextType {
  favorites: number[];
  addFavorite: (facilityId: number) => Promise<void>;
  removeFavorite: (facilityId: number) => Promise<void>;
  isFavorite: (facilityId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([]);

  // お気に入りデータの読み込み
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('お気に入りの読み込みに失敗しました:', error);
    }
  };

  const addFavorite = async (facilityId: number) => {
    try {
      const newFavorites = [...favorites, facilityId];
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('お気に入りの追加に失敗しました:', error);
    }
  };

  const removeFavorite = async (facilityId: number) => {
    try {
      const newFavorites = favorites.filter(id => id !== facilityId);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('お気に入りの削除に失敗しました:', error);
    }
  };

  const isFavorite = (facilityId: number) => {
    return favorites.includes(facilityId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
} 