'use client';

import {
  Star,
  Eye,
  Bookmark,
  Play,
  Share2,
  Clock,
  Calendar,
  Globe,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Frown,
  ChevronLeft,
  MessageCircle,
  Send,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useRef } from 'react';

import { MOCK_MOVIE, MOCK_CAST, MOCK_MOVIE_COMMENTS } from '@/mocks/data';

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

export default function MovieDetailComponent({ movie = MOCK_MOVIE, onBack }) {
  const [isWatched, setIsWatched] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [userReaction, setUserReaction] = useState(null);
  const [reactionCounts, setReactionCounts] = useState({
    love: 1842,
    like: 3210,
    dislike: 412,
    hate: 98,
  });
  const [comments, setComments] = useState(MOCK_MOVIE_COMMENTS);
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const commentRef = useRef(null);

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

  const handleReaction = (id) => {
    setReactionCounts((prev) => {
      const next = { ...prev };
      if (userReaction === id) {
        next[id] = Math.max(0, next[id] - 1);
        setUserReaction(null);
      } else {
        if (userReaction) next[userReaction] = Math.max(0, next[userReaction] - 1);
        next[id] += 1;
        setUserReaction(id);
      }
      return next;
    });
  };

  const handleCommentSubmit = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    const newComment = {
      id: `r${Date.now()}`,
      user: 'You',
      avatar: 'https://i.pravatar.cc/150?img=33',
      rating: userRating || 0,
      date: 'Now',
      text: trimmed,
    };
    setComments((prev) => [newComment, ...prev]);
    setCommentText('');
    setUserRating(0);
  };

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
              width={120}
              height={180}
              loading="eager"
            />
            <div className={styles.posterRating}>
              <Star className={styles.posterRatingIcon} />
              <span>{movie.rating}</span>
            </div>
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.genrePills}>
              {movie.genre.map((g) => (
                <span key={g} className={styles.genrePill}>
                  {g}
                </span>
              ))}
            </div>

            <h1 className={styles.heroTitle}>{movie.title}</h1>

            {movie.tagline && <p className={styles.heroTagline}>&ldquo;{movie.tagline}&rdquo;</p>}

            <div className={styles.heroStats}>
              <span className={styles.heroStat}>
                <Calendar size={13} />
                {movie.year}
              </span>
              <span className={styles.heroStatDivider} />
              <span className={styles.heroStat}>
                <Clock size={13} />
                {movie.runtime}
              </span>
              <span className={styles.heroStatDivider} />
              <span className={styles.heroStat}>
                <Globe size={13} />
                {movie.language}
              </span>
            </div>

            <p className={styles.heroDirector}>
              Directed by <strong>{movie.director}</strong>
            </p>

            <div className={styles.heroCtas}>
              <button
                type="button"
                className={`${styles.ctaBtn} ${styles.ctaPrimary}`}
                onClick={() => commentRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play size={15} />
                Watch Trailer
              </button>

              <button
                type="button"
                className={`${styles.ctaBtn} ${styles.ctaWatched} ${isWatched ? styles.ctaWatchedActive : ''}`}
                onClick={() => setIsWatched((v) => !v)}
              >
                <Eye size={15} />
                {isWatched ? 'Watched' : 'Mark as Watched'}
              </button>

              <button
                type="button"
                className={`${styles.ctaBtn} ${isWatchlisted ? styles.ctaWatchedActive : ''}`}
                onClick={() => setIsWatchlisted((v) => !v)}
              >
                <Bookmark size={15} />
                {isWatchlisted ? 'Added to Watchlist' : 'Add to Watchlist'}
              </button>

              <button type="button" className={styles.ctaIconBtn} aria-label="Share">
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.body}>
        <section className={styles.card}>
          <h2 className={styles.sectionLabel}>Synopsis</h2>
          <p className={styles.synopsis}>{movie.description}</p>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionLabel}>Your Reaction</h2>
            <span className={styles.reactionTotal}>
              {totalReactions.toLocaleString()} reactions
            </span>
          </div>

          <div className={styles.reactionBar}>
            {REACTIONS.map(({ id }) => {
              const pct = totalReactions > 0 ? (reactionCounts[id] / totalReactions) * 100 : 25;
              return (
                <div
                  key={id}
                  className={`${styles.reactionBarSegment} ${styles[`reactionBar__${id}`]}`}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>

          <div className={styles.reactionButtons}>
            {REACTIONS.map(({ id, label, Icon, colorClass }) => {
              const isActive = userReaction === id;
              const pct =
                totalReactions > 0 ? Math.round((reactionCounts[id] / totalReactions) * 100) : 0;
              return (
                <button
                  key={id}
                  type="button"
                  className={`${styles.reactionBtn} ${colorClass} ${isActive ? styles.reactionBtnActive : ''}`}
                  onClick={() => handleReaction(id)}
                >
                  <span className={styles.reactionIconWrap}>
                    <Icon size={18} />
                  </span>
                  <span className={styles.reactionLabel}>{label}</span>
                  <span className={styles.reactionCount}>
                    {reactionCounts[id].toLocaleString()}
                    <span className={styles.reactionPct}>&nbsp;·&nbsp;{pct}%</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionLabel}>Cast</h2>
          <div className={styles.castCarousel}>
            {MOCK_CAST.map((member) => (
              <div key={member.id} className={styles.castCard}>
                <div className={styles.castAvatar}>
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    width={60}
                    height={60}
                  />
                </div>
                <p className={styles.castName}>{member.name}</p>
                <p className={styles.castRole}>{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionLabel}>Where to Watch</h2>
          <div className={styles.ottList}>
            {movie.ottPlatforms.map((ott) => {
              const color = OTT_COLORS[ott] || '#8c7851';
              return (
                <button key={ott} type="button" className={styles.ottChip}>
                  <span className={styles.ottDot} style={{ background: color }} />
                  {ott}
                  <span className={styles.ottAvailTag}>Available</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.card} ref={commentRef}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionLabel}>
              <MessageCircle
                size={14}
                style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }}
              />
              Reviews &amp; Comments
            </h2>
            <span className={styles.commentCount}>{comments.length} reviews</span>
          </div>

          <div className={styles.commentInput}>
            <div className={styles.commentInputAvatar}>
              <Image
                src="https://i.pravatar.cc/150?img=33"
                alt="You"
                referrerPolicy="no-referrer"
                width={40}
                height={40}
              />
            </div>
            <div className={styles.commentInputBody}>
              <div className={styles.starPicker}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    className={styles.starPickerBtn}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setUserRating(i)}
                    aria-label={`Rate ${i} stars`}
                  >
                    <Star
                      size={16}
                      className={
                        i <= (hoverRating || userRating)
                          ? styles.starPickerFilled
                          : styles.starPickerEmpty
                      }
                    />
                  </button>
                ))}
                {userRating > 0 && <span className={styles.starPickerLabel}>{userRating}/5</span>}
              </div>

              <textarea
                className={styles.commentTextarea}
                placeholder="Share your thoughts on this film…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
              />

              <div className={styles.commentInputFooter}>
                <span className={styles.commentCharsLeft}>
                  {500 - commentText.length} characters left
                </span>
                <button
                  type="button"
                  className={styles.commentSubmitBtn}
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim()}
                >
                  <Send size={13} />
                  Post Review
                </button>
              </div>
            </div>
          </div>

          <div className={styles.commentList}>
            {comments.map((c) => (
              <div key={c.id} className={styles.commentItem}>
                <div className={styles.commentAvatar}>
                  <Image
                    src={c.avatar}
                    alt={c.user}
                    referrerPolicy="no-referrer"
                    width={40}
                    height={40}
                  />
                </div>
                <div className={styles.commentBody}>
                  <div className={styles.commentMeta}>
                    <span className={styles.commentUser}>{c.user}</span>
                    {c.rating > 0 && (
                      <span className={styles.commentRating}>
                        <Star size={10} className={styles.commentRatingIcon} />
                        {c.rating}/5
                      </span>
                    )}
                    <span className={styles.commentDate}>{c.date}</span>
                  </div>
                  <p className={styles.commentText}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
