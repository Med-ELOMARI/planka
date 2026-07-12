/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Input } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';

import styles from './ColumnsTemplateStep.module.scss';

const ColumnsTemplateStep = React.memo(({ onSelect, onBack }) => {
  const [t] = useTranslation();
  const [search, setSearch] = useState('');

  const projectsToBoards = useSelector(selectors.selectProjectsToBoardsForCurrentUser);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return projectsToBoards;
    return projectsToBoards
      .map((project) => ({
        ...project,
        boards: project.boards.filter(
          (board) =>
            board.name.toLowerCase().includes(query) ||
            project.name.toLowerCase().includes(query),
        ),
      }))
      .filter((project) => project.boards.length > 0);
  }, [projectsToBoards, search]);

  const hasBoards = filteredProjects.some((project) => project.boards.length > 0);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const handleBoardClick = useCallback(
    (board) => {
      onSelect(board);
    },
    [onSelect],
  );

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.boardTemplate', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Input
          fluid
          icon="search"
          iconPosition="left"
          placeholder={t('common.searchBoards')}
          value={search}
          className={styles.search}
          onChange={handleSearchChange}
        />
        <div className={styles.list}>
          {hasBoards ? (
            filteredProjects.map(
              (project) =>
                project.boards.length > 0 && (
                  <div key={project.id}>
                    <div className={styles.projectName}>{project.name}</div>
                    {project.boards.map((board) => (
                      <button
                        key={board.id}
                        type="button"
                        className={styles.boardItem}
                        onClick={() => handleBoardClick(board)}
                      >
                        {board.name}
                      </button>
                    ))}
                  </div>
                ),
            )
          ) : (
            <div className={styles.noBoards}>{t('common.noBoards')}</div>
          )}
        </div>
      </Popup.Content>
    </>
  );
});

ColumnsTemplateStep.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default ColumnsTemplateStep;
