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
        		$("#terms-section").empty();
            	if(result.count > 0){
            		$("#definitions-section").empty();
            		console.log("Found " + result.count + " responses");

        			console.log(result.body);	

            		result.body.forEach(function(post){
            			displayDefinitions(post);
            		});  
            		$("#new-definition").show();
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
	    
		$.ajax({
	        type: "post",
	        data: definitionData,
	        url: "/new-definition",
	        success: function(result){
	        	if(result.status == "success"){
            		$("#terms-section").empty();
            		$("#definitions-section").empty();
            		$("#definitions-section").append("<div class = 'definition'>Your definition for <span class = 'bold'>" + result.term + "</span> has been submitted.</div>");
            		$("#new-definition").hide();
            		getDefinition(result.term);	            
	        	} else {
	            	$("#definitions-section").empty();
	            	$("#definitions-section").append("<div class = 'definition'>" + result.error + "</div>");
	     		}
	        }
	    })
	}
}













function displaySearchTerm(term){
	$("#terms-section").append("<div class = 'term'><span class = 'title'><a href = '#' id = '" + term.term + "' class ='term-link'>" + term.term + "</a></span></div>")
} 

function displayDefinitions(definition){
	$("#definitions-section").append("<div class = 'definition'><span class = 'definition-term'>" + definition.term + "</span>: " + definition.body + " </div>")
} 

function displayAddDefinition(term){
	$("#new-definition").show();
	currentTerm = term;
}



function trimRelatedTerms(){

}