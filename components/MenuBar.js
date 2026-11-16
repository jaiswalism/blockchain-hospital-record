import React, { Component } from 'react';
import { Dropdown } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import record from '../ethereum/record';
import { Link, Router } from '../routes';

export default class MenuBar extends Component {
  state = {
    account: '',
    loading: false,
    networkName: 'Sepolia',
    isPatient: false,
    isDoctor: false,
    isDoctorVerified: false,
    isOwner: false,
    roleLoaded: false,
    userName: '',
    contractNotFound: false,
  };

  async componentDidMount() {
    try {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          const currentAccount = accounts[0];
          this.setState({ account: currentAccount });
          await this.detectUserRole(currentAccount);
        } else {
          this.setState({ roleLoaded: true });
        }

        window.ethereum.on('accountsChanged', async (newAccounts) => {
          if (newAccounts && newAccounts.length > 0) {
            const nextAccount = newAccounts[0];
            this.setState({ account: nextAccount, roleLoaded: false });
            await this.detectUserRole(nextAccount);
          } else {
            this.setState({
              account: '',
              isPatient: false,
              isDoctor: false,
              isDoctorVerified: false,
              isOwner: false,
              roleLoaded: true,
              userName: '',
            });
          }
        });
      } else {
        this.setState({ roleLoaded: true });
      }
    } catch (err) {
      console.warn('Could not read ethereum accounts automatically:', err);
      this.setState({ roleLoaded: true });
    }
  }

  detectUserRole = async (accountAddress) => {
    if (!accountAddress || !web3.utils.isAddress(accountAddress)) {
      this.setState({
        isPatient: false,
        isDoctor: false,
        isDoctorVerified: false,
        isOwner: false,
        roleLoaded: true,
        userName: '',
      });
      return;
    }

    try {
      const [isPt, isDoc, ownerAddr] = await Promise.all([
        record.methods.isPatient(accountAddress).call(),
        record.methods.isDoctor(accountAddress).call(),
        record.methods.owner().call(),
      ]);

      let isVerified = false;
      let name = '';

      if (isDoc) {
        isVerified = await record.methods.isDoctorVerified(accountAddress).call();
        try {
          const docData = await record.methods.searchDoctor(accountAddress).call();
          if (docData && docData[1]) {
            name = docData[1];
          }
        } catch (e) {}
      }

      if (isPt && !name) {
        try {
          const ptData = await record.methods.searchPatientDemographic(accountAddress).call({ from: accountAddress });
          if (ptData && ptData[1]) {
            name = ptData[1];
          }
        } catch (e) {}
      }

      const isOw = ownerAddr && ownerAddr.toLowerCase() === accountAddress.toLowerCase();

      this.setState({
        isPatient: !!isPt,
        isDoctor: !!isDoc,
        isDoctorVerified: !!isVerified,
        isOwner: !!isOw,
        userName: name,
        contractNotFound: false,
        roleLoaded: true,
      });
    } catch (err) {
      console.warn('Role detection check failed:', err);
      const isMissing =
        err.message &&
        (err.message.includes("Returned values aren't valid") ||
          err.message.includes('not retrieving data from the correct address') ||
          err.message.includes('call revert') ||
          err.message.includes('invalid address'));
      this.setState({
        contractNotFound: isMissing,
        roleLoaded: true,
      });
    }
  };

  connectWallet = async () => {
    try {
      this.setState({ loading: true });
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const currentAccount = accounts[0];
          this.setState({ account: currentAccount });
          await this.detectUserRole(currentAccount);
        }
      } else {
        alert('MetaMask is not installed. Please install MetaMask to interact with MediBlock.');
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      this.setState({ loading: false });
    }
  };

  renderRoleSpecificLinks() {
    const { account, isPatient, isDoctor, roleLoaded } = this.state;

    if (!roleLoaded) {
      return null;
    }

    // CASE 1: Logged-in Patient (and NOT doctor)
    if (isPatient && !isDoctor) {
      return (
        <>
          <Link route={`/record/${account}`}>
            <a className="web3-nav-link" style={{ color: '#FF7354' }}>
              My Health Record
            </a>
          </Link>

          <Dropdown item text="Consent & Permissions" className="web3-nav-link">
            <Dropdown.Menu>
              <Dropdown.Item>
                <Link route="/approve-doctor">
                  <a>Grant Doctor Access</a>
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route="/revoke-doctor">
                  <a>Revoke Doctor Access</a>
                </Link>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Link route="/edit-patient">
            <a className="web3-nav-link">
              Edit Details
            </a>
          </Link>
        </>
      );
    }

    // CASE 2: Logged-in Doctor (and NOT patient)
    if (isDoctor && !isPatient) {
      return (
        <>
          <Link route={`/doctor/${account}`}>
            <a className="web3-nav-link" style={{ color: '#10B981' }}>
              Doctor Profile
            </a>
          </Link>

          <Dropdown item text="Consultations" className="web3-nav-link">
            <Dropdown.Menu>
              <Dropdown.Item>
                <Link route="/make-appointment">
                  <a>New Consultation / Prescription</a>
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route="/edit-appointment">
                  <a>Update Consultation</a>
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route="/edit-doctor">
                  <a>Edit Doctor Profile</a>
                </Link>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </>
      );
    }

    // CASE 3: Account registered as BOTH Patient and Doctor
    if (isPatient && isDoctor) {
      return (
        <>
          <Dropdown item text="Patient Portal" className="web3-nav-link">
            <Dropdown.Menu>
              <Dropdown.Item>
                <Link route={`/record/${account}`}>
                  <a>View My Record</a>
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route="/edit-patient">
                  <a>Edit Patient Details</a>
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route="/approve-doctor">
                  <a>Grant Doctor Access</a>
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route="/revoke-doctor">
                  <a>Revoke Doctor Access</a>
                </Link>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown item text="Doctor Portal" className="web3-nav-link">
            <Dropdown.Menu>
              <Dropdown.Item>
                <Link route={`/doctor/${account}`}>
                  <a>View Doctor Profile</a>
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route="/make-appointment">
                  <a>New Consultation</a>
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route="/edit-appointment">
                  <a>Update Consultation</a>
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route="/edit-doctor">
                  <a>Edit Doctor Profile</a>
                </Link>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </>
      );
    }

    // CASE 4: Not registered yet (New User or Disconnected)
    return (
      <Dropdown item text="Register" className="web3-nav-link">
        <Dropdown.Menu>
          <Dropdown.Item>
            <Link route="/register-patient">
              <a>Register as Patient</a>
            </Link>
          </Dropdown.Item>
          <Dropdown.Item>
            <Link route="/register-doctor">
              <a>Register as Doctor</a>
            </Link>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  renderRoleBadge() {
    const { isPatient, isDoctor, isDoctorVerified, isOwner, contractNotFound } = this.state;

    if (contractNotFound) {
      return (
        <span
          title="The contract address configured in .env was not found on your current MetaMask network. Please deploy or switch network."
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            color: '#F87171',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.725rem',
            fontWeight: 700,
            cursor: 'help',
          }}
        >
          ⚠️ CONTRACT NOT ON NETWORK
        </span>
      );
    }

    if (isOwner) {
      return (
        <span
          style={{
            background: 'rgba(255, 77, 45, 0.15)',
            border: '1px solid #FF4D2D',
            color: '#FF7354',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.725rem',
            fontWeight: 700,
          }}
        >
          🛡️ ADMIN
        </span>
      );
    }

    if (isDoctor) {
      return (
        <span
          style={{
            background: isDoctorVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${isDoctorVerified ? '#10B981' : '#F59E0B'}`,
            color: isDoctorVerified ? '#10B981' : '#F59E0B',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.725rem',
            fontWeight: 700,
          }}
        >
          {isDoctorVerified ? '🩺 DOCTOR ✓' : '🩺 DOCTOR (PENDING)'}
        </span>
      );
    }

    if (isPatient) {
      return (
        <span
          style={{
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid #38BDF8',
            color: '#38BDF8',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.725rem',
            fontWeight: 700,
          }}
        >
          👤 PATIENT
        </span>
      );
    }

    return (
      <span
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          color: '#94A3B8',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.725rem',
          fontWeight: 600,
        }}
      >
        NEW USER
      </span>
    );
  }

  render() {
    const { account, loading, userName } = this.state;
    const shortAddress = account
      ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
      : null;

    return (
      <header className="web3-nav">
        <Link route="/">
          <div className="web3-brand">
            <div className="web3-logo-icon">M</div>
            <div className="web3-brand-text">
              Medi<span>Block</span>
            </div>
          </div>
        </Link>

        <nav className="web3-nav-links">
          <Link route="/">
            <a className="web3-nav-link">Home</a>
          </Link>

          <Link route="/dashboard">
            <a className="web3-nav-link">Dashboard</a>
          </Link>

          <Link route="/list">
            <a className="web3-nav-link">Directory</a>
          </Link>

          {/* Dynamic role-based navigation links */}
          {this.renderRoleSpecificLinks()}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {account ? (
            <div className="web3-wallet-pill" title={account}>
              <div className="web3-status-dot" />
              {userName && (
                <span style={{ color: '#FFFFFF', fontWeight: 600, marginRight: '4px' }}>
                  {userName}
                </span>
              )}
              <span>{shortAddress}</span>
              {this.renderRoleBadge()}
            </div>
          ) : (
            <button
              onClick={this.connectWallet}
              className="web3-btn-primary"
              style={{ padding: '0.5rem 1.15rem', fontSize: '0.875rem' }}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </header>
    );
  }
}
