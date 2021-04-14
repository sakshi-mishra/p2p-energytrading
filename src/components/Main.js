import React, { Component } from "react";

class Main extends Component {
  render() {
    return (
      <div id="content">
        <h2>Add EnergyBlock</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            // value: Due to form field
            const name = this.energyBlockName.value;
            const price = window.web3.utils.toWei(
              this.energyBlockPrice.value.toString(),
              "Ether"
            );
            this.props.addEnergyBlock(name, price);
          }}
        >
          <div className="form-group mr-sm-2">
            <input
              id="productName"
              type="text"
              ref={(input) => {
                this.energyBlockName = input;
              }}
              className="form-control"
              placeholder="EnergyBlock Name (Energy source ID)"
              required
            />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="energyBlockPrice"
              type="text"
              ref={(input) => {
                this.energyBlockPrice = input;
              }}
              className="form-control"
              placeholder="EnergyBlock Price"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Add EnergyBlock
          </button>
        </form>
        <p>&nbsp;</p>
        <h2>Purchase EnergyBlock</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Price</th>
              <th scope="col">Owner</th>
              <th scope="col" />
            </tr>
          </thead>
          <tbody id="energyBlocksList">
            {this.props.energyBlocks.map((energyBlock, key) => {
              return (
                <tr key={key}>
                  <th scope="row">{energyBlock.id.toString()}</th>
                  <td>{energyBlock.name}</td>
                  <td>
                    {window.web3.utils.fromWei(
                      energyBlock.price.toString(),
                      "Ether"
                    )}{" "}
                    Eth
                  </td>
                  <td>{energyBlock.owner}</td>
                  <td>
                    {!energyBlock.purchased ? (
                      <button
                        name={energyBlock.id}
                        value={energyBlock.price}
                        onClick={(event) => {
                          this.props.orderEnergyBlock(
                            event.target.name,
                            event.target.value
                          );
                        }}
                      >
                        Buy
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Main;
