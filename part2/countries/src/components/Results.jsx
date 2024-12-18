const Results = ({ countries, handleSearch, weather }) => {
    if (countries.length > 10) {
        return (
            <div>
                Too many matches, specify another filter
            </div>
        )
    } else if (countries.length > 1) {
        return (
            <div>
                <ul>
                    {countries.map(country => 
                    <li key={country.name.common}>
                        {country.name.common}
                        <button onClick={() => handleSearch(country.name.common)}>show</button>
                    </li>)}
                </ul>
            </div>
        )
    } else if (countries.length === 1) {
        return (
            <div>
                <h1>{countries[0].name.common}</h1>
                <div>capital {countries[0].capital}</div>
                <div>area {countries[0].area}</div>
                <h2>languages</h2>
                <ul>
                    {Object.values(countries[0].languages).map((language) => (
                        <li key={language}>{language}</li>
                    ))}
                </ul>
                <img src={countries[0].flags.png} alt={countries[0].name.common} width={200} />
                {weather ? (  // Only show weather if we have data
                <>
                    <h2>Weather in {countries[0].capital}</h2>
                    <p>temperature {weather.current.temp_c} °C</p>
                    <p>wind {weather.current.wind_kph} km/h</p>
                    <img 
                    src={weather.current.condition.icon} 
                    alt={weather.current.condition.text} 
                    />
                </>
        ) : (
            <p>Loading weather data...</p>
        )}
            </div>
        )
    }
}

export default Results;