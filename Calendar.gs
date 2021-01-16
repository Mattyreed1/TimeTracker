/**
 * Callback for rendering the card for a specific Calendar event.
 * @param {Object} e The event object.
 * @return {CardService.Card} The card to show to the user.
 */
function onCalendarEventOpen(e) {
  console.log(e);
  
  var calendarID = e.calendar.calendarId;
  var calendar = CalendarApp.getCalendarById(calendarID);
  var eventID = e.calendar.id;
  
  /* The event metadata doesn't include the event's title, so use the
     calendar.readonly scope and fetching the event by it's ID.
  */
  var event = calendar.getEventById(eventID);



  if (!event) {
    // This is a new event still being created.
    Logger.log("Event has not been created yet");
    var categories = Object.keys(getCategoriesDict());
    var titlesList = getCategoriesDict();
    var eventTitle = 'A new event! Am I invited?';
    var isHomepage = false;
    var categorySelected = false; 
  } else {
    // Get color ID of event selected.
    var eventColor = event.getColor(); 
    var eventTime = event.getStartTime();    
    var eventTitle = event.getTitle();
    Logger.log('Existing event selected. Title: %s. Color: %s. Time: %s', eventTitle, eventColor, eventTime);
    
    // If event exists and color is defined, run titlesByCategory function
    var categories = titlesByCategory(eventColor)[0];
    var titlesList = titlesByCategory(eventColor)[1];
    Logger.log('titlesByCategory returned: %s', titlesByCategory(eventColor))
    
    // Not homepage and category was selected.
    var isHomepage = false;
    var categorySelected = true;
  }
  
  Logger.log("2 The category is %s and the event titles are %s", categories, titlesList);
  return createCatCard(eventTitle, categories, titlesList, isHomepage, categorySelected);
}

// Get the titles for the event color category selected.
function titlesByCategory(colorID, inputTitle) {
  Logger.log('titlesByCategroy');
  // Input new title for given colorID
  var inputTitle = null;
  
  var categoryDict = getCategoriesDict();
  
  var titlesList = [];
  
  // Convert ID to int
  var colorIDint = parseInt(colorID);
  Logger.log("Color ID is %s", colorID);
  switch (colorIDint) {
    case 1:
      return colorSwitch(categoryDict, colorIDint);
      
    case 2:
      return colorSwitch(categoryDict, colorIDint);
      
    case 3:
      return colorSwitch(categoryDict, colorIDint);
      
    case 4:
      return colorSwitch(categoryDict, colorIDint);
      
    case 5:
      return colorSwitch(categoryDict, colorIDint);
      
    case 6:
      return colorSwitch(categoryDict, colorIDint);
      
    case 7:
      return colorSwitch(categoryDict, colorIDint);
      
    case 8:
      return colorSwitch(categoryDict, colorIDint);
      
    case 9:
      return colorSwitch(categoryDict, colorIDint);
      
    case 10:
      return colorSwitch(categoryDict, colorIDint);
      
    case 11:
      return colorSwitch(categoryDict, colorIDint);
      
    default:
      return colorSwitch(categoryDict, 0);
    
  }

}

// Abstract the switch function.
function colorSwitch(categoryDict, colorID){
  var titlesList = [];
  var category = Object.keys(categoryDict)[colorID];
      for (i = 0; i < categoryDict[category].length; i++){
        titlesList.push(categoryDict[category][i]);
      };
  Logger.log(Object.keys(categoryDict));
  Logger.log("1 The category is %s and the event titles are %s", category, titlesList);
      return [category, titlesList];
}






// Change color of event by ID
function ChangeEventColor(calendarID,eventID){
  var calendarID = 'mattyreed1@gmail.com';
  var eventID = 'omv°°°°°°°°°°8jbs';
  var event = Calendar.Events.get(calendarID, eventID);
  Logger.log('current color = '+event.colorId)
  // Set new color
  event.colorId = 11
  Calendar.Events.patch(event,calendarId,eventId);
  Logger.log('new color = '+event.colorId);
}






  /**
   * Callback function for a button action. Adds attendees to the
   * Calendar event being edited.
   *
   * @param {Object} e The action event object.
   * @return {CalendarEventActionResponse}
   */
function onAddAttendeesButtonClicked (e) {
  return CardService.newCalendarEventActionResponseBuilder()
  .addAttendees(["aiko@example.com", "malcom@example.com"])
  .build();
}

function onColorCategorySelected (e) {
  return CardService.newCalendarEventActionResponseBuilder().build().printJson()
}

//~~~~~~~~~~~~~~ COLOR IDs ~~~~~~~~~~~~~~~~~~~
/*       
        
1: Light Purple
// Fitness

2: Light Green
// Plan

3: Dark Purple
// Mix

4: Pink
// Social 

5: Yellow
// Cook / Eat

6: Orange
// Piano

7: Light Blue
// UI / Content / Marketing
      
8: Grey
// Read

9: Dark Blue
// Programming / Code

10: Dark Green
// Job

11: Red
// Travel 

default: Green-Blue
// Generic Tasks

*/