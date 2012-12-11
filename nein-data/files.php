<?php

$result = array();
$result['success'] = false;

$files = array();

$upload_path = dirname(__FILE__) . '/uploads/';

$upload_dir = opendir($upload_path);

while ($file_name = readdir($upload_dir)) {

    // if file isn't this directory or its parent, add it to the results
    if ($file_name != "." && $file_name != "..") {
        $file_entry = array();
        $file_entry['name'] = $file_name;

        $file_ext = pathinfo($file_name, PATHINFO_EXTENSION);
        if ($file_ext == 'jpg' OR $file_ext == 'gif' OR $file_ext == 'png') {
            $file_entry['type'] = 'image';
        } elseif ($file_ext == 'avi' OR $file_ext == 'flv' OR $file_ext == 'mpg') {
            $file_entry['type'] = 'video';
        } else {
            $file_entry['type'] = 'misc';
        }

        $files[] = $file_entry;
    }
}

closedir($upload_dir);

//TODO: some check
$result['files'] = $files;
$result['success'] = true;


echo json_encode($result);
