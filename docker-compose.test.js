const fs = require('fs');
const path = require('path');

describe('Docker Compose Configuration', () => {
  test('docker-compose.yml should exist', () => {
    const dockerComposePath = path.join(__dirname, 'docker-compose.yml');
    expect(fs.existsSync(dockerComposePath)).toBe(true);
  });

  test('docker-compose.yml should contain required services', () => {
    const dockerComposePath = path.join(__dirname, 'docker-compose.yml');
    const dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf8');

    expect(dockerComposeContent).toContain('frontend');
    expect(dockerComposeContent).toContain('api');
    expect(dockerComposeContent).toContain('websocket');
    expect(dockerComposeContent).toContain('notion-recorder');
    expect(dockerComposeContent).toContain('redis');
  });

  test('project directories should exist', () => {
    const requiredDirs = ['frontend', 'api', 'websocket', 'notion-recorder'];

    requiredDirs.forEach((dir) => {
      const dirPath = path.join(__dirname, dir);
      expect(fs.existsSync(dirPath)).toBe(true);
    });
  });
});
