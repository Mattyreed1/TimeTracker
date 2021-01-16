/**
 * This simple G Suite add-on shows a random image of a cat in the sidebar. When
 * opened manually (the homepage card), some static text is overlayed on
 * the image, but when contextual cards are opened a new cat image is shown
 * with the text taken from that context (such as a message's subject line)
 * overlaying the image. There is also a button that updates the card with a
 * new random cat image.
 *
 * Click "File > Make a copy..." to copy the script, and "Publish > Deploy from
 * manifest > Install add-on" to install it.
 */

// The maximum number of characters that can fit in the cat image.
var MAX_MESSAGE_LENGTH = 40;

/**
 * Callback for rendering the homepage card.
 * @return {CardService.Card} The card to show to the user.
 */
function onHomepage(e) {
  console.log(e);
  var calendar = CalendarApp.getCalendarById('mattyreed1@gmail.com');
  var name = calendar.getName();
  name = name.slice(0,name.lastIndexOf('@'));
  var hour = Number(Utilities.formatDate(new Date(), e.userTimezone.id, 'H'));
  var message;
  if (hour >= 6 && hour < 12) {
    message = 'Good morning';
  } else if (hour >= 12 && hour < 18) {
    message = 'Good afternoon';
  } else {
    message = 'Good night';
  }
  message += ' ' + name;
  
  var categories = Object.keys(getCategoriesDict());
  var titles = [];
  return createCatCard(message, categories, titles, isHomepage=true, categorySelected=false);
}

/**
 * Creates a card with an image of a cat, overlayed with the text.
 * @param {String} text The text to overlay on the image.
 * @param {Boolean} isHomepage True if the card created here is a homepage;
 *      false otherwise. Defaults to false.
 * @return {CardService.Card} The assembled card.
 */
