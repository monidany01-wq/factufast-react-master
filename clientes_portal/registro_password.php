<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "factufast");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "mensaje" => "Error de conexión"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$nit = $data["nit"] ?? "";
$correo = $data["correo"] ?? "";
$password = $data["password"] ?? "";

if (empty($nit) || empty($correo) || empty($password)) {
    echo json_encode(["success" => false, "mensaje" => "Todos los campos son obligatorios"]);
    exit;
}

$stmt = $conn->prepare("
    SELECT id_cliente, password
    FROM tabla_cliente
    WHERE nit_cliente = ? AND correo_cliente = ?
");
$stmt->bind_param("ss", $nit, $correo);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["success" => false, "mensaje" => "El NIT o correo no coinciden"]);
    exit;
}

$cliente = $res->fetch_assoc();

if (!empty(trim($cliente["password"] ?? ""))) {
    echo json_encode([
        "success" => false,
        "mensaje" => "Este cliente ya tiene contraseña. Usa iniciar sesión u olvidé mi contraseña."
    ]);
    exit;
}

$passwordHashed = password_hash($password, PASSWORD_BCRYPT);

$stmtUpdate = $conn->prepare("
    UPDATE tabla_cliente
    SET password = ?
    WHERE nit_cliente = ? AND correo_cliente = ?
");
$stmtUpdate->bind_param("sss", $passwordHashed, $nit, $correo);

echo json_encode([
    "success" => $stmtUpdate->execute(),
    "mensaje" => $stmtUpdate->execute()
        ? "Contraseña creada correctamente"
        : "No se pudo crear la contraseña"
]);

$conn->close();
?>