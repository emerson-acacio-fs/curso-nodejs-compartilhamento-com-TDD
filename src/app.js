let express = require("express");
const mongoose = require("mongoose");
const user = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

const JWT_SECRET = "JASJSNXXNNCDKFKJNKsdsbvhmk,l;.o,mgbcgffsdccgtrehyjuvujubvu";

const User = mongoose.model("User", user);
mongoose
  .connect("mongodb://localhost:27017/guiapics", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Banco ok"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.status(200);
  res.send("ok");
});
app.delete("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    await User.deleteOne({ email });
    res.status(200);
    res.send("ok");
  } catch (err) {
    res.status(500);
    res.json({ err });
  }
});
app.post("/auth", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log(user, email);
    if (!user) {
      res.status(403);
      res.json({ errors: { email: "E-mail não cadastrado" } });
      return;
    }
    const isPasswordRight = await bcrypt.compare(password, user.password);

    if (!isPasswordRight) {
      res.status(403);
      res.json({ errors: { password: "Senha inválida" } });
      return;
    }
    jwt.sign(
      { email, name: user.name, id: user._id },
      JWT_SECRET,
      { expiresIn: "48h" },
      (err, token) => {
        if (err) {
          res.status(500);
          res.json({ err });
        } else {
          console.log(token);
          res.json({ token });
        }
      }
    );
  } catch (err) {
    res.status(500);
    res.json({ err });
  }
});
app.post("/user", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    res.json({ err: "campo vazio" });
    return;
  }
  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(400);
      res.send({ err: "E-mail já cadastrado" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hash });
    await newUser.save();

    res.json({ email });
  } catch (err) {
    res.status(500);
    res.json({ err });
  }
});

module.exports = app;
