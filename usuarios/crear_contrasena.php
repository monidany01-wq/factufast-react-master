<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");


include("../conexion.php");


// Verificar conexión

if(!$conexion){

    echo json_encode([
        "success"=>false,
        "mensaje"=>"Error conectando a la base de datos"
    ]);

    exit;
}



// Recibir datos JSON

$data = json_decode(file_get_contents("php://input"), true);


if(!$data){

    echo json_encode([
        "success"=>false,
        "mensaje"=>"No llegaron datos"
    ]);

    exit;

}



$cedula = $data["cedula_usuario"] ?? "";

$contrasena = $data["contrasena"] ?? "";



// Validar campos

if(empty($cedula) || empty($contrasena)){


    echo json_encode([
        "success"=>false,
        "mensaje"=>"Complete todos los campos"
    ]);

    exit;

}



// Buscar usuario

$sql = "SELECT id_usuario FROM tabla_usuario WHERE cedula_usuario = ?";


$stmt = $conexion->prepare($sql);


if(!$stmt){


    echo json_encode([
        "success"=>false,
        "mensaje"=>"Error en consulta usuarios: ".$conexion->error
    ]);

    exit;

}



$stmt->bind_param("s",$cedula);

$stmt->execute();


$resultado = $stmt->get_result();



if($resultado->num_rows == 0){


    echo json_encode([
        "success"=>false,
        "mensaje"=>"Usuario no encontrado"
    ]);

    exit;

}



$usuarioBD = $resultado->fetch_assoc();


$id_usuario = $usuarioBD["id_usuario"];





// Encriptar contraseña

$claveEncriptada = password_hash(
    $contrasena,
    PASSWORD_DEFAULT
);





// Actualizar contraseña

$sqlUpdate = "


UPDATE tabla_usuario

SET contrasena_usuario = ?

WHERE id_usuario = ?

";



$stmtUpdate = $conexion->prepare($sqlUpdate);



if(!$stmtUpdate){


    echo json_encode([
        "success"=>false,
        "mensaje"=>"Error preparando actualización: ".$conexion->error
    ]);

    exit;

}





$stmtUpdate->bind_param(
    "si",
    $claveEncriptada,
    $id_usuario
);




if($stmtUpdate->execute()){


    echo json_encode([

        "success"=>true,

        "mensaje"=>"Contraseña creada correctamente"

    ]);


}else{


    echo json_encode([

        "success"=>false,

        "mensaje"=>"Error actualizando contraseña: ".$stmtUpdate->error

    ]);

}




$conexion->close();


?>