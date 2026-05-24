const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation rules
const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateSongCreation = [
  body('title').trim().notEmpty().withMessage('Song title is required'),
  body('genre').trim().notEmpty().withMessage('Genre is required'),
  body('releaseDate').isISO8601().withMessage('Valid release date is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be positive'),
  handleValidationErrors
];

const validateArtistProfile = [
  body('artistName').trim().notEmpty().withMessage('Artist name is required'),
  body('genres').isArray().withMessage('Genres must be an array'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateSongCreation,
  validateArtistProfile
};
