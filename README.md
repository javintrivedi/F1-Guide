</head>
<body>

  <h1>🏎️ Beginner's Guide to F1 – AI Powered F1 Platform</h1>

  <p>Welcome to the <strong>Beginner's Guide to F1</strong>, a comprehensive AI-powered platform built for Formula 1 enthusiasts! This project combines real-time race data, driver management, AI-generated quizzes, team/driver comparison tools, and voice assistant support – all in one sleek interface.</p>

  <h2>🚀 Features</h2>
  <ul>
    <li>🧑‍✈️ <strong>Driver Management:</strong> View, add, or update driver details.</li>
    <li>📊 <strong>AI-Based Comparison:</strong> Compare stats between your favorite drivers or teams.</li>
    <li>🧠 <strong>AI Quiz:</strong> Take auto-generated quizzes sourced from real F1 data and Wikipedia.</li>
    <li>🗣️ <strong>Voice Assistant:</strong> Use voice commands to interact with the platform (e.g., "Compare Hamilton and Verstappen").</li>
    <li>🏁 <strong>Live Race Updates:</strong> Get real-time race results using integrated APIs.</li>
    <li>🔐 <strong>Authentication:</strong> Login and Signup system with session management.</li>
    <li>🌗 <strong>Dark/Light Mode:</strong> Switch themes based on your preference.</li>
  </ul>

  <h2>🛠️ Tech Stack</h2>
  <ul>
    <li><strong>Frontend:</strong> HTML, CSS (Vanilla), JavaScript</li>
    <li><strong>Backend:</strong> Python (Flask)</li>
    <li><strong>Database:</strong> MySQL</li>
    <li><strong>APIs:</strong> Wikipedia API, F1 Live Data APIs</li>
    <li><strong>Voice Assistant:</strong> Botpress or JavaScript Web Speech API</li>
    <li><strong>AI Integration:</strong> GPT-based quiz generation and comparison logic</li>
  </ul>

  <h2>🗃️ Database Schema</h2>
  <p><strong>Database Name:</strong> <code>beginners_guide_to_f1</code></p>
  <table>
    <thead>
      <tr>
        <th>Table Name</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>drivers</code></td>
        <td>Stores driver details like name, team, nationality, stats, etc.</td>
      </tr>
      <tr>
        <td><code>teams</code></td>
        <td>Contains team names, team principals, and constructor details.</td>
      </tr>
      <tr>
        <td><code>race</code></td>
        <td>Holds data about race events, winners, dates, and circuits.</td>
      </tr>
      <tr>
        <td><code>car</code></td>
        <td>Details about car models, engines, performance, and linked drivers/teams.</td>
      </tr>
      <tr>
        <td><code>circuit</code></td>
        <td>Information about F1 circuits – location, lap length, and capacity.</td>
      </tr>
      <tr>
        <td><code>sponsors</code></td>
        <td>Sponsor info including brands, associated teams, and contracts.</td>
      </tr>
      <tr>
        <td><code>staff</code></td>
        <td>Team staff like engineers, strategists, and their roles.</td>
      </tr>
    </tbody>
  </table>

  <h2>🧑‍💻 Installation</h2>
  <ol>
    <li><strong>Clone the repo</strong><br>
      <pre><code>git clone https://github.com/yourusername/f1-guide.git
cd f1-guide</code></pre>
    </li>
    <li><strong>Create a virtual environment</strong><br>
      <pre><code>python -m venv venv
source venv/bin/activate   # For Linux/macOS
venv\Scripts\activate      # For Windows</code></pre>
    </li>
    <li><strong>Install dependencies</strong><br>
      <pre><code>pip install -r requirements.txt</code></pre>
    </li>
    <li><strong>Configure <code>.env</code> file</strong><br>
      <pre><code>DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=beginners_guide_to_f1</code></pre>
    </li>
    <li><strong>Run the app</strong><br>
      <pre><code>python app.py</code></pre>
    </li>
    <li><strong>Visit</strong><br>
      Open <a href="http://127.0.0.1:5000" target="_blank">http://127.0.0.1:5000</a> in your browser.
    </li>
  </ol>

  <h2>🎤 Sample Voice Commands</h2>
  <ul>
    <li>“Add driver”</li>
    <li>“Compare Hamilton and Verstappen”</li>
    <li>“Who is leading the championship?”</li>
    <li>“Start quiz”</li>
  </ul>

  <h2>🤝 Contributing</h2>
  <ol>
    <li>Fork the repo</li>
    <li>Create a new branch: <code>git checkout -b feature-name</code></li>
    <li>Commit your changes: <code>git commit -m "Add feature"</code></li>
    <li>Push to the branch: <code>git push origin feature-name</code></li>
    <li>Open a Pull Request</li>
  </ol>

  <h2>📄 License</h2>
  <p>This project is licensed under the <a href="#">MIT License</a>.</p>

  <h2>👨‍💻 Developed By</h2>
  <p><a href="https://github.com/javintrivedi" target="_blank">Javin Trivedi</a> <br>Special thanks to all contributors!</p>

</body>
</html>
