'use client';

import { Eye } from 'lucide-react';
import { useState } from 'react';

import AddMovieModal from '@/components/elements/modals/addMovieModal/AddMovieModal';
import MovieCard from '@/components/elements/movieCard/MovieCard';
import MovieListPage from '@/components/elements/movieListPage/MovieListPage';
import { MOCK_MOVIES, GENRES } from '@/mocks/data';

const PAGE_SIZE = 12;

export default function WatchedComponent({ initialMovies }) {
  const [movies, setMovies] = useState(initialMovies ?? MOCK_MOVIES);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const genreOptions = GENRES.map((g) => ({ value: g, label: g }));

  const handleSearchChange = (value) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  };

  const handleGenreChange = (value) => {
    setGenre(value);
    setVisibleCount(PAGE_SIZE);
  };

  const filtered = movies
    .filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => !genre || m.genre.includes(genre));

  const hasFilters = !!(search || genre);

  const displayed = hasFilters ? filtered : filtered.slice(0, visibleCount);
  const hasMore = !hasFilters && filtered.length > visibleCount;
  const nextBatch = Math.min(filtered.length - visibleCount, PAGE_SIZE);

  const handleAdd = (incoming) => {
    const arr = Array.isArray(incoming) ? incoming : [incoming];
    setMovies((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      return [...prev, ...arr.filter((m) => !ids.has(m.id))];
    });
  };

  const handleRemove = (id) => setMovies((prev) => prev.filter((m) => m.id !== id));

  const handleLoadMore = () => setVisibleCount((prev) => prev + PAGE_SIZE);

  const countText = hasMore
    ? `Showing ${displayed.length} of ${filtered.length} film${
        filtered.length === 1 ? '' : 's'
      } watched${genre ? ` in ${genre}` : ''}`
    : `${filtered.length} ${
        filtered.length === 1 ? 'film' : 'films'
      } watched${genre ? ` in ${genre}` : ''}`;

  return (
    <>
      <MovieListPage
        eyebrow={
          <>
            <Eye size={12} />
            Seen it
          </>
        }
        heading="Watched"
        count={countText}
        addLabel="Mark as Watched"
        onAdd={() => setIsAddOpen(true)}
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search watched films…"
        genre={genre}
        onGenreChange={handleGenreChange}
        genreOptions={genreOptions}
        isEmpty={filtered.length === 0}
        hasFilters={hasFilters}
        emptyIcon={<Eye size={36} />}
        emptyTitle={hasFilters ? 'No results found' : 'Nothing watched yet'}
        emptyText={
          hasFilters
            ? 'Try adjusting your filters.'
            : "Start marking films as watched and they'll show up here."
        }
        emptyActionLabel="Mark your first film"
        showLoadMore={hasMore}
        loadMoreLabel={`Load ${nextBatch} more`}
        onLoadMore={handleLoadMore}
      >
        {displayed.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            tag="Watched"
            showActions
            onSkip={() => handleRemove(movie.id)}
          />
        ))}
      </MovieListPage>

      <AddMovieModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAdd}
        title="Mark as Watched"
        subtitle="Select films you've already seen."
      />
    </>
  );
}
