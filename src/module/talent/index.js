const express = require("express");
//--//
let routes = function(){
    const router = express();
    //--//
    // router.use("home/", require("./routes/home")());
    router.use("/job", require("./routes/job")());
    router.use("/news", require("./routes/news")());
    router.use("/forum", require("./routes/forum")());
    //--//
    return router;
};
module.exports = routes;