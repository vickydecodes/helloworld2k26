export const events = [
  {
    index: 1,
    id: "inauguration",
    name: "Inauguration",
    startTime: "09:30 AM",
    endTime: "10:00 AM",
    date: "10-Aug-2026",
    type: "program",
    venue: "Rev. Fr. P. Paul Raj Kumar Hall",
    description: "Welcome to the Hello World '26-'27 Edition. Join us as we commence this prestigious inter-collegiate technical festival, uniting brilliant minds, expert speakers, and tech enthusiasts. The ceremony marks the start of a series of intense competitions, innovation showcases, and cooperative coding challenges organized by the PG Department of Computer Applications.",
    rules: [],
    coordinator: "Dr. A. John Pradeep Ebenezer",
    phone: "9876500001",
    chiefGuest: "Dr. John Doe",
    chiefGuestTitle: "Guest of Honor",
    phases: [],
    
    // Manual status/phase overrides (optional)
    isLive: false,
    status: "",
    phase: "",
    winners: []
  },
  {
    index: 2,
    id: "paper-presentation",
    name: "Paper Presentation",
    startTime: "10:15 AM",
    endTime: "11:30 AM",
    date: "10-Aug-2026",
    type: "event",
    venue: "Rev. Fr. P. Paul Raj Kumar Hall",
    description: "Unleash your research and presentation skills on the cutting-edge frontier of 'Artificial Intelligence - Transforming the Future'. Participants will present their original research, case studies, or conceptual frameworks in front of an expert panel. Showcase your clarity of thought, academic rigor, and vision for the next generation of intelligent systems.",
    rules: [
      "The presentation should contain a minimum of 10 slides and a maximum of 15 slides",
      "Communication must be strictly in English",
      "Email your presentation to helloworld2k26ppt@gmail.com on or before 10-08-2026"
    ],
    coordinator: "Dr. I. Benjamin Franklin",
    phone: "9876500002",
    phases: ["Registrations Open", "Strictly English", "5 Mins PPT"],
    
    // Manual status/phase overrides (optional)
    isLive: false,
    status: "",
    phase: "",
    winners: []
  },
  {
    index: 3,
    id: "web-development",
    name: "Web Development",
    startTime: "10:30 AM",
    endTime: "11:30 AM",
    date: "10-Aug-2026",
    type: "event",
    venue: "BCA Lab",
    description: "Step into the developer's arena to construct stunning, responsive, and highly interactive user interfaces. Armed with HTML, CSS, and modern JavaScript, participants will design and launch a fully functional webpage based on dynamic assets, images, videos, and prompts delivered on-the-spot. Test your speed, accessibility compliance, and design sensibilities.",
    rules: [],
    coordinator: "Dr. S. Anand Christy",
    phone: "9876500003",
    phases: ["Registrations Open", "HTML/CSS/JS", "1 Hr Limit"],
    
    // Manual status/phase overrides (optional)
    isLive: false,
    status: "",
    phase: "",
    winners: []
  },
  {
    index: 4,
    id: "code-blast",
    name: "Code Blast",
    startTime: "11:30 AM",
    endTime: "12:30 PM",
    date: "10-Aug-2026",
    type: "event",
    venue: "M.Sc. Lab",
    description: "A high-octane coding race: from output to logic. Contestants are challenged to reverse-engineer pre-rendered visual outputs, logic trees, or terminal behaviors back into functional code. Write clean, optimal, and structured algorithms under time pressure using C, C++, Java, or Python. Speed, logic accuracy, and runtime performance define the winner.",
    rules: [
      "An expected output will be provided on the spot to challenge participants' quick thinking and coding efficiency",
      "Contestants must solve the problem using C / C++ / Java / Python",
      "Evaluation will be based on problem-solving ability, speed, coding skills, and execution time",
      "Time Duration: 1 Hour"
    ],
    coordinator: "Dr. Z. John Bernard",
    phone: "9790218338",
    phases: ["Registrations Open", "C/C++/Java/Python", "1 Hr Limit"],
    
    // Manual status/phase overrides (optional)
    isLive: false,
    status: "",
    phase: "",
    winners: []
  },
  {
    index: 5,
    id: "debugging-challenge",
    name: "Debugging Challenge",
    startTime: "03:30 PM",
    endTime: "04:30 PM",
    date: "10-Aug-2026",
    type: "event",
    venue: "M.Sc. Lab",
    description: "The ultimate hunt for bugs and syntax exceptions. Put your code review and optimization skills to the test with broken codebases. Participants must identify, analyze, and repair logical glitches, performance bottlenecks, and structural errors within a restricted timeframe. Only Python language is allowed; clean execution is your final goal.",
    rules: [],
    coordinator: "Dr. J. Robert Adaikalaraj",
    phone: "9944359697",
    phases: ["Registrations Open", "Python Only", "1 Hr Limit"],
    
    // Manual status/phase overrides (optional)
    isLive: false,
    status: "",
    phase: "",
    winners: []
  },
  {
    index: 6,
    id: "sql-query-challenge",
    name: "SQL Query Challenge",
    startTime: "03:30 PM",
    endTime: "04:30 PM",
    date: "10-Aug-2026",
    type: "event",
    venue: "BCA Lab",
    description: "Master the database engine. Navigate complex database relational schemas, optimize join statements, and write advanced queries. ROUND 1 tests your error identification and query debugging speed under Oracle SQL. ROUND 2 challenges you to write multi-table queries that produce exact target output sets. Accuracy and execution speed are paramount.",
    rules: [],
    coordinator: "Dr. Z. John Bernard",
    phone: "9790218338",
    phases: ["Registrations Open", "Oracle SQL", "2 Rounds"],
    
    // Manual status/phase overrides (optional)
    isLive: false,
    status: "",
    phase: "",
    winners: []
  },
  {
    index: 7,
    id: "valedictory",
    name: "Valedictory",
    startTime: "03:45 PM",
    endTime: "04:30 PM",
    date: "10-Aug-2026",
    type: "program",
    venue: "Rev. Fr. P. Paul Raj Kumar Hall",
    description: "The concluding grand ceremony of Hello World '26-'27 Edition. We celebrate the spirit of competition, hard work, and technical innovation. Join us for guest addresses, feedback sharing, and the final distribution of trophies, cash awards, and participation certificates to our outstanding inter-collegiate winners.",
    rules: [],
    coordinator: "Dr. A. John Pradeep Ebenezer",
    phone: "9876500001",
    chiefGuest: "Dr. Jane Smith",
    chiefGuestTitle: "Chief Guest",
    phases: [],
    
    // Manual status/phase overrides (optional)
    isLive: false,
    status: "",
    phase: "",
    winners: []
  }
];
