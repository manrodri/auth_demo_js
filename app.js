var express             = require("express"),
app                     = express(),
PORT                    = 8080,
mongoose                = require('mongoose'),
bodyParser              = require('body-parser'),
passport                = require('passport'),
localStrategy           = require('passport-local'),
passportLocalMongoose   = require('passport-local-mongoose');
User                    = require('./models/user');

app.set('view engine', 'ejs');
app.use(require('express-session')({
    secret: "Linda is the best dog",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new localStrategy(User.authenticate()));

mongoose.connect('mongodb://localhost/auth_demo_app', { useNewUrlParser: true });

// ROUTES
// =================

// AUTH ROUTES
// ================
app.get('/register', function(req, res){
    res.render('register')
});

app.post('/register', function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        } 
        passport.authenticate('local')(req, res, function(){
            res.redirect('/secret');
        });
    });
});
// login routes
app.get('/login', function(req, res){
    res.render('login');
});

app.post("/login", passport.authenticate('local',{
    successRedirect: "/secret",
    failureRedirect: '/login',
}), function(req, res){ });
// logout
app.get('/logout', function(req, res){
    req.logOut();
    res.redirect('/')
});
app.get("/", function(req, res){
    res.render('home');
});

app.get('/secret', isLoggedIn, function(req,res){
    res.render('secret');
});

app.listen(PORT, function(){
    console.log('Server started...');
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}