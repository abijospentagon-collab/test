<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$db_file = dirname(__DIR__) . '/db.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($db_file)) {
        echo file_get_contents($db_file);
    } else {
        echo json_encode(["error" => "Database file not found"]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if ($data === null) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON payload"]);
        exit;
    }
    
    file_put_contents($db_file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(["success" => true, "message" => "State synchronized successfully"]);
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
