$(document).ready(main);

function main(){
	
	if(window.location.pathname == "/admin"){
		console.log("admin.js ready");
		getAdminData("definitions");
	}

	$("#user-role-section").hide();

	/* LISTENERS */

	$("body").on("touchstart click", ".admin-decision", function(){

		var votingData = {
		        id: this.dataset.id,
		        type: this.dataset.vote,
        		post: this.dataset.type,
                author: this.dataset.author,
                term: this.dataset.term
		    }

            console.log("votingData");
            console.log(votingData);

        if(this.dataset.type == "definition" || this.dataset.type == "report" || this.dataset.type == "comment"){
            console.log("sending a request");
    	    $.ajax({
    	        type: "post",
    	        data: votingData,
    	        url: "/admin-vote",
    	        success: function(result){
    	            console.log(result);
    	            $("#admin-posts-section").empty();

    	            if(result.status == "success"){  
    	                getAdminData(votingData.post + "s");
    	            } else {
    	                console.log("something went wrong");
    	                $("#error").text(result.error);
    	            }
    	        }
    	    })
        } else {
            console.log("That's not a valid admin action");
        }

    });

    $("body").on("touchstart click", "#unapproved-definitions-link", function(){
		getAdminData("definitions");
    });

    $("body").on("touchstart click", "#unresolved-reports-link", function(){
        getAdminData("reports");
    });

    $("body").on("touchstart click", "#unreviewed-comments", function(){
        getAdminData("comments");
    });

    $("body").on("touchstart click", "#find-user", function(){
    	getUserRoles($("#user-role-search"));
    });

    $("body").on("touchstart click", "#update-user-roles", function(){
    	updateUserRoles();
    });

    $("body").on("touchstart click", "#user-role-manager", function(){
    	getRoleEditor();
    });



    $("body").on("touchstart click", "#convert-date", function(){
        console.log("this will convert the dates");



        $.ajax({
            type: "post",
            url: "/convert-date",
            success: function(result){
                if(result.status == "success"){
                    console.log("converted");
                } 
            }
        })
    });


}





function getAdminData(thisType){

    console.log(thisType);


	$.ajax({
        type: "get",
        url: "/admin-data",
        success: function(result){
        	if(result.status == "success"){

        		$("#definition-count").text(result.data.definitions.length || 0 );
        		$("#report-count").text(result.data.reports.length || 0);

        		if(thisType == "definitions"){
        			displayUnapprovedDefinitions(result.data.definitions);
        		} else if (thisType == "reports"){
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
	$("#admin-roles-container").empty();
    // a bit of handlebars magic

    $("#admin-posts-section").append("<h3>Unapproved submissions</h3>");

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
	$("#admin-roles-container").empty();
    // a bit of handlebars magic

    $("#admin-posts-section").append("<h3>Unresolved reports</h3>");

    $.get('views/components/unresolvedReports.html', function(data) {

        $("#definitions-section").prepend("<h3>Unresolved reports</h3>");

        reports.forEach(function(thisReport){

        	var myTemplate =  Handlebars.compile(data);

        	var searchQuery = {
				id: thisReport.post_id
			}

            console.log(thisReport);

    		var context = {
                report: thisReport,
                created: thisReport.created.substr(4, 20),
            };
            var compiled = myTemplate(context)
            $("#admin-posts-section").append(compiled);

        });

    }, 'html')
}


function getRoleEditor(){
	$.ajax({
        type: "get",
        url: "/get-role-editor-modal",
        success: function(response){
        	if(response.status != "fail"){

        		$("#admin-posts-section").empty();

        		$("#admin-roles-container").empty();
        		$("#admin-roles-container").append(response);
        		$("#user-role-section").hide();
        	} else {
        		$("#error").text(response.error);
        	}
        }
    })
}

function getUserRoles(user){

	// NEED TO MAKE ACCESSIBLE ONLT TO ADMINS

	var userData = {
		username: user.val().trim().toLowerCase()
	}

	$.ajax({
        type: "post",
        data: userData,
        url: "/user-roles",
        success: function(response){
            $("#user-role-section").empty();

            if(response.status == "success"){  
            	showUserRoles(response.roles, userData.username)

            } else {
            	$("#user-role-section").hide();
                console.log("Not a valid user");
                $("#error").text(response.error);
            }
        }
    })
}


function updateUserRoles(){

	var userData = {
		username: $("#user-role-search").val().trim().toLowerCase(),
		moderator: $("#moderator")[0].checked,
		admin: $("#admin")[0].checked,
		suspended: $("#suspended")[0].checked
	}

	$.ajax({
        type: "post",
        data: userData,
        url: "/update-user-roles",
        success: function(response){
            $("#user-role-section").empty();

            if(response.status == "success"){  
            	showUserRoles(response.roles, userData.username)
            } else {
            	$("#user-role-section").hide();
                console.log("Not a valid user");
                $("#error").text(response.error);
            }
        }
    })
}

function showUserRoles(roles, username){
	console.log(roles);
	$("#user-role-section").show();
	$("#user-role-section").append("<h3>"  + username + "</h3>");
	$("#user-role-section").append("<input id='moderator' type='checkbox'>Moderator</input><br>");
	$("#user-role-section").append("<input id='admin' type='checkbox'>Admin</input><br>");
	$("#user-role-section").append("<span id = 'suspension-section'><input id='suspended' type='checkbox'>Suspended</input><span><br>");
	$("#user-role-section").append("<button id='update-user-roles'>Update</button><br>");


	$("#moderator").prop('checked', false);
	$("#admin").prop('checked', false);
	$("#suspended").prop('checked', false);


	console.log("roles.moderator " + roles.moderator);
	console.log("roles.admin " + roles.admin);

	if(roles.moderator == true || roles.moderator == "true"){
		$("#moderator").prop('checked', true);
	}

	if(roles.admin == true || roles.admin == "true"){
		$("#admin").prop('checked', true);
	}

	if(roles.suspended == true || roles.suspended == "true"){
		$("#suspended").prop('checked', true);
	}
}


