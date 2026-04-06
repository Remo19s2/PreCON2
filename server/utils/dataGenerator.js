const User = require('../models/User');
const Rating = require('../models/Rating');
const Movie = require('../models/Movie');

const genres = ['Action', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Horror', 'Crime', 'Family'];
const languages = ['hi', 'ta', 'te', 'ml'];
const firstNames = ['Raj', 'Priya', 'Amit', 'Anjali', 'Rohan', 'Sneha', 'Arjun', 'Kavya', 'Vikram', 'Divya'];
const lastNames = ['Sharma', 'Kumar', 'Patel', 'Singh', 'Reddy', 'Iyer', 'Nair', 'Gupta', 'Joshi', 'Mehta'];

const generateUsers = async (count = 100) => {
  console.log(`Generating ${count} users...`);

  const adminExists = await User.findOne({ userId: 'admin' });
  if (!adminExists) {
    await User.create({
      userId: 'admin',
      name: 'Administrator',
      preferredGenre: 'Action',
      preferredLanguage: 'hi',
      role: 'admin'
    });
    console.log('✅ Created default admin user');
  }

  const existingUsers = await User.find({ role: 'user' });
  if (existingUsers.length >= count) {
    console.log(`✅ ${existingUsers.length} users already exist`);
    return existingUsers;
  }

  await User.deleteMany({ role: 'user' });

  const users = [];
  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    users.push({
      userId: `user${i}`,
      name: `${firstName} ${lastName}`,
      preferredGenre: genres[Math.floor(Math.random() * genres.length)],
      preferredLanguage: languages[Math.floor(Math.random() * languages.length)],
      role: 'user'
    });
  }

  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
};

const generateRatings = async () => {
  console.log('⭐ Generating ratings...');

  const existingRatings = await Rating.countDocuments();
  if (existingRatings > 0) {
    console.log(`✅ ${existingRatings} ratings already exist. Skipping generation.`);
    return;
  }

  const users = await User.find();
  const movies = await Movie.find();

  console.log(`📊 Found ${users.length} users and ${movies.length} movies`);

  if (movies.length === 0) {
    console.error('❌ No movies found. Cannot generate ratings.');
    throw new Error('No movies available for rating generation');
  }

  if (users.length === 0) {
    console.error('❌ No users found. Cannot generate ratings.');
    throw new Error('No users available for rating generation');
  }

  const ratings = [];
  let totalRatings = 0;

  for (const user of users) {
    const numRatings = Math.floor(Math.random() * 21) + 20; // 20-40 ratings
    const shuffled = [...movies].sort(() => Math.random() - 0.5);
    const selectedMovies = shuffled.slice(0, Math.min(numRatings, movies.length));

    for (const movie of selectedMovies) {
      let baseRating = Math.random() * 1 + 2.5; // 2.5-3.5

      const genreMatch = movie.genres.some(g => g === user.preferredGenre);
      const languageMatch = movie.originalLanguage === user.preferredLanguage;

      if (genreMatch && languageMatch) {
        baseRating += 1.5;
      } else if (genreMatch) {
        baseRating += 1.0;
      } else if (languageMatch) {
        baseRating += 0.8;
      }

      const finalRating = Math.min(5, Math.max(1, baseRating));

      ratings.push({
        userId: user.userId,
        movieId: movie._id,
        rating: Math.round(finalRating * 10) / 10
      });
      totalRatings++;
    }
  }

  console.log(`💾 Inserting ${ratings.length} ratings into database...`);
  
  try {
    await Rating.insertMany(ratings, { ordered: false });
    console.log(`✅ Successfully created ${ratings.length} ratings`);
  } catch (error) {
    if (error.code === 11000) {
      const inserted = error.insertedDocs ? error.insertedDocs.length : 0;
      console.log(`⚠️ Some duplicate ratings skipped. Inserted ${inserted} ratings.`);
    } else {
      throw error;
    }
  }
};

const initializeData = async () => {
  try {
    console.log('\n🚀 ========== DATA INITIALIZATION STARTED ==========\n');

    // Step 1: Check and fetch movies
    let movieCount = await Movie.countDocuments();
    console.log(`📊 Current movies in database: ${movieCount}`);
    
    if (movieCount === 0) {
      console.log('⚠️ No movies found. Fetching from TMDb...\n');
      
      const { fetchAllIndianMovies } = require('../services/tmdbService');
      const movies = await fetchAllIndianMovies();
      
      console.log(`\n💾 Saving ${movies.length} movies to database...`);

      if (movies.length === 0) {
        throw new Error('No movies fetched from TMDb. Check API key and connection.');
      }

      try {
        const insertResult = await Movie.insertMany(movies, { ordered: false });
        console.log(`✅ Successfully inserted ${insertResult.length} movies`);
      } catch (insertError) {
        if (insertError.code === 11000) {
          console.log('⚠️ Some duplicate movies skipped');
          const inserted = insertError.insertedDocs ? insertError.insertedDocs.length : 0;
          console.log(`✅ Inserted ${inserted} unique movies`);
        } else {
          throw insertError;
        }
      }
      
      movieCount = await Movie.countDocuments();
      console.log(`✅ Total movies now in database: ${movieCount}\n`);
    } else {
      console.log(`✅ Movies already exist in database\n`);
    }

    // Step 2: Generate users
    console.log('👥 ========== GENERATING USERS ==========\n');
    const users = await generateUsers(100);
    const userCount = await User.countDocuments();
    console.log(`✅ Total users in database: ${userCount}\n`);

    // Step 3: Generate ratings
    console.log('⭐ ========== GENERATING RATINGS ==========\n');
    await generateRatings();
    const ratingCount = await Rating.countDocuments();
    console.log(`✅ Total ratings in database: ${ratingCount}\n`);

    console.log('🎉 ========== DATA INITIALIZATION COMPLETE ==========');
    console.log(`📊 Final Stats:`);
    console.log(`   Movies: ${movieCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Ratings: ${ratingCount}\n`);

    return {
      movies: movieCount,
      users: userCount,
      ratings: ratingCount
    };

  } catch (error) {
    console.error('\n❌ ========== DATA INITIALIZATION FAILED ==========');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};

module.exports = {
  generateUsers,
  generateRatings,
  initializeData
};
