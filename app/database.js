/* CRUD */

function create(db, col, obj, callback){
    console.log("DB: creating");
    db.collection(col).save(obj, function(err, result){
        if (err){
            console.log("MAYDAY! MAYDAY! Crashing.");
            console.log(err);
        }
        console.log("Successfully saved this object to '" + col + "' :");
        console.log(obj);
        callback(result);
    })
}

function read(db, col, obj, callback){                                
    console.log("DB: reading");
    db.collection(col).find(obj).toArray(function(err, result){
        if (err){
            console.log("MAYDAY! MAYDAY! Crashing.");
            console.log(err);
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

    db.collection(col).update(item, query, {upsert: true},  function displayAfterUpdating(){
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
            console.log(err);
        }
        callback("Database: Record successfully deleted");
    });
};


/* non-CRUD function */

function count(db, col, obj, callback){                                
    console.log("DB: counting");
    db.collection(col).count(function(err, count){
        if (err){
            console.log("MAYDAY! MAYDAY! Crashing.");
            console.log(err);
        }
        console.log("FIND: pulled " + count + " records from '" + col + "' for the query:");
        console.log(obj);
        callback(count);
    })
}

function sortRead(db, col, obj, sort, callback){                                
    console.log("DB: reading WITH SORT");
    db.collection(col).find(obj).sort(sort).toArray(function(err, result){
        if (err){
            console.log("MAYDAY! MAYDAY! Crashing.");
            console.log(err);
        }
        console.log("FIND: pulled " + result.length + " records from '" + col + "' for the query WITH SORT:");
        console.log(obj);
        console.log(sort);
        callback(result);
    })
}


module.exports.create = create;
module.exports.read = read;
module.exports.update = update;
module.exports.remove = remove;

module.exports.count = count;
module.exports.sortRead = sortRead;
