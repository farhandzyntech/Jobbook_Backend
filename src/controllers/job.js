const asyncHandler = require('../middleware/async');
const Job = require('../schemas/Job');
const User = require('../schemas/User');
const Request = require('../schemas/Request');
const ErrorResponse = require('../utils/errorResponse');
const Saved = require('../schemas/Saved');

exports.create = async (req, res, next)=>{
    try {
        req.body.user = req.user.id
        if(req.file) req.body.picture = req.file.filename
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

exports.update = async (req, res, next)=>{
    try {
        if(!req.params.id) return next(new ErrorResponse("Please provide an id", 400))
        const record = await Job.findById(req.params.id)
        if(!record) return next(new ErrorResponse("Record not found!", 400))
          // Make sure user is job owner
        if (record.user.toString() !== req.user.id && req.user.role !== 'company') {
            return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this job`,
                401
            )
            );
        }
        record.type = req.body.type || record.type;
        record.travel = req.body.travel || record.travel;
        record.location = req.body.location || record.location;
        record.salary = req.body.salary || record.salary;
        record.salaryMode = req.body.salaryMode || record.salaryMode;
        record.speciality = req.body.speciality || record.speciality;
        record.category = req.body.category || record.category;
        record.description = req.body.description || record.description;
        record.picture = (req.file) ? req.file.filename : record.picture || "";
        await record.save()
        res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        console.error(error);
        return next(error)
    }
}

//fetch all my jobs
exports.fetch = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
  });

//get single job 
exports.getJob = asyncHandler(async (req, res, next) => {
    const record = await Job.findById(req.params.id);

    if (!record) {
        return next(
        new ErrorResponse(`record not found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({ success: true, data: record });
});

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

exports.apply = async (req, res, next)=>{
    try {
        const record = await Job.findById(req.params.id)
        if(!record) return next(new ErrorResponse("No record found!", 400))
        let request = await Request.findOne({user: req.user.id, job: req.params.id})
        // //if the user has already applied for this job then throw error else continue to apply
        if(request){
            return next(new ErrorResponse('You have already applied for this job', 409));
        }else {
            //create a new request and save it in db
            request = new Request({ user: req.user.id, job: req.params.id })
            await request.save();
            //send response
            res.status(200).json({
                success:true,
                data: request
            })
        }
    } catch (error) {
        console.error(error);
        return next(error)
    }
}

exports.savedToggle = async (req, res, next)=>{
    try {
        const record = await Job.findById(req.params.id)
        if(!record) return next(new ErrorResponse("No record found!", 400))
        let request = await Saved.findOne({user: req.user.id, job: req.params.id})
        if(!request){
            console.log("dkjfghu");
            //create a new request and save it in db
            request = new Saved({ user: req.user.id, job: req.params.id })
            await request.save();
            //send response
            res.status(200).json({
                success:true,
                data: request
            })
        }else {
            await request.deleteOne({user: req.user.id, job: req.params.id});
            res.status(200).json({
                success:true,
                data: request
            })
        }
    } catch (error) {
        console.error(error);
        return next(error)
    }
}

exports.savedJobs = async (req, res, next)=>{
    try {
        const record = await Job.findById(req.params.id)
        if(!record) return next(new ErrorResponse("No record found!", 400))
        let request = await Saved.findOne({user: req.user.id, job: req.params.id})
        if(!request){
            //create a new request and save it in db
            request = new Saved({ user: req.user.id, job: req.params.id })
            await request.save();
            //send response
            res.status(200).json({
                success:true,
                data: request
            })
        }else {
            await request.deleteOne({user: req.user.id, job: req.params.id});
            res.status(200).json({
                success:true,
                data: request
            })
        }
    } catch (error) {
        console.error(error);
        return next(error)
    }
}

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