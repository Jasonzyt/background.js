<?php

// Change CWD to previous dir
chdir('..');

// Start the session to get background information
session_start();

header("Content-Type: application/json");
$info = $_SESSION["current_background"];
// If there is no background, return an empty object
if ($info == null) {
    exit("{}");
}
exit(json_encode($info, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));