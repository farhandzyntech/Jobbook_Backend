const Job = require('../schemas/Job');
const ErrorResponse = require('../utils/errorResponse');

exports.create = async (req, res, next)=>{
try {
    req.body.user = req.user.id
    const record = await Job.create(req.body)
    res.status(200).json({
        success: true,
        data: record
      });
} catch (error) {
    console.error(error);
    return next(error)
}
}