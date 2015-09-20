//Background colors
var defaultBg = "#00aae4";
var redBg = "#820C0C";
var greenBg = "rgb(0, 165, 76)";

//Animation times
var transitionTime = 300;
var errorDelay = 1500;
var successDelay = 1000;

//Text colors
var defaultColor = "#f70079";
var greenColor = "#00F771";
var redColor = "#FF2b2b";

//Never lose focus (by drinking a lot of coffee)
$(function () {
    $("#rfid").focus();
});
$("#rfid").blur(function(){
    $("#rfid").focus();
});

//When the scanner has written the rfid code
$("#form").submit(function (event) {
    var rfid = parseInt($("#rfid").val());
    $("#rfid").prop('disabled', true);
    console.log("Sending blipp request for id: "+rfid);

    var request = $.ajax({
        url: "callback.php",
        method: "POST",
        data: { id : rfid },
        dataType: "json",
        success : successfulBlipp,
        error: failedBlipp
    });

    //Clear input
    $("#rfid").val("");

    event.preventDefault();
});

function successfulBlipp(data, textStatus) {
    var balance = data["balance"];

    //Change the background color
    $("body").animate({backgroundColor: greenBg}, transitionTime)
        .delay(successDelay)
        .animate({backgroundColor: defaultBg}, transitionTime, function(){
            $("#rfid").prop('disabled', false);
            $("#rfid").focus();
        });

    //Animate the success icon
    $("#icon-success").fadeIn(transitionTime)
        .delay(successDelay)
        .fadeOut(transitionTime);

    //Change the color of the main text to match the other text colors
    $("h1").animate({color: greenColor}, transitionTime)
        .delay(successDelay)
        .animate({color: defaultColor}, transitionTime);

    //Show the balance for normal users
    if(!isNaN(balance)){
        $("#balance-message").text("Du har " + balance + " kr kvar att blippa för.")
            .fadeIn(transitionTime)
            .delay(successDelay)
            .fadeOut(transitionTime);
    }
    //Show text for free coffee users
    else if(balance == 'unlimited'){
        $("#balance-message").html("Du har <b>∞</b> kr kvar att blippa för.")
            .fadeIn(transitionTime)
            .delay(successDelay)
            .fadeOut(transitionTime);
    }

    console.log("Successful blipp with status: " + textStatus);
};

function failedBlipp(data, textStatus){
    //Change the background color
    $("body").animate({backgroundColor: redBg}, transitionTime)
        .delay(errorDelay)
        .animate({backgroundColor: defaultBg}, transitionTime, function(){
            $("#rfid").prop('disabled', false);
            $("#rfid").focus();
        });

    //Change the color of the main text to match the other text colors
    $("h1").animate({color: redColor}, transitionTime)
        .delay(errorDelay)
        .animate({color: defaultColor}, transitionTime);

    //Animate the error icon
    $("#icon-failure").fadeIn(transitionTime)
        .delay(errorDelay)
        .fadeOut(transitionTime);

    console.log("Failed blipp with status: " + textStatus);
};
