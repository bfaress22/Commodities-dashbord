import { useState, useEffect, useCallback, useMemo } from 'react';

const FAVORITES_STORAGE_KEY = 'commodity-favorites';

export interface FavoriteItem {
  symbol: string;
  name: string;
  category: string;
  addedAt: number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate the data structure
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  }, []);

  // Save favorites to localStorage immediately (synchronous)
  const saveFavoritesToStorage = useCallback((newFavorites: FavoriteItem[]) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, []);

  // Add a commodity to favorites - instant synchronous response
  const addToFavorites = useCallback((symbol: string, name: string, category: string) => {
    setFavorites(currentFavorites => {
      const newFavorite: FavoriteItem = {
        symbol,
        name,
        category,
        addedAt: Date.now()
      };
      
      const filtered = currentFavorites.filter(f => f.symbol !== symbol);
      const newFavorites = [...filtered, newFavorite];
      
      // Save to localStorage immediately
      saveFavoritesToStorage(newFavorites);
      
      return newFavorites;
    });
  }, [saveFavoritesToStorage]);

  // Remove a commodity from favorites - instant synchronous response
  const removeFromFavorites = useCallback((symbol: string) => {
    setFavorites(currentFavorites => {
      const newFavorites = currentFavorites.filter(f => f.symbol !== symbol);
      
      // Save to localStorage immediately
      saveFavoritesToStorage(newFavorites);
      
      return newFavorites;
    });
  }, [saveFavoritesToStorage]);

  // Toggle favorite status - instant synchronous response
  const toggleFavorite = useCallback((symbol: string, name: string, category: string) => {
    setFavorites(currentFavorites => {
      const isCurrentlyFavorite = currentFavorites.some(f => f.symbol === symbol);
      
      let newFavorites: FavoriteItem[];
      
      if (isCurrentlyFavorite) {
        newFavorites = currentFavorites.filter(f => f.symbol !== symbol);
      } else {
        const newFavorite: FavoriteItem = {
          symbol,
          name,
          category,
          addedAt: Date.now()
        };
        newFavorites = [...currentFavorites.filter(f => f.symbol !== symbol), newFavorite];
      }
      
      // Save to localStorage immediately
      saveFavoritesToStorage(newFavorites);
      
      return newFavorites;
    });
  }, [saveFavoritesToStorage]);

  // Check if a commodity is favorited
  const isFavorite = useCallback((symbol: string) => {
    return favorites.some(f => f.symbol === symbol);
  }, [favorites]);

  // Get favorite symbols only - memoized for performance
  const favoriteSymbols = useMemo(() => {
    return favorites.map(f => f.symbol);
  }, [favorites]);

  return {
    favorites,
    favoriteSymbols,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    favoritesCount: favorites.length
  };
} 