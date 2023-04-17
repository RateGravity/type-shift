const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;

const OUT_DIR = './lib';

/**
 * Produce the package.json for the types package.
 */
const preparePackageJson = () => {
  // Set version to the tag number
  exec('git describe --tags HEAD | xargs yarn version --no-git-tag-version --new-version');

  // Update the package.json file to reflect the final library folder structure
  const packageJson = JSON.parse(fs.readFileSync('package.json'));

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
  exec(
    `npm publish`,
    {
      cwd: OUT_DIR,
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

preparePackageJson();
prepareArtifacts();
publishPackage();
