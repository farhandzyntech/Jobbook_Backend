const asyncHandler = require('../../../middleware/async');
const Application = require('../../../schemas/Application');
const Saved = require('../../../schemas/Saved');
const Job = require('../../../schemas/Job');
const User = require('../../../schemas/User');
const ErrorResponse = require('../../../utils/errorResponse');

exports.fetchForum = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.fetchNews = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.fetchJobs = async (req, res, next) => {
    const userId = req.user._id; // This should be set by your authentication middleware
    const { filter } = req.query; // Expected to be 'saved', 'applied', or not provided

    try {
        const userWithJobs = await User.findById(userId)
            .populate(filter === 'applied' ? { path: "appliedJobs", populate:{ path:'user', select:"name picture" } } : '') // Populate only if filter is 'applied'
            .populate(filter === 'saved' ? { path: "savedJobs", populate:{ path:'user', select:"name picture" } } : ''); // Populate only if filter is 'saved'

        if (!userWithJobs) {
            return res.status(404).send('User not found');
        }

        let jobs = [];

        // If filter is set to 'applied', return only applied jobs
        if (filter === 'applied') {
            jobs = userWithJobs.appliedJobs;
        }
        // If filter is set to 'saved', return only saved jobs
        else if (filter === 'saved') {
            jobs = userWithJobs.savedJobs;
        }
        // If no filter is provided, return all jobs with flags
        else {
            // Fetch the specific user with the populated 'appliedJobs' and 'savedJobs'
            const userWithJobs = await User.findById(userId)
            .populate('appliedJobs')
            .populate('savedJobs');

            // If the user is not found, send a 404 response
            if (!userWithJobs) {
                return res.status(404).send('User not found');
            }

            // Create a Set for quick lookup of IDs
            const appliedJobIds = new Set(userWithJobs.appliedJobs.map(job => job._id.toString()));
            const savedJobIds = new Set(userWithJobs.savedJobs.map(job => job._id.toString()));

            // Fetch all jobs from the database
            const allJobs = await Job.find().populate({path: 'user', select: 'name picture'});

            // Map over allJobs to add 'applied' and 'saved' flags
            jobs = allJobs.map(job => {
                const jobObject = job.toObject();
                jobObject.applied = appliedJobIds.has(job._id.toString());
                jobObject.saved = savedJobIds.has(job._id.toString());
                return jobObject;
            });
        }

        res.status(200).json({
            success: true,
            data: jobs                                                       
        })
    } catch (error) {
        console.error(error);
        return next(error)
    }
}

exports.filterjobs = asyncHandler(async (req, res, next) => {
try {
    const userId = req.user.id
    const { jobFetchType, status, page = 1, limit = 10 } = req.query;
    const filters = {};

    // Build filters for status if provided
    if (status) { filters.status = status }

    const skip = (page - 1) * limit;
    let jobs = [];
    const userObjectId = userId;
    // const userObjectId = mongoose.Types.ObjectId(userId);

    switch (jobFetchType) {
      case 'applied':
        // Fetch applied jobs with status filter and pagination
        // const appliedJobs = await Application.find({ user: userObjectId, ...filters })
        // .populate({path: 'user', select: 'name picture'})
        // .populate({path: 'job', match: filters})
        // .skip(skip).limit(limit).exec();
        const appliedJobs = await Job.find()
        .populate({path: 'user', select: 'name picture'})
        .populate({path: 'applications', user: userObjectId})
        .skip(skip).limit(limit).exec();
        jobs = appliedJobs
        // jobs = appliedJobs.map(job => job.jobId).filter(job => job); // Filter out nulls if no match
        break;
      case 'saved': 
        // Fetch saved jobs with status filter and pagination
        const savedJobs = await Saved.find({ user: userObjectId, ...filters })
        .populate({path: 'job',match: filters })
        .skip(skip).limit(limit).exec();
        jobs = savedJobs // Filter out nulls if no match
        // jobs = savedJobs.map(job => job.jobId).filter(job => job); // Filter out nulls if no match
        break;
      default:
        // Fetch all jobs with status filter and pagination
        jobs = await Job.find(filters)
        .populate({ path: 'user', select: 'name picture' })
        .skip(skip).limit(limit).exec();
        break;
    }

    // res.json(jobs);
    res.status(200).json({
        success:true,
        data: jobs                                                       
    })
  } catch (err) {
    res.status(500).send(err.message);
  }
});

