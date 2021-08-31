const INITIAL_STATE = {
  page: 'home',
  did: null,
  idxInstance: null,
  did_profile: {},
  online_user_count: 0,
  slow: null,
  standard: null,
  fast: null,
  rapid: null,
};

export default function session(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'SET_AUTH_STATUS':
      return { ...state, isAuth: action.payload };
    case 'SET_ETH_STATUS':
      return { ...state, eth_status: action.payload };
    case 'SET_ADDRESS':
      return { ...state, address: action.payload };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'SET_CHAINID':
      return { ...state, chainId: action.payload };
    case 'SET_BALANCE':
      return { ...state, balance: action.payload };
    case 'SET_SIDEBAR_STATUS':
      return { ...state, showSidebar: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_SHOW_ANNOUCEMENT':
      return { ...state, showAnnoucement: action.payload };
    case 'SET_DID':
      return { ...state, did: action.payload };
    case 'SET_IDX_INSTANCE':
      return { ...state, idxInstance: action.payload };
    case 'SET_DID_PROFILE':
      return { ...state, did_profile: action.payload };
    case 'UPDATE_ONLINE_USER_COUNT':
      return { ...state, online_user_count: action.payload };
    case 'UPDATE_GAS':
      return {
        ...state,
        slow: action.payload.slow,
        standard: action.payload.standard,
        fast: action.payload.fast,
        rapid: action.payload.rapid,
      };
    default:
      return state;
  }
}
