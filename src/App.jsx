import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('now-playing'); // 'now-playing' or 'search'
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setActiveTab('search'); // Switch to search tab when search is performed

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

  const switchToSearch = () => {
    setActiveTab('search');
    // Only perform search if there's a search term
    if (searchTerm.trim() && !searchResults) {
      handleSearch({ preventDefault: () => {} });
    }
  };

  const openModal = async (movie) => {
    setSelectedMovie(movie); // Set initial data
    setModalOpen(true);

    try {
      const token = import.meta.env.VITE_READ_TOKEN;
      const url = `https://api.themoviedb.org/3/movie/${movie.id}?language=en-US`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const response = await fetch(url, options);
      const detailedMovie = await response.json();
      setSelectedMovie(detailedMovie); // Update with complete data
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Function to render movie cards with click handler
  const renderMovieCards = (movies) => {
    return movies.map((movie) => (
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
        <h1>Flixter</h1>
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
        </form>
      </header>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'now-playing' ? 'active' : ''}`}
          onClick={switchToNowPlaying}
        >
          Now Playing
        </button>
        <button
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={switchToSearch}
        >
          Search
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

        {!loading && activeTab === 'now-playing' && <MovieList openModal={openModal} />}

        <Modal isOpen={modalOpen} onClose={closeModal}>
          {selectedMovie && (
            <div className="movie-details">
              <h2>{selectedMovie.title}</h2>
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
    </div>
  );
};

export default App;
