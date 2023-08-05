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
        owner: movie.owner,
        movieId: movie.movieId,
        nameRU: movie.nameRU,
        nameEN: movie.nameEN,
        _id: movie._id,
      })));
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  MovieModel
    .create({ ...req.body })
    .then((movie) => {
      console.log(movie);
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
      console.log(err);
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
