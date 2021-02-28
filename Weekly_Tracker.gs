function runScriptWeekly() {
  
  /* WHY ISNT THIS SIMPLE CHECK WORKING???
  if (startDay == 0){
    // Get day exactly 1 week ago.
    var startDay = new Date(new Date().getTime() - (1000 * 60 * 60 * 24)*(7));
    Logger.log(startDay);
  };
  */

  // EDIT INPUT /////
  var numberWeeks = 1;
  var shiftHours = 0;
  ///////////////////

  // Set start day one week ago
  var startDay = new Date(new Date().getTime() - (1000 * 60 * 60 * 24)*(7 * numberWeeks) + (1000 * 60 * 60 * shiftHours));

  var list = listOfWeeks(startDay, 'null', numberWeeks);
  Logger.log("Weeks: %s", list);
  for (n = 0; n < list.length; n++){
    Logger.log('%s - %s', list[n][0], list[n][1]);
    var eventsList = trackEvents(list[n][0], list[n][1]);
    var eventsData = getEventDetails(eventsList);

    /*
    var eventsDatalist = [];
    // Cycle through each calendar events list
    for (var calEvents in eventsList) {
      var eventsData = getEventDetails(calEvents);
      // Add new events data to a list
      eventsDatalist.push(eventsData);
      let eventsDataSum = eventsDatalist.reduce( (a,b) => a.map( (c,i) => c + b[i] ));
    }
    */

    updateSpreadsheet(eventsData,list[n][0], list[n][1]);
    // saveData(eventData);
    // weeklyCalendarTracker(list[n][1]);
  }
  
  // weeklyChecklistTracker();
}

//~~~~~~~~~~~~~~~~~~~~GET START DAY & # OF WEEKS FROM USER INPUT~~~~~~~~~~~~~~~~~~~~~~~~~
function listOfWeeks(startDay, endDay, inputNumOfWeeks=0) {
  
  // var dateString = Utilities.formatDate(startDay, 'MMMM dd, yyyy 00:00:00 -0800');

  if (inputNumOfWeeks == 0){
    var d1 = startDay.valueOf();
    var d2 = endDay.valueOf();
    // Get difference in days.
    var diffInDays = Math.floor((d2-d1)/(24*3600*1000));
    Logger.log("Difference in days = %s", diffInDays);  
    //Get number of weeks.
    var numWeeks = Math.floor(diffInDays/7); 
  } else {
    var numWeeks = inputNumOfWeeks; 
  }

  // Create a list of [start date,end date] (only a single item in the list for autorun)
  var listWeeks = [];
  var startEnd = [];
  for (i=0; i < numWeeks; i++) {
    var week = (1000 * 60 * 60 * 24)*(7);
  
    var startWeek = new Date(startDay.getTime() + week*i);

    var endWeek = new Date(startDay.getTime() + week*(i+1));
    
    var startEnd = [startWeek,endWeek];
    listWeeks.push(startEnd);
  };
  //~~~~~~~~~~~~~~~RETURN A LIST OF START/END TIMES FOR # OF WEEKS~~~~~~~~~~~~~~~~~~~~~~
  //Logger.log(listWeeks);
  return listWeeks;

  // Logger.log('%s , %s',startWeek1, endTimeFrame);
}


//~~~~~~~~~~~~~~~~~~TAKE START/END DAYS FOR INDIVIDUAL WEEK~~~~~~~~~~~~~~~~~~~~
function trackEvents(timeMin, timeMax){
  // List your calendars.
  //**********Can I Find a way to capture data from all calendars in account? ***********/
  // var cals =  ['mattyreed1@gmail.com']; 
  var cals = [
  'mattyreed1@gmail.com',
  'bq5l81tfb8huqtm05jf75o0pbvrvfqao@import.calendar.google.com',
  'orf8kkd6vl85hbqrnrckoi3v25548uhl@import.calendar.google.com'];
  var events = [];
  // Define optional arguments for event data capture
  var optionalArgs = {
    timeMin: (timeMin).toISOString(),
    timeMax: (timeMax).toISOString(),
    showDeleted: false,
    singleEvents: true,
    maxResults: 1000,
    orderBy: 'startTime',
  };
  Logger.log('Event data capture from %s to %s', timeMin, timeMax);
  for (i = 0; i < cals.length; i++){
    // Get past week Events in array  
    var response = Calendar.Events.list(cals[i], optionalArgs);
    events.push.apply(events,[response.items]);
  }
  
//~~~~~~~~~~~~~~~~~~RETURN LIST OF EVENTS FOR SINGLE WEEK OF EACH CALENDAR~~~~~~~~~~~~~~~~~~~~  
  Logger.log(events.length);
  return events;
}

