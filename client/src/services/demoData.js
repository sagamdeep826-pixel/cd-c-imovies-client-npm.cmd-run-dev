// Clearly labeled Demo Data for offline preview mode
// Used ONLY when the backend or MongoDB is not connected.
// Never claimed to be persistent.

export const DEMO_MOVIES = [
  {
    _id: 'demo-movie-1',
    title: 'Dune: Part Two (Demo Data)',
    tagline: 'Long live the fighters.',
    description:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    language: 'English',
    duration: 166,
    releaseDate: '2024-03-01',
    rating: 9.1,
    ageRating: 'PG-13',
    director: 'Denis Villeneuve',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1400&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    status: 'now_showing',
    featured: true,
    isDemoData: true,
    cast: [
      { name: 'Timothée Chalamet', character: 'Paul Atreides' },
      { name: 'Zendaya', character: 'Chani' },
    ],
  },
  {
    _id: 'demo-movie-2',
    title: 'Oppenheimer (Demo Data)',
    tagline: 'The world forever changes.',
    description:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring moral and political consequences.',
    genres: ['Biography', 'Drama', 'History'],
    language: 'English',
    duration: 180,
    releaseDate: '2023-07-21',
    rating: 8.9,
    ageRating: 'R',
    director: 'Christopher Nolan',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1400&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    status: 'now_showing',
    featured: true,
    isDemoData: true,
    cast: [
      { name: 'Cillian Murphy', character: 'J. Robert Oppenheimer' },
      { name: 'Emily Blunt', character: 'Katherine Oppenheimer' },
    ],
  },
  {
    _id: 'demo-movie-3',
    title: 'Interstellar: 10th Anniversary (Demo Data)',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    description:
      'When Earth becomes uninhabitable, a former NASA pilot leads an interstellar mission through a wormhole to secure mankind’s future survival among the stars.',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    duration: 169,
    releaseDate: '2014-11-07',
    rating: 9.3,
    ageRating: 'PG-13',
    director: 'Christopher Nolan',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1400&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    status: 'now_showing',
    featured: true,
    isDemoData: true,
    cast: [
      { name: 'Matthew McConaughey', character: 'Cooper' },
      { name: 'Anne Hathaway', character: 'Brand' },
    ],
  },
  {
    _id: 'demo-movie-4',
    title: 'Spider-Man: Beyond the Spider-Verse (Demo Data)',
    tagline: 'Every universe has a story. Only one can survive.',
    description:
      'Miles Morales embarks across the Multiverse with Gwen Stacy and a team of Spider-Heroes facing a threat that could tear reality itself apart.',
    genres: ['Animation', 'Action', 'Adventure'],
    language: 'English',
    duration: 140,
    releaseDate: '2025-06-15',
    rating: 9.0,
    ageRating: 'PG',
    director: 'Joaquim Dos Santos',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1400&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    status: 'now_showing',
    featured: false,
    isDemoData: true,
    cast: [
      { name: 'Shameik Moore', character: 'Miles Morales' },
      { name: 'Hailee Steinfeld', character: 'Gwen Stacy' },
    ],
  },
  {
    _id: 'demo-movie-5',
    title: 'Gladiator II (Demo Data)',
    tagline: 'What we do in life echoes in eternity.',
    description:
      'Lucius enters the Colosseum after Roman conquerors pillage his home, seeking justice and liberty in the ancient imperial arenas.',
    genres: ['Action', 'Drama', 'History'],
    language: 'English',
    duration: 148,
    releaseDate: '2024-11-22',
    rating: 8.4,
    ageRating: 'R',
    director: 'Ridley Scott',
    posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1400&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    status: 'now_showing',
    featured: false,
    isDemoData: true,
    cast: [
      { name: 'Paul Mescal', character: 'Lucius' },
      { name: 'Pedro Pascal', character: 'Marcus Acacius' },
    ],
  },
  {
    _id: 'demo-movie-6',
    title: 'Avatar: Fire and Ash (Demo Data)',
    tagline: 'Discover the ash people.',
    description:
      'Jake Sully and Neytiri travel across Pandora encountering a fierce fire-wielding Na’vi clan.',
    genres: ['Action', 'Adventure', 'Fantasy', 'Sci-Fi'],
    language: 'English',
    duration: 175,
    releaseDate: '2025-12-19',
    rating: 8.8,
    ageRating: 'PG-13',
    director: 'James Cameron',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    status: 'coming_soon',
    featured: true,
    isDemoData: true,
    cast: [
      { name: 'Sam Worthington', character: 'Jake Sully' },
      { name: 'Zoe Saldana', character: 'Neytiri' },
    ],
  },
];

