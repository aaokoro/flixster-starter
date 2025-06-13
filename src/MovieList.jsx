import React, { useEffect, useState } from 'react';
import MovieCard from './MovieCard';

const MovieList = ({ openModal, sortBy = 'default', selectedGenre = '' }) => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

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
    if (movies.length > displayCount) {
      setDisplayCount(prevCount => prevCount + 20);
    } else {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNowPlaying(nextPage);
      setDisplayCount(prevCount => prevCount + 20);
    }
  };

  const sortMovies = (moviesToSort) => {
    if (sortBy === 'default') return moviesToSort;

    return [...moviesToSort].sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'date') {
        return new Date(b.release_date) - new Date(a.release_date);
      } else if (sortBy === 'rating') {
        return b.vote_average - a.vote_average;
      }
      return 0;
    });
  };

  const filterMoviesByGenre = (moviesToFilter) => {
    if (!selectedGenre) return moviesToFilter;

    return moviesToFilter.filter(movie =>
      movie.genre_ids && movie.genre_ids.includes(Number(selectedGenre))
    );
  };

  const sortedMovies = sortMovies(movies);
  const filteredMovies = filterMoviesByGenre(sortedMovies);
  const moviesToDisplay = filteredMovies.slice(0, displayCount);

  return (
    <div>
      <div className="movie-list">
        {moviesToDisplay.map((movie) => (
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
