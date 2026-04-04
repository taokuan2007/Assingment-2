const express = require("express"); // loads the express libary

// create the express app
const app = express(); // used to define app.*** routes, settings and middleware

// choose the port number
const port = 3000; //local port

// use pug for the pages
app.set("view engine", "pug");  //usses pug instead of HTML

// use the public folder and read form data
app.use(express.static("public")); //CSS/files in public, the browser can access them
app.use(express.urlencoded({ extended: true })); // without this line, things like req.body.email would not work

// simple arrays for users and services
const users = []; //this app stores users only in memory, not in a database. Restart the server and they're gone

// sample services to show on the page at the start
const services = [
    {
        id: 1, //unique number
        name: "Website Design", //service name
        category: "Design", //type of service
        price: 500, //cost
        description: "Simple website design service.", //details
        ownerId: 0 // who owns it
        //same concept for other services
    },
    {
        id: 2,
        name: "Phone Repair",
        category: "Repair",
        price: 80,
        description: "Basic phone repair service.",
        ownerId: 0
    },
    {   id: 3,
        name: "Computer Repair",
        category: "Repair",
        price: 100,
        description: "Basic computer repair service. Prices may vary based on the issue.",
        ownerId: 0
    },
    {
        id: 4,
        name: "Social Media Help",
        category: "Marketing",
        price: 200,
        description: "Help with social media pages.",
        ownerId: 0
    }
];

// this stores who is logged in
let currentUser = null; //this app tracks login using one variable

// make login info available in all pug pages
app.use((req, res, next) => { //req = request, res = response, next = function to continue to the next middleware/route
    // save the logged in user for the views
    res.locals.currentUser = currentUser; //in Pug, you can show the logged-in user’s name

    // true if someone is logged in, false if not
    res.locals.loggedIn = currentUser ? true : false; //if currentUser exists, loggedIn = true, otherwise, loggedIn = false

    // move to the next step
    next();
});

// use this for pages that need login
function requireLogin(req, res, next) { //creates a function named requireLogin
    // if nobody is logged in, send the user to the login page
    if (!currentUser) { //checks if there is no current user
        return res.redirect("/login?message=Please log in first"); //if the user is not logged in, they are sent to /login
    }

    // if logged in, continue
    next(); 
}

//ROUTES

// home page
app.get("/", (req, res) => { //app.get() handles GET requests. "/" means the home page
    // load the home page
    res.render("index", { title: "Home" }); //renders pug, points to index.pug
});

// show login page
app.get("/login", (req, res) => {
    // if someone is already logged in, they do not need the login page, so send them to the dashboard
    if (currentUser) {
        return res.redirect("/dashboard"); 
    }

    // show the login page with empty values
    res.render("login", { 
        title: "Login", //Sets the page tittle
        message: req.query.message || "", //reads message from URL query string, if no message exists, use an empty string
        error: "", //means no error yet
        formData: { email: "" } //empty email field
    });
});

// check login form
app.post("/login", (req, res) => { //handles form submissions to /login
    // get the submitted values from the form
    const email = req.body.email;
    const password = req.body.password;

    // this will store the user if found
    let foundUser = null; 

    // check every user to see if the email and password match
    for (let i = 0; i < users.length; i++) { //oop through every user in the users array
        //check whether: email matches and password matches = If both match, save that user in foundUser
        if (users[i].email === email && users[i].password === password) {
            foundUser = users[i];
        }
    }

    // show an error if fields are missing
    if (!email || !password) {
        return res.render("login", {
            title: "Login",
            message: "",
            error: "Please fill in all fields.",
            formData: { email: email || "" } //email is preserved so user does not need to type it again
        });
    }

    //if no matching user was found: Show the login page again with an error message
    if (!foundUser) {
        return res.render("login", {
            title: "Login",
            message: "",
            error: "Wrong email or password.",
            formData: { email }
        });
    }

    // save the user as logged in
    currentUser = foundUser;

    // send them to the dashboard
    res.redirect("/dashboard");
});

// show register page
app.get("/register", (req, res) => {
    // if already logged in, skip registration page, go to dashboard
    if (currentUser) {
        return res.redirect("/dashboard");
    }

    // show the register page with empty values
    res.render("register", {
        title: "Register",
        error: "",
        formData: {
            name: "",
            email: ""
        }
    });
});

