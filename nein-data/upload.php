<?php

$result = array();
$result['success'] = false;

$upload_path = dirname(__FILE__) . '/uploads/';

// detecting direct file transfer
// TODO: control overwrite
$file_name = (isset($_SERVER['HTTP_X_FILENAME']) ? $_SERVER['HTTP_X_FILENAME'] : false);
if ($file_name) {
    if ( file_put_contents(
        $upload_path . $file_name,
        file_get_contents('php://input')
        )){
        $result['success'] = true;
    }

}


// detecting old-style form post
// TODO: control overwrite
if ($_FILES['old_style_file_upload']) {
    if (move_uploaded_file($_FILES['old_style_file_upload']['tmp_name'], $upload_path . $_FILES['old_style_file_upload']['name'])) {
        $result['success'] = true;
    }
}

echo json_encode($result);

