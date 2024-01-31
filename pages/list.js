import React, { Component } from 'react';
import { Card, Input, Form } from 'semantic-ui-react';
import { Link } from '../routes';
import Layout from '../components/Layout';
import record from '../ethereum/record';
import web3 from '../ethereum/web3';
import { Router } from '../routes';

class RecordsList extends Component {
  state = {
    search: '',
  };

  static async getInitialProps() {
    // Fetch initial records here and return them as props
    try {
      const allRecords = await record.methods.getPatients().call();
      return { allRecords };
    } catch (error) {
      console.error('Error fetching records:', error);
      return { allRecords: [] }; // Return an empty array or handle the error gracefully
    }
  }

  renderRecords() {
    // Map the addresses to Card items with links to view records
    const items = this.props.allRecords.map((address) => {
      return {
        header: address,
        description: (
          <Link route={`/record/${address}`}>
            <a>View Record</a>
          </Link>
        ),
        fluid: true,
      };
    });

    // Render the Card.Group with items
    return <Card.Group items={items} />;
  }

  onSearch = async (event) => {
    event.preventDefault(); // Prevent the browser from submitting the form

    // Redirect to the record with the specified address
    Router.pushRoute(`/record/${this.state.search}`);
  };

  render() {
    return (
      <Layout>
        <div>
          <Form onSubmit={this.onSearch}>
            <Form.Field>
              <Input
                fluid
                action={{ icon: 'search' }}
                placeholder='Search...'
                onChange={(event) => this.setState({ search: event.target.value })}
              />
              <br />
            </Form.Field>
          </Form>
          <h2>Medical Records List</h2>
          {this.renderRecords()}
        </div>
      </Layout>
    );
  }
}

export default RecordsList;
