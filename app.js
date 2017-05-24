var express     = require("express"),
expressSanitizer = require("express-sanitizer"),
app             = express(),
bodyParser      = require("body-parser"),
methodOverride  = require("method-override"),
mongoose        = require("mongoose");


// App Config
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/restful_blog_app");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method")); // look for _method in requests and treat it as the specified request type i.e. _method=PUT
// Mongoose Model Config
var blogSchema = new mongoose.Schema({
    title: String,
    image: {type: String, default: "http://www.kortext.com/wp-content/uploads/2017/03/Oli-Blog-2.jpg"},
    body: String,
    created: {type: Date, default: Date.now} // adds a default placeholder if not specified
});

var Blog = mongoose.model("blog", blogSchema);


// test data
/*Blog.create({
    title: "Test Blog2",
    body:"Hello World"
});
*/
// RESTFUL Routes


app.get("/", function(req, res) {
  res.redirect("/blogs");
})

// INDEX
app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs) {
    if(err){
      console.log("Error");
    } else {
      res.render("index", {blogs: blogs});
    }
  });
});

// NEW ROUTE
app.get("/blogs/new", function(req, res) {
      res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body); // sanitize blog body field for malicious scripts, could use middleware for this
  Blog.create(req.body.blog, function(err, newBlog) {
    if(err) {
      res.render("new");
    } else {
      //redirect
      res.redirect("/blogs");
    }
  });
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if(err) {
      res.redirect("/blogs");
    } else {
      res.render("show", {blog: foundBlog});
    }
  });

});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog) {
    if(err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", {blog: foundBlog});
    }
  });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body); // sanitize blog body field for malicious scripts, could use middleware for this
  // find and update
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) { 
    if(err) {
      console.log(err);
    } else {
       res.redirect("/blogs/" + req.params.id);
    }
  });
});

// DESTROY ROUTE
app.delete("/blogs/:id", function(req, res) {
  //destroy blog
  Blog.findByIdAndRemove(req.params.id, function(err) {
    if(err) {
      console.log(err);
  } else {
    res.redirect("/blogs");
  }
  });
});

// title
// image
// body
// created





app.listen(process.env.PORT, process.env.IP, function(){
  console.log("Server is running.");
});