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

export const MOCK_MOVIES = [
  {
    id: 1,
    title: 'Inception',
    year: '2010',
    genre: ['Sci-Fi', 'Action'],
    rating: '8.8',
    image: 'https://picsum.photos/seed/inception/400/600',
    description:
      'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.',
  },
  {
    id: 2,
    title: 'The Godfather',
    year: '1972',
    genre: ['Drama', 'Crime'],
    rating: '9.2',
    image: 'https://picsum.photos/seed/godfather/400/600',
    description:
      'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
  },
  {
    id: 3,
    title: 'Parasite',
    year: '2019',
    genre: ['Thriller', 'Drama'],
    rating: '8.5',
    image: 'https://picsum.photos/seed/parasite/400/600',
    description:
      'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
  },
  {
    id: 4,
    title: 'Interstellar',
    year: '2014',
    genre: ['Sci-Fi', 'Drama'],
    rating: '8.7',
    image: 'https://picsum.photos/seed/interstellar/400/600',
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  },
  {
    id: 5,
    title: 'The Dark Knight',
    year: '2008',
    genre: ['Action', 'Drama'],
    rating: '9.0',
    image: 'https://picsum.photos/seed/darkknight/400/600',
    description:
      'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest tests of his ability to fight injustice.',
  },
  {
    id: 6,
    title: 'Pulp Fiction',
    year: '1994',
    genre: ['Crime', 'Drama'],
    rating: '8.9',
    image: 'https://picsum.photos/seed/pulpfiction/400/600',
    description:
      'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
  },
  {
    id: 7,
    title: 'Spirited Away',
    year: '2001',
    genre: ['Animation', 'Drama'],
    rating: '9.3',
    image: 'https://picsum.photos/seed/spiritedaway/400/600',
    description:
      "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.",
  },
  {
    id: 8,
    title: '2001: A Space Odyssey',
    year: '1968',
    genre: ['Sci-Fi', 'Drama'],
    rating: '8.3',
    image: 'https://picsum.photos/seed/odyssey2001/400/600',
    description:
      'After discovering a mysterious artifact, humanity sends a spacecraft to investigate its origins with the help of an AI.',
  },
];

// export const MOCK_REVIEWS = [
//   {
//     id: 1,
//     movieTitle: 'Inception',
//     moviePoster: 'https://picsum.photos/seed/inception/400/600',
//     rating: 5,
//     comment:
//       'Mind-bending masterpiece. The visual effects and storytelling are top-notch. Nolan at his absolute finest.',
//     date: '2024-03-15',
//   },
//   {
//     id: 2,
//     movieTitle: 'Interstellar',
//     moviePoster: 'https://picsum.photos/seed/interstellar/400/600',
//     rating: 4,
//     comment:
//       "An emotional journey through space. Hans Zimmer's score is transcendent — I've never been so moved.",
//     date: '2024-02-20',
//   },
// ];
export const MOCK_REVIEWS = [
  // {
  //   id: 1,
  //   movieTitle: 'Inception',
  //   moviePoster: 'https://picsum.photos/seed/inception/400/600',
  //   rating: 5,
  //   comment:
  //     'Mind-bending masterpiece. The visual effects and storytelling are top-notch. Nolan at his absolute finest.',
  //   date: '2024-03-15',
  // },
  // {
  //   id: 2,
  //   movieTitle: 'Interstellar',
  //   moviePoster: 'https://picsum.photos/seed/interstellar/400/600',
  //   rating: 4,
  //   comment:
  //     "An emotional journey through space. Hans Zimmer's score is transcendent — I've never been so moved.",
  //   date: '2024-02-20',
  // },
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
