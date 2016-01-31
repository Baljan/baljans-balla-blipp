<?php
  class User {
    var $c;
    var $liu_id;
    var $uid;
    var $free_coffee;
    var $balance;

    function User($liu_id){
      //Set up the database connection
      $const = 'constant';
      $this->c = pg_connect("host={$const('DB_HOST')} dbname={$const('DB_NAME')} user={$const('DB_USER')} password={$const('DB_PWD')} connect_timeout=5");

      //Check that no error occured
      if(!$this->c){
        throw new DatabaseConnectionException('Bad DB connection.');
      }

      $this->liu_id = $liu_id;
    }

    function close(){
      pg_close($this->c);
    }

    function get_uid(){
      if(isset($this->uid)){
        return $this->uid;
      }

      //Get the uid from the liu_id
      $uid_array = pg_query_params($this->c, "SELECT u.id FROM auth_user u WHERE u.username=$1", array($this->liu_id));
      $uid = pg_fetch_array($uid_array);

      if (empty($uid)) {
        throw new UserNotFoundException('No user found with user id');
      }

      $this->uid = $uid["id"];

      return $this->uid;
    }

    function is_coffee_free(){
      if(isset($this->free_coffee){
        return $this->free_coffee;
      }

      //Get if the user should get the coffe for free
      $free_coffee_req = pg_query_params($this->c, "SELECT * FROM auth_user u INNER JOIN auth_user_groups ug ON ug.user_id=u.id INNER JOIN auth_group_permissions gp ON ug.group_id=gp.group_id WHERE u.id=$1 AND (gp.permission_id=174 OR gp.permission_id=175)", $this->get_uid());
      $this->free_coffee = (pg_num_rows($free_coffee_req) > 0);

      return $this->free_coffee;
    }

    function get_balance(){
      if(isset($this->balance){
        return $this->balance;
      }

      $baljan = pg_fetch_array(pg_query_params($this->c, "SELECT balance FROM baljan_profile WHERE user_id=$1", array($this->get_uid())));
      $this->balance = $baljan['balance'];

      return $this->balance;
    }

    function set_balance($new_balance){
      pg_query_params($this->c, "UPDATE baljan_profile SET balance=$1 WHERE user_id=$2", array($new_balance, $this->get_uid()));

      $this->balance = $new_balance;
    }

    function do_blipp($price){
      $date = new DateTime(null, new DateTimeZone('UTC'));
      $date_str = $date->format('Y-m-d H:i:s');

      //Free coffee
      if($this->is_coffee_free()){
        $price = 0;
      }
      else{
        $balance = $this->get_balance();
        if ($balance < $price) {
           throw new PaymentException('Insufficient funds.');
        }
        $new_balance = $balance - $price;
        $this->set_balance($new_balance);
      }

      //Put the order in the db
      $order = pg_query_params($this->c, "INSERT INTO baljan_order (made, put_at, user_id, paid, currency, accepted) VALUES ($1, $2, $3, $4, 'SEK', true) RETURNING id", array($date_str, $date_str, $this->get_uid(), $price));
      $order_good = pg_insert($this->c, "baljan_ordergood", array('made' => $date_str, 'order_id' => pg_fetch_array($order)['id'], 'good_id' => 1, 'count' => 1));
    }
  }

  class UserNotFoundException extends Exception { }
  class DatabaseConnectionException extends Exception { }
  class PaymentException extends Exception { }
?>
