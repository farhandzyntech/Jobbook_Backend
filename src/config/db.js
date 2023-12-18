const mongoose = require('mongoose')

exports.connect = () => {
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("MongoDB Connected Successfully")
    }).catch(()=>{
        console.error("Error Connecting to MongoDB Database")
    })
}


