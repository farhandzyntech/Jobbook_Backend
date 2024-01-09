const asyncHandler = require('../../../middleware/async');
const Forum = require('../../../schemas/Forum');
const ErrorResponse = require('../../../utils/errorResponse');

exports.create = async (req, res, next)=>{
    try {
        req.body.user = req.user.id
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
        const record = await Forum.findById(req.params.id)
        if(!record) return next(new ErrorResponse("Record not found!", 400))
          // Make sure user is Forum owner
        if (record.user.toString() !== req.user.id && req.user.role !== 'talent') {
            return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this Forum`,
                401
            )
            );
        }
        record.title = req.body.title
        record.description = req.body.description
        await record.save(req.body)
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
        const record = await Forum.findById(req.params.id)
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

exports.fetch = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});
