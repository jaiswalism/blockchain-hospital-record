import React, { Component } from 'react';
import { Divider, Form, Input, Button, Segment, Message, Select } from 'semantic-ui-react';
import Layout from '../components/Layout';
import record from '../ethereum/record';
import web3 from '../ethereum/web3';
import { Router } from '../routes';

const genderOptions = [
  { key: 'm', text: 'Male', value: 'Male' },
  { key: 'f', text: 'Female', value: 'Female' },
  { key: 'o', text: 'Other', value: 'Other' },
];

const qualificationOptions = [
  { key: 'mbbs', text: 'MBBS / Medical Degree', value: 'MBBS' },
  { key: 'md', text: 'MD (Doctor of Medicine)', value: 'MD' },
  { key: 'ms', text: 'MS (Master of Surgery)', value: 'MS' },
  { key: 'phd', text: 'Doctoral / Ph.D.', value: 'PhD' },
  { key: 'b', text: "Bachelor's Degree", value: "Bachelor's Degree" },
  { key: 'm', text: "Master's Degree", value: "Master's Degree" },
];

class RegisterDoctor extends Component {
  state = {
    ic: '',
    name: '',
    phone: '',
    gender: 'Male',
    dob: '',
    qualification: 'MBBS',
    major: '',
    loading: false,
    errorMessage: '',
    successMessage: '',
    account: '',
    isRegistered: false,
    isVerified: false,
  };

  async componentDidMount() {
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts && accounts[0]) {
        this.setState({ account: accounts[0] });
        const isDoc = await record.methods.isDoctor(accounts[0]).call();
        if (isDoc) {
          const isVerified = await record.methods.isDoctorVerified(accounts[0]).call();
          this.setState({
            isRegistered: true,
            isVerified: isVerified,
            successMessage: isVerified
              ? 'This account is already registered and verified as a Doctor!'
              : 'This account is registered and currently pending verification by the administrator.',
          });
        }
      }
    } catch (e) {
      console.warn('Could not check doctor registration state:', e);
    }
  }

  handleGender = (e, { value }) => this.setState({ gender: value });
  handleQualification = (e, { value }) => this.setState({ qualification: value });

  onSubmit = async (event) => {
    event.preventDefault();
    const { ic, name, phone, gender, dob, qualification, major } = this.state;

    if (!ic.trim() || !name.trim() || !major.trim()) {
      this.setState({ errorMessage: 'National IC, Full Name, and Specialization are required.' });
      return;
    }

    this.setState({ loading: true, errorMessage: '', successMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error('Please connect your MetaMask wallet.');
      }

      await record.methods
        .setDoctor(
          ic.trim(), name.trim(), phone.trim(), gender, dob.trim(), qualification, major.trim()
        )
        .send({ from: accounts[0] });

      this.setState({
        successMessage: 'Doctor profile submitted successfully! Verification request sent to hospital admin.',
        isRegistered: true,
      });

      setTimeout(() => {
        Router.pushRoute(`/doctor/${accounts[0]}`);
      }, 1500);
    } catch (err) {
      let friendly = err.message;
      if (err.message && err.message.includes('User denied')) {
        friendly = 'Transaction signature was rejected in MetaMask.';
      } else if (err.message && err.message.includes('revert')) {
        friendly = 'Smart contract reverted: Doctor account already exists or invalid data.';
      }
      this.setState({ errorMessage: friendly });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { account, isRegistered, isVerified, loading, errorMessage, successMessage } = this.state;

    return (
      <Layout>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div className="web3-badge">
              <span className="dot" />
              <span>Physician Onboarding & Credentials</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Register Medical Practitioner
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem' }}>
              Register your practitioner profile to be verified on the Ethereum blockchain.
              Wallet address:{' '}
              <span style={{ color: '#FF7354', fontFamily: 'monospace' }}>
                {account ? `${account.substring(0, 10)}...${account.substring(account.length - 6)}` : '(Connect MetaMask)'}
              </span>
            </p>
          </div>

          {isRegistered && (
            <div
              style={{
                background: isVerified ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: `1px solid ${isVerified ? '#10B981' : '#F59E0B'}`,
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1.1rem' }}>
                  {isVerified ? '✓ Verified Practitioner' : '⏳ Pending Admin Verification'}
                </div>
                <div style={{ color: '#CBD5E1', fontSize: '0.9rem', marginTop: '4px' }}>
                  {isVerified
                    ? 'Your doctor account is verified and fully authorized to log clinical appointments.'
                    : 'The hospital contract admin has not verified this account yet.'}
                </div>
              </div>
              <button
                onClick={() => Router.pushRoute(`/doctor/${account}`)}
                className="web3-btn-secondary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                View Profile
              </button>
            </div>
          )}

          <div className="web3-card" style={{ padding: '2.5rem' }}>
            <Form onSubmit={this.onSubmit} error={!!errorMessage} success={!!successMessage}>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                Professional Credentials & Demographics
              </h3>
              <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }} />

              <Form.Group widths="equal">
                <Form.Field required>
                  <label>National IC / Medical License ID</label>
                  <Input
                    placeholder="Eg. 880102030405"
                    value={this.state.ic}
                    onChange={(e) => this.setState({ ic: e.target.value })}
                  />
                </Form.Field>

                <Form.Field required>
                  <label>Full Name (Dr.)</label>
                  <Input
                    placeholder="Eg. Dr. Gregory House"
                    value={this.state.name}
                    onChange={(e) => this.setState({ name: e.target.value })}
                  />
                </Form.Field>

                <Form.Field>
                  <label>Contact Phone</label>
                  <Input
                    placeholder="Eg. +1 555-0188"
                    value={this.state.phone}
                    onChange={(e) => this.setState({ phone: e.target.value })}
                  />
                </Form.Field>
              </Form.Group>

              <Form.Group widths="equal">
                <Form.Field
                  label="Gender"
                  control={Select}
                  options={genderOptions}
                  defaultValue="Male"
                  onChange={this.handleGender}
                />

                <Form.Field>
                  <label>Date of Birth</label>
                  <Input
                    placeholder="DD/MM/YYYY"
                    value={this.state.dob}
                    onChange={(e) => this.setState({ dob: e.target.value })}
                  />
                </Form.Field>

                <Form.Field
                  label="Qualification"
                  control={Select}
                  options={qualificationOptions}
                  defaultValue="MBBS"
                  onChange={this.handleQualification}
                />
              </Form.Group>

              <Form.Field required style={{ marginTop: '1rem' }}>
                <label>Major Specialization / Department</label>
                <Input
                  placeholder="Eg. Cardiology, Neurology, Pediatrics, Orthopedics"
                  value={this.state.major}
                  onChange={(e) => this.setState({ major: e.target.value })}
                />
              </Form.Field>

              <div style={{ marginTop: '2.5rem' }}>
                <Message error header="Registration Error" content={errorMessage} />
                <Message success header="Submitted Successfully" content={successMessage} />

                <button
                  type="submit"
                  className="web3-btn-primary"
                  style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', marginTop: '1rem' }}
                  disabled={loading}
                >
                  {loading ? 'Submitting to Blockchain...' : 'SUBMIT DOCTOR REGISTRATION ➔'}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </Layout>
    );
  }
}

export default RegisterDoctor;
