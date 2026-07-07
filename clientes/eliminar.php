<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

if(isset($data['id_cliente'])){
    
    $id = $data['id_cliente'];

    $checkSql = "SELECT COUNT(*) AS total FROM tabla_factura WHERE id_cliente='$id'";
    $checkResult = $conexion->query($checkSql);
    $row = $checkResult ? $checkResult->fetch_assoc() : null;

    if($row && intval($row['total']) > 0){
        echo json_encode(["error"=>"No se puede eliminar el cliente porque tiene ventas asociadas."]);
        exit;
    }

    $sql = "DELETE FROM tabla_cliente WHERE id_cliente='$id'";

    if($conexion->query($sql)){
        echo json_encode(["mensaje"=>"Cliente eliminado"]);
    }else{
        echo json_encode(["error"=>$conexion->error]);
    }

}else{

    echo json_encode(["error"=>"No se recibió id_cliente"]);

}

?>