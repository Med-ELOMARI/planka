

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, Message } from 'semantic-ui-react';

const FileIsTooBigToast = React.memo(() => {
  const [t] = useTranslation();

  return (
    <Message visible negative size="tiny">
      <Icon name="file" />
      {t('common.uploadFailedFileIsTooBig')}
    </Message>
  );
});

export default FileIsTooBigToast;
