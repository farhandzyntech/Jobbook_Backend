const asyncHandler = require('../../../middleware/async');
const Application = require('../../../schemas/Application');
const Job = require('../../../schemas/Job');
const User = require('../../../schemas/User');
const ErrorResponse = require('../../../utils/errorResponse');

exports.fetchForum = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.fetchNews = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.fetchJobs = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.fetchTalent = async (req, res, next) => {
    try {
        const records = await User.findOne().select("name email phone picture location experience");
        res.status(200).json({
            success:true,
            data: records
        })
    } catch (error) {
        console.log(error);
        return next(error);
    }
}

exports.stats = async (req, res, next)=>{
    try {
        let totalCount = await Application.countDocuments({job: req.params.id})
        let pendingCount = await Application.countDocuments({status: "Pending", job: req.params.id})
        let shortlistCount = await Application.countDocuments({status: "Shortlisted", job: req.params.id})
        let rejectedCount = await Application.countDocuments({status: "Rejected", job: req.params.id})
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

exports.applications = async (req, res, next)=>{
    try {
        let records = await Application.find({ job: req.params.id, status: (req.query.status) ? req.query.status : ['submitted', 'reviewing', 'accepted', 'rejected'] })
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

exports.updateApplicationStatus = async (req, res, next)=>{
    const applicationId = req.params.id;
    const { status } = req.body; // Get application ID and new status from the request body

    // List of valid statuses
    const validStatuses = ['submitted', 'reviewing', 'accepted', 'rejected'];

    // Check if the new status is valid
    if (!validStatuses.includes(status)) {
        return next(new ErrorResponse('Invalid status', 400));
    }

    try {
        // Find the job application and update its status
        const updatedApplication = await Application.findByIdAndUpdate(
            applicationId,
            { status: status },
            { new: true } // Return the updated document
        );

        if (!updatedApplication) {
            return next(new ErrorResponse('Job Application not found', 404));
        }
        res.status(200).json({
            success:true,
            data: updatedApplication
        })
    } catch (error) {
        console.error(error);
        return next(error)
    }
};
