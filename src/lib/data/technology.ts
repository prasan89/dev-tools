// ---------------------------------------------------------------------------
// Technology Data — programming languages, frameworks, cloud, databases, etc.
// ---------------------------------------------------------------------------

// ---- Programming Languages -------------------------------------------------

export interface ProgrammingLanguage {
  name: string;
  year: number;
  paradigm: string[];
  typing: string;
  creator: string;
  popularFor: string[];
  githubStars: string;
  latestVersion: string;
  website: string;
}

export function programmingLanguagesTechData(): ProgrammingLanguage[] {
  return [
    {
      name: 'Python',
      year: 1991,
      paradigm: ['object-oriented', 'functional', 'procedural'],
      typing: 'dynamic, strong',
      creator: 'Guido van Rossum',
      popularFor: ['data science', 'ML/AI', 'web backend', 'scripting', 'automation'],
      githubStars: '~62k',
      latestVersion: '3.12',
      website: 'https://www.python.org',
    },
    {
      name: 'JavaScript',
      year: 1995,
      paradigm: ['event-driven', 'functional', 'object-oriented'],
      typing: 'dynamic, weak',
      creator: 'Brendan Eich',
      popularFor: ['web frontend', 'web backend', 'mobile apps', 'desktop apps'],
      githubStars: 'N/A (ECMA spec)',
      latestVersion: 'ES2024',
      website: 'https://tc39.es',
    },
    {
      name: 'TypeScript',
      year: 2012,
      paradigm: ['object-oriented', 'functional'],
      typing: 'static, strong',
      creator: 'Microsoft (Anders Hejlsberg)',
      popularFor: ['web frontend', 'web backend', 'large-scale apps'],
      githubStars: '~101k',
      latestVersion: '5.4',
      website: 'https://www.typescriptlang.org',
    },
    {
      name: 'Java',
      year: 1995,
      paradigm: ['object-oriented', 'structured'],
      typing: 'static, strong',
      creator: 'James Gosling (Sun Microsystems)',
      popularFor: ['enterprise apps', 'Android', 'web backend', 'big data'],
      githubStars: 'N/A (Oracle)',
      latestVersion: '21',
      website: 'https://www.java.com',
    },
    {
      name: 'C',
      year: 1972,
      paradigm: ['procedural', 'structured'],
      typing: 'static, weak',
      creator: 'Dennis Ritchie (Bell Labs)',
      popularFor: ['operating systems', 'embedded systems', 'system programming'],
      githubStars: 'N/A',
      latestVersion: 'C23',
      website: 'https://www.iso.org/standard/74528.html',
    },
    {
      name: 'C++',
      year: 1985,
      paradigm: ['multi-paradigm', 'object-oriented', 'procedural'],
      typing: 'static, weak',
      creator: 'Bjarne Stroustrup',
      popularFor: ['game development', 'system software', 'high-performance apps'],
      githubStars: 'N/A',
      latestVersion: 'C++23',
      website: 'https://isocpp.org',
    },
    {
      name: 'C#',
      year: 2000,
      paradigm: ['object-oriented', 'functional', 'component-oriented'],
      typing: 'static, strong',
      creator: 'Microsoft (Anders Hejlsberg)',
      popularFor: ['enterprise apps', 'game dev (Unity)', 'web backend', 'Windows apps'],
      githubStars: '~19k',
      latestVersion: '12',
      website: 'https://learn.microsoft.com/en-us/dotnet/csharp/',
    },
    {
      name: 'Go',
      year: 2009,
      paradigm: ['concurrent', 'procedural', 'object-oriented'],
      typing: 'static, strong',
      creator: 'Google (Robert Griesemer, Rob Pike, Ken Thompson)',
      popularFor: ['cloud/infra tools', 'microservices', 'CLI tools', 'DevOps'],
      githubStars: '~124k',
      latestVersion: '1.22',
      website: 'https://go.dev',
    },
    {
      name: 'Rust',
      year: 2010,
      paradigm: ['multi-paradigm', 'functional', 'concurrent'],
      typing: 'static, strong',
      creator: 'Graydon Hoare (Mozilla)',
      popularFor: ['system programming', 'WebAssembly', 'CLI tools', 'embedded'],
      githubStars: '~100k',
      latestVersion: '1.78',
      website: 'https://www.rust-lang.org',
    },
    {
      name: 'PHP',
      year: 1995,
      paradigm: ['imperative', 'object-oriented', 'functional'],
      typing: 'dynamic, weak',
      creator: 'Rasmus Lerdorf',
      popularFor: ['web backend', 'CMS (WordPress)', 'server-side scripting'],
      githubStars: '~38k',
      latestVersion: '8.3',
      website: 'https://www.php.net',
    },
    {
      name: 'Ruby',
      year: 1995,
      paradigm: ['object-oriented', 'functional', 'imperative'],
      typing: 'dynamic, strong',
      creator: 'Yukihiro Matsumoto',
      popularFor: ['web backend (Rails)', 'scripting', 'rapid prototyping'],
      githubStars: '~22k',
      latestVersion: '3.3',
      website: 'https://www.ruby-lang.org',
    },
    {
      name: 'Swift',
      year: 2014,
      paradigm: ['object-oriented', 'functional', 'protocol-oriented'],
      typing: 'static, strong',
      creator: 'Apple (Chris Lattner)',
      popularFor: ['iOS development', 'macOS development', 'system programming'],
      githubStars: '~67k',
      latestVersion: '5.10',
      website: 'https://www.swift.org',
    },
    {
      name: 'Kotlin',
      year: 2011,
      paradigm: ['object-oriented', 'functional'],
      typing: 'static, strong',
      creator: 'JetBrains',
      popularFor: ['Android development', 'web backend', 'multiplatform apps'],
      githubStars: '~49k',
      latestVersion: '2.0',
      website: 'https://kotlinlang.org',
    },
    {
      name: 'Scala',
      year: 2004,
      paradigm: ['functional', 'object-oriented', 'concurrent'],
      typing: 'static, strong',
      creator: 'Martin Odersky',
      popularFor: ['big data (Spark)', 'distributed systems', 'functional programming'],
      githubStars: '~22k',
      latestVersion: '3.4',
      website: 'https://www.scala-lang.org',
    },
    {
      name: 'R',
      year: 1993,
      paradigm: ['functional', 'array', 'object-oriented'],
      typing: 'dynamic, weak',
      creator: 'Ross Ihaka, Robert Gentleman',
      popularFor: ['statistical computing', 'data visualization', 'bioinformatics'],
      githubStars: '~4k',
      latestVersion: '4.4',
      website: 'https://www.r-project.org',
    },
    {
      name: 'Dart',
      year: 2011,
      paradigm: ['object-oriented', 'functional'],
      typing: 'static, strong',
      creator: 'Google',
      popularFor: ['Flutter mobile apps', 'web frontend', 'cross-platform development'],
      githubStars: '~10k',
      latestVersion: '3.3',
      website: 'https://dart.dev',
    },
    {
      name: 'Lua',
      year: 1993,
      paradigm: ['procedural', 'object-oriented', 'functional'],
      typing: 'dynamic, strong',
      creator: 'PUC-Rio (Roberto Ierusalimschy et al.)',
      popularFor: ['game scripting', 'embedded scripting', 'configuration'],
      githubStars: '~8k',
      latestVersion: '5.4',
      website: 'https://www.lua.org',
    },
    {
      name: 'Perl',
      year: 1987,
      paradigm: ['multi-paradigm', 'functional', 'object-oriented'],
      typing: 'dynamic, weak',
      creator: 'Larry Wall',
      popularFor: ['text processing', 'system administration', 'bioinformatics'],
      githubStars: '~2k',
      latestVersion: '5.38',
      website: 'https://www.perl.org',
    },
    {
      name: 'Haskell',
      year: 1990,
      paradigm: ['purely functional', 'lazy', 'strongly typed'],
      typing: 'static, strong',
      creator: 'Haskell Committee',
      popularFor: ['academic research', 'compiler development', 'finance'],
      githubStars: '~3k',
      latestVersion: 'GHC 9.8',
      website: 'https://www.haskell.org',
    },
    {
      name: 'Elixir',
      year: 2011,
      paradigm: ['functional', 'concurrent', 'distributed'],
      typing: 'dynamic, strong',
      creator: 'José Valim',
      popularFor: ['real-time apps', 'distributed systems', 'web backend (Phoenix)'],
      githubStars: '~24k',
      latestVersion: '1.16',
      website: 'https://elixir-lang.org',
    },
    {
      name: 'Clojure',
      year: 2007,
      paradigm: ['functional', 'concurrent', 'lisp'],
      typing: 'dynamic, strong',
      creator: 'Rich Hickey',
      popularFor: ['data processing', 'web backend', 'functional programming'],
      githubStars: '~10k',
      latestVersion: '1.11',
      website: 'https://clojure.org',
    },
    {
      name: 'F#',
      year: 2005,
      paradigm: ['functional', 'object-oriented', 'concurrent'],
      typing: 'static, strong',
      creator: 'Microsoft (Don Syme)',
      popularFor: ['data science', 'finance', '.NET ecosystem', 'functional programming'],
      githubStars: '~4k',
      latestVersion: '8.0',
      website: 'https://fsharp.org',
    },
    {
      name: 'Julia',
      year: 2012,
      paradigm: ['multi-paradigm', 'functional', 'array-oriented'],
      typing: 'dynamic, optional',
      creator: 'Jeff Bezanson, Stefan Karpinski, Viral Shah, Alan Edelman',
      popularFor: ['scientific computing', 'data science', 'numerical analysis'],
      githubStars: '~45k',
      latestVersion: '1.10',
      website: 'https://julialang.org',
    },
    {
      name: 'Groovy',
      year: 2003,
      paradigm: ['object-oriented', 'functional', 'scripting'],
      typing: 'dynamic, strong',
      creator: 'James Strachan',
      popularFor: ['Gradle build scripts', 'Jenkins pipelines', 'JVM scripting'],
      githubStars: '~5k',
      latestVersion: '4.0',
      website: 'https://groovy-lang.org',
    },
    {
      name: 'MATLAB',
      year: 1984,
      paradigm: ['array', 'procedural', 'object-oriented'],
      typing: 'dynamic, weak',
      creator: 'Cleve Moler (MathWorks)',
      popularFor: ['engineering', 'signal processing', 'matrix computation', 'academia'],
      githubStars: 'N/A (commercial)',
      latestVersion: 'R2024a',
      website: 'https://www.mathworks.com/products/matlab.html',
    },
    {
      name: 'Assembly',
      year: 1947,
      paradigm: ['low-level', 'imperative'],
      typing: 'none',
      creator: 'Various (NASM, MASM, GAS, etc.)',
      popularFor: ['embedded systems', 'OS kernels', 'performance-critical code'],
      githubStars: 'N/A',
      latestVersion: 'N/A',
      website: 'https://www.nasm.us',
    },
    {
      name: 'Objective-C',
      year: 1984,
      paradigm: ['object-oriented', 'reflective'],
      typing: 'static, weak',
      creator: 'Brad Cox, Tom Love (Apple)',
      popularFor: ['iOS/macOS legacy apps', 'Cocoa framework'],
      githubStars: 'N/A',
      latestVersion: '2.0',
      website: 'https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/',
    },
    {
      name: 'COBOL',
      year: 1959,
      paradigm: ['procedural', 'object-oriented'],
      typing: 'static, strong',
      creator: 'Grace Hopper (CODASYL)',
      popularFor: ['banking systems', 'government systems', 'mainframe applications'],
      githubStars: 'N/A',
      latestVersion: 'COBOL 2023',
      website: 'https://www.microfocus.com/en-us/what-is/cobol',
    },
    {
      name: 'Fortran',
      year: 1957,
      paradigm: ['procedural', 'array', 'functional'],
      typing: 'static, strong',
      creator: 'John Backus (IBM)',
      popularFor: ['scientific computing', 'numerical simulation', 'HPC'],
      githubStars: 'N/A',
      latestVersion: 'Fortran 2023',
      website: 'https://fortran-lang.org',
    },
    {
      name: 'Zig',
      year: 2016,
      paradigm: ['procedural', 'concurrent'],
      typing: 'static, strong',
      creator: 'Andrew Kelley',
      popularFor: ['system programming', 'embedded', 'replacing C'],
      githubStars: '~32k',
      latestVersion: '0.12',
      website: 'https://ziglang.org',
    },
    {
      name: 'Crystal',
      year: 2014,
      paradigm: ['object-oriented', 'concurrent'],
      typing: 'static, strong',
      creator: 'Ary Borenszweig',
      popularFor: ['web backend', 'CLI tools', 'Ruby-like with performance'],
      githubStars: '~19k',
      latestVersion: '1.12',
      website: 'https://crystal-lang.org',
    },
    {
      name: 'Nim',
      year: 2008,
      paradigm: ['multi-paradigm', 'compiled'],
      typing: 'static, strong',
      creator: 'Andreas Rumpf',
      popularFor: ['system programming', 'scripting', 'game development'],
      githubStars: '~17k',
      latestVersion: '2.0',
      website: 'https://nim-lang.org',
    },
    {
      name: 'Erlang',
      year: 1986,
      paradigm: ['concurrent', 'functional', 'distributed'],
      typing: 'dynamic, strong',
      creator: 'Joe Armstrong, Robert Virding, Mike Williams (Ericsson)',
      popularFor: ['telecom systems', 'distributed apps', 'fault-tolerant systems'],
      githubStars: '~11k',
      latestVersion: '26',
      website: 'https://www.erlang.org',
    },
    {
      name: 'Prolog',
      year: 1972,
      paradigm: ['logic', 'declarative'],
      typing: 'dynamic, strong',
      creator: 'Alain Colmerauer',
      popularFor: ['AI/expert systems', 'NLP', 'constraint solving', 'academic'],
      githubStars: 'N/A',
      latestVersion: 'SWI-Prolog 9.x',
      website: 'https://www.swi-prolog.org',
    },
    {
      name: 'OCaml',
      year: 1996,
      paradigm: ['functional', 'object-oriented', 'imperative'],
      typing: 'static, strong',
      creator: 'INRIA',
      popularFor: ['compilers', 'formal verification', 'finance (Jane Street)'],
      githubStars: '~5k',
      latestVersion: '5.2',
      website: 'https://ocaml.org',
    },
    {
      name: 'VHDL',
      year: 1980,
      paradigm: ['concurrent', 'dataflow', 'structural'],
      typing: 'static, strong',
      creator: 'US Department of Defense',
      popularFor: ['FPGA programming', 'digital circuit design', 'hardware description'],
      githubStars: 'N/A',
      latestVersion: 'VHDL-2019',
      website: 'https://ieeexplore.ieee.org/document/8938196',
    },
    {
      name: 'Verilog',
      year: 1984,
      paradigm: ['concurrent', 'dataflow', 'structural'],
      typing: 'static, weak',
      creator: 'Phil Moorby, Prabhu Goel (Gateway Design Automation)',
      popularFor: ['hardware design', 'FPGA', 'ASIC design', 'digital systems'],
      githubStars: 'N/A',
      latestVersion: 'SystemVerilog 2023',
      website: 'https://ieeexplore.ieee.org/document/10458102',
    },
    {
      name: 'Racket',
      year: 1995,
      paradigm: ['functional', 'object-oriented', 'meta-programming'],
      typing: 'dynamic, strong',
      creator: 'Matthias Felleisen et al.',
      popularFor: ['language-oriented programming', 'education', 'DSL creation'],
      githubStars: '~5k',
      latestVersion: '8.12',
      website: 'https://racket-lang.org',
    },
    {
      name: 'Tcl',
      year: 1988,
      paradigm: ['procedural', 'scripting', 'object-oriented'],
      typing: 'dynamic, weak',
      creator: 'John Ousterhout',
      popularFor: ['GUI scripting (Tk)', 'network testing', 'EDA tools'],
      githubStars: '~3k',
      latestVersion: '8.6',
      website: 'https://www.tcl.tk',
    },
    {
      name: 'Ada',
      year: 1980,
      paradigm: ['structured', 'object-oriented', 'concurrent'],
      typing: 'static, strong',
      creator: 'Jean Ichbiah (DoD / CII Honeywell Bull)',
      popularFor: ['aerospace', 'defense', 'safety-critical systems'],
      githubStars: 'N/A',
      latestVersion: 'Ada 2022',
      website: 'https://www.adacore.com',
    },
  ];
}