exports.applyOld = async (req, res, next)=>{
    try {
        const userId = req.user.id
        const record = await Job.findById(req.params.id)
        if(!record) return next(new ErrorResponse("No record found!", 400))
        let request = await Application.findOne({user: userId, job: req.params.id})
        // //if the user has already applied for this job then throw error else continue to apply
        if(request){
            return next(new ErrorResponse('You have already applied for this job', 409));
        }else {
            //create a new request and save it in db
            request = new Application({ user: userId, job: req.params.id })
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

exports.apply = async (req, res, next)=>{
    const userId = req.user.id
    const jobId = req.params.id
    try {
        // Check if the job application already exists
        const existingApplication = await Application.findOne({ user: userId, job: jobId });
        if (existingApplication) {
            return next(new ErrorResponse('You have already applied for this job', 409));
        }

        // Create a new job application
        const newApplication = new Application({
            job: jobId,
            user: userId,
            ...req.body
        });

        // Save the new job application
        const app = await newApplication.save();

        // Update the user's appliedJobs
        await User.findByIdAndUpdate(userId, { $addToSet: { appliedJobs: jobId } });

        // Update the job's appliedByUsers
        await Job.findByIdAndUpdate(jobId, { $addToSet: { appliedByUsers: userId } });

        res.status(200).send({
            success:true,
            data: app                                                       
        })
        // res.status(201).send('Successfully applied to the job.');
    }catch (error) {
        console.error(error);
        return next(error)
    }
}

exports.saveToggle = async (req, res, next) => {
    const jobId = req.params.id;
    const userId = req.user.id
    const { action } = req.body; // action can be 'save' or 'unsave'
    try {
        const user = await User.findById(userId).select("+savedJobs");
        const job = await Job.findById(jobId).select("+savedByUsers");;

        if (!user || !job) {
            return res.status(404).send('User or Job not found');
        }

        if (action === 'save') {
            // Save job
            if (!user.savedJobs.includes(jobId)) {
                user.savedJobs.push(jobId);
                job.savedByUsers.push(userId);
            }
        } else if (action === 'unsave') {
            // Unsave job
            user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
            job.savedByUsers = job.savedByUsers.filter(id => id.toString() !== userId);
        } else {
            return res.status(400).send('Invalid action');
        }

        await user.save();
        await job.save();

        res.status(200).send({
            success:true,
            message: `Job ${action === 'save' ? 'saved' : 'unsaved'} successfully`        
        })
    } catch (error) {
        console.error(error);
        return next(error)
    }
};

// exports.savedToggleOld = async (req, res, next)=>{
//     try {
//         const record = await Job.findById(req.params.id)
//         if(!record) return next(new ErrorResponse("No record found!", 400))
//         let request = await Saved.findOne({user: req.user.id, job: req.params.id})
//         if(!request){
//             //create a new request and save it in db
//             request = new Saved({ user: req.user.id, job: req.params.id })
//             await request.save();
//             //send response
//             res.status(200).json({
//                 success:true,
//                 data: request
//             })
//         }else {
//             await request.deleteOne({user: req.user.id, job: req.params.id});
//             res.status(200).json({
//                 success:true,
//                 data: request
//             })
//         }
//     } catch (error) {
//         console.error(error);
//         return next(error)
//     }
// }

// exports.jobsfilter = async (req, res, next)=>{
//     try {
//         const { status } = req.query;

//           let jobs;
      
//           switch (status) {
//             case 'applied':
//               jobs = await Job.find()
//               break;
//             case 'interviews':
//               // Assuming there is a field in the Job schema to indicate scheduled interviews
//               jobs = await Job.find({ interviewsScheduled: { $exists: true, $not: { $size: 0 } } }).exec();
//               break;
//             case 'closed':
//               // Assuming there is a field in the Job schema to indicate closed jobs
//               jobs = await Job.find({ closed: true }).exec();
//               break;
            
//             default:
//               res.status(400).json({ error: 'Invalid status parameter' });
//               return;

//           }


//         const record = await Job.findById(req.params.id)
//         if(!record) return next(new ErrorResponse("No record found!", 400))
//         let request = await Saved.findOne({user: req.user.id, job: req.params.id})
//         if(!request){
//             //create a new request and save it in db
//             request = new Saved({ user: req.user.id, job: req.params.id })
//             await request.save();
//             //send response
//             res.status(200).json({
//                 success:true,
//                 data: request
//             })
//         }else {
//             await request.deleteOne({user: req.user.id, job: req.params.id});
//             res.status(200).json({
//                 success:true,
//                 data: request
//             })
//         }
//     } catch (error) {
//         console.error(error);
//         return next(error)
//     }
// }

// exports.oldfetchJobs = async (req, res, next) => {
//     // Assume the user is authenticated and their ID is available
//     const userId = req.user.id; // This should be set by your authentication middleware

//     try {
//         // Fetch the specific user with the populated 'appliedJobs' and 'savedJobs'
//         const userWithJobs = await User.findById(userId)
//             .populate('appliedJobs')
//             .populate('savedJobs');

//         // If the user is not found, send a 404 response
//         if (!userWithJobs) {
//             return res.status(404).send('User not found');
//         }

//         // Create a Set for quick lookup of IDs
//         const appliedJobIds = new Set(userWithJobs.appliedJobs.map(job => job._id.toString()));
//         const savedJobIds = new Set(userWithJobs.savedJobs.map(job => job._id.toString()));

//         // Fetch all jobs from the database
//         const allJobs = await Job.find();

//         // Map over allJobs to add 'applied' and 'saved' flags
//         const jobsWithFlags = allJobs.map(job => {
//             const jobObject = job.toObject();
//             jobObject.applied = appliedJobIds.has(job._id.toString());
//             jobObject.saved = savedJobIds.has(job._id.toString());
//             return jobObject;
//         });

//         // Send the modified job objects back in the response
//         // res.status(200).json(jobsWithFlags);
//         res.status(200).json({
//             success:true,
//             data: jobsWithFlags                                                       
//         })
//     } catch (error) {
//         console.error(error);
//         return next(error)
//     }
// }