//~~~~~~~~~~~~~~~~~~TAKE LIST OF EVENTS FOR SINGLE WEEK~~~~~~~~~~~~~~~~~~~~ 
function getEventDetails(eventsList) {
  Logger.log(eventsList.length);
  // Create a dict to store event duration values for primary categories
  //**Eventually create a dict to store event duration values for primary and secondary categories */
  // DICT
  // var eventDurations = {'0':0,'1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'10':0,'11':0}; 
  // ARRAY
  var eventDurations = [0,0,0,0,0,0,0,0,0,0,0,0];
  // loop thru calendars
  for (e = 0; e < eventsList.length; e++) {
    //Logger.log(eventsList[e]);
 
    // loop thru the events
    for (i = 0; i < eventsList[e].length; i++) {  
       
      // get one event from the list of events
      var myEvent = eventsList[e][i];
      // Logger.log(myEvent);
      // get the color of the single event
      if (e > 0){
        var colorID = 10;
      } else if (myEvent.colorId){
        // var colorID = parseInt(myEvent.colorId);
        var colorID = parseInt(myEvent.colorId);
      } else {
        var colorID = 0;
      }
     
      // get the start date of the single event and convert format
      var start = new Date(getDateFromIso(myEvent.start.dateTime));
      // get the end date of the single event and convert format
      var end = new Date(getDateFromIso(myEvent.end.dateTime));
      // Get duration of event
      var duration = ((end - start)/(1000 * 60 * 60)); 
      Logger.log('color ID: %s. duration: %s', colorID, duration);
      duration = duration || 0;

      // Add duration values to list
      var durationSum = eventDurations[colorID] + duration;
      eventDurations[colorID] = durationSum;
    }
  }
  // Convert NaN to 0.
  for (let k in eventDurations) {
    eventDurations[k] = eventDurations[k] || 0;
  };

  Logger.log(eventDurations);
  return eventDurations;
}  