// ---- Java Versions ---------------------------------------------------------

export interface JavaVersion {
  version: string;
  releaseDate: string;
  ltsVersion: boolean;
  keyFeatures: string[];
  endOfLife: string;
}

export function javaVersionsData(): JavaVersion[] {
  return [
    {
      version: '1.0',
      releaseDate: 'January 1996',
      ltsVersion: false,
      keyFeatures: ['Initial release', 'Applets', 'AWT', 'java.lang / java.io / java.util'],
      endOfLife: 'N/A',
    },
    {
      version: '1.1',
      releaseDate: 'February 1997',
      ltsVersion: false,
      keyFeatures: ['Inner classes', 'JDBC', 'RMI', 'Reflection API', 'JavaBeans'],
      endOfLife: 'N/A',
    },
    {
      version: '1.2',
      releaseDate: 'December 1998',
      ltsVersion: false,
      keyFeatures: ['Collections Framework', 'JIT compiler', 'Swing GUI', 'Java Plug-in', 'strictfp'],
      endOfLife: 'N/A',
    },
    {
      version: '1.3',
      releaseDate: 'May 2000',
      ltsVersion: false,
      keyFeatures: ['HotSpot JVM', 'JNDI', 'Java Sound API', 'RMI-IIOP'],
      endOfLife: 'N/A',
    },
    {
      version: '1.4',
      releaseDate: 'February 2002',
      ltsVersion: false,
      keyFeatures: ['assert keyword', 'Regular expressions', 'NIO', 'Logging API', 'XML/XSLT'],
      endOfLife: 'October 2008',
    },
    {
      version: '5',
      releaseDate: 'September 2004',
      ltsVersion: false,
      keyFeatures: ['Generics', 'Annotations', 'Autoboxing', 'Enums', 'Varargs', 'Enhanced for loop', 'Static imports'],
      endOfLife: 'November 2009',
    },
    {
      version: '6',
      releaseDate: 'December 2006',
      ltsVersion: false,
      keyFeatures: ['Scripting API', 'JDBC 4.0', 'JAX-WS 2.0', 'Compiler API', 'Pluggable annotation processing'],
      endOfLife: 'February 2013',
    },
    {
      version: '7',
      releaseDate: 'July 2011',
      ltsVersion: false,
      keyFeatures: ['Diamond operator', 'try-with-resources', 'NIO.2', 'Switch on strings', 'Fork/Join framework'],
      endOfLife: 'April 2015',
    },
    {
      version: '8',
      releaseDate: 'March 2014',
      ltsVersion: true,
      keyFeatures: ['Lambda expressions', 'Stream API', 'Optional', 'Default methods', 'java.time (JSR 310)', 'Nashorn JS engine'],
      endOfLife: 'December 2030 (LTS)',
    },
    {
      version: '9',
      releaseDate: 'September 2017',
      ltsVersion: false,
      keyFeatures: ['Module system (Project Jigsaw)', 'JShell REPL', 'Private methods in interfaces', 'Process API'],
      endOfLife: 'March 2018',
    },
    {
      version: '10',
      releaseDate: 'March 2018',
      ltsVersion: false,
      keyFeatures: ['Local variable type inference (var)', 'Application Class-Data Sharing', 'Parallel Full GC for G1'],
      endOfLife: 'September 2018',
    },
    {
      version: '11',
      releaseDate: 'September 2018',
      ltsVersion: true,
      keyFeatures: ['HTTP Client (standard)', 'String methods (strip, isBlank)', 'var in lambda', 'Launch single-file programs', 'ZGC (experimental)'],
      endOfLife: 'September 2026 (LTS)',
    },
    {
      version: '12',
      releaseDate: 'March 2019',
      ltsVersion: false,
      keyFeatures: ['Switch expressions (preview)', 'JVM Constants API', 'Shenandoah GC (experimental)', 'Microbenchmark suite'],
      endOfLife: 'September 2019',
    },
    {
      version: '13',
      releaseDate: 'September 2019',
      ltsVersion: false,
      keyFeatures: ['Text blocks (preview)', 'Reimplemented Socket API', 'ZGC uncommit memory'],
      endOfLife: 'March 2020',
    },
    {
      version: '14',
      releaseDate: 'March 2020',
      ltsVersion: false,
      keyFeatures: ['Switch expressions (standard)', 'Records (preview)', 'Pattern matching instanceof (preview)', 'Helpful NullPointerExceptions'],
      endOfLife: 'September 2020',
    },
    {
      version: '15',
      releaseDate: 'September 2020',
      ltsVersion: false,
      keyFeatures: ['Text blocks (standard)', 'Sealed classes (preview)', 'Hidden classes', 'ZGC/Shenandoah production'],
      endOfLife: 'March 2021',
    },
    {
      version: '16',
      releaseDate: 'March 2021',
      ltsVersion: false,
      keyFeatures: ['Records (standard)', 'Pattern matching instanceof (standard)', 'Vector API (incubator)', 'Unix-Domain Socket Channel'],
      endOfLife: 'September 2021',
    },
    {
      version: '17',
      releaseDate: 'September 2021',
      ltsVersion: true,
      keyFeatures: ['Sealed classes (standard)', 'Pattern matching for switch (preview)', 'Strong encapsulation JDK internals', 'Foreign Function & Memory API (incubator)'],
      endOfLife: 'September 2029 (LTS)',
    },
    {
      version: '18',
      releaseDate: 'March 2022',
      ltsVersion: false,
      keyFeatures: ['UTF-8 default charset', 'Simple web server', 'Code snippets in Javadoc', 'Pattern matching for switch (preview 2)'],
      endOfLife: 'September 2022',
    },
    {
      version: '19',
      releaseDate: 'September 2022',
      ltsVersion: false,
      keyFeatures: ['Virtual threads (preview)', 'Structured concurrency (incubator)', 'Record patterns (preview)', 'Foreign Function API (preview)'],
      endOfLife: 'March 2023',
    },
    {
      version: '20',
      releaseDate: 'March 2023',
      ltsVersion: false,
      keyFeatures: ['Virtual threads (preview 2)', 'Scoped values (incubator)', 'Record patterns (preview 2)', 'Sequenced collections (preview)'],
      endOfLife: 'September 2023',
    },
    {
      version: '21',
      releaseDate: 'September 2023',
      ltsVersion: true,
      keyFeatures: ['Virtual threads (standard)', 'Record patterns (standard)', 'Pattern matching for switch (standard)', 'Sequenced Collections', 'String templates (preview)', 'Unnamed patterns (preview)'],
      endOfLife: 'September 2031 (LTS)',
    },
  ];
}

// ---- JavaScript Frameworks -------------------------------------------------

export interface JavaScriptFramework {
  name: string;
  type: 'framework' | 'library' | 'meta-framework' | 'runtime';
  year: number;
  creator: string;
  stars: string;
  useCase: string;
  bundleSize: string;
}

