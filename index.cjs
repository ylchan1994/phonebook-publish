const express = require('express')
const app = express()
const morgan = require('morgan')

let persons = JSON.parse(`[
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]`)

app.use(express.json())

morgan.token('body', (req) => {
  const body = req.body
  return body ? JSON.stringify(body) : '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response) => {
  response.json(persons)
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

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const found = persons.find(person => person.id == id)
  console.log(found)
  if (!found) {
    console.log('return 404 here')
    response.status(404).end()
    return
  }

  response.send(found)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id != id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
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

  persons.push({...body, id: Math.round(Math.random()*2000000000)})

  response.status(200).json(persons)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
