const express = require("express");
const Job = require("../../../schemas/Job");
const News = require("../../../schemas/News");
const Forum = require("../../../schemas/Forum");
const homeController = require("../controllers/home");
//--////////////////////////////////
//--////////////////////////////////
const paginationResults = require('../../../middleware/paginationMiddleware');
const advancedResults = require('../../../middleware/advancedResults');
const { protect, authorize } = require('../../../middleware/auth');
//--////////////////////////////////
let routes = function(){
    let routes = express.Router({mergeParams: true});
    //--////////////////////////////////
    routes.route("/news").get([protect], advancedResults(News, {path: 'user', select: 'name picture' }), homeController.fetchNews);
    routes.route("/fourms").get([protect], advancedResults(Forum, {path: 'user', select: 'name picture' }), homeController.fetchForum);
    routes.route("/jobs").get([protect], authorize('company'), advancedResults(Job, {path: 'user', select: 'name picture' }), homeController.fetchJobs);
    routes.route("/stats/:id").get([protect], authorize('company'), homeController.stats);
    routes.route("/applications/:id").get([protect], authorize('company'), homeController.applications);
    routes.route("/applicationUpdate/:id").put([protect], authorize('company'), homeController.updateApplicationStatus);

    
    return routes;
};
//--////////////////////////////////
module.exports = routes;