// ---------------------------------------------------------------------------
// configuration.ts — EXAMPLE configuration datasets
// All data is fictional/generic and intended as templates only.
// NEVER contains real credentials, API keys, tokens, passwords, or secrets.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// package.json examples
// ---------------------------------------------------------------------------

export function examplePackageJsonData(): object[] {
  return [
    // Example 1: React application
    {
      _note: 'EXAMPLE TEMPLATE — React application package.json',
      name: 'my-react-app',
      version: '1.0.0',
      private: true,
      description: 'A modern React web application',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
        lint: 'eslint src --ext ts,tsx',
        test: 'vitest',
        'test:coverage': 'vitest --coverage',
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.14.0',
        axios: '^1.4.0',
        zustand: '^4.3.9',
        clsx: '^2.0.0',
      },
      devDependencies: {
        '@types/react': '^18.2.14',
        '@types/react-dom': '^18.2.6',
        '@vitejs/plugin-react': '^4.0.1',
        eslint: '^8.44.0',
        'eslint-plugin-react-hooks': '^4.6.0',
        typescript: '^5.1.6',
        vite: '^4.4.0',
        vitest: '^0.33.0',
      },
      engines: {
        node: '>=18.0.0',
      },
    },

    // Example 2: Node.js REST API
    {
      _note: 'EXAMPLE TEMPLATE — Node.js REST API package.json',
      name: 'my-node-api',
      version: '2.0.0',
      description: 'A RESTful API built with Express and TypeScript',
      main: 'dist/index.js',
      scripts: {
        start: 'node dist/index.js',
        dev: 'ts-node-dev --respawn src/index.ts',
        build: 'tsc',
        lint: 'eslint src --ext ts',
        test: 'jest --coverage',
        'db:migrate': 'prisma migrate deploy',
        'db:seed': 'ts-node prisma/seed.ts',
      },
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5',
        helmet: '^7.0.0',
        'express-rate-limit': '^6.8.0',
        zod: '^3.21.4',
        '@prisma/client': '^5.0.0',
        dotenv: '^16.3.1',
        winston: '^3.10.0',
      },
      devDependencies: {
        '@types/express': '^4.17.17',
        '@types/cors': '^2.8.13',
        '@types/node': '^20.4.2',
        jest: '^29.6.1',
        'ts-jest': '^29.1.1',
        'ts-node-dev': '^2.0.0',
        typescript: '^5.1.6',
        prisma: '^5.0.0',
      },
      engines: {
        node: '>=18.0.0',
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// tsconfig.json examples
// ---------------------------------------------------------------------------

export function exampleTsconfigData(): object[] {
  return [
    // Example 1: Strict TypeScript configuration
    {
      _note: 'EXAMPLE TEMPLATE — Strict TypeScript tsconfig.json',
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        moduleResolution: 'bundler',
        strict: true,
        noUncheckedIndexedAccess: true,
        noImplicitOverride: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        exactOptionalPropertyTypes: true,
        forceConsistentCasingInFileNames: true,
        esModuleInterop: true,
        skipLibCheck: true,
        resolveJsonModule: true,
        outDir: './dist',
        rootDir: './src',
      },
      include: ['src'],
      exclude: ['node_modules', 'dist'],
    },

    // Example 2: Next.js style tsconfig
    {
      _note: 'EXAMPLE TEMPLATE — Next.js style tsconfig.json',
      compilerOptions: {
        target: 'ES2017',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: {
          '@/*': ['./src/*'],
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    },

    // Example 3: Library tsconfig
    {
      _note: 'EXAMPLE TEMPLATE — TypeScript library tsconfig.json',
      compilerOptions: {
        target: 'ES2020',
        module: 'CommonJS',
        lib: ['ES2020'],
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        outDir: './dist',
        rootDir: './src',
        strict: true,
        moduleResolution: 'node',
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts'],
    },
  ];
}

// ---------------------------------------------------------------------------
// ESLint flat config examples
// ---------------------------------------------------------------------------

export function exampleEslintConfigData(): object[] {
  return [
    // Example 1: React + TypeScript flat config
    {
      _note: 'EXAMPLE TEMPLATE — ESLint flat config for React + TypeScript (eslint.config.js)',
      config: [
        {
          files: ['**/*.{ts,tsx}'],
          languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
              ecmaFeatures: { jsx: true },
            },
          },
          plugins: ['@typescript-eslint', 'react', 'react-hooks'],
          extends: [
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended',
            'plugin:react/recommended',
            'plugin:react-hooks/recommended',
          ],
          rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'react/react-in-jsx-scope': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
          },
          settings: {
            react: { version: 'detect' },
          },
        },
        {
          files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
          plugins: ['vitest'],
          extends: ['plugin:vitest/recommended'],
        },
      ],
    },

    // Example 2: Node.js backend flat config
    {
      _note: 'EXAMPLE TEMPLATE — ESLint flat config for Node.js backend (eslint.config.js)',
      config: [
        {
          files: ['**/*.ts'],
          languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
              process: 'readonly',
              __dirname: 'readonly',
              __filename: 'readonly',
            },
          },
          plugins: ['@typescript-eslint', 'node'],
          extends: [
            'eslint:recommended',
            'plugin:@typescript-eslint/strict',
            'plugin:node/recommended',
          ],
          rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/explicit-function-return-type': 'warn',
            'node/no-unsupported-features/es-syntax': ['error', { version: '>=18.0.0' }],
            'no-console': 'off',
            eqeqeq: ['error', 'always'],
          },
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Prettier config examples
// ---------------------------------------------------------------------------

export function examplePrettierConfigData(): object[] {
  return [
    // Example 1: Standard web project Prettier config
    {
      _note: 'EXAMPLE TEMPLATE — Prettier config for web projects (.prettierrc)',
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      tabWidth: 2,
      useTabs: false,
      printWidth: 100,
      bracketSpacing: true,
      arrowParens: 'always',
      endOfLine: 'lf',
      overrides: [
        {
          files: '*.json',
          options: { printWidth: 80 },
        },
        {
          files: '*.md',
          options: { proseWrap: 'always', printWidth: 80 },
        },
      ],
    },

    // Example 2: Opinionated minimal Prettier config
    {
      _note: 'EXAMPLE TEMPLATE — Minimal opinionated Prettier config (.prettierrc)',
      semi: false,
      singleQuote: true,
      trailingComma: 'all',
      tabWidth: 2,
      useTabs: false,
      printWidth: 120,
      bracketSpacing: true,
      jsxSingleQuote: false,
      arrowParens: 'avoid',
      endOfLine: 'auto',
    },
  ];
}

// ---------------------------------------------------------------------------
// Vite config examples
// ---------------------------------------------------------------------------

export function exampleViteConfigData(): object[] {
  return [
    // Example 1: React + TypeScript Vite config
    {
      _note: 'EXAMPLE TEMPLATE — Vite config for React + TypeScript (vite.config.ts)',
      plugins: ['@vitejs/plugin-react'],
      resolve: {
        alias: {
          '@': '/src',
        },
      },
      server: {
        port: 3000,
        open: true,
        proxy: {
          '/api': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            rewrite: 'path => path.replace(/^\\/api/, \'\')',
          },
        },
      },
      build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              router: ['react-router-dom'],
            },
          },
        },
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
        },
      },
    },

    // Example 2: Vue 3 + TypeScript Vite config
    {
      _note: 'EXAMPLE TEMPLATE — Vite config for Vue 3 + TypeScript (vite.config.ts)',
      plugins: ['@vitejs/plugin-vue', '@vitejs/plugin-vue-jsx'],
      resolve: {
        alias: {
          '@': '/src',
          '~': '/node_modules',
        },
      },
      server: {
        port: 5173,
        host: true,
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
        rollupOptions: {
          output: {
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          },
        },
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Next.js config examples (as JSON representation)
// ---------------------------------------------------------------------------

export function exampleNextjsConfigData(): object[] {
  return [
    // Example 1: Standard Next.js config with image domains and headers
    {
      _note: 'EXAMPLE TEMPLATE — next.config.js represented as JSON',
      reactStrictMode: true,
      swcMinify: true,
      experimental: {
        serverActions: true,
        typedRoutes: true,
      },
      images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'example-cdn.example.com',
            pathname: '/images/**',
          },
        ],
        formats: ['image/avif', 'image/webp'],
      },
      env: {
        NEXT_PUBLIC_APP_NAME: 'MyApp',
        NEXT_PUBLIC_APP_URL: 'https://example.com',
      },
      headers: [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          ],
        },
      ],
      redirects: [
        {
          source: '/old-path',
          destination: '/new-path',
          permanent: true,
        },
      ],
    },

    // Example 2: Next.js config with i18n and rewrites
    {
      _note: 'EXAMPLE TEMPLATE — next.config.js with i18n and rewrites (JSON representation)',
      reactStrictMode: true,
      poweredByHeader: false,
      compress: true,
      i18n: {
        locales: ['en', 'fr', 'de', 'es'],
        defaultLocale: 'en',
      },
      images: {
        domains: ['images.example.com', 'cdn.example.com'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      },
      rewrites: [
        {
          source: '/api/proxy/:path*',
          destination: 'https://backend.example.com/:path*',
        },
      ],
      webpack: {
        description: 'Custom webpack config to handle SVG as React components',
        svgrRule: true,
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Docker Compose config examples
// ---------------------------------------------------------------------------

export function exampleDockerComposeData(): object[] {
  return [
    // Example 1: Web app + PostgreSQL + Redis
    {
      _note: 'EXAMPLE TEMPLATE — Docker Compose for web app + PostgreSQL + Redis',
      version: '3.9',
      services: {
        web: {
          build: {
            context: '.',
            dockerfile: 'Dockerfile',
          },
          ports: ['3000:3000'],
          environment: {
            NODE_ENV: 'development',
            DATABASE_URL: 'postgresql://appuser:EXAMPLE_PASSWORD@db:5432/appdb',
            REDIS_URL: 'redis://cache:6379',
          },
          depends_on: {
            db: { condition: 'service_healthy' },
            cache: { condition: 'service_started' },
          },
          volumes: ['./src:/app/src'],
          restart: 'unless-stopped',
        },
        db: {
          image: 'postgres:15-alpine',
          environment: {
            POSTGRES_DB: 'appdb',
            POSTGRES_USER: 'appuser',
            POSTGRES_PASSWORD: 'EXAMPLE_PASSWORD',
          },
          volumes: ['postgres_data:/var/lib/postgresql/data'],
          healthcheck: {
            test: ['CMD-SHELL', 'pg_isready -U appuser -d appdb'],
            interval: '10s',
            timeout: '5s',
            retries: 5,
          },
          restart: 'unless-stopped',
        },
        cache: {
          image: 'redis:7-alpine',
          command: 'redis-server --appendonly yes',
          volumes: ['redis_data:/data'],
          restart: 'unless-stopped',
        },
      },
      volumes: {
        postgres_data: null,
        redis_data: null,
      },
      networks: {
        default: {
          driver: 'bridge',
        },
      },
    },

    // Example 2: Microservices (API gateway + auth + product services)
    {
      _note: 'EXAMPLE TEMPLATE — Docker Compose for microservices setup',
      version: '3.9',
      services: {
        gateway: {
          image: 'nginx:1.25-alpine',
          ports: ['80:80', '443:443'],
          volumes: ['./nginx/nginx.conf:/etc/nginx/nginx.conf:ro'],
          depends_on: ['auth-service', 'product-service'],
          restart: 'unless-stopped',
        },
        'auth-service': {
          build: {
            context: './services/auth',
            dockerfile: 'Dockerfile',
          },
          environment: {
            PORT: '4001',
            DATABASE_URL: 'postgresql://authuser:EXAMPLE_PASSWORD@auth-db:5432/authdb',
            JWT_SECRET: 'EXAMPLE_JWT_SECRET_REPLACE_IN_PRODUCTION',
          },
          depends_on: {
            'auth-db': { condition: 'service_healthy' },
          },
          restart: 'unless-stopped',
        },
        'product-service': {
          build: {
            context: './services/products',
            dockerfile: 'Dockerfile',
          },
          environment: {
            PORT: '4002',
            DATABASE_URL: 'mongodb://productuser:EXAMPLE_PASSWORD@product-db:27017/productdb',
          },
          depends_on: ['product-db'],
          restart: 'unless-stopped',
        },
        'auth-db': {
          image: 'postgres:15-alpine',
          environment: {
            POSTGRES_DB: 'authdb',
            POSTGRES_USER: 'authuser',
            POSTGRES_PASSWORD: 'EXAMPLE_PASSWORD',
          },
          volumes: ['auth_db_data:/var/lib/postgresql/data'],
          healthcheck: {
            test: ['CMD-SHELL', 'pg_isready -U authuser -d authdb'],
            interval: '10s',
            timeout: '5s',
            retries: 5,
          },
        },
        'product-db': {
          image: 'mongo:6-jammy',
          environment: {
            MONGO_INITDB_ROOT_USERNAME: 'productuser',
            MONGO_INITDB_ROOT_PASSWORD: 'EXAMPLE_PASSWORD',
            MONGO_INITDB_DATABASE: 'productdb',
          },
          volumes: ['product_db_data:/data/db'],
        },
      },
      volumes: {
        auth_db_data: null,
        product_db_data: null,
      },
      networks: {
        default: {
          driver: 'bridge',
        },
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// GitHub Actions workflow examples
// ---------------------------------------------------------------------------

export function exampleGithubActionsData(): object[] {
  return [
    // Example 1: Node.js CI/CD workflow
    {
      _note: 'EXAMPLE TEMPLATE — GitHub Actions CI/CD for Node.js (.github/workflows/ci.yml)',
      name: 'CI/CD Pipeline',
      on: {
        push: {
          branches: ['main', 'develop'],
        },
        pull_request: {
          branches: ['main'],
        },
      },
      env: {
        NODE_VERSION: '20.x',
        REGISTRY: 'ghcr.io',
        IMAGE_NAME: '${{ github.repository }}',
      },
      jobs: {
        test: {
          name: 'Test',
          'runs-on': 'ubuntu-latest',
          steps: [
            {
              name: 'Checkout code',
              uses: 'actions/checkout@v4',
            },
            {
              name: 'Setup Node.js',
              uses: 'actions/setup-node@v4',
              with: {
                'node-version': '${{ env.NODE_VERSION }}',
                cache: 'npm',
              },
            },
            {
              name: 'Install dependencies',
              run: 'npm ci',
            },
            {
              name: 'Lint',
              run: 'npm run lint',
            },
            {
              name: 'Run tests',
              run: 'npm test -- --coverage',
            },
            {
              name: 'Upload coverage',
              uses: 'codecov/codecov-action@v4',
              with: {
                token: '${{ secrets.CODECOV_TOKEN }}',
              },
            },
          ],
        },
        build: {
          name: 'Build Docker image',
          'runs-on': 'ubuntu-latest',
          needs: 'test',
          if: "github.ref == 'refs/heads/main'",
          steps: [
            {
              name: 'Checkout code',
              uses: 'actions/checkout@v4',
            },
            {
              name: 'Set up Docker Buildx',
              uses: 'docker/setup-buildx-action@v3',
            },
            {
              name: 'Login to GHCR',
              uses: 'docker/login-action@v3',
              with: {
                registry: '${{ env.REGISTRY }}',
                username: '${{ github.actor }}',
                password: '${{ secrets.GITHUB_TOKEN }}',
              },
            },
            {
              name: 'Build and push',
              uses: 'docker/build-push-action@v5',
              with: {
                context: '.',
                push: true,
                tags: '${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest',
                cache_from: 'type=gha',
                cache_to: 'type=gha,mode=max',
              },
            },
          ],
        },
      },
    },

    // Example 2: Release and deploy workflow
    {
      _note: 'EXAMPLE TEMPLATE — GitHub Actions release workflow (.github/workflows/release.yml)',
      name: 'Release',
      on: {
        push: {
          tags: ['v*.*.*'],
        },
      },
      permissions: {
        contents: 'write',
        packages: 'write',
      },
      jobs: {
        release: {
          name: 'Create Release',
          'runs-on': 'ubuntu-latest',
          steps: [
            {
              name: 'Checkout',
              uses: 'actions/checkout@v4',
              with: {
                'fetch-depth': 0,
              },
            },
            {
              name: 'Setup Node.js',
              uses: 'actions/setup-node@v4',
              with: {
                'node-version': '20.x',
                cache: 'npm',
              },
            },
            {
              name: 'Install dependencies',
              run: 'npm ci',
            },
            {
              name: 'Build',
              run: 'npm run build',
            },
            {
              name: 'Generate changelog',
              id: 'changelog',
              uses: 'requarks/changelog-action@v1',
              with: {
                token: '${{ github.token }}',
                tag: '${{ github.ref_name }}',
              },
            },
            {
              name: 'Create release',
              uses: 'ncipollo/release-action@v1',
              with: {
                allowUpdates: true,
                tag: '${{ github.ref_name }}',
                name: 'Release ${{ github.ref_name }}',
                body: '${{ steps.changelog.outputs.changes }}',
                token: '${{ secrets.GITHUB_TOKEN }}',
              },
            },
          ],
        },
        deploy: {
          name: 'Deploy to Production',
          'runs-on': 'ubuntu-latest',
          needs: 'release',
          environment: 'production',
          steps: [
            {
              name: 'Deploy',
              run: 'echo "Deploy step — configure for your specific hosting provider"',
            },
          ],
        },
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Spring Boot application.yml examples (as JSON)
// ---------------------------------------------------------------------------

export function exampleSpringBootConfigData(): object[] {
  return [
    // Example 1: Spring Boot REST API with JPA and security
    {
      _note: 'EXAMPLE TEMPLATE — Spring Boot application.yml as JSON',
      spring: {
        application: {
          name: 'my-spring-api',
        },
        datasource: {
          url: 'jdbc:postgresql://localhost:5432/myappdb',
          username: 'appuser',
          password: 'EXAMPLE_DB_PASSWORD',
          'driver-class-name': 'org.postgresql.Driver',
          hikari: {
            'maximum-pool-size': 10,
            'minimum-idle': 5,
            'idle-timeout': 600000,
            'connection-timeout': 30000,
          },
        },
        jpa: {
          'hibernate.ddl-auto': 'validate',
          'show-sql': false,
          properties: {
            'hibernate.format_sql': true,
            'hibernate.dialect': 'org.hibernate.dialect.PostgreSQLDialect',
          },
        },
        security: {
          oauth2: {
            resourceserver: {
              jwt: {
                'issuer-uri': 'https://auth.example.com',
                'jwk-set-uri': 'https://auth.example.com/.well-known/jwks.json',
              },
            },
          },
        },
        cache: {
          type: 'redis',
          redis: {
            host: 'localhost',
            port: 6379,
            'time-to-live': '3600000',
          },
        },
      },
      server: {
        port: 8080,
        servlet: {
          'context-path': '/api/v1',
        },
        compression: {
          enabled: true,
          'mime-types': 'application/json,application/xml,text/html',
        },
      },
      logging: {
        level: {
          root: 'INFO',
          'com.example.myapp': 'DEBUG',
          'org.springframework.security': 'WARN',
        },
        pattern: {
          console: '%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n',
        },
      },
      management: {
        endpoints: {
          web: {
            exposure: {
              include: 'health,info,metrics,prometheus',
            },
          },
        },
        endpoint: {
          health: {
            'show-details': 'always',
          },
        },
      },
    },

    // Example 2: Spring Boot microservice with messaging and multi-profile
    {
      _note: 'EXAMPLE TEMPLATE — Spring Boot microservice application.yml (multi-profile)',
      spring: {
        application: {
          name: 'notification-service',
        },
        profiles: {
          active: 'development',
        },
        datasource: {
          url: 'jdbc:h2:mem:notifdb',
          'driver-class-name': 'org.h2.Driver',
          username: 'sa',
          password: '',
        },
        h2: {
          console: {
            enabled: true,
            path: '/h2-console',
          },
        },
        kafka: {
          bootstrap_servers: 'localhost:9092',
          consumer: {
            'group-id': 'notification-group',
            'auto-offset-reset': 'earliest',
            'key-deserializer': 'org.apache.kafka.common.serialization.StringDeserializer',
            'value-deserializer': 'org.springframework.kafka.support.serializer.JsonDeserializer',
          },
          producer: {
            'key-serializer': 'org.apache.kafka.common.serialization.StringSerializer',
            'value-serializer': 'org.springframework.kafka.support.serializer.JsonSerializer',
          },
        },
        mail: {
          host: 'smtp.example.com',
          port: 587,
          username: 'notifications@example.com',
          password: 'EXAMPLE_SMTP_PASSWORD',
          properties: {
            mail: {
              smtp: {
                auth: true,
                'starttls.enable': true,
              },
            },
          },
        },
      },
      server: {
        port: 8082,
      },
      logging: {
        level: {
          root: 'INFO',
          'com.example.notification': 'DEBUG',
        },
      },
      app: {
        email: {
          'from-address': 'no-reply@example.com',
          'from-name': 'ExampleApp Notifications',
        },
        retry: {
          'max-attempts': 3,
          'backoff-delay': 2000,
        },
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// ENV variables examples (as JSON with key/value/description — NO real values)
// ---------------------------------------------------------------------------

export function exampleEnvVariablesData(): object[] {
  return [
    // Example 1: Full-stack web application .env
    {
      _note: 'EXAMPLE TEMPLATE — .env variables for a full-stack web app. All values are placeholders.',
      variables: [
        {
          key: 'NODE_ENV',
          value: 'development',
          description: 'Application environment (development, production, test)',
          required: true,
        },
        {
          key: 'PORT',
          value: '3000',
          description: 'Port the server listens on',
          required: false,
        },
        {
          key: 'DATABASE_URL',
          value: 'postgresql://EXAMPLE_USER:EXAMPLE_PASSWORD@localhost:5432/EXAMPLE_DB',
          description: 'PostgreSQL connection string — replace with real credentials',
          required: true,
        },
        {
          key: 'REDIS_URL',
          value: 'redis://localhost:6379',
          description: 'Redis connection URL for caching and sessions',
          required: false,
        },
        {
          key: 'JWT_SECRET',
          value: 'EXAMPLE_JWT_SECRET_MINIMUM_32_CHARS_REPLACE_THIS',
          description: 'Secret key for signing JWT tokens — use a random 32+ char string in production',
          required: true,
        },
        {
          key: 'JWT_EXPIRES_IN',
          value: '7d',
          description: 'JWT token expiry duration (e.g. 1h, 7d, 30d)',
          required: false,
        },
        {
          key: 'CORS_ORIGIN',
          value: 'http://localhost:3000',
          description: 'Allowed CORS origin(s), comma-separated for multiple',
          required: false,
        },
        {
          key: 'SMTP_HOST',
          value: 'smtp.example.com',
          description: 'SMTP server hostname for sending emails',
          required: false,
        },
        {
          key: 'SMTP_PORT',
          value: '587',
          description: 'SMTP server port (587 for TLS, 465 for SSL)',
          required: false,
        },
        {
          key: 'SMTP_USER',
          value: 'noreply@example.com',
          description: 'SMTP username/email address',
          required: false,
        },
        {
          key: 'SMTP_PASS',
          value: 'EXAMPLE_SMTP_PASSWORD',
          description: 'SMTP password — replace with real credentials',
          required: false,
        },
        {
          key: 'STORAGE_BUCKET',
          value: 'my-example-bucket',
          description: 'Cloud storage bucket name for file uploads',
          required: false,
        },
        {
          key: 'LOG_LEVEL',
          value: 'info',
          description: 'Logging level (error, warn, info, debug)',
          required: false,
        },
      ],
    },

    // Example 2: Microservice .env for an auth service
    {
      _note: 'EXAMPLE TEMPLATE — .env variables for a microservice auth service. All values are placeholders.',
      variables: [
        {
          key: 'SERVICE_NAME',
          value: 'auth-service',
          description: 'Name of this microservice for logging and tracing',
          required: true,
        },
        {
          key: 'SERVICE_PORT',
          value: '4001',
          description: 'Port this service listens on',
          required: true,
        },
        {
          key: 'DATABASE_URL',
          value: 'postgresql://EXAMPLE_USER:EXAMPLE_PASSWORD@auth-db:5432/authdb',
          description: 'PostgreSQL connection string for the auth database',
          required: true,
        },
        {
          key: 'JWT_PRIVATE_KEY',
          value: 'EXAMPLE_RSA_PRIVATE_KEY_PEM_REPLACE_THIS',
          description: 'RSA private key PEM for signing JWTs (RS256)',
          required: true,
        },
        {
          key: 'JWT_PUBLIC_KEY',
          value: 'EXAMPLE_RSA_PUBLIC_KEY_PEM_REPLACE_THIS',
          description: 'RSA public key PEM for verifying JWTs',
          required: true,
        },
        {
          key: 'REFRESH_TOKEN_TTL',
          value: '2592000',
          description: 'Refresh token TTL in seconds (default: 30 days)',
          required: false,
        },
        {
          key: 'OAUTH_GOOGLE_CLIENT_ID',
          value: 'EXAMPLE_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
          description: 'Google OAuth2 client ID for social login',
          required: false,
        },
        {
          key: 'OAUTH_GOOGLE_CLIENT_SECRET',
          value: 'EXAMPLE_GOOGLE_CLIENT_SECRET',
          description: 'Google OAuth2 client secret — replace with real credentials',
          required: false,
        },
        {
          key: 'RATE_LIMIT_WINDOW_MS',
          value: '900000',
          description: 'Rate limiting window in milliseconds (default: 15 minutes)',
          required: false,
        },
        {
          key: 'RATE_LIMIT_MAX_REQUESTS',
          value: '100',
          description: 'Maximum requests per rate limit window per IP',
          required: false,
        },
        {
          key: 'KAFKA_BROKERS',
          value: 'localhost:9092',
          description: 'Comma-separated Kafka broker addresses',
          required: false,
        },
        {
          key: 'JAEGER_ENDPOINT',
          value: 'http://jaeger:14268/api/traces',
          description: 'Jaeger tracing collector endpoint',
          required: false,
        },
      ],
    },
  ];
}
