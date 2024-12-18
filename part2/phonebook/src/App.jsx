import { useState, useEffect } from 'react'
import axios from 'axios'
import Persons from './components/Persons'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Notification from './components/Notification'
import personService from './services/personService'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [number, setNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (persons.find((person) => person.name === newName)) {
      const updateUser = confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)
      if (updateUser) {
        const person = persons.find((person) => person.name === newName)
        const updatedPerson = { ...person, number: number }
        personService
          .update(person.id, updatedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(person => person.id !== returnedPerson.id ? person : returnedPerson))
            setNewName('')
            setNumber('')
          })
      }
    } else {
      const personObject = {
        name: newName,
        number: number,
      }
      
      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNumber('')
        })
        .catch(error => {
          setErrorMessage(error.response.data.error)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
      
      setErrorMessage(`Added ${personObject.name} successfully!`)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleDelete = (id, name) => {
    // It's good practice to ask for confirmation before deleting
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .deleteEntry(id)
        .then(() => {
          // After successful deletion, update our local state
          // by filtering out the deleted person
          setPersons(persons.filter(person => person.id !== id))
          setErrorMessage(`Deleted ${name} successfully!`)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
        .catch(error => {
          // Good practice to handle potential errors
          setErrorMessage(
            `Information of '${name}' has already been removed from server`
          )
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
    }
  }

  const filteredPersons = persons.filter(person => 
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={errorMessage} />
      <Filter 
        filter={filter}
        setFilter={setFilter}
      />
      <h2>add a new</h2>
      <PersonForm 
        newName={newName}
        setNewName={setNewName}
        number={number}
        setNumber={setNumber}
        handleSubmit={handleSubmit}
      />
      <h2>Numbers</h2>
      <Persons 
        persons={filteredPersons} 
        onDelete={handleDelete}
        />
    </div>
  )
}

export default App