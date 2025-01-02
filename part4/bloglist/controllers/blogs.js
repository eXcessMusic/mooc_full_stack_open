const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const middleware = require("../utils/middleware");

blogsRouter.get("/", middleware.userExtractor, async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 }); // populate the user field
    response.json(blogs);
});

/* const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '')
    }
    return null
} */

blogsRouter.post("/", middleware.userExtractor, async (request, response) => {
    const body = request.body;

    if (!body.title || !body.url) {
        return response.status(400).json({ error: "title and url are required" });
    }

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: request.user._id, // add the user's ID to the blog
    });
    const savedBlog = await blog.save();
    request.user.blogs = request.user.blogs.concat(savedBlog._id); // add the blog's ID to the user's blogs array
    await request.user.save(); // save the changes to the user document

    response.status(201).json(savedBlog);
});

blogsRouter.put("/:id", async (request, response) => {
    const body = request.body;
    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    };
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true });
    response.json(updatedBlog);
});

blogsRouter.delete('/:id', async (request, response) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)
    if (!user) {
        return response.status(401).json({ error: 'user not found' })
    }
    const blog = await Blog.findById(request.params.id)
    if (blog.user.toString() !== user._id.toString()) {
        return response.status(401).json({ error: 'user not authorized' })
    }
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

module.exports = blogsRouter;