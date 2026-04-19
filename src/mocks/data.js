/* ─────────────────────────────────────────────
   Centralised mock-data store
   Path: @/mocks/data.js
───────────────────────────────────────────── */

/* ── Genre & OTT master lists ─────────────── */

export const GENRES = [
  'Drama',
  'Sci-Fi',
  'Action',
  'Romance',
  'Comedy',
  'Thriller',
  'Horror',
  'Documentary',
  'Crime',
  'Animation',
];

export const OTTS = [
  'Netflix',
  'Prime Video',
  'Disney+',
  'HBO Max',
  'Apple TV+',
  'Hulu',
  'Paramount+',
  'Peacock',
  'YouTube TV',
  'Crunchyroll',
  'Mubi',
  'Criterion Channel',
  'SonyLIV',
  'Zee5',
  'JioCinema',
  'Hotstar',
  'Discovery+',
  'Voot',
  'ALTBalaji',
  'MX Player',
  'Bilibili',
  'Rakuten Viki',
];

export const OTT_COLORS = {
  Netflix: '#E50914',
  'Prime Video': '#00A8E1',
  'Disney+': '#113CCF',
  'HBO Max': '#5822B4',
  'Apple TV+': '#1C1C1E',
  Hulu: '#1CE783',
  'Paramount+': '#0064FF',
  Peacock: '#F5C300',
  Crunchyroll: '#F47521',
  Mubi: '#1A1A1A',
  'Criterion Channel': '#2B2B2B',
  SonyLIV: '#0056D2',
  Zee5: '#8B5CF6',
  Hotstar: '#1B74E4',
  'Amazon Prime': '#00A8E0',
};

/* ── User profile ─────────────────────────── */

export const INITIAL_PROFILE = {
  id: 'u1',
  name: 'Radhe Sharma',
  email: 'radhe.sharma@example.com',
  phone: '+91 9876543210',
  avatar: 'https://i.pravatar.cc/150?img=12',
  preferredGenres: ['Action', 'Sci-Fi', 'Drama'],
  preferredOtts: ['Netflix', 'Prime Video', 'Hotstar'],
  joinedAt: '2024-01-15',
  bio: 'Engineer by profession, cinephile by passion.',
};

/* ── Discover page — swipe deck ──────────── */

export const DISCOVER_MOVIES = [
  {
    id: 'dm1',
    title: 'Oppenheimer',
    year: 2023,
    runtime: '3h 0m',
    rating: 8.9,
    genre: ['Biography', 'Drama', 'History'],
    language: 'English',
    director: 'Christopher Nolan',
    description:
      'The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during WWII. A visually stunning, morally complex epic that asks profound questions about scientific responsibility.',
    image: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
    ottPlatforms: ['Netflix', 'Amazon Prime'],
    tagline: 'The world forever changes.',
  },
  {
    id: 'dm2',
    title: 'Poor Things',
    year: 2023,
    runtime: '2h 21m',
    rating: 8.0,
    genre: ['Comedy', 'Drama', 'Romance'],
    language: 'English',
    director: 'Yorgos Lanthimos',
    description:
      'The fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant scientist Dr. Godwin Baxter. Whimsical, provocative, and unlike anything else.',
    image: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/bQFSC7PxDIU6fQXvMLFvPFmqTLq.jpg',
    ottPlatforms: ['Hotstar', 'Apple TV+'],
    tagline: 'The incredible tale of Bella Baxter.',
  },
  {
    id: 'dm3',
    title: 'Dune: Part Two',
    year: 2024,
    runtime: '2h 46m',
    rating: 8.6,
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    director: 'Denis Villeneuve',
    description:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. An epic continuation of the saga.',
    image: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    ottPlatforms: ['Amazon Prime'],
    tagline: 'Long live the fighters.',
  },
  {
    id: 'dm4',
    title: 'Parasite',
    year: 2019,
    runtime: '2h 12m',
    rating: 8.5,
    genre: ['Thriller', 'Drama', 'Comedy'],
    language: 'Korean',
    director: 'Bong Joon-ho',
    description:
      'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    image: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    ottPlatforms: ['Amazon Prime', 'Netflix'],
    tagline: 'Act like you own the place.',
  },
  {
    id: 'dm5',
    title: 'The Grand Budapest Hotel',
    year: 2014,
    runtime: '1h 39m',
    rating: 8.1,
    genre: ['Comedy', 'Drama', 'Adventure'],
    language: 'English',
    director: 'Wes Anderson',
    description:
      'A legendary concierge at a famous European hotel between the wars befriends a young employee, and together they embroil themselves in a theft and a murder mystery.',
    image: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JKmallECOT4RmCoW.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/vSNBBIfDscT0PDIE6sFlnmcPCqx.jpg',
    ottPlatforms: ['Netflix', 'Hotstar'],
    tagline: 'The most fabulous hotel in Europe.',
  },
  {
    id: 'dm6',
    title: 'Inception',
    year: 2010,
    runtime: '2h 28m',
    rating: 8.8,
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    language: 'English',
    director: 'Christopher Nolan',
    description:
      'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    image: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    ottPlatforms: ['Netflix', 'Amazon Prime'],
    tagline: 'Your mind is the scene of the crime.',
  },
  {
    id: 'dm7',
    title: 'Whiplash',
    year: 2014,
    runtime: '1h 47m',
    rating: 8.5,
    genre: ['Drama', 'Music'],
    language: 'English',
    director: 'Damien Chazelle',
    description:
      'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are tested by an instructor who will stop at nothing to push him to perfection.',
    image: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/fRGxZuo7jJUWQsVg9PREb98Aclp.jpg',
    ottPlatforms: ['Netflix', 'Amazon Prime'],
    tagline: 'The road to greatness can take you to the edge.',
  },
  {
    id: 'dm8',
    title: 'Joker',
    year: 2019,
    runtime: '2h 2m',
    rating: 8.4,
    genre: ['Crime', 'Drama', 'Thriller'],
    language: 'English',
    director: 'Todd Phillips',
    description:
      'In Gotham City, mentally troubled comedian Arthur Fleck embarks on a downward spiral of revolution and crime after being disregarded and mistreated by society.',
    image: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/n6bUvigpRFqSwmPp1m25h2Vp17M.jpg',
    ottPlatforms: ['Amazon Prime', 'Netflix'],
    tagline: 'Put on a happy face.',
  },
];

