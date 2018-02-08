$(document).ready(main);

var currentTerm = null;
var currentNotifications = [];
var currentNotificationCounter = 0;

var lastSearchedTerm = null;

var activeTermIndex = -1;

var screenWidth = $(window).width();
var triggerEvent = "click";


function main(){
 
    // if mobile browser, set on click event trigger to touchstart instead
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        triggerEvent = "touchstart";
    } 

    if($("#error").text().trim().length){
        $("#error").show().css("display",  "block");
    } else {
        $("#error").hide();
    }

    if($("#message").text().trim().length){
        $("#message").show().css("display",  "block");
    } else {
        $("#message").hide();
    }

    if(location.pathname.indexOf("/profile") != -1){
        
         var pathArray = location.pathname.split("/");

        if(pathArray.length == 4){

            var username = pathArray[2];
            if(location.pathname.indexOf("/definitions") != -1){ 
                getDefinition(username, true);
            } else if(location.pathname.indexOf("/comments") != -1){
                getCommentsForUser(username);
            }

        }
    }

    resetNavBar();
    populateRandomSearchTerm();

    if($("#search-bar").length == 1 && $("#search-bar").val().length == 0){
        getTopSearches();
    } else {
        logSearch($("#search-bar").val(), true);
        $("#top-terms").hide();
    }

    if($("#definitions-section").height() < 5 && $("#search-bar").length == 1){
        
        var term = $("#search-bar").val().trim();
        var textLength = term.length;

        if(screenWidth < 980 && textLength > 18){
            var searchBarFontSize = (2.5 - (textLength - 18)*0.095);
            if(searchBarFontSize < 1.3) { searchBarFontSize = 1.3 };
            $("#search-bar").css("font-size", searchBarFontSize + "em");
        }

        pageSearch();

    }


    $("body").on(triggerEvent, function(e){


        $("#error, #message").text("").hide();      // THIS HIDES THE FLASH MESSAGE ON ANY CLICK

        $("#terms-section").text("");

        $("#term-suggestions-section").hide();
        $("#related-term-suggestions-section").hide();



        if(!($(e.target).hasClass('notification-header') || $(e.target).hasClass('notification-panel')|| $(e.target).hasClass('fa-chevron-down') || $(e.target).hasClass('fa-chevron-up'))){
           $("#notifications").hide();              
        }
    });


	$("body").on(triggerEvent, ".term-link", function(){
		var term = this.getAttribute("id");
        $("#search-bar").val(term);
        setTimeout(function(){ logSearch(term, true); }, 50);                    // wait for the search bar to populate
		currentTerm = term;
        window.history.pushState("object or string", "Title", "/" + term);      // update url
		getDefinition(term, false);
	});

    $("body").on(triggerEvent, ".definition-suggestion-link", function(){
        var term = this.dataset.id;
        $("#definition-term-textarea").val(term);
        $("#term-suggestions-section").empty();
        $("#term-suggestions-section").hide();
        $(".new-definition-term").text(term);
    });

    $("body").on(triggerEvent, ".related-suggestion-link", function(){

        var term = this.dataset.id;

        if(term[term.length - 1] != ","){
            term = term + ", ";
        }   

        var currentText = $("#related-term-textarea").val();

        $("#related-term-textarea").val(currentText.substring(0, currentText.lastIndexOf(",") + 1) + " " + term);
        $("#related-term-suggestions-section").empty();
        $("#related-term-suggestions-section").hide();
        $("#definition-term-textarea").focus();
    });

    $("body").on(triggerEvent, ".report-post", function(){
        window.scrollTo(0, 0);
        displayReport(this.dataset.id, this.dataset.type);
    });

    $("body").on(triggerEvent, "#submit-report", function(){
        submitReport();
    });

    $("body").on(triggerEvent, "input[name='report']", function(){
        $(".report-error").empty();
    });

    $("body").on(triggerEvent, "#new-alert", function(){
        acknowledgeNotifications();
    });

    $("body").on(triggerEvent, ".notification-bell", function(){

        if($(".notifications-body").height() > 0) {
            $(".notifications-body").hide();
        } else {
            $(".notifications-body").show();
            displayNotification();
        }

        
    });

    $("body").on(triggerEvent, ".scroll-up", function(){
        if(currentNotificationCounter < (currentNotifications.length-1)){
            currentNotificationCounter++;
            addNotificationsToScreen();
        }
    });

    $("body").on(triggerEvent, ".scroll-down", function(){
        if(currentNotificationCounter >= 5){
            currentNotificationCounter--;
            addNotificationsToScreen();
        }
        
    });

    $("body").on(triggerEvent, ".comment-on-post", function(e){

        $(".fa-chevron-circle-down[data-id=" + this.dataset.id + "]").toggle();
        $(".comments-section[data-id=" + this.dataset.id + "]").toggle();
        $(".fa-comment[data-id=" + this.dataset.id + "]").toggle();

    });

    $("body").on(triggerEvent, ".delete-post", function(){
        var confirmation = confirm("Are you sure you want to delete this post?");
        if(confirmation){
            deletePost(this.dataset.id, this.dataset.type);
        }
    });

    $("body").on(triggerEvent, ".edit-post", function(){
        getExistingDefinition(this.dataset.id, function fetchPost(post){

            window.scrollTo(0, 0);
            $("#new-definition").show();
            var relatedTerms = "";

            for(var i = 0; i < post.related.length; i++){
                relatedTerms += post.related[i];

                if(i != (post.related.length - 1)){
                    relatedTerms += ", ";
                }
            }

            // fill out new def box with existing post
            $("#new-definition-textarea").val(post.body);
            $("#definition-term-textarea").val(post.term);
            $(".new-definition-term").text(post.term);
            $(".definition-category-selection").val(post.category);
            $("#related-term-textarea").val(relatedTerms);
            $("#add-definition")[0].dataset.id = post.id;

            var charCount = $("#new-definition-textarea").val().length;

            $("#new-definition-char-count").text(charCount);

            if(charCount >= 700 || charCount < 30){
                $("#new-definition-counter").removeClass("char-limit-warning").addClass("over-char-limit");
            } else if(charCount >= 500) {
                $("#new-definition-counter").removeClass("over-char-limit").addClass("char-limit-warning");
            } else {
                $("#new-definition-counter").removeClass("over-char-limit");
            }

        });
    });

    $("body").on("mouseenter", ".term-link", function(){
        activeTermIndex = $(".term-link").index(this);
    });

    $("body").on("mouseleave", ".term-link", function(){
        activeTermIndex = -1;
    });

    $("body").on(triggerEvent, ".stay-signed-in", function(){

        if($("#remember-account").hasClass("fa-check-square-o")){
            $("#remember-account").removeClass("fa-check-square-o");
            $("#remember-account").addClass("fa-square-o");
        } else {
            $("#remember-account").removeClass("fa-square-o");
            $("#remember-account").addClass("fa-check-square-o");
        }

    });

    
