const asyncHandler = require('../../../middleware/async');
const Request = require('../../../schemas/Request');
const ErrorResponse = require('../../../utils/errorResponse');

exports.fetchForum = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.fetchNews = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.fetch = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

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