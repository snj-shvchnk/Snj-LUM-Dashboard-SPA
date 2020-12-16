<?php
class Router
{
    // массив для хранения соответствия url => функция
    private static $routes = array();
   
    // запрещаем создание и копирование статического объекта
    private function __construct() {}
    private function __clone() {}
   
    public static function route($pattern, $callback)
    {
        // функция str_replace здесь нужна, для экранирования всех прямых слешей
        // так как они используются в качестве маркеров регулярного выражения
        $pattern = '/^' . str_replace('/', '\/', $pattern) . '$/';
        self::$routes[$pattern] = $callback;
    }
   
    // данный метод проверяет запрошенный $url(адрес) на
    // соответствие адресам, хранящимся в массиве $routes
    public static function execute($url)
    {
        $url = '/'.trim( strtolower( trim($url) ) ,'/');
        foreach (self::$routes as $pattern => $callback)
        {
            if (preg_match($pattern, $url, $params)) // сравнение идет через регулярное выражение
            {
                // соответствие найдено, поэтому удаляем первый элемент из массива $params
                // который содержит всю найденную строку
                array_shift($params);
                return call_user_func_array($callback, array_values($params));
            }
        }
    }
}



//  // Homepage without URL
//  Router::route('/', function(){
//     print 'Home page';
//   });
  
//   // Inner pages like google.com/blog/cats/12091983
//   Router::route('blog/(\w+)/(\d+)', function($category, $id){
//     print $category . ':' . $id;
//   });
  
//   // Run router on script execution
//   Router::execute($_SERVER['REQUEST_URI']);