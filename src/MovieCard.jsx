
import React, { useState } from 'react';

const MovieCard = ({ title, posterImg, voteAvg }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const toggleWatched = (e) => {
    e.stopPropagation();
    setIsWatched(!isWatched);
  };

  return (
    <div className="movie-card">
      <div className="movie-card-actions">
        <button
          className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>

        <button
          className={`watched-btn ${isWatched ? 'watched' : ''}`}
          onClick={toggleWatched}
          aria-label={isWatched ? "Mark as unwatched" : "Mark as watched"}
        >
          {isWatched ? '✓' : '○'}
        </button>
      </div>

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
