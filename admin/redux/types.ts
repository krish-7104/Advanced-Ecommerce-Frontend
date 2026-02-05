export interface InitialState {
  userData: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Action {
  type: String;
  payload: any;
}
