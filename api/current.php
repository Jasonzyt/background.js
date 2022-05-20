<?php

include 'internal.php';

chdir('..');
session_start();

header("Content-Type: application/json");
$info = $_SESSION["current_background"];
if ($info == null) {
    exit("{}");
}

$req_path = substr($_SERVER["REQUEST_URI"], 0, strpos($_SERVER["REQUEST_URI"], 'api/current'));
$info["url"] = $_SERVER["REQUEST_SCHEME"] . "://" . $_SERVER["HTTP_HOST"] . $req_path . $info["path"];
$json = json_decode(file_get_contents(backgroundCopyrights));
$info["copyright"] = $json->{basename($info["path"])};
exit(json_encode($info, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));