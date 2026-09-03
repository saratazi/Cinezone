const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const priorityInput = document.getElementById("priority");

const totalEl = document.getElementById("total");
const activeEl = document.getElementById("active");
const completedEl = document.getElementById("completed");
const dateEl = document.getElementById("date"); // API configuration
const API_KEY = "e3e67a17db844b4735380b87e232a8cd";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";


// DOM Elements
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const searchResultsContainer = document.getElementById("search-results");
const favoritesContainer = document.getElementById("favorites");
const searchViewBtn = document.getElementById("search-view-btn");
const favoritesViewBtn = document.getElementById("favorites-view-btn");

// State
const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Event Listeners
searchButton.addEventListener("click", searchMovies);
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchMovies();
    }
});

searchViewBtn.addEventListener("click", () => {
    searchViewBtn.classList.add("active");
    favoritesViewBtn.classList.remove("active");
    searchResultsContainer.classList.add("active");
    favoritesContainer.classList.remove("active");
});

favoritesViewBtn.addEventListener("click", () => {
    favoritesViewBtn.classList.add("active");
    searchViewBtn.classList.remove("active");
    favoritesContainer.classList.add("active");
    searchResultsContainer.classList.remove("active");
    displayFavorites();
});

// Functions
async function searchMovies() {
    const searchTerm = searchInput.value.trim();

    if (searchTerm === "") {
        return;
    }

    try {
        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${searchTerm}`
        );
        const data = await response.json();

        displayMovies(data.results, searchResultsContainer);
    } catch (error) {
        console.error("Error searching movies:", error);
        searchResultsContainer.innerHTML =
            '<div class="no-results">An error occurred. Please try again.</div>';
    }
}

function displayMovies(movies, container) {
    container.innerHTML = "";

    if (movies.length === 0) {
        container.innerHTML = '<div class="no-results">No movies found</div>';
        return;
    }

    movies.forEach((movie) => {
        const isFavorite = favorites.some((fav) => fav.id === movie.id);

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");

        const posterPath = movie.poster_path ?
            `${IMAGE_BASE_URL}${movie.poster_path}` :
            "https://via.placeholder.com/500x750?text=No+Image+Available";

        movieCard.innerHTML = `
            <img class="movie-poster" src="${posterPath}" alt="${movie.title}">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-release">${
                  movie.release_date
                    ? new Date(movie.release_date).getFullYear()
                    : "N/A"
                }</div>
                <button class="favorite-btn ${
                  isFavorite ? "active" : ""
                }" data-id="${movie.id}">
                    <i class="${
                      isFavorite ? "fas fa-heart" : "far fa-heart"
                    }"></i>
                </button>
            </div>
        `;

        container.appendChild(movieCard);

        // Add event listener to favorite button
        const favoriteBtn = movieCard.querySelector(".favorite-btn");
        favoriteBtn.addEventListener("click", () =>
            toggleFavorite(movie, favoriteBtn)
        );
    });
}

function toggleFavorite(movie, button) {
    const index = favorites.findIndex((fav) => fav.id === movie.id);

    if (index === -1) {
        // Add to favorites
        favorites.push(movie);
        button.classList.add("active");
        button.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
        button.classList.remove("active");
        button.innerHTML = '<i class="far fa-heart"></i>';

        // If we're in favorites view, remove the card
        if (favoritesContainer.classList.contains("active")) {
            button.closest(".movie-card").remove();

            if (favorites.length === 0) {
                favoritesContainer.innerHTML =
                    '<div class="no-results">No favorite movies yet</div>';
            }
        }
    }

    // Save to localStorage
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function displayFavorites() {
    if (favorites.length === 0) {
        favoritesContainer.innerHTML =
            '<div class="no-results">No favorite movies yet</div>';
        return;
    }

    displayMovies(favorites, favoritesContainer);
}

// Initialize the app
searchViewBtn.click(); // Start with search view active

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const allBtn = document.getElementById("allBtn");
const activeBtn = document.getElementById("activeBtn");
const completedBtn = document.getElementById("completedBtn");

let tasks = JSON.parse(localStorage.getItem("modernTasks")) || [];
let currentFilter = "all";

dateEl.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
});

if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
}

function toggleTheme() {
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }
}

function addTask() {
    const text = taskInput.value.trim();

    if (text === "") {
        alert("Write a task first!");
        return;
    }

    tasks.push({
        text: text,
        priority: priorityInput.value,
        done: false
    });

    taskInput.value = "";

    saveTasks();
    displayTasks();
}

function displayTasks() {
    taskList.innerHTML = "";

    let filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") return !task.done;
        if (currentFilter === "completed") return task.done;
        return true;
    });

    filteredTasks.forEach((task) => {
        let realIndex = tasks.indexOf(task);

        let li = document.createElement("li");

        if (task.done) {
            li.classList.add("done");
        }

        li.innerHTML = `
            <div class="task-left">
                <div class="check" onclick="toggleTask(${realIndex})"></div>

                <div>
                    <div class="task-text">${task.text}</div>
                    <div class="priority ${task.priority}">${task.priority}</div>
                </div>
            </div>

            <div class="actions">
                <button onclick="editTask(${realIndex})">✎</button>
                <button onclick="deleteTask(${realIndex})">🗑</button>
            </div>
        `;

        taskList.appendChild(li);
    });

    updateStats();
}

function toggleTask(index) {
    tasks[index].done = !tasks[index].done;
    saveTasks();
    displayTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    displayTasks();
}

function editTask(index) {
    let newText = prompt("Edit your task:", tasks[index].text);

    if (newText !== null && newText.trim() !== "") {
        tasks[index].text = newText.trim();
        saveTasks();
        displayTasks();
    }
}

function clearAll() {
    if (confirm("Delete all tasks?")) {
        tasks = [];
        saveTasks();
        displayTasks();
    }
}

function setFilter(filter) {
    currentFilter = filter;

    allBtn.classList.remove("active");
    activeBtn.classList.remove("active");
    completedBtn.classList.remove("active");

    if (filter === "all") allBtn.classList.add("active");
    if (filter === "active") activeBtn.classList.add("active");
    if (filter === "completed") completedBtn.classList.add("active");

    displayTasks();
}

function updateStats() {
    let total = tasks.length;
    let completed = tasks.filter(task => task.done).length;
    let active = total - completed;

    totalEl.textContent = total;
    activeEl.textContent = active;
    completedEl.textContent = completed;

    let percent = 0;

    if (total > 0) {
        percent = Math.round((completed / total) * 100);
    }

    progressFill.style.width = percent + "%";
    progressText.textContent = percent + "%";
}

function saveTasks() {
    localStorage.setItem("modernTasks", JSON.stringify(tasks));
}

taskInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addTask();
    }
});

const darkModeBtn = document.getElementById("dark-mode-btn");

darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        darkModeBtn.textContent = "☀️ Light Mode";
    } else {
        darkModeBtn.textContent = "🌙 Dark Mode";
    }
});
const phoneForm = document.getElementById("phone-form");
const phoneInput = document.getElementById("phone-input");
const phoneMessage = document.getElementById("phone-message");

phoneForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const phoneNumber = phoneInput.value.trim();

    if (phoneNumber) {
        phoneMessage.textContent = "Thank you! Your phone number has been saved.";
        phoneInput.value = "";
    }
});
