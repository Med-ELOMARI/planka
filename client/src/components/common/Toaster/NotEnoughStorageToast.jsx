

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, Message } from 'semantic-ui-react';

const NotEnoughStorageToast = React.memo(() => {
  const [t] = useTranslation();

  return (
    <Message visible negative size="tiny">
      <Icon name="hdd" />
      {t('common.uploadFailedNotEnoughStorageSpace')}
    </Message>
  );
});

export default NotEnoughStorageToast;
