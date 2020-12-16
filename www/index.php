<?php 
// Snj: Main App endpoint
// phpinfo();die();
define("_ROOT_", __DIR__);
include_once 'app/app.php';
include_once 'app/backtools.php';

// Snj: read config settings to global variable
$_config = include_once('app/config.php');
// BackTools::dev_dump($_config, true);
// If no configuration - do nothink
if (empty($_config)) {
    BackTools::DieHTTP500('Configuration reading filed');
}

// Manage logging:
// show errors only in Debug mode
if ($_config['dev_debug']) {
    ini_set('display_errors', 1); 
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0); 
    error_reporting(0);
}



// Snj: initialization of an App instance
$_app = new App();
$initError = $_app->init($_config);

// Try to init App, do nothink if errors
if (isset($initError)) {
    BackTools::dev_dump($initError, true);
    BackTools::DieHTTP500('App initialization filed');
}

try {

    // Execute App-controller actions:
    $_app->run();

} catch (Exception $e) { 
    BackTools::DieHTTP500($e->getMessage()); 
}