/*
//~~~~~~~~~~~~~~TAKE LIST OF EVENTS FOR ONE DAY or WEEK~~~~~~~~~~~~~~~~~~~~~~~~~~~
function getEventDetails(events) {  
  // Access Time Tracker spreadsheet and input data for specified color category.
  
  // Create array of category cells (location in spreadsheet). index 0 is 'undefined' cell.
  // defineCellRange('Name of Sheet', 'Letter of Column', 'First row int', 'Last row int')
  var cellColorArray1 = defineCellRange('Calendar Data Import',2,'D',12);
  
  var subCatArray = defineCellRange('Calendar Data Import',16,'D',10);
  
  // Populate cells with 0.00 to reset
  for (i = 0; i < 12; i++) {
    cellColorArray1[i].setValue(0);
  }
  for (i = 0; i < 10; i++) {
    subCatArray[i].setValue(0);
  }
  
  // Get time and color of event per week
  if (events.length == 0) {
    Logger.log('No events found.');
    }
  else {
    // loop through the events
    for (i = 0; i < events.length; i++) {    
      // get one event from the list of events
      var myEvent = events[i];
      // get the color of the single event
      var colorID = parseInt(myEvent.colorId);
      // get the start date of the single event and convert format
      var start = new Date(getDateFromIso(myEvent.start.dateTime));
      // get the end date of the single event and convert format
      var end = new Date(getDateFromIso(myEvent.end.dateTime));
      // Get duration of event
      var duration = ((end - start)/(1000 * 60 * 60)); 
      // Check if all day event
      if (myEvent.start.date) {
        Logger.log('%s (%s)', myEvent.summary, 'ALL DAY EVENT');
      }
      else {
        var eventName = myEvent.summary.toLowerCase();

//~~~~~~~~~~~~~~INPUT EVENT DETAILS INTO SPREADSHEET~~~~~~~~~~~~~~~~~~~~~~~~~~~
      //?????????????????? CONDENSE CODE ?????????????????????????

      // Add total duration per week for each color in spreadsheet         
        
      switch(colorID){
    case 1:
      // Fitness
      // ~~~~~~~~ISOLATE SPECIFIC EVENT TITLE~~~~~~~~~~~      
      if (eventName.includes("meditate")){
        var cellContents = subCatArray[7].getValue();
        subCatArray[7].setValue(cellContents + duration);
      } else{
        var cellContents = subCatArray[6].getValue();
        subCatArray[6].setValue(cellContents + duration);
      };
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      var cellContents = cellColorArray1[1].getValue();
      cellColorArray1[1].setValue(cellContents + duration);
      // Logger.log('%s (%s) [%s]', myEvent.summary,duration,start);
      break;
    case 2:
      // Plan
      var cellContents = cellColorArray1[2].getValue();
      cellColorArray1[2].setValue(cellContents + duration);
      // Logger.log('%s (%s) [%s]', myEvent.summary,duration,start);
      break;
    case 3:
      // Mix
      var cellContents = cellColorArray1[3].getValue();
      cellColorArray1[3].setValue(cellContents + duration);
      // Logger.log('%s (%s) [%s]', myEvent.summary,duration,start);
      break;
    case 4:
      // Social 
      var cellContents = cellColorArray1[4].getValue();
      cellColorArray1[4].setValue(cellContents + duration);
      break;
      
    case 5:
      // Cook / Eat
      var cellContents = cellColorArray1[5].getValue();
      cellColorArray1[5].setValue( cellContents + duration);
      // Logger.log('%s (%s)', myEvent.summary,duration);
      break;
      
    case 6:
      // Piano
      var cellContents = cellColorArray1[6].getValue();
      cellColorArray1[6].setValue( cellContents + duration);
      break;
      
    case 7:
      // UI / Marketing
      var cellContents = cellColorArray1[7].getValue();
      cellColorArray1[7].setValue( cellContents + duration);
      break;
      
    case 8:
      // Read
      var cellContents = cellColorArray1[8].getValue();
      cellColorArray1[8].setValue( cellContents + duration);
      break;
    case 9:
      // Programming / Code
      // ~~~~~~~~ISOLATE SPECIFIC EVENT TITLE~~~~~~~~~~~
      if (eventName.includes("python") || eventName.includes("egnyte")){
        var cellContents = subCatArray[3].getValue();
        subCatArray[3].setValue(cellContents + duration);
      } else if (eventName.includes("tracker")){
        var cellContents = subCatArray[4].getValue();
        subCatArray[4].setValue(cellContents + duration);
      } else if (eventName.includes("website") || eventName.includes("bootcamp") || eventName.includes("lucas")){
        var cellContents = subCatArray[5].getValue();
        subCatArray[5].setValue(cellContents + duration);
      }; 
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      var cellContents = cellColorArray1[9].getValue();
      cellColorArray1[9].setValue( cellContents + duration);
      break;
    case 10:
      // Job
      // ~~~~~~~~ISOLATE SPECIFIC EVENT TITLE~~~~~~~~~~~
      if (eventName.includes("curriculum") || eventName.includes("cm 421")){
        var cellContents = subCatArray[1].getValue();
        subCatArray[1].setValue(cellContents + duration);
      } else if (eventName.includes("ctec") || eventName.includes("cmac")){
        var cellContents = subCatArray[2].getValue();
        subCatArray[2].setValue(cellContents + duration);
      };  
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      var cellContents = cellColorArray1[10].getValue();
      cellColorArray1[10].setValue( cellContents + duration);
      break;
    case 11:
      // Travel 
      var cellContents = cellColorArray1[11].getValue();
      cellColorArray1[11].setValue( cellContents + duration);
      // Logger.log('%s (%s)', myEvent.summary,duration);
      break;
      
    default:
      // Generic Tasks
      // ~~~~~~~~ISOLATE SPECIFIC EVENT TITLE~~~~~~~~~~~
      if (eventName.includes("shop")){
        var cellContents = subCatArray[8].getValue();
        subCatArray[8].setValue(cellContents + duration);
      } else if (eventName.includes("clean") || eventName.includes("laundry")){
        var cellContents = subCatArray[9].getValue();
        subCatArray[9].setValue(cellContents + duration);
      };  
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~    
      var cellContents = cellColorArray1[0].getValue();
      cellColorArray1[0].setValue(cellContents + duration);
      break;
      ///////////////////////////////////////////////////////
      }  
        
        
  
      }
      }
    }
  } 
}
*/