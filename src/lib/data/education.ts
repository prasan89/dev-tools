// ALL DATA IS FICTIONAL — generated for demonstration and testing purposes only.

// ---------------------------------------------------------------------------
// Education Dataset — students, courses, teachers, schools, subjects, grades,
// exams, assignments, attendance, universities
// ---------------------------------------------------------------------------

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  gpa: number;
  major: string;
  enrollmentYear: number;
  status: 'active' | 'graduated' | 'withdrawn';
  courses: string[];
  advisor: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  department: string;
  instructor: string;
  schedule: string;
  capacity: number;
  enrolled: number;
  prerequisites: string[];
  syllabus: string[];
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
  specialization: string;
  courses: string[];
  officeHours: string;
  yearsExperience: number;
}

export interface School {
  id: string;
  name: string;
  code: string;
  dean: string;
  departments: string[];
  students: number;
  established: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  level: 'introductory' | 'intermediate' | 'advanced';
  credits: number;
  description: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  grade: string;
  gradePoints: number;
  semester: string;
  year: number;
  passed: boolean;
}

export interface ExamRecord {
  id: string;
  courseId: string;
  studentId: string;
  examType: 'midterm' | 'final' | 'quiz';
  score: number;
  maxScore: number;
  percentage: number;
  date: string;
  passed: boolean;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  submittedAt: string | null;
  score: number | null;
  status: 'pending' | 'submitted' | 'graded' | 'late';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
}

export interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  founded: number;
  type: 'public' | 'private';
  students: number;
  ranking: number;
  acceptance_rate: number;
  tuition: number;
  programs: string[];
}

// ---------------------------------------------------------------------------
// Students — 25 records
// ---------------------------------------------------------------------------
export function studentsData(): Student[] {
  return [
    {
      id: 'stu-001',
      name: 'Amelia Hartwell',
      email: 'amelia.hartwell@westlake.edu',
      grade: 'Junior',
      gpa: 3.82,
      major: 'Computer Science',
      enrollmentYear: 2022,
      status: 'active',
      courses: ['crs-001', 'crs-004', 'crs-007', 'crs-010'],
      advisor: 'tch-003',
    },
    {
      id: 'stu-002',
      name: 'Marcus Delgado',
      email: 'marcus.delgado@westlake.edu',
      grade: 'Senior',
      gpa: 3.45,
      major: 'Mathematics',
      enrollmentYear: 2021,
      status: 'active',
      courses: ['crs-002', 'crs-005', 'crs-008'],
      advisor: 'tch-006',
    },
    {
      id: 'stu-003',
      name: 'Priya Nair',
      email: 'priya.nair@westlake.edu',
      grade: 'Sophomore',
      gpa: 3.91,
      major: 'Biology',
      enrollmentYear: 2023,
      status: 'active',
      courses: ['crs-003', 'crs-006', 'crs-009', 'crs-012'],
      advisor: 'tch-009',
    },
    {
      id: 'stu-004',
      name: 'Daniel Kowalski',
      email: 'daniel.kowalski@westlake.edu',
      grade: 'Freshman',
      gpa: 2.97,
      major: 'History',
      enrollmentYear: 2024,
      status: 'active',
      courses: ['crs-001', 'crs-011', 'crs-013'],
      advisor: 'tch-012',
    },
    {
      id: 'stu-005',
      name: 'Sofia Romero',
      email: 'sofia.romero@westlake.edu',
      grade: 'Senior',
      gpa: 3.67,
      major: 'Physics',
      enrollmentYear: 2021,
      status: 'graduated',
      courses: ['crs-002', 'crs-007', 'crs-014'],
      advisor: 'tch-002',
    },
    {
      id: 'stu-006',
      name: 'Ethan Blackwood',
      email: 'ethan.blackwood@westlake.edu',
      grade: 'Junior',
      gpa: 3.14,
      major: 'Economics',
      enrollmentYear: 2022,
      status: 'active',
      courses: ['crs-004', 'crs-015', 'crs-016'],
      advisor: 'tch-007',
    },
    {
      id: 'stu-007',
      name: 'Yuna Kim',
      email: 'yuna.kim@westlake.edu',
      grade: 'Sophomore',
      gpa: 3.55,
      major: 'Chemistry',
      enrollmentYear: 2023,
      status: 'active',
      courses: ['crs-003', 'crs-006', 'crs-017'],
      advisor: 'tch-011',
    },
    {
      id: 'stu-008',
      name: 'Felix Okonkwo',
      email: 'felix.okonkwo@westlake.edu',
      grade: 'Senior',
      gpa: 2.78,
      major: 'Political Science',
      enrollmentYear: 2021,
      status: 'active',
      courses: ['crs-005', 'crs-013', 'crs-018'],
      advisor: 'tch-013',
    },
    {
      id: 'stu-009',
      name: 'Isabella Torres',
      email: 'isabella.torres@westlake.edu',
      grade: 'Freshman',
      gpa: 3.20,
      major: 'Psychology',
      enrollmentYear: 2024,
      status: 'active',
      courses: ['crs-001', 'crs-019', 'crs-020'],
      advisor: 'tch-005',
    },
    {
      id: 'stu-010',
      name: 'Noah Steinberg',
      email: 'noah.steinberg@westlake.edu',
      grade: 'Junior',
      gpa: 3.88,
      major: 'Computer Science',
      enrollmentYear: 2022,
      status: 'active',
      courses: ['crs-001', 'crs-004', 'crs-008', 'crs-010'],
      advisor: 'tch-003',
    },
    {
      id: 'stu-011',
      name: 'Chloe Beaumont',
      email: 'chloe.beaumont@westlake.edu',
      grade: 'Senior',
      gpa: 3.73,
      major: 'English Literature',
      enrollmentYear: 2021,
      status: 'graduated',
      courses: ['crs-011', 'crs-013', 'crs-019'],
      advisor: 'tch-014',
    },
    {
      id: 'stu-012',
      name: 'Ravi Patel',
      email: 'ravi.patel@westlake.edu',
      grade: 'Sophomore',
      gpa: 3.03,
      major: 'Mechanical Engineering',
      enrollmentYear: 2023,
      status: 'active',
      courses: ['crs-002', 'crs-007', 'crs-016'],
      advisor: 'tch-004',
    },
    {
      id: 'stu-013',
      name: 'Natalie Voss',
      email: 'natalie.voss@westlake.edu',
      grade: 'Freshman',
      gpa: 2.60,
      major: 'Sociology',
      enrollmentYear: 2024,
      status: 'withdrawn',
      courses: ['crs-019'],
      advisor: 'tch-008',
    },
    {
      id: 'stu-014',
      name: 'Carlos Medina',
      email: 'carlos.medina@westlake.edu',
      grade: 'Junior',
      gpa: 3.49,
      major: 'Environmental Science',
      enrollmentYear: 2022,
      status: 'active',
      courses: ['crs-003', 'crs-009', 'crs-015', 'crs-017'],
      advisor: 'tch-010',
    },
    {
      id: 'stu-015',
      name: 'Aisha Mbeki',
      email: 'aisha.mbeki@westlake.edu',
      grade: 'Senior',
      gpa: 3.92,
      major: 'Biomedical Engineering',
      enrollmentYear: 2021,
      status: 'active',
      courses: ['crs-003', 'crs-006', 'crs-012', 'crs-018'],
      advisor: 'tch-001',
    },
    {
      id: 'stu-016',
      name: 'Luca Ferretti',
      email: 'luca.ferretti@westlake.edu',
      grade: 'Sophomore',
      gpa: 3.31,
      major: 'Architecture',
      enrollmentYear: 2023,
      status: 'active',
      courses: ['crs-002', 'crs-011', 'crs-014'],
      advisor: 'tch-015',
    },
    {
      id: 'stu-017',
      name: 'Emma Fitzgerald',
      email: 'emma.fitzgerald@westlake.edu',
      grade: 'Junior',
      gpa: 3.60,
      major: 'Nursing',
      enrollmentYear: 2022,
      status: 'active',
      courses: ['crs-006', 'crs-009', 'crs-020'],
      advisor: 'tch-009',
    },
    {
      id: 'stu-018',
      name: 'James Thornton',
      email: 'james.thornton@westlake.edu',
      grade: 'Senior',
      gpa: 2.90,
      major: 'Business Administration',
      enrollmentYear: 2021,
      status: 'active',
      courses: ['crs-004', 'crs-015', 'crs-018'],
      advisor: 'tch-007',
    },
    {
      id: 'stu-019',
      name: 'Mei-Ling Chen',
      email: 'meiling.chen@westlake.edu',
      grade: 'Freshman',
      gpa: 3.75,
      major: 'Data Science',
      enrollmentYear: 2024,
      status: 'active',
      courses: ['crs-001', 'crs-005', 'crs-008'],
      advisor: 'tch-003',
    },
    {
      id: 'stu-020',
      name: 'Oliver Nguyen',
      email: 'oliver.nguyen@westlake.edu',
      grade: 'Sophomore',
      gpa: 3.22,
      major: 'Philosophy',
      enrollmentYear: 2023,
      status: 'active',
      courses: ['crs-013', 'crs-019', 'crs-020'],
      advisor: 'tch-014',
    },
    {
      id: 'stu-021',
      name: 'Fatima Al-Hassan',
      email: 'fatima.alhassan@westlake.edu',
      grade: 'Junior',
      gpa: 3.77,
      major: 'Mathematics',
      enrollmentYear: 2022,
      status: 'active',
      courses: ['crs-002', 'crs-005', 'crs-008', 'crs-010'],
      advisor: 'tch-006',
    },
    {
      id: 'stu-022',
      name: 'Samuel Wright',
      email: 'samuel.wright@westlake.edu',
      grade: 'Senior',
      gpa: 3.05,
      major: 'Physics',
      enrollmentYear: 2021,
      status: 'graduated',
      courses: ['crs-002', 'crs-007', 'crs-016'],
      advisor: 'tch-002',
    },
    {
      id: 'stu-023',
      name: 'Hana Yamazaki',
      email: 'hana.yamazaki@westlake.edu',
      grade: 'Sophomore',
      gpa: 3.44,
      major: 'International Relations',
      enrollmentYear: 2023,
      status: 'active',
      courses: ['crs-011', 'crs-013', 'crs-018'],
      advisor: 'tch-013',
    },
    {
      id: 'stu-024',
      name: 'Brandon Ellis',
      email: 'brandon.ellis@westlake.edu',
      grade: 'Freshman',
      gpa: 2.85,
      major: 'Communications',
      enrollmentYear: 2024,
      status: 'active',
      courses: ['crs-011', 'crs-019', 'crs-020'],
      advisor: 'tch-008',
    },
    {
      id: 'stu-025',
      name: 'Zara Malik',
      email: 'zara.malik@westlake.edu',
      grade: 'Junior',
      gpa: 3.68,
      major: 'Chemical Engineering',
      enrollmentYear: 2022,
      status: 'active',
      courses: ['crs-003', 'crs-006', 'crs-017'],
      advisor: 'tch-011',
    },
  ];
}

