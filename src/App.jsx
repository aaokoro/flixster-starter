import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import MovieList from './MovieList';
import MovieCard from './MovieCard';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="modal-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>,
    document.body
  );
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('now-playing');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const token = import.meta.env.VITE_READ_TOKEN;
        const url = 'https://api.themoviedb.org/3/genre/movie/list?language=en';

        const response = await fetch(url, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();
        setGenres(data.genres || []);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setActiveTab('search');
    try {
      const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchTerm)}&language=en-US&page=1`;
      const token = import.meta.env.VITE_READ_TOKEN;

      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const response = await fetch(url, options);
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error("Error searching movies:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const switchToNowPlaying = () => {
    setActiveTab('now-playing');
  };

  const openModal = async (movie) => {
    setSelectedMovie(movie); 
    setModalOpen(true);

    try {
      const token = import.meta.env.VITE_READ_TOKEN;
      const detailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?language=en-US`;
      const videosUrl = `https://api.themoviedb.org/3/movie/${movie.id}/videos?language=en-US`;

      const options = {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const [detailsResponse, videosResponse] = await Promise.all([
        fetch(detailsUrl, options),
        fetch(videosUrl, options)
      ]);

      const detailedMovie = await detailsResponse.json();
      const videosData = await videosResponse.json();

      const trailers = videosData.results.filter(
        video => video.site === "YouTube" &&
                (video.type === "Trailer" || video.type === "Teaser")
      );

      const sortedTrailers = trailers.sort((a, b) => {
        if (a.official && !b.official) return -1;
        if (!a.official && b.official) return 1;
        if (a.type === "Trailer" && b.type === "Teaser") return -1;
        if (a.type === "Teaser" && b.type === "Trailer") return 1;
        return 0;
      });

      setSelectedMovie({
        ...detailedMovie,
        trailer: sortedTrailers.length > 0 ? sortedTrailers[0] : null
      });
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const sortMovies = (moviesToSort) => {
    if (!moviesToSort || sortBy === 'default') return moviesToSort;

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

  const renderMovieCards = (movies) => {
    const filteredMovies = filterMoviesByGenre(movies);
    const sortedMovies = sortMovies(filteredMovies);

    return sortedMovies.map((movie) => (
      <div key={movie.id} onClick={() => openModal(movie)} className="movie-card-container">
        <MovieCard
          title={movie.title}
          posterImg={movie.poster_path}
          voteAvg={movie.vote_average}
        />
      </div>
    ));
  };

  return (
    <div className="App">
      <header>
        <div className="header-top">
          <h1>Flixter</h1>
        </div>

        <div className="header-controls">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search"
              className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
            <button
              type="button"
              className="clear-button"
              onClick={() => {
                setSearchTerm('');
                if (activeTab === 'search') {
                  switchToNowPlaying();
                }
              }}
            >
              Clear
            </button>
          </form>

          <div className="header-controls-row">
            <div className="header-sort">
              <select
                id="header-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="default">Sort: Default</option>
                <option value="title">Sort: Title (A-Z)</option>
                <option value="date">Sort: Date (newest)</option>
                <option value="rating">Sort: Rating (highest)</option>
              </select>
            </div>

            <div className="header-filter">
              <select
                id="genre-filter"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="filter-select"
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="tab-navigation">
        <button
          className={`tab-button active`}
          onClick={switchToNowPlaying}
        >
          Now Playing
        </button>
      </div>

      <main>
        {loading && <div className="loading">Searching for movies...</div>}

        {!loading && activeTab === 'search' && searchResults && (
          <>
            {searchResults.length > 0 ? (
              <div className="movie-list">
                {renderMovieCards(searchResults)}
              </div>
            ) : (
              <div className="no-results">
                No movies found matching "{searchTerm}"
              </div>
            )}
          </>
        )}

        {!loading && activeTab === 'now-playing' && <MovieList openModal={openModal} sortBy={sortBy} selectedGenre={selectedGenre} />}

        <Modal isOpen={modalOpen} onClose={closeModal}>
          {selectedMovie && (
            <div className="movie-details">
              <h2>{selectedMovie.title}</h2>

              {selectedMovie.trailer && (
                <div className="movie-trailer-container">
                  <h3>Trailer</h3>
                  <div className="movie-trailer">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedMovie.trailer.key}`}
                      title={`${selectedMovie.title} Trailer`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="youtube-embed"
                    ></iframe>
                  </div>
                </div>
              )}

              <div className="modal-content-grid">
                <img
                  src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                  alt={`Poster of ${selectedMovie.title}`}
                  className="modal-poster"
                />
                <div className="modal-info">
                  <p><strong>Release Date:</strong> {selectedMovie.release_date}</p>
                  {selectedMovie.runtime && (
                    <p><strong>Runtime:</strong> {selectedMovie.runtime} minutes</p>
                  )}
                  <p><strong>Rating:</strong> {selectedMovie.vote_average?.toFixed(1)} / 10</p>
                  {selectedMovie.genres && (
                    <p><strong>Genres:</strong> {selectedMovie.genres.map(g => g.name).join(', ')}</p>
                  )}
                  <p><strong>Overview:</strong> {selectedMovie.overview}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </main>

      <footer className="app-footer">
        <div className="footer-content centered">
          <h2 className="footer-title">Flixster</h2>
          <p className="footer-subtitle"> We Only Have The Best Of The Best</p>
          <p className="footer-attribution">data from <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">TMDB</a></p>
        </div>
      </footer>
    </div>
  );
};

export default App;