export function javascriptFrameworksData(): JavaScriptFramework[] {
  return [
    {
      name: 'React',
      type: 'library',
      year: 2013,
      creator: 'Meta (Facebook)',
      stars: '~228k',
      useCase: 'UI component library for web and native apps',
      bundleSize: '~42 kB (min+gzip)',
    },
    {
      name: 'Vue.js',
      type: 'framework',
      year: 2014,
      creator: 'Evan You',
      stars: '~208k',
      useCase: 'Progressive framework for building web UIs',
      bundleSize: '~34 kB (min+gzip)',
    },
    {
      name: 'Angular',
      type: 'framework',
      year: 2016,
      creator: 'Google',
      stars: '~96k',
      useCase: 'Full-featured framework for enterprise-scale web apps',
      bundleSize: '~130+ kB (min+gzip, varies)',
    },
    {
      name: 'Svelte',
      type: 'framework',
      year: 2016,
      creator: 'Rich Harris',
      stars: '~80k',
      useCase: 'Compile-time framework with minimal runtime overhead',
      bundleSize: '~1.6 kB (runtime, compile away)',
    },
    {
      name: 'Next.js',
      type: 'meta-framework',
      year: 2016,
      creator: 'Vercel',
      stars: '~126k',
      useCase: 'React meta-framework with SSR, SSG, and App Router',
      bundleSize: '~90 kB (min+gzip, depends on pages)',
    },
    {
      name: 'Nuxt.js',
      type: 'meta-framework',
      year: 2016,
      creator: 'Sébastien Chopin',
      stars: '~55k',
      useCase: 'Vue meta-framework with SSR, SSG, and hybrid rendering',
      bundleSize: '~100 kB (min+gzip)',
    },
    {
      name: 'SvelteKit',
      type: 'meta-framework',
      year: 2020,
      creator: 'Rich Harris / Vercel',
      stars: '~18k',
      useCase: 'Svelte meta-framework for building web apps',
      bundleSize: '~10 kB (min+gzip)',
    },
    {
      name: 'Remix',
      type: 'meta-framework',
      year: 2021,
      creator: 'Remix Software / Shopify',
      stars: '~30k',
      useCase: 'Full-stack React meta-framework focused on web standards',
      bundleSize: '~150 kB (min+gzip)',
    },
    {
      name: 'Astro',
      type: 'meta-framework',
      year: 2021,
      creator: 'The Astro Technology Company',
      stars: '~46k',
      useCase: 'Content-first static site generator with islands architecture',
      bundleSize: '~0 kB JS by default (HTML-first)',
    },
    {
      name: 'Solid.js',
      type: 'library',
      year: 2021,
      creator: 'Ryan Carniato',
      stars: '~32k',
      useCase: 'Fine-grained reactive UI without virtual DOM',
      bundleSize: '~7 kB (min+gzip)',
    },
    {
      name: 'jQuery',
      type: 'library',
      year: 2006,
      creator: 'John Resig',
      stars: '~59k',
      useCase: 'DOM manipulation and AJAX (legacy / widespread)',
      bundleSize: '~30 kB (min+gzip)',
    },
    {
      name: 'Alpine.js',
      type: 'library',
      year: 2019,
      creator: 'Caleb Porzio',
      stars: '~27k',
      useCase: 'Lightweight reactivity for HTML-centric pages',
      bundleSize: '~8 kB (min+gzip)',
    },
    {
      name: 'Preact',
      type: 'library',
      year: 2015,
      creator: 'Jason Miller',
      stars: '~36k',
      useCase: 'Fast 3 kB React alternative with same API',
      bundleSize: '~3 kB (min+gzip)',
    },
    {
      name: 'Lit',
      type: 'library',
      year: 2019,
      creator: 'Google',
      stars: '~18k',
      useCase: 'Web Components library with reactive rendering',
      bundleSize: '~5 kB (min+gzip)',
    },
    {
      name: 'Qwik',
      type: 'framework',
      year: 2022,
      creator: 'Builder.io (Miško Hevery)',
      stars: '~21k',
      useCase: 'Resumable framework for instant-loading web apps',
      bundleSize: '~1 kB initial JS',
    },
    {
      name: 'Ember.js',
      type: 'framework',
      year: 2011,
      creator: 'Yehuda Katz, Tom Dale',
      stars: '~22k',
      useCase: 'Convention-over-configuration framework for ambitious apps',
      bundleSize: '~200 kB (min+gzip)',
    },
    {
      name: 'Backbone.js',
      type: 'library',
      year: 2010,
      creator: 'Jeremy Ashkenas',
      stars: '~28k',
      useCase: 'Lightweight MVC library (legacy)',
      bundleSize: '~8 kB (min+gzip)',
    },
    {
      name: 'Meteor',
      type: 'framework',
      year: 2012,
      creator: 'Meteor Development Group',
      stars: '~44k',
      useCase: 'Full-stack reactive platform with real-time data sync',
      bundleSize: 'N/A (full-stack)',
    },
    {
      name: 'Stencil',
      type: 'framework',
      year: 2017,
      creator: 'Ionic',
      stars: '~12k',
      useCase: 'Web component compiler for design systems',
      bundleSize: '~4 kB (min+gzip)',
    },
    {
      name: 'Htmx',
      type: 'library',
      year: 2020,
      creator: 'Carson Gross',
      stars: '~39k',
      useCase: 'HTMX attributes for AJAX, CSS transitions, WebSockets in HTML',
      bundleSize: '~14 kB (min+gzip)',
    },
  ];
}

// ---- Frontend Frameworks ---------------------------------------------------

export interface FrontendFramework {
  name: string;
  language: string;
  year: number;
  paradigm: string;
  stateManagement: string;
  popularity: number;
}

export function frontendFrameworksData(): FrontendFramework[] {
  return [
    {
      name: 'React',
      language: 'JavaScript / TypeScript',
      year: 2013,
      paradigm: 'Component-based, Virtual DOM',
      stateManagement: 'useState, Redux, Zustand, Jotai, Recoil',
      popularity: 10,
    },
    {
      name: 'Vue.js',
      language: 'JavaScript / TypeScript',
      year: 2014,
      paradigm: 'Component-based, reactive data binding',
      stateManagement: 'Vuex, Pinia',
      popularity: 9,
    },
    {
      name: 'Angular',
      language: 'TypeScript',
      year: 2016,
      paradigm: 'Component-based, MVC, dependency injection',
      stateManagement: 'NgRx, Akita, built-in signals',
      popularity: 8,
    },
    {
      name: 'Svelte',
      language: 'JavaScript / TypeScript',
      year: 2016,
      paradigm: 'Compile-time reactivity, no virtual DOM',
      stateManagement: 'Svelte stores, writable/readable',
      popularity: 7,
    },
    {
      name: 'Next.js',
      language: 'JavaScript / TypeScript',
      year: 2016,
      paradigm: 'React meta-framework, hybrid SSR/SSG/RSC',
      stateManagement: 'React state + Zustand/Redux/Jotai',
      popularity: 10,
    },
    {
      name: 'Nuxt.js',
      language: 'JavaScript / TypeScript',
      year: 2016,
      paradigm: 'Vue meta-framework, hybrid rendering',
      stateManagement: 'Pinia, useState composable',
      popularity: 8,
    },
    {
      name: 'SvelteKit',
      language: 'JavaScript / TypeScript',
      year: 2020,
      paradigm: 'Svelte meta-framework, filesystem routing',
      stateManagement: 'Svelte stores',
      popularity: 7,
    },
    {
      name: 'Astro',
      language: 'JavaScript / TypeScript',
      year: 2021,
      paradigm: 'Islands architecture, content-first',
      stateManagement: 'Nano Stores, framework-specific',
      popularity: 7,
    },
    {
      name: 'Solid.js',
      language: 'JavaScript / TypeScript',
      year: 2021,
      paradigm: 'Fine-grained reactivity, no virtual DOM',
      stateManagement: 'createSignal, createStore',
      popularity: 6,
    },
    {
      name: 'Qwik',
      language: 'JavaScript / TypeScript',
      year: 2022,
      paradigm: 'Resumability, lazy execution',
      stateManagement: 'useSignal, useStore',
      popularity: 5,
    },
    {
      name: 'Remix',
      language: 'JavaScript / TypeScript',
      year: 2021,
      paradigm: 'Web standards, nested routing, loader/action pattern',
      stateManagement: 'URL params + server state',
      popularity: 7,
    },
    {
      name: 'Ember.js',
      language: 'JavaScript',
      year: 2011,
      paradigm: 'Convention over configuration, Glimmer rendering',
      stateManagement: 'Ember Data, Glimmer reactive state',
      popularity: 4,
    },
    {
      name: 'Backbone.js',
      language: 'JavaScript',
      year: 2010,
      paradigm: 'MVC, event-driven',
      stateManagement: 'Backbone.Model',
      popularity: 2,
    },
    {
      name: 'Alpine.js',
      language: 'JavaScript',
      year: 2019,
      paradigm: 'Declarative DOM behavior with HTML attributes',
      stateManagement: 'x-data, Alpine.store',
      popularity: 5,
    },
    {
      name: 'Htmx',
      language: 'HTML (JavaScript engine)',
      year: 2020,
      paradigm: 'Hypermedia-driven, HATEOAS',
      stateManagement: 'Server-side state with hypermedia responses',
      popularity: 6,
    },
  ];
}

// ---- Backend Frameworks ----------------------------------------------------

export interface BackendFramework {
  name: string;
  language: string;
  year: number;
  type: 'microframework' | 'fullstack' | 'API' | 'async' | 'enterprise' | 'REST';
  stars: string;
  useCase: string;
}

export function backendFrameworksData(): BackendFramework[] {
  return [
    {
      name: 'Express.js',
      language: 'JavaScript / TypeScript',
      year: 2010,
      type: 'microframework',
      stars: '~65k',
      useCase: 'Minimal Node.js web framework for APIs and web apps',
    },
    {
      name: 'FastAPI',
      language: 'Python',
      year: 2018,
      type: 'API',
      stars: '~77k',
      useCase: 'High-performance Python API framework with OpenAPI auto-docs',
    },
    {
      name: 'Django',
      language: 'Python',
      year: 2005,
      type: 'fullstack',
      stars: '~79k',
      useCase: 'Batteries-included Python framework for web apps and admin',
    },
    {
      name: 'Flask',
      language: 'Python',
      year: 2010,
      type: 'microframework',
      stars: '~67k',
      useCase: 'Lightweight Python microframework for web apps and APIs',
    },
    {
      name: 'Spring Boot',
      language: 'Java / Kotlin',
      year: 2014,
      type: 'enterprise',
      stars: '~74k',
      useCase: 'Production-grade Spring-based Java apps with auto-configuration',
    },
    {
      name: 'Ruby on Rails',
      language: 'Ruby',
      year: 2004,
      type: 'fullstack',
      stars: '~55k',
      useCase: 'Full-stack MVC framework focused on convention over configuration',
    },
    {
      name: 'Laravel',
      language: 'PHP',
      year: 2011,
      type: 'fullstack',
      stars: '~78k',
      useCase: 'Elegant PHP framework for modern web apps with ecosystem (Forge, Vapor)',
    },
    {
      name: 'NestJS',
      language: 'TypeScript',
      year: 2017,
      type: 'enterprise',
      stars: '~67k',
      useCase: 'Progressive Node.js framework with Angular-inspired architecture',
    },
    {
      name: 'Gin',
      language: 'Go',
      year: 2014,
      type: 'microframework',
      stars: '~78k',
      useCase: 'High-performance Go HTTP web framework with martini-like API',
    },
    {
      name: 'Fiber',
      language: 'Go',
      year: 2020,
      type: 'microframework',
      stars: '~34k',
      useCase: 'Express-inspired Go framework built on fasthttp',
    },
    {
      name: 'ASP.NET Core',
      language: 'C#',
      year: 2016,
      type: 'fullstack',
      stars: '~35k',
      useCase: 'Cross-platform .NET framework for web apps and APIs',
    },
    {
      name: 'Hono',
      language: 'TypeScript',
      year: 2021,
      type: 'microframework',
      stars: '~19k',
      useCase: 'Ultra-fast edge-first web framework for any JS runtime',
    },
    {
      name: 'Fastify',
      language: 'JavaScript / TypeScript',
      year: 2016,
      type: 'microframework',
      stars: '~32k',
      useCase: 'Low overhead Node.js web framework with JSON schema validation',
    },
    {
      name: 'Koa',
      language: 'JavaScript / TypeScript',
      year: 2013,
      type: 'microframework',
      stars: '~35k',
      useCase: 'Next-generation Express by its creators using async middleware',
    },
    {
      name: 'Actix Web',
      language: 'Rust',
      year: 2017,
      type: 'async',
      stars: '~22k',
      useCase: 'Extremely performant Rust web framework based on Actix actor system',
    },
    {
      name: 'Axum',
      language: 'Rust',
      year: 2021,
      type: 'async',
      stars: '~19k',
      useCase: 'Ergonomic Rust web framework built on Tokio + Tower',
    },
    {
      name: 'Phoenix',
      language: 'Elixir',
      year: 2014,
      type: 'fullstack',
      stars: '~21k',
      useCase: 'Real-time web framework for high-concurrency Elixir apps',
    },
    {
      name: 'Echo',
      language: 'Go',
      year: 2015,
      type: 'microframework',
      stars: '~30k',
      useCase: 'Minimalist Go web framework with high performance and extensibility',
    },
    {
      name: 'Ktor',
      language: 'Kotlin',
      year: 2017,
      type: 'async',
      stars: '~13k',
      useCase: 'Async Kotlin framework for connected applications (server + client)',
    },
    {
      name: 'Symfony',
      language: 'PHP',
      year: 2005,
      type: 'fullstack',
      stars: '~29k',
      useCase: 'Reusable PHP components and full web app framework',
    },
  ];
}

// ---- Databases -------------------------------------------------------------

export interface Database {
  name: string;
  type: 'relational' | 'nosql' | 'timeseries' | 'graph' | 'search' | 'cache' | 'newSQL' | 'columnar' | 'embedded';
  year: number;
  openSource: boolean;
  cloud: boolean;
  useCase: string;
  company: string;
}

