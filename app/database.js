function create(db, col, obj, callback){
    console.log("DB: creating");
    db.collection(col).save(obj, function(err, result){
        if (err){
            console.log("MAYDAY! MAYDAY! Crashing.");
            return console.log(err);
        }
        console.log("Successfully saved this object:");
        console.log(obj);
        callback(result);
    })
}

function read(db, col, obj, callback){                                
    console.log("DB: reading");
    db.collection(col).find(obj).toArray(function(err, result){
        if (err){
            console.log("MAYDAY! MAYDAY! Crashing.");
            return console.log(err);
        }
        console.log("FIND: pulled " + result.length + " records from '" + col + "' for the query:");
        console.log(obj);
        callback(result);
    })
}

function update(db, col, item, query, callback){
    console.log("DB: updating");
    console.log("item is: ");
    console.log(item);
    console.log("query is: ");
    console.log(query);

    db.collection(col).update(item, query, function displayAfterUpdating(){
        console.log("Updated successfully! Fetching object: ");
        read(db, col, item, function showUpdated(updatedItem){           // do we need to find the item again?
            console.log("HERE IT IS:");
            console.log(updatedItem[0]);
            callback(updatedItem[0]);
        });
    });
}


function remove(db, col, query, callback){
    console.log("DB: deleting");
    db.collection(col).remove(query, function removeThis(err, result) {
        if (err){
            console.log("MAYDAY! MAYDAY! Crashing.");
            return console.log(err);
        }
        callback("Database: Record successfully deleted");
    });
};









module.exports.create = create;
module.exports.read = read;
module.exports.update = update;
module.exports.remove = remove;