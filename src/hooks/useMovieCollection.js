'use client';

import { useState, useCallback, useMemo } from 'react';

export function useMovieCollection(initialMovies = []) {
  const [movies, setMovies] = useState(initialMovies);

  const handleAdd = useCallback((incoming) => {
    const arr = Array.isArray(incoming) ? incoming : [incoming];
    setMovies((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      return [...prev, ...arr.filter((m) => !ids.has(m.id))];
    });
  }, []);

  const handleRemove = useCallback((id) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const filteredMovies = useMemo(
    () => (search, genre) => {
      return movies
        .filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
        .filter((m) => !genre || m.genre.includes(genre));
    },
    [movies]
  );

  return {
    movies,
    setMovies,
    handleAdd,
    handleRemove,
    filteredMovies,
  };
}
