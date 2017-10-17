$(document).ready(main);

var currentTerm = null;
var currentNotifications = [];
var currentNotificationCounter = 0;



function main(){

    $("#error, #message").text("").hide();          /* THIS NEEDS TO BE FIXED!! */

    resetNavBar();

    $("body").on("click", function(e){
        $("#error, #message").text("").hide();
        $("#terms-section").text("");

        if(!($(e.target).hasClass('notification-header') || $(e.target).hasClass('notification-panel')|| $(e.target).hasClass('fa-chevron-down') || $(e.target).hasClass('fa-chevron-up'))){
           $("#notifications").hide();              
        }
    });



	$("#search-button").on("click", function(){
        search();
    });


	$("body").on("click", ".term-link", function(){
		var term = this.getAttribute("id");
        $("#search-bar").val(term);
		currentTerm = term;
		getDefinition(term);
	});

    $("body").on("click", ".term-suggestion-link", function(){
        $("#term-suggestions-section").empty();
        $("#term-suggestions-section").hide();
        var term = this.getAttribute("id");
        $("#definition-term-textarea").val(term)
    });

    $("body").on("click", ".report-post", function(){
        window.scrollTo(0, 0);
        $(".add-confirmation").remove();
        console.log(this.dataset.id);
        displayReport(this.dataset.id, this.dataset.type);
    });

    $("body").on("click", "#submit-report", function(){
        submitReport();
    });

    $("body").on("click", "input[name='report']", function(){
        $(".report-error").empty();
    });

    $("body").on("click", "#new-alert", function(){
        acknowledgeNotifications();
    });

    $("body").on("click", ".notification-bell", function(){

        if($(".notifications-body").height() > 0) {
            $(".notifications-body").hide();
        } else {
            $(".notifications-body").show();
            displayNotification();
        }

        
    });

    $("body").on("click", ".scroll-up", function(){
        if(currentNotificationCounter < (currentNotifications.length-1)){
            currentNotificationCounter++;
            addNotificationsToScreen();
        }
    });

    $("body").on("click", ".scroll-down", function(){
        if(currentNotificationCounter >= 5){
            currentNotificationCounter--;
            addNotificationsToScreen();
        }
        
    });

    $("body").on("click", "#submission-table-toggle", function(){
        $("#submission-status-table").toggle();        
    });

    $("body").on("click", ".comment-on-post", function(){

        $(".fa-chevron-circle-up[data-id=" + this.dataset.id + "]").toggle();
        $(".comments-section[data-id=" + this.dataset.id + "]").toggle();
        $(".fa-comment[data-id=" + this.dataset.id + "]").toggle();
        

        if($(".comment-count[data-id=" + this.dataset.id + "]").css("opacity") == 1){
            $(".comment-count[data-id=" + this.dataset.id + "]").css("opacity", 0);
        } else {
            $(".comment-count[data-id=" + this.dataset.id + "]").css("opacity", 1);
        }

    });


    
/* LISTENERS */

	$("body").on("keydown", function(e){                        
	    if(e.which == 13){                                         // 13 = ENTER
	        if($("#search-bar").is(":focus")){ 
                search();
            } else if($("#signup-password").is(":focus") || $("#signup-login").is(":focus") ){
                signup();
            } else if ($("#login-password").is(":focus") || $("#login-login").is(":focus") ){
                login();
            }
	    }

        if(e.which == 27){                                         // 27 = ESC
            $(".pop-out").hide();
        }
	});

	$("#search-bar").on("keyup", function(e){
		if($("#search-bar").val().length > 2){
	    	search();
		} else {
			$("#terms-section").empty();
		}

		if(e.which == 8){
			$("#new-definition").hide();
            $("#definitions-section").empty();
			console.log("8! Say 8! I'm an 8 again!");
		}
	});


    $("#definition-term-textarea").on("keyup", function(e){
        if($("#definition-term-textarea").val().length > 2){
            $("#term-suggestions-section").empty();
            $("#term-suggestions-section").show();
            searchForDefinitions();
        } else {
            $("#term-suggestions-section").hide();
        }

        if(e.which == 8){
            $("#term-suggestions-section").empty();
            console.log("8! Say 8! I'm an 8 again!");
        }
    });



	$("#new-definition-textarea").on("keyup", function(){
		var charCount = $("#new-definition-textarea").val().length;
        $("#new-definition-char-count").text(charCount);
        if(charCount >= 500){
            $("#new-definition-wrapper").addClass("over-char-limit");
        } else {
            $("#new-definition-wrapper").removeClass("over-char-limit");
        }
	})

	$("body").on("click", "#add-definition", function(){
		addDefinition();
	});


    $("body").on("click", ".add-comment", function(){
        addComment(this);
    });

    $("body").on("click", ".voting-button", function(){
        var direction = this.dataset.vote;               // .dataset is a quick way to get data attribute value
        var id = this.dataset.id;
        var term = this.dataset.term;
        var type = this.dataset.type;

        voteOnPost(direction, id, term, type);
    })

    $("body").on("click", "#add-def-link", function(){
        window.scrollTo(0, 0);
        $("#report").hide();
        $("#new-definition").show();
        $("#new-definition-textarea").focus();
        $(".new-definition-term").text(currentTerm)
        $("#definition-term-textarea").val(currentTerm);
        $("#definition-term-textarea").prop('disabled', true);
        $("#definition-term-textarea").css("background", "#bbbbbb").css("color", "#3c3c3c");
        $("#terms-section").empty();
    });

    $("body").on("click", "#new-def-link", function(){
        $("#new-definition").show();
        $("#definition-term-textarea").val($("#search-bar").val());
        $(".new-definition-term").text($("#search-bar").val())
        $("#definition-term-textarea").focus();
        $("#terms-section").empty();
    });
    
    $("body").on("click", "#close", function(){
        $(".pop-out").hide();
    });

    /* ACCOUNT LINKS*/

    $("body").on("click", "#login", function(){
        showLogin();
    });

    $("body").on("click", ".log-in-link", function(){
        $(".pop-out").hide();
        $("#terms-section").empty();
        showLogin();
    });

    $("body").on("click", ".sign-up-link", function(){
        $(".pop-out").hide();
        $("#terms-section").empty();
        showSignup();
    });

    $("body").on("click", "#signup", function(){
        showSignup();
    });

    $("body").on("click", "#account-close", function(){
        resetNavBar();
    });

    $("body").on("click", "#login-action", function(){
        login();
    });

    $("body").on("click", "#signup-action", function(){
        signup();
    });

    $("body").on("click", "#logout", function(){
        logout();
    });



/* ONE-CLICK ADMIN LOGIN */

    $("body").on("click", "#master-log-in", function(){
        adminLogin();
    });


}





