const router = require('express').Router();
const moviesController = require('../controllers/movies');
const { validateMovie, validateMovieId } = require('../middlewares/validate');

// возвращает все сохранённые текущим  пользователем фильмы
router.get('/', moviesController.getMovies);

router.post('/', validateMovie, moviesController.createMovie);

router.delete('/:_Id', validateMovieId, moviesController.deleteMovie);

module.exports = router;
