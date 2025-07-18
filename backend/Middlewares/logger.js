exports.requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};

exports.errorLogger = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  next(err);
};