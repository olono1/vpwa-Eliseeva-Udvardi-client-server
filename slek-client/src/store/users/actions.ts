import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { UsersStateInterface } from './state';

const actions: ActionTree<UsersStateInterface, StateInterface> = {
  someAction (/* context */) {
    // your code
  }
};

export default actions;