/* FUNCTIONS */

function resetNavBar(){
    $("#login-username, #login-password, #signup-username, #signup-password").val("");
    $("#login-section").hide();
    $("#signup-section").hide();
    $("#login, #signup").show();
}

function showLogin(){
    $("#login, #signup").hide();
    $("#signup-section").hide();
    $("#login-section").show();
    $("#login-username").focus();
}

function showSignup(){
    $("#login, #signup").hide();
    $("#login-section").hide();
    $("#signup-section").show();
    $("#signup-username").focus();
}

function search(){
	var searchTerm = $("#search-bar").val().trim();

    if(searchTerm){

    	var searchQuery = {
    		term: searchTerm.toLowerCase()
    	}

    	$.ajax({
            type: "post",
            data: searchQuery,
            url: "/search",
            success: function(result){
            	if(result.status == "success"){
            		$("#terms-section").empty();
            		console.log("Found " + result.count + " (possible) definitions for '" + searchTerm + "'");

            		if(result.count > 0){
                        $("#definitions-section").empty();

                        if(result.count == 1){                          // if there's only one term, display the definition
                            getDefinition(result.body[0].name);
                            currentTerm = result.body[0].name;
                        } else {
                            result.body.forEach(function(term){
                                displaySearchTerm(term);
                            });
                            $("#definitions-section").append("<div class = 'definition-accent add-one'>There are no definitions for <span class = 'bold no-def-term'>" + searchTerm + "</span>. <span class = 'link bold' id = 'new-def-link'>Want to add one<span>?</div></div>");
                        }
            		} else {
                        console.log('"#definitions-section").height() ' + $("#definitions-section").height());
                        if($("#definitions-section").height() > 25){
                            console.log("updating non-existent term");
                            $(".no-def-term").text(searchTerm);
                        } else {
                            console.log("adding div");
                            $("#definitions-section").append("<div class = 'definition-accent add-one'>There are no definitions for <span class = 'bold no-def-term'>" + searchTerm + "</span>. <span class = 'link bold' id = 'new-def-link'>Want to add one<span>?</div></div>");
                        }
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

function searchForDefinitions(){
    var searchTerm = $("#definition-term-textarea").val().trim();

    if(searchTerm){
        var searchQuery = {
            term: searchTerm.toLowerCase()
        }

        $.ajax({
            type: "post",
            data: searchQuery,
            url: "/search",
            success: function(result){
                if(result.status == "success"){
                    $("#term-suggestions-section").empty();

                    result.body.forEach(function(term){
                        displayDefinitionSuggestion(term);
                    });
                                                       
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

    $("#definitions-section").empty();

	var searchQuery = {
		term: thisTerm.toLowerCase()
	}

	$.ajax({
        type: "post",
        data: searchQuery,
        url: "/get-definitions",
        success: function(result){
        	if(result.status == "success"){

                var searchTerm = $("#search-bar").val().trim();

            	if(result.count > 0){
                    $("#definitions-section").empty();
                    displayDefinitionsOnPage(result.body, result.isLoggedIn);
	            } else {
                    $("#definitions-section").append("<div class = 'definition-accent'>There are no definitions for <span class = 'bold no-def-term'>" + searchTerm + "</span>. <span class = 'link bold' id = 'new-def-link'>Want to add one<span>?</div></div>");
                }
        	} else {
        		console.log(result.error)
        	}
        }
    })
}

function addDefinition(){

    var definitionTerm = $("#definition-term-textarea").val();
	var definitionBody = $("#new-definition-textarea").val();
	var relatedTerms = $("#new-definition-related-terms").val();
    

    if(definitionBody.trim()){
        if($("input[name='definition-category']:checked").length == 1){

        	var related = trimRelatedTerms();
            var definitionCategory = $("input[name='definition-category']:checked")[0].dataset.category

        	var definitionData = {
    			term: definitionTerm.toLowerCase().trim(),
    			definition: definitionBody,
    			related: relatedTerms,
                category: definitionCategory
    		}

            console.log(definitionData);
    	    
    		$.ajax({
    	        type: "post",
    	        data: definitionData,
    	        url: "/new-definition",
    	        success: function(result){

                    $("#terms-section").empty();
                    $("#definitions-section").empty();
                    $("#new-definition-related-terms").empty();
                    $("input[name='definition-category']").prop('checked', false);


    	        	if(result.status == "success"){
                		
                		getDefinition(result.term);
                        
                        if(!result.termAdded){
                            $("#definitions-section").append("<div class = 'definition add-confirmation'>Your definition for <span class = 'bold'>" + result.term + "</span> has been submitted. It will be reviewed and and added to the website shortly! <br><br> Your new posts will be auto-approved after 5 successful submissions.</div>");
                        }
                        
                        $("#new-definition-textarea").val("");            
                        $("#new-definition").hide();
    	        	} else {
    	            	$("#definitions-section").empty();
    	            	$("#definitions-section").append("<div class = 'definition'>" + result.error + "</div>");
    	     		}
    	        }
    	    })
        } else {
            $(".new-definition-error").text("Please pick a category for this definition");
        }
	} else {
        $(".new-definition-error").text("Please enter a definition");
    }
}


function addComment(button){

    var commentBodyText = button.parentElement.previousSibling.previousSibling.value;

    if(commentBodyText.trim()){
        
        var commentData = {
            commentBody: commentBodyText,
            post_id: button.dataset.id
        }
  
        $.ajax({
            type: "post",
            data: commentData,
            url: "/new-comment",
            success: function(result){
                if(result.status == "success"){ 

                    console.log(result);

                    button.parentElement.previousSibling.previousSibling.value = "";
                
                    var commentSection = $(".comments-section[data-id=" + button.dataset.id + "]");
                    var commentToAdd = [result.comment];

                    console.log($(".comment-count[data-id='" + result.comment.post_id + "']"));
                    $(".comment-count[data-id='" + result.comment.post_id + "']").text(parseInt($(".comment-count[data-id='" + result.comment.post_id + "']").text()) + 1);

                    displayCommentsOnPage(commentToAdd, commentSection);

                } else {
                    $(".comments-section[data-id=" + button.dataset.id + "] .new-comment-error").text(result.error);
                }
            }
        })

    } else {
        $(".comments-section[data-id=" + button.dataset.id + "] .new-comment-error").text("Please enter a comment");
    }


}


function voteOnPost(voteDirection, elementId, voteTerm, voteType){

    var votingData = {
        id: elementId,
        direction: voteDirection,
        type: voteType
    }
    
    $.ajax({
        type: "post",
        data: votingData,
        url: "/vote",
        success: function(result){

            if(result.status == "success"){

                var updatedScore = result.definition.upvotes - result.definition.downvotes;

                $("#" + elementId).find(".definition-score").text(updatedScore) 



                console.log(result.message);
            } else {
                console.log("something went wrong");
                $("#error").text(result.error).css("display", "block");
            }
        }
    })
}


function login(){

    var loginData = {
        username: $("#login-username").val().toLowerCase(),
        password: $("#login-password").val()
    }

    if(loginData.username.trim().length && loginData.password.trim().length){
        $.ajax({
            type: "post",
            data: loginData,
            url: "/login",
            success: function(result){
                if(result.status == "success"){
                    location.reload();
                } else {
                    $("#login-username, #login-password, #signup-username, #signup-password").val("");
                    $("#error").text(result.message).css("display", "block");
                }
            }
        })
    } else {
        console.log("invalid login");
        $("#message").text("Username or password can't be blank").css("display", "block");
    }

}

/* REMOVE THIS! */

// hackers and troublemakers: this is a one click login because my dev session keeps kicking me off. it obvs won't make it into the prod app lulz
function adminLogin(){

    var loginData = {
        username: "andrew",
        password: "myrealpassword"
    }

    if(loginData.username.trim().length && loginData.password.trim().length){
        $.ajax({
            type: "post",
            data: loginData,
            url: "/login",
            success: function(result){
                if(result.status == "success"){
                    location.reload();
                } else {
                    $("#login-username, #login-password, #signup-username, #signup-password").val("");
                    $("#error").text(result.message).css("display", "block");
                }
            }
        })
    } else {
        console.log("invalid login");
        $("#message").text("Username or password can't be blank").css("display", "block");
    }

}


function signup(){

    var signupData = {
        username: $("#signup-username").val(),
        password: $("#signup-password").val()
    }


    if(signupData.username.trim().length){
        $.ajax({
            type: "post",
            data: signupData,
            url: "/signup",
            success: function(result){
                if(result.status == "success"){
                    resetNavBar();
                //  showLogin();                            // looks kind of jarring
                    $("#message").text(result.message).css("display", "block");
                } else {
                    $("#login-username, #login-password, #signup-username, #signup-password").val("");
                    $("#error").text(result.message).css("display", "block");
                }
            }
        })
    } else {
        console.log("invalid signup");
        $("#error").text("Username or password can't be blank").css("display", "block");
    }
}

function logout(){

    $.ajax({
        type: "get",
        url: "/logout",
        success: function(result){
            if(result.status == "success"){
                location.reload();
                $("#error").text("Logged out").css("display", "block");
            } else {
                $("#login-username, #login-password, #signup-username, #signup-password").val("");
            }
        }
    })
 
}

function displayDefinitionsOnPage(definitions, isLoggedIn){

   
    $("#definitions-section").empty();

    definitions = sortPosts(definitions);

    

    $.get('views/components/definition.html', function(definitionTemplate) {
        $.get('views/components/definitionCategory.html', function(definitionCategoryTemplate) {

            $("#definitions-section").empty();

            $("#definitions-section").append(definitionCategoryTemplate);

            var toolCount = languageCount = conceptCount = otherCount = 0;

            for(var i = 0; i < definitions.length; i++){
                switch(definitions[i].category){
                    case "tool":
                        toolCount++;
                        break;
                    case "concept":
                        conceptCount++;
                        break;
                    case "language":
                        languageCount++;
                        break;
                    case "other":
                        otherCount++;
                        break;
                    default:
                        otherCount++;
                }
            }

            var toolPercent = toolCount/definitions.length;
            var conceptPercent = conceptCount/definitions.length;
            var languagePercent = languageCount/definitions.length;
            var otherPercent = otherCount/definitions.length;

            $("#tool-percentage").css("width", toolPercent * 300 + 5 + "px")
            $("#tool-percentage-label").text(Math.floor(toolPercent * 100) + "%");
            $("#concept-percentage").css("width", conceptPercent * 300 + 5 + "px")
            $("#concept-percentage-label").text(Math.floor(conceptPercent * 100) + "%");
            $("#language-percentage").css("width", languagePercent * 300 + 5 + "px")
            $("#language-percentage-label").text(Math.floor(languagePercent * 100) + "%");
            $("#other-percentage").css("width", otherPercent * 300 + 5 + "px")
            $("#other-percentage-label").text(Math.floor(otherPercent * 100) + "%");

            // a bit of handlebars magic

            definitions.forEach(function(thisDefinition){
                var thisScore = thisDefinition.upvotes - thisDefinition.downvotes;

                var myTemplate =  Handlebars.compile(definitionTemplate);

                var context = {
                    definition: thisDefinition,
                    editDate: thisDefinition.lastEdit.substr(4, 11),
                    score: thisScore,
                    id: thisDefinition.id,
                    commentCount: thisDefinition.comments.length
                };

                var compiled = myTemplate(context)

                $("#definitions-section").append(compiled);

                var commentSection = $(".comments-section[data-id=" + thisDefinition.id + "]");
                console.log("thisDefinition.comments");


                if(isLoggedIn){
                    commentSection.append("<div class = 'comment'><h4>New comment:</h4><div class = 'new-comment-error'></div><textarea class = 'new-comment-textarea' rows = '2' maxlength = '500' placeholder = 'A penny for your thoughts?'></textarea><br><div class = 'button-wrapper'><button class = 'add-comment' data-id = " + thisDefinition.id + " data-term = ''>Add</button></div></div>");
                } else {
                    commentSection.append("<div class = 'comment add-one'><span class = 'link bold log-in-link'>Log in</span> to leave a comment!</div>");
                }

                displayCommentsOnPage(thisDefinition.comments, commentSection);
                commentSection.hide();



            });

            $("#definitions-section").append("<div class = 'definition-accent add-one'>Don't see a good definition? <span class = 'link bold' id = 'add-def-link'>Add your own!<span></div>");

        }, 'html')
    }, 'html')
}

function displayCommentsOnPage(comments, commentSection){

    comments = sortPosts(comments);

    $.get('views/components/comment.html', function(commentTemplate) {

        // a bit of handlebars magic

        comments.forEach(function(thisComment){

            var thisScore = thisComment.upvotes - thisComment.downvotes;
            var myTemplate =  Handlebars.compile(commentTemplate);

            var context = {
                comment: thisComment,
                date: thisComment.date.substr(4, 11),
                score: thisScore,
                id: thisComment.id
            };

            var compiled = myTemplate(context)
            commentSection.append(compiled);
        });

    }, 'html')
}

function sortPosts(posts){

    var sortedPosts = [];

    while(sortedPosts.length < posts.length){                    // DANGER ALERT!
        var maxScore = -999;

        for(var i = 0; i < posts.length; i++){

            var score = posts[i].upvotes - posts[i].downvotes;

            if(score > maxScore && sortedPosts.indexOf(posts[i]) == -1) { maxScore = score}

        }

        for(var j = 0; j < posts.length; j++){

            var score = posts[j].upvotes - posts[j].downvotes;

            if(score == maxScore){
                sortedPosts.push(posts[j]);
            }
        }
    }

    return sortedPosts;
}

function displaySearchTerm(term){
	$("#terms-section").append("<div class = 'term'><span class = 'title'><span id = '" + term.name + "' class ='term-link'>" + term.name + "</span></span></div>");

} 

function displayDefinitionSuggestion(term){
    $("#term-suggestions-section").append("<div class = 'term'><span class = 'title'><span id = '" + term.name + "' class ='term-suggestion-link'>" + term.name + "</span></span></div>");
} 


function displayAddDefinition(term){
    $("#report").hide();
	$("#new-definition").show();
    $("#new-definition-textarea").focus();
	currentTerm = term;
}

function displayNotification(){

    $.ajax({
        type: "get",
        url: "/updated-user-data",
        success: function(updatedUserData){

            if(updatedUserData.status == "success"){
                $("#report").hide();
                $("#new-definition").hide();
                $("#notifications").show();
                $("#notifications").css("left", ($(".notification-bell")[0].offsetLeft-140) + "px");
                $("#notifications").css("top", ($(".notification-bell")[0].offsetTop+30) + "px");

                $("#notifications-section").empty();

                currentNotifications = updatedUserData.notifications;
                currentNotificationCounter = currentNotifications.length-1;

                addNotificationsToScreen();
                

            } else {
                console.log("something went wrong");
                $("#error").text(updatedUserData.error).css("display", "block");
            }
        }
    })

}

function addNotificationsToScreen(){
    $("#notifications-section").empty();

    for(var i = (currentNotificationCounter); i >= (currentNotificationCounter-4) ; i--){
        var notification = currentNotifications[i];
        if(!(typeof(notification) == "undefined")){

            if(notification.type == "definition"){
                $("#notifications-section").append("<div class = 'notification-panel one-notification'><a href = '/profile'>Your submission <span class ='bold'>" + notification.term + "</span> has been <span class ='submission-update post-"+notification.status + "'>" + notification.status + "</a></span></div>");
            } else if (notification.type = "comment"){
                $("#notifications-section").append("<div class = 'notification-panel one-notification'><a href = '/profile'>Your comment has been <span class ='submission-update post-"+notification.status + "'>" + notification.status + "</a></span></div>");
            }            
        }  
    }

    if(currentNotifications.length == 0){
        $("#notifications-section").append("<div class = 'notification-panel one-notification'>You don't have any notifications</div>");
    }
}

function displayReport(id, type){
    $("#new-definition").hide();
    $("#report").show();
    $("#report-content").empty();

    if(type == "definitions"){
        $("#report-content").append($("#" + id).find(".definition-column").text().trim());
    } else if (type == "comments"){
        $("#report-content").append($("#" + id).find(".comment-body").text().trim());
    }
    

    $("#submit-report")[0].dataset.id = id;
    $("#submit-report")[0].dataset.type = type;
}


function submitReport(){

    var reportElement = $(".report-body input:checked")[0];


    if(typeof(reportElement) != "undefined"){
        
        var reportId = $("#submit-report")[0].dataset.id;
        var reportReason = $(".report-body input:checked")[0].dataset.reason;
        var reportType = $("#submit-report")[0].dataset.type;

        var reportData = {
            id: reportId,
            reason: reportReason,
            type: reportType
        }

        $.ajax({
            type: "post",
            data: reportData,
            url: "/new-report",
            success: function(result){

                $("input[name='report']").prop('checked', false);
                $("#report").hide();
                if(result.status == "success"){
                    $("#definitions-section").prepend("<div class = 'definition add-confirmation'>Your report has been submitted and will be reviewed shortly.</div>");
                } else {
                    $("#definitions-section").prepend("<div class = 'definition add-confirmation'>" + result.error + "</div>");
                }
            }
        })

    } else {
        $(".report-error").text("Please select a reason for this report");
    }

}


function acknowledgeNotifications(){
    $.ajax({
        type: "post",
        url: "/clear-notifications",
        success: function(result){
            if(result.status == "success"){
                $(".notification-bell").removeAttr('id');
            } else {
                console.log("something went wrong");
                $("#error").text(result.error).css("display", "block");
            }
        }
    })
}



/* COMMENTS */

function getComments(definitionId){

    var commentSection = $(".comments-section[data-id=" + definitionId + "]");

    commentSection.empty();

    console.log("getting comments!");

    var searchQuery = {
        id: definitionId
    }

    $.ajax({
        type: "post",
        data: searchQuery,
        url: "/get-comments",
        success: function(result){
            if(result.status == "success"){

                commentSection.empty();
                displayCommentsOnPage(result.comments, commentSection); 

                if(result.isLoggedIn){
                    commentSection.append("<div class = 'comment'><h4>New comment:</h4><div class = 'new-comment-error'></div><textarea class = 'new-comment-textarea' rows = '2' maxlength = '500' placeholder = 'A penny for your thoughts?'></textarea><br><div class = 'button-wrapper'><button class = 'add-comment' data-id = " + definitionId + " data-term = ''>Add</button></div></div>");
                } else {
                    commentSection.append("<div class = 'comment add-one'><span class = 'link bold log-in-link'>Log in</span> to leave a comment!</div>");
                }

            } else {
                console.log(result.error)
            }
        }
    })
}








function trimRelatedTerms(){
    // add function to trim related terms into an array
}
