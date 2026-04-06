const isAdmin = (req, res, next) => {
  const userId = req.headers.userid || req.headers.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No userId provided' });
  }

  const User = require('../models/User');

  User.findOne({ userId })
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      req.user = user;
      next();
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
};

module.exports = { isAdmin };