/* LISTENERS */


	$("body").on("keydown", function(e){        

	    if(e.which == 13){                                         // 13 = ENTER
	        
            if($("#search-bar").is(":focus")){ 

                if(activeTermIndex > -1){
                    var term = $(".term-link").eq(activeTermIndex).text();
                    $("#search-bar").val(term);
                    $("#terms-section").empty();
                    activeTermIndex = -1;
                    getDefinition(term, false);
                } else {
                    search();
                }
                

            } else if($("#signup-password").is(":focus") || $("#signup-login").is(":focus") ){
                signup();
            } else if ($("#login-password").is(":focus") || $("#login-login").is(":focus") ){
                login();
            }


	    }

        if(e.which == 27){                                         // 27 = ESC
            $("#signup-modal, #login-modal, #report").hide();
        }

        if(e.which == 38 || e.which == 40){                         // 38 = up arrow, 40 = down arrow
            

            var termLinks = $(".term-link");

            if(termLinks.length > 0){ 

                if(e.which == 38){
                    activeTermIndex--;
                    if(activeTermIndex  < 0){  activeTermIndex = termLinks.length-1 }
                }

                if(e.which == 40){
                    activeTermIndex++;
                    if(activeTermIndex  > (termLinks.length-1)){  activeTermIndex = 0 }
                }

                termLinks.removeClass("term-link-selected");
                termLinks.eq(activeTermIndex).addClass("term-link-selected");

                $("#search-bar").val($(".term-link-selected")[0].innerHTML);

    
            } else {
                console.log("No term links in sight");
            }
        }
	}); 

    $("body").on("keyup", "#definition-term-textarea", function(e){
        if($("#definition-term-textarea").val().length > 1){
            $("#related-term-suggestions-section").hide();
            $("#term-suggestions-section").empty();
            $("#term-suggestions-section").show();
            var searchTerm = $("#definition-term-textarea").val().trim();
            

            $(".new-definition-term").text(searchTerm);

            searchForDefinitions(searchTerm);
        } else {
            $("#term-suggestions-section").hide();
        }

        if(e.which == 8){
            $("#term-suggestions-section").empty();
        }
    });

    $("body").on("keyup", "#search-bar", function(e){
        if($("#search-bar").val().length > 1){
            if((e.which >= 48 && e.which <= 90) || (e.which >= 106 && e.which <= 111) || (e.which >= 186 && e.which <= 192) || e.which == 8 || e.which == 229){       // 48-90 are letters and numbers; 229 is registered on android
                var thisSearch = $("#search-bar").val();
                window.history.pushState("object or string", "Title", "/" + thisSearch);      // update url

                search();
            }
        } else {
            $("#terms-section").empty();
        }

        if($("#search-bar").val().length > 0){
            $("#top-terms").hide();
        } else {
            getTopSearches();
            $("#top-terms").show();
        }

        if(e.which == 8){                                         // 8 = backspace
            $("#new-definition").hide();
            $("#definitions-section").empty();
        }
    });

    $("body").on("keyup", "#related-term-textarea", function(e){
        if($("#related-term-textarea").val().length > 1){
            $("#related-term-suggestions-section").empty();
            $("#related-term-suggestions-section").show();
            var searchTerm = $("#related-term-textarea").val().split(",");       // a little more complicated here - only the last word after the comma
            searchTerm = searchTerm[searchTerm.length - 1].trim();
            searchForDefinitions(searchTerm);
        } else {
            $("#related-term-suggestions-section").hide();
        }

        if(e.which == 8){
            $("#related-term-suggestions-section").empty();
        }
    });


	$("body").on("keyup", "#new-definition-textarea", function(){
		var charCount = $("#new-definition-textarea").val().length;
        $("#new-definition-char-count").text(charCount);
        

        if(charCount >= 700 || charCount < 30){
            $("#new-definition-counter").removeClass("char-limit-warning").addClass("over-char-limit");
        } else if(charCount >= 500) {
            $("#new-definition-counter").removeClass("over-char-limit").addClass("char-limit-warning");
        } else {
            $("#new-definition-counter").removeClass("over-char-limit");
        }
	})

	$("body").on(triggerEvent, "#add-definition", function(){
	   addDefinition();
    });


    $("body").on(triggerEvent, ".add-comment", function(){
        addComment(this);
        
    });

    $("body").on(triggerEvent, ".voting-button", function(){
    
        var direction = this.dataset.vote;               // .dataset is a quick way to get data attribute value
        var id = this.dataset.id;
        var term = this.dataset.term;
        var type = this.dataset.type;

        voteOnPost(direction, id, term, type);
    
    })

    $("body").on(triggerEvent, "#new-def-link", function(){
        window.scrollTo(0, 0);

        // show new definition modal and empty text fields
        $("#new-definition").show();
        $("#new-definition-textarea, #definition-term-textarea, #related-term-textarea, .definition-category-selection").val("");
        $("#add-definition")[0].dataset.id = "0";


        if($("#category-title-label").length){
            $("#definition-term-textarea").val($("#category-title-label").text());
            $(".new-definition-term").text($("#category-title-label").text())
        } else {
            $("#definition-term-textarea").val($("#search-bar").val());
            $(".new-definition-term").text($("#search-bar").val())
        }
        
        $("#definition-term-textarea").focus();
        $("#terms-section").empty();
    });
    
    $("body").on(triggerEvent, "#close", function(){
        $(".pop-out").find("input").val("");
        $(".pop-out").find(".report-error").text("");
        $(".pop-out").hide();
    });

    /* ACCOUNT LINKS*/

    $("body").on(triggerEvent, "#login", function(){
        showLogin();
    });

    $("body").on(triggerEvent, ".login-link", function(){
        $(".pop-out").hide();
        $("#terms-section").empty();
        showLogin();
    });

    $("body").on(triggerEvent, ".sign-up-link", function(){
        $(".pop-out").hide();
        $("#terms-section").empty();
        showSignup();
    });

    $("body").on(triggerEvent, "#signup", function(){
        showSignup();
    });

    $("body").on(triggerEvent, "#account-close", function(){
        resetNavBar();
    });

    $("body").on(triggerEvent, "#login-action", function(){
        login();
    });

    $("body").on(triggerEvent, "#signup-action", function(){
        signup();
    });

    $("body").on(triggerEvent, "#logout", function(){
        logout();
    });

    $("body").on(triggerEvent, "#password-reset-action", function(){

        var email = $("#password-reset-email").val();
        if(email.indexOf("@") != -1 && email.indexOf(".") != -1){
            passwordReset();
        } else {
            $(".email-error").text("That is not a valid email");
        }
    });

    $("body").on(triggerEvent, "#password-reset-submit-action", function(){

        var password = $("#password-reset").val();
        var passwordConfirmation = $("#password-reset-confirmation").val();


        if(password === passwordConfirmation){
            if(password.length > 5){
                submitPasswordReset();
            } else {
                $(".password-error").text("Your password must be at least 6 characters long"); 
            }
        } else {
            $(".password-error").text("Your password confirmation doesn't match");
        }

    });

    $("body").on(triggerEvent, "#password-reset-link", function(){
        resetNavBar();
        $("#password-reset-email, #password-reset-action, #password-reset-modal .account-title, #password-reset-modal p").show();
        $("#reset-request-confirm").hide();
        $("#password-reset-modal").show();
    });

    $("body").on(triggerEvent, ".faq-control", function(){

            $("#" + this.id).parent().find(".show-answer").toggle();
            $("#" + this.id).parent().find(".hide-answer").toggle();
            $("#" + this.id).parent().find(".faq-answer").toggle();

    });

    $("body").on(triggerEvent, "#password-reset-link", function(){
        resetNavBar();
        $("#password-reset-email, #password-reset-action, #password-reset-modal .account-title, #password-reset-modal p").show();
        $("#reset-request-confirm").hide();
        $("#password-reset-modal").show();
    });

}






