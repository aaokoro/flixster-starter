import React from 'react';
import './App.css';
import MovieList from './MovieList';

const App = () => {
  return (
    <div className="App">
      <header>
      <h1>Flixter</h1>
      <form action="/search" method="get">
        <input
          type="text"
          placeholder="Search..."
          name="query"
          aria-label="Search"
        />
        <button type="submit">Search</button>
      </form>

      </header>
      <main>
        <MovieList/>
      </main>


    </div>
  );
};

export default App;
