const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
    },
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
    },
]

let token = null

beforeEach(async () => {
    try {
        // Clear the databases
        await Blog.deleteMany({})
        await User.deleteMany({})

        console.log('Databases cleared')

        // Create a test user
        const passwordHash = await bcrypt.hash('testpassword', 10)
        const user = new User({
            username: 'testuser',
            name: 'Test User',
            passwordHash
        })
        const savedUser = await user.save()
        console.log('Test user created:', savedUser.username)

        // Login to get token
        const loginResponse = await api
            .post('/api/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            })
        
        if (!loginResponse.body.token) {
            throw new Error('Token not received from login')
        }
        
        token = loginResponse.body.token
        console.log('Login successful, token received')

        // Create initial blogs with the user reference
        const blogObjects = initialBlogs.map(blog => ({
            ...blog,
            user: savedUser._id
        }))
        const promiseArray = blogObjects.map(blog => new Blog(blog).save())
        await Promise.all(promiseArray)
        console.log('Initial blogs created')

    } catch (error) {
        console.error('Error in beforeEach:', error)
        throw error // Re-throw to fail the test
    }
})

describe('when there is initially some blog posts', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
        assert.strictEqual(response.body.length, initialBlogs.length)
    })

    test('a specific blog is within the returned blogs', async () => {
        const response = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
        const titles = response.body.map(blog => blog.title)
        assert(titles.includes('React patterns'))
    })

    test('unique identifier property of the blog posts is named id', async () => {
        const response = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
        const blog = response.body[0]
        assert(blog.id)
    })
})

describe('adding a new blog', () => {
    test('a valid blog can be added', async () => {
        const newBlog = {
            title: 'Canonical string reduction',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
            likes: 12
        }
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
        assert.strictEqual(response.body.length, initialBlogs.length + 1)
    })

    test('likes default to 0 if not provided', async () => {
        const newBlog = {
            title: 'Canonical string reduction',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html'
        }
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)

        const response = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
        const addedBlog = response.body.find(blog => blog.title === 'Canonical string reduction')
        assert.strictEqual(addedBlog.likes, 0)
    })

    test('title and url are required', async () => {
        const newBlog = {
            author: 'Edsger W. Dijkstra',
            likes: 12
        }
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)
    })

    test('adding a blog fails with status code 401 if token is not provided', async () => {
        const newBlog = {
            title: 'Canonical string reduction',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
            likes: 12
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
    })
})

describe('deleting a blog', () => {
    test('a blog can be deleted by the user who created it', async () => {
        const response = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
        const blogToDelete = response.body[0]
        
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
            
        const responseAfterDelete = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
        assert.strictEqual(responseAfterDelete.body.length, initialBlogs.length - 1)
    })

    test('deleting a blog fails with status code 401 if token is not provided', async () => {
        const response = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
        const blogToDelete = response.body[0]
        
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(401)
    })
})

describe('updating a blog', () => {
    test('a blog can be updated', async () => {
        const response = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
        const blogToUpdate = response.body[0]
        
        const updatedBlog = {
            title: 'Canonical string reduction',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
            likes: 12
        }
        
        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const responseAfterUpdate = await api
            .get('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
        const updatedBlogAfterUpdate = responseAfterUpdate.body.find(blog => blog.id === blogToUpdate.id)
        assert.strictEqual(updatedBlogAfterUpdate.title, 'Canonical string reduction')
        assert.strictEqual(updatedBlogAfterUpdate.author, 'Edsger W. Dijkstra')
        assert.strictEqual(updatedBlogAfterUpdate.url, 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html')
        assert.strictEqual(updatedBlogAfterUpdate.likes, 12)
    })
})

after(async () => {
    await mongoose.connection.close()
})