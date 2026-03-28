const express = require("express");
const app = express();
const port = 3000;

// set pug
app.set("view engine", "pug");

// middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
});

app.get("/login", (req, res) => {
    res.render("login", { title: "Login" });
});

app.get("/register", (req, res) => {
    res.render("register", { title: "Register" });
});

app.get("/dashboard", (req, res) => {
    res.render("dashboard", { title: "Dashboard" });
});

app.get("/add-service", (req, res) => {
    res.render("addService", { title: "Add Service" });
});

app.get("/services", (req, res) => {
    res.render("services", { title: "Services" });
});

// start server
app.listen(port, () => {
    console.log("Server running on port 3000");
});
