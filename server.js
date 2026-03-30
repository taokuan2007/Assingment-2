const express = require("express");

// create the express app
const app = express();

// choose the port number
const port = 3000;

// use pug for the pages
app.set("view engine", "pug");

// use the public folder and read form data
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// simple arrays for users and services
const users = [];

// sample services to show on the page at the start
const services = [
    {
        id: 1,
        name: "Website Design",
        category: "Design",
        price: 500,
        description: "Simple website design service.",
        ownerId: 0
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
let currentUser = null;

// make login info available in all pug pages
app.use((req, res, next) => {
    // save the logged in user for the views
    res.locals.currentUser = currentUser;

    // true if someone is logged in, false if not
    res.locals.loggedIn = currentUser ? true : false;

    // move to the next step
    next();
});

// use this for pages that need login
function requireLogin(req, res, next) {
    // if nobody is logged in, send the user to the login page
    if (!currentUser) {
        return res.redirect("/login?message=Please log in first");
    }

    // if logged in, continue
    next();
}

// home page
app.get("/", (req, res) => {
    // load the home page
    res.render("index", { title: "Home" });
});

// show login page
app.get("/login", (req, res) => {
    // if already logged in, go to dashboard
    if (currentUser) {
        return res.redirect("/dashboard");
    }

    // show the login page with empty values
    res.render("login", {
        title: "Login",
        message: req.query.message || "",
        error: "",
        formData: { email: "" }
    });
});

// check login form
app.post("/login", (req, res) => {
    // get login form values
    const email = req.body.email;
    const password = req.body.password;

    // this will store the user if found
    let foundUser = null;

    // check every user to see if the email and password match
    for (let i = 0; i < users.length; i++) {
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
            formData: { email: email || "" }
        });
    }

    // show an error if no matching user was found
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

    // go to the dashboard
    res.redirect("/dashboard");
});

// show register page
app.get("/register", (req, res) => {
    // if already logged in, go to dashboard
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
app.post("/register", (req, res) => {
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
            emailExists = true;
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
            error: "Passwords do not match.",
            formData: { name, email }
        });
    }

    // stop the user if the email is already taken
    if (emailExists) {
        return res.render("register", {
            title: "Register",
            error: "Email already exists.",
            formData: { name, email }
        });
    }

    // create the new user object
    const newUser = {
        id: users.length + 1,
        name,
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
app.post("/logout", (req, res) => {
    // remove the logged in user
    currentUser = null;

    // send the user back to login
    res.redirect("/login?message=You have been logged out");
});

// private dashboard page
app.get("/dashboard", requireLogin, (req, res) => {
    // this stores how many services the user has
    let total = 0;

    // count how many services belong to the user
    for (let i = 0; i < services.length; i++) {
        if (services[i].ownerId === currentUser.id) {
            total = total + 1;
        }
    }

    // show the dashboard page
    res.render("dashboard", {
        title: "Dashboard",
        serviceCount: total
    });
});

// show add service page
app.get("/add-service", requireLogin, (req, res) => {
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
app.post("/add-service", requireLogin, (req, res) => {
    // get form values
    const serviceName = req.body.serviceName;
    const category = req.body.category;
    const price = req.body.price;
    const description = req.body.description;

    // make sure all fields are filled in
    if (!serviceName || !category || !price || !description) {
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

    // save the new service
    services.push(newService);

    // go to the services page
    res.redirect("/services");
});

// show all services
app.get("/services", (req, res) => {
    // get search and category from the page
    const search = req.query.search || "";
    const category = req.query.category || "";

    // new array for the matching services
    const filteredServices = [];

    // go through each service and check if it matches
    for (let i = 0; i < services.length; i++) {
        const service = services[i];
        let matchesSearch = true;
        let matchesCategory = true;

        // check the search word
        if (search) {
            const lowerSearch = search.toLowerCase();
            matchesSearch =
                service.name.toLowerCase().includes(lowerSearch) ||
                service.description.toLowerCase().includes(lowerSearch);
        }

        // check the category
        if (category) {
            matchesCategory = service.category === category;
        }

        // add the service if it matches both checks
        if (matchesSearch && matchesCategory) {
            filteredServices.push(service);
        }
    }

    // show the services page
    res.render("services", {
        title: "Services",
        services: filteredServices,
        filters: {
            search,
            category
        }
    });
});

// start server
app.listen(port, () => {
    console.log("Server running on port 3000");
});
