//Selectors

let firstSearch = document.getElementById('firstSearch');
let background = document.documentElement;

//Event Listeners

firstSearch.addEventListener('click',function(event) {
    event.preventDefault();
    console.log("Did that work?")

    var stateSelect = document.querySelector("#stateName").value
    var activitySelect = document.querySelector("#activityName").value

    if (!stateSelect || !activitySelect) {
        console.error("invalid input");
        return;
    }

    var queryString = "./searchresults.html?q=" + stateSelect + "&format=" + activitySelect;

    location.assign(queryString);




});

//Randomize background image

let bgImages = ['badlands-national-park.jpg','denali-mtn-range.jpg','denali-national-park.jpg','gibbon-falls.jpg','moose-grand-tetons-national-park.jpg','rocky-mountain-two-moose.jpg','rocky-mountain-wildflowers.jpg'];

let bgRandomize = function() {
    background.style.setProperty('--bgImage','url(./Pictures/' + bgImages[Math.floor(Math.random() * bgImages.length)] + ')');
};

bgRandomize();