import Web3 from 'web3';

let web3;
let initializing = false; // Flag to indicate whether initialization is in progress
let initPromise; // Promise to handle concurrent initialization requests

const initWeb3 = async () => {
  if (web3) {
    return web3; // Return immediately if already initialized
  }

  if (!initializing) {
    initializing = true;
    initPromise = (async () => {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        // We are in the browser and MetaMask is running.
        try {
          // Request account access if needed
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log('MetaMask is enabled.');
          web3 = new Web3(window.ethereum);
        } catch (error) {
          console.error('User denied account access:', error);
        }
      } else {
        // We are on the server OR the user is not running MetaMask.
        const provider = new Web3.providers.HttpProvider(
          'https://sepolia.infura.io/v3/996fde9b347e42c0a1a53371ba5213bb'
        );
        web3 = new Web3(provider);
      }
      return web3;
    })();
  }
  return initPromise;
};

export default initWeb3;
