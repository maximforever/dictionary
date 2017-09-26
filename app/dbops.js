const database = require("./database");

function search(db, req, callback){


	searchQuery = {
		term: {
			$regex: RegExp(req.body.term),
			$options: 'i'
		}
	}

	database.read(db, "terms", searchQuery, function(searchResult){

		console.log(searchResult);

		callback({
			status: "success",
			count: searchResult.length,
			body: searchResult
		});

	});
}

function getDefinitions(db, req, callback){


	searchQuery = {
		term: req.body.term
	}

	database.read(db, "definitions", searchQuery, function(searchResult){

		console.log(searchResult);

		var responsesToReturn = [];

		searchResult.forEach(function(oneResult){
			if(!oneResult.removed){
				responsesToReturn.push(oneResult);
			}
		})

		callback({
			status: "success",
			count: responsesToReturn.length,
			body: responsesToReturn
		});

	});
}

function addDefinition(db, req, callback){

	console.log(req.body);


	newDefinitionQuery = {
		id: Math.floor(Date.now()/Math.random()),							// hopefully this should give us a random ID
		term: req.body.term,
		author: "anonymous",
		upvotes: 0,
		downvotes: 0, 
		reportCount: 0,
		removed: false,
		lastEdit: Date(),
		created: Date(),
		body: req.body.definition,
		related: []
	}

	database.create(db, "definitions", newDefinitionQuery, function(createdDefinition){

		console.log(createdDefinition.ops[0]);

		callback({
			status: "success",
			term: createdDefinition.ops[0].term
		});

	});
}


module.exports.search = search;
module.exports.getDefinitions = getDefinitions;
module.exports.addDefinition = addDefinition;