'use client';

import { Bookmark } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import AddMovieModal from '@/components/elements/modals/addMovieModal/AddMovieModal';
import MovieCard from '@/components/elements/movieCard/MovieCard';
import MovieListPage from '@/components/elements/movieListPage/MovieListPage';
import { useGenres } from '@/hooks/useGenres';
import useWatchlist from '@/hooks/useWatchlist';
import { usePost, useDelete } from '@/lib/api';

function mapApiMovie(m) {
  return {
    id: m.id,
    title: m.title,
    year: m.release_year || m.release_year,
    genre: m.genres || [],
    rating: m.tmdb_rating ?? null,
    image: m.poster_url,
    description: '',
  };
}

const skeletonKeys = ['a', 'b', 'c', 'd', 'e', 'f'];
const moreSkeletonKeys = ['x', 'y', 'z'];

export default function WatchlistComponent() {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { items, loading, hasMore, isFetchingMore, fetchNextPage, isDebouncing, refresh } =
    useWatchlist({
      query: search,
      genre,
    });
  const { data: genresData } = useGenres();

  const [, , , addTrigger] = usePost({
    timeout: 30000,
    disableRetries: true,
  });

  const [, , , removeTrigger] = useDelete({
    allowEmptyBody: true,
    disableRetries: true,
  });

  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current) {
      return undefined;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMore && !loading && !isFetchingMore) {
          fetchNextPage();
        }
      });
    });

    obs.observe(sentinelRef.current);

    return () => {
      obs.disconnect();
    };
  }, [fetchNextPage, hasMore, loading, isFetchingMore, items.length]);

  const rawGenres = Array.isArray(genresData) ? genresData : genresData?.genres || [];
  const genreOptions = (rawGenres || []).map((g) => ({ value: g.name, label: g.name }));

  const handleSearchChange = (value) => setSearch(value);
  const handleGenreChange = (value) => setGenre(value);

  const handleAdd = async (incoming) => {
    const arr = Array.isArray(incoming) ? incoming : [incoming];
    const tmdb_ids = arr
      .map((m) => m.tmdb_id || m.tmdbId || m.movie_db_id || m.movieDbId || m.tmdbId)
      .filter(Boolean);
    if (tmdb_ids.length === 0) return;
    try {
      await addTrigger('/v1/watchlist', { tmdb_ids });
      await refresh();
    } catch {
      // ignore - error state exposed by hook
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeTrigger(`/v1/watchlist/${id}`, null, { allowEmptyBody: true });
      await refresh();
    } catch {
      // ignore
    }
  };

  const isEmpty = !loading && items.length === 0;

  const displayed = items.map(mapApiMovie);

  return (
    <>
      <MovieListPage
        eyebrow="Your Collection"
        heading="Watchlist"
        count={`${items.length} ${items.length === 1 ? 'title' : 'titles'}${genre ? ` in ${genre}` : ''}`}
        addLabel="Add Movies"
        onAdd={() => setIsAddOpen(true)}
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search your watchlist…"
        searchLoading={isDebouncing || (loading && items.length === 0)}
        genre={genre}
        onGenreChange={handleGenreChange}
        genreOptions={genreOptions}
        isEmpty={isEmpty}
        hasFilters={!!(search || genre)}
        emptyIcon={<Bookmark size={36} />}
        emptyTitle={isEmpty ? 'No results found' : 'Your watchlist is empty'}
        emptyText={
          isEmpty
            ? "Try adjusting your search or filter to find what you're looking for."
            : "Start adding movies you want to watch. They'll all be saved right here."
        }
        emptyActionLabel="Add your first movies"
        showLoadMore={false}
      >
        {displayed.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            showActions
            onDelete={() => handleRemove(movie.id)}
          />
        ))}

        {loading &&
          items.length === 0 &&
          skeletonKeys.map((key) => (
            <div key={key} style={{ height: 300, background: '#d0d0d0', borderRadius: 8 }} />
          ))}

        {isFetchingMore &&
          moreSkeletonKeys.map((key) => (
            <div key={key} style={{ height: 300, background: '#d0d0d0', borderRadius: 8 }} />
          ))}

        <div ref={sentinelRef} aria-hidden="true" style={{ width: '100%', height: 1 }} />
      </MovieListPage>

      <AddMovieModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAdd}
        title="Add to Watchlist"
        subtitle="Select one or more films to add to your collection."
      />
    </>
  );
}
