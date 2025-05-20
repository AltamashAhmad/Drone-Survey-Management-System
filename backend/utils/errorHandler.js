const handleControllerError = (err, res, next) => {
  if (err.code === '22003') {
    return res.status(400).json({ error: 'Number value out of range. Check latitude, longitude, or altitude values.' });
  }
  next(err);
};

const handleNotFound = (result, res, resourceName) => {
  if (result.rows.length === 0) {
    return res.status(404).json({ error: `${resourceName} not found` });
  }
  return null;
};

module.exports = {
  handleControllerError,
  handleNotFound
}; 