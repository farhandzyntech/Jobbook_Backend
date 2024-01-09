const express = require("express");
const Job = require("../../../schemas/Job");
const News = require("../../../schemas/News");
const Forum = require("../../../schemas/Forum");
const homeController = require("../controllers/home");
//--////////////////////////////////
//--////////////////////////////////
const advancedResults = require('../../../middleware/advancedResults');
const { protect, authorize } = require('../../../middleware/auth');
//--////////////////////////////////
let routes = function(){
    let routes = express.Router({mergeParams: true});
    //--////////////////////////////////
    routes.route("/stats/:id").get([protect], authorize('company'), homeController.stats);
    routes.route("/applicant/:id").get([protect], authorize('company'), homeController.applicant);
    routes.route("/news").get([protect], authorize('company'), advancedResults(News, {path: 'user', select: 'name' }), homeController.fetchNews);
    routes.route("/fourms").get([protect], authorize('company'), advancedResults(Forum, {path: 'user', select: 'name' }), homeController.fetchForum);
    //--////////////////////////////////
    return routes;
};
//--////////////////////////////////
module.exports = routes;