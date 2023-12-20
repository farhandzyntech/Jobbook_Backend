const express = require("express");
//--//
let routes = function(){
    const router = express();
    //--//
    router.use("/auth", require("./auth")());
    router.use("/job", require("./job")());
    router.use("/news", require("./news")());
    router.use("/forum", require("./forum")());

    //--//
    return router;
};
module.exports = routes;