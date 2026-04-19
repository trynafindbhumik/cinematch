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
};

export const INITIAL_PROFILE = {
  id: 'u1',
  name: 'Radhe Sharma',
  email: 'radhe.sharma@example.com',
  phone: '+91 9876543210',
  avatar: 'https://i.pravatar.cc/150?img=12',
  preferredGenres: ['Action', 'Sci-Fi', 'Drama'],
  preferredOtts: ['Netflix', 'Prime Video', 'Hotstar'], // fixed naming
  joinedAt: '2024-01-15',
  bio: 'Engineer by profession, cinephile by passion.',
};

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
  'Couldn’t take my eyes off the screen.',
  'Brilliant execution and pacing.',
  'Some parts felt unnecessary, but still solid.',
  'Loved the concept and how it was executed.',
  'A cinematic experience like no other.',
  'Would highly recommend to anyone.',
];

const MOVIE_SEEDS = [
  'inception','interstellar','godfather','parasite','darkknight',
  'fightclub','matrix','gladiator','shawshank','titanic',
  'joker','whiplash','lalaland','prestige','revenant',
  'irishman','blackswan','insideout','madmax','her',
];

const MOVIE_TITLES = [
  'Inception','Interstellar','The Godfather','Parasite','The Dark Knight',
  'Fight Club','The Matrix','Gladiator','Shawshank Redemption','Titanic',
  'Joker','Whiplash','La La Land','The Prestige','The Revenant',
  'The Irishman','Black Swan','Inside Out','Mad Max Fury Road','Her',
];

const seeded = (seed) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const pick = (arr, seed) => arr[Math.floor(seeded(seed) * arr.length)];

export const MOCK_MOVIES = Array.from({ length: 120 }, (_, i) => {
  const seed = i + 1;

  return {
    id: seed,
    title: `${TITLES[seed % TITLES.length]} ${seed}`,
    year: `${1980 + Math.floor(seeded(seed) * 45)}`,
    genre: [
      GENRES[seed % GENRES.length],
      GENRES[(seed + 3) % GENRES.length],
    ],
    rating: (7 + seeded(seed) * 3).toFixed(1),
    image: `https://picsum.photos/seed/movie${seed}/400/600`,
    description: `A compelling story about ${pick(
      ['love','power','survival','betrayal','ambition','revenge','identity'],
      seed
    )} and ${pick(
      ['humanity','technology','dreams','war','family','justice'],
      seed + 50
    )}.`,
  };
});

const getDeterministicDate = (seed) => {
  const start = new Date(2023, 0, 1).getTime();
  const end = new Date(2025, 0, 1).getTime();
  const time = start + seeded(seed) * (end - start);
  return new Date(time).toISOString().split('T')[0];
};

export const MOCK_REVIEWS = Array.from({ length: 150 }, (_, i) => {
  const seed = i + 1;
  const index = Math.floor(seeded(seed) * MOVIE_TITLES.length);

  return {
    id: seed,
    movieTitle: MOVIE_TITLES[index],
    moviePoster: `https://picsum.photos/seed/${MOVIE_SEEDS[index]}${seed}/400/600`,
    rating: Math.floor(seeded(seed) * 5) + 1,
    comment: COMMENTS[Math.floor(seeded(seed + 20) * COMMENTS.length)],
    date: getDeterministicDate(seed),
  };
});