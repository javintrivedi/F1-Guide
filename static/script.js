document.addEventListener("DOMContentLoaded", () => {
  const loginSignupSection = document.getElementById("login-signup");
  const mainSections = document.querySelectorAll("section:not(#login-signup)");
  const navLinks = document.querySelectorAll("nav ul li a");

  let currentScore = 0;
  let totalQuestions = 0;

  // Show main content after login
  const mainContent = document.getElementById("mainContent");
  if (mainContent) {
    mainContent.style.display = "block";
  }

  // Add event listener for Generate New Fact button
  const generateFactBtn = document.getElementById("generate-fact-btn");
  if (generateFactBtn) {
    generateFactBtn.addEventListener("click", () => {
      generateFact();
    });
  }

  // Navigation Links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const targetId = href.substring(1);
        if (targetId) {
          // Remove active class from all nav links
          navLinks.forEach(nav => nav.classList.remove("active"));
          // Add active class to clicked link
          link.classList.add("active");

          // Hide all sections
          mainSections.forEach(section => {
            section.style.display = "none";
          });
          // Hide welcome message
          const welcomeMessage = document.getElementById("welcome-message");
          if (welcomeMessage) {
            welcomeMessage.style.display = "none";
          }
          // Show the clicked section
          const targetSection = document.getElementById(targetId);
          if (targetSection) {
            targetSection.style.display = "block";
            targetSection.scrollIntoView({ behavior: "smooth" });
          }
          // Fetch data for the section if needed
          fetchSectionData(targetId);
        }
      }
      // else allow default behavior for external links like /logout
    });
  });

  // Function to fetch data based on section ID
  function fetchSectionData(id) {
    if (id === "drivers") {
      fetchDrivers(); // Fetch driver data when "drivers" section is shown
    } else if (id === "quiz") {
      loadQuizQuestion(); // Fetch quiz question when "quiz" section is shown
    } else if (id === "comparison") {
      fetchEntities(); // Fetch entities for comparison when "comparison" section is shown
    } else if (id === "teams") {
      fetchTeams(); // Fetch teams data when "teams" section is shown
      populateTeamDriverDropdowns(); // Populate driver dropdowns in add team form
    }
  }

  // Populate driver dropdowns in Add Team form
  function populateTeamDriverDropdowns() {
    fetch('/get_drivers')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const driver1Select = document.getElementById('driver1-select');
          const driver2Select = document.getElementById('driver2-select');
          driver1Select.innerHTML = '<option value="" disabled selected>Select Driver 1</option>';
          driver2Select.innerHTML = '<option value="" disabled selected>Select Driver 2</option>';

          data.data.forEach(driver => {
            const option1 = document.createElement('option');
            option1.value = driver.driver_name;
            option1.textContent = driver.driver_name;
            option1.dataset.carNo = driver.carNo;
            driver1Select.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = driver.driver_name;
            option2.textContent = driver.driver_name;
            option2.dataset.carNo = driver.carNo;
            driver2Select.appendChild(option2);
          });

          // Add event listeners to update car numbers when drivers are selected
          driver1Select.addEventListener('change', () => {
            const selectedOption = driver1Select.options[driver1Select.selectedIndex];
            document.getElementById('carno1-input').value = selectedOption.dataset.carNo || '';
          });

          driver2Select.addEventListener('change', () => {
            const selectedOption = driver2Select.options[driver2Select.selectedIndex];
            document.getElementById('carno2-input').value = selectedOption.dataset.carNo || '';
          });
        } else {
          alert('Failed to load drivers for team form.');
        }
      })
      .catch(error => {
        console.error('Error loading drivers for team form:', error);
      });
  }

  // Handle Add Team form submission
  const addTeamForm = document.getElementById('add-team-form');
  if (addTeamForm) {
    addTeamForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const Driver1 = document.getElementById('driver1-select').value;
      const Driver2 = document.getElementById('driver2-select').value;
      const no_of_race_championship = document.getElementById('championships-input').value;
      const teamName = document.getElementById('teamname-input').value.trim();

      if (!Driver1 || !Driver2 || !no_of_race_championship || !teamName) {
        alert('⚠ Please fill in all fields.');
        return;
      }

      // Get CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

      try {
        const res = await fetch('/add_team', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify({
            Driver1,
            Driver2,
            no_of_race_championship,
            teamName
          })
        });

        const result = await res.json();
        if (result.success) {
          alert('✅ Team added successfully!');
          addTeamForm.reset();
          fetchTeams(); // Refresh teams table

          // Add the new team row to the table immediately
          const teamsList = document.getElementById('teams-list');
          const newRow = document.createElement('tr');
          newRow.innerHTML = `
            <td>${Driver1}</td>
            <td>${Driver2}</td>
            <td>N/A</td>
            <td>N/A</td>
            <td>${no_of_race_championship}</td>
            <td>${result.team_id}</td>
            <td>${teamName}</td>
          `;
          teamsList.appendChild(newRow);

        } else {
          alert(`❌ Error: ${result.error}`);
        }
      } catch (err) {
        alert(`❌ Network error: ${err.message}`);
      }
    });
  }

  // Driver Management
  async function addDriver() {
    const driver_id = document.getElementById("driverID").value.trim();
    const name = document.getElementById("driverName").value.trim();
    const carNumber = document.getElementById("carNumber").value.trim();
    const races = document.getElementById("races").value.trim();
    const teamID = document.getElementById("teamID").value.trim();

    if (!driver_id || !name || !carNumber || !races || !teamID)
      return alert("⚠ Please fill in all fields!");

    if (isNaN(driver_id) || isNaN(carNumber) || isNaN(races))
      return alert("⚠ IDs and numeric fields must be numbers!");

    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    try {
      const res = await fetch("/addDriver", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken
        },
        body: JSON.stringify({
          driver_id: +driver_id,
          driver_name: name,
          carNo: +carNumber,
          no_of_races: +races,
          team_id: teamID,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert("✅ Driver added successfully!");
        document.getElementById("driver-form").reset();
        fetchDrivers(); // Refresh the driver list after adding a new driver
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      alert(`❌ Network error: ${err.message}`);
    }
  }

  async function fetchDrivers() {
    try {
      const res = await fetch("/get_drivers");
      const data = await res.json();
      const table = document.getElementById("drivers-list");

      table.innerHTML = data.success
        ? data.data.map((d) => `
          <tr>
            <td>${d.driver_id}</td>
            <td>${d.driver_name}</td>
            <td>${d.carNo}</td>
            <td>${d.no_of_races}</td>
            <td>${d.team_id}</td>
          </tr>
        `).join('')
        : `<tr><td colspan="5">No drivers found.</td></tr>`;
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  }

  function fetchTeams() {
    fetch('/get_teams')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const teamsList = document.getElementById('teams-list');
                teamsList.innerHTML = ''; // Clear existing rows
                data.data.forEach(team => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${team.Driver1 || 'N/A'}</td>
                        <td>${team.Driver2 || 'N/A'}</td>
                        <td>${team.CarNo1 || 'N/A'}</td>
                        <td>${team.CarNo2 || 'N/A'}</td>
                        <td>${team.no_of_race_championship || 'N/A'}</td>
                        <td>${team.team_id || 'N/A'}</td>
                        <td>${team.teamName || 'N/A'}</td>
                    `;
                    teamsList.appendChild(row);
                });
            } else {
                alert(data.error || 'Failed to fetch teams.');
            }
        })
        .catch(error => console.error('Error fetching teams:', error));
}

  // Comparison
  function fetchEntities() {
    fetch("/get_entities?category=driver")
      .then((res) => res.json())
      .then((data) => {
        const e1 = document.getElementById("compare-entity1");
        const e2 = document.getElementById("compare-entity2");
        e1.innerHTML = e2.innerHTML = "<option disabled selected>-- Select --</option>";

        (data?.data || []).forEach((d) => {
          const opt1 = new Option(d.driver_name, d.driver_id);
          const opt2 = new Option(d.driver_name, d.driver_id);
          e1.add(opt1);
          e2.add(opt2);
        });
      })
      .catch((e) => console.error("❌ Fetch error:", e));
  }

async function fetchComparison() {
    const d1 = document.getElementById("compare-entity1").value;
    const d2 = document.getElementById("compare-entity2").value;
    const resultBox = document.getElementById("comparison-result");

    if (!d1 || !d2) return alert("⚠ Please select both entities.");

    resultBox.innerHTML = "<p>Loading...</p>";
    try {
      const res = await fetch("/compare_drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver1_id: d1, driver2_id: d2 }),
      });

      const data = await res.json();
      resultBox.innerHTML = data.success
        ? `
        <h3>🧠 Comparison Results</h3>
        <pre style="white-space: pre-wrap; font-family: inherit;">${data.comparison}</pre>`
        : `<p>❌ ${data.error}</p>`;
    } catch (err) {
      resultBox.innerHTML = `<p>❌ Error: ${err.message}</p>`;
    }
  }

  // Quiz Logic
  async function loadQuizQuestion() {
    try {
        // Check if 10 questions have already been asked
        if (totalQuestions >= 10) {
            const qElem = document.getElementById("quiz-question");
            const optionsDiv = document.getElementById("quiz-options");
            const feedback = document.getElementById("quiz-feedback");
            const nextBtn = document.getElementById("next-question");

            qElem.textContent = "🎉 Quiz complete! You have answered 10 questions.";
            optionsDiv.innerHTML = "";
            feedback.textContent = "";
            nextBtn.style.display = "none";

            // Celebrate the perfect score with confetti
            celebratePerfectScore();

            return;
        }

        const res = await fetch("/generate_quiz");
        const data = await res.json();

        if (data.success) {
            const { question, options, correct_answer } = data.quiz;
            const qElem = document.getElementById("quiz-question");
            const optionsDiv = document.getElementById("quiz-options");
            const feedback = document.getElementById("quiz-feedback");
            const nextBtn = document.getElementById("next-question");

            qElem.textContent = question;
            optionsDiv.innerHTML = "";
            feedback.textContent = "";
            nextBtn.style.display = "none";

            options.forEach((opt) => {
                const btn = document.createElement("button");
                btn.textContent = opt;
                btn.className = "option-btn btn-style";
                btn.onclick = () => checkAnswer(opt, correct_answer, btn);
                optionsDiv.appendChild(btn);
            });

            // Increment total questions count
            totalQuestions++;
            updateScoreDisplay();

        } else {
            document.getElementById("quiz-question").textContent = "❌ Error fetching question!";
        }
    } catch (e) {
        console.error("❌ Quiz Load Error:", e);
    }
}

function celebratePerfectScore() {
  // Create a canvas element
  let canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "9999";  // Ensure it's in front of everything else
  document.body.appendChild(canvas);
  
  let ctx = canvas.getContext("2d");

  // Draw confetti
  for (let i = 0; i < 100; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 5 + Math.random() * 10, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
      ctx.fill();
  }

  // Remove canvas after 3 seconds
  setTimeout(() => {
      document.body.removeChild(canvas);
  }, 3000); 
}


function showMotivationalQuote() {
  const quotes = [
      "You're on fire! 🔥",
      "Amazing! Keep it up! 🚀",
      "Champion spirit! 🏆",
      "You're unstoppable! 💥",
      "Next world champion? 👑",
      "Pure excellence! 🌟"
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  // Create or update the quote element
  let quoteElement = document.getElementById("motivational-quote");
  if (!quoteElement) {
      quoteElement = document.createElement("p");
      quoteElement.id = "motivational-quote";
      document.getElementById("quiz").appendChild(quoteElement);
  }
  
  quoteElement.textContent = randomQuote;
  quoteElement.className = "motivational";
}


  function checkAnswer(selected, correct, btnClicked) {
    const buttons = document.querySelectorAll(".option-btn");
    buttons.forEach((btn) => {
      btn.disabled = true;
      if (btn.textContent === correct) btn.classList.add("correct");
      else if (btn === btnClicked) btn.classList.add("incorrect");
    });
  
    const feedback = document.getElementById("quiz-feedback");
    const scoreSpan = document.getElementById("quiz-score");
  
    if (selected === correct) {
      currentScore++;
      if (currentScore > 10) currentScore = 10; // Cap score at 10
      feedback.innerHTML = `✅ Correct! Score: ${currentScore}/${totalQuestions}`;
  
      feedback.className = "text-green";
  
      // ✨ Animate score pop
      scoreSpan.classList.add('score-pop');
      setTimeout(() => {
        scoreSpan.classList.remove('score-pop');
      }, 500);
  
      // ✨ Show motivational quote
      showMotivationalQuote();
  
    } else {
      feedback.innerHTML = `❌ Wrong! Correct: ${correct}. Score: ${currentScore}/${totalQuestions}`;
      feedback.className = "text-red";
    }
  
    updateScoreDisplay();
    document.getElementById("next-question").style.display = "block";
  }
  
  function updateScoreDisplay() {
    const scoreSpan = document.getElementById("quiz-score");
    scoreSpan.textContent = `${currentScore}/${totalQuestions}`;
  }

  // Generate new question (called by button)
  function generateQuiz() {
    loadQuizQuestion();
  }

  // Reset quiz (called by button)
  function resetQuiz() {
    currentScore = 0;
    totalQuestions = 0;
    updateScoreDisplay();
    loadQuizQuestion();
  }

  // Event listener for next question button
  document.getElementById("next-question").addEventListener("click", () => {
    loadQuizQuestion();
  });

  // First Load
  loadQuizQuestion();
  fetchDrivers();
  fetchEntities();
  loadDrivers();

  // Expose globally if needed
  window.addDriver = addDriver;
  window.fetchComparison = fetchComparison;
  window.generateQuiz = generateQuiz;
  window.resetQuiz = resetQuiz;
});

// Profile icon toggle dropdown
document.addEventListener('DOMContentLoaded', function () {
  const profileIcon = document.getElementById('profile-icon');
  const profileDropdown = document.getElementById('profile-dropdown');

  profileIcon.addEventListener('click', function () {
    if (profileDropdown.style.display === 'block') {
      profileDropdown.style.display = 'none';
    } else {
      profileDropdown.style.display = 'block';
    }
  });

  // Close dropdown if clicked outside
  document.addEventListener('click', function (event) {
    if (!profileIcon.contains(event.target) && !profileDropdown.contains(event.target)) {
      profileDropdown.style.display = 'none';
    }
  });
});

// Voice Recognition
function startVoiceRecognition() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = function(event) {
    const command = event.results[0][0].transcript.toLowerCase();
    document.getElementById('voice-output').innerText = "You said: " + command;

    if (command.includes('add driver')) {
      document.getElementById('driverID').focus();
    } else if (command.includes('compare')) {
      document.getElementById('compare-entity1').focus();
    } else if (command.includes('result')) {
      document.getElementById('race-results').scrollIntoView({ behavior: "smooth" });
    } else {
      document.getElementById('voice-output').innerText += "\nSorry, command not recognized.";
    }
  }
}

// Predict Race Winner
function predictWinner() {
  const drivers = [
    document.getElementById('predict-driver1').value,
    document.getElementById('predict-driver2').value,
    document.getElementById('predict-driver3').value
  ];
  
  const predictionResult = document.getElementById('prediction-result');
  
  // Show spinner
  predictionResult.innerHTML = `<div class="spinner"></div> Predicting...`;
  
  setTimeout(() => {
    const winner = drivers[Math.floor(Math.random() * drivers.length)];
    predictionResult.innerHTML = `🏆 Predicted Winner: ${winner}`;
  }, 2000); // simulate 2 sec AI thinking
}


// Generate F1 Fact
const facts = [
  "Michael Schumacher and Lewis Hamilton share the record for the most World Drivers' Championships (7 each).",
  "The fastest pit stop ever was 1.82 seconds by Red Bull Racing.",
  "F1 cars can go from 0 to 100 mph and back to 0 in less than 5 seconds.",
  "The Monaco Grand Prix is considered the most prestigious F1 race."
];
function generateFact() {
  const fact = facts[Math.floor(Math.random() * facts.length)];
  document.getElementById('fact-text').innerText = fact;
}

// Personalized Driver Suggestion
function suggestDriver() {
  const races = parseInt(document.getElementById('races-input').value);
  let suggestion = "";

  if (races < 20) {
    suggestion = "Logan Sargeant - Rookie vibes!";
  } else if (races < 100) {
    suggestion = "Lando Norris - Young and rising.";
  } else if (races < 200) {
    suggestion = "Sergio Pérez - Consistent and smart.";
  } else {
    suggestion = "Fernando Alonso - Veteran and experienced legend!";
  }
  document.getElementById('suggestion-text').innerText = suggestion;
}

// Populate prediction dropdowns with drivers
function populatePredictionDropdowns(drivers) {
  const dropdowns = [
    document.getElementById('predict-driver1'),
    document.getElementById('predict-driver2'),
    document.getElementById('predict-driver3')
  ];
  
  dropdowns.forEach(dropdown => {
    dropdown.innerHTML = ""; // clear existing
    drivers.forEach(driver => {
      const option = document.createElement('option');
      option.value = driver.driver_name;
      option.textContent = driver.driver_name;
      dropdown.appendChild(option);
    });
  });
}

// Call it after loading drivers for comparison as well
function loadDrivers() {
  fetch('/get_drivers')
    .then(response => response.json())
    .then(data => {
      const driversList = document.getElementById('drivers-list');
      driversList.innerHTML = '';

      data.forEach(driver => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${driver.id}</td>
          <td>${driver.name}</td>
          <td>${driver.car_number}</td>
          <td>${driver.races}</td>
          <td>${driver.team_id}</td>
        `;
        driversList.appendChild(row);
      });

      // Also populate dropdowns for prediction and comparison
      populateComparisonDropdowns(data);
      populatePredictionDropdowns(data);
    });
}

