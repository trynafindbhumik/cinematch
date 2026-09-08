'use client';

import {
  Star,
  Eye,
  Bookmark,
  Clock,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Frown,
  ChevronLeft,
  Send,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useRef } from 'react';

import { useMovieDetails, useMovieReviews, createMovieReview } from '@/hooks/useMovies';
import { useReaction } from '@/hooks/useReaction';

import styles from './MovieDetails.module.css';

const OTT_COLORS = {
  Netflix: '#E50914',
  'Amazon Prime': '#00A8E0',
  'Apple TV+': '#555555',
  Hotstar: '#1F80E0',
};

const REACTIONS = [
  { id: 'love', label: 'Love it', Icon: Heart, colorClass: styles.reactionLove },
  { id: 'like', label: 'Like it', Icon: ThumbsUp, colorClass: styles.reactionLike },
  { id: 'dislike', label: 'Dislike', Icon: ThumbsDown, colorClass: styles.reactionDislike },
  { id: 'hate', label: 'Hate it', Icon: Frown, colorClass: styles.reactionHate },
];

export default function MovieDetailComponent({ movie: initialMovie, movieId, onBack }) {
  const { movieData, loading: apiLoading } = useMovieDetails(movieId);
  const { submitReaction } = useReaction();

  const rawMovie = movieData || initialMovie || {};
  const movie = {
    id: rawMovie.tmdb_id || rawMovie.id || 550,
    title: rawMovie.title || 'Movie Title',
    image: rawMovie.poster_url || rawMovie.image || '/placeholder-poster.png',
    backdrop: rawMovie.backdrop_url || rawMovie.backdrop || rawMovie.poster_url || rawMovie.image,
    rating: rawMovie.tmdb_rating
      ? (rawMovie.tmdb_rating / 10).toFixed(1)
      : rawMovie.rating || '8.0',
    year: rawMovie.release_year || rawMovie.year || 2024,
    runtime: rawMovie.runtime ? `${rawMovie.runtime} min` : rawMovie.runtime || '120 min',
    tagline: rawMovie.tagline || rawMovie.description || '',
    overview: rawMovie.overview || rawMovie.tagline || rawMovie.description || '',
    genres: rawMovie.genres || rawMovie.genre || [],
    ottPlatforms: rawMovie.ottPlatforms || ['Netflix'],
    userReaction: rawMovie.user_reaction || null,
  };

  const { reviews: apiReviews, refetch: refetchReviews } = useMovieReviews(movie.id);

  const [isWatched, setIsWatched] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [userReaction, setUserReaction] = useState(movie.userReaction);
  const [reactionCounts, setReactionCounts] = useState({
    love: rawMovie.love_count || 0,
    like: rawMovie.like_count || 0,
    dislike: rawMovie.dislike_count || 0,
    hate: rawMovie.hate_count || 0,
  });

  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const commentRef = useRef(null);

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

  const handleReaction = (id) => {
    if (movie.id) {
      submitReaction(movie.id, id);
    }
    setReactionCounts((prev) => {
      const next = { ...prev };
      if (userReaction === id) {
        next[id] = Math.max(0, next[id] - 1);
        setUserReaction(null);
      } else {
        if (userReaction) next[userReaction] = Math.max(0, next[userReaction] - 1);
        next[id] = (next[id] || 0) + 1;
        setUserReaction(id);
      }
      return next;
    });
  };

  const handleCommentSubmit = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    try {
      await createMovieReview(movie.id, userRating || 5, trimmed);
      setCommentText('');
      setUserRating(0);
      refetchReviews();
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  if (apiLoading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: '60px', textAlign: 'center', color: '#fff' }}>
          Loading movie details...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop}>
          <Image
            src={movie.backdrop || movie.image}
            alt=""
            className={styles.heroBackdropImg}
            referrerPolicy="no-referrer"
            fill
            loading="eager"
            style={{ objectFit: 'cover' }}
            unoptimized
          />
          <div className={styles.heroBackdropOverlay} />
        </div>

        {onBack && (
          <button type="button" className={styles.backBtn} onClick={onBack}>
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>
        )}

        <div className={styles.heroContent}>
          <div className={styles.posterWrap}>
            <Image
              src={movie.image}
              alt={movie.title}
              className={styles.poster}
              referrerPolicy="no-referrer"
              width={200}
              height={300}
              loading="eager"
              unoptimized
            />
          </div>

          <div className={styles.details}>
            <div className={styles.taglineRow}>
              {movie.tagline && (
                <span className={styles.tagline}>&ldquo;{movie.tagline}&rdquo;</span>
              )}
            </div>

            <h1 className={styles.title}>{movie.title}</h1>

            <div className={styles.metaRow}>
              <div className={styles.metaBadge}>
                <Star className={styles.starIcon} size={14} />
                <span>{movie.rating}</span>
              </div>
              <span className={styles.metaDivider}>•</span>
              <div className={styles.metaItem}>
                <Calendar size={13} />
                <span>{movie.year}</span>
              </div>
              <span className={styles.metaDivider}>•</span>
              <div className={styles.metaItem}>
                <Clock size={13} />
                <span>{movie.runtime}</span>
              </div>
            </div>

            <div className={styles.genreRow}>
              {movie.genres?.map((g) => (
                <span key={g} className={styles.genrePill}>
                  {g}
                </span>
              ))}
            </div>

            <div className={styles.actionRow}>
              <button
                type="button"
                className={`${styles.actionBtn} ${isWatchlisted ? styles.activeWatchlist : ''}`}
                onClick={() => setIsWatchlisted((v) => !v)}
              >
                <Bookmark size={16} />
                <span>{isWatchlisted ? 'Watchlisted' : 'Watchlist'}</span>
              </button>

              <button
                type="button"
                className={`${styles.actionBtn} ${isWatched ? styles.activeWatched : ''}`}
                onClick={() => setIsWatched((v) => !v)}
              >
                <Eye size={16} />
                <span>{isWatched ? 'Watched' : 'Mark Watched'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.bodySection}>
        <div className={styles.grid}>
          <div className={styles.mainCol}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Overview</h2>
              <p className={styles.overviewText}>{movie.overview}</p>
            </div>

            <div className={styles.card}>
              <div className={styles.reactionHeader}>
                <h2 className={styles.sectionTitle}>Audience Sentiment</h2>
                <span className={styles.totalBadge}>{totalReactions.toLocaleString()} votes</span>
              </div>

              <div className={styles.reactionGrid}>
                {REACTIONS.map(({ id, label, Icon, colorClass }) => {
                  const count = reactionCounts[id] || 0;
                  const pct = totalReactions > 0 ? Math.round((count / totalReactions) * 100) : 0;
                  const isSelected = userReaction === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`${styles.reactionBtn} ${colorClass} ${isSelected ? styles.selectedReaction : ''}`}
                      onClick={() => handleReaction(id)}
                    >
                      <Icon size={20} />
                      <span className={styles.reactionLabel}>{label}</span>
                      <span className={styles.reactionPct}>{pct}%</span>
                      <div className={styles.reactionBar} style={{ width: `${pct}%` }} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.commentHeader}>
                <h2 className={styles.sectionTitle}>Discussion ({comments.length})</h2>
              </div>

              <div className={styles.commentForm}>
                <div className={styles.starRatingRow}>
                  <span className={styles.ratePrompt}>Your Rating:</span>
                  <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        className={`${styles.star} ${(hoverRating || userRating) >= star ? styles.starFilled : ''}`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setUserRating(star)}
                      />
                    ))}
                  </div>
                </div>

                <div className={styles.inputWrap}>
                  <textarea
                    ref={commentRef}
                    className={styles.commentInput}
                    placeholder="Share your thoughts on this film..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                  />
                  <button
                    type="button"
                    className={styles.sendBtn}
                    onClick={handleCommentSubmit}
                    disabled={!commentText.trim()}
                  >
                    <Send size={15} />
                    <span>Post</span>
                  </button>
                </div>
              </div>

              <div className={styles.commentList}>
                {apiReviews.length === 0 ? (
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '0.9rem',
                      fontStyle: 'italic',
                    }}
                  >
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  apiReviews.map((c, idx) => (
                    <div key={c.id || c.tmdb_id || `rev-${idx}`} className={styles.commentItem}>
                      <Image
                        src={c.user_avatar || c.avatar || '/placeholder-avatar.png'}
                        alt=""
                        width={36}
                        height={36}
                        className={styles.commentAvatar}
                      />
                      <div className={styles.commentBody}>
                        <div className={styles.commentMeta}>
                          <span className={styles.commentUser}>
                            {c.username || c.user_name || c.user || 'Movie Fan'}
                          </span>
                          <span className={styles.commentDate}>
                            {c.created_at
                              ? new Date(c.created_at).toLocaleDateString()
                              : c.date || 'Recent'}
                          </span>
                        </div>
                        <p className={styles.commentText}>{c.review_text || c.comment || c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className={styles.sideCol}>
            <div className={styles.card}>
              <h3 className={styles.sideTitle}>Streaming Platforms</h3>
              <div className={styles.ottList}>
                {movie.ottPlatforms?.map((p) => (
                  <div key={p} className={styles.ottItem}>
                    <span
                      className={styles.ottBadge}
                      style={{ background: OTT_COLORS[p] ?? '#333' }}
                    >
                      {p[0]}
                    </span>
                    <span className={styles.ottName}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
