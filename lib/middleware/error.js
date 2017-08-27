module.exports = function (err, req, res, next) {
  if (req.headers['user-agent'].startsWith('npm/')) {
    res.status(500).json({
      error: err.message
    })
  } else {
    next(err)
  }
}