// ---------------------------------------------------------------------------
// Courses — 20 records
// ---------------------------------------------------------------------------
export function coursesData(): Course[] {
  return [
    {
      id: 'crs-001',
      code: 'CS101',
      name: 'Introduction to Programming',
      description: 'Fundamentals of programming using Python, covering variables, control flow, functions, and basic data structures.',
      credits: 3,
      department: 'Computer Science',
      instructor: 'tch-003',
      schedule: 'Mon/Wed 9:00–10:30',
      capacity: 35,
      enrolled: 32,
      prerequisites: [],
      syllabus: ['Python basics', 'Control flow', 'Functions', 'Lists and dicts', 'File I/O', 'Introduction to OOP'],
    },
    {
      id: 'crs-002',
      code: 'PHY201',
      name: 'Classical Mechanics',
      description: 'Newton\'s laws, kinematics, dynamics, energy, momentum, and rotational motion.',
      credits: 4,
      department: 'Physics',
      instructor: 'tch-002',
      schedule: 'Tue/Thu 10:00–11:30',
      capacity: 30,
      enrolled: 28,
      prerequisites: ['crs-005'],
      syllabus: ['Kinematics', 'Newton\'s laws', 'Work and energy', 'Momentum', 'Rotational motion', 'Oscillations'],
    },
    {
      id: 'crs-003',
      code: 'BIO110',
      name: 'General Biology I',
      description: 'Cell biology, genetics, evolution, and ecology — the foundational survey of life sciences.',
      credits: 4,
      department: 'Biology',
      instructor: 'tch-009',
      schedule: 'Mon/Wed/Fri 8:00–9:00',
      capacity: 40,
      enrolled: 38,
      prerequisites: [],
      syllabus: ['Cell structure', 'Metabolism', 'Genetics', 'Evolution', 'Ecology', 'Classification of life'],
    },
    {
      id: 'crs-004',
      code: 'BUS301',
      name: 'Principles of Management',
      description: 'Planning, organizing, leading, and controlling in modern organizations.',
      credits: 3,
      department: 'Business',
      instructor: 'tch-007',
      schedule: 'Tue/Thu 13:00–14:30',
      capacity: 45,
      enrolled: 41,
      prerequisites: [],
      syllabus: ['Management theory', 'Planning', 'Organizational structure', 'Leadership', 'Motivation', 'Control systems'],
    },
    {
      id: 'crs-005',
      code: 'MTH201',
      name: 'Calculus I',
      description: 'Limits, derivatives, integrals, and the fundamental theorem of calculus.',
      credits: 4,
      department: 'Mathematics',
      instructor: 'tch-006',
      schedule: 'Mon/Wed/Fri 11:00–12:00',
      capacity: 35,
      enrolled: 34,
      prerequisites: [],
      syllabus: ['Limits', 'Continuity', 'Derivatives', 'Differentiation rules', 'Applications of derivatives', 'Integration'],
    },
    {
      id: 'crs-006',
      code: 'CHM201',
      name: 'Organic Chemistry I',
      description: 'Structure, reactivity, and synthesis of organic compounds with emphasis on reaction mechanisms.',
      credits: 4,
      department: 'Chemistry',
      instructor: 'tch-011',
      schedule: 'Tue/Thu 9:00–10:30',
      capacity: 28,
      enrolled: 25,
      prerequisites: ['crs-003'],
      syllabus: ['Molecular structure', 'Alkanes', 'Stereochemistry', 'Substitution reactions', 'Elimination reactions', 'Alkenes'],
    },
    {
      id: 'crs-007',
      code: 'CS301',
      name: 'Data Structures and Algorithms',
      description: 'Arrays, linked lists, trees, graphs, sorting, and searching with complexity analysis.',
      credits: 3,
      department: 'Computer Science',
      instructor: 'tch-003',
      schedule: 'Mon/Wed 14:00–15:30',
      capacity: 30,
      enrolled: 29,
      prerequisites: ['crs-001'],
      syllabus: ['Arrays and strings', 'Linked lists', 'Stacks and queues', 'Trees', 'Graphs', 'Sorting algorithms', 'Big-O notation'],
    },
    {
      id: 'crs-008',
      code: 'MTH301',
      name: 'Linear Algebra',
      description: 'Vectors, matrices, linear transformations, eigenvalues, and applications.',
      credits: 3,
      department: 'Mathematics',
      instructor: 'tch-006',
      schedule: 'Tue/Thu 11:00–12:30',
      capacity: 32,
      enrolled: 30,
      prerequisites: ['crs-005'],
      syllabus: ['Vectors', 'Matrix operations', 'Determinants', 'Linear transformations', 'Eigenvalues', 'Orthogonality'],
    },
    {
      id: 'crs-009',
      code: 'ENV201',
      name: 'Environmental Systems',
      description: 'Interactions among atmosphere, hydrosphere, lithosphere, and biosphere.',
      credits: 3,
      department: 'Environmental Science',
      instructor: 'tch-010',
      schedule: 'Mon/Wed 11:00–12:30',
      capacity: 35,
      enrolled: 32,
      prerequisites: ['crs-003'],
      syllabus: ['Earth systems', 'Biogeochemical cycles', 'Climate', 'Water resources', 'Biodiversity', 'Human impact'],
    },
    {
      id: 'crs-010',
      code: 'CS401',
      name: 'Machine Learning',
      description: 'Supervised and unsupervised learning, neural networks, and model evaluation.',
      credits: 3,
      department: 'Computer Science',
      instructor: 'tch-003',
      schedule: 'Fri 9:00–12:00',
      capacity: 25,
      enrolled: 24,
      prerequisites: ['crs-007', 'crs-008'],
      syllabus: ['Linear regression', 'Classification', 'Decision trees', 'Neural networks', 'Clustering', 'Model evaluation'],
    },
    {
      id: 'crs-011',
      code: 'ENG101',
      name: 'Composition and Rhetoric',
      description: 'Essay writing, argumentation, research methods, and academic style.',
      credits: 3,
      department: 'English',
      instructor: 'tch-014',
      schedule: 'Mon/Wed/Fri 10:00–11:00',
      capacity: 25,
      enrolled: 23,
      prerequisites: [],
      syllabus: ['Academic writing', 'Thesis development', 'Argument structure', 'Research strategies', 'Citation and documentation', 'Revision'],
    },
    {
      id: 'crs-012',
      code: 'BIO320',
      name: 'Molecular Biology',
      description: 'DNA replication, transcription, translation, and gene regulation at the molecular level.',
      credits: 4,
      department: 'Biology',
      instructor: 'tch-009',
      schedule: 'Tue/Thu 14:00–15:30',
      capacity: 24,
      enrolled: 22,
      prerequisites: ['crs-003', 'crs-006'],
      syllabus: ['DNA structure', 'Replication', 'Transcription', 'Translation', 'Gene regulation', 'Recombinant DNA'],
    },
    {
      id: 'crs-013',
      code: 'POL201',
      name: 'Comparative Politics',
      description: 'Political systems, institutions, and behavior across democratic and authoritarian states.',
      credits: 3,
      department: 'Political Science',
      instructor: 'tch-013',
      schedule: 'Mon/Wed 13:00–14:30',
      capacity: 40,
      enrolled: 37,
      prerequisites: [],
      syllabus: ['Political systems', 'Democratic theory', 'Voting behavior', 'Parties and elections', 'Authoritarianism', 'Comparative methods'],
    },
    {
      id: 'crs-014',
      code: 'ARC201',
      name: 'Architectural Design I',
      description: 'Basic design principles, spatial reasoning, and studio practice in architecture.',
      credits: 5,
      department: 'Architecture',
      instructor: 'tch-015',
      schedule: 'Mon/Wed/Fri 14:00–16:30',
      capacity: 18,
      enrolled: 16,
      prerequisites: [],
      syllabus: ['Design process', 'Sketching', 'Scale and proportion', 'Space and form', 'Site analysis', 'Model making'],
    },
    {
      id: 'crs-015',
      code: 'ECO301',
      name: 'Microeconomics',
      description: 'Supply and demand, consumer theory, firm behavior, market structures, and welfare economics.',
      credits: 3,
      department: 'Economics',
      instructor: 'tch-007',
      schedule: 'Tue/Thu 15:00–16:30',
      capacity: 45,
      enrolled: 43,
      prerequisites: ['crs-005'],
      syllabus: ['Supply and demand', 'Elasticity', 'Consumer theory', 'Production theory', 'Market structures', 'Game theory'],
    },
    {
      id: 'crs-016',
      code: 'ME301',
      name: 'Thermodynamics',
      description: 'Laws of thermodynamics, heat transfer, work, and thermodynamic cycles.',
      credits: 4,
      department: 'Mechanical Engineering',
      instructor: 'tch-004',
      schedule: 'Mon/Wed/Fri 9:00–10:00',
      capacity: 30,
      enrolled: 27,
      prerequisites: ['crs-002', 'crs-005'],
      syllabus: ['Zeroth and first law', 'Second law', 'Entropy', 'Power cycles', 'Refrigeration', 'Heat transfer'],
    },
    {
      id: 'crs-017',
      code: 'CHM301',
      name: 'Physical Chemistry',
      description: 'Thermodynamics, kinetics, quantum mechanics, and spectroscopy applied to chemical systems.',
      credits: 4,
      department: 'Chemistry',
      instructor: 'tch-011',
      schedule: 'Tue/Thu 13:00–14:30',
      capacity: 24,
      enrolled: 20,
      prerequisites: ['crs-005', 'crs-006'],
      syllabus: ['Chemical thermodynamics', 'Chemical kinetics', 'Quantum mechanics', 'Spectroscopy', 'Statistical mechanics', 'Electrochemistry'],
    },
    {
      id: 'crs-018',
      code: 'NUR201',
      name: 'Health Assessment',
      description: 'Systematic patient assessment skills including history-taking, physical examination, and documentation.',
      credits: 3,
      department: 'Nursing',
      instructor: 'tch-001',
      schedule: 'Wed/Fri 10:00–12:00',
      capacity: 20,
      enrolled: 19,
      prerequisites: ['crs-003'],
      syllabus: ['Health history', 'Physical examination', 'Vital signs', 'Systems review', 'Documentation', 'Clinical reasoning'],
    },
    {
      id: 'crs-019',
      code: 'PSY101',
      name: 'Introduction to Psychology',
      description: 'Major theories, research methods, and key findings across all subfields of psychology.',
      credits: 3,
      department: 'Psychology',
      instructor: 'tch-005',
      schedule: 'Mon/Wed 15:00–16:30',
      capacity: 50,
      enrolled: 48,
      prerequisites: [],
      syllabus: ['History and methods', 'Neuroscience', 'Sensation and perception', 'Learning', 'Memory', 'Social psychology', 'Disorders'],
    },
    {
      id: 'crs-020',
      code: 'SOC101',
      name: 'Introduction to Sociology',
      description: 'Social structures, institutions, inequality, culture, and sociological perspectives.',
      credits: 3,
      department: 'Sociology',
      instructor: 'tch-008',
      schedule: 'Tue/Thu 8:00–9:30',
      capacity: 45,
      enrolled: 42,
      prerequisites: [],
      syllabus: ['Sociological imagination', 'Culture', 'Social structure', 'Stratification', 'Race and ethnicity', 'Deviance', 'Social change'],
    },
  ];
}

