const fs = require('fs');
const path = require('path');

describe('Notion Recorder Service Setup', () => {
  test('package.json should exist', () => {
    const packagePath = path.join(__dirname, 'package.json');
    expect(fs.existsSync(packagePath)).toBe(true);
  });

  test('package.json should contain Notion SDK and TypeScript dependencies', () => {
    const packagePath = path.join(__dirname, 'package.json');
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    expect(packageContent.dependencies['@notionhq/client']).toBeDefined();
    expect(packageContent.dependencies.redis).toBeDefined();
    expect(packageContent.dependencies.bull).toBeDefined();
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

  test('notion service should exist', () => {
    const servicePath = path.join(__dirname, 'src', 'services', 'notionService.ts');
    expect(fs.existsSync(servicePath)).toBe(true);
  });

  test('game recorder should exist', () => {
    const recorderPath = path.join(__dirname, 'src', 'recorders', 'gameRecorder.ts');
    expect(fs.existsSync(recorderPath)).toBe(true);
  });
});
