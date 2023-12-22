const asyncHandler = require('../middleware/async');
const News = require('../schemas/News');
const ErrorResponse = require('../utils/errorResponse');

exports.create = async (req, res, next)=>{
    try {
        req.body.user = req.user.id
        if(req.file) req.body.picture = req.file.filename
        const record = await News.create(req.body)
        res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        console.error(error);
        return next(error)
    }
}

// exports.create = async (req, res, next)=>{
//     try {
//         req.body.user = req.user.id
//         if(req.body.tags) req.body.tags = req.body.tags.split(',')
//         if(req.files && req.files.length > 0) req.body.photos = req.files.map(a=>a.filename)
//         const record = await News.create(req.body)
//         res.status(200).json({
//             success: true,
//             data: record
//         });
//     } catch (error) {
//         console.error(error);
//         return next(error)
//     }
// }

exports.update = async (req, res, next)=>{
    try {
        const record = await News.findById(req.params.id)
        if(!record) return next(new ErrorResponse("Record not found!", 400))
          // Make sure user is job owner
        if (record.user.toString() !== req.user.id && req.user.role !== 'talent') {
            return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this job`,
                401
            )
            );
        }
        record.title = req.body.title || record.title;
        record.description = req.body.description || record.description;
        record.location = req.body.location || record.location;
        record.tags = req.body.tags || record.tags;
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

exports.delete = async (req, res, next)=>{
    try {
        const record = await News.findById(req.params.id)
        if(!record) return next(new ErrorResponse("Record not found!", 400))
          // Make sure user is job owner
        if (record.user.toString() !== req.user.id && req.user.role !== 'talent') {
            return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this job`,
                401
            )
            );
        }
        await record.deleteOne()
        res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        console.error(error);
        return next(error)
    }
}

//fetch all my Newss
exports.fetch = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});
