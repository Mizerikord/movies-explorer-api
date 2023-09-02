const router = require('express').Router();
const moviesController = require('../controllers/movies');
const { validateMovie, validateMovieId } = require('../middlewares/validate');

// возвращает все сохранённые текущим  пользователем фильмы
router.get('/', moviesController.getMovies);

// Создание карточки фильма
router.post('/', validateMovie, moviesController.createMovie);

router.delete('/:_id', validateMovieId, moviesController.deleteMovie);

module.exports = router;