/* FUNCTIONS */

function resetNavBar(){
    $("#login-username, #login-password, #signup-username, #signup-password").val("");
    $("#login-section, #signup-section").hide();
    $("#signup-modal").hide();
    $("#login-modal").hide();
    $("#login, #signup").show();
    $(".account").show();

    if(screenWidth < 980){
        $("#home-link").css("float", "left")
    }

}

function populateRandomSearchTerm(){
    var sampleSearches = ["javascript", "rails", "node.js", "session", "function", "mongodb", "sublime text", "mvc"];
    var randomTermToSearch = "ex: " + sampleSearches[Math.floor(Math.random() * sampleSearches.length)];
    $("#search-bar").attr("placeholder", randomTermToSearch);    
}

function showLogin(){

    $(".report-error").text("");

    window.scrollTo(0, 0);

    $("#signup-modal").hide();
    $("#login-modal").show();
    $("#login-section").show();

    if(screenWidth > 980) {
        $("#login-username").focus();
    }
    
}

function showSignup(){
    window.scrollTo(0, 0);

    $(".username-error").text("");

    $("#login-modal").hide();
    $("#signup-modal").show();
    $("#signup-section").show();
    
    if(screenWidth > 980) {
        $("#signup-email").focus();
    }
}

function search(){

    if($("#search-bar").val() && location.pathname.indexOf("profile") == -1){

        var searchTerm = $("#search-bar").val().trim();
        var currentText = null;


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

                    if(result.count == 0){                                  // IF NO SUCH TERM EXISTS
                        
                        console.log("NO RESULTS");
                        $("#definitions-section").empty();
                        displayDefinitionsOnPage([], result.loggedIn, false);
                        currentText = $("#search-bar").val().trim().toLowerCase();

                        
                        
                        //if after 2 seconds the search bar contents have not changed, log the search
                        setTimeout(function checkIfSearchBarValueChanged(){
                            var newText = $("#search-bar").val().trim().toLowerCase();
                            var done = (currentText == newText);            // if currentText == newText, we're done

                            var searchQuery = {
                                term: newText
                            }

                            if(done){
                                currentText = "";
                                logSearch(searchQuery.term, false)
                            }

                        }, 2000)

                    } else if (result.count == 1){                      // if there's only one term, display the definition
                        logSearch(result.body[0].name, true);                           
                        getDefinition(result.body[0].name, false);
                        currentTerm = result.body[0].name;
                    } else if (result.count > 1){
                        result.body.forEach(function(term){
                            displaySearchTerm(term);
                        });

                        $("#definitions-section").empty();
                        displayAddDefinitionButton(false, result.loggedIn);
                    }
                        		
            	} else {
            		console.log(result.error);
            	}
            }
        })
    } else {
    	console.log("you're not searching for anything!");
    }
}

