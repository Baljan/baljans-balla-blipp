//Background colors
var defaultBg = "#00aae4";
var redBg = "#820C0C";
var greenBg = "rgb(0, 165, 76)";
var yellowBg = "#edcb21";

//Animation times
var transitionTime = 300;
var errorDelay = 2300;
var successDelay = 2300;

//Text colors
var defaultColor = "#f70079";
var greenColor = "#00F771";
var redColor = "#FF2b2b";
var infoColor = "#333333";
var blackColor = "#000000";

var successSound = new Audio("sounds/success.wav");
var errorSound = new Audio("sounds/error.wav");

// ID of the reset timeout. Is used for detecting when success/failed screen is
//displayed and when to abort that if needed.
var resetTimeout = -1;
// Function that should be called when the reset has been done
var callAfterReset = null;

// Time of last blipp
var lastBlippTime = new Date().getTime();
var blippCooldown = 1000; // ms

var request = false;

//Never lose focus (by drinking a lot of coffee)
$(function () {
  $("#rfid").focus();
});
$("#rfid").blur(function(){
  $("#rfid").focus();
});

$(document).ready(function(){
  //Hide after load to ensure that the icons are loaded
  $("#icon-success, #icon-failure, #icon-warning").hide();
});

//When the scanner has written the rfid code
$("#form").submit(function (event) {
  var blippTime = new Date().getTime();

  if (blippTime - lastBlippTime >= blippCooldown) {
    // If the success / failed screen is active
    if(resetTimeout !== -1){
      clearTimeout(resetTimeout);
      resetBlipp();
    }

    var rfid = $("#rfid").val();

    console.log("Sending blipp request for id: " + rfid);

    var token = Cookies.get('token') || 'no-token';

    if (request) {
      request.abort();
    }

    request = $.ajax({
        url: "https://www.baljan.org/baljan/do-blipp",
        method: "POST",
        headers: {
            "Authorization": "Token " + token
        },
        data: { id : rfid },
        dataType: "json",
        success : successfulBlipp,
        error: failedBlipp
    });

    //Clear input
    $("#rfid").val("");
    $("#rfid").prop('disabled', true);
  }

    event.preventDefault();
    lastBlippTime = blippTime;
});

function successfulBlipp(data, textStatus){
  if(resetTimeout === -1){
    // Call instantly
    animation(data, textStatus, true);
  }
  else{
    // Wait to after the reset animation has finished
    callAfterReset = function(){
      animation(data, textStatus, true);
    }
  }
}

function failedBlipp(data, textStatus){
  var data = data.responseJSON;

  if(resetTimeout === -1){
    // Call instantly
    animation(data, textStatus, false);
  }
  else{
    // Wait to after the reset animation has finished
    callAfterReset = function(){
      animation(data, textStatus, false);
    }
  }
}

function animation(data, textStatus, successful) {
    // Some debugging
    console.log(`${successful ? "Succesful" : "Failed"} blipp with status: ${textStatus}`);

    var backgroundColor = null;
    var color = null;
    var elementId = null;
    var sound = null;
    var delay = null;

    switch (data.type) {
      case "success":
          backgroundColor = greenBg;
          color = greenColor;
          elementId = "#icon-success";
          sound = successSound;
          delay = successDelay;
          break;
      case "warning":
        backgroundColor = yellowBg;
        color = blackColor;
        elementId = "#icon-warning";
        sound = errorSound;
        delay = errorDelay;
        break;
      case "error":
      default:
        backgroundColor = redBg;
        color = redColor;
        elementId = "#icon-failure";
        sound = errorSound;
        delay = errorDelay;
        break;
    }

    // Play the sound
    sound.play();

    //Change the background color
    $("body").transition({backgroundColor: backgroundColor}, transitionTime, 'easeOutCubic');

    //Animate the icon
    $(elementId).show(0).transition({ opacity: 1 }, transitionTime, 'easeOutCubic');

    //Change the color of the main text to match the other text colors
    $("h1").transition({color: color}, transitionTime, 'easeOutCubic');
    $("#info-text").transition({color: color}, transitionTime);

    // Move all (most) content up
    $("#maindiv").transition({ y: '-28%' }, transitionTime, 'easeOutCubic', function(){
      $("#rfid").prop('disabled', false);
      $("#rfid").focus();
    });

    $("h2").css({color: color});

    if(data && data["message"]){
        $("#balance-message h2").html(data["message"]);
        $("#balance-message").show(0).transition({ opacity: 1 }, transitionTime, 'easeOutCubic');
    } else {
        $("#balance-message h2").text("Ett fel inträffade");
        $("#balance-message").show(0).transition({ opacity: 1 }, transitionTime);
    }

    resetTimeout = setTimeout(resetBlipp, delay);
}


function resetBlipp(){
  $("body").transition({backgroundColor: defaultBg}, transitionTime, 'easeOutCubic');
  $("#icon-success").transition({ opacity: 0 }, transitionTime, 'easeOutCubic').hide(0);
  $("#icon-failure").transition({ opacity: 0 }, transitionTime).hide(0);
  $("#icon-warning").transition({ opacity: 0 }, transitionTime).hide(0);
  $("h1").transition({color: defaultColor}, transitionTime, 'easeOutCubic');
  $("#info-text").transition({color: infoColor}, transitionTime, 'easeOutCubic');
  $("#maindiv").transition({ y: '0px' }, transitionTime, 'easeOutCubic');

  $("#balance-message").transition({ opacity: 0 }, transitionTime, function(){
    resetTimeout = -1;

    // Called when reset is completed
    if(callAfterReset){
      callAfterReset();
      callAfterReset = null;
    }
  });
}