export const MOCK_MOVIE = {
  id: 'm1',
  title: 'Interstellar',
  tagline: 'Mankind was born on Earth. It was never meant to die here.',
  year: 2014,
  runtime: '2h 49m',
  rating: 8.7,
  genre: ['Sci-Fi', 'Adventure', 'Drama'],
  language: 'English',
  director: 'Christopher Nolan',
  description:
    "When Earth's future is threatened by a catastrophic blight, a former NASA pilot leads a team of astronauts through a wormhole near Saturn in search of a new home for humanity. Driven by love for his daughter and desperate hope, Cooper must confront the relativity of time, the enormity of space, and the question of what it means to be human.",
  image: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  backdrop: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
  ottPlatforms: ['Netflix', 'Amazon Prime', 'Apple TV+'],
};

export const MOCK_CAST = [
  {
    id: 'c1',
    name: 'Matthew McConaughey',
    role: 'Cooper',
    avatar: 'https://i.pravatar.cc/150?img=68',
  },
  { id: 'c2', name: 'Anne Hathaway', role: 'Brand', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: 'c3', name: 'Jessica Chastain', role: 'Murph', avatar: 'https://i.pravatar.cc/150?img=45' },
  {
    id: 'c4',
    name: 'Michael Caine',
    role: 'Prof. Brand',
    avatar: 'https://i.pravatar.cc/150?img=70',
  },
  { id: 'c5', name: 'Matt Damon', role: 'Mann', avatar: 'https://i.pravatar.cc/150?img=53' },
  {
    id: 'c6',
    name: 'Mackenzie Foy',
    role: 'Young Murph',
    avatar: 'https://i.pravatar.cc/150?img=44',
  },
];

export const MOCK_MOVIE_COMMENTS = [
  {
    id: 'r1',
    user: 'Priya Mehta',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    date: 'Mar 2025',
    text: "Hans Zimmer's score alone makes this a transcendent experience. The docking scene left me breathless.",
  },
  {
    id: 'r2',
    user: 'Aarav Singh',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 4,
    date: 'Feb 2025',
    text: 'Visually stunning and emotionally gut-punching. The science might stretch credulity but the heart never does.',
  },
  {
    id: 'r3',
    user: 'Sara Kapoor',
    avatar: 'https://i.pravatar.cc/150?img=9',
    rating: 5,
    date: 'Jan 2025',
    text: 'Nolan at his most ambitious. A love letter to both science and the bond between a parent and child.',
  },
];

/* ── Seeded random helpers ────────────────── */

