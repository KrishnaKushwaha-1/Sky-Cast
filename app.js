/*======================================================
                    SKYCAST WEATHER APP
========================================================*/


/*======================================================
                    OPENWEATHER API
========================================================*/

const API_KEY = "b53c86bf9fc96db0b0cb52a21c651e01";

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";


/*======================================================
                    DOM ELEMENTS
========================================================*/

// Search

const cityInput = document.querySelector("#cityInput");
const searchBtn = document.querySelector("#searchBtn");
const locationBtn = document.querySelector("#locationBtn");

// Weather Card

const cityName = document.querySelector("#cityName");
const currentDate = document.querySelector("#currentDate");
const temperature = document.querySelector("#temperature");
const condition = document.querySelector("#condition");
const feelsLike = document.querySelector("#feelsLike");
const weatherIcon = document.querySelector("#weatherIcon");

// Highlights

const humidity = document.querySelector("#humidity");
const wind = document.querySelector("#wind");
const pressure = document.querySelector("#pressure");
const visibility = document.querySelector("#visibility");
const uvIndex = document.querySelector("#uvIndex");
const sunrise = document.querySelector("#sunrise");
const sunset = document.querySelector("#sunset");

// Recent Search

const recentSearches =
document.querySelector("#recentSearches");

// Error

const errorBox =
document.querySelector("#errorBox");

// Loader

const loader =
document.querySelector("#loader");

// Theme

const themeBtn =
document.querySelector("#themeBtn");







/*======================================================
                    LOADER
========================================================*/

function showLoader(){

    loader.classList.remove("hidden");

}

function hideLoader(){

    loader.classList.add("hidden");

}


/*======================================================
                    ERROR
========================================================*/

function showError(message){

    errorBox.classList.remove("hidden");

    errorBox.querySelector("p").textContent = message;

}

function hideError(){

    errorBox.classList.add("hidden");

}


/*======================================================
                    DATE
========================================================*/

function getCurrentDate(){

    const options={

        weekday:"long",

        day:"numeric",

        month:"long",

        year:"numeric"

    };

    return new Date().toLocaleDateString(
        "en-IN",
        options
    );

}


/*======================================================
                FORMAT TIME
========================================================*/

function formatTime(unix){

    return new Date(unix*1000)
    .toLocaleTimeString("en-IN",{

        hour:"2-digit",

        minute:"2-digit"

    });

}


/*======================================================
                WEATHER ICON
========================================================*/

function updateWeatherIcon(icon){

    weatherIcon.src=
    `https://openweathermap.org/img/wn/${icon}@4x.png`;

}


/*======================================================
                TEMPERATURE
========================================================*/

function roundTemp(temp){

    return Math.round(temp);

}




/*======================================================
                FETCH WEATHER BY CITY
========================================================*/

async function getWeather(city){

    try{

        showLoader();

        hideError();

        const response = await fetch(

            `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`

        );

        if(!response.ok){

            throw new Error("City not found");

        }

        const data = await response.json();

        updateUI(data);

        saveRecentSearch(city);

    }

    catch(error){

        console.error(error);

        showError(error.message);

    }

    finally{

        hideLoader();

    }

}






/*======================================================
                UPDATE USER INTERFACE
========================================================*/

function updateUI(data){

    cityName.textContent =
        `${data.name}, ${data.sys.country}`;

    currentDate.textContent =
        getCurrentDate();

    temperature.textContent =
        `${roundTemp(data.main.temp)}°C`;

    condition.textContent =
        data.weather[0].description;

    feelsLike.textContent =
        `Feels Like ${roundTemp(data.main.feels_like)}°C`;

    humidity.textContent =
        `${data.main.humidity}%`;

    wind.textContent =
        `${data.wind.speed} m/s`;

    pressure.textContent =
        `${data.main.pressure} hPa`;

    visibility.textContent =
        `${(data.visibility/1000).toFixed(1)} km`;

    sunrise.textContent =
        formatTime(data.sys.sunrise);

    sunset.textContent =
        formatTime(data.sys.sunset);

    // UV Index (not available in Current Weather API)
    uvIndex.textContent = "--";

    updateWeatherIcon(
        data.weather[0].icon
    );

}




/*======================================================
                DEFAULT WEATHER
========================================================*/

function loadDefaultWeather(){

    getWeather("Lucknow");

}





/*======================================================
                SEARCH WEATHER
========================================================*/

function searchWeather(){

    const city = cityInput.value.trim();

    if(city===""){

        alert("Please enter a city name.");

        return;

    }

    getWeather(city);

    cityInput.value="";

}






/*======================================================
                CURRENT LOCATION
========================================================*/

async function getCurrentLocationWeather(){

    if(!navigator.geolocation){

        showError("Geolocation is not supported.");

        return;

    }

    navigator.geolocation.getCurrentPosition(

        async(position)=>{

            try{

                showLoader();

                hideError();

                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                const response = await fetch(

                    `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`

                );

                if(!response.ok){

                    throw new Error("Unable to fetch weather.");

                }

                const data = await response.json();

                updateUI(data);

            }

            catch(error){

                console.error(error);

                showError(error.message);

            }

            finally{

                hideLoader();

            }

        },

        ()=>{

            showError("Location permission denied.");

        }

    );

}





/*======================================================
                RECENT SEARCHES
========================================================*/

function saveRecentSearch(city){

    let cities =
    JSON.parse(localStorage.getItem("recentCities")) || [];

    city = city.trim();

    cities = cities.filter(

        item=>item.toLowerCase()!==city.toLowerCase()

    );

    cities.unshift(city);

    cities = cities.slice(0,5);

    localStorage.setItem(

        "recentCities",

        JSON.stringify(cities)

    );

    displayRecentSearches();

}



function displayRecentSearches(){

    recentSearches.innerHTML="";

    const cities =
    JSON.parse(localStorage.getItem("recentCities")) || [];

    cities.forEach(city=>{

        const btn=document.createElement("button");

        btn.className="recent-btn";

        btn.textContent=city;

        btn.onclick=()=>{

            getWeather(city);

        };

        recentSearches.appendChild(btn);

    });

}




/*======================================================
                    DARK MODE
========================================================*/

function loadTheme(){

    const theme = localStorage.getItem("theme");

    if(theme==="dark"){

        document.body.classList.add("dark");

    }

}

themeBtn.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");

    }

    else{

        localStorage.setItem("theme","light");

    }

});





/*======================================================
                EVENT LISTENERS
========================================================*/

searchBtn.addEventListener("click",searchWeather);


cityInput.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        searchWeather();

    }

});


locationBtn.addEventListener("click",()=>{

    getCurrentLocationWeather();

});



console.log(searchBtn);

/*======================================================
                INITIALIZE APP
========================================================*/

window.addEventListener("load",()=>{

    loadTheme();

    displayRecentSearches();

    loadDefaultWeather();

});