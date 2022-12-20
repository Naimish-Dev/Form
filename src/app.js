require('dotenv').config()
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcrypt")


// Data base connect 
require("./db/conect")
// module (schema ) require 
const moduleData = require("./module/model")

// set hendel bar medalwar 
app.set("view engine", "hbs")

// set dynamic path of public(CSS) folder  
const static_path = path.join(__dirname, "../public")
app.use(express.static(static_path));

// set Views direct path
const new_views_path = path.join(__dirname, "./templates/views")
app.set("views", new_views_path);

//set partias file path
const new_partials_path = path.join(__dirname, "./templates/partials")
hbs.registerPartials(new_partials_path);


// use jason data in frountend to backend 
app.use(express.json());
// use dependency when data pass away from websit and fetch in backend 
app.use(express.urlencoded({ extended: false }))

// checking env is runing 
// console.log(process.env.database)


// routing
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/LogIn', (req, res) => {
    res.render('login')

});

app.post('/LogIn', async (req, res) => {
    try {
        const pass = req.body.password;
        const cpass = req.body.conformpassword;
        // simplay how to  hasing password
        // const PasswordHash=await bcrypt.hash(pass,5);
        // console.log(PasswordHash);

        if (pass === cpass) {
            const NewData = new moduleData({
                username: req.body.username,
                email: req.body.email,
                phonenumber: req.body.phonenumber,
                password: req.body.password,
                comformpassword: req.body.conformpassword,
                gender: req.body.radiobtn,
            })

            // Token generate sem fubnction is definr in side of module 
            const Token = await NewData.generateAuthToken();

            const setdara = await NewData.save()
            res.status(201).render("index")
        } else {
            res.send("password is not same")
        }
    } catch (e) {
        console.log(e)
        res.status(400)
    }

});

app.get('/signUp', (req, res) => {
    res.render('signup')
})

app.post('/signUp', async (req, res) => {
    try {

        const Uemail = req.body.email;
        const Upassword = req.body.password;
        const UserData = await moduleData.findOne({ email: Uemail })
        const dbpassworf = await UserData.password
        // normaly compar bcrypt password 
        const Isvalid = await bcrypt.compare(Upassword, dbpassworf)
        console.log(Isvalid);
        const Token = await UserData.generateAuthToken();
        console.log(Token)

        if (Isvalid) {
            res.render("index")
        } else {
            res.send("invalide data")
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))