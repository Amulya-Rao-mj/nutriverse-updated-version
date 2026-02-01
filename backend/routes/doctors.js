const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all doctors for appointment booking
router.get('/', auth, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('_id email profile.name')
      .sort('profile.name');
    
    res.json({ doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
