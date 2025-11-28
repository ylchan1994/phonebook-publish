const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const [_metohd, _file, _password, name, number, ...rest] = process.argv

const url = process.env.MONGO_URI

mongoose.set('strictQuery', false)

mongoose.connect(url, { family: 4 })
  
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const savePerson = (toSave) => {
  const person = new Person(toSave)

  person.save().then(result => {
    console.log(`added ${person.name} number ${person.number} to phoneboook`)
    mongoose.connection.close()
  })
}

const getAllPersons = () => {
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(note => {
      console.log(note)
    })
    mongoose.connection.close()
  })
}


if (name && number) {
  savePerson({ name, number })
} else {
  getAllPersons()
}


