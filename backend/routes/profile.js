const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

// Get user profile
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ profile: user.profile });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/", auth, async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      diet,
      height,
      weight,
      plan,
      specialization,
      availableStart,
      availableEnd,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update profile
    user.profile = {
      name: name !== undefined ? name : user.profile.name,
      age: age !== undefined ? age : user.profile.age,
      gender: gender !== undefined ? gender : user.profile.gender,
      diet: diet !== undefined ? diet : user.profile.diet,
      height: height !== undefined ? height : user.profile.height,
      weight: weight !== undefined ? weight : user.profile.weight,
      plan: plan !== undefined ? plan : user.profile.plan,
      specialization:
        specialization !== undefined
          ? specialization
          : user.profile.specialization,
      availableStart:
        availableStart !== undefined
          ? availableStart
          : user.profile.availableStart,
      availableEnd:
        availableEnd !== undefined ? availableEnd : user.profile.availableEnd,
    };

    await user.save();

    res.json({
      message: "Profile updated successfully",
      profile: user.profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
