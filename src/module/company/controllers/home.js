const asyncHandler = require('../../../middleware/async');
const Request = require('../../../schemas/Request');
const ErrorResponse = require('../../../utils/errorResponse');

exports.stats = async (req, res, next)=>{
    try {
        let totalCount = await Request.countDocuments({job: req.params.id})
        let pendingCount = await Request.countDocuments({status: "Pending", job: req.params.id})
        let shortlistCount = await Request.countDocuments({status: "Shortlisted", job: req.params.id})
        let rejectedCount = await Request.countDocuments({status: "Rejected", job: req.params.id})
        res.status(200).json({
            success:true,
            data: {
                totalCount: totalCount,

                pendingCount: pendingCount,
                shortlistCount: shortlistCount,
                rejectedCount: rejectedCount
            }
        })
    } catch (error) {
        console.error(error);
        return next(error)
    }
}

exports.applicant = async (req, res, next)=>{
    try {
        let records = await Request.find({ job: req.params.id, status: (req.query.status) ? req.query.status : ['Pending', 'Shortlisted', 'Rejected'] })
        .populate({path: 'job'}).populate({ path: 'user', select: 'id name email phone picture location address' })
        res.status(200).json({
            success:true,
            data: records
        })
    } catch (error) {
        console.error(error);
        return next(error)
    }
}

exports.fetchForum = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.fetchNews = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});