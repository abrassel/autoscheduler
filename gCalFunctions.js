


function getAuthToken(callback){
    //options contains whether we promt the user (interactive) and a callback functions
    chrome.identity.getAuthToken({}, function(token) {
        if(token == null){
            chrome.identity.getAuthToken({ 'interactive': true}, callback);
        } else {
            callback(token)
        }

    });
}

//creates the user's calendar

function createCalendar(name, token, callback) {
  console.log("In createCalendar()");

    // POST request to create a new calendar
    var url = "https://www.googleapis.com/calendar/v3/calendars";
    var params = {
      "summary": name,
      "timeZone": "America/New_York"
    };
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            var newCalId = (JSON.parse(xhr.responseText).id);

            callback(newCalId);

          } else {
            console.log("Error", xhr.statusText);
          }
        }
    }

    xhr.send(JSON.stringify(params));

}

// get user's already scheduled events from the calendar, from the next week

function getPermanentEvents(token, callback){

    var currentTime = new moment();

    var url = "https://www.googleapis.com/calendar/v3/calendars/primary/events?";
    url += "orderBy=startTime&";
    url += "singleEvents=true&";
    url += "timeMin=" + currentTime.toDate().toISOString() + "&";
    url += "timeMax=" + currentTime.add(7, 'd').toDate().toISOString();

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);

    //Send the proper header information along with the request
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            var newCalId = (JSON.parse(xhr.responseText).id);
            //pagecodediv.innerText = 'Importing your schedule...';
            //document.querySelector('#import-button').remove();
            //importEvents(newCalId, token, events);
            console.log("getPermanentEvents returned: " + JSON.parse(xhr.response));
            callback(xhr.response);

          } else {
            console.log("Error", xhr.statusText);
            //pagecodediv.innerText = 'Uh Oh! Something went wrong...Sorry about the inconvenience! Feel free to shoot tchen112@terpmail.umd.edu an email so we know we\'re down!';
            //document.querySelector('#import-button').remove();
          }
        }
    }

    xhr.send();

}


function createEvents(calId = 'primary', token, events, callback) {

    //TODO: Figure out what data constitutes an event
    //TODO: schedule events in a batch?

    events.forEach(function(e){

        var url = "https://www.googleapis.com/calendar/v3/calendars/" + calId + "/events";


        var event = {
            'summary': e.name,
            'id': e.id,

            //using description for importance score
            'description': e.importance,

            'start': {
                'dateTime': e.startTime,
                'timeZone': 'America/New_York'
            },
            'end': {
                'dateTime': e.endTime,
                'timeZone': 'America/New_York'
            }

        };


        var xhr = new XMLHttpRequest();
         xhr.open("POST", url, true);

         //Send the proper header information along with the request
         xhr.setRequestHeader('Content-Type', 'application/json');
         xhr.setRequestHeader('Authorization', 'Bearer ' + token);


         xhr.onreadystatechange = function() {
             if (xhr.readyState == XMLHttpRequest.DONE && !postImportActionsCalled) {
                 // console.log(JSON.parse(xhr.responseText));
                 callback(xhr.response);
             }
         }

         xhr.send(JSON.stringify(params));
	});


}
