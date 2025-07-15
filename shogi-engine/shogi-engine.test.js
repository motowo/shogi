const fs = require('fs');
const path = require('path');

describe('Shogi Engine Setup', () => {
  test('package.json should exist', () => {
    const packagePath = path.join(__dirname, 'package.json');
    expect(fs.existsSync(packagePath)).toBe(true);
  });

  test('package.json should contain required dependencies', () => {
    const packagePath = path.join(__dirname, 'package.json');
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    expect(packageContent.dependencies.express).toBeDefined();
    expect(packageContent.dependencies.cors).toBeDefined();
    expect(packageContent.devDependencies.typescript).toBeDefined();
  });

  test('src directory should exist', () => {
    const srcPath = path.join(__dirname, 'src');
    expect(fs.existsSync(srcPath)).toBe(true);
  });

  test('Dockerfile should exist', () => {
    const dockerfilePath = path.join(__dirname, 'Dockerfile');
    expect(fs.existsSync(dockerfilePath)).toBe(true);
  });

  test('main server file should exist', () => {
    const serverPath = path.join(__dirname, 'src', 'server.ts');
    expect(fs.existsSync(serverPath)).toBe(true);
  });

  test('engine service should exist', () => {
    const servicePath = path.join(__dirname, 'src', 'services', 'shogiEngine.ts');
    expect(fs.existsSync(servicePath)).toBe(true);
  });

  test('board logic should exist', () => {
    const boardPath = path.join(__dirname, 'src', 'logic', 'board.ts');
    expect(fs.existsSync(boardPath)).toBe(true);
  });
});