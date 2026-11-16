import React, { Component } from 'react';
import { Input, Form, Message, Loader } from 'semantic-ui-react';
import Layout from '../components/Layout';
import record from '../ethereum/record';
import web3 from '../ethereum/web3';
import { Link } from '../routes';

class RevokeDoctor extends Component {
  state = {
    doctorAddr: '',
    loading: false,
    errorMessage: '',
    successMessage: '',
    grantedDoctors: [],
    loadingDoctors: true,
    account: '',
  };

  async componentDidMount() {
    await this.loadGrantedDoctors();
  }

  loadGrantedDoctors = async () => {
    try {
      this.setState({ loadingDoctors: true });
      const accounts = await web3.eth.getAccounts();
      if (!accounts || !accounts[0]) {
        this.setState({ loadingDoctors: false });
        return;
      }
      this.setState({ account: accounts[0] });

      const rawDocs = await record.methods.getDoctors().call();
      const docs = rawDocs || [];
      const granted = [];

      for (let i = 0; i < docs.length; i++) {
        const addr = docs[i];
        const isApp = await record.methods.isApproved(accounts[0], addr).call();
        if (isApp) {
          try {
            const doc = await record.methods.searchDoctor(addr).call();
            granted.push({
              address: addr,
              name: doc[1],
              major: doc[6],
            });
          } catch (e) {
            granted.push({ address: addr, name: 'Doctor', major: 'General' });
          }
        }
      }

      this.setState({ grantedDoctors: granted, loadingDoctors: false });
    } catch (e) {
      console.warn('Error loading granted doctors:', e);
      this.setState({ loadingDoctors: false });
    }
  };

  revokeAccess = async (addrToRevoke) => {
    const target = addrToRevoke || this.state.doctorAddr.trim();

    if (!target) {
      this.setState({ errorMessage: 'Please specify a doctor address to revoke.' });
      return;
    }

    if (!web3.utils.isAddress(target)) {
      this.setState({ errorMessage: 'Invalid Ethereum address format.' });
      return;
    }

    this.setState({ loading: true, errorMessage: '', successMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts || !accounts[0]) {
        throw new Error('Please connect your MetaMask wallet.');
      }

      await record.methods.RevokePermission(target).send({ from: accounts[0] });

      this.setState({
        successMessage: `Cryptographic consent has been revoked for ${target}. The doctor can no longer read your record.`,
        doctorAddr: '',
      });

      await this.loadGrantedDoctors();
    } catch (err) {
      let friendly = err.message;
      if (err.message && err.message.includes('User denied')) {
        friendly = 'Transaction signature was rejected in MetaMask.';
      }
      this.setState({ errorMessage: friendly });
    } finally {
      this.setState({ loading: false });
    }
  };

  onSubmit = (event) => {
    event.preventDefault();
    this.revokeAccess(this.state.doctorAddr);
  };

  render() {
    const { doctorAddr, loading, errorMessage, successMessage, grantedDoctors, loadingDoctors } = this.state;

    return (
      <Layout>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="web3-badge">
              <span className="dot" />
              <span>Cryptographic Consent Control</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Revoke Doctor Permission
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem' }}>
              Revoke data access from a physician. Once revoked, smart contract access controls will immediately block the practitioner from viewing your medical record.
            </p>
          </div>

          {/* Revoke Form */}
          <div className="web3-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '1rem' }}>
              Revoke Access by Address
            </h3>
            <Form onSubmit={this.onSubmit} error={!!errorMessage} success={!!successMessage}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <Input
                    fluid
                    placeholder="Doctor Ethereum Address to Revoke (0x...)"
                    value={doctorAddr}
                    onChange={(event) => this.setState({ doctorAddr: event.target.value, errorMessage: '' })}
                  />
                </div>
                <button
                  type="submit"
                  className="web3-btn-primary"
                  style={{
                    padding: '0.75rem 1.75rem',
                    background: '#EF4444',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
                  }}
                  disabled={loading}
                >
                  {loading ? 'Revoking...' : 'REVOKE ACCESS'}
                </button>
              </div>

              {errorMessage && <Message error content={errorMessage} style={{ marginTop: '1rem' }} />}
              {successMessage && <Message success content={successMessage} style={{ marginTop: '1rem' }} />}
            </Form>
          </div>

          {/* Currently Authorized Doctors */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                Currently Authorized Doctors ({grantedDoctors.length})
              </h2>
              <Link route="/approve-doctor">
                <a style={{ color: '#FF7354', fontSize: '0.9rem', fontWeight: 600 }}>
                  + Grant New Permission
                </a>
              </Link>
            </div>

            {loadingDoctors ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <Loader active inline="centered" inverted content="Checking current authorizations..." />
              </div>
            ) : grantedDoctors.length === 0 ? (
              <div className="web3-card" style={{ textAlign: 'center', padding: '2.5rem', color: '#94A3B8' }}>
                No active doctor permissions found for this account.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {grantedDoctors.map((doc, idx) => (
                  <div
                    key={idx}
                    className="web3-card"
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1.1rem' }}>
                        {doc.name}{' '}
                        <span style={{ color: '#FF7354', fontSize: '0.85rem' }}>({doc.major})</span>
                      </div>
                      <div style={{ fontFamily: 'monospace', color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
                        {doc.address}
                      </div>
                    </div>

                    <button
                      onClick={() => this.revokeAccess(doc.address)}
                      className="web3-btn-secondary"
                      style={{
                        fontSize: '0.85rem',
                        padding: '0.5rem 1.25rem',
                        color: '#EF4444',
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                      }}
                      disabled={loading}
                    >
                      Revoke Access
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }
}

export default RevokeDoctor;
