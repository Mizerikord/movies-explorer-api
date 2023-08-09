const MovieModel = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const ValidationError = require('../errors/ValidationErrors');
const DuplicateError = require('../errors/DuplicateError');

const getMovies = async (req, res, next) => {
  const userId = req.user._id;
  await MovieModel.find({ owner: userId })
    .then((movies) => {
      if (!movies) {
        next(new NotFoundError('У вас тут пусто :('));
        return;
      }
      res.status(200).send(movies.map((movie) => ({
        country: movie.country,
        director: movie.director,
        duration: movie.duration,
        year: movie.year,
        description: movie.description,
        image: movie.image,
        trailerLink: movie.trailerLink,
        thumbnail: movie.thumbnail,
        owner: [movie.owner],
        movieId: movie.movieId,
        nameRU: movie.nameRU,
        nameEN: movie.nameEN,
        _id: movie._id,
      })));
    })
    .catch(next);
};

const updateMovie = (req, res, next) => {
  MovieModel.findOneAndUpdate(
    { movieId: req.body.movieId },
    { $addToSet: { owner: req.body.owner } },
    { new: true },
  ).then((newMovie) => {
    if (!newMovie) {
      next(new NotFoundError('Карточка не найдена'));
      return;
    }
    res.status(200).send(newMovie);
  }).catch((err) => {
    if (err.message === 'NotFound') {
      next(new NotFoundError('Карточка не найдена'));
      return;
    }
    if (err.name === 'CastError') {
      next(new ValidationError('Карточка с таким id не найдена'));
      return;
    }
    next(err);
  })
    .catch(next);
};

const createNewMovie = (req, res, next) => {
  MovieModel
    .create({ ...req.body })
    .then((movie) => {
      res.status(201).send({
        movieId: movie._id,
        country: movie.country,
        director: movie.director,
        duration: movie.duration,
        year: movie.year,
        description: movie.description,
        image: movie.image,
        trailerLink: movie.trailerLink,
        thumbnail: movie.thumbnail,
        owner: movie.owner,
        nameRU: movie.nameRU,
        nameEN: movie.nameEN,
        _id: movie._id,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Внесены некорректные данные'));
        return;
      }
      if (err.code === 11000) {
        next(new DuplicateError('Уже сохранено'));
        return;
      }
      next(err);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  MovieModel.find({ movieId: req.body.movieId })
    .then((movies) => {
      if (!movies || movies.length === 0) {
        createNewMovie(req, res, next);
      }
      updateMovie(req, res, next);
    })
    .catch((err) => {
      next(err);
      console.log(err);
    });
};

const deleteMovie = (req, res, next) => {
  const movieId = req.params._id;
  const userId = req.user._id;
  MovieModel.findById(movieId)
    .then((movie) => {
      const owner = movie.owner.toString();
      if (!movie) {
        next(new NotFoundError('Вероятно, фильм уже удален'));
        return;
      }
      if (owner !== userId) {
        next(new ForbiddenError('Пользователи не совпадают, удаление запрещено'));
        return;
      }
      MovieModel
        .findByIdAndRemove(movieId)
        .then((deletedMovie) => {
          res.status(200).send({
            data: deletedMovie,
            message: 'Данные о фильме успешно удалены',
          });
        });
    })
    .catch((err) => {
      if (err.name === 'NotFoundError') {
        next(new NotFoundError('Информация не найдена'));
        return;
      }
      next();
    })
    .catch(next);
};

module.exports = {
  getMovies,
  deleteMovie,
  createMovie,
};
