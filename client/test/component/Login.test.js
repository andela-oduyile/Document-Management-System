import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import sinon from 'sinon';
import Login from '../../public/js/components/Login';

const mockStore = configureStore();

describe('<Signup />', () => {
  it('should display input field to register', (done) => {
    const wrapper = mount(
      <Provider store={mockStore()} >
        <Login />
      </Provider>
    );
    expect(wrapper.find('#email')).to.have.length(1);
    expect(wrapper.find('#password')).to.have.length(1);
    done();
  });
});
