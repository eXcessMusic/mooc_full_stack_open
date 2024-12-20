const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose
    .connect(url)

    .then((result) => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true, },
    number: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // This regex pattern breaks down as follows:
                // ^             Start of string
                // (\\d{2,3})   2 or 3 digits
                // -            A hyphen
                // (\\d+)       One or more digits
                // $            End of string
                return /^\d{2,3}-\d+$/.test(v) && v.length >= 8
            },
            message: props => `${props.value} is not a valid phone number! Phone number must be at least 8 digits long and in format XX-XXXXXX or XXX-XXXXX`
        }
    },
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    },
})

module.exports = mongoose.model('Person', personSchema)