const dummy = (blogs) => {
    return 1;
};

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
    return blogs.reduce((prev, current) => {
        return prev.likes > current.likes ? prev : current;
    });
};

const mostBlogs = (blogs) => {
    // Handle empty array case
    if (blogs.length === 0) {
        return null;
    }

    // First find the author with the most blogs
    const authorWithMostBlogs = blogs.reduce((prev, current) => {
        return prev.blogs > current.blogs ? prev : current;
    });

    // Then count the number of blogs by that author
    const authorBlogsCount = blogs.reduce((sum, blog) => {
        return blog.author === authorWithMostBlogs.author ? sum + 1 : sum;
    }, 0);

    // Return a new object with just the author and blogs properties
    return {
        author: authorWithMostBlogs.author,
        blogs: authorBlogsCount
    };
};

// Function should return the author of the blog with the most likes
const mostLikes = (blogs) => {
    // Handle empty array case
    if (blogs.length === 0) {
        return null;
    }

    // First find the blog with the most likes
    const blogWithMostLikes = blogs.reduce((prev, current) => {
        return prev.likes > current.likes ? prev : current;
    });

    // Return a new object with just the author and likes properties
    return {
        author: blogWithMostLikes.author,
        likes: blogWithMostLikes.likes
    };
};

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
};
