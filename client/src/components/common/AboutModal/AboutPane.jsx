

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Divider, Header, Image, Loader, Tab } from 'semantic-ui-react';

import version from '../../../version';
import Markdown from '../Markdown';

import aboutLogo from '../../../assets/images/about-logo.png';
import whatsNewUrl from '../../../assets/docs/whats-new.md?url';

import styles from './AboutPane.module.scss';

const AboutPane = React.memo(() => {
  const [t] = useTranslation();
  const [whatsNew, setWhatsNew] = useState(null);

  useEffect(() => {
    async function fetchWhatsNew() {
      let response;
      try {
        response = await fetch(whatsNewUrl);
      } catch {
        return;
      }

      const text = await response.text();
      setWhatsNew(text);
    }

    fetchWhatsNew();
  }, []);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <div className={styles.version}>Community v{version}</div>
    </Tab.Pane>
  );
});

export default AboutPane;
