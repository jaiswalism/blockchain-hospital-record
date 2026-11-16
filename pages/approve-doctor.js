import React, { Component } from 'react';
import { Input, Form, Message, Loader } from 'semantic-ui-react';
import Layout from '../components/Layout';
import record from '../ethereum/record';
import web3 from '../ethereum/web3';
import { Link } from '../routes';

class ApproveDoctor extends Component {
  state = {
    doctorAddr: '',
    loading: false,
    errorMessage: '',
    successMessage: '',
    doctorsList: [],
    loadingDoctors: true,
    account: '',
  };

  async componentDidMount() {
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts && accounts[0]) {
        this.setState({ account: accounts[0] });
      }

      const rawDocs = await record.methods.getDoctors().call();
      const docs = rawDocs || [];
      const enrichedDocs = [];

      for (let i = 0; i < docs.length; i++) {
        const addr = docs[i];
        try {
          const doc = await record.methods.searchDoctor(addr).call();
          const isVer = await record.methods.isDoctorVerified(addr).call();
          let alreadyApproved = false;
          if (accounts && accounts[0]) {
            alreadyApproved = await record.methods.isApproved(accounts[0], addr).call();
          }
          enrichedDocs.push({
            address: addr,
            name: doc[1],
            major: doc[6],
            isVerified: isVer,
            alreadyApproved: alreadyApproved,
          });
        } catch (e) {
          enrichedDocs.push({ address: addr, name: 'Doctor', major: 'General', isVerified: false, alreadyApproved: false });
        }
      }

      this.setState({ doctorsList: enrichedDocs, loadingDoctors: false });
    } catch (e) {
      console.warn('Error loading doctors for consent list:', e);
      this.setState({ loadingDoctors: false });
    }
  }

  grantAccess = async (addrToGrant) => {
    const target = addrToGrant || this.state.doctorAddr.trim();

    if (!target) {
      this.setState({ errorMessage: 'Please enter or select a doctor address.' });
      return;
    }

    if (!web3.utils.isAddress(target)) {
      this.setState({ errorMessage: 'Invalid Ethereum address format (must be a valid 0x address).' });
      return;
    }

    this.setState({ loading: true, errorMessage: '', successMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts || !accounts[0]) {
        throw new Error('Please connect your MetaMask wallet.');
      }

      await record.methods.givePermission(target).send({ from: accounts[0] });

      this.setState({
        successMessage: `Cryptographic consent successfully granted to doctor ${target}!`,
        doctorAddr: '',
      });

      // Update local state list
      const updated = this.state.doctorsList.map((d) =>
        d.address.toLowerCase() === target.toLowerCase() ? { ...d, alreadyApproved: true } : d
      );
      this.setState({ doctorsList: updated });
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
    this.grantAccess(this.state.doctorAddr);
  };

  render() {
    const { doctorAddr, loading, errorMessage, successMessage, doctorsList, loadingDoctors } = this.state;

    return (
      <Layout>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="web3-badge">
              <span className="dot" />
              <span>Cryptographic Consent Gateway</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Authorize Doctor Access
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem' }}>
              Grant permission to a licensed physician so they can query your medical history, diagnosis, and log appointments. You can revoke access at any time.
            </p>
          </div>

          {/* Direct Address Input Form */}
          <div className="web3-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '1rem' }}>
              Grant Access by Wallet Address
            </h3>
            <Form onSubmit={this.onSubmit} error={!!errorMessage} success={!!successMessage}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <Input
                    fluid
                    placeholder="Enter Doctor Ethereum Address (0x...)"
                    value={doctorAddr}
                    onChange={(event) => this.setState({ doctorAddr: event.target.value, errorMessage: '' })}
                  />
                </div>
                <button
                  type="submit"
                  className="web3-btn-primary"
                  style={{ padding: '0.75rem 1.75rem' }}
                  disabled={loading}
                >
                  {loading ? 'Confirming...' : 'AUTHORIZE DOCTOR ➔'}
                </button>
              </div>

              {errorMessage && <Message error content={errorMessage} style={{ marginTop: '1rem' }} />}
              {successMessage && <Message success content={successMessage} style={{ marginTop: '1rem' }} />}
            </Form>
          </div>

          {/* Quick Select from Registered Doctors */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                Registered Physicians Directory
              </h2>
              <Link route="/revoke-doctor">
                <a style={{ color: '#FF7354', fontSize: '0.9rem', fontWeight: 600 }}>
                  Manage / Revoke Permissions ➔
                </a>
              </Link>
            </div>

            {loadingDoctors ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <Loader active inline="centered" inverted content="Loading registered doctors..." />
              </div>
            ) : doctorsList.length === 0 ? (
              <div className="web3-card" style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                No doctors registered on the network yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {doctorsList.map((doc, idx) => (
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
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1.1rem' }}>
                          {doc.name}
                        </span>
                        <span style={{ color: '#FF4D2D', fontSize: '0.85rem', fontWeight: 600 }}>
                          ({doc.major})
                        </span>
                        {doc.isVerified && (
                          <span
                            style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10B981',
                              border: '1px solid #10B981',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            ✓ VERIFIED
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'monospace', color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
                        {doc.address}
                      </div>
                    </div>

                    <div>
                      {doc.alreadyApproved ? (
                        <span
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10B981',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            display: 'inline-block',
                          }}
                        >
                          ✓ Access Granted
                        </span>
                      ) : (
                        <button
                          onClick={() => this.grantAccess(doc.address)}
                          className="web3-btn-secondary"
                          style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
                          disabled={loading}
                        >
                          Grant Access
                        </button>
                      )}
                    </div>
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

export default ApproveDoctor;
