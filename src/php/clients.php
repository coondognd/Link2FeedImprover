<?php

require_once __DIR__ . '/config.php';

cors_headers(['GET', 'POST']);
authenticate();

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Return all client IDs
    $pdo = get_db();
    try {
        $stmt = $pdo->query("SELECT clientid FROM clients ORDER BY clientid");
        $clients = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode($clients);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }

} elseif ($method === 'POST') {
    // Upsert a client (used by the bot to store renewal/last_visit data)
    $data = json_decode(file_get_contents("php://input"), true);
    $clientid = $data['clientid'] ?? null;

    if (!filter_var($clientid, FILTER_VALIDATE_INT)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid client ID"]);
        exit;
    }

    $renewal_date = $data['renewal_date'] ?? null;
    $last_visit   = $data['last_visit']   ?? null;

    if ($renewal_date !== null && !DateTime::createFromFormat('Y-m-d', $renewal_date)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid renewal_date format. Use YYYY-MM-DD."]);
        exit;
    }
    if ($last_visit !== null && !DateTime::createFromFormat('Y-m-d', $last_visit)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid last_visit format. Use YYYY-MM-DD."]);
        exit;
    }

    $pdo = get_db();
    try {
        $stmt = $pdo->prepare(
            "INSERT INTO clients (clientid, renewal_date, last_visit)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE
               renewal_date = COALESCE(VALUES(renewal_date), renewal_date),
               last_visit   = COALESCE(VALUES(last_visit),   last_visit),
               updated      = NOW()"
        );
        $stmt->execute([$clientid, $renewal_date, $last_visit]);
        echo json_encode(["success" => "Client upserted"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }

} else {
    http_response_code(405);
    echo json_encode(["error" => "Method Not Allowed"]);
}