function startListening() {
  alert("🎙️ Listening for your command... (voice AI coming soon!)");
}

// Function to handle voice commands and navigate to sections
function navigateToSection(command) {
  const sections = {
    "add driver": "#drivers", 
    "quiz": "#quiz",
    "compare max and lewis": "#comparison",
    "race results": "#race-results",
    "show drivers": "#drivers",
    "show quiz": "#quiz",
    "show comparison": "#comparison",
    "show race results": "#race-results"
  };

  const targetSection = sections[command.toLowerCase()];
  if (targetSection) {
    document.querySelector(targetSection).scrollIntoView({ behavior: "smooth" });
    document.getElementById("voice-output").textContent = `Navigating to ${command}`;
  } else {
    document.getElementById("voice-output").textContent = "Command not recognized. Please try again.";
  }
}

// Setup for Speech Recognition API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.continuous = false;
recognition.interimResults = false;

// Start recognition when the voice assistant button is clicked
function startVoiceRecognition() {
  recognition.start();
  document.getElementById("voice-output").textContent = "Listening for your command...";
}

// When speech is recognized, process the command
recognition.onresult = (event) => {
  const command = event.results[0][0].transcript;
  console.log("Voice command received: " + command);
  navigateToSection(command);
};

// Error handling for speech recognition
recognition.onerror = (event) => {
  console.error("Speech Recognition Error: ", event.error);
  document.getElementById("voice-output").textContent = "Sorry, I didn't catch that. Please try again.";
};

// Notify when the speech recognition ends
recognition.onend = () => {
  console.log("Speech recognition has ended.");
};

