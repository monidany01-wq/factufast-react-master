<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "../conexion.php";

$sql = "SELECT 
id_usuario,
nombre_usuario,
correo_usuario,
telefono_usuario,
cedula_usuario,
direccion_usuario,
id_rol 
FROM tabla_usuario";

$resultado = $conexion->query($sql);

$usuarios = [];

if($resultado){

    while($fila = $resultado->fetch_assoc()){
        $usuarios[] = $fila;
    }

    echo json_encode($usuarios);

}else{

    echo json_encode([
        "error" => "No se pudieron consultar los usuarios",
        "detalle" => $conexion->error
    ]);

}

?>