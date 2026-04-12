<?php

require_once __DIR__ . '/config.php';

cors_headers(['GET']);
authenticate();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method Not Allowed"]);
    exit;
}

$pdo = get_db();
try {
    $stmt = $pdo->query(
        "SELECT clientid FROM clients
         WHERE renewal_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 21 DAY)
         ORDER BY renewal_date, clientid"
    );
    $clients = $stmt->fetchAll(PDO::FETCH_COLUMN);
    // Cast to strings to match the format the extension expects
    echo json_encode(array_map('strval', $clients));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
