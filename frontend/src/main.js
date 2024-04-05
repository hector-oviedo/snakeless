document.addEventListener('DOMContentLoaded', function() {
    const app = document.getElementById('app');
    const navTitle = document.getElementById('navTitle').getElementsByClassName('navbar-brand')[0];
    // Function to update the view
    function updateView(title, content) {
        navTitle.textContent = title;
        app.innerHTML = content;
    }
    // Welcome view
    function welcomeView() {
        const content = `
            <div class="input-group">
                <input type="text" id="nickname" placeholder="Enter your nickname" class="form-control border-secondary">
                <button id="proceedButton" class="btn btn-outline-info">Proceed</button>
            </div>
        `;
        updateView('Snake Serverless - A Cloud Computing Challenge!', content);

        $('#proceedButton').click(function() {
            window.nickname = $('#nickname').val();
            selectDifficulty();
        });
    }
    // Select difficulty view
    window.selectDifficulty = function() {
        const content = `
            <div class="d-flex flex-wrap justify-content-center">
                <button onclick="startGame('easy')" class="btn btn-outline-success btn-outline-custom">Easy</button>
                <button onclick="startGame('normal')" class="btn btn-outline-warning btn-outline-custom">Normal</button>
                <button onclick="startGame('hard')" class="btn btn-outline-danger btn-outline-custom">Hard</button>
            </div>
        `;
        updateView('Snake Serverless - Select Difficulty', content);
    };

    // Game view
    window.startGame = function(difficulty) {
        const content = "";
        updateView('Snake Serverless - Game', content);

        // Delay Phaser game initialization to ensure DOM elements are fully loaded
        setTimeout(() => {
            window.initGame(difficulty); // Call the Phaser game initialization
        }, 100);
    };

    // Leaderboard view
    window.leaderboardView = function() {
        console.log("trying to reach",window.GET_LEADERBOARD_URL);
        $.get(window.GET_LEADERBOARD_URL)
            .done(function(leaderboardDataRAW) {
                console.log("leaderboardDataRAW",leaderboardDataRAW)
                let leaderboardData = JSON.parse(leaderboardDataRAW);
                
                let tableRows = '';

                leaderboardData.forEach(entry => {
                    tableRows += ` 
                        <tr>
                            <td>${entry.nickname.S}</td>
                            <td>${entry.score.S}</td>
                            <td>${entry.difficulty.S}</td> 
                            <td>${entry.date.S}</td>
                        </tr>
                    `; 
                });

            const content = `
                <div class="row col-10">
                    <div class="table-responsive" style="max-height: 50vh;min-width:100%">
                        <table class="table table-dark sticky-header">
                            <thead class="thead-dark">
                                <tr>
                                    <th>Nickname</th>
                                    <th>Score</th>
                                    <th>Difficulty</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody class="bg-dark text-white">
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                </div>`;

            updateView('Snake Serverless - Leaderboard', content);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            // Log error to console for debugging
            console.error("Error sending data:", textStatus, errorThrown, jqXHR.responseText);

            // Construct a more user-friendly error message
            let errorMessage = "An error occurred. Please try again.";

            // Provide more detail if available and appropriate
            if (textStatus === "timeout") {
                errorMessage = "The request timed out. Please try again.";
            } else if (textStatus === "error") {
                // Check if the server provided a more specific error message
                if (jqXHR.responseText) {
                    try {
                        let response = JSON.parse(jqXHR.responseText);
                        if (response && response.message) {
                            errorMessage = response.message; // Use server's error message
                        }
                    } catch (e) {
                        // If responseText isn't JSON, or doesn't contain a message, use a generic message
                        errorMessage = "An unexpected error occurred. Please try again.";
                    }
                }
            } else if (textStatus === "abort") {
                errorMessage = "The request was aborted. Please try again.";
            } else if (textStatus === "parsererror") {
                errorMessage = "An error occurred while parsing the response. Please try again.";
            }

            // Display the constructed error message to the user
            alert(errorMessage);

            //create the content
            const content = `
                <div class="row col-10">
                    <div class="table-responsive" style="max-height: 50vh;min-width:100%">
                        <table class="table table-dark sticky-header">
                            <thead class="thead-dark">
                                <tr>
                                    <th>Nickname</th>
                                    <th>Score</th>
                                    <th>Difficulty</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody class="bg-dark text-white">
                                <tr>
                                    <td>ERROR</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>`;

            updateView('Snake Serverless - Leaderboard', content);
        });
    };
    // Initialize the welcome view
    welcomeView();
});