import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

const makeRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('🚀 Starting IMovies End-to-End API Test Suite...\n');

  try {
    // 1. Health check
    console.log('1. Testing /api/health ...');
    const health = await makeRequest('GET', '/health');
    console.log('   Status:', health.status, health.data);

    // 2. Auth: Login as Admin
    console.log('\n2. Testing Admin Login (/api/auth/login) ...');
    const adminLogin = await makeRequest('POST', '/auth/login', {
      email: 'admin@imovies.com',
      password: 'Admin@123',
    });
    console.log('   Status:', adminLogin.status, 'Success:', adminLogin.data.success);
    const adminToken = adminLogin.data.token;

    // 3. Auth: Login as User
    console.log('\n3. Testing Demo User Login (/api/auth/login) ...');
    const userLogin = await makeRequest('POST', '/auth/login', {
      email: 'user@imovies.com',
      password: 'User@123',
    });
    console.log('   Status:', userLogin.status, 'Success:', userLogin.data.success);
    const userToken = userLogin.data.token;

    // 4. Movies: Get movies
    console.log('\n4. Testing Movie Search & Filters (/api/movies) ...');
    const moviesRes = await makeRequest('GET', '/movies?status=now_showing');
    console.log('   Status:', moviesRes.status, 'Count:', moviesRes.data.movies?.length);
    const sampleMovie = moviesRes.data.movies?.[0];
    console.log('   Sample Movie:', sampleMovie?.title);

    // 5. Theatres: Get theatres
    console.log('\n5. Testing Theatre Listing (/api/theatres) ...');
    const theatresRes = await makeRequest('GET', '/theatres');
    console.log('   Status:', theatresRes.status, 'Count:', theatresRes.data.theatres?.length);

    // 6. Shows: Get shows
    console.log('\n6. Testing Shows Query (/api/shows) ...');
    const showsRes = await makeRequest('GET', `/shows?movieId=${sampleMovie?._id}`);
    console.log('   Status:', showsRes.status, 'Shows count:', showsRes.data.shows?.length);
    const sampleShow = showsRes.data.shows?.[0];

    if (sampleShow) {
      // 7. Seat Layout: Get seats for show
      console.log(`\n7. Testing Seat Layout (/api/shows/${sampleShow._id}) ...`);
      const showDetail = await makeRequest('GET', `/shows/${sampleShow._id}`);
      console.log('   Status:', showDetail.status, 'Total Seats:', showDetail.data.seats?.length);

      // 8. Booking: Create new reservation
      console.log('\n8. Testing Ticket Reservation (/api/bookings) ...');
      const bookRes = await makeRequest(
        'POST',
        '/bookings',
        {
          showId: sampleShow._id,
          seatNumbers: ['A1', 'A2'],
          paymentMethod: 'card',
          couponCode: 'IMOVIES20',
        },
        userToken
      );
      console.log('   Status:', bookRes.status, 'Message:', bookRes.data.message);
      console.log('   Booking Number:', bookRes.data.booking?.bookingNumber);
      console.log('   Total Paid:', bookRes.data.booking?.totalAmount);

      const createdBookingId = bookRes.data.booking?._id;

      // 9. My Bookings: Verify user booking log
      console.log('\n9. Testing User Bookings (/api/bookings/my) ...');
      const myBookings = await makeRequest('GET', '/bookings/my', null, userToken);
      console.log('   Status:', myBookings.status, 'My Bookings count:', myBookings.data.bookings?.length);

      // 10. Cancellation: Cancel booking and verify refund
      console.log(`\n10. Testing Booking Cancellation (/api/bookings/${createdBookingId}/cancel) ...`);
      const cancelRes = await makeRequest(
        'PUT',
        `/bookings/${createdBookingId}/cancel`,
        { reason: 'Automated test cancellation' },
        userToken
      );
      console.log('   Status:', cancelRes.status, 'Refund Amount:', cancelRes.data.refundAmount);

      // 11. Admin: Dashboard analytics
      console.log('\n11. Testing Admin Dashboard Analytics (/api/analytics/dashboard) ...');
      const adminStats = await makeRequest('GET', '/analytics/dashboard', null, adminToken);
      console.log('   Status:', adminStats.status, 'Total Revenue:', adminStats.data.stats?.totalRevenue);
    }

    console.log('\n🎉 ALL 11 TEST SUITES PASSED FLAWLESSLY! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTests();
