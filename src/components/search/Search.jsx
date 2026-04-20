'use client';

import clsx from 'clsx';
import { Search as SearchIcon, Clock, X, Film, Star, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import MovieCard from '@/components/elements/movieCard/MovieCard';
import { DISCOVER_MOVIES, MOCK_MOVIES } from '@/mocks/data';

import styles from './Search.module.css';

const STORAGE_KEY = 'cinematch:recent-searches';
const MAX_RECENT_SEARCHES = 10;

const ALL_MOVIES = [...DISCOVER_MOVIES, ...(MOCK_MOVIES || [])];

export default function SearchComponent() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadRecentSearches = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Use startTransition to avoid cascading renders
          import('react').then(({ startTransition }) => {
            startTransition(() => {
              setRecentSearches(parsed);
            });
          });
        }
      } catch {}
    };
    loadRecentSearches();
  }, []);

  // Filter movies based on query
  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return ALL_MOVIES.filter((movie) => {
      const titleMatch = movie.title.toLowerCase().includes(lowerQuery);
      const directorMatch = movie.director?.toLowerCase().includes(lowerQuery);
      const genreMatch = movie.genre?.some((g) => g.toLowerCase().includes(lowerQuery));
      return titleMatch || directorMatch || genreMatch;
    }).slice(0, 6);
  }, [query]);

  const openDropdown = useCallback(() => setIsOpen(true), []);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

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
      setHasSearched(true);

      const lowerQuery = q.toLowerCase();
      const results = ALL_MOVIES.filter((movie) => {
        const titleMatch = movie.title.toLowerCase().includes(lowerQuery);
        const directorMatch = movie.director?.toLowerCase().includes(lowerQuery);
        const genreMatch = movie.genre?.some((g) => g.toLowerCase().includes(lowerQuery));
        return titleMatch || directorMatch || genreMatch;
      });
      setSearchResults(results);
      setQuery(q.trim());
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
    setSearchResults([]);
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

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
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleRecentSearchClick(term)}
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
                  </button>
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
              {searchResults.length > 0
                ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${query}"`
                : `No results for "${query}"`}
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
          ) : (
            <div className={styles.noResults}>
              <Film size={48} className={styles.noResultsIcon} />
              <p className={styles.noResultsText}>
                We could not find any movies matching your search.
              </p>
              <p className={styles.noResultsHint}>
                Try searching for a different movie title, director, or genre.
              </p>
            </div>
          )}
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

      {/* Initial State - Popular searches when no recent searches */}
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
