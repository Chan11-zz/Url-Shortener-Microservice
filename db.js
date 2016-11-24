var mongodb=require('mongodb');
var MongoClient=mongodb.MongoClient;
var db=null;
var url = process.env.MONGOLAB_URI;

function insertDoc(doc,collection){
    return new Promise(function(resolve,reject){
        collection.insert(doc,function(err,res){
        if(err){
            //console.log("error finding document");
            reject(err);
        } else {
            //console.log("in insertDoc");
            resolve(res);
        }
    });
    });
  }

function findDoc(doc,collection){

    return new Promise(function(resolve,reject){
        collection.findOne(doc,function(err,res){
        if(err){
            //console.log("error finding document");
            reject(err);
        } else {
            //console.log("in findDoc");
            //console.log(res);
            resolve(res);
        }
    });
    });

}

function deleteDoc(doc,collection){
    return new Promise(function(resolve,reject){
        collection.remove(doc,function(err,res){
        if(err){
            //console.log("error deleting document");
            reject(err);
        } else {
            resolve(res);
        }
    });
    });
}

var connectMongo=function(){
  MongoClient.connect(url,function(err,_db){
    if (err) {
    //console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //console.log('Connection established to', url);
    db=_db;//stores db instance of mongoclient in variable db
}
  });
};
var easyMongo=function(work,appCollection,doc){//root function which handles db operations

return new Promise(function(resolve,result){

   var collection=db.collection(appCollection);

        work(doc,collection,db).then(function(result){
      //console.log(result,"result from easyMongo");
     resolve(result);
   });

});

};

var closeMongo=function(){
    db.close();
    //console.log("Mongo Closed");
};
module.exports={
    connectMongo:connectMongo,
    insertDoc:insertDoc,
    deleteDoc:deleteDoc,
    findDoc:findDoc,
    easyMongo:easyMongo,
    closeMongo:closeMongo
};
