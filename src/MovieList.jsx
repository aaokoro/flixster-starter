import React, { useEffect, useState } from 'react';
import MovieCard from './MovieCard';

const MovieList = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const apiKey = import.meta.env.VITE_API_KEY;

        const response = await fetch(
          `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`
        );

        const data = await response.json();
        setMovies(data.results);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchNowPlaying();
  }, []);

  return (
    <div className="movie-list">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          title={movie.title}
          posterImg={movie.poster_path}  // rename to posterImg
          voteAvg={movie.vote_average}   // rename to voteAvg
        />
      ))}
    </div>
  );
};

export default MovieList;