function pageSearch(){

    var searchTerm = $("#search-bar").val().trim().toLowerCase();
    
    $("#definitions-section").empty();

    var searchQuery = {
        term: searchTerm,
        user: false
    }

    $.ajax({
        type: "post",
        data: searchQuery,
        url: "/get-definitions",
        success: function(result){
            if(result.status == "success"){

                var searchTerm = $("#search-bar").val().trim();
                
                // if we get a definition for this term, post it.

                if(result.count > 0){
                    $("#definitions-section").empty();
                    displayDefinitionsOnPage(result.body, result.isLoggedIn, false);
                } else {

                    // if we don't, perform a regular search

                    search();

                }
            } else {
                console.log(result.error)
            }
        }
    })

}

function getTopSearches(){

    $.ajax({
        type: "get",
        url: "/top-searches",
        success: function(topTerms){

            $("#top-terms").empty().append("<span class = 'bold trending-label'>Trending:</span>");

            for(var i = 0; i < topTerms.topSearches.length; i++){
                var term = topTerms.topSearches[i];
                
                $("#top-terms").append(" <a class = 'top-searched-term' href = '/" + term.name +  "'> " + term.name +"</div>")
            }
        }
    })

}



function logSearch(thisTerm, hasDefinitions){

    if($("#search-bar").length == 1){
        if(thisTerm){
            console.log("recording search for " + thisTerm);
            var searchQuery = {
                term: thisTerm,
                exists: hasDefinitions          // does this term have definitions?
            }

            $.ajax({
                type: "post",
                data: searchQuery,
                url: "/log-search",
                success: function(result){
                    //console.log("logged " + newText);
                }
            });
        } 
    }
}


function searchForDefinitions(searchTerm){

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

                    $("#term-suggestions-section, #related-term-suggestions-section").empty();

                    result.body.forEach(function(term){
                        displayDefinitionSuggestion(term);
                    });
                                                       
                } else {
                    console.log(result.error);
                }
            }
        })
    } else {
        console.log("you're not searching for anything!");
    }
}

function getDefinition(query, forUser){

    $("#definitions-section").empty();

	var searchQuery = {
		term: query.toLowerCase(),
        user: false
	}

    if(forUser){
        searchQuery = {
            author: query.toLowerCase(),
            user: true
        }
    }

	$.ajax({
        type: "post",
        data: searchQuery,
        url: "/get-definitions",
        success: function(result){
        	if(result.status == "success"){

                if(!forUser){
                    var searchTerm = $("#search-bar").val().trim();
                }
                
                displayDefinitionsOnPage(result.body, result.isLoggedIn, forUser);

        	} else {
        		console.log(result.error)
        	}
        }
    })
}

