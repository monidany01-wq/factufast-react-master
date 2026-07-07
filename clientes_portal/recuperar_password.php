<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

$conn = new mysqli("localhost", "root", "", "factufast");

if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "mensaje" => "Error de conexión con la base de datos"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$nit = $data["nit"] ?? "";
$correo = $data["correo"] ?? "";
$password = $data["password"] ?? "";

if (empty($nit) || empty($correo) || empty($password)) {
    echo json_encode([
        "success" => false,
        "mensaje" => "Todos los campos son obligatorios"
    ]);
    exit;
}

$stmtCheck = $conn->prepare("
    SELECT id_cliente, password
    FROM tabla_cliente
    WHERE nit_cliente = ?
      AND correo_cliente = ?
");

$stmtCheck->bind_param("ss", $nit, $correo);
$stmtCheck->execute();
$resCheck = $stmtCheck->get_result();

if ($resCheck->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "mensaje" => "El NIT o el correo ingresado no coinciden con nuestros registros"
    ]);

    $stmtCheck->close();
    $conn->close();
    exit;
}

$cliente = $resCheck->fetch_assoc();
$stmtCheck->close();

if ($cliente["password"] === null || trim($cliente["password"]) === "") {
    echo json_encode([
        "success" => false,
        "mensaje" => "Este usuario aún no ha creado una contraseña. Debe usar la opción Crear contraseña primero."
    ]);

    $conn->close();
    exit;
}

$passwordHashed = password_hash($password, PASSWORD_BCRYPT);

$stmtUpdate = $conn->prepare("
    UPDATE tabla_cliente
    SET password = ?
    WHERE nit_cliente = ?
      AND correo_cliente = ?
");

$stmtUpdate->bind_param("sss", $passwordHashed, $nit, $correo);

if ($stmtUpdate->execute()) {
    echo json_encode([
        "success" => true,
        "mensaje" => "Contraseña actualizada correctamente"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "mensaje" => "No se pudo actualizar la contraseña"
    ]);
}

$stmtUpdate->close();
$conn->close();
?>