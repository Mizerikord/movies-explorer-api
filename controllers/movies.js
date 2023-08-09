const MovieModel = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError');
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
  console.log(req.body);
  MovieModel.find({ movieId: req.body.movieId })
    .then((movies) => {
      if (!movies || movies.length === 0) {
        createNewMovie(req, res, next);
        return;
      }
      updateMovie(req, res, next);
    })
    .catch((err) => {
      next(err);
      console.log(err);
    });
};

const ownerDelete = (res, next, own, currentId) => {
  console.log('овнер');
  MovieModel.findByIdAndUpdate(
    { _id: currentId },
    { $pull: { owner: own } },
    { new: true },
  ).then((movie) => {
    if (!movie) {
      next(new NotFoundError('Уже удалено'));
      return;
    }
    res.status(200).send({
      data: movie,
      message: 'Данные о фильме успешно удалены',
    });
  })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ValidationError('Карточка с таким id не найдена'));
        return;
      }
      next(err);
    })
    .catch(next);
};

const movieDelete = (req, res, next, currentId) => {
  console.log('муви');
  MovieModel
    .findByIdAndRemove(currentId)
    .then((deletedMovie) => {
      res.status(200).send({
        data: deletedMovie,
        message: 'Данные о фильме успешно удалены',
      });
    })
    .catch((err) => {
      if (err.name === 'NotFoundError') {
        next(new NotFoundError('Информация фильме не найдена'));
      }
    })
    .catch(next);
};

const deleteMovie = (req, res, next) => {
  console.log(req.user, req.params._id);
  const currentId = req.params._id;
  const userId = req.user._id;
  MovieModel.findById(currentId)
    .then((movie) => {
      if (!movie) {
        next(new NotFoundError('Вероятно, фильм уже удален'));
        return;
      }
      console.log(movie.owner.length);
      if (movie.owner.length === 1) {
        movieDelete(req, res, next, movie._id);
        return;
      }
      ownerDelete(res, next, userId, currentId);
    }).catch((err) => {
      next(err);
      console.log(err);
    });
};

module.exports = {
  getMovies,
  deleteMovie,
  createMovie,
};
