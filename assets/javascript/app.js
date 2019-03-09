// Initialize Firebase
var config = {
    apiKey: "AIzaSyCB7CdRo9rxdSbMqqTpibypqdgCI20bUoU",
    authDomain: "choo-choo-dc736.firebaseapp.com",
    databaseURL: "https://choo-choo-dc736.firebaseio.com",
    projectId: "choo-choo-dc736",
    storageBucket: "choo-choo-dc736.appspot.com",
    messagingSenderId: "878212607455"
};
firebase.initializeApp(config);

var database = firebase.database();
var trains = [];
var trainNum = 0;

$("#add-train-btn").on("click", function (event) {
    event.preventDefault();

    var trainName = $("#train-name-input").val().trim();
    var destination = $("#destination-input").val().trim();
    var startTime = $("#train-time-input").val().trim();
    var frequency = $("#frequency-input").val().trim();


    var newTrain = {
        trainName: trainName,
        destination: destination,
        startTime: startTime,
        frequency: frequency
    };

    database.ref().push(newTrain);

    // Clears all of the text-boxes
    $("#train-name-input").val("");
    $("#destination-input").val("");
    $("#train-time-input").val("");
    $("#frequency-input").val("");
});


// One solution for updating the next arrival and minutes away is to clear the tdbody and reload all the data
// var everyMinute = setInterval(function () {
//     $("#train-table > tbody").empty();
//     database.ref().once('value', function(snapshot) {
//         snapshot.forEach(function (childSnapshot) {
//             writeRow(childSnapshot);
//            });
//       });
// }, 60000)

//Other option is to loop thorugh and update two fields
var everyMinute = setInterval(function () {
        for (var x = 0; x < trains.length; x++){
            var minutesAway = calcMinutesAway (trains[x].startTime, trains[x].frequency);
            if (minutesAway > trains[x].frequency) {
                var nextArrival = moment(trains[x].startTime, "HH:mm");
            } else {
                var nextArrival = moment().add(minutesAway, "minutes");
            }
            

            $("#trainNA-" + x).text(nextArrival.format("HH:mm"));
            $("#trainMA-" + x).text(minutesAway);
        }
    }, 60000);


function calcMinutesAway (startTime, frequency) {
    var currentTime = moment();
    var startTimeOld = moment(startTime, "HH:mm");

    if (currentTime.isBefore(startTimeOld)){
        var minutesAway = startTimeOld.diff(moment(currentTime), "minutes");
    } else {
        // startTimeOld = moment(startTime, "HH:mm").subtract(1, "years");
        var diffTime = currentTime.diff(moment(startTimeOld), "minutes");
        var tRemainder = diffTime % frequency;
        var minutesAway = frequency - tRemainder;
    }

    return (minutesAway);
}

function writeRow(childSnapshot) {

    var trainName = childSnapshot.val().trainName;
    var destination = childSnapshot.val().destination;
    var startTime = childSnapshot.val().startTime;
    var frequency = childSnapshot.val().frequency;

    var minutesAway = calcMinutesAway (startTime, frequency);
    
    if (minutesAway > frequency) {
        var nextArrival = moment(startTime, "HH,mm");
    } else {
        var nextArrival = moment().add(minutesAway, "minutes");
    }
    

    // Create the new row
    var tdTN = $("<td>");
    var tdD = $("<td>");
    var tdF = $("<td>");
    var tdNA = $("<td>");
    var tdMA = $("<td>");

    tdTN.text(trainName);
    tdD.text(destination);
    tdF.text(frequency);
    tdNA.text(nextArrival.format("HH:mm"));
    tdMA.text(minutesAway);

    tdF.css("text-align", "right");
    tdNA.css("text-align", "right");
    tdMA.css("text-align", "right");

    tdNA.attr("id","trainNA-" + trainNum);
    tdMA.attr("id","trainMA-" + trainNum);

    var newRow = $("<tr>")

    newRow.append(tdTN, tdD, tdF, tdNA, tdMA);

    // Append the new row to the table
    $("#train-table > tbody").append(newRow);

    trains.push({
        startTime: startTime,
        frequency: frequency,
    })

    trainNum++
}


database.ref().on("child_added", function (childSnapshot) {
    writeRow(childSnapshot)
});



