import React from "react";

const MovieCard = ({movie}) => {
    return(
        <div className="movie">  
            <div>
                <p>{movie.Year}</p>
            </div>
            <div>
                <img 
                    src={movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.co/400x600'} 
                    alt={movie.Title} 
                />
            </div>
            <div>
                <h3>{movie.Type}</h3>
                <p>{movie.Title}</p>
            </div>
        </div>
    )
}

export default MovieCard;