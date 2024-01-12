// paginationMiddleware.js
const { validationResult } = require('express-validator');

const paginateResults = (model) => async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};

  try {
    results.results = await model.find()
      .limit(limit)
      .skip(startIndex)
      .exec();

    if (endIndex < (await model.countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit: limit
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      };
    }

    res.paginatedResults = results;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = paginateResults;
