const asyncHandler = require('../middleware/async');
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

// exports.fetch = async (req, res, next)=>{
//     try {
//         req.body.user = req.user.id
//         const record = await Job.find(req.body)
//         res.status(200).json({
//             success: true,
//             data: record
//         });
//     } catch (error) {
//         console.error(error);
//         return next(error)
//     }
// }

exports.fetch = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
  });