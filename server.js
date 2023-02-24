const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "secretkey";

const app = express();

app.use(express.json());
app.use(cors());

const con = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "",
  database: "volafinance-register",
});

con.connect(function (error) {
  if (error) console.log(error + " Not connected....");
  console.log("MySql is connected...");
});

app.post("/register", (req, res) => {
  const name = req.body.name;
  const age = req.body.age;
  const email = req.body.email;
  const password = req.body.password;
  const address = req.body.address;
  console.log(req.body);

  con.query(
    "INSERT INTO users (name, age, email, password, address) VALUES (?, ?, ?, ?, ?)",
    [name, age, email, password, address],
    (err, result) => {
      if (result) {
        res.send(result);
        console.log("result", result);
      } else {
        res.send({ msg: "Incorrect details" });
      }
    }
  );
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // console.log(email);

  con.query(
    "SELECT * FROM users WHERE email = ? AND password = ? ",
    [email, password],
    (err, result) => {
      if (err) {
        console.error(err);
        req.setEncoding({ err: err });
      } else {
        if (result.length > 0) {
          console.log(result[0].Email);
          const token = jwt.sign({ email: result[0].Email }, JWT_SECRET, {
            expiresIn: "15m",
          });
          if (res.status(201)) {
            return res.json({ status: "ok", data: token });
          }
          res.send(result);
        } else {
          res.send({ msg: "Incorrect credentials" });
        }
      }
    }
  );
});

app.post("/details", (req, res) => {
  const { token } = req.body;

  const user = jwt.verify(token, JWT_SECRET, (err, res) => {
    if (err) {
      // console.log(err.message);
      return "token expired";
    }
    return res;
  });
  console.log("user", user);
  if (user == "token expired") {
    return res.send({ status: "error", data: "token expired" });
  } 

  const email = user.email;

  con.query("SELECT * FROM users WHERE email = ? ", [email], (err, result) => {
    if (err) {
      console.error(err);
      req.setEncoding({ err: err });
    } else {
      if (result.length > 0) {
        console.log("result", result);
        res.send(result);
      } else {
        res.send({ msg: "galt details" });
      }
    }
  });
});

app.listen(5000, () => {
  console.log("Express running");
});
