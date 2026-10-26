import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import User from './models/User.js';
import Movie from './models/Movie.js';
import Theatre from './models/Theatre.js';
import Show from './models/Show.js';
import Seat from './models/Seat.js';
import Booking from './models/Booking.js';
import Payment from './models/Payment.js';
import Notification from './models/Notification.js';
import { generateSeatsForShow } from './controllers/showController.js';

dotenv.config();

export const seedData = async (options = { autoExit: true, skipIfPopulated: false }) => {
  try {
    if (options.skipIfPopulated) {
      const movieCount = await Movie.countDocuments();
      if (movieCount > 0) {
        console.log('[Seed] Database already contains data. Synchronizing Moana 2 display picture...');
        await Movie.updateOne(
          { title: /Moana 2/i },
          { $set: { posterUrl: '/images/moana2.jpg', backdropUrl: '/images/moana2.jpg', featured: true } }
        );
        return;
      }
    }

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Theatre.deleteMany({});
    await Show.deleteMany({});
    await Seat.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seed] Creating Users...');
    const admin = await User.create({
      name: 'Cinema Admin',
      email: 'admin@imovies.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 98260 55001',
      preferredCity: 'Bhopal',
    });

    const user = await User.create({
      name: 'Rahul Sharma',
      email: 'user@imovies.com',
      password: 'User@123',
      role: 'user',
      phone: '+91 98260 55002',
      preferredCity: 'Bhopal',
    });

    console.log('[Seed] Creating Theatres in Bhopal, India...');
    const theatres = await Theatre.create([
      {
        name: 'Cinepolis: DB City Mall',
        city: 'Bhopal',
        address: '4th Floor, DB City Mall, MP Nagar Zone 1',
        state: 'Madhya Pradesh',
        zipCode: '462011',
        screens: [
          { name: 'Screen 1 (VIP Recliners & Dolby Atmos)', screenType: 'Dolby Atmos VIP', totalSeats: 80 },
          { name: 'Screen 2 (IMAX 3D Laser)', screenType: 'IMAX 3D', totalSeats: 80 },
          { name: 'Screen 3 (4DX Dynamic)', screenType: '4DX', totalSeats: 80 },
        ],
        amenities: ['Dolby Atmos', 'VIP Recliners', 'Food Court', 'Coffee Lounge', 'Valet Parking'],
        contactNumber: '+91 755 664 4000',
      },
      {
        name: 'PVR: Aura Mall',
        city: 'Bhopal',
        address: '3rd Floor, Aura Mall, Gulmohar Colony, E-8 Arera Colony',
        state: 'Madhya Pradesh',
        zipCode: '462039',
        screens: [
          { name: 'Screen 1 (PVR P[XL] Dolby Atmos)', screenType: 'Dolby Atmos VIP', totalSeats: 80 },
          { name: 'Screen 2 (Standard Digital)', screenType: 'Standard', totalSeats: 80 },
        ],
        amenities: ['Dolby Atmos 7.1', 'Gourmet Popcorn Bar', 'Wheelchair Accessible', 'Parking'],
        contactNumber: '+91 755 422 1234',
      },
      {
        name: 'INOX: Aashima Mall',
        city: 'Bhopal',
        address: 'Aashima Anupama Mall, Hoshangabad Rd, Bawadiya Kalan',
        state: 'Madhya Pradesh',
        zipCode: '462026',
        screens: [
          { name: 'Screen 1 (Insignia VIP Lounge)', screenType: 'Dolby Atmos VIP', totalSeats: 80 },
          { name: 'Screen 2 (Standard Digital)', screenType: 'Standard', totalSeats: 80 },
        ],
        amenities: ['Insignia Luxury Seats', 'Dolby 7.1 Surround', 'Live Kitchen Dine-In'],
        contactNumber: '+91 755 409 5000',
      },
      {
        name: 'DDX Cinemas: People’s Mall',
        city: 'Bhopal',
        address: 'People’s World Complex, Berasia Road, Karond',
        state: 'Madhya Pradesh',
        zipCode: '462037',
        screens: [
          { name: 'Screen 1 (Mega Screen 3D)', screenType: 'IMAX 3D', totalSeats: 80 },
          { name: 'Screen 2 (Standard Digital)', screenType: 'Standard', totalSeats: 80 },
        ],
        amenities: ['Mega Screen 3D', 'Amusement Park Access', 'Spacious Parking'],
        contactNumber: '+91 755 400 5555',
      },
      {
        name: 'Jyoti Cineplex',
        city: 'Bhopal',
        address: 'Near Chetak Bridge, MP Nagar Zone 1',
        state: 'Madhya Pradesh',
        zipCode: '462011',
        screens: [
          { name: 'Screen 1 (Dolby Digital)', screenType: 'Standard', totalSeats: 80 },
        ],
        amenities: ['Centrally Air-Conditioned', 'Snack Bar', 'Budget Friendly'],
        contactNumber: '+91 755 255 1290',
      },
      {
        name: 'PVR: Phoenix Citadel',
        city: 'Indore',
        address: 'Phoenix Citadel Mall, MR 10 Road, Jhalaria',
        state: 'Madhya Pradesh',
        zipCode: '452016',
        screens: [
          { name: 'Screen 1 (IMAX 3D Laser)', screenType: 'IMAX 3D', totalSeats: 80 },
          { name: 'Screen 2 (Dolby Atmos VIP)', screenType: 'Dolby Atmos VIP', totalSeats: 80 },
        ],
        amenities: ['IMAX Laser', 'Dolby Atmos', 'Reclining Seats', 'Valet Parking'],
        contactNumber: '+91 731 668 8900',
      },
    ]);

    console.log('[Seed] Creating Extensive Blockbuster Catalog (14 Movies)...');
    const movies = await Movie.create([
      {
        title: 'Dune: Part Two',
        tagline: 'Long live the fighters.',
        description:
          'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
        genres: ['Sci-Fi', 'Adventure', 'Action'],
        language: 'English',
        duration: 166,
        releaseDate: new Date('2024-03-01'),
        rating: 9.1,
        votesCount: 8400,
        ageRating: 'PG-13',
        director: 'Denis Villeneuve',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1400&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        status: 'now_showing',
        featured: true,
        cast: [
          { name: 'Timothée Chalamet', character: 'Paul Atreides' },
          { name: 'Zendaya', character: 'Chani' },
          { name: 'Rebecca Ferguson', character: 'Lady Jessica' },
          { name: 'Javier Bardem', character: 'Stilgar' },
        ],
      },
      {
        title: 'Oppenheimer',
        tagline: 'The world forever changes.',
        description:
          'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring moral, ethical, and political consequences.',
        genres: ['Biography', 'Drama', 'History'],
        language: 'English',
        duration: 180,
        releaseDate: new Date('2023-07-21'),
        rating: 8.9,
        votesCount: 9200,
        ageRating: 'R',
        director: 'Christopher Nolan',
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1400&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        status: 'now_showing',
        featured: true,
        cast: [
          { name: 'Cillian Murphy', character: 'J. Robert Oppenheimer' },
          { name: 'Emily Blunt', character: 'Katherine Oppenheimer' },
          { name: 'Matt Damon', character: 'Leslie Groves' },
          { name: 'Robert Downey Jr.', character: 'Lewis Strauss' },
        ],
      },
      {
        title: 'Interstellar: 10th Anniversary',
        tagline: 'Mankind was born on Earth. It was never meant to die here.',
        description:
          'When Earth becomes uninhabitable, a former NASA pilot leads an interstellar mission through a wormhole to secure mankind’s future survival among the stars.',
        genres: ['Sci-Fi', 'Adventure', 'Drama'],
        language: 'English',
        duration: 169,
        releaseDate: new Date('2014-11-07'),
        rating: 9.3,
        votesCount: 12500,
        ageRating: 'PG-13',
        director: 'Christopher Nolan',
        posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1400&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        status: 'now_showing',
        featured: true,
        cast: [
          { name: 'Matthew McConaughey', character: 'Cooper' },
          { name: 'Anne Hathaway', character: 'Brand' },
          { name: 'Jessica Chastain', character: 'Murph' },
        ],
      },
      {
        title: 'Deadpool & Wolverine',
        tagline: 'Come together.',
        description:
          'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary behind him. But when his homeworld faces an existential threat, Wade must team up with a very reluctant Wolverine.',
        genres: ['Action', 'Comedy', 'Sci-Fi'],
        language: 'English',
        duration: 128,
        releaseDate: new Date('2024-07-26'),
        rating: 8.7,
        votesCount: 7800,
        ageRating: 'R',
        director: 'Shawn Levy',
        posterUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1400&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
        status: 'now_showing',
        featured: true,
        cast: [
          { name: 'Ryan Reynolds', character: 'Wade Wilson / Deadpool' },
          { name: 'Hugh Jackman', character: 'Logan / Wolverine' },
          { name: 'Emma Corrin', character: 'Cassandra Nova' },
        ],
      },
      {
        title: 'Inside Out 2',
        tagline: 'Make room for new emotions.',
        description:
          'Teenager Riley navigates high school as headquarters undergoes a sudden demolition to make room for unexpected new emotions: Anxiety, Envy, Ennui, and Embarrassment.',
        genres: ['Animation', 'Comedy', 'Adventure'],
        language: 'English',
        duration: 96,
        releaseDate: new Date('2024-06-14'),
        rating: 8.6,
        votesCount: 6500,
        ageRating: 'PG',
        director: 'Kelsey Mann',
        posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1400&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=LEjhY15eCx0',
        status: 'now_showing',
        featured: false,
        cast: [
          { name: 'Amy Poehler', character: 'Joy' },
          { name: 'Maya Hawke', character: 'Anxiety' },
          { name: 'Phyllis Smith', character: 'Sadness' },
        ],
      },
      {
        title: 'Spider-Man: Beyond the Spider-Verse',
        tagline: 'Every universe has a story. Only one can survive.',
        description:
          'Miles Morales embarks across the Multiverse with Gwen Stacy and a team of Spider-People to face off with a villain more powerful than anything they have ever encountered.',
        genres: ['Animation', 'Action', 'Adventure'],
        language: 'English',
        duration: 140,
        releaseDate: new Date('2025-06-15'),
        rating: 9.0,
        votesCount: 4100,
        ageRating: 'PG',
        director: 'Joaquim Dos Santos',
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1400&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        status: 'now_showing',
        featured: false,
        cast: [
          { name: 'Shameik Moore', character: 'Miles Morales' },
          { name: 'Hailee Steinfeld', character: 'Gwen Stacy' },
        ],
      },
      {
        title: 'Gladiator II',
        tagline: 'What we do in life echoes in eternity.',
        description:
          'Years after witnessing the death of Maximus at the hands of his uncle, Lucius must enter the Colosseum after Roman conquerors pillage his home.',
        genres: ['Action', 'Drama', 'History'],
        language: 'English',
        duration: 148,
        releaseDate: new Date('2024-11-22'),
        rating: 8.4,
        votesCount: 3500,
        ageRating: 'R',
        director: 'Ridley Scott',
        posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1400&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        status: 'now_showing',
        featured: false,
        cast: [
          { name: 'Paul Mescal', character: 'Lucius' },
          { name: 'Pedro Pascal', character: 'Marcus Acacius' },
          { name: 'Denzel Washington', character: 'Macrinus' },
        ],
      },
      {
        title: 'A Quiet Place: Day One',
        tagline: 'Hear how our world went quiet.',
        description:
          'Experience the day the world went quiet. A young woman named Sam must survive an invasion in New York City by bloodthirsty alien creatures with ultrasonic sound hearing.',
        genres: ['Horror', 'Sci-Fi', 'Thriller'],
        language: 'English',
        duration: 99,
        releaseDate: new Date('2024-06-28'),
        rating: 8.3,
        votesCount: 2900,
        ageRating: 'PG-13',
        director: 'Michael Sarnoski',
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1400&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=YPY7J-flzE8',
        status: 'now_showing',
        featured: false,
        cast: [
          { name: 'Lupita Nyong’o', character: 'Sam' },
          { name: 'Joseph Quinn', character: 'Eric' },
          { name: 'Djimon Hounsou', character: 'Henri' },
        ],
      },
      {
        title: 'Wicked: Part One',
        tagline: 'Defy gravity.',
        description:
          'The untold story of the witches of Oz: Elphaba, a misunderstood young woman born with emerald-green skin, and Glinda, a privileged and ambitious blonde, form an unlikely friendship.',
        genres: ['Musical', 'Fantasy', 'Romance'],
        language: 'English',
        duration: 160,
        releaseDate: new Date('2024-11-27'),
        rating: 8.8,
        votesCount: 3800,
        ageRating: 'PG',
        director: 'Jon M. Chu',
        posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1400&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=6COmYeLsz4c',
        status: 'now_showing',
        featured: false,
        cast: [
          { name: 'Cynthia Erivo', character: 'Elphaba' },
          { name: 'Ariana Grande', character: 'Glinda' },
          { name: 'Jeff Goldblum', character: 'The Wizard' },
        ],
      },
      {
        title: 'Alien: Romulus',
        tagline: 'In space no one can hear you scream.',
        description:
          'While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.',
        genres: ['Horror', 'Sci-Fi', 'Thriller'],
        language: 'English',
        duration: 119,
        releaseDate: new Date('2024-08-16'),
        rating: 8.5,
        votesCount: 4200,
        ageRating: 'R',
        director: 'Fede Álvarez',
        posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1400&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=x0XDEhP4MQs',
        status: 'now_showing',
        featured: false,
        cast: [
          { name: 'Cailee Spaeny', character: 'Rain Carradine' },
          { name: 'David Jonsson', character: 'Andy' },
        ],
      },
      {
        title: 'Avatar: Fire and Ash',
        tagline: 'Discover the ash people.',
        description:
          'Jake Sully and Neytiri travel across Pandora encountering a fierce fire-wielding Na’vi clan, facing conflicts both within and outside the moon.',
        genres: ['Action', 'Adventure', 'Fantasy', 'Sci-Fi'],
        language: 'English',
        duration: 175,
        releaseDate: new Date('2025-12-19'),
        rating: 8.8,
        votesCount: 1900,
        ageRating: 'PG-13',
        director: 'James Cameron',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        status: 'coming_soon',
        featured: true,
        cast: [
          { name: 'Sam Worthington', character: 'Jake Sully' },
          { name: 'Zoe Saldana', character: 'Neytiri' },
        ],
      },
      {
        title: 'The Batman: Part II',
        tagline: 'The shadows deepen over Gotham.',
        description:
          'Bruce Wayne navigates the deep underworld of Gotham City while facing a new syndicate of criminals challenging his crusade as the Dark Knight.',
        genres: ['Action', 'Crime', 'Drama'],
        language: 'English',
        duration: 165,
        releaseDate: new Date('2026-10-02'),
        rating: 8.9,
        votesCount: 1600,
        ageRating: 'PG-13',
        director: 'Matt Reeves',
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1400&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
        status: 'coming_soon',
        featured: false,
        cast: [
          { name: 'Robert Pattinson', character: 'Bruce Wayne / Batman' },
          { name: 'Andy Serkis', character: 'Alfred Pennyworth' },
        ],
      },
      {
        title: 'Moana 2',
        tagline: 'The ocean calls her back.',
        description:
          'Moana journeys to the far seas of Oceania and into dangerous, long-lost waters for an adventure unlike anything she has ever faced.',
        genres: ['Animation', 'Adventure', 'Family', 'Musical'],
        language: 'English',
        duration: 100,
        releaseDate: new Date('2024-11-27'),
        rating: 8.8,
        votesCount: 2200,
        ageRating: 'PG',
        director: 'David G. Derrick Jr.',
        posterUrl: '/images/moana2.jpg',
        backdropUrl: '/images/moana2.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=hDZ7y8RP5HE',
        status: 'now_showing',
        featured: true,
        cast: [
          { name: 'Auliʻi Cravalho', character: 'Moana' },
          { name: 'Dwayne Johnson', character: 'Maui' },
        ],
      },
      {
        title: 'Joker: Folie à Deux',
        tagline: 'The world is a stage.',
        description:
          'Arthur Fleck is institutionalized at Arkham awaiting trial for his crimes as Joker. While struggling with his dual identity, Arthur stumbles upon true love and musical delirium.',
        genres: ['Crime', 'Drama', 'Musical'],
        language: 'English',
        duration: 138,
        releaseDate: new Date('2024-10-04'),
        rating: 8.1,
        votesCount: 3100,
        ageRating: 'R',
        director: 'Todd Phillips',
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1400&auto=format&fit=crop&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=_OKAwz2NiOI',
        status: 'now_showing',
        featured: false,
        cast: [
          { name: 'Joaquin Phoenix', character: 'Arthur Fleck / Joker' },
          { name: 'Lady Gaga', character: 'Harleen Quinzel / Lee' },
        ],
      },
    ]);

    console.log('[Seed] Scheduling Shows Across All Theatres & Dates...');
    const now = new Date();
    const showHours = [10, 13, 16, 19, 21]; // 10:30 AM, 1:30 PM, 4:30 PM, 7:30 PM, 9:30 PM
    let createdShowsCount = 0;

    const nowShowingMovies = movies.filter((m) => m.status === 'now_showing');

    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const showDate = new Date(now);
      showDate.setDate(now.getDate() + dayOffset);

      for (const theatre of theatres) {
        // Schedule shows for top 4 now_showing movies per theatre per day
        for (const movie of nowShowingMovies.slice(0, 5)) {
          for (const hour of showHours.slice(0, 3)) {
            const showTime = new Date(showDate);
            showTime.setHours(hour, 30, 0, 0);

            if (showTime < now) continue;

            const durationMs = (movie.duration + 20) * 60 * 1000;
            const endTime = new Date(showTime.getTime() + durationMs);

            const show = await Show.create({
              movie: movie._id,
              theatre: theatre._id,
              screenName: theatre.screens[0]?.name || 'Audi 1 (IMAX 3D Laser)',
              showTime,
              endTime,
              priceTier: { standard: 150, premium: 220, vip: 320 },
              totalSeats: 80,
              availableSeatsCount: 80,
              status: 'scheduled',
            });

            await generateSeatsForShow(show._id, show.priceTier);
            createdShowsCount++;
          }
        }
      }
    }

    console.log(`[Seed] Created ${createdShowsCount} shows with seat matrices.`);

    // Create a sample confirmed booking for the demo user
    const sampleShow = await Show.findOne({ status: 'scheduled' })
      .populate('movie')
      .populate('theatre');

    if (sampleShow) {
      const seatsToBook = await Seat.find({
        show: sampleShow._id,
        seatNumber: { $in: ['D5', 'D6'] },
      });

      if (seatsToBook.length === 2) {
        const subtotal = seatsToBook.reduce((s, c) => s + c.price, 0); // 220 + 220 = 440
        const convenienceFee = 50.0; // ₹25 per seat
        const totalAmount = subtotal + convenienceFee; // ₹490

        const booking = await Booking.create({
          bookingNumber: 'IMO-948102-1049',
          user: user._id,
          show: sampleShow._id,
          movie: sampleShow.movie._id,
          theatre: sampleShow.theatre._id,
          seats: seatsToBook.map((s) => ({
            seatId: s._id,
            seatNumber: s.seatNumber,
            row: s.row,
            col: s.col,
            category: s.category,
            price: s.price,
          })),
          subtotal,
          convenienceFee,
          discount: 0,
          totalAmount,
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentId: 'TXN-998234-DEMO',
          qrCode: `IMO-TICKET:IMO-948102-1049:USER:${user._id}:SHOW:${sampleShow._id}`,
        });

        await Seat.updateMany(
          { _id: { $in: seatsToBook.map((s) => s._id) } },
          {
            $set: {
              status: 'booked',
              bookedBy: user._id,
              bookingId: booking._id,
            },
          }
        );

        await Show.findByIdAndUpdate(sampleShow._id, {
          $inc: { availableSeatsCount: -2 },
        });

        await Payment.create({
          booking: booking._id,
          user: user._id,
          paymentMethod: 'upi',
          transactionId: 'TXN-998234-DEMO',
          amount: totalAmount,
          currency: 'INR',
          status: 'success',
          upiId: 'rahul@okhdfcbank',
        });

        await Notification.create({
          user: user._id,
          title: 'Welcome to IMovies Bhopal!',
          message: `Your booking #${booking.bookingNumber} for ${sampleShow.movie.title} at ${sampleShow.theatre.name} is confirmed. Seats: D5, D6. Total Paid: ₹${totalAmount}. Enjoy your show!`,
          type: 'booking_confirmation',
          data: { bookingId: booking._id, showId: sampleShow._id },
        });

        console.log('[Seed] Created sample booking and notification.');
      }
    }

    console.log('\n======================================================');
    console.log('🍿 IMOVIES EXPANDED DATABASE SEEDED SUCCESSFULLY! 🍿');
    console.log(`  🎬 Total Movies:    ${movies.length}`);
    console.log(`  🏛️  Total Theatres:  ${theatres.length}`);
    console.log(`  🎟️  Total Shows:     ${createdShowsCount}`);
    console.log('  👤 Demo Admin:      admin@imovies.com / Admin@123');
    console.log('  👤 Demo User:       user@imovies.com  / User@123');
    console.log('======================================================\n');

    if (options.autoExit) {
      await closeDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed Error]:', error);
    if (options.autoExit) {
      process.exit(1);
    }
    throw error;
  }
};

const isDirectRun = process.argv[1] && (
  import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` ||
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))
);

if (isDirectRun) {
  connectDB().then(() => seedData({ autoExit: true, skipIfPopulated: false }));
}