export function databasesData(): Database[] {
  return [
    {
      name: 'PostgreSQL',
      type: 'relational',
      year: 1996,
      openSource: true,
      cloud: true,
      useCase: 'General-purpose RDBMS; complex queries, JSONB, extensions',
      company: 'PostgreSQL Global Development Group',
    },
    {
      name: 'MySQL',
      type: 'relational',
      year: 1995,
      openSource: true,
      cloud: true,
      useCase: 'Web applications, CMS platforms (WordPress, Drupal)',
      company: 'Oracle',
    },
    {
      name: 'SQLite',
      type: 'embedded',
      year: 2000,
      openSource: true,
      cloud: false,
      useCase: 'Embedded databases, mobile apps, local storage',
      company: 'D. Richard Hipp (public domain)',
    },
    {
      name: 'Microsoft SQL Server',
      type: 'relational',
      year: 1989,
      openSource: false,
      cloud: true,
      useCase: 'Enterprise Windows/.NET applications, BI & reporting',
      company: 'Microsoft',
    },
    {
      name: 'Oracle Database',
      type: 'relational',
      year: 1979,
      openSource: false,
      cloud: true,
      useCase: 'Large enterprise OLTP and data warehousing',
      company: 'Oracle',
    },
    {
      name: 'MariaDB',
      type: 'relational',
      year: 2009,
      openSource: true,
      cloud: true,
      useCase: 'MySQL-compatible alternative, Galera cluster',
      company: 'MariaDB Foundation',
    },
    {
      name: 'MongoDB',
      type: 'nosql',
      year: 2009,
      openSource: true,
      cloud: true,
      useCase: 'Document store for JSON-like data, flexible schemas',
      company: 'MongoDB Inc.',
    },
    {
      name: 'Redis',
      type: 'cache',
      year: 2009,
      openSource: true,
      cloud: true,
      useCase: 'In-memory caching, pub/sub, rate limiting, session storage',
      company: 'Redis Ltd.',
    },
    {
      name: 'Elasticsearch',
      type: 'search',
      year: 2010,
      openSource: true,
      cloud: true,
      useCase: 'Full-text search, log analytics (ELK stack), observability',
      company: 'Elastic NV',
    },
    {
      name: 'Cassandra',
      type: 'nosql',
      year: 2008,
      openSource: true,
      cloud: true,
      useCase: 'High-write distributed wide-column store for IoT/telemetry',
      company: 'Apache Software Foundation',
    },
    {
      name: 'DynamoDB',
      type: 'nosql',
      year: 2012,
      openSource: false,
      cloud: true,
      useCase: 'Serverless key-value and document store for AWS-native apps',
      company: 'Amazon Web Services',
    },
    {
      name: 'Neo4j',
      type: 'graph',
      year: 2007,
      openSource: true,
      cloud: true,
      useCase: 'Graph analytics, knowledge graphs, recommendation engines',
      company: 'Neo4j Inc.',
    },
    {
      name: 'InfluxDB',
      type: 'timeseries',
      year: 2013,
      openSource: true,
      cloud: true,
      useCase: 'Time-series data for metrics, monitoring, IoT sensor data',
      company: 'InfluxData',
    },
    {
      name: 'TimescaleDB',
      type: 'timeseries',
      year: 2017,
      openSource: true,
      cloud: true,
      useCase: 'PostgreSQL extension for time-series data at scale',
      company: 'Timescale Inc.',
    },
    {
      name: 'CockroachDB',
      type: 'newSQL',
      year: 2015,
      openSource: true,
      cloud: true,
      useCase: 'Distributed SQL with Postgres compatibility and global ACID',
      company: 'Cockroach Labs',
    },
    {
      name: 'PlanetScale',
      type: 'relational',
      year: 2018,
      openSource: false,
      cloud: true,
      useCase: 'Serverless MySQL-compatible DB with non-blocking schema changes',
      company: 'PlanetScale Inc.',
    },
    {
      name: 'Supabase',
      type: 'relational',
      year: 2020,
      openSource: true,
      cloud: true,
      useCase: 'Open-source Firebase alternative built on PostgreSQL',
      company: 'Supabase Inc.',
    },
    {
      name: 'Firebase Firestore',
      type: 'nosql',
      year: 2017,
      openSource: false,
      cloud: true,
      useCase: 'Real-time document database for mobile/web apps',
      company: 'Google',
    },
    {
      name: 'HBase',
      type: 'nosql',
      year: 2008,
      openSource: true,
      cloud: true,
      useCase: 'Wide-column store for Hadoop, large sparse tables',
      company: 'Apache Software Foundation',
    },
    {
      name: 'Couchbase',
      type: 'nosql',
      year: 2011,
      openSource: true,
      cloud: true,
      useCase: 'Multi-model NoSQL with SQL++ query language and mobile sync',
      company: 'Couchbase Inc.',
    },
    {
      name: 'RavenDB',
      type: 'nosql',
      year: 2010,
      openSource: true,
      cloud: true,
      useCase: 'ACID document database with built-in full-text search',
      company: 'Hibernating Rhinos',
    },
    {
      name: 'ClickHouse',
      type: 'columnar',
      year: 2016,
      openSource: true,
      cloud: true,
      useCase: 'Real-time analytics and OLAP at petabyte scale',
      company: 'ClickHouse Inc.',
    },
    {
      name: 'BigQuery',
      type: 'columnar',
      year: 2010,
      openSource: false,
      cloud: true,
      useCase: 'Serverless cloud data warehouse for large-scale analytics',
      company: 'Google',
    },
    {
      name: 'Snowflake',
      type: 'columnar',
      year: 2014,
      openSource: false,
      cloud: true,
      useCase: 'Cloud-native data warehouse with separation of storage/compute',
      company: 'Snowflake Inc.',
    },
    {
      name: 'Amazon Redshift',
      type: 'columnar',
      year: 2012,
      openSource: false,
      cloud: true,
      useCase: 'AWS data warehouse for BI and complex analytics',
      company: 'Amazon Web Services',
    },
    {
      name: 'Memcached',
      type: 'cache',
      year: 2003,
      openSource: true,
      cloud: true,
      useCase: 'Simple distributed memory caching for web apps',
      company: 'Community project (Brad Fitzpatrick)',
    },
    {
      name: 'RethinkDB',
      type: 'nosql',
      year: 2009,
      openSource: true,
      cloud: false,
      useCase: 'Real-time document database with push-based change feeds',
      company: 'The Linux Foundation (originally RethinkDB Inc.)',
    },
    {
      name: 'ArangoDB',
      type: 'nosql',
      year: 2011,
      openSource: true,
      cloud: true,
      useCase: 'Multi-model DB supporting documents, graphs, and key-value',
      company: 'ArangoDB GmbH',
    },
    {
      name: 'FaunaDB',
      type: 'nosql',
      year: 2012,
      openSource: false,
      cloud: true,
      useCase: 'Serverless transactional database with GraphQL API',
      company: 'Fauna Inc.',
    },
    {
      name: 'Dgraph',
      type: 'graph',
      year: 2015,
      openSource: true,
      cloud: true,
      useCase: 'Distributed native graph database with GraphQL interface',
      company: 'Dgraph Labs',
    },
  ];
}

// ---- Cloud Services --------------------------------------------------------

export interface CloudService {
  category: string;
  description: string;
  providers: string[];
  useCases: string[];
}

export function cloudServicesData(): CloudService[] {
  return [
    {
      category: 'Compute (VMs)',
      description: 'Virtual machines with configurable CPU, memory, and storage',
      providers: ['AWS EC2', 'Google Compute Engine', 'Azure Virtual Machines', 'DigitalOcean Droplets', 'Linode'],
      useCases: ['Web servers', 'batch processing', 'legacy app migration', 'custom environments'],
    },
    {
      category: 'Serverless Functions',
      description: 'Event-driven compute without managing servers',
      providers: ['AWS Lambda', 'Google Cloud Functions', 'Azure Functions', 'Cloudflare Workers', 'Vercel Edge Functions'],
      useCases: ['API backends', 'event processing', 'scheduled jobs', 'webhooks'],
    },
    {
      category: 'Container Orchestration',
      description: 'Managed Kubernetes and container platforms',
      providers: ['AWS EKS', 'Google GKE', 'Azure AKS', 'DigitalOcean DOKS', 'Rancher'],
      useCases: ['Microservices', 'CI/CD pipelines', 'scalable web apps', 'ML workloads'],
    },
    {
      category: 'Object Storage',
      description: 'Scalable blob/object storage for files, backups, and static assets',
      providers: ['AWS S3', 'Google Cloud Storage', 'Azure Blob Storage', 'Cloudflare R2', 'Backblaze B2'],
      useCases: ['Static website hosting', 'backup', 'media storage', 'data lakes'],
    },
    {
      category: 'Managed Relational Databases',
      description: 'Hosted SQL databases with automated backups and scaling',
      providers: ['AWS RDS / Aurora', 'Google Cloud SQL', 'Azure SQL Database', 'Supabase', 'PlanetScale'],
      useCases: ['Transactional apps', 'CMS', 'e-commerce', 'SaaS applications'],
    },
    {
      category: 'Managed NoSQL Databases',
      description: 'Hosted document, key-value, and wide-column stores',
      providers: ['AWS DynamoDB', 'Google Firestore', 'Azure Cosmos DB', 'MongoDB Atlas', 'Couchbase Cloud'],
      useCases: ['Real-time apps', 'mobile backends', 'user profiles', 'IoT data'],
    },
    {
      category: 'CDN & Edge',
      description: 'Content delivery networks for low-latency global distribution',
      providers: ['Cloudflare', 'AWS CloudFront', 'Akamai', 'Fastly', 'Vercel Edge Network'],
      useCases: ['Static assets', 'API acceleration', 'DDoS protection', 'A/B testing at edge'],
    },
    {
      category: 'DNS',
      description: 'Managed domain name resolution with routing policies',
      providers: ['AWS Route 53', 'Google Cloud DNS', 'Azure DNS', 'Cloudflare DNS', 'NS1'],
      useCases: ['Domain management', 'health checks', 'geo-routing', 'blue/green deployments'],
    },
    {
      category: 'Load Balancing',
      description: 'Distribute traffic across compute instances',
      providers: ['AWS ELB/ALB/NLB', 'Google Cloud Load Balancing', 'Azure Load Balancer', 'Nginx Plus', 'HAProxy'],
      useCases: ['High availability', 'horizontal scaling', 'SSL termination', 'path-based routing'],
    },
    {
      category: 'CI/CD Pipelines',
      description: 'Continuous integration and deployment automation',
      providers: ['GitHub Actions', 'GitLab CI', 'CircleCI', 'Jenkins', 'AWS CodePipeline'],
      useCases: ['Automated testing', 'build artifacts', 'deployments', 'code quality checks'],
    },
    {
      category: 'Monitoring & Observability',
      description: 'Metrics, logs, and traces for cloud infrastructure',
      providers: ['AWS CloudWatch', 'Google Cloud Monitoring', 'Datadog', 'Grafana Cloud', 'New Relic'],
      useCases: ['Alerting', 'performance monitoring', 'cost optimization', 'SLA tracking'],
    },
    {
      category: 'Identity & Access Management',
      description: 'Authentication, authorization, and policy management',
      providers: ['AWS IAM', 'Google IAM', 'Azure Active Directory', 'Okta', 'Auth0'],
      useCases: ['Role-based access', 'SSO', 'MFA', 'API key management'],
    },
    {
      category: 'Message Queues & Streaming',
      description: 'Asynchronous messaging for decoupled architectures',
      providers: ['AWS SQS/SNS', 'Google Pub/Sub', 'Azure Service Bus', 'Kafka (Confluent)', 'RabbitMQ'],
      useCases: ['Event-driven architecture', 'async processing', 'data pipelines', 'fan-out'],
    },
    {
      category: 'Machine Learning Platforms',
      description: 'End-to-end ML development, training, and inference',
      providers: ['AWS SageMaker', 'Google Vertex AI', 'Azure ML', 'Hugging Face', 'Databricks'],
      useCases: ['Model training', 'feature engineering', 'inference APIs', 'MLOps'],
    },
    {
      category: 'Email & Notification Services',
      description: 'Transactional email, SMS, and push notification delivery',
      providers: ['AWS SES/SNS', 'SendGrid', 'Mailgun', 'Twilio', 'Firebase Cloud Messaging'],
      useCases: ['Transactional email', 'marketing campaigns', 'SMS alerts', 'push notifications'],
    },
    {
      category: 'VPN & Private Networking',
      description: 'Private network connectivity between cloud and on-premises',
      providers: ['AWS VPN / Direct Connect', 'Google Cloud VPN / Interconnect', 'Azure VPN Gateway / ExpressRoute', 'Tailscale', 'WireGuard'],
      useCases: ['Hybrid cloud', 'secure remote access', 'data migration', 'low-latency interconnects'],
    },
    {
      category: 'Search Services',
      description: 'Managed search and analytics engines',
      providers: ['Elasticsearch (Elastic Cloud)', 'AWS OpenSearch', 'Algolia', 'Typesense', 'Meilisearch'],
      useCases: ['Full-text search', 'log analytics', 'catalog search', 'vector/semantic search'],
    },
    {
      category: 'Block Storage',
      description: 'Persistent block-level storage volumes for VMs',
      providers: ['AWS EBS', 'Google Persistent Disk', 'Azure Managed Disks', 'DigitalOcean Volumes', 'Ceph'],
      useCases: ['Database storage', 'OS volumes', 'high-IOPS workloads', 'snapshots'],
    },
    {
      category: 'Secrets Management',
      description: 'Secure storage and rotation of credentials and API keys',
      providers: ['AWS Secrets Manager', 'Google Secret Manager', 'Azure Key Vault', 'HashiCorp Vault', '1Password Secrets Automation'],
      useCases: ['API key rotation', 'DB credentials', 'certificate management', 'encrypted configuration'],
    },
    {
      category: 'Managed Kubernetes',
      description: 'Fully managed Kubernetes control planes with auto-scaling',
      providers: ['AWS EKS', 'Google GKE Autopilot', 'Azure AKS', 'DigitalOcean DOKS', 'Civo Kubernetes'],
      useCases: ['Container orchestration', 'stateful apps', 'GitOps deployments', 'multi-tenant platforms'],
    },
  ];
}

