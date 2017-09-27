$(document).ready(main);

var currentTerm = null;



function main(){

	$("#search-button").on("click", function(){
        search();
    });


	$("body").on("click", ".term-link", function(){
		var term = this.getAttribute("id");
		currentTerm = term;
		getDefinition(term);
        $("#new-definition").show();
	});


/* LISTENERS */

	$("body").on("keydown", function(e){
	    if(e.which == 13){
	        search();
	    }
	});

	$("#search-bar").on("keyup", function(e){
		if($("#search-bar").val().length > 3){
			$("#definitions-section").empty();
	    	search();
		} else {
			$("#terms-section").empty();
		}

		if(e.which == 8){
			$("#new-definition").hide();
			console.log("8! Say 8! I'm an 8 again!");
		}
	});

	$("#new-definition-textarea").on("keyup", function(){
		$("#new-definition-char-count").text($("#new-definition-textarea").val().length);
	})

	$("body").on("click", "#add-definition", function(){
		addDefinition();
	});

    $("body").on("click", ".voting-button", function(){
        var type = this.dataset.vote;               // quick way to get data attribute value
        var id = this.parentElement.parentElement.id;

        voteOnDefinition(type, id);
    })


}



/* FUNCTIONS */

function search(){
	var serchTerm = $("#search-bar").val().trim();

    if(serchTerm){

    	var searchQuery = {
    		term: serchTerm.toLowerCase()
    	}

    	$.ajax({
            type: "post",
            data: searchQuery,
            url: "/search",
            success: function(result){
            	if(result.status == "success"){
            		$("#terms-section").empty();
            		console.log("Found " + result.count + " responses");

            		if(result.count > 0){
            			console.log(result.body);	

	            		result.body.forEach(function(term){
	            			displaySearchTerm(term);
	            		});

            		} else {
            			$("#terms-section").append("<div class = 'term'>There's no definition for '" + searchQuery.term + "' yet. You should add one!");
            		}      		
            	} else {
            		console.log(result.error)
            	}
            }
        })
    } else {
    	console.log("you're not searching for anything!");
    }
}

function getDefinition(thisTerm){
	var searchQuery = {
		term: thisTerm.toLowerCase()
	}

	$.ajax({
        type: "post",
        data: searchQuery,
        url: "/get-definitions",
        success: function(result){
        	if(result.status == "success"){
                console.log(result);
        		$("#terms-section").empty();
            	if(result.count > 0){
            		$("#definitions-section").empty();
            		console.log("Found " + result.count + " responses");
                    displayDefinitionsOnPage(result.body);
	            } else {
	            	$("#definitions-section").append("<div class = 'definition'>There are no definitions for <span class = 'bold'>" + thisTerm + "</span>. You should add one.</div>");
	            	displayAddDefinition(thisTerm);
	            }
        	} else {
        		console.log(result.error)
        	}
        }
    })
}

function addDefinition(){

	var definitionBody = $("#new-definition-textarea").val();
	var relatedTerms = $("#new-definition-related-terms").val();

    if(definitionBody.trim()){

    	var related = trimRelatedTerms();



    	var definitionData = {
			term: currentTerm.toLowerCase(),
			definition: definitionBody,
			related: relatedTerms
		}

        console.log(definitionData);
	    
		$.ajax({
	        type: "post",
	        data: definitionData,
	        url: "/new-definition",
	        success: function(result){
	        	if(result.status == "success"){
            		$("#terms-section").empty();
            		$("#definitions-section").empty();
            		$("#definitions-section").append("<div class = 'definition'>Your definition for <span class = 'bold'>" + result.term + "</span> has been submitted.</div>");
            		getDefinition(result.term);	            
                    $("#new-definition").hide();
	        	} else {
	            	$("#definitions-section").empty();
	            	$("#definitions-section").append("<div class = 'definition'>" + result.error + "</div>");
	     		}
	        }
	    })
	}
}

function voteOnDefinition(voteType, voteId){

    var votingData = {
        id: voteId,
        type: voteType,
    }
    
    $.ajax({
        type: "post",
        data: votingData,
        url: "/vote",
        success: function(result){
            if(result.status == "success"){
                console.log(result.message);
                getDefinition(thisTerm);
            } else {
                console.log("something went wrong");
                $("#error").text(result.error);
            }
        }
    })
}


function displayDefinitionsOnPage(definitions){
    definitions.forEach(function(definition){
        var score = definition.upvotes - definition.downvotes;
        $("#definitions-section").append("<div class = 'definition' id = '" + definition.id + "'><span class = 'definition-term'>" + definition.term + "</span>: " + definition.body + "<br><div class = 'voting-section'><button class = 'voting-button' data-vote = 'down'>Down</button><span class = 'definition-score'>" + score + "</span><button class = 'voting-button' data-vote = 'up'>Up</button></div></div>")
    });
}




function displaySearchTerm(term){
	$("#terms-section").append("<div class = 'term'><span class = 'title'><span id = '" + term.name + "' class ='term-link'>" + term.name + "</span></span></div>")
} 


function displayAddDefinition(term){
	$("#new-definition").show();
	currentTerm = term;
}



function trimRelatedTerms(){

}