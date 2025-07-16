const fs = require('fs');
const path = require('path');

describe('Integration Tests', () => {
  describe('All Services Setup', () => {
    const services = ['frontend', 'api', 'websocket', 'notion-recorder', 'shogi-engine'];

    services.forEach((service) => {
      test(`${service} should have package.json`, () => {
        const packagePath = path.join(__dirname, service, 'package.json');
        expect(fs.existsSync(packagePath)).toBe(true);
      });

      test(`${service} should have Dockerfile`, () => {
        const dockerfilePath = path.join(__dirname, service, 'Dockerfile');
        expect(fs.existsSync(dockerfilePath)).toBe(true);
      });

      test(`${service} should have main source file`, () => {
        const mainPaths = [
          path.join(__dirname, service, 'src', 'server.ts'),
          path.join(__dirname, service, 'src', 'App.tsx'),
          path.join(__dirname, service, 'src', 'index.tsx'),
        ];

        const hasMainFile = mainPaths.some((p) => fs.existsSync(p));
        expect(hasMainFile).toBe(true);
      });
    });
  });

  describe('Docker Compose Configuration', () => {
    test('docker-compose.yml should contain all services', () => {
      const dockerComposePath = path.join(__dirname, 'docker-compose.yml');
      const content = fs.readFileSync(dockerComposePath, 'utf8');

      expect(content).toContain('frontend');
      expect(content).toContain('api');
      expect(content).toContain('websocket');
      expect(content).toContain('notion-recorder');
      expect(content).toContain('shogi-engine');
      expect(content).toContain('redis');
    });

    test('all services should have correct ports', () => {
      const dockerComposePath = path.join(__dirname, 'docker-compose.yml');
      const content = fs.readFileSync(dockerComposePath, 'utf8');

      expect(content).toContain('3000:3000'); // frontend
      expect(content).toContain('8000:8000'); // api
      expect(content).toContain('8001:8001'); // websocket
      expect(content).toContain('8002:8002'); // shogi-engine
      expect(content).toContain('6379:6379'); // redis
    });
  });

  describe('Package Dependencies', () => {
    test('frontend should have React dependencies', () => {
      const packagePath = path.join(__dirname, 'frontend', 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      expect(packageContent.dependencies.react).toBeDefined();
      expect(packageContent.dependencies['react-dom']).toBeDefined();
      expect(packageContent.devDependencies.typescript).toBeDefined();
    });

    test('api should have Express dependencies', () => {
      const packagePath = path.join(__dirname, 'api', 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      expect(packageContent.dependencies.express).toBeDefined();
      expect(packageContent.dependencies['firebase-admin']).toBeDefined();
      expect(packageContent.devDependencies.typescript).toBeDefined();
    });

    test('websocket should have Socket.io dependencies', () => {
      const packagePath = path.join(__dirname, 'websocket', 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      expect(packageContent.dependencies['socket.io']).toBeDefined();
      expect(packageContent.dependencies.redis).toBeDefined();
      expect(packageContent.devDependencies.typescript).toBeDefined();
    });

    test('notion-recorder should have Notion SDK dependencies', () => {
      const packagePath = path.join(__dirname, 'notion-recorder', 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      expect(packageContent.dependencies['@notionhq/client']).toBeDefined();
      expect(packageContent.dependencies.bull).toBeDefined();
      expect(packageContent.devDependencies.typescript).toBeDefined();
    });

    test('shogi-engine should have required dependencies', () => {
      const packagePath = path.join(__dirname, 'shogi-engine', 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      expect(packageContent.dependencies.express).toBeDefined();
      expect(packageContent.devDependencies.typescript).toBeDefined();
    });
  });

  describe('Project Structure', () => {
    test('all required config files should exist', () => {
      const configFiles = [
        'package.json',
        'docker-compose.yml',
        '.gitignore',
        '.prettierrc',
        'README.md',
        'CLAUDE.md',
      ];

      configFiles.forEach((file) => {
        const filePath = path.join(__dirname, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('all services should have environment examples', () => {
      const services = ['api', 'websocket', 'notion-recorder', 'shogi-engine'];

      services.forEach((service) => {
        const envPath = path.join(__dirname, service, '.env.example');
        expect(fs.existsSync(envPath)).toBe(true);
      });
    });
  });

  describe('Code Quality', () => {
    test('all TypeScript services should have tsconfig.json', () => {
      const services = ['api', 'websocket', 'notion-recorder', 'shogi-engine'];

      services.forEach((service) => {
        const tsconfigPath = path.join(__dirname, service, 'tsconfig.json');
        expect(fs.existsSync(tsconfigPath)).toBe(true);
      });
    });

    test('frontend should have TypeScript configuration', () => {
      const tsconfigPath = path.join(__dirname, 'frontend', 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);
    });
  });
});