// ---- AWS Services ----------------------------------------------------------

export interface AwsService {
  name: string;
  shortName: string;
  category: string;
  description: string;
  useCase: string;
}

export function awsServicesData(): AwsService[] {
  return [
    { name: 'Amazon Elastic Compute Cloud', shortName: 'EC2', category: 'Compute', description: 'Scalable virtual machines in the cloud', useCase: 'Web servers, batch processing, ML training' },
    { name: 'AWS Lambda', shortName: 'Lambda', category: 'Compute', description: 'Serverless compute triggered by events', useCase: 'API backends, event processing, scheduled tasks' },
    { name: 'Amazon Elastic Container Service', shortName: 'ECS', category: 'Compute', description: 'Managed container orchestration for Docker', useCase: 'Containerized microservices, batch jobs' },
    { name: 'Amazon Elastic Kubernetes Service', shortName: 'EKS', category: 'Compute', description: 'Managed Kubernetes control plane', useCase: 'Kubernetes workloads, multi-team platforms' },
    { name: 'AWS Fargate', shortName: 'Fargate', category: 'Compute', description: 'Serverless compute engine for containers (ECS/EKS)', useCase: 'Serverless containers without EC2 management' },
    { name: 'Amazon Lightsail', shortName: 'Lightsail', category: 'Compute', description: 'Simplified VPS for small applications', useCase: 'Simple websites, dev/test environments' },
    { name: 'Amazon Simple Storage Service', shortName: 'S3', category: 'Storage', description: 'Scalable object storage with 99.999999999% durability', useCase: 'Backups, static hosting, data lake, media storage' },
    { name: 'Amazon Elastic Block Store', shortName: 'EBS', category: 'Storage', description: 'Persistent block storage volumes for EC2', useCase: 'Database storage, OS volumes, high-IOPS workloads' },
    { name: 'Amazon Elastic File System', shortName: 'EFS', category: 'Storage', description: 'Managed NFS file system for EC2', useCase: 'Shared file storage, CMS, home directories' },
    { name: 'Amazon Glacier / S3 Glacier', shortName: 'Glacier', category: 'Storage', description: 'Low-cost archival storage with configurable retrieval times', useCase: 'Long-term backups, compliance archiving' },
    { name: 'Amazon Relational Database Service', shortName: 'RDS', category: 'Database', description: 'Managed relational databases (MySQL, PostgreSQL, etc.)', useCase: 'Transactional apps, CMS, SaaS backends' },
    { name: 'Amazon Aurora', shortName: 'Aurora', category: 'Database', description: 'High-performance MySQL/PostgreSQL-compatible cloud database', useCase: 'High-throughput OLTP, serverless DB (Aurora Serverless)' },
    { name: 'Amazon DynamoDB', shortName: 'DynamoDB', category: 'Database', description: 'Serverless NoSQL key-value and document database', useCase: 'Shopping carts, user profiles, gaming leaderboards' },
    { name: 'Amazon ElastiCache', shortName: 'ElastiCache', category: 'Database', description: 'Managed Redis and Memcached caching', useCase: 'Session caching, rate limiting, real-time analytics' },
    { name: 'Amazon Redshift', shortName: 'Redshift', category: 'Analytics', description: 'Cloud data warehouse for petabyte-scale analytics', useCase: 'BI reporting, big data queries, data lakehouse' },
    { name: 'Amazon Kinesis', shortName: 'Kinesis', category: 'Analytics', description: 'Real-time data streaming and analytics', useCase: 'Log ingestion, clickstream analysis, IoT telemetry' },
    { name: 'AWS Glue', shortName: 'Glue', category: 'Analytics', description: 'Serverless ETL service for data cataloging and transformation', useCase: 'Data lakes, ETL pipelines, schema discovery' },
    { name: 'Amazon Athena', shortName: 'Athena', category: 'Analytics', description: 'Serverless SQL query engine for S3 data', useCase: 'Ad-hoc analytics on data lakes, log analysis' },
    { name: 'Amazon Virtual Private Cloud', shortName: 'VPC', category: 'Networking', description: 'Isolated private network in AWS', useCase: 'Network isolation, security zones, hybrid connectivity' },
    { name: 'Amazon CloudFront', shortName: 'CloudFront', category: 'Networking', description: 'Global CDN for low-latency content delivery', useCase: 'Static assets, API acceleration, video streaming' },
    { name: 'Amazon Route 53', shortName: 'Route 53', category: 'Networking', description: 'Scalable DNS and domain management service', useCase: 'Domain registration, health-check routing, geo-routing' },
    { name: 'AWS Elastic Load Balancing', shortName: 'ELB', category: 'Networking', description: 'Application, Network, and Gateway load balancers', useCase: 'High availability, SSL termination, blue/green deploys' },
    { name: 'AWS Identity and Access Management', shortName: 'IAM', category: 'Security', description: 'Fine-grained access control for AWS resources', useCase: 'Role-based access, least-privilege policies, SSO federation' },
    { name: 'AWS Key Management Service', shortName: 'KMS', category: 'Security', description: 'Managed key creation and control for encryption', useCase: 'Encrypting S3 objects, RDS, secrets at rest' },
    { name: 'AWS Secrets Manager', shortName: 'Secrets Manager', category: 'Security', description: 'Managed secrets storage with automatic rotation', useCase: 'DB credentials, API keys, certificates' },
    { name: 'Amazon Simple Notification Service', shortName: 'SNS', category: 'Messaging', description: 'Pub/sub and SMS/email push notification service', useCase: 'Fan-out messaging, alerts, mobile push' },
    { name: 'Amazon Simple Queue Service', shortName: 'SQS', category: 'Messaging', description: 'Fully managed message queuing', useCase: 'Decoupled microservices, async job processing' },
    { name: 'Amazon EventBridge', shortName: 'EventBridge', category: 'Messaging', description: 'Serverless event bus connecting AWS services and SaaS', useCase: 'Event-driven architecture, scheduled rules' },
    { name: 'AWS SageMaker', shortName: 'SageMaker', category: 'AI/ML', description: 'End-to-end ML platform for build, train, deploy', useCase: 'Custom ML models, AutoML, model hosting' },
    { name: 'Amazon Rekognition', shortName: 'Rekognition', category: 'AI/ML', description: 'Computer vision API for image and video analysis', useCase: 'Face detection, content moderation, object labeling' },
    { name: 'Amazon Comprehend', shortName: 'Comprehend', category: 'AI/ML', description: 'NLP service for text analysis', useCase: 'Sentiment analysis, entity recognition, key phrases' },
    { name: 'AWS CodePipeline', shortName: 'CodePipeline', category: 'DevOps', description: 'Continuous delivery pipeline automation', useCase: 'CI/CD workflows, release automation' },
    { name: 'AWS CloudFormation', shortName: 'CloudFormation', category: 'DevOps', description: 'Infrastructure as code with JSON/YAML templates', useCase: 'Repeatable infrastructure provisioning' },
    { name: 'AWS CloudWatch', shortName: 'CloudWatch', category: 'Monitoring', description: 'Monitoring, logging, and observability for AWS', useCase: 'Metrics, alarms, log aggregation, dashboards' },
    { name: 'AWS X-Ray', shortName: 'X-Ray', category: 'Monitoring', description: 'Distributed tracing for analyzing application performance', useCase: 'Latency profiling, error root cause, service maps' },
    { name: 'Amazon Elastic MapReduce', shortName: 'EMR', category: 'Analytics', description: 'Managed Hadoop/Spark big data platform', useCase: 'Large-scale data processing, ETL, ML pipelines' },
    { name: 'AWS Step Functions', shortName: 'Step Functions', category: 'Compute', description: 'Visual serverless workflow orchestration', useCase: 'Multi-step automations, saga pattern, long-running jobs' },
    { name: 'Amazon API Gateway', shortName: 'API Gateway', category: 'Networking', description: 'Managed REST and WebSocket API creation and management', useCase: 'Serverless APIs, authentication, throttling' },
    { name: 'AWS Amplify', shortName: 'Amplify', category: 'DevOps', description: 'Fullstack platform for web and mobile app hosting', useCase: 'Rapid frontend deployment, backend provisioning' },
    { name: 'Amazon Bedrock', shortName: 'Bedrock', category: 'AI/ML', description: 'Managed access to foundation models from leading AI providers', useCase: 'Generative AI apps, RAG pipelines, model customization' },
  ];
}

// ---- GCP Services ----------------------------------------------------------

export interface GcpService {
  name: string;
  shortName: string;
  category: string;
  description: string;
  useCase: string;
}

export function gcpServicesData(): GcpService[] {
  return [
    { name: 'Google Compute Engine', shortName: 'GCE', category: 'Compute', description: 'Virtual machines on Google infrastructure', useCase: 'Custom OS environments, high-performance computing' },
    { name: 'Google Kubernetes Engine', shortName: 'GKE', category: 'Compute', description: 'Managed Kubernetes service with Autopilot mode', useCase: 'Container orchestration, microservices, ML serving' },
    { name: 'Google Cloud Run', shortName: 'Cloud Run', category: 'Compute', description: 'Serverless containers on a fully managed platform', useCase: 'Stateless HTTP services, API backends, event-driven containers' },
    { name: 'Google Cloud Functions', shortName: 'Cloud Functions', category: 'Compute', description: 'Serverless event-driven functions', useCase: 'Webhooks, lightweight APIs, event processing' },
    { name: 'Google App Engine', shortName: 'GAE', category: 'Compute', description: 'Fully managed platform for web apps', useCase: 'Web application hosting, scheduled tasks (cron)' },
    { name: 'Google Cloud Storage', shortName: 'GCS', category: 'Storage', description: 'Unified object storage for any amount of data', useCase: 'Data lakes, static hosting, backups, ML dataset storage' },
    { name: 'Google Persistent Disk', shortName: 'Persistent Disk', category: 'Storage', description: 'Block storage for GCE instances', useCase: 'Database volumes, OS disks, high-IOPS workloads' },
    { name: 'Google Filestore', shortName: 'Filestore', category: 'Storage', description: 'Managed NFS file server', useCase: 'Shared file storage for GKE and GCE workloads' },
    { name: 'Google Cloud SQL', shortName: 'Cloud SQL', category: 'Database', description: 'Managed MySQL, PostgreSQL, and SQL Server', useCase: 'Transactional apps, CMS, SaaS databases' },
    { name: 'Google Cloud Spanner', shortName: 'Spanner', category: 'Database', description: 'Globally distributed, strongly consistent NewSQL database', useCase: 'Global financial systems, inventory management' },
    { name: 'Google Firestore', shortName: 'Firestore', category: 'Database', description: 'Serverless NoSQL document database with real-time sync', useCase: 'Mobile backends, real-time collaborative apps' },
    { name: 'Google Bigtable', shortName: 'Bigtable', category: 'Database', description: 'Scalable wide-column NoSQL for high-throughput workloads', useCase: 'Time-series, financial data, ad tech, IoT' },
    { name: 'Google BigQuery', shortName: 'BigQuery', category: 'Analytics', description: 'Serverless data warehouse for massive-scale analytics', useCase: 'Business intelligence, ML feature engineering, data lakehouse' },
    { name: 'Google Dataflow', shortName: 'Dataflow', category: 'Analytics', description: 'Fully managed stream and batch data processing (Apache Beam)', useCase: 'ETL pipelines, real-time analytics, ML data prep' },
    { name: 'Google Pub/Sub', shortName: 'Pub/Sub', category: 'Messaging', description: 'Asynchronous messaging and event ingestion', useCase: 'Event-driven architecture, data streaming, fan-out' },
    { name: 'Google Cloud Load Balancing', shortName: 'Cloud LB', category: 'Networking', description: 'Global and regional load balancing', useCase: 'HTTP(S) traffic distribution, health checks, SSL' },
    { name: 'Google Cloud CDN', shortName: 'Cloud CDN', category: 'Networking', description: 'Content delivery network using Google edge PoPs', useCase: 'Static asset delivery, API caching, video streaming' },
    { name: 'Google Cloud DNS', shortName: 'Cloud DNS', category: 'Networking', description: 'Scalable, reliable managed DNS service', useCase: 'Domain management, private DNS zones, low-latency resolution' },
    { name: 'Google Cloud IAM', shortName: 'Cloud IAM', category: 'Security', description: 'Fine-grained identity and access management', useCase: 'Role-based access control, service account management' },
    { name: 'Google Secret Manager', shortName: 'Secret Manager', category: 'Security', description: 'Secure storage and access for sensitive data', useCase: 'API keys, DB passwords, TLS certificates' },
    { name: 'Google Vertex AI', shortName: 'Vertex AI', category: 'AI/ML', description: 'Unified ML platform for building and deploying AI/ML models', useCase: 'Custom ML training, AutoML, model registry, LLM serving' },
    { name: 'Google Cloud Vision AI', shortName: 'Vision AI', category: 'AI/ML', description: 'Pre-trained and custom computer vision models', useCase: 'Image labeling, OCR, face detection, content moderation' },
    { name: 'Google Cloud Natural Language', shortName: 'NL API', category: 'AI/ML', description: 'NLP API for text analysis', useCase: 'Sentiment analysis, entity extraction, content classification' },
    { name: 'Google Cloud Build', shortName: 'Cloud Build', category: 'DevOps', description: 'Serverless CI/CD build service', useCase: 'Build automation, testing, container image creation' },
    { name: 'Google Cloud Monitoring', shortName: 'Cloud Monitoring', category: 'Monitoring', description: 'Full-stack monitoring and observability', useCase: 'Metrics, dashboards, uptime checks, alerting' },
    { name: 'Google Cloud Logging', shortName: 'Cloud Logging', category: 'Monitoring', description: 'Fully managed log management service', useCase: 'Log aggregation, audit logs, real-time analysis' },
    { name: 'Google Cloud Trace', shortName: 'Cloud Trace', category: 'Monitoring', description: 'Distributed tracing for latency analysis', useCase: 'Performance bottleneck identification, request profiling' },
    { name: 'Google Dataproc', shortName: 'Dataproc', category: 'Analytics', description: 'Managed Apache Spark and Hadoop service', useCase: 'Large-scale batch processing, ML pipelines' },
    { name: 'Google Cloud Armor', shortName: 'Cloud Armor', category: 'Security', description: 'DDoS protection and WAF for Google Cloud services', useCase: 'Application protection, IP allow/deny lists, rate limiting' },
    { name: 'Google Cloud Endpoints / API Gateway', shortName: 'API Gateway', category: 'Networking', description: 'Managed API gateway for serverless backends', useCase: 'API management, authentication, rate limiting' },
  ];
}