const TITLES = [
  'Inception',
  'The Godfather',
  'Parasite',
  'Interstellar',
  'The Dark Knight',
  'Fight Club',
  'Forrest Gump',
  'The Matrix',
  'Gladiator',
  'Shawshank Redemption',
  'Titanic',
  'Avengers Endgame',
  'Joker',
  'Whiplash',
  'The Lion King',
  'Django Unchained',
  'The Social Network',
  'Mad Max Fury Road',
  'The Prestige',
  'Blade Runner 2049',
  'La La Land',
  'Wolf of Wall Street',
  'Shutter Island',
  'Grand Budapest Hotel',
  'Her',
  'No Country for Old Men',
  'The Revenant',
  'The Irishman',
  'Black Swan',
  'Inside Out',
];

const COMMENTS = [
  'Absolutely loved it. One of the best films I have seen.',
  'Great storytelling and performances throughout.',
  'A bit slow in parts but overall very engaging.',
  'Masterpiece. Would definitely watch again.',
  'Not what I expected, but still quite good.',
  'Visually stunning and emotionally powerful.',
  'Decent film but could have been shorter.',
  'Outstanding direction and screenplay.',
  'Good movie with a strong ending.',
  'Average experience, but worth a watch.',
  'Incredible acting and cinematography.',
  'The soundtrack really elevated the experience.',
  'A bit overrated, but still enjoyable.',
  'Fantastic plot and character development.',
  "Couldn't take my eyes off the screen.",
  'Brilliant execution and pacing.',
  'Some parts felt unnecessary, but still solid.',
  'Loved the concept and how it was executed.',
  'A cinematic experience like no other.',
  'Would highly recommend to anyone.',
];

const MOVIE_SEEDS = [
  'inception',
  'interstellar',
  'godfather',
  'parasite',
  'darkknight',
  'fightclub',
  'matrix',
  'gladiator',
  'shawshank',
  'titanic',
  'joker',
  'whiplash',
  'lalaland',
  'prestige',
  'revenant',
  'irishman',
  'blackswan',
  'insideout',
  'madmax',
  'her',
];

const MOVIE_TITLES = [
  'Inception',
  'Interstellar',
  'The Godfather',
  'Parasite',
  'The Dark Knight',
  'Fight Club',
  'The Matrix',
  'Gladiator',
  'Shawshank Redemption',
  'Titanic',
  'Joker',
  'Whiplash',
  'La La Land',
  'The Prestige',
  'The Revenant',
  'The Irishman',
  'Black Swan',
  'Inside Out',
  'Mad Max Fury Road',
  'Her',
];

const seeded = (seed) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const pick = (arr, seed) => arr[Math.floor(seeded(seed) * arr.length)];

/* ── Generated movie list (watchlist / watched) ── */

export const MOCK_MOVIES = Array.from({ length: 120 }, (_, i) => {
  const seed = i + 1;
  return {
    id: seed,
    title: `${TITLES[seed % TITLES.length]} ${seed}`,
    year: `${1980 + Math.floor(seeded(seed) * 45)}`,
    genre: [GENRES[seed % GENRES.length], GENRES[(seed + 3) % GENRES.length]],
    rating: (7 + seeded(seed) * 3).toFixed(1),
    image: `https://picsum.photos/seed/movie${seed}/400/600`,
    description: `A compelling story about ${pick(
      ['love', 'power', 'survival', 'betrayal', 'ambition', 'revenge', 'identity'],
      seed
    )} and ${pick(['humanity', 'technology', 'dreams', 'war', 'family', 'justice'], seed + 50)}.`,
  };
});

/* ── Reviews ──────────────────────────────── */

const getDeterministicDate = (seed) => {
  const start = new Date(2023, 0, 1).getTime();
  const end = new Date(2025, 0, 1).getTime();
  const time = start + seeded(seed) * (end - start);
  return new Date(time).toISOString().split('T')[0];
};

export const MOCK_REVIEWS = Array.from({ length: 150 }, (_, i) => {
  const seed = i + 1;
  const index = Math.floor(seeded(seed) * MOVIE_TITLES.length);
  const movieTitle = MOVIE_TITLES[index];
  // Derive a stable movieId by matching title to DISCOVER_MOVIES, or fall back to index
  const discoverMatch = DISCOVER_MOVIES.find((m) => m.title === movieTitle);
  const movieId = discoverMatch ? discoverMatch.id : String(index + 1);
  return {
    id: seed,
    movieTitle,
    movieId,
    moviePoster: `https://picsum.photos/seed/${MOVIE_SEEDS[index]}${seed}/400/600`,
    rating: Math.floor(seeded(seed) * 5) + 1,
    comment: COMMENTS[Math.floor(seeded(seed + 20) * COMMENTS.length)],
    date: getDeterministicDate(seed),
  };
});
