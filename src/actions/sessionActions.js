export const updateOnlineUserCount = (payload) => async (dispatch) => {
  // console.log(count);
  await dispatch({
    type: 'UPDATE_ONLINE_USER_COUNT',
    payload,
  });
};
export const updateGas = (payload) => async (dispatch) => {
  // console.log(count);
  await dispatch({
    type: 'UPDATE_GAS',
    payload,
  });
};
