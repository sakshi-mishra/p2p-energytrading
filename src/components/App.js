import React, { Component } from "react";
import Web3 from "web3";
import EnergyMarketplace from "../abis/EnergyMarketplace.json";
import EnergyBlocks from "../abis/EnergyBlocks.json";
import Navbar from "./Navbar";
import Main from "./Main";

const energyblockSmartContractAddress =
  "0x86f2259e538b379b2d60fd1244fe8b2ba4a85304";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    // window.web3: Metamask
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. Install MetaMask and try again!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    const deployer = accounts[0];
    this.setState({ account: accounts[0] });

    // Will get network's id, rather than hard code the ID.
    const networkId = await web3.eth.net.getId();
    const networkData = EnergyMarketplace.networks[networkId];
    console.log("netData.address:", networkData.address);

    if (networkData) {
      // address: Contract address
      const energyblocks = web3.eth.Contract(
        EnergyBlocks.abi,
        networkData.address
      );
      this.setState({ energyblocks });
      this.setState({ loading: false });

      const marketplace = web3.eth.Contract(
        EnergyMarketplace.abi,
        networkData.address
      );
      console.log("marketplace:", marketplace);
      this.setState({ marketplace });
      const energyBlocksCount = await energyblocks.methods
        .allEnergyBlocksLength()
        .call();
      console.log("energyBlocksCount:", energyBlocksCount);
      this.setState({ energyBlocksCount });
      // Load products, i: index#
      for (let i = 1; i <= energyBlocksCount; i++) {
        const energyBlock = await energyblocks.methods
          .getEnergyBlockByIndex(i)
          .call();
        this.setState({
          energyBlocks: [...this.state.energyBlocks, energyBlock],
        });
      }
    } else {
      window.alert(
        "Make sure EnergyMarketplace contract is deployed to network."
      );
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      energyBlocksCount: 0,
      energyBlocks: [],
      loading: true,
    };
    this.addEnergyBlock = this.addEnergyBlock.bind(this);
    this.orderEnergyBlock = this.orderEnergyBlock.bind(this);
  }

  async addEnergyBlock(energyBlockName, price) {
    this.setState({ loading: true });
    console.log("state.marketplace:", this.state.marketplace);
    await this.state.energyblocks.methods.addEnergyBlock(
      this.state.account,
      energyBlockName,
      price
    );
    console.log(
      "eBlkIds:",
      await this.state.energyblocks.methods.getAllEnergyBlockIds.call()
    );
    this.setState({ loading: false });
    console.log(
      "energyBlocksCount:",
      await this.state.energyblocks.methods.allEnergyBlocksLength().call()
    );
  }
  /*
      .once("EnergyBlockAdded", (err, event) => {
        console.log(event);
        this.setState({ loading: false });
      });
  }
  */

  async orderEnergyBlock(id, price) {
    await this.setState({ loading: true });
    await this.state.marketplace.methods
      .orderEnergyBlock(id)
      .send({ from: this.state.account, value: price })
      // .then(this.setState({ loading: false }));
      .once("Escrow", (err, event) => {
        console.log(event);
        this.setState({ loading: false });
      });
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <div className="col-lg-12 d-flex">
              {this.state.loading ? (
                <div id="loader">
                  <div className="text-center">
                    <p>Loading...</p>
                  </div>
                  <p>
                    When open this page at the first time => Please choose
                    `Kovan` or your own custom RPC (if using Ganache) in{" "}
                    <a
                      href="https://metamask.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Metamask
                    </a>{" "}
                    networks.
                  </p>
                  <p>
                    When the transaction done => Please re-flesh this page once
                    Metamask informs transaction confirmed.
                  </p>
                  <p>
                    If you don't have any Ether => You can get Ether (Kovan) by
                    free at{" "}
                    <a
                      href="https://faucet.kovan.network/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Kovan faucet
                    </a>
                    .
                  </p>
                </div>
              ) : (
                <Main
                  energyBlocks={this.state.energyBlocks}
                  addEnergyBlock={this.addEnergyBlock}
                  orderEnergyBlock={this.orderEnergyBlock}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
