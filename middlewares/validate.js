const { celebrate, Joi } = require('celebrate');

// eslint-disable-next-line no-useless-escape
const regex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

const validateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).default('Жак-Ив Кусто'),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

const validateMovie = celebrate({
  body: Joi.object().keys({
    movieId: Joi.number(),
    country: Joi.string().min(2).max(100).required()
      .default('Неизвестно'),
    director: Joi.string().min(2).max(100).required()
      .default('Неизвестно'),
    duration: Joi.number().required()
      .default(0),
    year: Joi.number().max(2023).required()
      .default('2023'),
    description: Joi.string().min(2).max(3000).required()
      .default('Здесь может быть короткое описание'),
    image: Joi.string().required()
      .default('https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png')
      .regex(regex),
    trailerLink: Joi.string().required()
      .default('https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png'),
    thumbnail: Joi.string().required()
      .default('https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png'),
    nameRU: Joi.string().min(2).max(100).required()
      .default('Фильм'),
    nameEN: Joi.string().min(2).max(100).required()
      .default('Film'),
    owner: Joi.string(),
    created_at: Joi.string(),
    updated_at: Joi.string(),
  }),
});

const validateUserData = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).default('Жак-Ив Кусто'),
    email: Joi.string().email().required(),
  }),
});

const validateMovieId = celebrate({
  params: Joi.object({
    _id: Joi.string().hex().length(24).required(),
  }),
});

module.exports = {
  validateUser,
  validateMovie,
  validateUserData,
  validateMovieId,
};
