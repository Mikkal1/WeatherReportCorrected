$(function () {

    let searchHistory = localStorage.getItem('searches') ?
        JSON.parse(localStorage.getItem('searches')) : []

    if (searchHistory.length > 0) {
        loadHistory()
        retrieveForecast()
    }

    function showStatus(status) {
        $("#status p").text(status);
        $("#status").show();
        $("#report").hide();
    }

    function showReport() {
        $("#status").hide();
        $("#report").show();
    }

    function loadHistory() {
        $("#history").empty()
        // create a new li element
        searchHistory.map(e => {
            let li = document.createElement("li")
            li.innerText = e
            li.addEventListener("click", function () {
                $("#city").val(e)
                $("#search").click()
            })
            
            $("#history").append(li)
        })            
    }

    function saveHistory(city) {
        let index = searchHistory.indexOf(city)
        if (index > -1) {
            // remove it
            searchHistory.splice(index, 1)
        }
        else if (searchHistory.length >= 10) {
            // remove last one
            searchHistory.pop()
        }
        searchHistory.unshift(city)
        localStorage.setItem('searches', JSON.stringify(searchHistory));
    }

    function retrieveForecast() {
        const city = searchHistory[0]
       // try geocoding
       fetch("https://api.openweathermap.org/geo/1.0/direct?q=" + encodeURI(city) + "&limit=1&appid=99df08f503018b895e437d5bce708f5a")
       .then(res => {
           if (!res.ok) {
               throw new Error("City not found")
           }
           else {
               return res.json()
           }
       })
       .then(geocode_json => {
           // retrieve result
           if (geocode_json.length > 0) {
               showReport()

               // display result
               let lat = geocode_json[0].lat
               let lon = geocode_json[0].lon

               // retrieve weather
               fetch("https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=99df08f503018b895e437d5bce708f5a")
               .then(res => res.json())
               .then(weather_json => {
                   // get city name by capitalizing first letter
                   let city_name = city.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ")
                   $("#city-name").text(city_name)

                   for (i = 0; i <= 5; i++) {
                       let weatherNow = weather_json.list[7 * i]
                       let date = new Date(weatherNow.dt * 1000)
                       let temp = weatherNow.main.temp
                       let humidity = weatherNow.main.humidity
                       let wind = weatherNow.wind.speed
                       let icon = weatherNow.weather[0].icon

                       $("#date_" + i).text(date.toLocaleDateString())
                       $("#temp_" + i).text(temp)
                       $("#humidity_" + i).text(humidity)
                       $("#wind_" + i).text(wind)
                       $("#icon_" + i).attr("src", "https://openweathermap.org/img/w/" + icon + ".png")
                   }
               });
           }
           else {
               showStatus("City not found")
           }
       })
    }

    $("#form").on("submit", function (e) {
        e.preventDefault()
        $("#search").click()
    })

    $("#search").on("click", async function () {
        // get content of city
        let city = $("#city").val()
         if (city) {
            saveHistory(city)
            loadHistory()
            retrieveForecast()
         }
         else {
              showStatus("Please enter a city name to search.")
         }
    });

    showStatus("Please enter a city name to search.")
})