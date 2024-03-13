const express = require("express");
const Job = require("../../../schemas/Job");
const News = require("../../../schemas/News");
const Forum = require("../../../schemas/Forum");
const homeController = require("../controllers/home");
//--////////////////////////////////
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
//--////////////////////////////////
const advancedResults = require('../../../middleware/advancedResults');
const { protect, authorize } = require('../../../middleware/auth');
//--////////////////////////////////
let routes = function(){
    let routes = express.Router({mergeParams: true});
    //--////////////////////////////////
    routes.route("/news").get([protect], advancedResults(News, {path: 'user', select: 'name picture' }), homeController.fetchNews);
    routes.route("/fourms").get([protect], advancedResults(Forum, {path: 'user', select: 'name picture' }), homeController.fetchForum);
    routes.route("/jobs").get([protect], authorize('talent'), homeController.fetchJobs);
    //--////////////////////////////////
    routes.route("/notifications").get([protect], authorize('talent'), homeController.notifications);
    routes.route("/read").get([protect], authorize('talent'), homeController.read);
    //--////////////////////////////////
    routes.route("/apply/:id").post([protect], authorize('talent'), upload.single('resume'), homeController.apply);
    routes.route("/saveToggle/:id").post([protect], authorize('talent'), homeController.saveToggle);
    //--////////////////////////////////
    routes.route("/generate").post([protect], authorize('talent'), homeController.generate);
    routes.route("/generatePdf").get([protect], authorize('talent'), homeController.generatePdf);
    //--////////////////////////////////
    //--////////////////////////////////
    return routes;
};
//--////////////////////////////////
module.exports = routes;