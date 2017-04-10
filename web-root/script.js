//Background colors
var defaultBg = "#00aae4";
var redBg = "#820C0C";
var greenBg = "rgb(0, 165, 76)";

//Animation times
var transitionTime = 300;
var errorDelay = 2300;
var successDelay = 2300;

//Text colors
var defaultColor = "#f70079";
var greenColor = "#00F771";
var redColor = "#FF2b2b";

var successSound = new Audio("sounds/success.wav");
var errorSound = new Audio("sounds/error.wav");

// ID of the reset timeout. Is used for detecting when success/failed screen is
//displayed and when to abort that if needed.
var resetTimeout = -1;
// Function that should be called when the reset has been done
var callAfterReset = null;

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
    // If the success / failed screen is active
    if(resetTimeout !== -1){
      clearTimeout(resetTimeout);
      resetBlipp();
    }

    var rfid = parseInt($("#rfid").val());

    console.log("Sending blipp request for id: " + rfid);

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
    $("#rfid").prop('disabled', true);

    event.preventDefault();
});

function successfulBlipp(data, textStatus){
  if(resetTimeout === -1){
    // Call instantly
    successfulAnimation(data, textStatus);
  }
  else{
    // Wait to after the reset animation has finished
    callAfterReset = function(){
      successfulAnimation(data, textStatus);
    }
  }
}

function failedBlipp(data, textStatus){
  if(resetTimeout === -1){
    // Call instantly
    failedAnimation(data, textStatus);
  }
  else{
    // Wait to after the reset animation has finished
    callAfterReset = function(){
      failedAnimation(data, textStatus);
    }
  }
}

function successfulAnimation(data, textStatus) {
    // Some debugging
    console.log("Successful blipp with status: " + textStatus);

    //Play success sound
    successSound.play();

    //Change the background color
    $("body").transition({backgroundColor: greenBg}, transitionTime, 'easeOutCubic');

    //Animate the success icon
    $("#icon-success").show(0).transition({ opacity: 1 }, transitionTime, 'easeOutCubic');

    //Change the color of the main text to match the other text colors
    $("h1").transition({color: greenColor}, transitionTime, 'easeOutCubic');

    // Move all (most) content up
    $("#maindiv").transition({ y: '-30%' }, transitionTime, 'easeOutCubic', function(){
      $("#rfid").prop('disabled', false);
      $("#rfid").focus();
    });

    $("h2").css({color: greenColor});

    if(data["message"]){
        $("#balance-message h2").html(data["message"]);
        $("#balance-message").show(0).transition({ opacity: 1 }, transitionTime, 'easeOutCubic');
    }

    resetTimeout = setTimeout(resetBlipp, successDelay);
}

function failedAnimation(data, textStatus){
    // Some debuging
    console.log("Failed blipp with status: " + textStatus);

    //Play error sound
    errorSound.play();

    var data = data.responseJSON;

    //Change the background color
    $("body").transition({backgroundColor: redBg}, transitionTime);

    //Change the color of the main text to match the other text colors
    $("h1").transition({color: redColor}, transitionTime);

    //Animate the error icon
    $("#icon-failure").show(0).transition({ opacity: 1 }, transitionTime);

    // Move all (most) content up
    $("#maindiv").transition({ y: '-22%' }, transitionTime, function(){
      $("#rfid").prop('disabled', false);
      $("#rfid").focus();
    });

    //Change the color of the main text to match the other text colors
    $("h2").css({color: redColor});

    if(data["message"]){
        $("#balance-message h2").text(data["message"]);
        $("#balance-message").show(0).transition({ opacity: 1 }, transitionTime);
    }

    resetTimeout = setTimeout(resetBlipp, errorDelay);
}

function resetBlipp(){
  $("body").transition({backgroundColor: defaultBg}, transitionTime, 'easeOutCubic');
  $("#icon-success").transition({ opacity: 0 }, transitionTime, 'easeOutCubic').hide(0);
  $("#icon-failure").transition({ opacity: 0 }, transitionTime).hide(0);
  $("h1").transition({color: defaultColor}, transitionTime, 'easeOutCubic');
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
