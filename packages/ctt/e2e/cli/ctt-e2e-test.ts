import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

describe('CLI E2E Tests', () => {
  const cliBinPath = path.join(__dirname, '..', '..', 'build', 'bin', 'ctt.js');

  const cleanupTmpDir = (tmpDir: string): void => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { force: true, recursive: true });
    }
  };

  it('should generate a CTP project and build successfully', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ctt-e2e-'));

    try {
      execSync(
        `node ${cliBinPath} --template ctp --package-json-name @test/e2e-ctp -v e2e-ctp --useLocalCtt`,
        {
          cwd: tmpDir,
          encoding: 'utf-8',
          env: { ...process.env },
          stdio: 'pipe',
        },
      );

      expect(fs.existsSync(path.join(tmpDir, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, '.projenrc.ts'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, 'tsconfig.json'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, 'bin', 'e2e-ctp.ts'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, 'src', 'cli', 'e2e-ctp.ts'))).toBe(
        true,
      );

      const projenrcContent = fs.readFileSync(
        path.join(tmpDir, '.projenrc.ts'),
        'utf-8',
      );
      expect(projenrcContent).toContain('CalmsTypescriptPackage');
      expect(projenrcContent).toContain('@test/e2e-ctp');
      expect(projenrcContent).toContain('e2e-ctp');
      expect(projenrcContent).toContain("devDeps: ['@hbict/ctt']");

      const buildOutput = execSync('pnpm run build', {
        cwd: tmpDir,
        encoding: 'utf-8',
        env: { ...process.env },
      });

      expect(buildOutput).toBeTruthy();
      expect(fs.existsSync(path.join(tmpDir, 'build'))).toBe(true);
    } finally {
      cleanupTmpDir(tmpDir);
    }
  }, 120000);

  it('should generate a CTA project and build successfully', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ctt-e2e-'));

    try {
      execSync(
        `node ${cliBinPath} --template cta --package-json-name @test/e2e-cta -v e2e-cta --useLocalCtt`,
        {
          cwd: tmpDir,
          encoding: 'utf-8',
          env: { ...process.env },
          stdio: 'pipe',
        },
      );

      expect(fs.existsSync(path.join(tmpDir, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, '.projenrc.ts'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, 'tsconfig.json'))).toBe(true);

      const projenrcContent = fs.readFileSync(
        path.join(tmpDir, '.projenrc.ts'),
        'utf-8',
      );
      expect(projenrcContent).toContain('CalmsTypescriptApp');
      expect(projenrcContent).toContain('@test/e2e-cta');
      expect(projenrcContent).toContain("devDeps: ['@hbict/ctt']");

      const buildOutput = execSync('pnpm run build', {
        cwd: tmpDir,
        encoding: 'utf-8',
        env: { ...process.env },
      });

      expect(buildOutput).toBeTruthy();
      expect(fs.existsSync(path.join(tmpDir, 'build'))).toBe(true);
    } finally {
      cleanupTmpDir(tmpDir);
    }
  }, 120000);

  it('should generate a CTC project and build successfully', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ctt-e2e-'));

    try {
      execSync(
        `node ${cliBinPath} --template ctc --package-json-name @test/e2e-ctc -v e2e-ctc --useLocalCtt`,
        {
          cwd: tmpDir,
          encoding: 'utf-8',
          env: { ...process.env },
          stdio: 'pipe',
        },
      );

      expect(fs.existsSync(path.join(tmpDir, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, '.projenrc.ts'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, 'cdk.json'))).toBe(true);

      const projenrcContent = fs.readFileSync(
        path.join(tmpDir, '.projenrc.ts'),
        'utf-8',
      );
      expect(projenrcContent).toContain('CalmsTypescriptCdk');
      expect(projenrcContent).toContain('@test/e2e-ctc');
      expect(projenrcContent).toContain("devDeps: ['@hbict/ctt']");
    } finally {
      cleanupTmpDir(tmpDir);
    }
  }, 120000);
});
