const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserModel = require('../models/user');

const { NODE_ENV = 'production', JWT_SECRET = 'dev-secret' } = process.env;

const ValidationError = require('../errors/ValidationErrors');
const AutorizationError = require('../errors/AutorizationErrors');
const NotFoundError = require('../errors/NotFoundError');
const DuplicateError = require('../errors/DuplicateError');

const getUsers = async (req, res, next) => {
  await UserModel.find({})
    .then((users) => {
      res.status(200).send(users.map((currentUser) => ({
        name: currentUser.name,
        email: currentUser.email,
        _id: currentUser._id,
      })));
    })
    .catch(next);
};

const patchUser = (req, res, next) => {
  const { name } = req.body;
  const userId = req.user._id;
  UserModel.findById(userId)
    .then((user) => {
      if (!user) {
        next(new AutorizationError('Необходимо авторизоваться'));
        return;
      }
      if (user.name === name) {
        next(new DuplicateError('Это текущее имя пользователя'));
        return;
      }
      UserModel
        .findByIdAndUpdate(
          req.user._id,
          { name },
          { new: true, runValidators: true },
        )
        .then((newUser) => {
          if (!newUser) {
            next(new ValidationError('Некорректные данные'));
            return;
          }
          res.status(200).send({
            name: newUser.name,
            email: newUser.email,
            _id: newUser._id,
          });
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new ValidationError('Некорректные данные'));
            return;
          }
          next(err);
        });
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const { name, email } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => UserModel
      .create({
        name, email, password: hash,
      }))
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Не удалось создать пользователя'));
      }
      return res.status(201).send(
        {
          name: user.name,
          email: user.email,
          _id: user._id,
        },
      );
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new DuplicateError(`Email '${err.keyValue.email}' уже занят`));
        return;
      }
      if (err.name === 'ValidationError') {
        next(new ValidationError('Некорректные данные'));
        return;
      }
      next(err);
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  let loginUser = {};
  return UserModel.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        next(new AutorizationError('Неверный логин или пароль'));
        return;
      }
      loginUser = user;
      // eslint-disable-next-line consistent-return
      return bcrypt.compare(password, user.password);
    }).then((check) => {
      if (!check) {
        next(new AutorizationError('Неверный логин или пароль'));
        return;
      }
      res.status(200).send({
        token: jwt.sign(
          { _id: loginUser._id },
          NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
          { expiresIn: '7d' },
        ),
        status: res.statusCode,
      });
    })
    .catch(next);
};

module.exports = {
  getUsers,
  login,
  patchUser,
  createUser,
};
