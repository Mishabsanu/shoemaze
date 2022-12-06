const mongoClient=require('mongodb').MongoClient;

const state = {
    db:null
}

module.exports.connect=function(done) {
    // const url='mongodb://localhost:27017';
    const url='mongodb+srv://mishabp:mishab123@cluster0.nxpayl7.mongodb.net';
    const dbname='shoeclub'

    mongoClient.connect(url, (err, data) => {
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}

module.exports.get = function(){
    return state.db;
}