// ---------------------------------------------------------------------------
// Teachers — 15 records
// ---------------------------------------------------------------------------
export function teachersData(): Teacher[] {
  return [
    {
      id: 'tch-001',
      name: 'Dr. Patricia Osei',
      email: 'p.osei@westlake.edu',
      department: 'Nursing',
      title: 'Associate Professor',
      specialization: 'Critical Care Nursing',
      courses: ['crs-018'],
      officeHours: 'Mon/Wed 13:00–15:00',
      yearsExperience: 14,
    },
    {
      id: 'tch-002',
      name: 'Prof. Alan Svensson',
      email: 'a.svensson@westlake.edu',
      department: 'Physics',
      title: 'Professor',
      specialization: 'Quantum Mechanics',
      courses: ['crs-002'],
      officeHours: 'Tue/Thu 14:00–16:00',
      yearsExperience: 22,
    },
    {
      id: 'tch-003',
      name: 'Dr. Sandra Leung',
      email: 's.leung@westlake.edu',
      department: 'Computer Science',
      title: 'Associate Professor',
      specialization: 'Artificial Intelligence',
      courses: ['crs-001', 'crs-007', 'crs-010'],
      officeHours: 'Mon/Fri 11:00–13:00',
      yearsExperience: 11,
    },
    {
      id: 'tch-004',
      name: 'Prof. Marcus Holden',
      email: 'm.holden@westlake.edu',
      department: 'Mechanical Engineering',
      title: 'Professor',
      specialization: 'Thermal Engineering',
      courses: ['crs-016'],
      officeHours: 'Wed/Fri 9:00–11:00',
      yearsExperience: 18,
    },
    {
      id: 'tch-005',
      name: 'Dr. Laura Vincenzo',
      email: 'l.vincenzo@westlake.edu',
      department: 'Psychology',
      title: 'Assistant Professor',
      specialization: 'Cognitive Psychology',
      courses: ['crs-019'],
      officeHours: 'Tue 14:00–17:00',
      yearsExperience: 7,
    },
    {
      id: 'tch-006',
      name: 'Prof. James Okafor',
      email: 'j.okafor@westlake.edu',
      department: 'Mathematics',
      title: 'Professor',
      specialization: 'Functional Analysis',
      courses: ['crs-005', 'crs-008'],
      officeHours: 'Mon/Wed/Fri 13:00–14:00',
      yearsExperience: 27,
    },
    {
      id: 'tch-007',
      name: 'Dr. Rebecca Chan',
      email: 'r.chan@westlake.edu',
      department: 'Business',
      title: 'Associate Professor',
      specialization: 'Organizational Behavior',
      courses: ['crs-004', 'crs-015'],
      officeHours: 'Thu 9:00–12:00',
      yearsExperience: 13,
    },
    {
      id: 'tch-008',
      name: 'Dr. Thomas Adeyemi',
      email: 't.adeyemi@westlake.edu',
      department: 'Sociology',
      title: 'Assistant Professor',
      specialization: 'Social Stratification',
      courses: ['crs-020'],
      officeHours: 'Tue/Thu 10:00–12:00',
      yearsExperience: 6,
    },
    {
      id: 'tch-009',
      name: 'Prof. Helen Park',
      email: 'h.park@westlake.edu',
      department: 'Biology',
      title: 'Professor',
      specialization: 'Molecular Genetics',
      courses: ['crs-003', 'crs-012'],
      officeHours: 'Mon/Wed 14:00–16:00',
      yearsExperience: 20,
    },
    {
      id: 'tch-010',
      name: 'Dr. Carlos Fuentes',
      email: 'c.fuentes@westlake.edu',
      department: 'Environmental Science',
      title: 'Associate Professor',
      specialization: 'Climate Systems',
      courses: ['crs-009'],
      officeHours: 'Fri 10:00–13:00',
      yearsExperience: 9,
    },
    {
      id: 'tch-011',
      name: 'Prof. Naomi Strauss',
      email: 'n.strauss@westlake.edu',
      department: 'Chemistry',
      title: 'Professor',
      specialization: 'Synthetic Organic Chemistry',
      courses: ['crs-006', 'crs-017'],
      officeHours: 'Tue/Thu 11:00–13:00',
      yearsExperience: 16,
    },
    {
      id: 'tch-012',
      name: 'Dr. Peter Abramov',
      email: 'p.abramov@westlake.edu',
      department: 'History',
      title: 'Associate Professor',
      specialization: 'Modern European History',
      courses: [],
      officeHours: 'Mon 10:00–13:00',
      yearsExperience: 12,
    },
    {
      id: 'tch-013',
      name: 'Prof. Diane Mbatha',
      email: 'd.mbatha@westlake.edu',
      department: 'Political Science',
      title: 'Professor',
      specialization: 'International Relations',
      courses: ['crs-013'],
      officeHours: 'Wed 13:00–16:00',
      yearsExperience: 19,
    },
    {
      id: 'tch-014',
      name: 'Dr. Robert Sinclair',
      email: 'r.sinclair@westlake.edu',
      department: 'English',
      title: 'Associate Professor',
      specialization: 'Rhetoric and Composition',
      courses: ['crs-011'],
      officeHours: 'Tue/Thu 14:30–16:30',
      yearsExperience: 10,
    },
    {
      id: 'tch-015',
      name: 'Prof. Amara Diallo',
      email: 'a.diallo@westlake.edu',
      department: 'Architecture',
      title: 'Professor',
      specialization: 'Urban Design',
      courses: ['crs-014'],
      officeHours: 'Mon/Fri 15:00–17:00',
      yearsExperience: 24,
    },
  ];
}

