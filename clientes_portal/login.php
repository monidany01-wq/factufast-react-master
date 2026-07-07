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
$soloVerificar = $data["solo_verificar"] ?? false;

if ($soloVerificar) {
    if (empty($nit) || empty($correo)) {
        echo json_encode(["success" => false, "mensaje" => "Ingresa NIT y correo"]);
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
    $sinPassword = empty(trim($cliente["password"] ?? ""));

    echo json_encode([
        "success" => true,
        "sin_password" => $sinPassword
    ]);
    exit;
}

if (empty($nit) || empty($password)) {
    echo json_encode(["success" => false, "mensaje" => "Ingresa NIT y contraseña"]);
    exit;
}

$stmt = $conn->prepare("
    SELECT id_cliente, nit_cliente, nombre_cliente, password
    FROM tabla_cliente
    WHERE nit_cliente = ?
");
$stmt->bind_param("s", $nit);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["success" => false, "mensaje" => "Cliente no encontrado"]);
    exit;
}

$cliente = $res->fetch_assoc();

if (empty(trim($cliente["password"] ?? ""))) {
    echo json_encode([
        "success" => false,
        "mensaje" => "Primero debes crear tu contraseña"
    ]);
    exit;
}

if (!password_verify($password, $cliente["password"])) {
    echo json_encode(["success" => false, "mensaje" => "Contraseña incorrecta"]);
    exit;
}

echo json_encode([
    "success" => true,
    "id_cliente" => $cliente["id_cliente"],
    "nit" => $cliente["nit_cliente"],
    "nombre" => $cliente["nombre_cliente"]
]);

$conn->close();
?>