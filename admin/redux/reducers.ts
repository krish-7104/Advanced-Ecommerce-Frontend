import { InitialState, Action } from "@/redux/types";

const initialState: InitialState = {
  userData: {
    id: "",
    name: "",
    email: "",
    permissions: [],
  },
};

export const reducers = (
  state = initialState,
  action: Action,
): InitialState => {
  switch (action.type) {
    case "USER_DATA":
      return {
        ...state,
        userData: {
          ...action.payload,
          // Normalize: extract permission codes from permission objects if needed
          permissions: Array.isArray(action.payload?.permissions)
            ? action.payload.permissions.map((p: any) =>
                typeof p === "string" ? p : p.code,
              )
            : [],
        },
      };
    default:
      return state;
  }
};
