const express = require("express");
const app = express();

// set pug
app.set("view engine", "pug");

// middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/dashboard", (req, res) => {
    res.render("dashboard");
});

app.get("/add-service", (req, res) => {
    res.render("addService");
});

app.get("/services", (req, res) => {
    res.render("services");
});

// start server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});