// save a new user
app.post("/register", (req, res) => { //handles submitted register form
    // get register form values
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    // this checks if the email already exists
    let emailExists = false;

    // go through the users and compare emails
    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            emailExists = true; //if yes, set to true
        }
    }

    // make sure all fields are filled in
    if (!name || !email || !password || !confirmPassword) {
        return res.render("register", {
            title: "Register",
            error: "Please fill in all fields.",
            formData: { name: name || "", email: email || "" }
        });
    }

    // make sure both passwords match
    if (password !== confirmPassword) {
        return res.render("register", {
            title: "Register",
            error: "Passwords do not match.", // show error if they do not match
            formData: { name, email }
        });
    }

    // stop the user if the email is already taken
    if (emailExists) {
        return res.render("register", {
            title: "Register",
            error: "Email already exists.", //if yes, show error
            formData: { name, email }
        });
    }

    // create the new user object
    const newUser = {
        id: users.length + 1, //gives a simple new ID
        name, //short for name: name ; same for others
        email,
        password
    };

    // save the user in the array
    users.push(newUser);

    // log in the new user right away
    currentUser = newUser;

    // go to dashboard after register
    res.redirect("/dashboard");
});

// logout
app.post("/logout", (req, res) => { //handles logout form submission
    // remove the logged in user
    currentUser = null;

    // send the user back to login with a message
    res.redirect("/login?message=You have been logged out");
});

// private dashboard page
app.get("/dashboard", requireLogin, (req, res) => { //that means user must be logged in first
    // this stores how many services the user has
    let total = 0; //starts the counter

    // count how many services belong to the user
    for (let i = 0; i < services.length; i++) { //loops through all
        if (services[i].ownerId === currentUser.id) {
            total = total + 1; //if a service belongs to the logged-in user, add 1 to total
        }
    }

    // show the dashboard page
    res.render("dashboard", {
        title: "Dashboard",
        serviceCount: total //how many services this user owns
    });
});

// show add service page
app.get("/add-service", requireLogin, (req, res) => { //only logged-in users can access this page
    // show the form with empty values
    res.render("addService", {
        title: "Add Service",
        error: "",
        formData: {
            serviceName: "",
            category: "",
            price: "",
            description: ""
        }
    });
});

// save a new service
app.post("/add-service", requireLogin, (req, res) => { //only logged-in users can submit this route
    // get submitted form values
    const serviceName = req.body.serviceName;
    const category = req.body.category;
    const price = req.body.price;
    const description = req.body.description;

    // make sure all fields are filled in
    if (!serviceName || !category || !price || !description) { //check if any field is missing
        //if missing, show form again with error and keep entered values
        return res.render("addService", {
            title: "Add Service",
            error: "Please fill in all fields.",
            formData: {
                serviceName: serviceName || "",
                category: category || "",
                price: price || "",
                description: description || ""
            }
        });
    }

    // create a new service object
    const newService = {
        id: services.length + 1,
        name: serviceName,
        category,
        price,
        description,
        ownerId: currentUser.id
    };

    // add the new service to the services array
    services.push(newService);

    // go to the services page after adding
    res.redirect("/services");
});

// show all services
app.get("/services", (req, res) => { //his route is public. Anyone can view services
    // get search and category from the page ; read filter values from the URL.
    const search = req.query.search || ""; // E.g. /services?search=repair
    const category = req.query.category || ""; //E.g. /services?category=Repair
    //if missing, use empty string

    // new array for the matching services
    const filteredServices = [];

    // go through each service and check if it matches
    for (let i = 0; i < services.length; i++) {
        const service = services[i];
        let matchesSearch = true;
        let matchesCategory = true;

        // check the search word
        if (search) { //only do search filtering if user entered a search term
            const lowerSearch = search.toLowerCase(); //so comparison is case-insensitive
            matchesSearch = //this checks whether the search text appears in either: service name, service description
                service.name.toLowerCase().includes(lowerSearch) || //.includes() returns true if text exists inside the string
                service.description.toLowerCase().includes(lowerSearch);
        }

        // check the category, if category was chosen, only match services whose category is exactly the same.
        if (category) {
            matchesCategory = service.category === category;
        }

        // only add the service if both conditions are true
        if (matchesSearch && matchesCategory) {
            filteredServices.push(service);
        }
    }

    // show the services page
    res.render("services", {
        //sends
        title: "Services",
        services: filteredServices,
        filters: {
            search,
            category
        }
    });
});

// start server
app.listen(port, () => { //this starts the server and tells it to listen on the chosen port
    console.log("Server running on port 3000"); // prints message in the console
});
