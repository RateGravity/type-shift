const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;
const semver = require('semver');

const OUT_DIR = './lib';

const tagPrefix = 'refs/tags/v';
const trigger = process.env.GITHUB_REF || '';
const versionInfo = semver.parse(trigger.replace(tagPrefix, '')) || {};
const prereleaseTags = versionInfo.prerelease ? versionInfo.prerelease.join('-') : '';
const deployTag = versionInfo.version || '0.0.1-test';

/**
 * Produce the package.json for the types package.
 */
const preparePackageJson = () => {
  // Update the package.json file to reflect the final library folder structure
  const packageJson = JSON.parse(fs.readFileSync('package.json'));

  packageJson.version = deployTag;
  packageJson.main = './index.js';
  packageJson.module = './index.mjs';
  packageJson.types = './index.d.ts';

  const targetPath = path.join(OUT_DIR, 'package.json');
  console.log(`Writing types package.json at "${targetPath}"`);
  fs.writeFileSync(targetPath, JSON.stringify(packageJson));
};

const COPIED_ARTIFACTS = ['README.md', 'LICENSE'];

/**
 * Copy any additional artifacts to the ouput directory
 */
const prepareArtifacts = () => {
  for (const artifact of COPIED_ARTIFACTS) {
    const sourcePath = artifact;
    const targetPath = path.join(OUT_DIR, artifact);
    console.log(`Writing "${artifact}" at "${targetPath}"`);
    fs.copyFileSync(sourcePath, targetPath);
  }
};

/**
 * Publish the package to npm
 */
const publishPackage = () => {
  console.log('Performing npm publication of package.');
  // Write the npmrc file containing our auth token.
  fs.writeFileSync(
    path.join(__dirname, '..', '.npmrc'),
    `//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}`
  );
  const args = prereleaseTags ? ` --tag "${prereleaseTags}"` : [];
  exec(
    `npm publish ${OUT_DIR}${args}`,
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        npm_config_registry: 'https://registry.npmjs.org/' // override yarn's environment settings
      }
    },
    (err, stdout, stderr) => {
      console.log(stdout);
      console.error(stderr);
    }
  );
};

(() => {
  preparePackageJson();
  prepareArtifacts();
  publishPackage();
})();
