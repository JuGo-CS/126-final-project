<?php

//should replace manager, if ever a manager is entered
//put alert if empty
//FIXED!

include 'DBConnector.php';
$user_name = $_POST["name"];
$password = $_POST["password"];

$user_exists = False;

$look_up_user_query = "SELECT * FROM user WHERE user_name = $user_name;";
$result_existing_user = $conn->query($look_up_user_query);

if ($result_existing_user && $result_existing_user->num_rows > 0){
    $user_exists = True;
    return;
}    

$sign_up_query = "INSERT INTO 
        user(user_ID, 
        user_name, 
        password, 
        MG_highest_score, 
        ranking_MG, 
        CB_highest_score, 
        ranking_CB) 
        VALUES (NULL, '$user_name', '$password', '0', '0', '0', '0');";
    
if ($sign_up_query) {
    echo"New user created successfully! You may now proceed to login.";
    header("Location: home.html");
    
} else {
    echo "Error creating user: " . $sql . "<br>" . $conn->error;
}
$conn->close();
?>  