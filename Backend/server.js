const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/moviesdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// Register User
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
});

// Login User
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    res.status(200).json({ message: "Login successful", username: user.username });
});

// get user profile
app.get('/profile/:username', async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) {
      return res.status(404).json({ message: "User not found" });
  }
  res.json({ username: user.username });
});

// Movie Schema
const movieSchema = new mongoose.Schema({
    title: String,
    director: String,
    category: String
});

const Movie = mongoose.model('Movie', movieSchema);

// GET all movies
app.get('/movies', async (req, res) => {
    const movies = await Movie.find();
    res.json(movies);
});

// POST add a new movie
app.post('/movies', async (req, res) => {
    const { title, director, category } = req.body;
    const newMovie = new Movie({ title, director, category });
    await newMovie.save();
    res.status(201).json(newMovie);
});

// PUT update a movie category
app.put('/movies/update-category/:id', async (req, res) => {
  const { category } = req.body;
  const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, { category }, { new: true });
  updatedMovie ? res.json(updatedMovie) : res.status(404).json({ message: "Movie not found" });
});

// DELETE a movie
app.delete('/movies/:id', async (req, res) => {
  const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
  deletedMovie ? res.json({ message: "Movie deleted successfully" }) : res.status(404).json({ message: "Movie not found" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
