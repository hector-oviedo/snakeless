window.API_ID               = "PLACEHOLDER_ID";
window.API_REGION           = "PLACEHOLDER_REGION";
window.API_STAGE            = "PLACEHOLDER_STAGE";

window.API_GATEWAY_URL      = "https://" + window.API_ID + ".execute-api." + window.API_REGION + ".amazonaws.com/" + window.API_STAGE;
window.PUT_SCORE            = window.API_GATEWAY_URL + "/submitScore";
window.GET_LEADERBOARD_URL  = window.API_GATEWAY_URL + "/getLeaderboard";