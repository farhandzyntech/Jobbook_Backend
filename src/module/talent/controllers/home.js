const asyncHandler = require('../../../middleware/async');
const Application = require('../../../schemas/Application');
const Notification = require('../../../schemas/Notification');
const Saved = require('../../../schemas/Saved');
const Job = require('../../../schemas/Job');
const User = require('../../../schemas/User');
const ErrorResponse = require('../../../utils/errorResponse');
const renderToPDF = require('../../../utils/pdfGenerator'); 
const renderToPDFNEW = require('../../../utils/newpdfGenerator'); 
const notification = require('../../../utils/notifications');
// '../utils/pdfGenerator';


exports.fetchForum = asyncHandler(async (req, res, next) => { 
    res.status(200).json(res.advancedResults);
});

exports.fetchNews = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.fetchJobs = async (req, res, next) => {
    const userId = req.user._id; // This should be set by your authentication middleware
    let findFilter = {}
    const { filter } = req.query; // Expected to be 'saved', 'applied', or not provided
    const { title, description, category, speciality, type, location, salMin, salMax } = req.query; // Expected to be string

    try {
        const userWithJobs = await User.findById(userId)
            .populate(filter === 'applied' ? { path: "appliedJobs", populate:{ path:'user', select:"name picture" } } : '') // Populate only if filter is 'applied'
            .populate(filter === 'saved' ? { path: "savedJobs", populate:{ path:'user', select:"name picture" } } : ''); // Populate only if filter is 'saved'

        if (!userWithJobs) {
            return res.status(404).send('User not found');
        }

        let jobs = [];

        if(title) {
            findFilter.title = new RegExp(title, 'i')
            // findFilter.push({ title: new RegExp(title, 'i') })
        }

        if(description){
            findFilter.description = new RegExp(description, 'i')
            // findFilter.push({ description: new RegExp(description, 'i') })
        }

        if(category){
            findFilter.category = category
            // findFilter.push({ category: new RegExp(category, 'i') })
        }

        if(speciality){
            findFilter.speciality = speciality
            // findFilter.push({ speciality: new RegExp(speciality, 'i') })
        }

        if(type){
            findFilter.type = type
            // findFilter.push({ type: new RegExp(type, 'i') })
        }

        if(location){
            findFilter.location = location
            // findFilter.push({ location: new RegExp(location, 'i') })
        }

        if(salMin){
            findFilter.salMin =  { $gte: salMin }
            // findFilter.push({ salMin: new RegExp(salMin, 'i') })
        }
        if(salMax){
            findFilter.salMax = { $lte: salMax }
            // findFilter.push({ salMax: new RegExp(salMax, 'i') })
        }

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
            const allJobs = await Job.find(findFilter).populate({path: 'user', select: 'name picture'});

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

exports.allJobs = async (req, res, next) => {
    let findFilter = {}
    const { title, description, category, speciality, type, location, salMin, salMax } = req.query; // Expected to be string

    try {
        if(title) {
            findFilter.title = new RegExp(title, 'i')
            // findFilter.push({ title: new RegExp(title, 'i') })
        }

        if(description){
            findFilter.description = new RegExp(description, 'i')
            // findFilter.push({ description: new RegExp(description, 'i') })
        }

        if(category){
            findFilter.category = category
            // findFilter.push({ category: new RegExp(category, 'i') })
        }

        if(speciality){
            findFilter.speciality = speciality
            // findFilter.push({ speciality: new RegExp(speciality, 'i') })
        }

        if(type){
            findFilter.type = type
            // findFilter.push({ type: new RegExp(type, 'i') })
        }

        if(location){
            findFilter.location = location
            // findFilter.push({ location: new RegExp(location, 'i') })
        }

        if(salMin){
            findFilter.salMin =  { $gte: salMin }
            // findFilter.push({ salMin: new RegExp(salMin, 'i') })
        }
        if(salMax){
            findFilter.salMax = { $lte: salMax }
            // findFilter.push({ salMax: new RegExp(salMax, 'i') })
        }

        // Fetch all jobs from the database
        const allJobs = await Job.find(findFilter).populate({path: 'user', select: 'name picture'});
    
        res.status(200).json({
            success: true,
            data: allJobs                                                       
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
        // // Check if the job application already exists
        const existingApplication = await Application.findOne({ user: userId, job: jobId });
        if (existingApplication) {
            return next(new ErrorResponse('You have already applied for this job', 409));
        }

        // // Create a new job application
        const newApplication = new Application({
            job: jobId,
            user: userId,
            ...req.body
        });

        // // Save the new job application
        const app = await newApplication.save();

        if(app){
            // Update the user's appliedJobs
            await User.findByIdAndUpdate(userId, { $addToSet: { appliedJobs: jobId } });

            // Update the job's appliedByUsers
            const job = await Job.findByIdAndUpdate(jobId, { $addToSet: { appliedByUsers: userId } }).populate({path: 'user', select: 'tokens'});
            // console.log(job);
            const deviceTokens = job.user.tokens.map(obj => obj.device_token).filter(token => token !== undefined);
            const myDeviceTokens = req.user.tokens.map(obj => obj.device_token).filter(token => token !== undefined);
            //send notification
            const notificationBody1 = {
                fromUserId: req.user.id, 
                toUserId: job.user.id, 
                job: jobId, 
                deviceTokens,
                title: 'New Job Added',
                body: `New Job Application from ${req.user.name}`,
            }
            notification.sendPushNotification(notificationBody1);
            const notificationBody2 = {
                fromUserId: job.user.id, 
                toUserId: req.user.id, 
                job: jobId, 
                deviceTokens: myDeviceTokens,
                title: 'Job Application Submitted',
                body: `You have successfully submitted the job application`,
            }
            notification.sendPushNotification(notificationBody2);
        }

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

exports.generate = async (req, res, next) => {
    const data = req.body; // Assuming JSON input
    try {
        req.body.skills = (req.body.skills) ? JSON.parse(req.body.skills) : []
        req.body.education = (req.body.education) ? JSON.parse(req.body.education) : []
        req.body.experience = (req.body.experience) ? JSON.parse(req.body.experience) : []
      const pdfPath = await renderToPDF.renderToPDF(data);
      res.send({ message: 'PDF generated successfully.', path: pdfPath.substring(1) });
    } catch (error) {
      res.status(500).send({ message: 'Failed to generate PDF.', error: error.message });
    }
}

exports.generatePdf = async (req, res, next) => {
    const data = req.body; // Assuming JSON input
    try {
      const pdfPath = await renderToPDFNEW.renderToPDF(data);
      console.log(pdfPath);
      res.json({ message: 'PDF generated successfully.', path: pdfPath });
    } catch (error) {
      res.status(500).send({ message: 'Failed to generate PDF.', error: error.message });
    }
}

exports.notifications = async (req, res, next) => {
    try{
        const notification = await Notification.find({to: req.user.id})
        .populate({ path: 'from', select:'name picture'})
        .populate({ path: 'to', select:'name picture'});
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