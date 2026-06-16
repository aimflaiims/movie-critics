import React, { useEffect, useState, useRef } from "react";
import './App.css'
import SearchIcon from './search.svg'
import MovieCard from './MovieCard'
import { useCookies } from 'react-cookie';

const API_URL = "http://www.omdbapi.com?apikey=";
const App = () => {
    const moviesMock = [];
    const [cookies, setCookie] = useCookies(['user']);
    const [movies, setMovies] = useState(moviesMock);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [apiKey, setApiKey] = useState("");
    const debounceRef = useRef(null);

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
        if (moviesMock.length > 0) {
            data = moviesMock.filter((movie) =>
                new RegExp(title, 'i').test(movie.Title)
            );
        } else {
            const response = await fetch(`${API_URL}${key}&s=${title}`);
            const jsonData = await response.json();
            data = jsonData.Search;
        }
        setLoading(false);
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