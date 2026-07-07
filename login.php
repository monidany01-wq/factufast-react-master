<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);


header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


include "conexion.php";


if($conexion->connect_error){

    echo json_encode([
        "success" => false,
        "mensaje" => "Error de conexión a la base de datos"
    ]);

    exit();

}


// RECIBIR DATOS JSON

$data = json_decode(file_get_contents("php://input"), true);


$usuario = $data["usuario"] ?? "";

$contrasena = $data["contrasena"] ?? "";



if(empty($usuario) || empty($contrasena)){


    echo json_encode([
        "success" => false,
        "mensaje" => "Datos incompletos"
    ]);

    exit();

}




$sql = "SELECT 
            u.id_usuario,
            u.nombre_usuario,
            u.id_rol,
            u.contrasena_usuario,
            r.nombre_rol

        FROM tabla_usuario u

        INNER JOIN tabla_rol r 
        ON u.id_rol = r.id_rol

        WHERE u.cedula_usuario = ?";



$stmt = $conexion->prepare($sql);



if(!$stmt){

    echo json_encode([
        "success"=>false,
        "mensaje"=>"Error en consulta SQL"
    ]);

    exit();

}




$stmt->bind_param("s",$usuario);


$stmt->execute();


$resultado = $stmt->get_result();




if($resultado->num_rows > 0){


    $fila = $resultado->fetch_assoc();



    // COMPARAR CONTRASEÑA CORRECTAMENTE

    if(password_verify($contrasena, $fila["contrasena_usuario"])) {



        echo json_encode([

            "success"=>true,

            "id_usuario"=>$fila["id_usuario"],

            "nombre_usuario"=>$fila["nombre_usuario"],

            "nombre_rol"=>$fila["nombre_rol"]

        ]);



    }else{


        echo json_encode([

            "success"=>false,

            "mensaje"=>"Contraseña incorrecta"

        ]);

    }




}else{


    echo json_encode([

        "success"=>false,

        "mensaje"=>"Usuario no encontrado"

    ]);

}



$stmt->close();

$conexion->close();


?>