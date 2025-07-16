const fs = require('fs');
const path = require('path');

describe('Frontend Setup', () => {
  test('package.json should exist', () => {
    const packagePath = path.join(__dirname, 'package.json');
    expect(fs.existsSync(packagePath)).toBe(true);
  });

  test('package.json should contain React and TypeScript dependencies', () => {
    const packagePath = path.join(__dirname, 'package.json');
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    expect(packageContent.dependencies.react).toBeDefined();
    expect(packageContent.dependencies['react-dom']).toBeDefined();
    expect(packageContent.devDependencies.typescript).toBeDefined();
    expect(packageContent.devDependencies['@types/react']).toBeDefined();
  });

  test('src directory should exist', () => {
    const srcPath = path.join(__dirname, 'src');
    expect(fs.existsSync(srcPath)).toBe(true);
  });

  test('Dockerfile should exist', () => {
    const dockerfilePath = path.join(__dirname, 'Dockerfile');
    expect(fs.existsSync(dockerfilePath)).toBe(true);
  });

  test('main app component should exist', () => {
    const appPath = path.join(__dirname, 'src', 'App.tsx');
    expect(fs.existsSync(appPath)).toBe(true);
  });
});
