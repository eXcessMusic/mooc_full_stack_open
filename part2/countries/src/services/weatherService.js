import axios from 'axios'

const baseUrl = 'http://api.weatherapi.com/v1/current.json'
const apiKey = import.meta.env.VITE_WEATHER_API_KEY

const getWeather = (country) => {
    const request = axios.get(`${baseUrl}?key=${apiKey}&q=${country}`)
    return request.then(response => response.data)
}

export default { getWeather }