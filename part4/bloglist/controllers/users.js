const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("/", async (request, response) => {
    const { username, name, password } = request.body;

    if (!username || !password) {
        return response.status(400).json({ error: "username and password are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return response.status(400).json({ error: "username must be unique" });
    }

    if (password.length < 3) {
        return response.status(400).json({ error: "password must be at least 3 characters long" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
        username,
        name,
        passwordHash,
    });

    const savedUser = await user.save();

    response.status(201).json(savedUser);
});

usersRouter.get('/', async (request, response) => {
    try {
        const users = await User.find({}).populate('blogs');
        response.json(users);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Failed to populate blogs' });
    }
});

module.exports = usersRouter;
