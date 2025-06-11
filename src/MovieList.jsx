import React, { useEffect, useState } from 'react';
import MovieCard from './MovieCard';

const MovieList = ({ openModal }) => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchNowPlaying = async (pageNumber) => {
    setLoading(true);
    try {
      const token = import.meta.env.VITE_READ_TOKEN;
      const url = `https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=${pageNumber}`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const response = await fetch(url, options);
      const data = await response.json();

      if (pageNumber === 1) {
        setMovies(data.results);
      } else {
        setMovies(prevMovies => [...prevMovies, ...data.results]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNowPlaying(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNowPlaying(nextPage);
  };

  return (
    <div>
      <div className="movie-list">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => openModal(movie)}
            className="movie-card-container"
          >
            <MovieCard
              title={movie.title}
              posterImg={movie.poster_path}
              voteAvg={movie.vote_average}
            />
          </div>
        ))}
      </div>
      <div className="load-more-container">
        <button onClick={handleLoadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More Movies'}
        </button>
      </div>
    </div>
  );
};

export default MovieList;