// ---- Azure Services --------------------------------------------------------

export interface AzureService {
  name: string;
  shortName: string;
  category: string;
  description: string;
  useCase: string;
}

export function azureServicesData(): AzureService[] {
  return [
    { name: 'Azure Virtual Machines', shortName: 'Azure VMs', category: 'Compute', description: 'Scalable on-demand VMs with Windows and Linux', useCase: 'Lift-and-shift migrations, dev/test, custom workloads' },
    { name: 'Azure Kubernetes Service', shortName: 'AKS', category: 'Compute', description: 'Managed Kubernetes cluster', useCase: 'Microservices, DevOps pipelines, multi-region apps' },
    { name: 'Azure Container Instances', shortName: 'ACI', category: 'Compute', description: 'Run containers without managing servers', useCase: 'Burst compute, isolated tasks, CI/CD agents' },
    { name: 'Azure Functions', shortName: 'Azure Functions', category: 'Compute', description: 'Serverless event-driven compute', useCase: 'HTTP APIs, timers, queue-triggered processing' },
    { name: 'Azure App Service', shortName: 'App Service', category: 'Compute', description: 'Fully managed PaaS for web apps and APIs', useCase: 'Web apps, REST APIs, mobile backends' },
    { name: 'Azure Blob Storage', shortName: 'Blob Storage', category: 'Storage', description: 'Massively scalable object storage for unstructured data', useCase: 'Backups, media files, static website hosting, data lakes' },
    { name: 'Azure Disk Storage', shortName: 'Managed Disks', category: 'Storage', description: 'Managed block storage for Azure VMs', useCase: 'OS volumes, database storage, high-performance SSD disks' },
    { name: 'Azure Files', shortName: 'Azure Files', category: 'Storage', description: 'Managed file share using SMB and NFS protocols', useCase: 'Lift-and-shift file servers, shared config storage' },
    { name: 'Azure SQL Database', shortName: 'Azure SQL', category: 'Database', description: 'Managed SQL Server in the cloud with auto-scaling', useCase: 'Enterprise OLTP, SaaS backends, data warehousing' },
    { name: 'Azure Cosmos DB', shortName: 'Cosmos DB', category: 'Database', description: 'Globally distributed multi-model NoSQL database', useCase: 'Low-latency global apps, IoT, e-commerce, gaming' },
    { name: 'Azure Database for PostgreSQL', shortName: 'Azure PostgreSQL', category: 'Database', description: 'Managed PostgreSQL with Flexible Server option', useCase: 'Open-source relational workloads, dev/prod parity' },
    { name: 'Azure Cache for Redis', shortName: 'Azure Redis', category: 'Database', description: 'Managed Redis for caching and messaging', useCase: 'Session caching, rate limiting, leaderboards' },
    { name: 'Azure Synapse Analytics', shortName: 'Synapse', category: 'Analytics', description: 'Integrated analytics service with SQL and Spark', useCase: 'Data warehousing, big data analytics, BI integration' },
    { name: 'Azure Event Hubs', shortName: 'Event Hubs', category: 'Messaging', description: 'Big data streaming platform and event ingestion service', useCase: 'Clickstream data, telemetry, log aggregation' },
    { name: 'Azure Service Bus', shortName: 'Service Bus', category: 'Messaging', description: 'Enterprise messaging with queues and topics', useCase: 'Async decoupling, workflow orchestration, reliable delivery' },
    { name: 'Azure API Management', shortName: 'APIM', category: 'Networking', description: 'Managed API gateway for publishing APIs', useCase: 'API lifecycle management, rate limiting, authentication' },
    { name: 'Azure Front Door', shortName: 'Front Door', category: 'Networking', description: 'Global CDN and application delivery network', useCase: 'Global load balancing, WAF, accelerated HTTPS' },
    { name: 'Azure DNS', shortName: 'Azure DNS', category: 'Networking', description: 'Managed DNS hosting using Azure infrastructure', useCase: 'Domain management, private DNS zones' },
    { name: 'Azure Active Directory', shortName: 'Azure AD / Entra', category: 'Security', description: 'Cloud identity and access management', useCase: 'SSO, MFA, B2B/B2C authentication, conditional access' },
    { name: 'Azure Key Vault', shortName: 'Key Vault', category: 'Security', description: 'Managed service for keys, secrets, and certificates', useCase: 'Encryption keys, DB connection strings, TLS certs' },
    { name: 'Azure Machine Learning', shortName: 'Azure ML', category: 'AI/ML', description: 'End-to-end ML lifecycle platform', useCase: 'Model training, AutoML, MLOps, real-time inference' },
    { name: 'Azure Cognitive Services', shortName: 'Cognitive Services', category: 'AI/ML', description: 'Pre-built AI APIs (Vision, Speech, Language, Decision)', useCase: 'OCR, translation, sentiment analysis, anomaly detection' },
    { name: 'Azure OpenAI Service', shortName: 'Azure OpenAI', category: 'AI/ML', description: 'OpenAI GPT-4/DALL-E/Whisper models on Azure infrastructure', useCase: 'Generative AI, copilots, RAG pipelines, code generation' },
    { name: 'Azure DevOps', shortName: 'Azure DevOps', category: 'DevOps', description: 'Integrated DevOps tools (Boards, Repos, Pipelines, Artifacts)', useCase: 'Agile planning, CI/CD, artifact management' },
    { name: 'Azure Monitor', shortName: 'Azure Monitor', category: 'Monitoring', description: 'Full-stack monitoring for Azure and hybrid environments', useCase: 'Metrics, logs (Log Analytics), alerts, Application Insights' },
    { name: 'Azure Application Insights', shortName: 'App Insights', category: 'Monitoring', description: 'APM and distributed tracing for applications', useCase: 'Performance monitoring, error tracking, user analytics' },
    { name: 'Azure Virtual Network', shortName: 'VNet', category: 'Networking', description: 'Isolated private network in Azure', useCase: 'Network segmentation, hybrid cloud, secure resource isolation' },
    { name: 'Azure Databricks', shortName: 'Databricks', category: 'Analytics', description: 'Collaborative Apache Spark analytics platform on Azure', useCase: 'Data engineering, ML pipelines, real-time analytics' },
    { name: 'Azure Stream Analytics', shortName: 'Stream Analytics', category: 'Analytics', description: 'Real-time data stream processing at scale', useCase: 'IoT telemetry, fraud detection, live dashboards' },
    { name: 'Azure Load Balancer', shortName: 'Azure LB', category: 'Networking', description: 'Layer-4 load balancing for TCP/UDP traffic', useCase: 'High availability for VMs, internet-facing apps' },
  ];
}

// ---- Docker Images ---------------------------------------------------------

export interface DockerImage {
  name: string;
  description: string;
  tags: string[];
  pulls: string;
  officialImage: boolean;
  useCase: string;
}

