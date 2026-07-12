

import EntryActionTypes from '../constants/EntryActionTypes';

const createWebhook = (data) => ({
  type: EntryActionTypes.WEBHOOK_CREATE,
  payload: {
    data,
  },
});

const handleWebhookCreate = (webhook) => ({
  type: EntryActionTypes.WEBHOOK_CREATE_HANDLE,
  payload: {
    webhook,
  },
});

const updateWebhook = (id, data) => ({
  type: EntryActionTypes.WEBHOOK_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleWebhookUpdate = (webhook) => ({
  type: EntryActionTypes.WEBHOOK_UPDATE_HANDLE,
  payload: {
    webhook,
  },
});

const deleteWebhook = (id) => ({
  type: EntryActionTypes.WEBHOOK_DELETE,
  payload: {
    id,
  },
});

const handleWebhookDelete = (webhook) => ({
  type: EntryActionTypes.WEBHOOK_DELETE_HANDLE,
  payload: {
    webhook,
  },
});

export default {
  createWebhook,
  handleWebhookCreate,
  updateWebhook,
  handleWebhookUpdate,
  deleteWebhook,
  handleWebhookDelete,
};
