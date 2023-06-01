const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database connection setup with Mongoose
const mongoose = require('mongoose');

// Replace <username>, <password>, and <clustername> with your MongoDB Atlas credentials
const connectionURL = 'mongodb+srv://test:test@cluster1.l7r9mpw.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(connectionURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch((error) => {
  console.error('Error connecting to MongoDB Atlas:', error);
});
// User model and schema setup with Mongoose
const User = mongoose.model('User', {
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  console.log('Request Body:', req.body);
  const { email, password } = req.body;
  console.log('eamil>>>', email, 'Password:>>>', password)
  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // User not found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    // Incorrect password
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Authentication successful
    // Generate and send JWT token to the client
    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Check if user with the given email already exists
    const existingUser = await User.findOne({ email });

    // User already exists
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash the password
    console.log('eamil', email,'username',username, 'Password:', password)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    // User registration successful
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'An error occurred during registration' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
