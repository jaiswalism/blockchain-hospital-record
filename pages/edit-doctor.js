import React, { Component } from 'react';
import { Divider, Form, Input, Message, Select, Loader } from 'semantic-ui-react';
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

class EditDoctor extends Component {
  state = {
    ic: '',
    name: '',
    phone: '',
    gender: 'Male',
    dob: '',
    qualification: 'MBBS',
    major: '',
    loading: false,
    fetching: true,
    errorMessage: '',
    successMessage: '',
    account: '',
  };

  async componentDidMount() {
    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts || !accounts[0]) {
        this.setState({ fetching: false, errorMessage: 'Please connect your MetaMask wallet.' });
        return;
      }

      const userAddr = accounts[0];
      this.setState({ account: userAddr });

      const isDoc = await record.methods.isDoctor(userAddr).call();
      if (!isDoc) {
        this.setState({
          fetching: false,
          errorMessage: 'You have not registered as a Doctor yet. Please register first.',
        });
        return;
      }

      const doc = await record.methods.searchDoctor(userAddr).call();

      this.setState({
        fetching: false,
        ic: doc[0] || '',
        name: doc[1] || '',
        phone: doc[2] || '',
        gender: doc[3] || 'Male',
        dob: doc[4] || '',
        qualification: doc[5] || 'MBBS',
        major: doc[6] || '',
      });
    } catch (err) {
      console.warn('Error loading doctor data to edit:', err);
      this.setState({ fetching: false });
    }
  }

  handleGender = (e, { value }) => this.setState({ gender: value });
  handleQualification = (e, { value }) => this.setState({ qualification: value });

  onSubmit = async (event) => {
    event.preventDefault();
    const { ic, name, phone, gender, dob, qualification, major } = this.state;

    this.setState({ loading: true, errorMessage: '', successMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      await record.methods
        .editDoctor(ic, name, phone, gender, dob, qualification, major)
        .send({ from: accounts[0] });

      this.setState({
        successMessage: 'Doctor profile updated successfully on-chain!',
      });

      setTimeout(() => {
        Router.pushRoute(`/doctor/${accounts[0]}`);
      }, 1500);
    } catch (err) {
      let friendly = err.message;
      if (err.message && err.message.includes('User denied')) {
        friendly = 'Transaction signature rejected in MetaMask.';
      }
      this.setState({ errorMessage: friendly });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { fetching, loading, errorMessage, successMessage, account } = this.state;

    return (
      <Layout>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div className="web3-badge">
              <span className="dot" />
              <span>Practitioner Profile Management</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Edit Doctor Profile
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem' }}>
              Update your qualifications, contact details, and department specialization.
              Wallet address:{' '}
              <span style={{ color: '#FF7354', fontFamily: 'monospace' }}>
                {account ? `${account.substring(0, 10)}...${account.substring(account.length - 6)}` : '(Connect MetaMask)'}
              </span>
            </p>
          </div>

          {fetching ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <Loader active inline="centered" inverted content="Loading your physician profile..." />
            </div>
          ) : (
            <div className="web3-card" style={{ padding: '2.5rem' }}>
              <Form onSubmit={this.onSubmit} error={!!errorMessage} success={!!successMessage}>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                  Professional Profile Details
                </h3>
                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }} />

                <Form.Group widths="equal">
                  <Form.Field required>
                    <label>National IC / License ID</label>
                    <Input
                      value={this.state.ic}
                      onChange={(e) => this.setState({ ic: e.target.value })}
                    />
                  </Form.Field>

                  <Form.Field required>
                    <label>Full Legal Name</label>
                    <Input
                      value={this.state.name}
                      onChange={(e) => this.setState({ name: e.target.value })}
                    />
                  </Form.Field>

                  <Form.Field>
                    <label>Contact Phone</label>
                    <Input
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
                    value={this.state.gender}
                    onChange={this.handleGender}
                  />

                  <Form.Field>
                    <label>Date of Birth</label>
                    <Input
                      value={this.state.dob}
                      onChange={(e) => this.setState({ dob: e.target.value })}
                    />
                  </Form.Field>

                  <Form.Field
                    label="Qualification"
                    control={Select}
                    options={qualificationOptions}
                    value={this.state.qualification}
                    onChange={this.handleQualification}
                  />
                </Form.Group>

                <Form.Field required style={{ marginTop: '1rem' }}>
                  <label>Major Specialization / Department</label>
                  <Input
                    value={this.state.major}
                    onChange={(e) => this.setState({ major: e.target.value })}
                  />
                </Form.Field>

                <div style={{ marginTop: '2.5rem' }}>
                  <Message error header="Update Error" content={errorMessage} />
                  <Message success header="Success" content={successMessage} />

                  <button
                    type="submit"
                    className="web3-btn-primary"
                    style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', marginTop: '1rem' }}
                    disabled={loading}
                  >
                    {loading ? 'Updating Credentials...' : 'SAVE PROFILE CHANGES ➔'}
                  </button>
                </div>
              </Form>
            </div>
          )}
        </div>
      </Layout>
    );
  }
}

export default EditDoctor;
