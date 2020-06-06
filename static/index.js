$(document).ready(function() {
    p_serve = 1; // player who is serving, player 1 in the beginning by default
    tb_point = 0; // it increases after each tiebreak point, and becomes 0 after tb is over
    $("#p1n_id").css('background', 'green');
    a = parseInt($("#p1sets_id").html());
    b = parseInt($("#p2sets_id").html());
    tiebreak_points = parseInt($("#tb_pts").html());
    n_sets = parseInt($("#nsets").html());

    $("#p1win_id").click(function() {
        point_won_by(1);
    });

    $("#p2win_id").click(function() {
        point_won_by(2);
    });
});

function change_service(){
    p_serve_id = "#p" + p_serve + "n_id";
    $(p_serve_id).css('background', 'transparent');
    p_serve = 3 - p_serve;
    p_serve_id = "#p" + p_serve + "n_id";
    $(p_serve_id).css('background', 'green');
}

function set_serve(next_set_serve){
    p_serve = next_set_serve;
    p_serve_id = "#p" + p_serve + "n_id";
    $(p_serve_id).css('background', 'green');
    $("#p" + (3-p_serve) + "n_id").css('background', 'transparent'); // removing the returner background color

}

function point_won_by(winner) {
    if (a > n_sets/2){
        alert("Player 1 already won the match. \n For the love of God, stop clicking the button!");
    } else if (b > n_sets/2) {
        alert("Player 2 already won the match. \n For the love of God, stop clicking the button!");
    }
    else {
        // sending point winner to server via ajax call
        $.post("/receivedata", {"point_winner": winner, "p_serve": p_serve});

        var num_columns = $("#p1_row_id > td").length;
        var p1s_id = "#p1s" + (num_columns-4) + "_id";
        var p2s_id = "#p2s" + (num_columns-4) + "_id";
        var p1_set_score = parseInt($(p1s_id).html());
        var p2_set_score = parseInt($(p2s_id).html());

        if (p1_set_score == 6 && p2_set_score == 6) {
            update_tiebreak_score(winner=winner);
        } else {
            update_score(winner=winner);
        }
    }

}



function update_score(winner) {
    var pWg_id = "#p" + winner + "g_id";
    var pLg_id = "#p" + (3-winner) + "g_id";

    var pW_game_score = $(pWg_id).text();
    switch (pW_game_score) {
        case "0":
            $(pWg_id).text(15);
            break;
        case "15":
            $(pWg_id).text(30);
            break;
        case "30":
            $(pWg_id).text(40);
            break;
        case "40":
            var pL_game_score = $(pLg_id).text();
            if (pL_game_score < 40) {
                $(pWg_id).text(0);
                $(pLg_id).text(0);
                change_service();
                update_set_score(winner);
            } else if (pL_game_score == 40) {
                $(pWg_id).text("AD");
            } else {
                $(pLg_id).text(40);
            }
            break;
        case "AD":
            $(pWg_id).text(0);
            $(pLg_id).text(0);
            change_service();
            update_set_score(winner);
            break;
        default:
            alert("No matching found in switch statement");
    }
}

function update_tiebreak_score(winner) {
    if (tb_point == 0) { // that is, if this was the first point of the tb
        next_set_serve = 3 - p_serve; //save the serving player for the next set to be the returner of the first point
    }
    tb_point += 1;
    if (tb_point%2 == 1) change_service();
    var pWg_id = "#p" + winner + "g_id";
    var pLg_id = "#p" + (3-winner) + "g_id";
    var pW_game_score = parseInt($(pWg_id).text());
    var pL_game_score = parseInt($(pLg_id).text());

    pW_game_score += 1;
    $(pWg_id).text(pW_game_score);
    if ((pW_game_score >= tiebreak_points) && (pW_game_score - pL_game_score >= 2)){
        tb_point = 0;
        $(pWg_id).text(0);
        $(pLg_id).text(0);
        set_serve(next_set_serve); //set the player who'll serve the first game of the new set
        update_set_score(winner, pL_game_score);
    }

}

function update_set_score(winner, loser_tiebreak_score) {
    var num_columns = $("#p1_row_id > td").length;
    var p1s_id = "#p1s" + (num_columns-4) + "_id";
    var p2s_id = "#p2s" + (num_columns-4) + "_id";
    var p1_set_score = parseInt($(p1s_id).html());
    var p2_set_score = parseInt($(p2s_id).html());
    if(winner==1) {
        p1_set_score = p1_set_score + 1;
        $(p1s_id).text(p1_set_score);
        if (loser_tiebreak_score >= 0) $(p2s_id).text(p2_set_score + " (" + loser_tiebreak_score + ")" );
    }
    else {
        p2_set_score = p2_set_score + 1;
        $(p2s_id).text(p2_set_score);
        if (loser_tiebreak_score >= 0) $(p1s_id).text(p1_set_score + " (" + loser_tiebreak_score + ")" );
    }
    if (
        (p1_set_score == 6 && p2_set_score < 5) ||
        (p1_set_score == 7) ||
        (p2_set_score == 6 && p1_set_score < 5) ||
        (p2_set_score == 7)
    ) {
        // ADD NEW SET
        if(winner==1){
            a = a + 1;
            $("#p1sets_id").html(a);
        } else {
            b = b + 1;
            $("#p2sets_id").html(b);
        }

        // Check if match is over
        if ( a > n_sets/2 || b > n_sets/2 ){
            //console.log("MATCH IS OVER! STOP!");
            const msg_string = (a > b) ? "Player 1 won the match." : "Player 2 won the match.";
            alert("MATCH IS OVER! " + msg_string);
            $("p1n_id").css('background', 'transparent');
            $("p2n_id").css('background', 'transparent');
        } else {
            var s_id = "#s" + (num_columns-4) + "_id";
            num_columns = num_columns + 1;
            $(s_id).after("<th id='s" + (num_columns-4) + "_id'>Set " +((num_columns-4))+ "</th>");
            $(p1s_id).after("<td id='p1s" + (num_columns-4) + "_id'>0</td>");
            $(p2s_id).after("<td id='p2s" + (num_columns-4) + "_id'>0</td>");
        }
    }

}
