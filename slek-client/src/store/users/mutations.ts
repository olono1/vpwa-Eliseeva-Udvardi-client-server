import { MutationTree } from 'vuex';
import { UsersStateInterface } from './state';

const mutation: MutationTree<UsersStateInterface> = {
  someMutation (/* state: ExampleStateInterface */) {
    // your code
  }
};

export default mutation;
