
import React from 'react';
const MovieCard = ({ title, posterImg, voteAvg }) => {
  return (
    <div className="movie-card">
      <img 
        src={`https://image.tmdb.org/t/p/w500${posterImg}`} 
        alt={`Poster of ${title}`} 
        className="movie-poster"
      />
      <h3>{title}</h3>
      <p>🎬 {voteAvg}</p>
    </div>
  );
};

export default MovieCard;