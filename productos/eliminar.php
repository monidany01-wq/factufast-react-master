<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = intval($data["id"] ?? 0);

if(!$id){
    echo json_encode(["success"=>false, "error"=>"ID de producto requerido"]);
    exit;
}

$relatedChecks = [
    ["tabla_inventario", "id_productos", "movimientos de inventario"],
    ["tabla_detalle_factura", "id_productos", "detalles de factura"],
    ["tabla_factura", "id_productos", "facturas"]
];

$blockedReasons = [];

foreach($relatedChecks as $check){
    list($table, $column, $label) = $check;
    $result = $conexion->query("SELECT COUNT(*) AS total FROM $table WHERE $column='$id'");
    if($result){
        $row = $result->fetch_assoc();
        if(intval($row['total']) > 0){
            $blockedReasons[] = intval($row['total']) . " $label";
        }
    }
}

if(count($blockedReasons) > 0){
    $message = "No se puede eliminar el producto porque tiene registros asociados en: " . implode(", ", $blockedReasons) . ".";
    echo json_encode(["success"=>false, "error"=> $message]);
    exit;
}

$sql = "DELETE FROM tabla_productos WHERE id_productos='$id'";
$result = $conexion->query($sql);

echo json_encode(["success"=>(bool)$result]);
?>