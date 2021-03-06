var express = require("express"),
	router = express.Router({
		mergeParams: true
	}),
	Campground = require("../models/campground"),
	Comment = require("../models/comment"),
	middleware = require("../middleware");

//NEW COMMENT FORM ROUTE
router.get("/new", middleware.isLoggedIn, function (req, res) {
	Campground.findById(req.params.id, function (err, campground) {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", {
				campground: campground
			});
		}
	});
});

//NEW COMMENT POST ROUTE
router.post("/", middleware.isLoggedIn, function (req, res) {
	//find campground by id
	Campground.findById(req.params.id, function (err, campground) {
		if (err) {
			console.log(err);
		} else {
			Comment.create(req.body.comment, function (err, comment) {
				if (err) {
					console.log(err);
				} else {
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "You have successfully posted a comment!");
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});

//COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
	Comment.findById(req.params.comment_id, function (err, foundComment) {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/edit", {
				campground_id: req.params.id,
				comment: foundComment
			})
		}
	});
});

//COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, foundComment) {
		if (err) {
			res.redirect("back");
		} else {
			req.flash("success", "Comment successfully updated.");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//COMMENT DELETE ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
	Comment.findByIdAndRemove(req.params.comment_id, req.body.comment, function (err) {
		if (err) {
			res.redirect("back");
		} else {
			req.flash("success", "Comment successfully deleted.");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;