function updateSpreadsheet(durationsArray, date) {
  var spreadsheetId = '1SUjssEx1ZJhYLLA0msE59Z_nJR1A4agV8WNy3vcmhi4';
  var sheet = Sheets.Spreadsheets.get(spreadsheetId);
  var range = 'Weekly Calendar Data!A:E';

  // Create an array [Date, category0Duration, category1Duration, category2Duration, ...]
  var dateReformated = Utilities.formatDate(date, "GMT-8", "MM/dd/yyyy");
  var d = [dateReformated];
  var categoryDurations = [d.concat(durationsArray)];

  // Create valueRange object using the category durations array
  var valueRange = Sheets.newRowData();
  valueRange.values = categoryDurations;
  Logger.log(valueRange)

  // Make request to append a new row 
  var appendRequest = Sheets.newAppendCellsRequest();
  appendRequest.sheetId = spreadsheetId;
  appendRequest.rows = [valueRange];

  // Append a new row (next available row) using the category durations array
  var result = Sheets.Spreadsheets.Values.append(valueRange, spreadsheetId, range, {
    valueInputOption: 'RAW'
  });

};

function getCategoriesDict(){
  var spreadsheetId = '1SUjssEx1ZJhYLLA0msE59Z_nJR1A4agV8WNy3vcmhi4';
  var rangeName = 'Categories!A:L';
  var getData = Sheets.Spreadsheets.Values.get(spreadsheetId, rangeName).values;
  var keys = getData[0];
  var values = getData.slice(1);
  
  // **Figure out a better way to map array of arrays to dict**
  var dict_data = {};
  for (i = 0; i < keys.length; i++){
    var key = keys[i];
    dict_data[key] = [];
    for (n = 0; n < values.length; n++){
      if (!values[n][i]){
        // dict_data[key].push(null);
        continue
      } else {
      dict_data[key].push(values[n][i])
      }
    }
  }
  Logger.log(dict_data);
  return dict_data;
}