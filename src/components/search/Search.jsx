'use client';

import clsx from 'clsx';
import { Search as SearchIcon, Clock, X, Film, Star, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import MovieCard from '@/components/elements/movieCard/MovieCard';
import { useGet } from '@/lib/api';

import styles from './Search.module.css';

const STORAGE_KEY = 'cinematch:recent-searches';
const MAX_RECENT_SEARCHES = 10;

// Normalize API movie response to MovieCard format
const normalizeMovie = (movie) => ({
  id: movie.tmdb_id,
  title: movie.title,
  year: movie.release_year,
  genre: movie.genres || [],
  rating: movie.tmdb_rating ? movie.tmdb_rating / 10 : null,
  image: movie.poster_url || '',
  description: movie.overview || '',
});

export default function SearchComponent() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [recentSearches, setRecentSearches] = useState(() => {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounce query -> debouncedQuery (400ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // API call for search suggestions (dropdown) — minimal results for speed
  const suggestionsUrl = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return null;

    return `/v1/movies/search?q=${encodeURIComponent(debouncedQuery)}`;
  }, [debouncedQuery]);

  const { data: suggestionsData } = useGet(suggestionsUrl);

  const suggestions = useMemo(() => {
    if (!suggestionsData?.movies) return [];

    return (suggestionsData.movies || []).slice(0, 6).map(normalizeMovie);
  }, [suggestionsData]);

  const openDropdown = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const saveRecentSearch = useCallback((searchQuery) => {
    if (!searchQuery.trim()) return;

    try {
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s.toLowerCase() !== searchQuery.toLowerCase());

        const updated = [searchQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        return updated;
      });
    } catch {}
  }, []);

  const clearRecentSearches = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentSearches([]);
    } catch {}
  }, []);

  const removeRecentSearch = useCallback((searchQuery) => {
    try {
      setRecentSearches((prev) => {
        const updated = prev.filter((s) => s.toLowerCase() !== searchQuery.toLowerCase());

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        return updated;
      });
    } catch {}
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;

      setQuery(value);
      setSelectedIndex(-1);

      if (value.length >= 2) {
        openDropdown();
      } else {
        closeDropdown();
      }
    },
    [openDropdown, closeDropdown]
  );

  const handleSearch = useCallback(
    (searchQuery) => {
      const q = searchQuery || query;

      if (!q.trim()) return;

      saveRecentSearch(q.trim());
      closeDropdown();

      // ensure immediate API fetch
      setDebouncedQuery(q.trim());

      setHasSearched(true);
    },
    [query, saveRecentSearch, closeDropdown]
  );

  const handleSuggestionClick = useCallback(
    (movie) => {
      saveRecentSearch(movie.title);
      closeDropdown();

      router.push(`/movie/${movie.id}`);
    },
    [saveRecentSearch, closeDropdown, router]
  );

  const handleRecentSearchClick = useCallback(
    (searchTerm) => {
      handleSearch(searchTerm);
    },
    [handleSearch]
  );

  const handleClearInput = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setHasSearched(false);

    closeDropdown();

    inputRef.current?.focus();
  }, [closeDropdown]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen && suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();

          setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));

          break;

        case 'ArrowUp':
          e.preventDefault();

          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));

          break;

        case 'Enter':
          e.preventDefault();

          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionClick(suggestions[selectedIndex]);
          } else if (query.trim()) {
            handleSearch();
          }

          break;

        case 'Escape':
          closeDropdown();
          inputRef.current?.blur();

          break;

        default:
          break;
      }
    },
    [isOpen, suggestions, selectedIndex, query, handleSuggestionClick, handleSearch, closeDropdown]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeDropdown]);

  // Full search results — separate from dropdown suggestions
  const searchResultsUrl = useMemo(() => {
    if (!hasSearched || !debouncedQuery) return null;

    return `/v1/movies/search?q=${encodeURIComponent(debouncedQuery)}`;
  }, [hasSearched, debouncedQuery]);

  const { data: searchResultsData, loading: searchLoading } = useGet(searchResultsUrl);

  const searchResults = useMemo(() => {
    return (searchResultsData?.movies || []).map(normalizeMovie);
  }, [searchResultsData]);

  return (
    <div className={styles.searchPage}>
      <div className={styles.searchHeader}>
        <h1 className={styles.title}>Search</h1>

        <p className={styles.subtitle}>Discover movies, find your next watch</p>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.inputWrapper}>
          <SearchIcon className={styles.searchIcon} size={20} />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (query.length >= 2 || recentSearches.length > 0) {
                openDropdown();
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search movies, directors, genres..."
            className={styles.searchInput}
            aria-label="Search movies"
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              onClick={handleClearInput}
              className={styles.clearBtn}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {isOpen && (suggestions.length > 0 || recentSearches.length > 0) && (
          <div ref={dropdownRef} className={styles.dropdown}>
            {suggestions.length > 0 && (
              <div className={styles.dropdownSection}>
                <div className={styles.dropdownLabel}>Suggestions</div>

                {suggestions.map((movie) => (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => handleSuggestionClick(movie)}
                    className={clsx(
                      styles.dropdownItem,
                      selectedIndex === suggestions.indexOf(movie) && styles.dropdownItemSelected
                    )}
                  >
                    <div className={styles.suggestionPoster}>
                      <Image
                        src={movie.image}
                        alt={movie.title}
                        fill
                        sizes="40px"
                        className={styles.suggestionImage}
                        unoptimized
                      />
                    </div>

                    <div className={styles.suggestionInfo}>
                      <span className={styles.suggestionTitle}>{movie.title}</span>

                      <span className={styles.suggestionMeta}>
                        {movie.year} &bull; {movie.genre?.slice(0, 2).join(', ')}
                      </span>
                    </div>

                    <ChevronRight size={16} className={styles.suggestionArrow} />
                  </button>
                ))}
              </div>
            )}

            {suggestions.length === 0 && recentSearches.length > 0 && (
              <div className={styles.dropdownSection}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownLabel}>Recent Searches</div>

                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className={styles.clearAllBtn}
                  >
                    Clear all
                  </button>
                </div>

                {recentSearches.map((term) => (
                  <div
                    key={term}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRecentSearchClick(term)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRecentSearchClick(term);
                      }
                    }}
                    className={styles.dropdownItem}
                  >
                    <Clock size={16} className={styles.recentIcon} />

                    <span className={styles.recentText}>{term}</span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(term);
                      }}
                      className={styles.removeRecentBtn}
                      aria-label={`Remove ${term} from recent searches`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {hasSearched && (
        <div className={styles.resultsContainer}>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>
              {searchLoading
                ? `Searching for "${debouncedQuery}"...`
                : searchResults.length > 0
                  ? `${searchResults.length} result${
                      searchResults.length !== 1 ? 's' : ''
                    } for "${debouncedQuery}"`
                  : `No results for "${debouncedQuery}"`}
            </h2>
          </div>

          {searchResults.length > 0 ? (
            <div className={styles.resultsGrid}>
              {searchResults.map((movie) => (
                <Link key={movie.id} href={`/movie/${movie.id}`} className={styles.movieCardLink}>
                  <MovieCard movie={movie} showActions={false} />
                </Link>
              ))}
            </div>
          ) : !searchLoading && searchResults.length === 0 ? (
            <div className={styles.noResults}>
              <Film size={48} className={styles.noResultsIcon} />

              <p className={styles.noResultsText}>
                We could not find any movies matching your search.
              </p>

              <p className={styles.noResultsHint}>
                Try searching for a different movie title, director, or genre.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {!hasSearched && recentSearches.length > 0 && (
        <div className={styles.recentContainer}>
          <div className={styles.recentHeader}>
            <h2 className={styles.recentTitle}>
              <Clock size={18} />
              Recent Searches
            </h2>

            <button type="button" onClick={clearRecentSearches} className={styles.clearAllBtn}>
              Clear all
            </button>
          </div>

          <div className={styles.recentList}>
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleRecentSearchClick(term)}
                className={styles.recentChip}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {!hasSearched && recentSearches.length === 0 && (
        <div className={styles.popularContainer}>
          <h2 className={styles.popularTitle}>Popular Searches</h2>

          <div className={styles.recentList}>
            {['Oppenheimer', 'Dune', 'Inception', 'Parasite', 'Interstellar', 'Drama'].map(
              (term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSearch(term)}
                  className={styles.recentChip}
                >
                  <Star size={12} />
                  {term}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
