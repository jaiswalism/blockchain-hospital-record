require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const Web3 = require('web3');
const compiledRecord = require('./build/Record.json');
const fs = require('fs');
const path = require('path');

// RPC Provider - default to reliable public Sepolia RPC if not configured
let rpcUrl = process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL;
if (!rpcUrl || rpcUrl.includes('YOUR_INFURA_PROJECT_ID')) {
    rpcUrl = 'https://ethereum-sepolia-rpc.publicnode.com';
}

const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
const mnemonic = process.env.DEPLOYER_MNEMONIC;

const deploy = async () => {
    let provider;
    let web3;
    let deployerAddress;

    console.log(`\n========================================`);
    console.log(`🚀 MediBlock Real Network Deployment`);
    console.log(`Network RPC: ${rpcUrl}`);
    console.log(`========================================\n`);

    if (
        privateKey &&
        !privateKey.includes('placeholder') &&
        !privateKey.includes('your_private_key_here') &&
        privateKey.trim().length >= 64
    ) {
        // Option 1: Direct Private Key deployment (Safest & most reliable)
        web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
        const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
        const account = web3.eth.accounts.privateKeyToAccount(formattedKey);
        web3.eth.accounts.wallet.add(account);
        web3.eth.defaultAccount = account.address;
        deployerAddress = account.address;
        console.log(`✔ Using Deployer Private Key for address: ${deployerAddress}`);
    } else if (mnemonic && !mnemonic.includes('placeholder')) {
        // Option 2: Mnemonic via HDWalletProvider
        try {
            const HDWalletProvider = require('truffle-hdwallet-provider');
            provider = new HDWalletProvider(mnemonic, rpcUrl);
            web3 = new Web3(provider);
            const accounts = await web3.eth.getAccounts();
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts could be derived from DEPLOYER_MNEMONIC.');
            }
            deployerAddress = accounts[0];
            console.log(`✔ Using Mnemonic for address: ${deployerAddress}`);
        } catch (e) {
            console.error('HDWalletProvider initialization failed:', e.message);
            process.exit(1);
        }
    } else {
        console.error(`\x1b[31m✖ Error: Missing deployer credentials in .env!\x1b[0m\n`);
        console.log(`Please open your \x1b[33m.env\x1b[0m file and add your deployer credentials:\n`);
        console.log(`  \x1b[32mDEPLOYER_PRIVATE_KEY=your_metamask_private_key_here\x1b[0m`);
        console.log(`  \x1b[90m(MetaMask -> Account Details -> Show Private Key)\x1b[0m\n`);
        console.log(`Alternatively, you can provide:`);
        console.log(`  \x1b[32mDEPLOYER_MNEMONIC="twelve word secret recovery seed phrase"\x1b[0m\n`);
        process.exit(1);
    }

    try {
        // Check account balance
        const balanceWei = await web3.eth.getBalance(deployerAddress);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        console.log(`Deployer Balance: \x1b[33m${balanceEth} ETH\x1b[0m`);

        if (parseFloat(balanceEth) < 0.005) {
            console.error(`\n\x1b[31m✖ Insufficient balance for deployment!\x1b[0m`);
            console.error(`You have ${balanceEth} ETH, but deploying Record.sol requires ~0.01 Sepolia ETH for gas.`);
            console.log(`\n👉 Get free Sepolia testnet ETH from:`);
            console.log(`   - https://sepoliafaucet.com/`);
            console.log(`   - https://cloud.google.com/application/web3/faucet/ethereum/sepolia`);
            console.log(`   - https://faucets.chain.link/sepolia\n`);
            process.exit(1);
        }

        console.log(`\nSubmitting deployment transaction to network (gas limit: 4,500,000)...`);

        const contractInstance = new web3.eth.Contract(JSON.parse(compiledRecord.interface));
        const deployTx = contractInstance.deploy({
            data: compiledRecord.bytecode,
        });

        const deployedContract = await deployTx.send({
            from: deployerAddress,
            gas: '4500000',
        });

        const deployedAddress = deployedContract.options.address;

        console.log(`\n\x1b[32m✔ Smart contract successfully deployed!\x1b[0m`);
        console.log(`\x1b[36mContract Address:\x1b[0m ${deployedAddress}`);
        console.log(`\x1b[34mEtherscan:\x1b[0m https://sepolia.etherscan.io/address/${deployedAddress}\n`);

        // Automatically update .env file
        const envPath = path.resolve(__dirname, '../.env');
        if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            if (envContent.includes('NEXT_PUBLIC_CONTRACT_ADDRESS=')) {
                envContent = envContent.replace(
                    /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
                    `NEXT_PUBLIC_CONTRACT_ADDRESS=${deployedAddress}`
                );
            } else {
                envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${deployedAddress}\n`;
            }
            fs.writeFileSync(envPath, envContent);
            console.log(`✔ Automatically updated NEXT_PUBLIC_CONTRACT_ADDRESS in .env`);
        }

        console.log(`\nAll set! Restart your app with: \x1b[32mnpm run dev\x1b[0m\n`);

    } catch (err) {
        console.error(`\n\x1b[31mDeployment failed:\x1b[0m`, err.message || err);
    } finally {
        if (provider && provider.engine) {
            provider.engine.stop();
        }
    }
};

deploy();