export function dockerImagesData(): DockerImage[] {
  return [
    {
      name: 'nginx',
      description: 'High-performance HTTP server, reverse proxy, and load balancer',
      tags: ['latest', 'alpine', '1.25', '1.25-alpine'],
      pulls: '1B+',
      officialImage: true,
      useCase: 'Web server, reverse proxy, static file serving, SSL termination',
    },
    {
      name: 'node',
      description: 'Node.js JavaScript runtime',
      tags: ['lts', '20', '18', '20-alpine', '18-alpine', 'current'],
      pulls: '1B+',
      officialImage: true,
      useCase: 'Node.js backend services, build environments, CLI tools',
    },
    {
      name: 'postgres',
      description: 'PostgreSQL relational database',
      tags: ['latest', '16', '15', '14', 'alpine'],
      pulls: '1B+',
      officialImage: true,
      useCase: 'Development databases, production RDBMS (with persistence volume)',
    },
    {
      name: 'redis',
      description: 'In-memory data structure store',
      tags: ['latest', '7', '7-alpine', '6'],
      pulls: '1B+',
      officialImage: true,
      useCase: 'Caching, pub/sub, session storage, rate limiting',
    },
    {
      name: 'mysql',
      description: 'MySQL relational database',
      tags: ['latest', '8.0', '5.7'],
      pulls: '1B+',
      officialImage: true,
      useCase: 'MySQL workloads, WordPress/CMS backends, dev/test databases',
    },
    {
      name: 'python',
      description: 'Python programming language runtime',
      tags: ['3.12', '3.11', '3.10', '3.12-slim', '3.12-alpine'],
      pulls: '1B+',
      officialImage: true,
      useCase: 'Python apps, data science, ML training, scripting',
    },
    {
      name: 'ubuntu',
      description: 'Ubuntu Linux OS base image',
      tags: ['latest', '22.04', '20.04', '24.04'],
      pulls: '1B+',
      officialImage: true,
      useCase: 'Base image for custom images, CI environments, shell access',
    },
    {
      name: 'alpine',
      description: 'Minimal Alpine Linux OS (~5 MB)',
      tags: ['latest', '3.19', '3.18', 'edge'],
      pulls: '1B+',
      officialImage: true,
      useCase: 'Ultra-lightweight base image, multi-stage build final stages',
    },
    {
      name: 'mongo',
      description: 'MongoDB NoSQL document database',
      tags: ['latest', '7', '6', '5'],
      pulls: '1B+',
      officialImage: true,
      useCase: 'Document store, dev/test MongoDB, JSON-heavy applications',
    },
    {
      name: 'elasticsearch',
      description: 'Open-source search and analytics engine',
      tags: ['8.13.0', '7.17.20', '8.x'],
      pulls: '500M+',
      officialImage: false,
      useCase: 'Full-text search, log analytics, ELK/Elastic stack',
    },
    {
      name: 'rabbitmq',
      description: 'Open-source message broker',
      tags: ['latest', '3-management', 'alpine', '3.13'],
      pulls: '500M+',
      officialImage: true,
      useCase: 'Message queuing, pub/sub, async task processing',
    },
    {
      name: 'httpd',
      description: 'Apache HTTP Server',
      tags: ['latest', '2.4', 'alpine'],
      pulls: '1B+',
      officialImage: true,
      useCase: 'Web server, static site serving, CGI apps',
    },
    {
      name: 'golang',
      description: 'Go programming language runtime',
      tags: ['latest', '1.22', '1.21', 'alpine', 'bookworm'],
      pulls: '500M+',
      officialImage: true,
      useCase: 'Build environment for Go binaries, multi-stage Docker builds',
    },
    {
      name: 'openjdk',
      description: 'OpenJDK Java development kit',
      tags: ['21', '17', '11', '21-slim', '21-alpine'],
      pulls: '1B+',
      officialImage: true,
      useCase: 'Java app runtime, Maven/Gradle build environments',
    },
    {
      name: 'grafana/grafana',
      description: 'Open-source observability and data visualization platform',
      tags: ['latest', '10.4.0', 'main'],
      pulls: '500M+',
      officialImage: false,
      useCase: 'Metrics dashboards, log visualization, alerting',
    },
    {
      name: 'prom/prometheus',
      description: 'Open-source monitoring and alerting toolkit',
      tags: ['latest', 'v2.51.0'],
      pulls: '500M+',
      officialImage: false,
      useCase: 'Metrics collection, alerting, Kubernetes monitoring',
    },
    {
      name: 'traefik',
      description: 'Cloud-native reverse proxy and load balancer',
      tags: ['latest', 'v3', 'v2', 'v3.0'],
      pulls: '500M+',
      officialImage: true,
      useCase: 'API gateway, Docker/Kubernetes edge router, SSL automation',
    },
    {
      name: 'mariadb',
      description: 'MariaDB relational database',
      tags: ['latest', '11', '10.11', 'lts'],
      pulls: '500M+',
      officialImage: true,
      useCase: 'MySQL-compatible workloads, Galera cluster, CMS backends',
    },
    {
      name: 'wordpress',
      description: 'WordPress CMS with Apache and PHP',
      tags: ['latest', '6.5', 'php8.2', 'php8.2-apache'],
      pulls: '500M+',
      officialImage: true,
      useCase: 'Self-hosted WordPress sites, CMS development, blogging',
    },
    {
      name: 'jenkins/jenkins',
      description: 'Open-source automation server for CI/CD',
      tags: ['lts', 'latest', 'lts-jdk17', 'lts-jdk21'],
      pulls: '500M+',
      officialImage: false,
      useCase: 'CI/CD pipelines, automated builds, plugin-driven DevOps',
    },
    {
      name: 'confluentinc/cp-kafka',
      description: 'Apache Kafka broker by Confluent Platform',
      tags: ['latest', '7.6.0'],
      pulls: '100M+',
      officialImage: false,
      useCase: 'Event streaming, data pipelines, microservice messaging',
    },
    {
      name: 'sonarqube',
      description: 'Code quality and security analysis platform',
      tags: ['latest', 'community', 'developer'],
      pulls: '100M+',
      officialImage: true,
      useCase: 'Static code analysis, security scanning, code coverage reports',
    },
    {
      name: 'vault',
      description: 'HashiCorp Vault secrets management',
      tags: ['latest', '1.16', '1.15'],
      pulls: '100M+',
      officialImage: true,
      useCase: 'Secrets management, PKI, dynamic credentials',
    },
    {
      name: 'keycloak/keycloak',
      description: 'Open-source identity and access management (IAM)',
      tags: ['latest', '24', '23'],
      pulls: '100M+',
      officialImage: false,
      useCase: 'SSO, OIDC/OAuth2 provider, user federation, social login',
    },
    {
      name: 'qdrant/qdrant',
      description: 'High-performance vector database for AI applications',
      tags: ['latest', 'v1.9.0'],
      pulls: '50M+',
      officialImage: false,
      useCase: 'Semantic search, RAG pipelines, recommendation systems',
    },
  ];
}

// ---- Linux Distributions ---------------------------------------------------

export interface LinuxDistribution {
  name: string;
  year: number;
  based_on: string;
  package_manager: string;
  desktop: string[];
  useCase: string;
  company: string;
}

export function linuxDistributionsData(): LinuxDistribution[] {
  return [
    {
      name: 'Ubuntu',
      year: 2004,
      based_on: 'Debian',
      package_manager: 'apt / snap',
      desktop: ['GNOME', 'KDE (Kubuntu)', 'XFCE (Xubuntu)', 'LXQt (Lubuntu)'],
      useCase: 'Desktop, servers, cloud, containers, IoT (snaps)',
      company: 'Canonical',
    },
    {
      name: 'Debian',
      year: 1993,
      based_on: 'Independent',
      package_manager: 'apt / dpkg',
      desktop: ['GNOME', 'KDE', 'XFCE', 'LXDE'],
      useCase: 'Stable servers, base distro for Ubuntu/Mint/Kali',
      company: 'Debian Project (community)',
    },
    {
      name: 'Fedora',
      year: 2003,
      based_on: 'Red Hat',
      package_manager: 'dnf',
      desktop: ['GNOME', 'KDE (Fedora KDE)', 'XFCE', 'i3 (Spins)'],
      useCase: 'Cutting-edge desktop, developer workstation, RHEL upstream testing',
      company: 'Red Hat / Fedora Project',
    },
    {
      name: 'CentOS Stream',
      year: 2019,
      based_on: 'Red Hat',
      package_manager: 'dnf',
      desktop: ['GNOME'],
      useCase: 'RHEL preview, enterprise servers, CI/CD environments',
      company: 'Red Hat',
    },
    {
      name: 'Red Hat Enterprise Linux',
      year: 2000,
      based_on: 'Fedora',
      package_manager: 'dnf / rpm',
      desktop: ['GNOME'],
      useCase: 'Enterprise servers, mission-critical workloads, compliance',
      company: 'Red Hat (IBM)',
    },
    {
      name: 'Arch Linux',
      year: 2002,
      based_on: 'Independent',
      package_manager: 'pacman / AUR',
      desktop: ['User choice (GNOME, KDE, i3, Sway, etc.)'],
      useCase: 'Rolling release, custom setups, power users, advanced learning',
      company: 'Arch Linux community',
    },
    {
      name: 'openSUSE',
      year: 2005,
      based_on: 'SUSE',
      package_manager: 'zypper / rpm',
      desktop: ['KDE Plasma', 'GNOME'],
      useCase: 'Developer workstations, enterprise (SUSE Linux Enterprise), YaST admin',
      company: 'SUSE / openSUSE Project',
    },
    {
      name: 'Linux Mint',
      year: 2006,
      based_on: 'Ubuntu',
      package_manager: 'apt',
      desktop: ['Cinnamon', 'MATE', 'XFCE'],
      useCase: 'Windows-like desktop, beginner-friendly Linux experience',
      company: 'Linux Mint Project',
    },
    {
      name: 'Kali Linux',
      year: 2013,
      based_on: 'Debian',
      package_manager: 'apt',
      desktop: ['XFCE', 'KDE', 'GNOME'],
      useCase: 'Penetration testing, cybersecurity research, CTF competitions',
      company: 'Offensive Security',
    },
    {
      name: 'Pop!_OS',
      year: 2017,
      based_on: 'Ubuntu',
      package_manager: 'apt',
      desktop: ['GNOME (Pop Shell)'],
      useCase: 'Developer and creative workstation, NVIDIA/AMD GPU support, tiling WM',
      company: 'System76',
    },
    {
      name: 'Alpine Linux',
      year: 2005,
      based_on: 'musl libc',
      package_manager: 'apk',
      desktop: ['None (minimal by default)'],
      useCase: 'Docker base images, embedded systems, security-focused minimal servers',
      company: 'Alpine Linux Project',
    },
    {
      name: 'NixOS',
      year: 2003,
      based_on: 'Independent (Nix)',
      package_manager: 'nix',
      desktop: ['GNOME', 'KDE', 'i3', 'custom'],
      useCase: 'Reproducible system configuration, declarative infra, development envs',
      company: 'NixOS Foundation',
    },
    {
      name: 'Gentoo',
      year: 2002,
      based_on: 'Independent',
      package_manager: 'portage (emerge)',
      desktop: ['User choice'],
      useCase: 'From-source compilation, maximum optimization, advanced Linux use',
      company: 'Gentoo Foundation',
    },
    {
      name: 'Rocky Linux',
      year: 2021,
      based_on: 'Red Hat',
      package_manager: 'dnf',
      desktop: ['GNOME'],
      useCase: 'CentOS replacement, enterprise RHEL-compatible servers',
      company: 'Rocky Enterprise Software Foundation',
    },
    {
      name: 'AlmaLinux',
      year: 2021,
      based_on: 'Red Hat',
      package_manager: 'dnf',
      desktop: ['GNOME'],
      useCase: 'CentOS replacement, free RHEL binary-compatible alternative',
      company: 'AlmaLinux OS Foundation',
    },
    {
      name: 'Manjaro',
      year: 2011,
      based_on: 'Arch Linux',
      package_manager: 'pacman',
      desktop: ['KDE Plasma', 'GNOME', 'XFCE'],
      useCase: 'User-friendly rolling release, gaming, power user desktop',
      company: 'Manjaro GmbH & Co. KG',
    },
    {
      name: 'Elementary OS',
      year: 2011,
      based_on: 'Ubuntu',
      package_manager: 'apt',
      desktop: ['Pantheon'],
      useCase: 'macOS-like desktop experience, design-focused Linux',
      company: 'elementary Inc.',
    },
    {
      name: 'EndeavourOS',
      year: 2019,
      based_on: 'Arch Linux',
      package_manager: 'pacman',
      desktop: ['XFCE (default)', 'KDE', 'GNOME', 'i3', 'Sway'],
      useCase: 'Arch Linux with easier installation, active community support',
      company: 'EndeavourOS Team (community)',
    },
    {
      name: 'Void Linux',
      year: 2008,
      based_on: 'Independent',
      package_manager: 'xbps',
      desktop: ['XFCE', 'KDE', 'user choice'],
      useCase: 'Independent rolling release, runit init system, musl libc support',
      company: 'Void Linux team',
    },
    {
      name: 'Tails',
      year: 2009,
      based_on: 'Debian',
      package_manager: 'apt',
      desktop: ['GNOME'],
      useCase: 'Privacy and anonymity (routes via Tor), live OS from USB',
      company: 'Tails Project',
    },
  ];
}

// ---- HTTP Status Codes (with implementation notes) -------------------------

export interface HttpStatusTech {
  code: number;
  reason: string;
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
  description: string;
  whenToUse: string;
  example: string;
}

