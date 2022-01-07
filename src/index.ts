import * as core from '@actions/core';
import {exec as execSync} from 'child_process';
import {promisify} from 'util';
import clone from 'git-clone/promise';

const exec = promisify(execSync);

async function run(): Promise<void> {
  try {
    const pat = core.getInput('pat');

    core.info('Frontend repository clone STARTED');

    await clone(
      `https://${pat}@github.com/thingsup/thingsup-tracking-frontend.git`,
      './tmp/frontend'
    );

    core.info('Frontend repository clone DONE');

    core.info('Executing npm build script in frontend repo');
    {
      const {stderr} = await exec(
        'cd ./tmp/frontend && npm install && npm run build'
      );

      if (stderr) {
        core.error('Executing npm build script in frontend repo FAILED');
        core.setFailed(stderr);
      }
    }
    core.info('Executing npm build script in frontend repo DONE');

    core.info('Backend repository clone STARTED');

    await clone(
      `https://${pat}@github.com/thingsup/ColdChainServer.git`,
      './tmp/backend'
    );

    core.info('Backend repository clone DONE');

    core.info('Copy frontend build folder to backend STARTED');
    {
      const {stderr} = await exec(
        'cp -frp ./tmp/frontend/dist -T ./tmp/backend/build'
      );

      if (stderr) {
        core.error('Copy frontend build folder to backend FAILED');
        core.setFailed(stderr);
      }
    }
    core.info('Copy frontend build folder to backend DONE');

    core.info('Install pkg library STARTED');
    {
      const {stderr} = await exec('npm i pkg -g');

      if (stderr) {
        core.error('Install pkg library FAILED');
        core.setFailed(stderr);
      }
    }
    core.info('Install pkg library DONE');

    core.info('bundle code STARTED');
    const version = '0.0.1';
    const distFolderName = `dist_${version}`;
    {
      const {stderr} = await exec(
        `cd ./tmp/backend && pkg --compress GZip --out-path ./${distFolderName} .`
      );

      if (stderr) {
        core.error('bundle code FAILED');
        core.setFailed(stderr);
      }
    }
    core.info('bundle code DONE');
    core.setOutput('distPath', `./tmp/backend/${distFolderName}`);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
