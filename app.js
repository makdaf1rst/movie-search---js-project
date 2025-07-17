document.addEventListener("DOMContentLoaded", function() {
  const movieContainer = document.querySelector(".movies");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  function showSkeletons(count = 6) {
    const skeletonHTML = `
      <div class="movie">
        <div class="skeleton-img skeleton"></div>
        <div class="movie__info">
          <div class="skeleton" style="width: 60%; height: 24px;"></div>
          <div class="skeleton" style="width: 40%; height: 18px;"></div>
          <div class="skeleton" style="width: 50%; height: 18px;"></div>
        </div>
      </div>
    `;
    movieContainer.innerHTML = Array(count).fill(skeletonHTML).join('');
  }

  async function fetchAndDisplayMovies(title, showSkeleton = true) {
    if (showSkeleton) showSkeletons(6);

    const response = await fetch(`https://www.omdbapi.com/?apikey=510b0b0c&s=${encodeURIComponent(title)}`);
    const data = await response.json();

    if (data.Response === "False" || !data.Search) {
      movieContainer.innerHTML = `<p>No movies found.</p>`;
      return;
    }

    // Get up to 6 movies
    const movies = data.Search.slice(0, 6);

    // Fetch full details for each movie to get Genre and imdbRating
    const movieDetails = await Promise.all(
      movies.map(async (movie) => {
        const res = await fetch(`https://www.omdbapi.com/?apikey=510b0b0c&i=${movie.imdbID}`);
        return await res.json();
      })
    );

    movieContainer.innerHTML = movieDetails.map(movie => {
      // Star rating logic (optional, from previous answer)
      const rating = parseFloat(movie.imdbRating) || 0;
      const stars = rating / 2;
      const fullStars = Math.floor(stars);
      const halfStar = stars - fullStars >= 0.5;
      const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

      let starHtml = '';
      for (let i = 0; i < fullStars; i++) starHtml += '<i class="fa-solid fa-star"></i>';
      if (halfStar) starHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
      for (let i = 0; i < emptyStars; i++) starHtml += '<i class="fa-regular fa-star"></i>';

      return `
        <div class="movie">
          <figure class="movie__img--wrapper">
            <img class="movie__poster" src="${movie.Poster}" alt="${movie.Title}">
          </figure>
          <div class="movie__info">
            <div class="movie__title">${movie.Title}</div>
            <div class="movie__ratings">${starHtml}</div>
            <div class="year">${movie.Year}</div>
            <div class="genre">${movie.Genre}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Show default movies on page load (no skeleton)
  fetchAndDisplayMovies("Avengers", false);

  // Show skeleton only when searching
  searchBtn.addEventListener("click", () => {
    const title = searchInput.value.trim();
    if (title) {
      fetchAndDisplayMovies(title, true);
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchBtn.click();
    }
  });
});
