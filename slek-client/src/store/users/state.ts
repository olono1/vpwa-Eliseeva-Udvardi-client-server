import { User } from "src/contracts";

export interface UsersStateInterface {
  prop: boolean;
  users: Array<User> | null;
}

function state(): UsersStateInterface {
  return {
    prop: false,
    users: null
  };
}

export default state;
