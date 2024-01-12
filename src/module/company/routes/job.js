const express = require("express");
const Job = require("../../../schemas/Job");
const jobController = require("../controllers/job");
const multer  = require('multer')
const mimetype = require('mime-types')
//--////////////////////////////////
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        let extention = mimetype.extension(file.mimetype);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + "."+extention
        cb(null, file.originalname + '-' + uniqueSuffix)
    }
})
const upload = multer({ storage: storage });
//--////////////////////////////////
const advancedResults = require('../../../middleware/advancedResults');
const paginationResults = require('../../../middleware/paginationMiddleware');
const { protect, authorize } = require('../../../middleware/auth');
//--////////////////////////////////
let routes = function(){
    let routes = express.Router({mergeParams: true});
    //--////////////////////////////////
    routes.route("/fetch").get([protect], authorize('company'), advancedResults(Job, {path: 'user', select: 'name' }), jobController.fetch);
    routes.route("/create").post([protect], authorize('company'), upload.single('picture'), jobController.create);
    routes.route("/update/:id").put([protect], authorize('company'), upload.single('picture'), jobController.update);
    //--////////////////////////////////
    routes.route("/jobs").get([protect], authorize('company'), paginationResults(Job), jobController.jobs);
    //--////////////////////////////////
    return routes;
};
//--////////////////////////////////
module.exports = routes;