function createCatCard(text, categories, eventTitleList, isHomepage, categorySelected) {
  // Explicitly set the value of isHomepage as false if null or undefined.
  if (!isHomepage) {
    isHomepage = false;
  } else {
    eventTitleList = ["Choose a category!"];
  }
  
  if (!eventTitleList){
    eventTitleList = ["Choose a category!"];
  }
  
  // Set radio buttons if category is not defined
  /*
  if (!categories) {
    categories = [
        "Test Category 1",
        "Test Category 2",
        "Test Category 3"];
  }
  */
  
  
  console.log("Event title list: %s",eventTitleList);
  console.log("category selected: %s",categorySelected );

  // Use the "Cat as a service" API to get the cat image. Add a "time" URL
  // parameter to act as a cache buster.
  var now = new Date();
  // Replace formward slashes in the text, as they break the CataaS API.
  var caption = text.replace(/\//g, ' ');
  var imageUrl =
      Utilities.formatString('https://cataas.com/cat/says/%s?time=%s',
          encodeURIComponent(caption), now.getTime());
  var image = CardService.newImage()
      .setImageUrl(imageUrl)
      .setAltText('Meow');

  // Create a button that changes the cat image when pressed.
  // Note: Action parameter keys and values must be strings.
  var action = CardService.newAction()
  .setFunctionName('onChangeCat')
  .setParameters({text: text, categories: "categories parameter", eventTitleList: "null", isHomepage: isHomepage.toString()});
  var button = CardService.newTextButton()
      .setText('Change cat')
      .setOnClickAction(action)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  var buttonSet = CardService.newButtonSet()
      .addButton(button);

  
  // If not homepage and category is not yet selected, Create buttons for each category.
  // Note: Action parameter keys and values must be strings.
  if (!isHomepage){
    if (!categorySelected){
    // var categoryList = categories.join('\n');
    var categoryButtons = [];
    console.log("Categories list: %s", categories);
      for (i = 0; i < categories.length; i++){
        var category = categories[i].toString()
        console.log("Category: %s", category);
        console.log("Event title list: %s",eventTitleList);
        var action_test = CardService.newAction()
        .setFunctionName('onSelectCategory')
        .setParameters({text: text, category: category, eventTitleList: "null", isHomepage: isHomepage.toString()});
        var button_test = CardService.newTextButton()
        .setText(category)
        .setOnClickAction(action_test)
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
        var buttonSet_test = CardService.newButtonSet()
        .addButton(button_test);
        
        // Create list of category buttons
        categoryButtons.push(buttonSet_test);
      }
  // If categories is a single category, display the category name as text.
    } else {
      var categoriesDisplay = CardService.newTextParagraph()
      .setText(categories);
    }
  }
  
  
  // Display radio buttons based on color category
  var radioGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setTitle("Select Event Title:")
    .setFieldName("radio_button_field")
  .addItem(eventTitleList[0], "radio_0", false)
  // Add radio buttons dynamically
  for (i=1; i<eventTitleList.length; i++) {
    var num = i.toString();
    radioGroup.addItem(eventTitleList[i], "radio_" + num, false)
  }
  radioGroup.addItem("Custom Subtitle:", "radio_custom", true);
  
  // Input field for adding new subtitles to categories
  var textInput = CardService.newTextInput()
    .setFieldName("text_input_custom_subtitle")
    .setTitle("Input Custom Subtitle...");
  
  
  // Add text to display before an event is selected.
  var tempText = CardService.newTextParagraph()
  .setText('Select an event or create a new one!');
  
  // Add button to create event.
  // **If custom input is not empty, apply custom subtitle**
  var action2 = CardService.newAction()
    .setFunctionName('createCalEvent');
  var button2 = CardService.newTextButton()
      .setText('Create Event')
      .setOnClickAction(action2);
  var buttonSet2 = CardService.newButtonSet()
      .addButton(button2);
  
  // Create a footer to be shown at the bottom.
  var footer = CardService.newFixedFooter()
      .setPrimaryButton(CardService.newTextButton()
          .setText('Powered by cataas.com')
          .setOpenLink(CardService.newOpenLink()
              .setUrl('https://cataas.com')));
  

  // Assemble the widgets and return the card.
  var catSection = CardService.newCardSection()
  .addWidget(image)
  .addWidget(buttonSet)
  // Are you on homepage?
  if (!isHomepage) {
    // Are you creating a new event?
    if (categorySelected){
      var section = CardService.newCardSection()
      .addWidget(categoriesDisplay)
      .addWidget(radioGroup)
      .addWidget(textInput)
      .addWidget(buttonSet2);
    } else {
      console.log("You are not on homepage and you dont have a category selected.")
      var section = CardService.newCardSection()
      for (i = 0; i < categoryButtons.length; i++){
        section.addWidget(categoryButtons[i]);
      }
    }
  } else {
    var section = CardService.newCardSection()
    .addWidget(tempText);
  }
  var card = CardService.newCardBuilder()
  .addSection(catSection)
  .addSection(section)
  .setFixedFooter(footer);
  
  

  if (!isHomepage) {
    // Create the header shown when the card is minimized,
    // but only when this card is a contextual card. Peek headers
    // are never used by non-contexual cards like homepages.
    var peekHeader = CardService.newCardHeader()
      .setTitle('Contextual Cat')
      .setImageUrl('https://www.gstatic.com/images/icons/material/system/1x/pets_black_48dp.png')
      .setSubtitle(text);
    card.setPeekCardHeader(peekHeader)
  }

  return card.build();
}

/**
 * Callback for the "Change cat" button.
 * @param {Object} e The event object, documented {@link
 *     https://developers.google.com/gmail/add-ons/concepts/actions#action_event_objects
 *     here}.
 * @return {CardService.ActionResponse} The action response to apply.
 */
function onChangeCat(e) {
  console.log(e);
  // Get the text that was shown in the current cat image. This was passed as a
  // parameter on the Action set for the button.
  var text = e.parameters.text;
  var categories = e.parameters.categories;
  Logger.log("Check categories %s",categories)

  // The isHomepage parameter is passed as a string, so convert to a Boolean.
  var isHomepage = e.parameters.isHomepage === 'true';
  
  // Event titles list is passed
  // var eventTitleList = e.parameters.eventTitleList;

  // Create a new card with the same text.
  var card = createCatCard(text, categories, null, isHomepage);

  // Create an action response that instructs the add-on to replace
  // the current card with the new one.
  var navigation = CardService.newNavigation()
      .updateCard(card);
  var actionResponse = CardService.newActionResponseBuilder()
      .setNavigation(navigation);
  return actionResponse.build();
}

function onSelectCategory(e){
  console.log(e);
  
  var text = e.parameters.text;
  
  var category = e.parameters.category;
  console.log(e.parameters.category);
  
  var subTitles = getCategoriesDict()[category];
  console.log("Category seleted. Here is the subtitles list: %s",subTitles);
  
  // Update card to specific category
  var card = createCatCard(text, category, subTitles, isHomepage=false, categorySelected=true);
  
  // Create an action response that instructs the add-on to replace
  // the current card with the new one.
  var navigation = CardService.newNavigation()
      .pushCard(card);
  var actionResponse = CardService.newActionResponseBuilder()
      .setNavigation(navigation);
  return actionResponse.build();

}

function createCalEvent(e){
  console.log(e);
  console.log('Calendar Event Created');
}


/**
 * Truncate a message to fit in the cat image.
 * @param {string} message The message to truncate.
 * @return {string} The truncated message.
 */
function truncate(message) {
  if (message.length > MAX_MESSAGE_LENGTH) {
    message = message.slice(0, MAX_MESSAGE_LENGTH);
    message = message.slice(0, message.lastIndexOf(' ')) + '...';
  }
  return message;
}