export function httpStatusTechData(): HttpStatusTech[] {
  return [
    // 1xx
    { code: 100, reason: 'Continue', category: '1xx', description: 'Server has received request headers and client should proceed with the body.', whenToUse: 'Use when client sends Expect: 100-continue header before a large POST body.', example: 'Large file upload pre-check' },
    { code: 101, reason: 'Switching Protocols', category: '1xx', description: 'Server agrees to switch protocols as requested via Upgrade header.', whenToUse: 'WebSocket handshake (HTTP → WebSocket) or HTTP/1.1 → HTTP/2 upgrades.', example: 'WebSocket connection upgrade' },
    { code: 103, reason: 'Early Hints', category: '1xx', description: 'Used with Link header to allow browser to preload resources while server prepares response.', whenToUse: 'Performance optimization: send preload hints before full response.', example: 'HTTP/2 server push alternative for CSS/JS preloading' },
    // 2xx
    { code: 200, reason: 'OK', category: '2xx', description: 'Request succeeded. Response body contains the result.', whenToUse: 'Standard success response for GET, PUT, PATCH requests.', example: 'GET /users/1 → 200 with user JSON' },
    { code: 201, reason: 'Created', category: '2xx', description: 'Resource was successfully created. Location header should point to the new resource.', whenToUse: 'POST requests that create a new resource.', example: 'POST /users → 201 with Location: /users/42' },
    { code: 202, reason: 'Accepted', category: '2xx', description: 'Request accepted for processing but processing not yet completed (asynchronous).', whenToUse: 'Long-running background jobs, async processing queues.', example: 'POST /reports/generate → 202 with job ID' },
    { code: 204, reason: 'No Content', category: '2xx', description: 'Request succeeded but no response body is returned.', whenToUse: 'DELETE, PATCH, or PUT when you do not return updated resource.', example: 'DELETE /users/42 → 204' },
    { code: 206, reason: 'Partial Content', category: '2xx', description: 'Server is delivering only a portion of the resource (range request).', whenToUse: 'Video/audio streaming, resumable downloads (Range header).', example: 'GET /video.mp4 with Range: bytes=0-1023 → 206' },
    // 3xx
    { code: 301, reason: 'Moved Permanently', category: '3xx', description: 'Resource permanently moved to new URL. Clients should update bookmarks.', whenToUse: 'Permanent URL changes, domain migrations, SEO-friendly redirects.', example: 'http://example.com → 301 → https://example.com' },
    { code: 302, reason: 'Found', category: '3xx', description: 'Resource temporarily at different URI. Method may change to GET.', whenToUse: 'Temporary redirects, post-login redirects (though 303 preferred).', example: 'After form POST, redirect to /success' },
    { code: 303, reason: 'See Other', category: '3xx', description: 'Response to POST/PUT/DELETE that redirects to a different resource via GET.', whenToUse: 'Post/Redirect/Get (PRG) pattern to prevent form re-submission.', example: 'POST /login → 303 → GET /dashboard' },
    { code: 304, reason: 'Not Modified', category: '3xx', description: 'Cached version is still valid. No body is returned.', whenToUse: 'HTTP caching with ETag or Last-Modified headers.', example: 'GET /styles.css with If-None-Match → 304' },
    { code: 307, reason: 'Temporary Redirect', category: '3xx', description: 'Temporary redirect; method and body must NOT change.', whenToUse: 'Preserve POST method during temporary redirect (unlike 302).', example: 'POST /api/v1/resource → 307 → POST /api/v2/resource' },
    { code: 308, reason: 'Permanent Redirect', category: '3xx', description: 'Permanent redirect; method and body must NOT change.', whenToUse: 'Permanent POST/PUT redirects where method must be preserved.', example: 'POST /old-endpoint → 308 → POST /new-endpoint' },
    // 4xx
    { code: 400, reason: 'Bad Request', category: '4xx', description: 'Server cannot process request due to client error (malformed syntax, invalid data).', whenToUse: 'Invalid query params, malformed JSON body, missing required fields.', example: 'POST /users with invalid email → 400 with validation errors' },
    { code: 401, reason: 'Unauthorized', category: '4xx', description: 'Authentication required. Client must authenticate itself to get requested response.', whenToUse: 'Missing or invalid authentication token/credentials.', example: 'GET /profile with expired JWT → 401' },
    { code: 403, reason: 'Forbidden', category: '4xx', description: 'Client is authenticated but does not have permission to access the resource.', whenToUse: 'Authenticated user lacks required role or ownership.', example: 'DELETE /users/1 by non-admin user → 403' },
    { code: 404, reason: 'Not Found', category: '4xx', description: 'Requested resource could not be found on the server.', whenToUse: 'Resource does not exist or has been deleted; also used to hide existence (vs 403).', example: 'GET /users/99999 → 404' },
    { code: 405, reason: 'Method Not Allowed', category: '4xx', description: 'HTTP method is not supported for the requested resource.', whenToUse: 'Client sends DELETE to a read-only endpoint or GET to a POST-only endpoint.', example: 'DELETE /health → 405 (only GET allowed)' },
    { code: 408, reason: 'Request Timeout', category: '4xx', description: 'Server timed out waiting for the request body.', whenToUse: 'Client is too slow to send request body (server idle timeout).', example: 'Slow client upload exceeds server read timeout' },
    { code: 409, reason: 'Conflict', category: '4xx', description: 'Request conflicts with current state of the server.', whenToUse: 'Duplicate resource creation, version conflicts in optimistic concurrency.', example: 'POST /users with existing email → 409' },
    { code: 410, reason: 'Gone', category: '4xx', description: 'Resource permanently removed with no forwarding address.', whenToUse: 'Permanently deleted resources where you want to notify crawlers.', example: 'GET /api/v1/deprecated-feature → 410' },
    { code: 415, reason: 'Unsupported Media Type', category: '4xx', description: 'Server refuses to accept the request because the payload format is unsupported.', whenToUse: 'Client sends XML but endpoint only accepts JSON.', example: 'POST /users with Content-Type: text/xml → 415' },
    { code: 422, reason: 'Unprocessable Entity', category: '4xx', description: 'Request body is well-formed but contains semantic errors.', whenToUse: 'Business logic validation failures (invalid enum value, constraint violations).', example: 'POST /orders with out-of-stock item → 422' },
    { code: 429, reason: 'Too Many Requests', category: '4xx', description: 'Client has sent too many requests in a given time (rate limiting).', whenToUse: 'Rate limiting APIs; include Retry-After header.', example: 'API call 101 in a 100/min rate limit → 429' },
    // 5xx
    { code: 500, reason: 'Internal Server Error', category: '5xx', description: 'Generic server error. Something went wrong on the server side.', whenToUse: 'Unexpected exceptions, unhandled errors. Avoid leaking stack traces to clients.', example: 'Uncaught exception in request handler → 500' },
    { code: 501, reason: 'Not Implemented', category: '5xx', description: 'Server does not support the functionality required to fulfill the request.', whenToUse: 'HTTP method not supported by the server at all (contrast with 405).', example: 'Server that does not support PATCH → 501' },
    { code: 502, reason: 'Bad Gateway', category: '5xx', description: 'Server acting as a gateway received an invalid response from upstream.', whenToUse: 'Reverse proxy (Nginx/Traefik) cannot reach application server.', example: 'Node.js app crashed → Nginx returns 502' },
    { code: 503, reason: 'Service Unavailable', category: '5xx', description: 'Server temporarily unable to handle the request (overloaded or down for maintenance).', whenToUse: 'Maintenance windows, circuit breakers, health check failures. Include Retry-After.', example: 'Deploying new version → return 503 during restart' },
    { code: 504, reason: 'Gateway Timeout', category: '5xx', description: 'Server acting as a gateway did not receive a timely response from upstream.', whenToUse: 'Upstream service took too long; distinguish from 503 (unavailable vs timeout).', example: 'Database query exceeded 30s reverse proxy timeout → 504' },
  ];
}

// ---- API Auth Methods ------------------------------------------------------

export interface ApiAuthMethod {
  name: string;
  type: string;
  description: string;
  pros: string[];
  cons: string[];
  usedBy: string[];
}

export function apiAuthMethodsData(): ApiAuthMethod[] {
  return [
    {
      name: 'API Key',
      type: 'Token',
      description: 'A static secret key passed in headers, query params, or request body to identify and authenticate a client.',
      pros: ['Simple to implement', 'Easy to distribute', 'No expiry needed (client manages rotation)', 'Works everywhere'],
      cons: ['No built-in expiry by default', 'If leaked, provides full access until revoked', 'Not user-specific (identifies app, not user)', 'Hard to scope granularly without custom logic'],
      usedBy: ['Stripe', 'OpenAI', 'Google Maps API', 'Twilio'],
    },
    {
      name: 'HTTP Basic Authentication',
      type: 'Credential',
      description: 'Username and password sent Base64-encoded in the Authorization header on every request.',
      pros: ['Extremely simple', 'Universally supported', 'No token management needed'],
      cons: ['Credentials sent on every request', 'Must use HTTPS to be safe', 'No expiry or session management', 'Not suitable for user-facing apps'],
      usedBy: ['Internal tools', 'Legacy APIs', 'GitHub (deprecated)', 'HTTP proxy auth'],
    },
    {
      name: 'Bearer Token (OAuth 2.0)',
      type: 'Token',
      description: 'An opaque or JWT access token passed in the Authorization header, obtained via OAuth 2.0 flows.',
      pros: ['Short-lived tokens reduce exposure', 'Revocable at the authorization server', 'Supports scoped access', 'Industry standard'],
      cons: ['Requires OAuth infrastructure', 'Token must be stored securely on client', 'More complex setup than API keys'],
      usedBy: ['Google APIs', 'GitHub OAuth Apps', 'Spotify', 'Slack'],
    },
    {
      name: 'JWT (JSON Web Token)',
      type: 'Token',
      description: 'Signed (and optionally encrypted) token containing claims. Server validates signature without database lookup.',
      pros: ['Stateless — no server-side session storage', 'Contains user claims (roles, id) inline', 'Works across microservices', 'Standard format (RFC 7519)'],
      cons: ['Cannot be revoked before expiry without a denylist', 'Token size grows with claims', 'HS256 secret must be shared — use RS256 for multi-service', 'Accidental alg=none vulnerability if not validated'],
      usedBy: ['Auth0', 'Firebase', 'AWS Cognito', 'most modern REST APIs'],
    },
    {
      name: 'OAuth 2.0 Authorization Code Flow',
      type: 'Delegation',
      description: 'Three-legged flow where user grants a third-party app limited access to their account without sharing passwords.',
      pros: ['User grants scoped, revocable access', 'Credentials never shared with third party', 'Refresh tokens for long-lived access', 'PKCE extension makes it safe for SPAs'],
      cons: ['Complex implementation', 'Requires redirect URI handling', 'State management needed to prevent CSRF', 'Multiple round trips'],
      usedBy: ['Sign in with Google', 'GitHub OAuth', 'Sign in with Apple', 'Twitter/X'],
    },
    {
      name: 'OAuth 2.0 Client Credentials Flow',
      type: 'Delegation',
      description: 'Machine-to-machine OAuth flow where a service authenticates with client ID and secret to get an access token.',
      pros: ['No user interaction needed', 'Suitable for automated services', 'Access tokens are short-lived', 'Scoped access'],
      cons: ['Client secret must be stored securely', 'Token rotation adds complexity', 'Requires OAuth authorization server'],
      usedBy: ['AWS STS', 'Azure AD app registrations', 'internal microservice auth'],
    },
    {
      name: 'OpenID Connect (OIDC)',
      type: 'Identity Federation',
      description: 'Identity layer on top of OAuth 2.0 that adds an ID token (JWT) to prove the authenticated user\'s identity.',
      pros: ['Standardizes user identity on top of OAuth 2.0', 'ID token contains verified user info', 'SSO across applications', 'Discovery endpoint simplifies integration'],
      cons: ['More complex than basic OAuth 2.0', 'Requires OIDC-compliant identity provider', 'Token validation requires key fetching (JWKS)'],
      usedBy: ['Google Identity', 'Microsoft Entra', 'Okta', 'Keycloak', 'Auth0'],
    },
    {
      name: 'SAML 2.0',
      type: 'Identity Federation',
      description: 'XML-based open standard for exchanging authentication and authorization data between identity providers and service providers.',
      pros: ['Enterprise SSO standard', 'Strong security assertions', 'Widely supported in enterprise IdPs', 'Rich attribute statements'],
      cons: ['XML verbose and complex', 'Not suitable for mobile/API', 'Hard to implement correctly', 'Older standard vs OIDC'],
      usedBy: ['Salesforce SSO', 'AWS IAM Identity Center', 'Office 365 enterprise auth', 'Okta enterprise'],
    },
    {
      name: 'mTLS (Mutual TLS)',
      type: 'Certificate',
      description: 'Both client and server authenticate each other using X.509 certificates during TLS handshake.',
      pros: ['Very strong authentication', 'No tokens to steal at runtime', 'Suitable for service mesh and IoT', 'Certificate pinning prevents MITM'],
      cons: ['Complex certificate lifecycle management', 'Client certificates must be distributed', 'Not practical for browser-based clients', 'Rotation and revocation require PKI infrastructure'],
      usedBy: ['Istio service mesh', 'Cloudflare mTLS', 'banking APIs', 'IoT device auth'],
    },
    {
      name: 'HMAC Signature',
      type: 'Signature',
      description: 'Client signs the request (method, URL, body, timestamp) with a shared secret using HMAC; server verifies.',
      pros: ['Request integrity verification (payload tampering detected)', 'Replay attack prevention with timestamp/nonce', 'No credentials in request body', 'Works for webhooks'],
      cons: ['Shared secret must be kept safe', 'More complex client implementation', 'Clock skew can cause failures', 'Not for browser-side use (exposes secret)'],
      usedBy: ['AWS Signature v4', 'Stripe webhooks', 'Shopify webhooks', 'Twilio request validation'],
    },
    {
      name: 'Passkeys / WebAuthn',
      type: 'Passwordless',
      description: 'FIDO2 standard for passwordless authentication using public-key cryptography tied to device biometrics or hardware keys.',
      pros: ['Phishing-resistant (origin-bound)', 'No passwords to steal or breach', 'Strong UX (biometric unlock)', 'W3C standard with broad platform support'],
      cons: ['Requires device with authenticator support', 'Account recovery UX is complex', 'Relatively new ecosystem', 'Not suitable for server-to-server API auth'],
      usedBy: ['Google passkeys', 'Apple passkeys', 'GitHub passkeys', 'Microsoft passwordless'],
    },
    {
      name: 'Session Cookie',
      type: 'Session',
      description: 'After successful login, server issues a session ID stored in an HttpOnly, Secure cookie. Server stores session state.',
      pros: ['Simple for server-rendered apps', 'HttpOnly cookies not accessible to JS (XSS resilience)', 'Easy to invalidate server-side', 'Automatic browser handling'],
      cons: ['Stateful — requires server-side session storage', 'CSRF attacks require mitigation (SameSite cookie)', 'Does not work well for mobile API clients', 'Sticky sessions needed for horizontal scaling without shared store'],
      usedBy: ['Traditional web apps', 'Django sessions', 'Rails sessions', 'Express-session'],
    },
  ];
}
