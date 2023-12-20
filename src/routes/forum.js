const express = require("express");
const Forum = require("../schemas/Forum");
const forumController = require("../controllers/forum");
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
    routes.route("/create").post([protect], authorize('company'), upload.single('picture'), forumController.create);
    routes.route("/update/:id").put([protect], authorize('company'), upload.single('picture'), forumController.update);
    routes.route("/fetch").get([protect], advancedResults(Forum, {path: 'user', select: 'name' }), forumController.fetch);
    routes.route("/fetch/:id").get([protect], forumController.getNews);
    //--//
    return routes;
};
//--//
module.exports = routes;