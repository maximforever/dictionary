$(document).ready(main);

function main(){
	
	if(window.location.pathname == "/admin"){
		console.log("admin.js ready");
		getAdminData("definitions");
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
		            $("#admin-posts-section").empty();

		            if(result.status == "success"){  
		                getAdminData();
		            } else {
		                console.log("something went wrong");
		                $("#error").text(result.error);
		            }
		        }
		    })
    });

    $("body").on("click", "#unapproved-definitions-link", function(){

		getAdminData("definitions");
    });

    $("body").on("click", "#unresolved-reports-link", function(){
    	getAdminData("reports");
	
    });
}


function getAdminData(type){

	$.ajax({
        type: "get",
        url: "/admin-data",
        success: function(result){
        	if(result.status == "success"){

        		
        		$("#definition-count").text(result.data.definitions.length || 0 );
        		$("#report-count").text(result.data.reports.length || 0);

        		if(type == "definitions"){
        			displayUnapprovedDefinitions(result.data.definitions);
        		} else if (type == "reports"){
        			displayUnresolvedReports(result.data.reports);
        		} else {
        			console.log("Display error - incorrect type");
        		}        		

        	} else {
        		console.log(result.error)
        	}
        }
    })
}


function displayUnapprovedDefinitions(definitions){


	$("#admin-posts-section").empty();
    // a bit of handlebars magic

    $.get('views/components/unapprovedDefinition.html', function(data) {

        definitions.forEach(function(thisDefinition){
            var thisScore = thisDefinition.upvotes - thisDefinition.downvotes;

            var myTemplate =  Handlebars.compile(data);

            var context = {
                definition: thisDefinition,
                created: thisDefinition.created.substr(4, 20),
                score: thisScore,
                id: thisDefinition.id
              };
              var compiled = myTemplate(context)
              $("#admin-posts-section").append(compiled);
        });

    }, 'html')
}

function displayUnresolvedReports(reports){

	$("#admin-posts-section").empty();
    // a bit of handlebars magic

    $.get('views/components/unresolvedReports.html', function(data) {

        $("#definitions-section").prepend("<h3>Unresolved reports</h3>");

        reports.forEach(function(thisReport){

        	var myTemplate =  Handlebars.compile(data);

        	var searchQuery = {
				id: thisReport.post_id
			}

    		var context = {
                report: thisReport,
                created: thisReport.created.substr(4, 20),
            };
            var compiled = myTemplate(context)
            $("#admin-posts-section").append(compiled);



        });

    }, 'html')
}