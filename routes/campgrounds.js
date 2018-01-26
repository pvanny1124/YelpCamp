var express     = require("express");
var router      = express.Router();
var Campground  = require("../models/campgrounds");
var middleware  = require("../middleware"); //don't have to do "../middleware/index.js" because index.js is automatically looked for

//INDEX 
router.get("/", function(req, res){
        //get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else {
                res.render("campgrounds/index", {campgrounds: allCampgrounds});
                //req.user has info such as username and id of the user. this will be used for navbar purposes such as hiding the login and sign up buttons!
            }
        });
        
});

//NEW route
//form that will send data to post route of /campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});



//CREATE
router.post("/", middleware.isLoggedIn, function(req, res){
    //get data from form
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: description, author: author};
    //create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
    //push into campground array
    //don't need following line anymore after DB addition
    //campgrounds.push(newCampground);
    //redirect back to campgrounds page
    //res.redirect("/campgrounds"); //default is to redirect to a get request
});

//SHOW
router.get("/:id", function(req, res) {
    //find the campgroun with provided id and populate it with actual comments
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground);
            //render show template with that template
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    
        Campground.findById(req.params.id, function(err, foundCampground){
            res.render("campgrounds/edit", {campground: foundCampground});
            //no need to handle error since middleware does this for us already
    });
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //find and update the correct campground
     //redirect to showpage
    //could do the following, but this is annoying. use other method with campground[attribute] in form itself
    //var data = {name: req.body.name, image: req.body.image, description: req.body.description};
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
   
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});


module.exports = router;
