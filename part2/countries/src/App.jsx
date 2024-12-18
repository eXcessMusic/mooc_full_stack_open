import { useState, useEffect } from 'react'
import countriesService from './services/countriesService'
import weatherService from './services/weatherService'
import Results from './components/Results'
import './App.css'

const App = () => {
  const [countries, setCountries] = useState([]) // All countries from API
  const [search, setSearch] = useState('') // Search term
  const [weather, setWeather] = useState(null)  // Add this state for weather data

  // Filter countries based on search term
  const filteredCountries = countries.filter(country =>
    country.name.common.toLowerCase().includes(search.toLowerCase())
  )

  // Add state to keep track of which country's weather we last fetched
  const [lastFetchedCapital, setLastFetchedCapital] = useState(null)

  // When the filtered countries changes to exactly one country,
  // fetch its weather data
  useEffect(() => {
    if (filteredCountries.length === 1) {
      const capital = filteredCountries[0].capital[0] // Get the first capital city
      
      // Only fetch if we haven't fetched this capital's weather yet
      if (capital !== lastFetchedCapital) {
        setLastFetchedCapital(capital)
        weatherService
          .getWeather(capital)
          .then(weatherData => {
            setWeather(weatherData)
          })
          .catch(error => {
            console.error('Error fetching weather:', error)
            setWeather(null)
          })
      }
    } else {
      setWeather(null)
      setLastFetchedCapital(null)
    }
  }, [filteredCountries, lastFetchedCapital])

  const handleSearch = (value) => {
    setSearch(value)
  }

  // 5. Finally, our initial data fetching effect
  useEffect(() => {
    countriesService
      .getAll()
      .then(initialCountries => {
        setCountries(initialCountries)
      })
  }, [])

  return (
    <div>
      <p>find countries</p>
      <input value={search} onChange={(event) => setSearch(event.target.value)} />
      <Results 
        countries={filteredCountries} 
        handleSearch={handleSearch}
        weather={weather}  // Pass weather data instead of getWeather function
      />
    </div>
  )
}

export default App
