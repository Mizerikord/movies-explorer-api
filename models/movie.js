const mongoose = require('mongoose');
const validator = require('validator');

const movieSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error('Некорректный URL');
      }
    },
    required: [true, 'Необходимо указать ссылку на изображение'],
  },
  trailerLink: {
    type: String,
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error('Некорректный URL');
      }
    },
    required: [true, 'Необходимо указать ссылку на трейлер'],
  },
  thumbnail: {
    type: String,
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error('Некорректный URL');
      }
    },
    required: [true, 'Необходимо указать ссылку на постер'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  movieId: {
    type: Number,
    unique: true,
    required: true,
  },
  nameRU: {
    type: String,
    required: true,
  },
  nameEN: {
    type: String,
    required: true,
  },
  created_at: {
    type: String,
  },
  updated_at: {
    type: String,
  },
}, { versionKey: false });

module.exports = mongoose.model('movie', movieSchema);
