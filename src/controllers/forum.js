const asyncHandler = require('../middleware/async');
const Forum = require('../schemas/Forum');
const ErrorResponse = require('../utils/errorResponse');

exports.create = async (req, res, next)=>{
    try {
        req.body.user = req.user.id
        if(req.file) req.body.picture = req.file.filename
        const record = await Forum.create(req.body)
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
        const record = await Forum.findById(req.params.id)
        if(!record) return next(new ErrorResponse("Record not found!", 400))
          // Make sure user is Forum owner
        if (record.user.toString() !== req.user.id && req.user.role !== 'company') {
            return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this Forum`,
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

//fetch all my News
exports.fetch = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
  });

//get single Forum 
exports.getNews = asyncHandler(async (req, res, next) => {
    const record = await Forum.findById(req.params.id);

    if (!record) {
        return next(
        new ErrorResponse(`record not found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({ success: true, data: record });
});
