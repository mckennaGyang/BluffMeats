<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';
include_once '../models/item.php';

$database = new Database();
$db = $database->getConnection();

$item = new Item($db);
$stmt = $item->read();
$num = $stmt->rowCount();

if ($num > 0) {
    $items_arr = array();
    $items_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $item_obj = array(
            "id" => $id,
            "name" => $name,
            "description" => $description,
            "price" => $price,
            "stock_level" => $stock_level,
            "category" => $category,
            "image_url" => $image_url
        );

        array_push($items_arr["records"], $item_obj);
    }

    http_response_code(200);
    echo json_encode($items_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No items found."));
}
