let firstSearch = document.getElementById('firstSearch');

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




})