function addDefinition(){

    var definitionTerm = $("#definition-term-textarea").val();
	var definitionBody = $("#new-definition-textarea").val();
	var relatedTermsArray;
    var relatedTerms = [];
    var definitionId = $("#add-definition")[0].dataset.id;

    if($("#related-term-textarea").val()){
        relatedTermsArray = $("#related-term-textarea").val().trim().split(",");

        relatedTermsArray.forEach(function(term){

            term = term.trim();

            if(validateInput(term)){
                relatedTerms.push(term);
            }

        });
    }


    if(definitionBody.trim()){
        if(definitionBody.length <= 750){
            if(definitionBody.length >= 30){
                if($("select[name='category'").val() != null){

                	var related = trimRelatedTerms();
                    var definitionCategory = $("select[name='category'").val();

                	var definitionData = {
            			term: definitionTerm.toLowerCase().trim(),
            			definition: definitionBody,
            			related: relatedTerms,
                        category: definitionCategory,
                        id: definitionId
            		}

                    if(validateInput(definitionBody)){

                        $.ajax({
                            type: "post",
                            data: definitionData,
                            url: "/new-definition",
                            success: function(result){

                                $("#terms-section").empty();
                                $("#definitions-section").empty();
                                $("#related-term-suggestions-section").empty();
                                $("select[name='category'").val(null)

                                if(result.status == "success"){
                                    
                                    getDefinition(result.term, false);
                                    
                                    if(!result.termAdded){
                                        if(parseInt(definitionId) == 0){
                                            flash("message", "Your definition for '" + result.term + "' has been submitted for review");    
                                        } else {
                                            flash("message", "Your definition for '" + result.term + "' has been updated");
                                        }
                                        
                                    } else {
                                        flash("message", "Your definition for '" + result.term + "' is live!");
                                    }
                                    
                                    $("#new-definition-textarea").val("");
                                    $("#related-term-textarea").val("");            
                                    $("#new-definition").hide();
                                    
                                    if(window.location.pathname.indexOf("/profile") != -1 ){
                                        location.reload();
                                    }

                                } else {
                                    $(".new-definition-error").text(result.error);
                                }
                            }
                        })

                    } else {
                        $(".new-definition-error").text("No profanity or links, please - use example.com for examples");
                    }            		
                } else {
                    $(".new-definition-error").text("Please pick a category for this definition");
                }
            } else {
                $(".new-definition-error").text("Please use at least 30 characters");
            }
        } else {
            $(".new-definition-error").text("Your definition needs to be under 750 characters.");
        }
	} else {
        $(".new-definition-error").text("Please enter a definition");
    }
}


function addComment(button){

    var commentBodyText = $(".new-comment-textarea[data-id='" + button.dataset.id + "']").val();

    if(commentBodyText.trim()){
        
        if(validateInput(commentBodyText)){
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

                        $(".new-comment-textarea[data-id='" + button.dataset.id + "']").val("");
                    
                        var commentSection = $(".comments-section[data-id=" + button.dataset.id + "]");
                        var commentToAdd = [result.comment];


                        $(".comment-count[data-id='" + result.comment.post_id + "']").text(parseInt($(".comment-count[data-id='" + result.comment.post_id + "']").text()) + 1);

                        displayCommentsOnPage(commentToAdd, commentSection);

                    } else {
                        $(".comments-section[data-id=" + button.dataset.id + "] .new-comment-error").text(result.error);
                    }
                }
            })
        } else {
            $(".comments-section[data-id=" + button.dataset.id + "] .new-comment-error").text("No profanity or links, please");
        }

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
                $("#" + elementId).find(".voting-button").removeClass("persistVote");
                $("#" + elementId).find(".voting-button[data-vote = '" + voteDirection + "']").removeClass("persistVote"); 

                if(result.definition.changedVote){
                    $("#" + elementId).find(".voting-button[data-vote = '" + voteDirection + "']").addClass("persistVote");    
                }
            } else {
                flash("error", result.error);
            }
        }
    })
}


function login(){

    var loginData = {
        username: $("#login-username").val().toLowerCase(),
        password: $("#login-password").val(),
        rememberMe: $("#remember-account").hasClass("fa-check-square-o")

    }

    if(loginData.username.trim().length && loginData.password.trim().length){
        $.ajax({
            type: "post",
            data: loginData,
            url: "/login",
            success: function(result){   

                if(result.status == "fail"){
                    $("." + result.errorType + "-error").text(result.message).css("display", "block");
                } else {

                    if(window.location.pathname.indexOf("/profile") != -1 ){
                        location.reload();
                    } else if(window.location.pathname.indexOf("/password-reset") != -1){
                        window.location.href = "http://hackterms.com";
                    } else {
                        $("#header-section").empty().append(result);
                        $("#signup-section, #login-section").hide();


                        // replace the "log in to add a comment" fields with textareas
                        for(var i = 0; i < $(".add-one").length - 1; i++){
                            var element = $(".add-one")[i];
                            var id = element.dataset.id;
                            element.innerHTML = "<div class = 'new-comment-error'></div><textarea class = 'new-comment-textarea' data-id = " + id + " rows = '2' maxlength = '750' placeholder = 'A penny for your thoughts?'></textarea><div class = 'button-wrapper'><button class = 'add-comment' data-id = " + id + " data-term = ''>Add</button></div>";
                        }

                        $(".login-link").attr("id", "new-def-link");
                        $(".login-link").removeClass("login-link");


                        $(".comment").removeClass("add-one");

                        var welcomeMessages = [
                            "Welcome back",
                            "Good to see you again",
                            "Let the learning begin!",
                            "Happy [insert-day-of-week here]",
                            "Did you know Guyana is located in South America?",
                            "You are logged in",
                            "0745 The humans suspect nothing",
                            "0001 0011 1011 0001  I mean, uh ... hello,  human",
                            "function(){req.session.insert.express.joke}",
                            "Did you drink enough water today?",
                            "On this day in history... people just like you did cool things",
                            "'Hackterms' is a noun, in case you were wondering",
                            "<div>My job is to show you errors and confirmations. </div>"
                        ]

                        var message = welcomeMessages[Math.floor(Math.random()*welcomeMessages.length)];

                        //flash("message", message);
                        flash("message", "You are logged in");
                    } 
                }
            }
        })
    } else {
        $(".username-error").text("Username or password can't be blank");
    }

}

