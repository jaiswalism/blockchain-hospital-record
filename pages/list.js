import React, { Component } from 'react';
import { Input, Form, Message, Loader } from 'semantic-ui-react';
import { Link, Router } from '../routes';
import Layout from '../components/Layout';
import record from '../ethereum/record';
import web3 from '../ethereum/web3';

class RecordsList extends Component {
  state = {
    search: '',
    allRecords: [],
    loading: true,
    account: '',
    searchError: '',
  };

  async componentDidMount() {
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts && accounts[0]) {
        this.setState({ account: accounts[0] });
      }

      // Fetch registered patient addresses from the contract
      const patientList = await record.methods.getPatients().call();
      this.setState({ allRecords: patientList || [], loading: false });
    } catch (error) {
      console.error('Error fetching records:', error);
      this.setState({ loading: false });
    }
  }

  onSearch = async (event) => {
    event.preventDefault();
    const query = this.state.search.trim();

    if (!query) {
      this.setState({ searchError: 'Please enter a valid Ethereum address.' });
      return;
    }

    if (!web3.utils.isAddress(query)) {
      this.setState({ searchError: 'Invalid Ethereum address format (must start with 0x).' });
      return;
    }

    Router.pushRoute(`/record/${query}`);
  };

  renderRecords() {
    const { allRecords, account } = this.state;

    if (allRecords.length === 0) {
      return (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            color: '#94A3B8',
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#FFFFFF' }}>
            No Patient Records Registered Yet
          </div>
          <div>Be the first patient to create an immutable on-chain health record.</div>
          <Link route="/register-patient">
            <a className="web3-btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
              Register as Patient
            </a>
          </Link>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {allRecords.map((address, idx) => {
          const isMyRecord = account && account.toLowerCase() === address.toLowerCase();

          return (
            <div
              key={idx}
              className="web3-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      color: '#64748B',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    Index #{idx + 1}
                  </span>
                  {isMyRecord && (
                    <span
                      style={{
                        background: 'rgba(255, 77, 45, 0.15)',
                        border: '1px solid rgba(255, 77, 45, 0.4)',
                        color: '#FF7354',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      ★ YOUR RECORD
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.925rem',
                    color: '#FFFFFF',
                    wordBreak: 'break-all',
                    marginBottom: '1rem',
                  }}
                >
                  {address}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Consent-Gated</span>
                <Link route={`/record/${address}`}>
                  <a
                    className="web3-btn-secondary"
                    style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                  >
                    View Record ➔
                  </a>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { loading, searchError, allRecords } = this.state;

    return (
      <Layout>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="web3-badge">
              <span className="dot" />
              <span>Decentralized Directory</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Patient Records Directory
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem' }}>
              Search patient medical records by Ethereum wallet address. Data access is strictly protected by smart contract consent rules.
            </p>
          </div>

          {/* Search Form */}
          <div className="web3-card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
            <Form onSubmit={this.onSearch} error={!!searchError}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <Input
                    fluid
                    placeholder="Search patient by Ethereum wallet address (0x...)"
                    value={this.state.search}
                    onChange={(event) => this.setState({ search: event.target.value, searchError: '' })}
                  />
                </div>
                <button type="submit" className="web3-btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                  SEARCH RECORD
                </button>
              </div>
              {searchError && (
                <Message error content={searchError} style={{ marginTop: '1rem' }} />
              )}
            </Form>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
              Registered Patient Accounts ({allRecords.length})
            </h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <Loader active inline="centered" inverted content="Querying Ethereum Sepolia..." />
            </div>
          ) : (
            this.renderRecords()
          )}
        </div>
      </Layout>
    );
  }
}

export default RecordsList;
