

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Icon } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../../lib/hooks';
import { Input, Popup } from '../../../lib/custom-ui';

import entryActions from '../../../entry-actions';
import { useForm, useNestedRef, useSteps } from '../../../hooks';
import ImportStep from './ImportStep';
import ColumnsTemplateStep from './ColumnsTemplateStep';

import styles from './AddBoardStep.module.scss';

const StepTypes = {
  IMPORT: 'IMPORT',
  COLUMNS_TEMPLATE: 'COLUMNS_TEMPLATE',
};

const AddBoardStep = React.memo(({ onClose }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm({
    name: '',
    import: null,
    templateBoardId: null,
    templateBoardName: null,
  });

  const [step, openStep, handleBack] = useSteps();
  const [focusNameFieldState, focusNameField] = useToggle();

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameFieldRef.current.select();
      return;
    }

    // Strip display-only field before dispatching
    // eslint-disable-next-line no-unused-vars
    const { templateBoardName: _, ...submitData } = cleanData;
    dispatch(entryActions.createBoardInCurrentProject(submitData));
    onClose();
  }, [onClose, dispatch, data, nameFieldRef]);

  const handleImportSelect = useCallback(
    (nextImport) => {
      setData((prevData) => ({
        ...prevData,
        import: nextImport,
        templateBoardId: null,
        templateBoardName: null,
      }));
    },
    [setData],
  );

  const handleTemplateSelect = useCallback(
    (board) => {
      setData((prevData) => ({
        ...prevData,
        templateBoardId: board.id,
        templateBoardName: board.name,
        import: null,
      }));
      handleBack();
      focusNameField();
    },
    [setData, handleBack, focusNameField],
  );

  const handleImportBack = useCallback(() => {
    handleBack();
    focusNameField();
  }, [handleBack, focusNameField]);

  const handleTemplateBack = useCallback(() => {
    handleBack();
    focusNameField();
  }, [handleBack, focusNameField]);

  const handleImportClick = useCallback(() => {
    openStep(StepTypes.IMPORT);
  }, [openStep]);

  const handleBoardTemplateClick = useCallback(() => {
    openStep(StepTypes.COLUMNS_TEMPLATE);
  }, [openStep]);

  useEffect(() => {
    nameFieldRef.current.focus({
      preventScroll: true,
    });
  }, [nameFieldRef]);

  useDidUpdate(() => {
    nameFieldRef.current.focus();
  }, [focusNameFieldState]);

  if (step && step.type === StepTypes.IMPORT) {
    return (
      <ImportStep
        onSelect={handleImportSelect}
        onBack={handleImportBack}
        onBoardTemplate={handleBoardTemplateClick}
      />
    );
  }

  if (step && step.type === StepTypes.COLUMNS_TEMPLATE) {
    return <ColumnsTemplateStep onSelect={handleTemplateSelect} onBack={handleTemplateBack} />;
  }

  return (
    <>
      <Popup.Header>
        {t('common.createBoard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.title')}</div>
          <Input
            fluid
            ref={handleNameFieldRef}
            name="name"
            value={data.name}
            maxLength={128}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <div className={styles.controls}>
            <Button positive content={t('action.createBoard')} className={styles.button} />
            <Button
              type="button"
              className={classNames(styles.button, styles.importButton)}
              onClick={handleImportClick}
            >
              <Icon
                name={
                  // eslint-disable-next-line no-nested-ternary
                  data.import ? data.import.type : data.templateBoardId ? 'columns' : 'arrow down'
                }
                className={styles.importButtonIcon}
              />
              {
                // eslint-disable-next-line no-nested-ternary
                data.import
                  ? data.import.file.name
                  : data.templateBoardName || t('action.import')
              }
            </Button>
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

AddBoardStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddBoardStep;
