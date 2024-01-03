const express = require("express");
const Job = require("../schemas/Job");
const jobController = require("../controllers/job");
const multer  = require('multer')
const mimetype = require('mime-types')

//--//
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
//--//

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
//--//
let routes = function(){
    let routes = express.Router({mergeParams: true});
    //--//
    routes.route("/create").post([protect], authorize('company'), upload.single('picture'), jobController.create);
    routes.route("/update/:id").put([protect], authorize('company'), upload.single('picture'), jobController.update);
    routes.route("/fetch").get([protect], advancedResults(Job, {path: 'user', select: 'name' }), jobController.fetch);
    routes.route("/fetch/:id").get([protect], jobController.getJob);
    routes.route("/apply/:id").post([protect], authorize('talent'), upload.single('resume'), jobController.apply);
    routes.route("/stats/:id").get([protect], authorize('company'), jobController.stats);
    routes.route("/applicant/:id").get([protect], authorize('company'), jobController.applicant);
    routes.route("/savedToggle/:id").post([protect], authorize('talent'), jobController.savedToggle);
    routes.route("/savedJobs/:id").post([protect], authorize('talent'), jobController.savedToggle);
    //--//
    return routes;
};
//--//
module.exports = routes;