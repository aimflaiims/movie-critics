import React, { useEffect, useState, useRef } from "react";
import './App.css'
import SearchIcon from './search.svg'
import MovieCard from './MovieCard'
import { useCookies } from 'react-cookie';

const API_URL = "https://www.omdbapi.com/?apikey=";
const MOCK_MOVIES = [
    {"Title":"The Imitation Game","Year":"2014","imdbID":"tt2084970","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BNjI3NjY1Mjg3MV5BMl5BanBnXkFtZTgwMzk5MDQ3MjE@._V1_SX300.jpg"},
    {"Title":"Imitation of Life","Year":"1959","imdbID":"tt0052918","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BZWY3MTYwMmQtMGIzNy00YmU3LTg3ODgtYzU3ZTdiZmZmZWMyXkEyXkFqcGc@._V1_SX300.jpg"},
    {"Title":"Imitation of Life","Year":"1934","imdbID":"tt0025301","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BMzEwYWY4OWMtMmFlZi00YTk4LWEwMWEtMzM0ODQ2ZDU5MDVjXkEyXkFqcGc@._V1_SX300.jpg"},
    {"Title":"Imitation","Year":"2021","imdbID":"tt14371376","Type":"series","Poster":"https://m.media-amazon.com/images/M/MV5BNTE5YTMxN2MtNzRkNC00OTQ1LWI4YWItNzlmNDlmYWZlOWRhXkEyXkFqcGc@._V1_SX300.jpg"},
    {"Title":"Imitation General","Year":"1958","imdbID":"tt0051767","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BYjcxNjBjYmYtMmY4ZC00ZWM5LThjMjItNTgyMjQxMGFiN2RjXkEyXkFqcGdeQXVyMTY5Nzc4MDY@._V1_SX300.jpg"},
    {"Title":"Imitation Girl","Year":"2017","imdbID":"tt5612564","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BMTc0Mjc3ODgyNF5BMl5BanBnXkFtZTgwNzg3MTA4NDM@._V1_SX300.jpg"},
    {"Title":"A Railroad Wreck (Imitation)","Year":"1900","imdbID":"tt0212460","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BNWU1NWQ4YTMtOWM3Mi00YzkyLWE1MzgtOGU4MzQyNjQ4M2U2XkEyXkFqcGc@._V1_SX300.jpg"},
    {"Title":"Imitation Woman","Year":"2005","imdbID":"tt7696006","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BN2VjOWY3ZjYtNDQyYi00ZDRlLWEzZmItNzI1MTk0NWFhYmE0XkEyXkFqcGdeQXVyOTIzNjA4ODE@._V1_SX300.jpg"},
    {"Title":"Imitation","Year":"2007","imdbID":"tt0470372","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BMTY1MDI4MzY0NV5BMl5BanBnXkFtZTcwMzk1MjQ0MQ@@._V1_SX300.jpg"},
    {"Title":"Imitation of Christ","Year":"1967","imdbID":"tt0207531","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BNDc3MzRiMTctMWJmMy00ZmZhLWI2ZjAtMDNjZjA1YmFjYmM1XkEyXkFqcGc@._V1_SX300.jpg"}
];

const App = () => {
    const moviesMock = MOCK_MOVIES;
    const [cookies, setCookie] = useCookies(['user']);
    const [movies, setMovies] = useState(moviesMock);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [apiKey, setApiKey] = useState("");
    const [isUsingMock, setIsUsingMock] = useState(false);
    const debounceRef = useRef(null);

    const filterMockMovies = (title) => {
        if (!title) {
            return moviesMock;
        }
        return moviesMock.filter((movie) =>
            new RegExp(title, 'i').test(movie.Title)
        );
    };

    console.log("App render");
    const searchMovie = async (title, key, currentApiKey = apiKey) => {
        console.log("key: ", key);
        
        if (!key || key === 'Enter' || key === 'click') {
            const data = await getMovie(title, currentApiKey);
            setMovies(data);
            if (key === 'click') {
                setSearch(title);
            }
            setSuggestions([]);
        }else {
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(async () => {
                const data = await getMovie(title, currentApiKey);
                setSuggestions(data);
            }, 2000);
        }
    }

    
    const getMovie = async (title, key = apiKey) => {
        setLoading(true);
        let data = [];
        try {
            if (!key) {
                throw new Error('API key is missing');
            }
            const response = await fetch(`${API_URL}${key}&s=${title}`);
            const jsonData = await response.json();
            if (jsonData.Response !== 'True' || !jsonData.Search) {
                throw new Error(jsonData.Error || 'OMDb API returned no results');
            }
            setIsUsingMock(false);
            data = jsonData.Search;
        } catch (error) {
            console.error('Movie fetch failed:', error);
            setIsUsingMock(true);
            data = filterMockMovies(title);
        } finally {
            setLoading(false);
        }
        return data?.length > 0 ? data : [];
    }

    useEffect(() => {
        let newApiKey = cookies.apiKey;
        setApiKey(newApiKey);
        searchMovie('', null, newApiKey);
    }, [])
    return (
        <div className="app">
            <h1>Movie Critic</h1>
            {isUsingMock && <p className="mock-notice">OMDb is unavailable. Working on mock data.</p>}
            <div className="api-key-section">
                <input 
                    value={apiKey}
                    type="text" 
                    placeholder="Enter OMDB API KEY" 
                    onChange={(e) => {
                        const newApiKey = e.target.value;
                        setApiKey(newApiKey);
                        setCookie('apiKey', newApiKey, { path: '/' });
                        searchMovie('', null, newApiKey);
                    }}
                    className="api-key-input"
                />
                <a target="_blank" rel="noreferrer" href="https://www.omdbapi.com/apikey.aspx" className="api-key-link">Get API Key</a>
            </div>
            <div className="search">
                <input 
                    value={search}
                    type="text" 
                    placeholder="Search movie" 
                    onChange={(e) => {setSearch(e.target.value)}}
                    onKeyUp={(e) => {
                        searchMovie(search, e.key);
                    }}
                />
                <img 
                    src={SearchIcon} alt="search"
                    onClick={() => {
                        if (!loading) {
                            searchMovie(search);
                        }
                    }}
                />
            </div>
            <div className="suggestions-container">
                <ul className="suggestions-list">
                    {suggestions.length > 0 ? suggestions.map((list) => {
                        return <li key={list.imdbID} onClick={(e) => {searchMovie(list.Title, e.type)}} className="suggestion-item">{list.Title}</li>
                    }) : <></>}
                </ul>
            </div>
            <div className="container">
                {movies.length > 0 ? 
                movies.map((movie) => {
                        return <MovieCard key={movie.imdbID} movie={movie} />
                    })
                    :
                    <h1>No Movie Found</h1>
                }
                
            </div>
        </div>
    )
}

export default App;