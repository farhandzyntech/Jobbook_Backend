const express = require("express");
const Forum = require("../../../schemas/Forum");
const forumController = require("../../../controllers/forum");

//--//

const advancedResults = require('../../../middleware/advancedResults');
const { protect, authorize } = require('../../../middleware/auth');
//--//
let routes = function(){
    let routes = express.Router({mergeParams: true});
    //--//
    routes.route("/create").post([protect], authorize('talent'), forumController.create);
    routes.route("/fetch").get([protect], authorize('talent'), advancedResults(Forum, {path: 'user', select: 'name' }), forumController.fetch);
    routes.route("/update/:id").put([protect], authorize('talent'), forumController.update);
    routes.route("/delete/:id").delete([protect], authorize('talent'), forumController.delete);
    //--//
    return routes;
};
//--//
module.exports = routes;