// ---------------------------------------------------------------------------
// Schools / Departments — 10 records
// ---------------------------------------------------------------------------
export function schoolsData(): School[] {
  return [
    {
      id: 'sch-001',
      name: 'School of Science',
      code: 'SCI',
      dean: 'Prof. Alan Svensson',
      departments: ['Physics', 'Biology', 'Chemistry', 'Environmental Science'],
      students: 780,
      established: 1952,
    },
    {
      id: 'sch-002',
      name: 'School of Engineering',
      code: 'ENG',
      dean: 'Prof. Marcus Holden',
      departments: ['Mechanical Engineering', 'Biomedical Engineering', 'Chemical Engineering'],
      students: 640,
      established: 1958,
    },
    {
      id: 'sch-003',
      name: 'School of Computing',
      code: 'COMP',
      dean: 'Dr. Sandra Leung',
      departments: ['Computer Science', 'Data Science', 'Information Systems'],
      students: 520,
      established: 1984,
    },
    {
      id: 'sch-004',
      name: 'School of Business',
      code: 'BUS',
      dean: 'Dr. Rebecca Chan',
      departments: ['Business Administration', 'Economics', 'Finance', 'Marketing'],
      students: 910,
      established: 1947,
    },
    {
      id: 'sch-005',
      name: 'School of Arts and Humanities',
      code: 'ART',
      dean: 'Dr. Robert Sinclair',
      departments: ['English', 'History', 'Philosophy', 'Architecture'],
      students: 450,
      established: 1942,
    },
    {
      id: 'sch-006',
      name: 'School of Social Sciences',
      code: 'SOC',
      dean: 'Prof. Diane Mbatha',
      departments: ['Political Science', 'Sociology', 'Psychology', 'International Relations'],
      students: 670,
      established: 1960,
    },
    {
      id: 'sch-007',
      name: 'School of Health Sciences',
      code: 'HLTH',
      dean: 'Dr. Patricia Osei',
      departments: ['Nursing', 'Public Health', 'Nutrition'],
      students: 390,
      established: 1970,
    },
    {
      id: 'sch-008',
      name: 'School of Mathematics',
      code: 'MTH',
      dean: 'Prof. James Okafor',
      departments: ['Mathematics', 'Statistics', 'Applied Mathematics'],
      students: 310,
      established: 1950,
    },
    {
      id: 'sch-009',
      name: 'School of Environmental Studies',
      code: 'ENV',
      dean: 'Dr. Carlos Fuentes',
      departments: ['Environmental Science', 'Geography', 'Sustainability'],
      students: 280,
      established: 1978,
    },
    {
      id: 'sch-010',
      name: 'School of Communications',
      code: 'COM',
      dean: 'Dr. Thomas Adeyemi',
      departments: ['Communications', 'Journalism', 'Media Studies'],
      students: 360,
      established: 1968,
    },
  ];
}

