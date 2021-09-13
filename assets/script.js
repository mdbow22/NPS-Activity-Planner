

/***********************
 *** NPS API Queries ***
 ***********************/

 //global variables
let stateCode;
let activity;
let selectedParks = [];
let curResults = [];
let imagesArray;
let historyBox;
let results;

//Selectors

let stateSelection = document.getElementById('stateSelection');
let activitySelection = document.getElementById('activitySelection');
let resultsContainer = document.getElementById('resultsContainer');
let searchBtn = document.querySelector('.searchBtn');
let lsOutput = document.getElementById('lsOutput');
let webCamEl = document.getElementById('webCamImg');
let camCardEl = document.getElementById('webCamCard');

//Function to be called by event listener in selectResults function
let getSideData = function(park) {
    //fetch the weather
    getWeather(park.parkLat,park.parkLon);
    
    //fetch a webcam image if it exists
    getWebCam(park.parkCode);
}

//Select Results each time new results are loaded and add event listener for displaying weather and webcam image
let selectResults = function() {
    curResults = document.querySelectorAll('.result');
    for (let i = 0; i < curResults.length; i++) {
        curResults[i].addEventListener('click', getSideData.bind(null,selectedParks[i]));
    }
};


//Display the results into the Search Results section
let displayResults = function() {

    //Display new results
    for(let i = 0; i < selectedParks.length; i++) {
        
        //Create card for each result
        let resultBox = document.createElement('div');
        resultBox.classList.add('card','result');
        resultBox.setAttribute('data-resnum',i);
        resultsContainer.appendChild(resultBox);

        //Display Park title
        let parkTitle = document.createElement('h5');
        parkTitle.textContent = selectedParks[i].parkName;
        resultBox.appendChild(parkTitle);

        
        let infoList = document.createElement('ul');
        resultBox.appendChild(infoList);

        //Display Website for park
        let parkLink = document.createElement('li');
        parkLink.innerHTML = `URL: <a href='${selectedParks[i].parkURL}' target='_blank'>${selectedParks[i].parkURL}</a>`;
        infoList.appendChild(parkLink);

        let parkLocation = document.createElement('li');
        let address = selectedParks[i].parkAddress.line1 + ', ' + selectedParks[i].parkAddress.city + ', ' + selectedParks[i].parkAddress.stateCode + ' ' + selectedParks[i].parkAddress.postalCode;
        parkLocation.innerHTML = '<a href="https://www.google.com/maps/search/?api=1&query=' + selectedParks[i].parkLat + '%2C' + selectedParks[i].parkLon + '" target="_blank">' + address + '</a>';
        infoList.appendChild(parkLocation);
    }
    //Save current results as an array, then iterate over it to add 
    selectResults();
};

//retrieve info for parks in selected state (address, lat/long, and parkCode) to be able to do other API queries
let getParksInfo = function() {
    let requestURL = "https://developer.nps.gov/api/v1/parks?api_key=0lew12ln17nmn2hAVOHsfsFPOuTsd5Vym9rII7jp&stateCode=" + stateCode;
    fetch(requestURL)
        .then(function(response) {
            if (response.status === 200) {
                //if yes, convert to object
                return response.json();
            } 
        })
        .then(function(data) {
            
            //get just the data array from the promise
            results = data.data;

            //sift through each result to see if the park has the activity the user selected
            for(let i = 0; i < results.length; i++) {
                for(let k = 0; k < results[i].activities.length; k++) {
                    //if it includes the activity, store info about park as an object inside the selectedParks array
                    if(results[i].activities[k].name === activity) {
                        let parkObject = {
                            parkCode: results[i].parkCode,
                            parkName: results[i].fullName,
                            parkLat: results[i].latitude,
                            parkLon: results[i].longitude,
                            parkURL: results[i].url,
                            parkAddress: results[i].addresses[0]
                        }
                        selectedParks.push(parkObject);
                    }
                }
            }
            if (selectedParks.length === 0) {
                //Create card for error
                let resultBox = document.createElement('div');
                resultBox.classList.add('card','result');
                resultBox.setAttribute('data-resnum',0);
                resultsContainer.appendChild(resultBox);

                //Display Error Message
                let errorTitle = document.createElement('h5');
                errorTitle.textContent = 'No Results Found';
                resultBox.appendChild(errorTitle);
            } else {
                displayResults();
            }  
        });
};

//Destroy past results from page and array
let destroyResults = function() {

    //Destroy previous results from DOM
    while(resultsContainer.firstChild) {
        resultsContainer.removeChild(resultsContainer.firstChild);
    }

    //Destroy event listeners
    for (let i = 0; i < curResults.length; i++) {
        curResults[i].removeEventListener('click', getSideData);
    }

    //Destroy results from selectedParks array and curResults array
    selectedParks.splice(0,selectedParks.length);
    /* curResults.splice(0,curResults.length); */

};

