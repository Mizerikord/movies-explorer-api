const router = require('express').Router();
const helmet = require('helmet');
const usersController = require('../controllers/users');
const userRouter = require('./users');
const movieRouter = require('./movies');

const NotFoundError = require('../errors/NotFoundError');
const { validateUser } = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { requestLogger, errorLogger } = require('../middlewares/logger');

const allowedCors = [
  'http://diplom.sss.nomoreparties.sbs',
  'https://diplom.sss.nomoreparties.sbs',
  'http://localhost:3000',
];

router.use(requestLogger);
router.use(helmet());

// eslint-disable-next-line consistent-return
router.use((req, res, next) => {
  const { origin } = req.headers;
  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    const { method } = req;
    const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
    const requestHeaders = req.headers['access-control-request-headers'];
    if (method === 'OPTIONS') {
      // разрешаем кросс-доменные запросы любых типов (по умолчанию)
      res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
      // разрешаем кросс-доменные запросы с присланными заголовками
      res.header('Access-Control-Allow-Headers', requestHeaders);
      return res.end();
    }
  }
  next();
});

router.post('/signin', validateUser, usersController.login);
router.post('/signup', validateUser, usersController.createUser);

router.use('/users', auth, userRouter);
router.use('/movie', auth, movieRouter);

router.use('*', () => {
  throw new NotFoundError('Запрашиваемая страница не найдена');
});

router.use(errorLogger);

module.exports = router;
