require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const Person = require('./models/person.cjs')

app.use(express.json())
app.use(express.static('dist'))

let persons = []

Person.find({}).then(result => {
  persons = result
})
  .catch(error => console.log(error))

morgan.token('body', (req) => {
  const body = req.body
  return body ? JSON.stringify(body) : '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(result => {
    persons = result
    response.json(result)
  })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  const count = persons.length
  const currentTimestamp = (new Date()).toString()
  const responseBody = `
  <p>Phonebook has info for ${count} people<p>
  <p>${currentTimestamp}</p>
  `
  response.send(responseBody)
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then(found => {
      if (!found) {
        response.status(404).end()
        return
      }
      response.json(found)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then(result => {
      persons = persons.filter(person => person.id != id)
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const requestName = body.name
  const found = persons.find(person => person.name.toLowerCase() === requestName.toLowerCase())
  if (!body.name || !body.number) {
    response.status(400).json({
      error: 'Missing name or number'
    })
    return
  }
  if (found) {
    response.status(400).json({
      error: 'name must be unique'
    })
    return
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(successSave => {
    persons.push(person)
    response.status(200).json(persons)
  })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  const id = request.params.id

  Person.findById(id)
    .then(found => {
      if (!found) return response.status(404).end()

      found.name = name
      found.number = number

      found.save().then(updatedPerson => {
        persons = persons.map(person => person.id == id ? found : person)
        response.json(updatedPerson).end()
      })
      .catch(error => next(error))

    })
    .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)