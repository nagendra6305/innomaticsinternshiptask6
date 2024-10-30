const movieSearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');
const debouncedFindMovies = debounce(findMovies, 300);



async function loadMovies(searchTerm){
    const URL = `https://omdbapi.com/?s=${searchTerm}&page=1&apikey=fc1fef96`;
    const res = await fetch(`${URL}`);
    const data = await res.json();
    if(data.Response == "True") displayMovieList(data.Search);
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

function findMovies(){
    let searchTerm = (movieSearchBox.value).trim();
    if(searchTerm.length > 0){
        searchList.classList.remove('hide-search-list');
        loadMovies(searchTerm);
    } else {
        searchList.classList.add('hide-search-list');
    }
}
movieSearchBox.addEventListener('input', debouncedFindMovies);


function displayMovieList(movies){
    searchList.innerHTML = "";
    for(let idx = 0; idx < movies.length; idx++){
        let movieListItem = document.createElement('div');
        movieListItem.dataset.id = movies[idx].imdbID; 
        movieListItem.classList.add('search-list-item');
        if(movies[idx].Poster != "N/A")
            moviePoster = movies[idx].Poster;
        else 
            moviePoster = "image_not_found.png";

        movieListItem.innerHTML = `
        <div class = "search-item-thumbnail">
            <img src = "${moviePoster}">
        </div>
        <div class = "search-item-info">
            <h3>${movies[idx].Title}</h3>
            <p>${movies[idx].Year}</p>
        </div>
        `;
        searchList.appendChild(movieListItem);
    }
    loadMovieDetails();
}

function loadMovieDetails(){
    const searchListMovies = searchList.querySelectorAll('.search-list-item');
    searchListMovies.forEach(movie => {
        movie.addEventListener('click', async () => {
            searchList.classList.add('hide-search-list');
            movieSearchBox.value = "";
            const result = await fetch(`https://www.omdbapi.com/?i=${movie.dataset.id}&apikey=fc1fef96`);
            const movieDetails = await result.json();
            // console.log(movieDetails);
            displayMovieDetails(movieDetails);
        });
    });
}

function displayMovieDetails(details) {
    resultGrid.innerHTML = `
        <div class="movie-poster">
            <img src="${(details.Poster !== "N/A") ? details.Poster : "image_not_found.png"}" alt="${details.Title} Poster">
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${details.Title}</h3>
            <ul class="movie-misc-info">
                <li class="year"><b>Year : </b>${details.Year}</li>
                <li class="rated"><b>Ratings : </b>${details.Rated}</li>
                <li class="released"><b>Released :</b> ${details.Released}</li>
            </ul>
            <p class="genre"><b>Genre : </b> ${details.Genre}</p>
            <p class="writer"><b>Writer : </b> ${details.Writer}</p>
            <p class="actors"><b>Actors : </b> ${details.Actors}</p>
            <p class="plot"><b>Plot : </b> ${details.Plot}</p>
            <p class="language"><b>Language : </b>${details.Language}</p>
            <p class="awards"><b>Awards : </b>${details.Awards}</p>
           <br>
          <button id="play-trailer-btn">Play Trailer</button>

        </div>
    `;

    // Add event listener to the trailer button
    const playTrailerBtn = document.getElementById('play-trailer-btn');
    playTrailerBtn.addEventListener('click', () => {
        // Call function to load and play trailer
        loadAndPlayTrailer(details.Title);
    });
}

async function loadAndPlayTrailer(movieTitle) {
    // Construct the search URL for the trailer
    const searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${movieTitle} official trailer&type=video&key=AIzaSyDZDCxcrB1ZpQlk1UQyjq7m-jBOgv5lpQk`;

    try {
        // Fetch the search results
        const response = await fetch(searchURL);
        const data = await response.json();

        // Extract the video ID of the first search result (assuming it's the trailer)
        const videoId = data.items[0].id.videoId;

        // Embed the trailer using an iframe
        const trailerContainer = document.getElementById('trailer-container');
        window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
        //trailerContainer.innerHTML = `
           // <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen target="_blank" ></iframe>
        //`;

    } catch (error) {
        console.error('Error fetching and playing trailer:', error);
    }
}


window.addEventListener('click', (event) => {
    if(event.target.className != "form-control"){
        searchList.classList.add('hide-search-list');
    }
});