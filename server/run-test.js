import { spawn } from 'child_process';
import http from 'http';

function waitForServer(url, timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http
        .get(url, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            retry();
          }
        })
        .on('error', () => {
          retry();
        });
    };

    const retry = () => {
      if (Date.now() - start > timeout) {
        reject(new Error('Server did not start within timeout'));
      } else {
        setTimeout(check, 800);
      }
    };

    check();
  });
}

async function main() {
  console.log('[Runner] Spawning server process...');
  const serverProcess = spawn('node', ['src/server.js'], {
    stdio: 'inherit',
    shell: true,
  });

  try {
    console.log('[Runner] Waiting for server on http://localhost:5000/api/health ...');
    await waitForServer('http://localhost:5000/api/health');
    console.log('[Runner] Server is ready! Running API test suite...\n');

    const testProcess = spawn('node', ['test-api.js'], {
      stdio: 'inherit',
      shell: true,
    });

    testProcess.on('exit', (code) => {
      console.log(`\n[Runner] Test suite exited with code: ${code}`);
      serverProcess.kill('SIGINT');
      process.exit(code);
    });
  } catch (err) {
    console.error('[Runner] Error:', err.message);
    serverProcess.kill('SIGINT');
    process.exit(1);
  }
}

main();
