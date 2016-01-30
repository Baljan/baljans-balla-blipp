<?php
  require("settings.php");
  require("user.php");
  require("rfid_converter.php");
  header('Content-Type: application/json');

  $price = 5;

  $rfid = $_POST['id'];
  if (empty($rfid) || !is_numeric($rfid)) {
     header($_SERVER["SERVER_PROTOCOL"]." 400 Bad Request");
     echo json_encode(array('message' => 'Bad or no ID sent'));
     exit;
  }

  // Convert rfid to liuid
  $liuid = "";
  try{
    $liuid = get_liuid($rfid);
  }
  catch (Exception $e) {
    header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
    echo json_encode(array('message' => $e->getMessage());
    exit;
  }

  // Create the user object
  $user;
  try{
    $user = new User($liuid);
    $user->do_blipp($price);

    header($_SERVER["SERVER_PROTOCOL"]." 202 Accepted");

    if($user->is_coffee_free()){
      echo json_encode(array('message' => 'Free coffee order has been put', 'balance' => 'unlimited'));
    }
    else{
      echo json_encode(array('message' => 'Coffee order has been put', 'balance' => $user->get_balance()));
    }

    $user->close();
  }
  catch (Exception $e) {
    header($_SERVER["SERVER_PROTOCOL"]." 500 Internal Server Error");
    echo json_encode(array('message' => $e->getMessage());
    exit;
  }
?>
