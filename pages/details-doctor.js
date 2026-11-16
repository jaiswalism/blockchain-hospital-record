import React, { Component } from 'react';
import { Grid, Loader, Message } from 'semantic-ui-react';
import Layout from '../components/Layout';
import record from '../ethereum/record';
import web3 from '../ethereum/web3';
import { Link } from '../routes';

class DoctorDetails extends Component {
  static async getInitialProps(props) {
    return { targetAddress: props.query.address };
  }

  state = {
    loading: true,
    doctor: null,
    isVerified: false,
    errorMessage: '',
    account: '',
  };

  async componentDidMount() {
    const { targetAddress } = this.props;

    if (!targetAddress || !web3.utils.isAddress(targetAddress)) {
      this.setState({
        loading: false,
        errorMessage: 'Invalid or missing doctor Ethereum wallet address in URL.',
      });
      return;
    }

    try {
      const accounts = await web3.eth.getAccounts();
      const caller = accounts && accounts[0] ? accounts[0] : '';
      this.setState({ account: caller });

      const doc = await record.methods.searchDoctor(targetAddress).call();
      const isVer = await record.methods.isDoctorVerified(targetAddress).call();

      this.setState({
        loading: false,
        isVerified: isVer,
        doctor: {
          ic: doc[0],
          name: doc[1],
          phone: doc[2],
          gender: doc[3],
          dob: doc[4],
          qualification: doc[5],
          major: doc[6],
        },
      });
    } catch (err) {
      console.warn('Doctor lookup error:', err);
      this.setState({
        loading: false,
        errorMessage: 'This address is not registered as a doctor in the MediBlock smart contract.',
      });
    }
  }

  render() {
    const { targetAddress } = this.props;
    const { loading, doctor, isVerified, errorMessage, account } = this.state;
    const isSelf = account && targetAddress && account.toLowerCase() === targetAddress.toLowerCase();

    return (
      <Layout>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div className="web3-badge">
              <span className="dot" />
              <span>Verified Medical Practitioner Profile</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                  {doctor ? doctor.name : 'Doctor Profile'}
                </h1>
                <div style={{ fontFamily: 'monospace', color: '#94A3B8', fontSize: '0.95rem' }}>
                  Wallet: <span style={{ color: '#FF7354' }}>{targetAddress}</span>
                </div>
              </div>

              {isSelf && (
                <Link route="/edit-doctor">
                  <a className="web3-btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                    Edit Profile
                  </a>
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <Loader active inline="centered" inverted content="Loading physician credentials..." />
            </div>
          ) : errorMessage ? (
            <div className="web3-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <h2 style={{ color: '#FFFFFF', marginBottom: '1rem' }}>Doctor Profile Not Found</h2>
              <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>{errorMessage}</p>
              <Link route="/register-doctor">
                <a className="web3-btn-primary">Register as Doctor</a>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Status Header Card */}
              <div
                className="web3-card"
                style={{
                  border: isVerified ? '1px solid #10B981' : '1px solid #F59E0B',
                  background: isVerified ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.5rem 2rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#FFFFFF' }}>
                    {isVerified ? '✓ Verified Practitioner' : '⏳ Pending Hospital Verification'}
                  </div>
                  <div style={{ color: '#CBD5E1', fontSize: '0.9rem', marginTop: '4px' }}>
                    {isVerified
                      ? 'Authorized to consult patients and log diagnostic appointments on Ethereum.'
                      : 'Awaiting admin verification before clinical appointments can be issued.'}
                  </div>
                </div>
                <div
                  style={{
                    background: isVerified ? '#10B981' : '#F59E0B',
                    color: '#000000',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {isVerified ? 'Active' : 'Pending'}
                </div>
              </div>

              {/* Personal & Educational Details Card */}
              <div className="web3-card" style={{ padding: '2.5rem' }}>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                  Practitioner Credentials & Specialization
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                  }}
                >
                  <div style={{ background: '#0D0F15', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ color: '#64748B', fontSize: '0.85rem' }}>Specialization / Department</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FF4D2D', marginTop: '4px' }}>
                      {doctor.major}
                    </div>
                  </div>

                  <div style={{ background: '#0D0F15', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ color: '#64748B', fontSize: '0.85rem' }}>Highest Qualification</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>
                      {doctor.qualification}
                    </div>
                  </div>

                  <div style={{ background: '#0D0F15', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ color: '#64748B', fontSize: '0.85rem' }}>Medical License / IC</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
                      {doctor.ic}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingTop: '1.5rem',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748B', fontSize: '0.85rem' }}>Gender: </span>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{doctor.gender}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', fontSize: '0.85rem' }}>Date of Birth: </span>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{doctor.dob || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', fontSize: '0.85rem' }}>Contact Phone: </span>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{doctor.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link route="/make-appointment">
                  <a className="web3-btn-primary">Create Patient Consultation ➔</a>
                </Link>
                <Link route="/list">
                  <a className="web3-btn-secondary">Browse Patient Directory</a>
                </Link>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }
}

export default DoctorDetails;