// ---------------------------------------------------------------------------
// Subjects — 25 records
// ---------------------------------------------------------------------------
export function subjectsData(): Subject[] {
  return [
    {
      id: 'sub-001',
      name: 'Introduction to Algebra',
      code: 'MTH100',
      department: 'Mathematics',
      level: 'introductory',
      credits: 3,
      description: 'Core algebraic operations, equations, inequalities, and functions.',
    },
    {
      id: 'sub-002',
      name: 'Calculus I',
      code: 'MTH201',
      department: 'Mathematics',
      level: 'intermediate',
      credits: 4,
      description: 'Limits, derivatives, and integration of single-variable functions.',
    },
    {
      id: 'sub-003',
      name: 'Multivariable Calculus',
      code: 'MTH302',
      department: 'Mathematics',
      level: 'advanced',
      credits: 4,
      description: 'Partial derivatives, multiple integrals, vector calculus, and Stokes\' theorem.',
    },
    {
      id: 'sub-004',
      name: 'Introduction to Programming',
      code: 'CS101',
      department: 'Computer Science',
      level: 'introductory',
      credits: 3,
      description: 'Programming logic, algorithms, and Python fundamentals.',
    },
    {
      id: 'sub-005',
      name: 'Data Structures',
      code: 'CS201',
      department: 'Computer Science',
      level: 'intermediate',
      credits: 3,
      description: 'Arrays, linked lists, trees, and graph data structures.',
    },
    {
      id: 'sub-006',
      name: 'Operating Systems',
      code: 'CS401',
      department: 'Computer Science',
      level: 'advanced',
      credits: 3,
      description: 'Process management, memory, file systems, and concurrency.',
    },
    {
      id: 'sub-007',
      name: 'General Chemistry',
      code: 'CHM101',
      department: 'Chemistry',
      level: 'introductory',
      credits: 4,
      description: 'Atoms, bonding, stoichiometry, and states of matter.',
    },
    {
      id: 'sub-008',
      name: 'Organic Chemistry',
      code: 'CHM201',
      department: 'Chemistry',
      level: 'intermediate',
      credits: 4,
      description: 'Organic reactions, functional groups, and synthesis strategies.',
    },
    {
      id: 'sub-009',
      name: 'Advanced Inorganic Chemistry',
      code: 'CHM401',
      department: 'Chemistry',
      level: 'advanced',
      credits: 3,
      description: 'Coordination chemistry, organometallics, and reaction mechanisms.',
    },
    {
      id: 'sub-010',
      name: 'Introduction to Physics',
      code: 'PHY101',
      department: 'Physics',
      level: 'introductory',
      credits: 4,
      description: 'Mechanics, waves, and introductory thermodynamics without calculus.',
    },
    {
      id: 'sub-011',
      name: 'Electromagnetism',
      code: 'PHY301',
      department: 'Physics',
      level: 'intermediate',
      credits: 4,
      description: 'Electric and magnetic fields, Maxwell\'s equations, and circuits.',
    },
    {
      id: 'sub-012',
      name: 'Quantum Physics',
      code: 'PHY401',
      department: 'Physics',
      level: 'advanced',
      credits: 3,
      description: 'Wave-particle duality, Schrödinger equation, and quantum states.',
    },
    {
      id: 'sub-013',
      name: 'General Biology',
      code: 'BIO101',
      department: 'Biology',
      level: 'introductory',
      credits: 4,
      description: 'Cell biology, genetics, and ecology survey.',
    },
    {
      id: 'sub-014',
      name: 'Genetics',
      code: 'BIO301',
      department: 'Biology',
      level: 'intermediate',
      credits: 3,
      description: 'Mendelian and molecular genetics, inheritance patterns.',
    },
    {
      id: 'sub-015',
      name: 'Neuroscience',
      code: 'BIO401',
      department: 'Biology',
      level: 'advanced',
      credits: 3,
      description: 'Neural signaling, brain anatomy, and cognitive neuroscience foundations.',
    },
    {
      id: 'sub-016',
      name: 'Principles of Economics',
      code: 'ECO101',
      department: 'Economics',
      level: 'introductory',
      credits: 3,
      description: 'Supply, demand, markets, and macroeconomic concepts.',
    },
    {
      id: 'sub-017',
      name: 'Microeconomics',
      code: 'ECO201',
      department: 'Economics',
      level: 'intermediate',
      credits: 3,
      description: 'Consumer and producer theory, market structures.',
    },
    {
      id: 'sub-018',
      name: 'Econometrics',
      code: 'ECO401',
      department: 'Economics',
      level: 'advanced',
      credits: 3,
      description: 'Regression, time series, and causal inference in economics.',
    },
    {
      id: 'sub-019',
      name: 'World History',
      code: 'HIS101',
      department: 'History',
      level: 'introductory',
      credits: 3,
      description: 'Survey of major civilizations and historical events from antiquity to modernity.',
    },
    {
      id: 'sub-020',
      name: 'Modern European History',
      code: 'HIS301',
      department: 'History',
      level: 'intermediate',
      credits: 3,
      description: 'Revolutionary movements, world wars, and post-war reconstruction in Europe.',
    },
    {
      id: 'sub-021',
      name: 'Introduction to Psychology',
      code: 'PSY101',
      department: 'Psychology',
      level: 'introductory',
      credits: 3,
      description: 'Overview of psychological theories, research, and applications.',
    },
    {
      id: 'sub-022',
      name: 'Abnormal Psychology',
      code: 'PSY301',
      department: 'Psychology',
      level: 'intermediate',
      credits: 3,
      description: 'Psychological disorders, DSM classifications, and treatment approaches.',
    },
    {
      id: 'sub-023',
      name: 'Composition and Rhetoric',
      code: 'ENG101',
      department: 'English',
      level: 'introductory',
      credits: 3,
      description: 'Academic writing, argumentation, and research skills.',
    },
    {
      id: 'sub-024',
      name: 'Environmental Policy',
      code: 'ENV301',
      department: 'Environmental Science',
      level: 'intermediate',
      credits: 3,
      description: 'Policy frameworks, environmental law, and sustainability governance.',
    },
    {
      id: 'sub-025',
      name: 'Bioethics',
      code: 'NUR401',
      department: 'Nursing',
      level: 'advanced',
      credits: 3,
      description: 'Ethical decision-making in clinical practice, patient rights, and research ethics.',
    },
  ];
}

// ---------------------------------------------------------------------------
// Grade Records — 30 records
// ---------------------------------------------------------------------------
export function gradesData(): GradeRecord[] {
  return [
    { id: 'grd-001', studentId: 'stu-001', courseId: 'crs-001', courseName: 'Introduction to Programming', grade: 'A', gradePoints: 4.0, semester: 'Fall', year: 2022, passed: true },
    { id: 'grd-002', studentId: 'stu-001', courseId: 'crs-004', courseName: 'Principles of Management', grade: 'B+', gradePoints: 3.3, semester: 'Spring', year: 2023, passed: true },
    { id: 'grd-003', studentId: 'stu-002', courseId: 'crs-005', courseName: 'Calculus I', grade: 'A-', gradePoints: 3.7, semester: 'Fall', year: 2021, passed: true },
    { id: 'grd-004', studentId: 'stu-002', courseId: 'crs-008', courseName: 'Linear Algebra', grade: 'B', gradePoints: 3.0, semester: 'Spring', year: 2022, passed: true },
    { id: 'grd-005', studentId: 'stu-003', courseId: 'crs-003', courseName: 'General Biology I', grade: 'A', gradePoints: 4.0, semester: 'Fall', year: 2023, passed: true },
    { id: 'grd-006', studentId: 'stu-003', courseId: 'crs-006', courseName: 'Organic Chemistry I', grade: 'A-', gradePoints: 3.7, semester: 'Spring', year: 2024, passed: true },
    { id: 'grd-007', studentId: 'stu-004', courseId: 'crs-001', courseName: 'Introduction to Programming', grade: 'C+', gradePoints: 2.3, semester: 'Fall', year: 2024, passed: true },
    { id: 'grd-008', studentId: 'stu-005', courseId: 'crs-002', courseName: 'Classical Mechanics', grade: 'A-', gradePoints: 3.7, semester: 'Fall', year: 2021, passed: true },
    { id: 'grd-009', studentId: 'stu-005', courseId: 'crs-007', courseName: 'Data Structures and Algorithms', grade: 'B+', gradePoints: 3.3, semester: 'Spring', year: 2022, passed: true },
    { id: 'grd-010', studentId: 'stu-006', courseId: 'crs-004', courseName: 'Principles of Management', grade: 'B', gradePoints: 3.0, semester: 'Fall', year: 2022, passed: true },
    { id: 'grd-011', studentId: 'stu-007', courseId: 'crs-003', courseName: 'General Biology I', grade: 'B+', gradePoints: 3.3, semester: 'Fall', year: 2023, passed: true },
    { id: 'grd-012', studentId: 'stu-007', courseId: 'crs-006', courseName: 'Organic Chemistry I', grade: 'B', gradePoints: 3.0, semester: 'Spring', year: 2024, passed: true },
    { id: 'grd-013', studentId: 'stu-008', courseId: 'crs-005', courseName: 'Calculus I', grade: 'C', gradePoints: 2.0, semester: 'Fall', year: 2021, passed: true },
    { id: 'grd-014', studentId: 'stu-008', courseId: 'crs-013', courseName: 'Comparative Politics', grade: 'B-', gradePoints: 2.7, semester: 'Spring', year: 2022, passed: true },
    { id: 'grd-015', studentId: 'stu-009', courseId: 'crs-019', courseName: 'Introduction to Psychology', grade: 'B+', gradePoints: 3.3, semester: 'Fall', year: 2024, passed: true },
    { id: 'grd-016', studentId: 'stu-010', courseId: 'crs-001', courseName: 'Introduction to Programming', grade: 'A', gradePoints: 4.0, semester: 'Fall', year: 2022, passed: true },
    { id: 'grd-017', studentId: 'stu-010', courseId: 'crs-007', courseName: 'Data Structures and Algorithms', grade: 'A-', gradePoints: 3.7, semester: 'Spring', year: 2023, passed: true },
    { id: 'grd-018', studentId: 'stu-011', courseId: 'crs-011', courseName: 'Composition and Rhetoric', grade: 'A', gradePoints: 4.0, semester: 'Fall', year: 2021, passed: true },
    { id: 'grd-019', studentId: 'stu-012', courseId: 'crs-002', courseName: 'Classical Mechanics', grade: 'B-', gradePoints: 2.7, semester: 'Fall', year: 2023, passed: true },
    { id: 'grd-020', studentId: 'stu-013', courseId: 'crs-019', courseName: 'Introduction to Psychology', grade: 'D', gradePoints: 1.0, semester: 'Fall', year: 2024, passed: false },
    { id: 'grd-021', studentId: 'stu-014', courseId: 'crs-003', courseName: 'General Biology I', grade: 'B+', gradePoints: 3.3, semester: 'Fall', year: 2022, passed: true },
    { id: 'grd-022', studentId: 'stu-014', courseId: 'crs-009', courseName: 'Environmental Systems', grade: 'A-', gradePoints: 3.7, semester: 'Spring', year: 2023, passed: true },
    { id: 'grd-023', studentId: 'stu-015', courseId: 'crs-003', courseName: 'General Biology I', grade: 'A', gradePoints: 4.0, semester: 'Fall', year: 2021, passed: true },
    { id: 'grd-024', studentId: 'stu-015', courseId: 'crs-012', courseName: 'Molecular Biology', grade: 'A', gradePoints: 4.0, semester: 'Spring', year: 2022, passed: true },
    { id: 'grd-025', studentId: 'stu-016', courseId: 'crs-014', courseName: 'Architectural Design I', grade: 'B+', gradePoints: 3.3, semester: 'Fall', year: 2023, passed: true },
    { id: 'grd-026', studentId: 'stu-017', courseId: 'crs-006', courseName: 'Organic Chemistry I', grade: 'B', gradePoints: 3.0, semester: 'Fall', year: 2022, passed: true },
    { id: 'grd-027', studentId: 'stu-018', courseId: 'crs-004', courseName: 'Principles of Management', grade: 'C+', gradePoints: 2.3, semester: 'Fall', year: 2021, passed: true },
    { id: 'grd-028', studentId: 'stu-019', courseId: 'crs-001', courseName: 'Introduction to Programming', grade: 'A', gradePoints: 4.0, semester: 'Fall', year: 2024, passed: true },
    { id: 'grd-029', studentId: 'stu-021', courseId: 'crs-005', courseName: 'Calculus I', grade: 'A', gradePoints: 4.0, semester: 'Fall', year: 2022, passed: true },
    { id: 'grd-030', studentId: 'stu-025', courseId: 'crs-006', courseName: 'Organic Chemistry I', grade: 'A-', gradePoints: 3.7, semester: 'Fall', year: 2022, passed: true },
  ];
}