function getWebCam(parkCode) {
    let webCamURL = 'https://developer.nps.gov/api/v1/webcams?api_key=0lew12ln17nmn2hAVOHsfsFPOuTsd5Vym9rII7jp&parkCode=' + parkCode;
    fetch(webCamURL)
        .then(function(response) {
            if(response.status === 200) {
                return response.json();
            } else {
                camCardEl.style.display = 'none';
            }
        })
        .then(function(data) {
            if(data.data.length > 0) {
                if(data.data[0].images.length > 0) {
                    camCardEl.style.display = 'block';
                    webCamEl.setAttribute('src',data.data[0].images[0].url);
                    webCamEl.style.aspectRatio = '1.33/1';
                } else {
                    camCardEl.style.display = 'none';
                }
            } else {
                camCardEl.style.display = 'none';
            }
        });
};

/****************************
 * OPEN WEATHER API QUERIES *
 ****************************/

//Weather Selectors
let iconEl = document.getElementById('weatherIcon');
let curTempEl = document.getElementById('curTemp');
let feelsLikeEl = document.getElementById('feelsLike');
let uvEl = document.getElementById('uvIndex');
let lowEl = document.getElementById('low');
let highEl = document.getElementById('high');
let weatherCard = document.getElementById('weatherCard');

//Display the current weather
let displayWeather = function(current,today) {
    weatherCard.style.display = 'block';
    iconEl.setAttribute('src','http://openweathermap.org/img/wn/' + current.weather[0].icon + '@2x.png');
    curTempEl.textContent = 'Currently: ' + Math.round(current.temp);
    feelsLikeEl.textContent = 'Feels like ' + Math.round(current.feels_like);
    uvEl.textContent = 'UV Index: ' + current.uvi;
    lowEl.textContent = 'Low: ' + Math.round(today.temp.min);
    highEl.textContent = 'High: ' + Math.round(today.temp.max);
};

//Fetch current weather conditions
function getWeather(lat,lon) {
    let weatherURL = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=hourly,minutely,alerts&appid=3e8fd441ffe94cd1d1f73c4d27b77283&units=imperial';
    fetch(weatherURL)
        .then(function(response) {
            if(response.status === 200) {
                return response.json();
            }
        })
        .then(function(data) {
            displayWeather(data.current,data.daily[0]);
        });
}

//place the user's search into local storage
let assignLocalStorage = function(state,act) {
    if(state && act) {
        localStorage.setItem(state, act);        
        let newHistory = document.createElement('div')
        newHistory.classList.add('card');
        newHistory.innerHTML += `${act} in ${state.slice(2)}`;
        lsOutput.prepend(newHistory);
        newHistory.setAttribute('data-state', state.slice(0, 2));
        newHistory.setAttribute('data-activity', activity);
    }
};

//Event Listeners


searchBtn.addEventListener('click',function(event) {
    event.preventDefault();
    console.log("Did this work?")

    
    stateCode = stateSelection.value;
    activity = activitySelection.value;

    //Remove past results to prevent conflict with new results
    destroyResults();
    //get new search results
    getParksInfo();
    //save search to localStorage
    assignLocalStorage(stateCode,activity);
});

window.addEventListener("load", function(event) {
     console.log ("Is this working?")

     let searchURL = new URL(document.location);

     stateCode = searchURL.searchParams.get("q");
     activity = searchURL.searchParams.get("format");

     getParksInfo();
     assignLocalStorage(stateCode,activity);
})

// reset button on search results page, on click, refreshes screen
let resetBtn = document.querySelector(".resetBtn");
resetBtn.addEventListener("click", refreshPage)
function refreshPage() {
    destroyResults(); 
    weatherCard.style.display = 'none';
    webCamEl.style.display = 'none';
    stateSelection.selectedIndex = 0;
    activitySelection.selectedIndex = 0;
} 

//load search history form local storage
pageLoad = function() {
    for (let i = 0; i <localStorage.length; i++) {
        const state = localStorage.key(i);
        const activity = localStorage.getItem(state);

        historyBox = document.createElement('div');
        historyBox.classList.add('card');
        historyBox.innerHTML += `${activity} in ${state.slice(2)}`;
        lsOutput.prepend(historyBox);
        historyBox.setAttribute('data-state', state.slice(0, 2));
        historyBox.setAttribute('data-activity', activity);
    }
}
pageLoad();

//Click on recent searches and get results
lsOutput.addEventListener('click', function(event){

    stateCode = event.target.dataset.state;
    activity = event.target.dataset.activity;

    destroyResults();
    getParksInfo(); 
})


