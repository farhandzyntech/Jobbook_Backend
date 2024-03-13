const { request } = require('express');
const asyncHandler = require('../../../middleware/async');
const Application = require('../../../schemas/Application');
const Notification = require('../../../schemas/Notification');
const Job = require('../../../schemas/Job');
const User = require('../../../schemas/User');
const ErrorResponse = require('../../../utils/errorResponse');
const notification = require('../../../utils/notifications');

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
        const records = await User.find().select("name email phone picture location skills experience offers specialities experiencedIn level expectation");        
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
        let pendingCount = await Application.countDocuments({status: "pending", job: req.params.id})
        let shortlistCount = await Application.countDocuments({status: "accepted", job: req.params.id})
        let rejectedCount = await Application.countDocuments({status: "rejected", job: req.params.id})
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
        let records = await Application.find({ job: req.params.id, status: (req.query.status) ? req.query.status : ['pending', 'reviewing', 'accepted', 'rejected'] })
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
    const validStatuses = ['pending', 'reviewing', 'accepted', 'rejected'];

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

        const user = await User.findById(updatedApplication.user).select('name, tokens')
        const tokens = user.tokens.map(obj => obj.device_token).filter(token => token !== undefined);
        const notificationBody = {
            fromUserId: req.user.id, 
            toUserId: updatedApplication.user, 
            job: updatedApplication.job, 
            deviceTokens: tokens,
            title: `Job Application ${status}`,
            body: `Your job application is ${status} by company`,
        }
        notification.sendPushNotification(notificationBody);

        res.status(200).json({
            success:true,
            data: updatedApplication
        })
    } catch (error) {
        console.error(error);
        return next(error)
    }
};


exports.notifications = async (req, res, next) => {
    try{
        const notification = await Notification.find({to: req.user.id});
        const unReadCount = await Notification.countDocuments({to: req.user.id, read: '0'}) 
        res.status(200).json({
            success: true,
            data: {
                unReadCount,
                notification
            }                                                       
        })
    } catch (error) {
        console.error(error);
        return next(error)
    }
}

exports.read = async (req, res, next) => {
    try{
        const notification = await Notification.updateMany({to: req.user.id}, { read: '1' });

        res.status(200).json({
            success: true,
            // data: notification                                                       
        })
    } catch (error) {
        console.error(error);
        return next(error)
    }
}