const mongoose = require('mongoose')

const url = process.env.MONGO_URI

mongoose.set('strictQuery', false)

mongoose.connect(url, { family: 4 })
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const validateNumber = (number) => {
  console.log(number, typeof number)
  const format = /\d{2,3}-\d{5,}/g
  const matchFormat = number.match(format)
  const matchLength = number.length >= 8
  console.log(matchFormat, matchLength);
  return matchFormat && matchLength
}
  
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: validateNumber
  },
})

const Person = mongoose.model('Person', personSchema)

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)