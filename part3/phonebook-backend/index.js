require('dotenv').config()

const express = require('express')
const app = express()
const morgan = require('morgan')

const cors = require('cors')

app.use(cors())

const Person = require('./models/person')

// Define our token that knows how to access the request body
morgan.token('body', (req) => {
    // Only show body for POST requests, otherwise show nothing
    return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

// Then, tell Morgan to use this new token in its logging format
app.use(
    morgan(
        ':method :url :status :res[content-length] - :response-time ms :body'
    )
)

app.use(express.static('dist'))

app.use(express.json())

/* let persons = [
    {
        id: '1',
        name: 'Arto Hellas',
        number: '040-123456',
    },
    {
        id: '2',
        name: 'Ada Lovelace',
        number: '39-44-5323523',
    },
    {
        id: '3',
        name: 'Dan Abramov',
        number: '12-43-234345',
    },
    {
        id: '4',
        name: 'Mary Poppendieck',
        number: '39-23-6423122',
    },
] */

// GET homepage
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

// GET info
app.get('/info', (request, response) => {
    const date = new Date()

    Person.countDocuments({})  // This is more efficient than fetching all documents, uses a mongoDB command
        .then(count => {
            response.send(
                `<p>Phonebook has info for ${count} people!</p>
                <p>${date}</p>`
            )
        })
        .catch(error => {
            console.error('Error fetching person count:', error)
            response.status(500).send('Error retrieving phonebook info')
        })
})

// GET persons - Modified to use MongoDB
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

// GET specific person with ID
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error)) // Pass errors to error handler
})

// DELETE person - Modified to use MongoDB
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

/* // Generate ID -- No longer needed with mongoDB
const generateId = () => {
    const maxId =
        persons.length > 0 ? Math.max(...persons.map((n) => Number(n.id))) : 0;
    return String(maxId + 1);
}; */

// POST new person - Modified to use MongoDB
app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing, both name and number are required'
        })
    }

    // Check for existing person with this name
    Person.findOne({ name: body.name })
        .then(existingPerson => {
            if (existingPerson) {
                // Instead of sending an error, we send a special response
                // that tells the frontend to show the confirmation dialog
                return response.status(409).json({
                    error: 'name already exists',
                    existingId: existingPerson.id,
                    message: 'Person already exists. Would you like to update their number?'
                })
            }

            // If no existing person, create new one
            const person = new Person({
                name: body.name,
                number: body.number
            })

            return person.save()
                .then(savedPerson => {
                    response.json(savedPerson)
                })
        })
        .catch(error => next(error))
})

// PUT person - Modified to use MongoDB
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    // Validate the update data
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing, both name and number are required'
        })
    }

    const person = {
        name: body.name,
        number: body.number
    }

    // Add { runValidators: true } to ensure updates follow schema validation
    Person.findByIdAndUpdate(
        request.params.id,
        person,
        { new: true, runValidators: true }
    )
        .then(updatedPerson => {
            if (updatedPerson) {
                response.json(updatedPerson)
            } else {
                // Handle case where ID wasn't found
                response.status(404).json({
                    error: 'person not found'
                })
            }
        })
        .catch(error => next(error))
})

// Handler for unknown endpoints
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// Error handling middleware
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({
            error: 'malformatted id'
        })
    } else if (error.name === 'ValidationError') {
        // Enhanced validation error handling
        return response.status(400).send({
            error: error.message,
            validationErrors: Object.values(error.errors).map(e => ({
                field: e.path,
                message: e.message
            }))
        })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
