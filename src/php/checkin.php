<?php

require_once __DIR__ . '/config.php';

cors_headers(['POST']);
authenticate();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method Not Allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$clientid     = $data['clientid']     ?? null;
$session_date = $data['session_date'] ?? null;

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

$pdo = get_db();

try {
    // Ensure the client exists (required by the FK constraint)
    $stmt = $pdo->prepare("INSERT IGNORE INTO clients (clientid) VALUES (?)");
    $stmt->execute([$clientid]);

    // Record the check-in
    $stmt = $pdo->prepare(
        "INSERT INTO checkins (clientid, session_date, submission_date) VALUES (?, ?, NOW())"
    );
    $stmt->execute([$clientid, $session_date]);

    echo json_encode(["success" => "Check-in recorded successfully"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
