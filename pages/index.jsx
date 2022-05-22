import abi from '../utils/BuyMeACoffee.json';
import { ethers } from "ethers";
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css'

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x9A1aaCDC1F658d7ACd80c75e301F1177fb6Dc61B";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: 'eth_accounts' })
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const buyCoffee = async (amount) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..")
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther(amount) }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };


  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp),
          message,
          name
        }
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    }
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Buy me a Coffee!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div class="p-8">
          <h1><span></span><span>Buy me a Coffee!</span></h1>


        </div>

        {currentAccount ? (

          // <form>

          <div class="gap-8 columns-2">


            <div class="">
              <label>
                Your Name:
              </label>
              <br />
              <input
                id="name"
                type="text"
                placeholder="Guest"
                onChange={onNameChange}
                required
              />
            </div>
            <br />
            <div>
              <label>
                Send a message:
              </label>
              <br />

              <textarea
                rows={3}
                placeholder="Enjoy your coffee!"
                id="message"
                onChange={onMessageChange}
                required
              >
              </textarea>

            </div>

            <div class="flex flex-col space-y-2">

              <div class="flex transition duration-700 ease-in-out max-w-sm my-0 mx-auto p-2 rounded-lg border-2 bg-gray-100 hover:bg-yellow-500 transform hover:-translate-y-1 hover:-rotate-3 shadow-2xl">
                <button type="button"
                  onClick={() => buyCoffee("0.001")}
                >
                  Send Small Coffee (0.001ETH)
                </button>
              </div>

              <div class="flex transition duration-700 ease-in-out max-w-sm my-0 mx-auto p-2 rounded-lg border-2 bg-gray-100 hover:bg-yellow-500 transform hover:-translate-y-1 hover:-rotate-3 shadow-2xl">
                <button type="button"
                  onClick={() => buyCoffee("0.003")}
                >
                  Send Medium Coffee (0.003ETH)
                </button>
              </div>

              <div class="flex transition duration-700 ease-in-out max-w-sm my-0 mx-auto p-2 rounded-lg border-2 bg-gray-100 hover:bg-yellow-500 transform hover:-translate-y-1 hover:-rotate-3 shadow-2xl">
                <button type="button"
                  onClick={() => buyCoffee("0.005")}
                >
                  Send Large Coffee (0.005ETH)
                </button>
              </div>

            </div>

          </div>

          // </form>

        ) : (
          <React.Fragment>
            <div class="p-2">
              <h3>
                (running on Goerli)
              </h3>
            </div>
            <div class="flex">
              <svg class="animate-bounce w-6 h-6 text-gray-900" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
            <div class="flex transition duration-700 ease-in-out max-w-sm my-0 mx-auto p-6 rounded-lg border-2 bg-gray-100 hover:bg-yellow-500 transform hover:-translate-y-1 hover:-rotate-3 shadow-2xl">
              <button onClick={connectWallet}> Connect your wallet </button>
            </div>
          </React.Fragment>
        )
        }
      </main >

      {currentAccount && (<h1>Coffees received</h1>)}

      {
        currentAccount && (memos.map((memo, idx) => {
          return (
            <div key={idx} style={{ border: "2px solid", "borderRadius": "5px", padding: "5px", margin: "5px" }}>
              <p style={{ "fontWeight": "bold" }}>"{memo.message}"</p>
              <p>From: {memo.name} </p>
              <p>Date: {new Date(memo.timestamp * 1000).toLocaleDateString()} {new Date(memo.timestamp * 1000).toLocaleTimeString()}</p>

            </div>
          )
        }))
      }

      <footer className={styles.footer}>
        <a
          href="https://alchemy.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by GdG for Alchemy's Road to Web3!
        </a>
      </footer>
    </div >

  )
}
