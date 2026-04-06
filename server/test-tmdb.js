// Quick test script for TMDb connectivity
require('dotenv').config();
const axios = require('axios');

console.log('🧪 Testing TMDb API Connectivity\n');

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

console.log('📋 Configuration:');
console.log('   API Key:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT SET');
console.log('   Base URL:', BASE_URL);
console.log('');

async function testConnection() {
  console.log('🔗 Test 1: Fetching genre list...');

  try {
    const response = await axios.get(`${BASE_URL}/genre/movie/list`, {
      params: { api_key: API_KEY },
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    console.log('✅ SUCCESS!');
    console.log('   Genres fetched:', response.data.genres.length);
    console.log('   Sample genres:', response.data.genres.slice(0, 3).map(g => g.name).join(', '));
    console.log('');

    return true;
  } catch (error) {
    console.log('❌ FAILED');
    if (error.code === 'ECONNABORTED') {
      console.log('   Error: REQUEST TIMEOUT');
      console.log('   → TMDb API is not responding');
      console.log('   → Check network/firewall/proxy');
    } else if (error.response) {
      console.log('   HTTP Status:', error.response.status);
      console.log('   Response:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.log('   Error: NO RESPONSE');
      console.log('   → Network connectivity issue');
    } else {
      console.log('   Error:', error.message);
    }
    console.log('');

    return false;
  }
}

async function testMovieFetch() {
  console.log('🔗 Test 2: Fetching Hindi movies...');

  try {
    const response = await axios.get(`${BASE_URL}/discover/movie`, {
      params: {
        api_key: API_KEY,
        with_original_language: 'hi',
        page: 1
      },
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    console.log('✅ SUCCESS!');
    console.log('   Movies fetched:', response.data.results.length);
    console.log('   Sample movie:', response.data.results[0]?.title || 'N/A');
    console.log('');

    return true;
  } catch (error) {
    console.log('❌ FAILED');
    console.log('   Error:', error.code || error.message);
    console.log('');

    return false;
  }
}

async function runTests() {
  const genreTest = await testConnection();
  const movieTest = await testMovieFetch();

  console.log('📊 Test Results:');
  console.log('   Genre fetch:', genreTest ? '✅ PASS' : '❌ FAIL');
  console.log('   Movie fetch:', movieTest ? '✅ PASS' : '❌ FAIL');
  console.log('');

  if (!genreTest && !movieTest) {
    console.log('⚠️ TMDb API is not accessible from this network');
    console.log('   → System will use fallback genre data');
    console.log('   → Movie generation may not work');
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Test in browser: https://api.themoviedb.org/3/genre/movie/list?api_key=' + API_KEY);
    console.log('   2. Check firewall/antivirus settings');
    console.log('   3. Try different network connection');
    console.log('   4. Check proxy configuration');
  } else if (genreTest && movieTest) {
    console.log('🎉 All tests passed! TMDb API is working correctly.');
  } else {
    console.log('⚠️ Partial connectivity - some requests work, others fail');
  }
}

runTests().catch(err => {
  console.error('Test script error:', err);
  process.exit(1);
});
