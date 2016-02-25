<?php
  require_once("settings.php");
  require_once("user.php");
  require_once("rfid_converter.php");
  header('Content-Type: application/json; charset=utf-8');

  $price = 6;

  try {
    $rfid = $_POST['id'];
    if (empty($rfid) || !is_numeric($rfid)) {
       throw new UserNotFoundException('Bad or no ID sent');
    }

    // Create the user object
    $liuid = get_liuid($rfid);

    $user = new User($liuid);
    $user->do_blipp($price);

    header($_SERVER["SERVER_PROTOCOL"]." 202 Accepted");

    if($user->is_coffee_free()){
      echo json_encode(array('message' => 'Du har ∞ kr kvar att blippa för.', 'balance' => 'unlimited'));
    }
    else{
      echo json_encode(array('message' => 'Du har ' + $user->get_balance() + ' kr kvar att blippa för', 'balance' => $user->get_balance()));
    }

    $user->close();
  }
  //Error handling
  catch (UserNotFoundException $e) {
    header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
    echo json_encode(array('message' => "Felaktigt användar-id"));
    exit;
  }
  catch (DatabaseConnectionException $e) {
    header($_SERVER["SERVER_PROTOCOL"]." 500 Internal Server Error");
    echo json_encode(array('message' => "Kunde inte ansluta till databasen"));
    exit;
  }
  catch (PaymentException $e) {
    header($_SERVER["SERVER_PROTOCOL"]." 402 Payment Required");
    echo json_encode(array('message' => "Du har för lite pengar för att blippa"));
    exit;
  }
  catch (Exception $e) {
    header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
    echo json_encode(array('message' => $e->getMessage()));
    exit;
  }
?>
