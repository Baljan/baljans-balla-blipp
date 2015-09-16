<?php
require("settings.php");
header('Content-Type: application/json');

$id = $_POST['id'];
if (empty($id) || !is_numeric($id)) {
   header($_SERVER["SERVER_PROTOCOL"]." 400 Bad Request");
   echo json_encode(array('message' => 'Bad or no ID sent'));
   exit;
}

$ch = curl_init(API_URL);
curl_setopt($ch,CURLOPT_USERPWD, API_USERPWD);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, "rfid_number=".$id);
curl_setopt($ch, CURLOPT_RETURNTRANSFER ,1);
curl_setopt($ch, CURLOPT_SSL_CIPHER_LIST, 'TLSv1');
$user = json_decode(curl_exec($ch),true);

if (empty($user)) {
   header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
   echo json_encode(array('message' => 'No user found with RFID'));
   exit;
}

$const = 'constant';
$c = pg_connect("host={$const('DB_HOST')} dbname={$const('DB_NAME')} user={$const('DB_USER')} password={$const('DB_PWD')} connect_timeout=5");

if (!$c) {
   echo "An error occurred.\n";
   header($_SERVER["SERVER_PROTOCOL"]." 500 Internal Server Error");
   echo json_encode(array('message' => 'Bad DB connection'));
   exit;
}

$uid_array = pg_query_params($c, "SELECT u.id FROM auth_user u WHERE u.username=$1", array($user['liu_id']));
$uid = pg_fetch_array($uid_array);

if (empty($uid)) {
   header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
   echo json_encode(array('message' => 'No user found with user id'));
   exit;
}

$uid = $uid['id'];
$free_coffee = pg_query_params($c, "SELECT * FROM auth_user u INNER JOIN auth_user_groups ug ON ug.user_id=u.id INNER JOIN auth_group_permissions gp ON ug.group_id=gp.group_id WHERE u.id=$1 AND (gp.permission_id=174 OR gp.permission_id=175)", array($uid));

$date = new DateTime(null, new DateTimeZone('UTC'));
$date_str = $date->format('Y-m-d H:i:s');

if (pg_num_rows($free_coffee) > 0) {
   // Free
   $order = pg_query_params($c, "INSERT INTO baljan_order (made, put_at, user_id, paid, currency, accepted) VALUES ($1, $2, $3, 0, 'SEK', true) RETURNING id", array($date_str, $date_str, $uid));
   $order_good = pg_insert($c, "baljan_ordergood", array('made' => $date_str, 'order_id' => pg_fetch_array($order)['id'], 'good_id' => 1, 'count' => 1));
   header($_SERVER["SERVER_PROTOCOL"]." 202 Accepted");
   echo json_encode(array('message' => 'Free coffee order has been put'));
}
else {
   // Pay
   $baljan = pg_fetch_array(pg_query_params($c, "SELECT balance FROM baljan_profile WHERE user_id=$1", array($uid)));
   if ($baljan['balance'] < 5) {
      header($_SERVER["SERVER_PROTOCOL"]." 402 Payment Required");
      echo json_encode(array('message' => 'Insufficient funds'));
      exit;
   }
   $new_balance = $baljan['balance'] - 5;
   $order = pg_query_params($c, "INSERT INTO baljan_order (made, put_at, user_id, paid, currency, accepted) VALUES ($1, $2, $3, 5, 'SEK', true) RETURNING id", array($date_str, $date_str, $uid));
   $order_good = pg_insert($c, "baljan_ordergood", array('made' => $date_str, 'order_id' => pg_fetch_array($order)['id'], 'good_id' => 1, 'count' => 1));
   pg_query_params($c, "UPDATE baljan_profile SET balance=$1 WHERE user_id=$2", array($new_balance, $uid));
   header($_SERVER["SERVER_PROTOCOL"]." 202 Accepted");
   echo json_encode(array('message' => 'Coffee order has been put', 'balance' => $new_balance));
}


pg_close($c);


?>
