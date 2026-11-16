const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
console.log('Deleting build folder...');
fs.removeSync(buildPath);

console.log('Getting contract by path...');
const contractPath = path.resolve(__dirname, 'contracts', 'Record.sol');
const source = fs.readFileSync(contractPath, 'utf8');

console.log('Compiling contract...');
const compiled = solc.compile(source, 1);

if (compiled.errors) {
    compiled.errors.forEach(err => console.log(err));
}

fs.ensureDirSync(buildPath); // recreate build folder

for (let contract in compiled.contracts) {
    const contractName = contract.replace(':', '');
    fs.outputJsonSync(
        path.resolve(buildPath, contractName + '.json'),
        compiled.contracts[contract]
    );
    console.log(`Saved compiled artifact: ${contractName}.json`);
}

console.log('Contract compiled successfully!');
