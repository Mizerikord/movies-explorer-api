const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500 ? `На сервере произошла ошибка ${statusCode}` : `${message}. Код ошибки ${statusCode}`,
    });
  next();
};

module.exports = { errorHandler };
