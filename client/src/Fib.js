import React, { Component } from "react";
import axios from "axios";

class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {},
        index: "",
    };

    componentDidMount() {
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues() {
        const request = await axios.get("/api/values/current");
        this.setState({ values: request.data });
    }

    async fetchIndexes() {
        const request = await axios.get("/api/values/all");
        this.setState({ seenIndexes: request.data });
    }

    renderSeenIndexes() {
        return this.state.seenIndexes.map(({ number }) => number).join(", ");
    }

    renderValues() {
        const entries = [];
        for (let key in this.state.values) {
            entries.push(
                <div key={key}>
                    Index: {key}, Value: {this.state.values[key]}
                </div>
            );
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        axios.post("/api/values", {
            index: this.state.index,
        });
        this.setState({ index: "" });
    };

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter index</label>
                    <input
                        value={this.state.index}
                        onChange={(event) =>
                            this.setState({ index: event.target.value })
                        }
                    />
                    <button>Submit</button>
                </form>
                <h3>Index History</h3>
                {this.renderSeenIndexes()}
                <h3>Calculated Values</h3>
                {this.renderValues()}
            </div>
        );
    }
}

export default Fib;
