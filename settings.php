<?php
// API Settings
define("API_URL", "https://kobra.karservice.se/api/v1/students/");
define("API_TOKEN", getenv('KOBRA_API_TOKEN'));

// Cafesys Database Settings
define("DB_HOST", getenv('CAFESYS_DB_HOST'));
define("DB_NAME", getenv('CAFESYS_DB_NAME'));
define("DB_USER", getenv('CAFESYS_DB_USER'));
define("DB_PWD", getenv('CAFESYS_DB_PASSWORD'));
?>
