<?php
  require_once("settings.php");
  function get_liuid($rfid){
    $ch = curl_init(API_URL.$rfid."/");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Authorization: Token ".API_TOKEN));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $user = json_decode(curl_exec($ch), true);

    if (empty($user)) {
      throw new Exception("Can't find a user with rfid number: ".$rfid);
    }

    return $user['liu_id'];
  }
?>
