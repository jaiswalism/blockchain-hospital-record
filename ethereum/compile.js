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
const input = {
    language: 'Solidity',
    sources: {
        'Record.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

let output;
try {
    output = JSON.parse(solc.compile(JSON.stringify(input))).contracts['Record.sol'];
} catch (e) {
    console.error('Error compiling contract:', e);
    process.exit(1);
}

fs.ensureDirSync(buildPath); // recreate build folder

for (let contractName in output) {
    fs.outputJsonSync(
        path.resolve(buildPath, contractName + '.json'),
        output[contractName]
    );
}
