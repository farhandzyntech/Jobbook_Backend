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
const { protect } = require('../middleware/auth');
//--//
let routes = function(){
    let routes = express.Router({mergeParams: true});
    //--//
    routes.route("/create").post([protect], upload.single('picture'), jobController.create);
    routes.route("/fetch").get([protect], advancedResults(Job, {path: 'user', select: 'name' }), jobController.fetch);
    //--//
    return routes;
};
//--//
module.exports = routes;