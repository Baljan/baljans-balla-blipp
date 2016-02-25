//Background colors
var defaultBg = "#00aae4";
var redBg = "#820C0C";
var greenBg = "rgb(0, 165, 76)";

//Animation times
var transitionTime = 400;
var errorDelay = 2000;
var successDelay = 1200;

//Text colors
var defaultColor = "#f70079";
var greenColor = "#00F771";
var redColor = "#FF2b2b";

var successSound = new Audio("sounds/success.wav");
var errorSound = new Audio("sounds/error.wav");

//Never lose focus (by drinking a lot of coffee)
$(function () {
    $("#rfid").focus();
});
$("#rfid").blur(function(){
    $("#rfid").focus();
});

$(document).ready(function(){
  //Hide after load to ensure that the icons are loaded
  $("#icon-success, #icon-failure").hide();
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
    //Play success sound
    successSound.play();

    //Change the background color
    $("body").transition({backgroundColor: greenBg}, transitionTime)
        .delay(successDelay)
        .transition({backgroundColor: defaultBg}, transitionTime, function(){
            $("#rfid").prop('disabled', false);
            $("#rfid").focus();
        });

    //Animate the success icon
    $("#icon-success").show(0).transition({ opacity: 1 }, transitionTime, 'easeOutCubic')
        .delay(successDelay)
        .transition({ opacity: 0 }, transitionTime, 'easeOutCubic').hide(0);

    //Change the color of the main text to match the other text colors
    $("h1").transition({color: greenColor}, transitionTime, 'easeOutCubic')
        .delay(successDelay)
        .transition({color: defaultColor}, transitionTime, 'easeOutCubic');

    $("#maindiv").transition({ y: '-300px' }, transitionTime, 'easeOutCubic')
      .delay(successDelay)
      .transition({ y: '0px' }, transitionTime, 'easeOutCubic')

    $("h2").css({color: greenColor});

    if(data["message"]){
        $("#balance-message h2").text(data["message"]);
        $("#balance-message").show(0).transition({ opacity: 1 }, transitionTime, 'easeOutCubic')
            .delay(successDelay)
            .transition({ opacity: 0 }, transitionTime, 'easeOutCubic');
    }

    console.log("Successful blipp with status: " + textStatus);
};

function failedBlipp(data, textStatus){
    //Play error sound
    errorSound.play();

    var data = data.responseJSON;

    //Change the background color
    $("body").transition({backgroundColor: redBg}, transitionTime)
        .delay(errorDelay)
        .transition({backgroundColor: defaultBg}, transitionTime, function(){
            $("#rfid").prop('disabled', false);
            $("#rfid").focus();
        });

    //Change the color of the main text to match the other text colors
    $("h1").transition({color: redColor}, transitionTime)
        .delay(errorDelay)
        .transition({color: defaultColor}, transitionTime);

    //Animate the error icon
    $("#icon-failure").show(0).transition({ opacity: 1 }, transitionTime)
        .delay(errorDelay)
        .transition({ opacity: 0 }, transitionTime).hide(0);


    $("#maindiv").transition({ y: '-300px' }, transitionTime)
      .delay(errorDelay)
      .transition({ y: '0px' }, transitionTime)

    //Change the color of the main text to match the other text colors
    $("h2").css({color: redColor});

    if(data["message"]){
        $("#balance-message h2").text(data["message"]);
        $("#balance-message").show(0).transition({ opacity: 1 }, transitionTime)
            .delay(errorDelay)
            .transition({ opacity: 0 }, transitionTime);
    }

    console.log("Failed blipp with status: " + textStatus);
};
