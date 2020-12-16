<?php
include_once './dal/dbcontext.php';
include_once 'backtools.php';
include_once 'router.php';
include_once 'api.php';

/**
 * Main application controller class
 */
class App {

    // Current App configuration
    public $config;
    public $debug;

    // Actual Data-Layout provider
    private $DBC;

    // Additional data
    public $appName;
    public $appIcon;

    /**
     * Starts once at App bootstrap.
     * Check enviropment, init modules
     */
    public function init($_config) {
        // apply configuration
        $this->config = $_config;
        $this->debug = $_config['dev_debug'];

        // init special parametrs
        $this->appName =  $_config['site_title'];
        $this->appIcon = $_config['site_icon'];

        // init URL_routing
        $this->initRouter();

        // init inner members
        // BackTools::dev_dump($this, true);
        $this->initDAL();
    }

    /**
     * Define app url-mapping
     */
    private function initRouter() {
        // -> /form/...

        // -> /api/...     
        // API routing, AJAX endpoints
        Router::route('/api/(\w+)/(\w+)/(\w+)', function( $model, $data1, $data2 ) {
            $api = new ApiController();
            $api->init($this->DBC);
            $api->process($model, $data1, $data2);
            die();
        });
    }

    /**
     * Main App data-layout connections
     */
    private function initDAL() {
        // Mind that config values is already added
        $dbcInstance = new dbContext();
        $dbcInstance->init(
            $this->config['db_host'],
            $this->config['db_user'],
            $this->config['db_pass'],
            $this->config['db_name']
        );
        
        // Check DAL initialization
        if ($dbcInstance->isInited()) {
            // New DAL created
            // set it as static instance
            $this->DBC = $dbcInstance;
        } else {
            BackTools::DieHTTP500('Fail with DAL initialization');   
        }

        // DAL succesfully created
        return $this->DBC;
    }
    

    /**
     * Snj: main request processing hub is heare:
     */
    public function run() {

        /**
         * Snj: process request using Router fot separate processing
         *      - Primary route returns static content
         *      - Routing attached to API queries
         */
        Router::execute($_SERVER['REQUEST_URI']);

        /*
         * Render static wrapper for Front-end app
         */
        $this->wrapper();
    }


    /**
     * Snj: returns static HTML wrapper with Front-end App scripts
     */
    public function wrapper() {
        $wrapper = file_get_contents( _ROOT_ . $this->config['front_wrapper'] );
        $apiurl = $this->config['api_base_url'];

        echo "
            <script>
                window._frontConfig = {
                    apiBaseUrl: '$apiurl',
                    lumiService: '12025408120',
                };
            </script>
            $wrapper
            ";
    }

}