export const DEMO_THEATRES = [
  {
    _id: 'demo-theatre-1',
    name: 'IMovies Grand Cinema & IMAX (Demo)',
    city: 'New York',
    address: '1500 Broadway, Times Square',
    screens: [
      { name: 'Screen 1 (IMAX 3D Laser)', screenType: 'IMAX 3D', totalSeats: 80 },
      { name: 'Screen 2 (Dolby Atmos VIP)', screenType: 'Dolby Atmos VIP', totalSeats: 80 },
    ],
    amenities: ['IMAX Laser', 'Dolby Atmos', 'Reclining Leather Seats', 'Gourmet Dine-in'],
    contactNumber: '+1 212-555-7890',
    isDemoData: true,
  },
  {
    _id: 'demo-theatre-2',
    name: 'IMovies Sunset Boulevard Pavilion (Demo)',
    city: 'Los Angeles',
    address: '6801 Hollywood Blvd, Hollywood',
    screens: [
      { name: 'Screen 1 (IMAX 3D)', screenType: 'IMAX 3D', totalSeats: 80 },
    ],
    amenities: ['IMAX 70mm', 'Dolby Vision', 'Rooftop Lounge'],
    contactNumber: '+1 323-555-8900',
    isDemoData: true,
  },
];

export const generateDemoSeats = (showId = 'demo-show-1') => {
  const rows = [
    { row: 'A', category: 'standard', price: 14 },
    { row: 'B', category: 'standard', price: 14 },
    { row: 'C', category: 'standard', price: 14 },
    { row: 'D', category: 'premium', price: 20 },
    { row: 'E', category: 'premium', price: 20 },
    { row: 'F', category: 'premium', price: 20 },
    { row: 'G', category: 'vip', price: 28 },
    { row: 'H', category: 'vip', price: 28 },
  ];

  const seats = [];
  rows.forEach(({ row, category, price }) => {
    for (let col = 1; col <= 10; col++) {
      const seatNumber = `${row}${col}`;
      const isBooked = ['B3', 'B4', 'E5', 'E6', 'G8'].includes(seatNumber);
      seats.push({
        _id: `seat-${row}-${col}`,
        show: showId,
        seatNumber,
        row,
        col,
        category,
        price,
        status: isBooked ? 'booked' : 'available',
      });
    }
  });
  return seats;
};

export const DEMO_SHOWS = [
  {
    _id: 'demo-show-1',
    movie: DEMO_MOVIES[0],
    theatre: DEMO_THEATRES[0],
    screenName: 'Screen 1 (IMAX 3D Laser)',
    showTime: new Date(Date.now() + 3600000 * 2).toISOString(),
    priceTier: { standard: 14, premium: 20, vip: 28 },
    availableSeatsCount: 75,
    totalSeats: 80,
    status: 'scheduled',
    isDemoData: true,
  },
  {
    _id: 'demo-show-2',
    movie: DEMO_MOVIES[0],
    theatre: DEMO_THEATRES[0],
    screenName: 'Screen 2 (Dolby Atmos VIP)',
    showTime: new Date(Date.now() + 3600000 * 5).toISOString(),
    priceTier: { standard: 14, premium: 20, vip: 28 },
    availableSeatsCount: 78,
    totalSeats: 80,
    status: 'scheduled',
    isDemoData: true,
  },
];
