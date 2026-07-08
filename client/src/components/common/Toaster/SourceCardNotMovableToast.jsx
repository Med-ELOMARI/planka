

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, Message } from 'semantic-ui-react';

const SourceCardNotMovableToast = React.memo(() => {
  const [t] = useTranslation();

  return (
    <Message visible negative size="tiny">
      <Icon name="paste" />
      {t('common.sourceCardIsNoLongerAvailableForMoving')}
    </Message>
  );
});

export default SourceCardNotMovableToast;
