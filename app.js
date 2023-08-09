require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const router = require('./routes/index');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

const { PORT = 3000, BD_NAME = 'mongodb://127.0.0.1:27017/filmsdb', NODE_ENV = 'production' } = process.env;

app.use(express.json());

mongoose.connect(NODE_ENV === 'production' ? BD_NAME : 'mongodb://127.0.0.1:27017/filmsdb')
  .then(() => {
    console.log({ message: 'Соединение с базой установлено' });
  })
  .catch(() => {
    process.exit();
  });

app.use(router);

app.use(errors()); // Валидация через Joi
app.use(errorHandler); // Централизованная обработка ошибок

app.listen(PORT, () => {
  console.log(`Приложение работает по порту: ${PORT}`);
});
