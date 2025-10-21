const User = require('../models/User');
const auth = require('../auth'); 
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// =======================================================
// C - REGISTER USER (POST /auth/register)
// =======================================================
exports.registerUser = async (req, res) => {
  const { email, password, fullName, jobTitle, bio, shortBio, profilePictureUrl, socialLinks } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    // ✅ Prevent multiple admin accounts (for portfolio CMS use)
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists. Only one admin user allowed.' });
    }

    // ✅ Create new user with profile fields
    const user = await User.create({
      email,
      password,
      fullName,
      jobTitle,
      bio,
      shortBio,
      profilePictureUrl,
      socialLinks,
    });

    res.status(201).json({
      message: 'User registered successfully! 🎉',
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      token: auth.createAccessToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

// =======================================================
// R - LOGIN USER (POST /auth/login)
// =======================================================
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        message: 'Login successful! 🔒',
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        token: auth.createAccessToken(user),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};


// =======================================================
// R - GET USER PROFILE (GET /users/profile)
// =======================================================
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (user) {
      res.status(200).json({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        jobTitle: user.jobTitle,
        bio: user.bio,
        shortBio: user.shortBio,
        profilePictureUrl: user.profilePictureUrl,
        socialLinks: user.socialLinks,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve user profile.', error: error.message });
  }
};

exports.getPublicUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ isAdmin: true })
      .select('fullName jobTitle bio shortBio profilePictureUrl socialLinks');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};




// =======================================================
// U - UPDATE USER PROFILE (PUT /users/profile)
// =======================================================
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // ✅ Parse socialLinks if it's sent as a JSON string
    if (typeof req.body.socialLinks === 'string') {
      try {
        req.body.socialLinks = JSON.parse(req.body.socialLinks);
      } catch (err) {
        console.error('Invalid socialLinks JSON:', err);
        return res.status(400).json({ message: 'Invalid socialLinks format.' });
      }
    }

    // ✅ Upload new profile picture if provided
    if (req.file) {
      if (user.profilePictureUrlPublicId) {
        await cloudinary.uploader.destroy(user.profilePictureUrlPublicId);
      }

      const uploadFromBuffer = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'user_profiles',
              transformation: [{ width: 500, height: 500, crop: 'fill' }],
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const uploadResult = await uploadFromBuffer();
      req.body.profilePictureUrl = uploadResult.secure_url;
      req.body.profilePictureUrlPublicId = uploadResult.public_id;
    }

    // ✅ Update only allowed fields
    const fields = [
      'email',
      'password',
      'fullName',
      'jobTitle',
      'bio',
      'shortBio',
      'profilePictureUrl',
      'profilePictureUrlPublicId',
      'socialLinks'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Profile updated successfully! 👤',
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        jobTitle: updatedUser.jobTitle,
        bio: updatedUser.bio,
        shortBio: updatedUser.shortBio,
        profilePictureUrl: updatedUser.profilePictureUrl,
        socialLinks: updatedUser.socialLinks,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
      token: auth.createAccessToken(updatedUser),
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      message: 'Failed to update profile.',
      error: error.message,
    });
  }
};
