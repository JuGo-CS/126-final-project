<?php
header('Content-Type: text/html');
include 'DBConnector.php';

$MG_high_scores_query = "SELECT user_name, rating_MG, MG_highest_score 
                        FROM user 
                        ORDER BY MG_highest_score DESC;";

$MG_high_scores_result = $conn->query($MG_high_scores_query);
$MG_rank = 1;

if ($MG_high_scores_result->num_rows > 0) {
    // output data of each row
    while($row = $MG_high_scores_result->fetch_assoc()) {
        echo "<tr>".
            "<td align='center'>".$MG_rank++."</td>".
            "<td align='center'>".htmlspecialchars($row["user_name"])."</td>".
            "<td align='center'>".$row["rating_MG"]."</td>".
            "<td align='center'>".$row["MG_highest_score"]."</td>".
            "</tr>";
    }
   
} else {
    echo "<tr>".
            "<td align='center'>-----</td>".
            "<td align='center'>-----</td>".
            "<td align='center'>-----</td>".
            "<td align='center'>-----</td>".
            "</tr>";
}

$conn->close();
?>
 