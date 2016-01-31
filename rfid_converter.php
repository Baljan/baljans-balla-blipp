<?php
  require_once("settings.php");
  function get_liuid($rfid){
    $ch = curl_init(API_URL);
    curl_setopt($ch,CURLOPT_USERPWD, API_USERPWD);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, "rfid_number=".$rfid);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER ,1);
    curl_setopt($ch, CURLOPT_SSL_CIPHER_LIST, 'TLSv1');
    $user = json_decode(curl_exec($ch),true);

    if (empty($user)) {
       throw new Exception("Can't find a user with rfid number: ".$rfid);
    }

    return $user['liu_id'];
  }
?>