// ---------------------------------------------------------------------------
// Exam Records — 20 records
// ---------------------------------------------------------------------------
export function examsData(): ExamRecord[] {
  return [
    { id: 'exm-001', courseId: 'crs-001', studentId: 'stu-001', examType: 'midterm', score: 88, maxScore: 100, percentage: 88, date: '2022-10-14', passed: true },
    { id: 'exm-002', courseId: 'crs-001', studentId: 'stu-001', examType: 'final', score: 93, maxScore: 100, percentage: 93, date: '2022-12-09', passed: true },
    { id: 'exm-003', courseId: 'crs-005', studentId: 'stu-002', examType: 'midterm', score: 79, maxScore: 100, percentage: 79, date: '2021-10-20', passed: true },
    { id: 'exm-004', courseId: 'crs-005', studentId: 'stu-002', examType: 'final', score: 83, maxScore: 100, percentage: 83, date: '2021-12-15', passed: true },
    { id: 'exm-005', courseId: 'crs-003', studentId: 'stu-003', examType: 'quiz', score: 18, maxScore: 20, percentage: 90, date: '2023-09-29', passed: true },
    { id: 'exm-006', courseId: 'crs-003', studentId: 'stu-003', examType: 'midterm', score: 91, maxScore: 100, percentage: 91, date: '2023-10-18', passed: true },
    { id: 'exm-007', courseId: 'crs-001', studentId: 'stu-004', examType: 'midterm', score: 61, maxScore: 100, percentage: 61, date: '2024-10-11', passed: true },
    { id: 'exm-008', courseId: 'crs-001', studentId: 'stu-004', examType: 'quiz', score: 12, maxScore: 20, percentage: 60, date: '2024-09-20', passed: true },
    { id: 'exm-009', courseId: 'crs-002', studentId: 'stu-005', examType: 'final', score: 86, maxScore: 100, percentage: 86, date: '2021-12-17', passed: true },
    { id: 'exm-010', courseId: 'crs-019', studentId: 'stu-009', examType: 'midterm', score: 77, maxScore: 100, percentage: 77, date: '2024-10-16', passed: true },
    { id: 'exm-011', courseId: 'crs-007', studentId: 'stu-010', examType: 'midterm', score: 90, maxScore: 100, percentage: 90, date: '2023-10-19', passed: true },
    { id: 'exm-012', courseId: 'crs-007', studentId: 'stu-010', examType: 'final', score: 94, maxScore: 100, percentage: 94, date: '2023-12-13', passed: true },
    { id: 'exm-013', courseId: 'crs-011', studentId: 'stu-011', examType: 'final', score: 96, maxScore: 100, percentage: 96, date: '2021-12-10', passed: true },
    { id: 'exm-014', courseId: 'crs-019', studentId: 'stu-013', examType: 'midterm', score: 45, maxScore: 100, percentage: 45, date: '2024-10-16', passed: false },
    { id: 'exm-015', courseId: 'crs-009', studentId: 'stu-014', examType: 'final', score: 88, maxScore: 100, percentage: 88, date: '2023-12-14', passed: true },
    { id: 'exm-016', courseId: 'crs-012', studentId: 'stu-015', examType: 'midterm', score: 95, maxScore: 100, percentage: 95, date: '2022-10-21', passed: true },
    { id: 'exm-017', courseId: 'crs-006', studentId: 'stu-017', examType: 'quiz', score: 16, maxScore: 20, percentage: 80, date: '2022-09-30', passed: true },
    { id: 'exm-018', courseId: 'crs-001', studentId: 'stu-019', examType: 'midterm', score: 97, maxScore: 100, percentage: 97, date: '2024-10-11', passed: true },
    { id: 'exm-019', courseId: 'crs-005', studentId: 'stu-021', examType: 'final', score: 99, maxScore: 100, percentage: 99, date: '2022-12-16', passed: true },
    { id: 'exm-020', courseId: 'crs-006', studentId: 'stu-025', examType: 'final', score: 87, maxScore: 100, percentage: 87, date: '2022-12-15', passed: true },
  ];
}

