export interface InitialState {
  userData: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  permissions: string[]; // Array of permission codes e.g. ["categories.view", "orders.update"]
}

export interface Action {
  type: String;
  payload: any;
}
