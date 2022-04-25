import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { UsersStateInterface } from './state';

const getters: GetterTree<UsersStateInterface, StateInterface> = {
  someGetter (/* context */) {
    // your code
  }
};

export default getters;