// ---------------------------------------------------------------------------
// Assignments — 25 records
// ---------------------------------------------------------------------------
export function assignmentsData(): Assignment[] {
  return [
    { id: 'asg-001', courseId: 'crs-001', title: 'Hello World Program', description: 'Write your first Python script to print and format output.', dueDate: '2024-09-13', maxPoints: 20, submittedAt: '2024-09-12T22:14:00Z', score: 19, status: 'graded' },
    { id: 'asg-002', courseId: 'crs-001', title: 'FizzBuzz Challenge', description: 'Implement the classic FizzBuzz algorithm with proper control flow.', dueDate: '2024-09-27', maxPoints: 25, submittedAt: '2024-09-27T09:05:00Z', score: 23, status: 'graded' },
    { id: 'asg-003', courseId: 'crs-001', title: 'List Comprehensions', description: 'Rewrite five loop-based solutions using list comprehensions.', dueDate: '2024-10-11', maxPoints: 30, submittedAt: null, score: null, status: 'pending' },
    { id: 'asg-004', courseId: 'crs-005', title: 'Limit Worksheet', description: 'Compute ten limits using L\'Hôpital\'s rule and epsilon-delta definition.', dueDate: '2024-09-20', maxPoints: 40, submittedAt: '2024-09-19T17:30:00Z', score: 36, status: 'graded' },
    { id: 'asg-005', courseId: 'crs-005', title: 'Derivative Applications', description: 'Optimization problems using first and second derivative tests.', dueDate: '2024-10-04', maxPoints: 40, submittedAt: '2024-10-06T08:00:00Z', score: 30, status: 'late' },
    { id: 'asg-006', courseId: 'crs-003', title: 'Cell Organelle Report', description: 'Write a two-page report describing five major cell organelles and their functions.', dueDate: '2023-10-06', maxPoints: 30, submittedAt: '2023-10-05T20:00:00Z', score: 28, status: 'graded' },
    { id: 'asg-007', courseId: 'crs-003', title: 'Ecosystem Field Notes', description: 'Observe and document a local ecosystem, identifying producers, consumers, and decomposers.', dueDate: '2023-11-03', maxPoints: 35, submittedAt: '2023-11-03T11:22:00Z', score: 33, status: 'graded' },
    { id: 'asg-008', courseId: 'crs-007', title: 'Linked List Implementation', description: 'Implement a doubly linked list with insert, delete, and reverse operations in Python.', dueDate: '2023-10-06', maxPoints: 50, submittedAt: '2023-10-05T18:44:00Z', score: 48, status: 'graded' },
    { id: 'asg-009', courseId: 'crs-007', title: 'Binary Search Tree', description: 'Build a BST with insert, search, and in-order traversal.', dueDate: '2023-11-03', maxPoints: 50, submittedAt: '2023-11-04T00:10:00Z', score: 44, status: 'late' },
    { id: 'asg-010', courseId: 'crs-004', title: 'Organizational Structure Analysis', description: 'Compare flat and hierarchical organizational structures with real-world examples.', dueDate: '2024-09-27', maxPoints: 30, submittedAt: '2024-09-26T14:00:00Z', score: 27, status: 'graded' },
    { id: 'asg-011', courseId: 'crs-011', title: 'Argumentative Essay Draft', description: 'Write a 1200-word argumentative essay on a contemporary social issue.', dueDate: '2024-10-04', maxPoints: 50, submittedAt: '2024-10-04T23:55:00Z', score: 44, status: 'graded' },
    { id: 'asg-012', courseId: 'crs-011', title: 'Peer Review Reflection', description: 'Review a classmate\'s essay and write a 400-word reflection on the feedback process.', dueDate: '2024-10-18', maxPoints: 20, submittedAt: null, score: null, status: 'pending' },
    { id: 'asg-013', courseId: 'crs-006', title: 'Reaction Mechanism Diagrams', description: 'Draw arrow-pushing mechanisms for ten organic reactions covered in class.', dueDate: '2024-10-11', maxPoints: 40, submittedAt: '2024-10-10T21:00:00Z', score: 36, status: 'graded' },
    { id: 'asg-014', courseId: 'crs-009', title: 'Carbon Cycle Diagram', description: 'Create an annotated diagram of the global carbon cycle including human perturbations.', dueDate: '2024-09-20', maxPoints: 25, submittedAt: '2024-09-20T15:30:00Z', score: 22, status: 'graded' },
    { id: 'asg-015', courseId: 'crs-013', title: 'Comparative Government Essay', description: 'Compare the Westminster and presidential systems in 1000 words.', dueDate: '2024-10-18', maxPoints: 40, submittedAt: null, score: null, status: 'pending' },
    { id: 'asg-016', courseId: 'crs-019', title: 'Case Study: Memory Models', description: 'Analyze the case of H.M. using Atkinson-Shiffrin and other memory models.', dueDate: '2024-10-25', maxPoints: 35, submittedAt: '2024-10-24T19:00:00Z', score: 31, status: 'graded' },
    { id: 'asg-017', courseId: 'crs-020', title: 'Social Institution Analysis', description: 'Pick a social institution and analyze it through a functionalist and conflict theory lens.', dueDate: '2024-09-27', maxPoints: 30, submittedAt: '2024-09-30T08:00:00Z', score: 24, status: 'late' },
    { id: 'asg-018', courseId: 'crs-010', title: 'Linear Regression from Scratch', description: 'Implement gradient descent and linear regression in NumPy without sklearn.', dueDate: '2024-10-18', maxPoints: 60, submittedAt: '2024-10-17T20:30:00Z', score: 57, status: 'graded' },
    { id: 'asg-019', courseId: 'crs-012', title: 'DNA Replication Poster', description: 'Create a visual poster explaining the steps of DNA replication with key enzyme roles.', dueDate: '2024-09-27', maxPoints: 30, submittedAt: '2024-09-27T10:45:00Z', score: 29, status: 'graded' },
    { id: 'asg-020', courseId: 'crs-016', title: 'Carnot Cycle Problem Set', description: 'Solve ten thermodynamic cycle problems including efficiency and entropy calculations.', dueDate: '2024-10-04', maxPoints: 40, submittedAt: '2024-10-04T17:00:00Z', score: 35, status: 'graded' },
    { id: 'asg-021', courseId: 'crs-008', title: 'Eigenvalue Decomposition Exercise', description: 'Find eigenvalues and eigenvectors for five matrices by hand and verify with code.', dueDate: '2024-10-11', maxPoints: 35, submittedAt: null, score: null, status: 'pending' },
    { id: 'asg-022', courseId: 'crs-014', title: 'Site Observation Sketches', description: 'Produce ten observational sketches of the campus environment using perspective techniques.', dueDate: '2024-09-20', maxPoints: 30, submittedAt: '2024-09-19T16:00:00Z', score: 26, status: 'graded' },
    { id: 'asg-023', courseId: 'crs-015', title: 'Market Structure Analysis', description: 'Classify three real industries (oligopoly, monopoly, competition) and justify your choices.', dueDate: '2024-10-25', maxPoints: 30, submittedAt: '2024-10-25T22:00:00Z', score: 27, status: 'submitted' },
    { id: 'asg-024', courseId: 'crs-018', title: 'Head-to-Toe Assessment Report', description: 'Document a simulated head-to-toe physical assessment in clinical SOAP format.', dueDate: '2024-10-18', maxPoints: 50, submittedAt: '2024-10-17T14:00:00Z', score: 46, status: 'graded' },
    { id: 'asg-025', courseId: 'crs-017', title: 'Thermodynamic Calculation Set', description: 'Apply Gibbs free energy and equilibrium constants to five chemical reaction scenarios.', dueDate: '2024-10-25', maxPoints: 40, submittedAt: null, score: null, status: 'pending' },
  ];
}

// ---------------------------------------------------------------------------
// Attendance Records — 30 records
// ---------------------------------------------------------------------------
export function attendanceData(): AttendanceRecord[] {
  return [
    { id: 'att-001', studentId: 'stu-001', courseId: 'crs-001', date: '2024-09-04', status: 'present', notes: '' },
    { id: 'att-002', studentId: 'stu-001', courseId: 'crs-001', date: '2024-09-09', status: 'present', notes: '' },
    { id: 'att-003', studentId: 'stu-001', courseId: 'crs-001', date: '2024-09-11', status: 'late', notes: 'Arrived 10 minutes after start' },
    { id: 'att-004', studentId: 'stu-002', courseId: 'crs-005', date: '2024-09-04', status: 'present', notes: '' },
    { id: 'att-005', studentId: 'stu-002', courseId: 'crs-005', date: '2024-09-09', status: 'absent', notes: 'No prior notice' },
    { id: 'att-006', studentId: 'stu-002', courseId: 'crs-005', date: '2024-09-11', status: 'present', notes: '' },
    { id: 'att-007', studentId: 'stu-003', courseId: 'crs-003', date: '2024-09-04', status: 'present', notes: '' },
    { id: 'att-008', studentId: 'stu-003', courseId: 'crs-003', date: '2024-09-06', status: 'present', notes: '' },
    { id: 'att-009', studentId: 'stu-003', courseId: 'crs-006', date: '2024-09-05', status: 'excused', notes: 'Medical appointment' },
    { id: 'att-010', studentId: 'stu-004', courseId: 'crs-001', date: '2024-09-04', status: 'present', notes: '' },
    { id: 'att-011', studentId: 'stu-004', courseId: 'crs-001', date: '2024-09-09', status: 'absent', notes: 'No notice given' },
    { id: 'att-012', studentId: 'stu-004', courseId: 'crs-001', date: '2024-09-11', status: 'present', notes: '' },
    { id: 'att-013', studentId: 'stu-007', courseId: 'crs-006', date: '2024-09-05', status: 'present', notes: '' },
    { id: 'att-014', studentId: 'stu-007', courseId: 'crs-006', date: '2024-09-10', status: 'present', notes: '' },
    { id: 'att-015', studentId: 'stu-009', courseId: 'crs-019', date: '2024-09-04', status: 'present', notes: '' },
    { id: 'att-016', studentId: 'stu-009', courseId: 'crs-019', date: '2024-09-09', status: 'late', notes: 'Bus delay' },
    { id: 'att-017', studentId: 'stu-010', courseId: 'crs-007', date: '2024-09-04', status: 'present', notes: '' },
    { id: 'att-018', studentId: 'stu-010', courseId: 'crs-007', date: '2024-09-09', status: 'present', notes: '' },
    { id: 'att-019', studentId: 'stu-013', courseId: 'crs-019', date: '2024-09-04', status: 'absent', notes: 'Withdrawal in progress' },
    { id: 'att-020', studentId: 'stu-014', courseId: 'crs-009', date: '2024-09-04', status: 'present', notes: '' },
    { id: 'att-021', studentId: 'stu-014', courseId: 'crs-009', date: '2024-09-09', status: 'present', notes: '' },
    { id: 'att-022', studentId: 'stu-015', courseId: 'crs-012', date: '2024-09-05', status: 'present', notes: '' },
    { id: 'att-023', studentId: 'stu-015', courseId: 'crs-012', date: '2024-09-10', status: 'excused', notes: 'Conference attendance' },
    { id: 'att-024', studentId: 'stu-017', courseId: 'crs-006', date: '2024-09-05', status: 'present', notes: '' },
    { id: 'att-025', studentId: 'stu-017', courseId: 'crs-020', date: '2024-09-04', status: 'present', notes: '' },
    { id: 'att-026', studentId: 'stu-018', courseId: 'crs-015', date: '2024-09-05', status: 'late', notes: 'Overslept' },
    { id: 'att-027', studentId: 'stu-019', courseId: 'crs-001', date: '2024-09-04', status: 'present', notes: '' },
    { id: 'att-028', studentId: 'stu-021', courseId: 'crs-005', date: '2024-09-04', status: 'present', notes: '' },
    { id: 'att-029', studentId: 'stu-024', courseId: 'crs-019', date: '2024-09-04', status: 'present', notes: '' },
    { id: 'att-030', studentId: 'stu-025', courseId: 'crs-006', date: '2024-09-05', status: 'absent', notes: 'Family emergency' },
  ];
}

