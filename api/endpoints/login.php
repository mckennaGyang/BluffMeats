<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';
include_once '../models/user.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $user->email = $data->email;
    $stmt = $user->login();
    
    if ($stmt && $stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Direct password comparison instead of using password_verify
        if ($data->password === $row['password']) {
            http_response_code(200);
            echo json_encode(
                array(
                    "message" => "Successful login.",
                    "user" => array(
                        "id" => $row['id'],
                        "name" => $row['name'],
                        "email" => $user->email,
                        "role" => $row['role']
                    )
                )
            );
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Login failed. Invalid password."));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Login failed. User not found."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Email and password are required."));
}