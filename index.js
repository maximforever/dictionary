
/* dependencies */
const http = require("http");
const fs = require("fs");                               // file system
const path = require("path");                           // access paths
const express = require("express");                     // express
const MongoClient = require('mongodb').MongoClient;     // talk to mongo
const bodyParser = require('body-parser');              // parse request body
var session = require('express-session')                // create sessions

const app = express();
app.set("port", process.env.PORT || 3000)                        // we're gonna start a server on whatever the environment port is or on 3000
app.set("views", path.join(__dirname, "/public/views"));        // tells us where our views are
app.set("view engine", "ejs");                                  // tells us what view engine to use

app.use(express.static('public'));                              // sets the correct directory for static files we're going to serve - I believe this whole folder is sent to the user


const dbops = require("./app/dbops");
const database = require("./app/database");

if(process.env.LIVE){                                                                           // this is how I do config, folks. put away your pitforks, we're all learning here.
    dbAddress = "mongodb://" + process.env.MLAB_USERNAME + ":" + process.env.MLAB_PASSWORD + "@ds147864.mlab.com:47864/dev-dictionary";
} else {
    dbAddress = "mongodb://localhost:27017/dictionary";
}


MongoClient.connect(dbAddress, function(err, db){
    if (err){
        console.log("MAYDAY! MAYDAY! Crashing.");
        return console.log(err);
    } else {

    }

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());                         // for parsing application/json


    app.use(session({                                   // I THINK we only need to do this once, because it's causing us to send 2 GET requests to '/'
        secret: 'awfulPassword',
        saveUninitialized: false,
        resave: false,
        secure: false,
        cookie: {}
    }));

    app.use(function(req, res, next){                                           // logs request URL
        var timeNow = new Date();
        console.log("-----> " + req.method.toUpperCase() + " " + req.url + " on " + timeNow);  
        next();
    });

    app.use(function(req, res, next) {                                          
        app.locals.session = req.session;                                       // makes session available to all views
        app.locals.error = req.session.error;                                   // making copies like this is clunky, but it works
        app.locals.message = req.session.message;
        req.session.error = null;
        req.session.message = null;
        next();
    })

    
/* ROUTES */


    app.get("/", function(req, res){
        res.render("index");
    });

    app.post("/search", function(req, res){
        // res.send("Thanks for searching for " + req.body.term + ", come again!");
        dbops.search(db, req, function tryToSearch(response){
            if(response.status == "success"){
                req.session.message = "Got a result!"

                res.send({
                    status: "success",
                    count: response.count,
                    body: response.body
                });

            } else if(response.status == "fail"){
                res.send({
                    status: "fail",
                    error: response.message
                });
            } else {
                res.send({
                    status: "fail",
                    error: "Something strange happened"
                })
            }   
        });
    });

    app.post("/get-definitions", function(req, res){
        dbops.getDefinitions(db, req, function getDefinitions(response){
            if(response.status == "success"){
                req.session.message = "Got a result!"

                res.send({
                    status: "success",
                    count: response.count,
                    body: response.body
                });

            } else if(response.status == "fail"){
                res.send({
                    status: "fail",
                    error: response.message
                });
            } else {
                res.send({
                    status: "fail",
                    error: "Something strange happened"
                })
            }   
        });
    });

    app.post("/new-definition", function(req, res){

        dbops.addDefinition(db, req, function confirmDefinition(response){
            if(response.status == "success"){
                res.send({ 
                    status: "success",
                    term: response.term
                });

            } else if(response.status == "fail"){
                res.send({
                    status: "fail",
                    error: response.message
                });
            } else {
                res.send({
                    status: "fail",
                    error: "Something strange happened"
                })
            }   
        });


    });

    app.post("/vote", function(req, res){
        dbops.vote(db, req, function vote(response){
            if(response.status == "success"){
                res.send({
                    status: "success",
                    message: response.message
                });
            } else if(response.status == "fail"){
                res.send({
                    status: "fail",
                    error: response.message
                });
            } else {
                res.send({
                    status: "fail",
                    error: "Something strange happened"
                })
            }   
        });
    });



/* END ROUTES */


    /* 404 */

    app.use(function(req, res) {
        res.status(404);
        req.session.error = "404 - page not found!";
        res.redirect("/");
    });

    app.listen(app.get("port"), function() {
        console.log("Server started on port " + app.get("port"));
    });
});

