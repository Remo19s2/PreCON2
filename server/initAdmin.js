const User = require('./models/User');

const ensureAdminExists = async () => {
  try {
    const result = await User.updateOne(
      { userId: 'admin' },
      {
        $set: {
          userId: 'admin',
          name: 'Administrator',
          preferredGenre: 'Action',
          preferredLanguage: 'hi',
          role: 'admin'
        }
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log('✅ Default admin user created');
    } else {
      console.log('✅ Admin user verified');
    }
  } catch (error) {
    console.error('❌ Error ensuring admin exists:', error);
  }
};

module.exports = { ensureAdminExists };
