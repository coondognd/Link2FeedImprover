<?php

// Hardcoding, since composer is a pain to set up
$DB_HOST = 'localhost';
$DB_NAME = 'removed';
$DB_USER = 'removed';
$DB_PASS = 'removed';
$API_USER = 'removed';
$API_PASS = 'removed';

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit;
}

// Basic Authentication
if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW']) ||
    $_SERVER['PHP_AUTH_USER'] !== $API_USER || $_SERVER['PHP_AUTH_PW'] !== $API_PASS) {
    header('WWW-Authenticate: Basic realm="Restricted Area"');
    header('HTTP/1.0 401 Unauthorized');
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

header('Content-Type: application/json');

// Validate request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method Not Allowed"]);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

$clientid = $data['clientid'] ?? null;
$session_date = $data['session_date'] ?? null;

// Validate inputs
if (!filter_var($clientid, FILTER_VALIDATE_INT)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid client ID"]);
    exit;
}

if (!DateTime::createFromFormat('Y-m-d', $session_date)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid session date format. Use YYYY-MM-DD."]);
    exit;
}

// Database connection
try {
    $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8", $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// Insert check-in record
try {
    $stmt = $pdo->prepare("INSERT INTO checkins (clientid, session_date, submission_date) VALUES (?, ?, NOW())");
    $stmt->execute([$clientid, $session_date]);
    echo json_encode(["success" => "Check-in recorded successfully"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