function signup(){

    var signupData = {
        email: $("#signup-email").val(),
        username: $("#signup-username").val(),
        password: $("#signup-password").val()
    }

    $(".report-error").text("");


    if(signupData.username.trim().length && signupData.email.trim().length && signupData.password.trim().length){
        $.ajax({
            type: "post",
            data: signupData,
            url: "/signup",
            success: function(result){
                if(result.status == "success"){
                    resetNavBar();
                    flash("message", result.message)
                } else {
                    $(".report-error").text("");
                    $("." + result.errorType + "-error").text(result.message).css("display", "block");
                }
            }
        })
    } else {

        if(!signupData.email.trim().length){
            $(".email-error").text("Email can't be blank");
        }

        if(!signupData.username.trim().length){
            $(".username-error").text("Username can't be blank");
        }

        if(!signupData.password.trim().length){
            $(".password-error").text("Password can't be blank");
        }
        
    }
}

function passwordReset(){

    var resetData = {
        email: $("#password-reset-email").val().toLowerCase().trim()
    }


    $.ajax({
        type: "post",
        data: resetData,
        url: "/password-reset-request",
        success: function(result){
            if(result.status == "success"){                
                $("#password-reset-email, #password-reset-action, #password-reset-modal .account-title, #password-reset-modal p, .email-error").hide();
                $("#reset-request-confirm").show();
            } else {
                $(".report-error").text("");
                $("." + result.errorType + "-error").text(result.message).css("display", "block");
            }
        }
    })
 
}


function submitPasswordReset(){

    var resetData = {
        token: $(".standalone-password-reset-page")[0].dataset.token,
        password: $("#password-reset").val(),
        passwordConfirmation: $("#password-reset-confirmation").val()
    }

    $.ajax({
        type: "post",
        data: resetData,
        url: "/password-reset",
        success: function(result){

            if(result.status == "success"){                
                $("#password-reset-section").hide();
                $("#password-reset-section").remove();
                $("#login-modal, #login-section").show();
                flash("message", "Your password has been reset!")
            } else {   
                $(".password-error").text(result.message);
                $("#password-reset").val("");
                $("#password-reset-confirmation").val("");
            }
        }
    });
 
}

function logout(){

    $.ajax({
        type: "get",
        url: "/logout",
        success: function(result){
            if(result.status == "success"){
                location.reload();
                flash("error", "You have been logged out");
            } else {
                $("#login-username, #login-password, #signup-username, #signup-password").val("");
            }
        }
    })
 
}

