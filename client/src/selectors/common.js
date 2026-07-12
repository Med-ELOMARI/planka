

export const selectIsSocketDisconnected = ({ socket: { isDisconnected } }) => isDisconnected;

export const selectIsInitializing = ({ common: { isInitializing } }) => isInitializing;

export const selectBootstrap = ({ common: { bootstrap } }) => bootstrap;

export const selectOidcBootstrap = (state) => selectBootstrap(state).oidc;

export const selectActiveUsersLimit = (state) => selectBootstrap(state).activeUsersLimit;

export const selectAccessToken = ({ auth: { accessToken } }) => accessToken;

export const selectAuthenticateForm = ({ ui: { authenticateForm } }) => authenticateForm;

export const selectUserCreateForm = ({ ui: { userCreateForm } }) => userCreateForm;

export const selectProjectCreateForm = ({ ui: { projectCreateForm } }) => projectCreateForm;

export const selectSmtpTestState = ({ ui: { smtpTestState } }) => smtpTestState;

export default {
  selectIsSocketDisconnected,
  selectIsInitializing,
  selectBootstrap,
  selectOidcBootstrap,
  selectActiveUsersLimit,
  selectAccessToken,
  selectAuthenticateForm,
  selectUserCreateForm,
  selectProjectCreateForm,
  selectSmtpTestState,
};
