<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';
include_once '../models/item.php';

$database = new Database();
$db = $database->getConnection();

$item = new Item($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $item->id = $data->id;

    if ($item->delete()) {
        http_response_code(200);
        echo json_encode(array("message" => "Item was deleted."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete item."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to delete item. Missing ID."));
}