function displayDefinitionsOnPage(definitions, isLoggedIn, forUser){

    $("#definitions-section").empty();

    console.log("displaying " + definitions.length + " defs");
    if(definitions.length > 0){

        definitions = sortPosts(definitions);

        $.get('/views/components/definition.html', function(definitionTemplate){
            $.get('/views/components/definitionCategory.html', function(definitionCategoryTemplate){

                $("#definitions-section").empty();

                // only display the category graphic on the search page, not on profiles
                if(!forUser){

                    $("#definitions-section").append(definitionCategoryTemplate);
                    $("#category-title-label").text(definitions[0].term)

                    var toolCount = languageCount = conceptCount = otherCount = processCount = 0;

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
                            case "process":
                                processCount++;
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
                    var processPercent = processCount/definitions.length;
                    var otherPercent = otherCount/definitions.length;


                    var sortedCategories = [];
                    var unsortedCategories = [
                        {
                            percentage: toolPercent, 
                            name: "#tool-percentage",
                            categoryName: "Tool/Library",
                            short: "tool"
                        },
                        {
                            percentage: conceptPercent, 
                            name: "#concept-percentage",
                            categoryName: "Concept",
                            short: "concept"
                        },
                        {
                            percentage: languagePercent, 
                            name: "#language-percentage",
                            categoryName: "Language/Environment/Framework",
                            short: "language"
                        },
                        {
                            percentage: processPercent, 
                            name: "#process-percentage",
                            categoryName: "Process",
                            short: "process"
                        },
                        {
                            percentage: otherPercent, 
                            name: "#other-percentage",
                            categoryName: "Other",
                            short: "other"
                        },
                    ];

                    for(var i = 0; i < 5; i++){

                        var maxPercentage = 0;
                        var maxIndex = 0;

                        for(var j = 0; j < unsortedCategories.length; j++){

                            if(unsortedCategories[j].percentage > maxPercentage){
                                maxPercentage = unsortedCategories[j].percentage;
                                maxIndex = j;   
                            }
                        }

                        sortedCategories.push(unsortedCategories[maxIndex]);
                        unsortedCategories.splice(maxIndex, 1);

                    }

                    for(var k = 0; k < sortedCategories.length; k++){

                        var idName = sortedCategories[k].name.substring(1, sortedCategories[k].name.length);

                        if(sortedCategories[k].percentage > 0){
                            $(".category-bar").append("<div class = 'category-stat' id = '" + idName + "'><span class = 'percentage-label' id = '" + idName + "-label'></span></div>");
                            $(sortedCategories[k].name).css("width", sortedCategories[k].percentage*100 + "%");
                            $(sortedCategories[k].name + "-label").text(Math.floor(sortedCategories[k].percentage * 100) + "%");
                            $(".category-legend").append("<span class = 'category-label'><div class = 'category-box " + sortedCategories[k].short + "'></div>" + sortedCategories[k].categoryName + "</span>");
      
                        }
                    }  
                }

                // a bit of handlebars magic

                definitions.forEach(function(thisDefinition){
                    var thisScore = thisDefinition.upvotes - thisDefinition.downvotes;

                    var myTemplate =  Handlebars.compile(definitionTemplate);
                    var hasRelatedTerms = false;

                    if(thisDefinition.related && thisDefinition.related.length){
                        hasRelatedTerms = true;
                    }

                    var context = {
                        definition: thisDefinition,
                        link: cleanUrl(thisDefinition.term),
                        editDate: thisDefinition.lastEdit.substr(4, 11),
                        score: thisScore,
                        id: thisDefinition.id,
                        commentCount: thisDefinition.comments.length,
                        related: thisDefinition.related,
                        hasRelated: hasRelatedTerms
                    };

                    var compiled = myTemplate(context)

                    $("#definitions-section").append(compiled);

                    var commentSection = $(".comments-section[data-id=" + thisDefinition.id + "]");

                    if(isLoggedIn){
                        commentSection.append("<div class = 'comment-connector'><div class = 'connector'></div></div>");
                        commentSection.append("<div class = 'comment'><div class = 'new-comment-error'></div><textarea class = 'new-comment-textarea' data-id = " + thisDefinition.id + " rows = '2' maxlength = '500' placeholder = 'A penny for your thoughts?'></textarea><div class = 'button-wrapper'><button class = 'add-comment' data-id = " + thisDefinition.id + " data-term = ''>Add</button></div></div>");
                    } else {
                        commentSection.append("<div class = 'comment-connector'><div class = 'connector'></div></div>");
                        commentSection.append("<div class = 'comment add-one' data-id = " + thisDefinition.id + "><span class = 'link bold login-link'>Log in</span> to leave a comment!</div>");
                    }

                    displayCommentsOnPage(thisDefinition.comments, commentSection);
                    commentSection.hide();

                    if(thisDefinition.authorUpvote){
                        $("#" + thisDefinition.id).find(".voting-button[data-vote='up']").addClass("persistVote");
                    }

                    if(thisDefinition.authorDownvote){
                        $("#" + thisDefinition.id).find(".voting-button[data-vote='down']").addClass("persistVote");
                    }

                });

                displayAddDefinitionButton(forUser, isLoggedIn);


            }, 'html');
        }, 'html');
    } else {
        if(location.pathname.indexOf("/profile") == -1){
            var term = $("#search-bar").val();
            $("#definitions-section").append("<div class = 'definition-accent'>There are no definitions for <span class = 'bold'>" + term + "</span> yet. You should add one!</div>");
            displayAddDefinitionButton(forUser, isLoggedIn);
        } else {
            $("#definitions-section").append("<div class = 'definition-accent'>This user hasn't added any definitions yet</div>");
            
        }
    }

}

function displayAddDefinitionButton(forUser, isLoggedIn){

    if(!forUser){
        if(isLoggedIn){
            $("#definitions-section").append("<button class = 'new-def-button' id = 'new-def-link'>Add a Definition<span></div>");
        } else {
            $("#definitions-section").append("<button class = 'new-def-button login-link'>Add a Definition</div>");
        } 
    }
}

