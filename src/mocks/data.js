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

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const MOCK_MOVIES = Array.from({ length: 120 }, (_, i) => {
  const title = getRandom(TITLES);

  return {
    id: i + 1,
    title: `${title} ${i + 1}`,
    year: `${1980 + Math.floor(Math.random() * 45)}`, // 1980–2025
    genre: [getRandom(GENRES), getRandom(GENRES)],
    rating: (Math.random() * 3 + 7).toFixed(1), // 7.0–10.0
    image: `https://picsum.photos/seed/movie${i + 1}/400/600`,
    description: `A compelling story about ${getRandom([
      'love',
      'power',
      'survival',
      'betrayal',
      'ambition',
      'revenge',
      'identity',
    ])} and ${getRandom(['humanity', 'technology', 'dreams', 'war', 'family', 'justice'])}.`,
  };
});

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
  'Couldn’t take my eyes off the screen.',
  'Brilliant execution and pacing.',
  'Some parts felt unnecessary, but still solid.',
  'Loved the concept and how it was executed.',
  'A cinematic experience like no other.',
  'Would highly recommend to anyone.',
];

const randomDate = () => {
  const start = new Date(2023, 0, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end - start));
  return date.toISOString().split('T')[0];
};

export const MOCK_REVIEWS = Array.from({ length: 150 }, (_, i) => {
  const index = Math.floor(Math.random() * MOVIE_TITLES.length);

  return {
    id: i + 1,
    movieTitle: MOVIE_TITLES[index],
    moviePoster: `https://picsum.photos/seed/${MOVIE_SEEDS[index]}${i}/400/600`,
    rating: Math.floor(Math.random() * 5) + 1, // 1–5
    comment: getRandom(COMMENTS),
    date: randomDate(),
  };
});
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
  JioCinema: '#EC4899',
};

export const INITIAL_PROFILE = {
  id: 'u1',
  name: 'Radhe Sharma',
  email: 'radhe.sharma@example.com',
  phone: '+91 9876543210',
  avatar: 'https://i.pravatar.cc/150?img=12',
  preferredGenres: ['Action', 'Sci-Fi', 'Drama'],
  preferredOtts: ['Netflix', 'Amazon Prime', 'Hotstar'],
  joinedAt: '2024-01-15',
  bio: 'Engineer by profession, cinephile by passion.',
};