// ---------------------------------------------------------------------------
// Universities — 15 records (all fictional)
// ---------------------------------------------------------------------------
export function universitiesData(): University[] {
  return [
    {
      id: 'uni-001',
      name: 'Westlake University',
      country: 'USA',
      city: 'Westlake City',
      founded: 1882,
      type: 'private',
      students: 18500,
      ranking: 34,
      acceptance_rate: 0.18,
      tuition: 52000,
      programs: ['Computer Science', 'Engineering', 'Business', 'Biology', 'Law', 'Medicine'],
    },
    {
      id: 'uni-002',
      name: 'Northgate State University',
      country: 'USA',
      city: 'Northgate',
      founded: 1901,
      type: 'public',
      students: 42000,
      ranking: 89,
      acceptance_rate: 0.52,
      tuition: 14000,
      programs: ['Education', 'Agriculture', 'Engineering', 'Arts', 'Nursing', 'Business'],
    },
    {
      id: 'uni-003',
      name: 'Crestwood Institute of Technology',
      country: 'USA',
      city: 'Crestwood',
      founded: 1935,
      type: 'private',
      students: 11200,
      ranking: 21,
      acceptance_rate: 0.12,
      tuition: 61000,
      programs: ['Computer Science', 'Electrical Engineering', 'Physics', 'Mathematics', 'Robotics'],
    },
    {
      id: 'uni-004',
      name: 'University of Maplevale',
      country: 'Canada',
      city: 'Maplevale',
      founded: 1869,
      type: 'public',
      students: 33000,
      ranking: 55,
      acceptance_rate: 0.41,
      tuition: 9800,
      programs: ['Medicine', 'Law', 'Arts', 'Engineering', 'Environmental Studies', 'Business'],
    },
    {
      id: 'uni-005',
      name: 'Thornfield College',
      country: 'UK',
      city: 'Thornfield',
      founded: 1792,
      type: 'private',
      students: 8700,
      ranking: 18,
      acceptance_rate: 0.09,
      tuition: 37000,
      programs: ['Philosophy', 'History', 'Politics', 'Economics', 'Mathematics', 'Classics'],
    },
    {
      id: 'uni-006',
      name: 'Solaris University',
      country: 'Australia',
      city: 'New Solaris',
      founded: 1948,
      type: 'public',
      students: 26000,
      ranking: 72,
      acceptance_rate: 0.47,
      tuition: 11500,
      programs: ['Marine Biology', 'Environmental Science', 'Engineering', 'Business', 'Health Sciences'],
    },
    {
      id: 'uni-007',
      name: 'Bergkamp University',
      country: 'Germany',
      city: 'Bergkamp',
      founded: 1810,
      type: 'public',
      students: 38000,
      ranking: 44,
      acceptance_rate: 0.35,
      tuition: 0,
      programs: ['Engineering', 'Natural Sciences', 'Law', 'Social Sciences', 'Medicine', 'Architecture'],
    },
    {
      id: 'uni-008',
      name: 'Riviera University of Arts',
      country: 'France',
      city: 'Riviera',
      founded: 1887,
      type: 'private',
      students: 7400,
      ranking: 61,
      acceptance_rate: 0.30,
      tuition: 18000,
      programs: ['Fine Arts', 'Architecture', 'Design', 'Film Studies', 'Art History'],
    },
    {
      id: 'uni-009',
      name: 'Sakura National University',
      country: 'Japan',
      city: 'Sakura City',
      founded: 1920,
      type: 'public',
      students: 28500,
      ranking: 38,
      acceptance_rate: 0.22,
      tuition: 5500,
      programs: ['Engineering', 'Economics', 'Agriculture', 'Humanities', 'Medicine', 'Law'],
    },
    {
      id: 'uni-010',
      name: 'Pelican Coast University',
      country: 'Brazil',
      city: 'Pelican Bay',
      founded: 1955,
      type: 'public',
      students: 21000,
      ranking: 130,
      acceptance_rate: 0.58,
      tuition: 3200,
      programs: ['Agriculture', 'Engineering', 'Environmental Science', 'Health Sciences', 'Social Sciences'],
    },
    {
      id: 'uni-011',
      name: 'Ivory Spire University',
      country: 'UK',
      city: 'Ivory',
      founded: 1870,
      type: 'private',
      students: 14000,
      ranking: 27,
      acceptance_rate: 0.14,
      tuition: 42000,
      programs: ['Medicine', 'Computer Science', 'Business', 'Law', 'Natural Sciences', 'Engineering'],
    },
    {
      id: 'uni-012',
      name: 'Verde Valley University',
      country: 'Mexico',
      city: 'Verde Valley',
      founded: 1945,
      type: 'public',
      students: 17000,
      ranking: 148,
      acceptance_rate: 0.62,
      tuition: 2100,
      programs: ['Agriculture', 'Business', 'Engineering', 'Arts', 'Education', 'Law'],
    },
    {
      id: 'uni-013',
      name: 'Edelweiss Technical University',
      country: 'Switzerland',
      city: 'Edelweiss',
      founded: 1904,
      type: 'public',
      students: 9800,
      ranking: 16,
      acceptance_rate: 0.26,
      tuition: 1300,
      programs: ['Mechanical Engineering', 'Chemical Engineering', 'Materials Science', 'Physics', 'Computer Science'],
    },
    {
      id: 'uni-014',
      name: 'Moonrise University of Cape Indigo',
      country: 'South Africa',
      city: 'Cape Indigo',
      founded: 1967,
      type: 'public',
      students: 24000,
      ranking: 175,
      acceptance_rate: 0.49,
      tuition: 4200,
      programs: ['Mining Engineering', 'Agriculture', 'Law', 'Health Sciences', 'Economics', 'Education'],
    },
    {
      id: 'uni-015',
      name: 'Heron Lake University',
      country: 'Canada',
      city: 'Heron Lake',
      founded: 1992,
      type: 'private',
      students: 5600,
      ranking: 210,
      acceptance_rate: 0.68,
      tuition: 22000,
      programs: ['Business', 'Hospitality', 'Communications', 'Design', 'Information Technology'],
    },
  ];
}