function displayCommentsOnPage(comments, commentSection){

    comments = sortPosts(comments);

    $.get('/views/components/comment.html', function(commentTemplate) {

        // a bit of handlebars magic

        comments.forEach(function(thisComment){

            var thisScore = thisComment.upvotes - thisComment.downvotes;
            var myTemplate =  Handlebars.compile(commentTemplate);

            var context = {
                comment: thisComment,
                link: cleanUrl(thisComment.term),
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
    $("#term-suggestions-section").append("<div class = 'term'><span class = 'title'><span data-id = '" + term.name + "' class ='term-suggestion-link definition-suggestion-link'>" + term.name + "</span></span></div>");
    $("#related-term-suggestions-section").append("<div class = 'term'><span class = 'title'><span data-id = '" + term.name + "' class ='term-suggestion-link related-suggestion-link'>" + term.name + "</span></span></div>");
} 


function displayAddDefinition(term){
    $("#report").hide();
	$("#new-definition").show();
    $("#definition-term-textarea").focus();
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

                if(screenWidth < 980){
                    $("#notifications").css("left", ($(".notification-bell")[0].offsetLeft-45) + "px");
                }

                $("#notifications-section").empty();

                currentNotifications = updatedUserData.notifications;
                currentNotificationCounter = currentNotifications.length-1;

                addNotificationsToScreen();
                

            } else {
                flash("error", updatedUserData.error);
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
                $("#notifications-section").append("<div class = 'notification-panel one-notification'><a href = '/profile/status'>Your submission <span class ='bold'>" + notification.term + "</span> has been <span class ='submission-update post-"+ notification.status + "'>" + notification.status + "</a></span></div>");
            } else if (notification.type = "comment"){
                $("#notifications-section").append("<div class = 'notification-panel one-notification'>Your comment has been <span class ='submission-update post-"+notification.status + "'>" + notification.status + "</span></div>");
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
        $("#report-content").append($("#" + id).find(".definition-body").text().trim());
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
                    flash("message", "Your report has been submitted");
                } else {
                    flash("error", result.error);
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
                flash("error", result.error);
            }
        }
    })
}

function deletePost(thisId, thisType){

    var deleteInfo = {
        id: thisId,
        type: thisType
    }

    $.ajax({
        type: "post",
        url: "/delete-post",
        data: deleteInfo,
        success: function(result){
            if(result.status == "success"){
                $("#" + thisId).remove();
                window.scrollTo(0, 0);
                flash("error", "Your post has been deleted");
            } else {
                flash("error", result.error);
            }
        }
    })
}

function getExistingDefinition(thisId, callback){

    var postInfo = {
        id: thisId
    }

    $.ajax({
        type: "post",
        url: "/get-existing-post",
        data: postInfo,
        success: function(result){
            if(result.status == "success"){
                callback(result.post)
            } else {
                flash("error", result.error);
            }
        }
    })
}



/* COMMENTS */

function getCommentsForUser(query){

    var commentSection = $("#live-comment-section");

    var searchQuery = {
        author: query.toLowerCase(),
        user: true
    }

    $.ajax({
        type: "post",
        data: searchQuery,
        url: "/get-comments",
        success: function(result){
            if(result.status == "success"){

                if(result.count > 0){
                    commentSection.empty();
                    displayCommentsOnPage(result.comments, commentSection); 
                }
            } else {
                console.log(result.error);
            }
        }
    })
}


function validateInput(string){

    var isStringValid = true;
    var extraBadWords = ["fuck", "cock", "cunt", "nigger", "pussy", "bitch"];
    var forbiddenWords = ["anus", "ass", "asswipe", "ballsack", "bitch", "blowjob", "blow job", "clit", "clitoris", "cock", "coon", "cunt", "cum", "dick", "dildo", "dyke", "fag", "felching", "fuck", "fucking", "fucker", "fucktard", "fuckface", "fudgepacker", "fudge packer", "flange", "jizz", "nigger", "nigga", "penis", "piss", "prick", "pussy", "queer", "tits", "smegma", "spunk", "boobies", "tosser", "turd", "twat", "vagina", "wank", "whore"];
    var linkWords = ["http://", "https://", "www."];


    // 1. split the string into an array of words

    var clearnString = string.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");          // use regex to remove all punctuation
    var wordArray = clearnString.split(" ");

    for(var i = (wordArray.length - 1); i >= 0; i--) {              // we need to go backwards because splitting changes the length of the string
        if(wordArray[i].trim().length == 0) {
            wordArray.splice(i, 1);
        }
    }
    

    // 2. check every word against a list of offensive terms; see if it's a link other than example.com

    for(var j = 0; j < wordArray.length; j++){
        if(forbiddenWords.indexOf(wordArray[j]) != -1){
            isStringValid = false;
            console.log(wordArray[j] + " is not allowed");
        } else {

            for(var h = 0; h < extraBadWords.length; h++){
                if(wordArray[j].indexOf(extraBadWords[h]) != -1){
                    isStringValid = false;
                    console.log(wordArray[j] + " is not allowed");
                } 
            }

            for(var k = 0; k < linkWords.length; k++){
                if(string.indexOf(linkWords[k]) != -1 && string.indexOf("example.com") == -1){
                    isStringValid = false;
                    console.log(wordArray[j] + " looks like a link");
                } 
            }
        } 
    }

    return isStringValid;
}


function flash(type, text){

    if(type == "error" || type == "message"){
        $("#error, #message").hide();
        $("#" + type).css("display", "block").text(text);
    } else {
        console.log("invalid flash type");
    }

}

function cleanUrl(text){

    text = text.split("%").join("%25");
    text = text.split(" ").join("%20");
    text = text.split("$").join("%24");
    text = text.split("&").join("%26");
    text = text.split("`").join("%60");
    text = text.split(":").join("%3A");
    text = text.split("<").join("%3C");
    text = text.split(">").join("%3E");
    text = text.split("[").join("%5B");
    text = text.split("]").join("%5D");
    text = text.split("+").join("%2B");
    text = text.split("#").join("%23");
    text = text.split("@").join("%40");
    text = text.split("/").join("%2F");

    return text;

}

function trimRelatedTerms(){
    // add function to trim related terms into an array
}
