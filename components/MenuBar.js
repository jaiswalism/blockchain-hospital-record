import React, { Component } from 'react';
import { Menu, Dropdown } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import { Link } from '../routes';
import { Router } from '../routes';

// Header that is used in all pages

export default class MenuBar extends Component {
  onClickedPatient = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    Router.pushRoute(`/record/${accounts[0]}`);
  };

  onClickedDoctor = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    Router.pushRoute(`/doctor/${accounts[0]}`);
  };

  render() {
    return (
      <Menu size='large' inverted>
        <Link route='/'>
          <a className='item'>Home</a>
        </Link>

        <Menu.Menu position='right'>
          <Link route='/dashboard'>
            <a className='item'>Dashboard</a>
          </Link>

          <Link route='/list'>
            <a className='item'>Records List</a>
          </Link>

          <Dropdown item text='Doctor'>
            <Dropdown.Menu>
              <Dropdown.Item>
                <Link route='/' style={{ color: 'black' }} onClick={this.onClickedDoctor}>
                  View Profile
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route='/edit-doctor' style={{ color: 'black' }}>
                  Edit Profile
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route='/make-appointment' style={{ color: 'black' }}>
                  Make Appointment
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route='/edit-appointment' style={{ color: 'black' }}>
                  Update Appointment
                </Link>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown item text='Patient'>
            <Dropdown.Menu>
              <Dropdown.Item>
                <Link route='/' style={{ color: 'black' }} onClick={this.onClickedPatient}>
                  View Profile
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route='/edit-patient' style={{ color: 'black' }}>
                  Edit Profile
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route='/approve-doctor' style={{ color: 'black' }}>
                  Allow Access
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route='/revoke-doctor' style={{ color: 'black' }}>
                  Revoke Access
                </Link>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown item text='Register'>
            <Dropdown.Menu>
              <Dropdown.Item>
                <Link route='/register-patient' style={{ color: 'black' }}>
                  Patient
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Link route='/register-doctor' style={{ color: 'black' }}>
                  Doctor
                </Link>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Menu>
      </Menu>
    );
  }
}
