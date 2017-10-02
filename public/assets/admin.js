$(document).ready(main);

function main(){
	
	if(window.location.pathname == "/admin"){
		console.log("admin.js ready");
		getAdminData();
	}


	/* LISTENERS */

	$("body").on("click", ".admin-decision", function(){

		var votingData = {
		        id: this.dataset.id,
		        type: this.dataset.vote,
        		post: "definition"
		    }
		    
		    $.ajax({
		        type: "post",
		        data: votingData,
		        url: "/admin-vote",
		        success: function(result){

		            console.log(result);
		            $("#unapproved-definitions-section").empty();

		            if(result.status == "success"){  
		                getAdminData();
		            } else {
		                console.log("something went wrong");
		                $("#error").text(result.error);
		            }
		        }
		    })
    });




}


function getAdminData(){

	$.ajax({
        type: "get",
        url: "/admin-data",
        success: function(result){
        	if(result.status == "success"){

        		
        		$("#definition-count").text(result.data.definitions.length || 0 );
        		$("#report-count").text(result.data.reports.length || 0);

        		displayUnapprovedDefinitions(result.data.definitions);

        	} else {
        		console.log(result.error)
        	}
        }
    })
}


function displayUnapprovedDefinitions(definitions){

    // a bit of handlebars magic

    $.get('views/components/unapprovedDefinition.html', function(data) {

        $("#definitions-section").prepend("<h3>Popular definitions</h3>");

        definitions.forEach(function(thisDefinition){
            var thisScore = thisDefinition.upvotes - thisDefinition.downvotes;

            var myTemplate =  Handlebars.compile(data);

            var context = {
                definition: thisDefinition,
                editDate: thisDefinition.lastEdit.substr(4, 11),
                score: thisScore,
                id: thisDefinition.id
              };
              var compiled = myTemplate(context)
              $("#unapproved-definitions-section").append(compiled);
        });

    }, 'html')
}