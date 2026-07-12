
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon, Label, Loader, Menu, Modal, Tab } from 'semantic-ui-react';
import { push } from '../../../lib/redux-router';

import api from '../../../api';
import entryActions from '../../../entry-actions';
import selectors from '../../../selectors';
import { useClosableModal } from '../../../hooks';
import Paths from '../../../constants/Paths';

import styles from './GlobalSearchModal.module.scss';

const DEBOUNCE_DELAY = 350;
const MIN_QUERY_LENGTH = 2;

const GlobalSearchModal = React.memo(() => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const accessToken = useSelector(selectors.selectAccessToken);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const activeSearchRef = useRef(null);

  const handleClose = useCallback(() => {
    dispatch(entryActions.closeModal());
  }, [dispatch]);

  const handleCardNavigate = useCallback(
    (cardId) => {
      dispatch(push(Paths.CARDS.replace(':id', cardId)));
      dispatch(entryActions.closeModal());
    },
    [dispatch],
  );

  const performSearch = useMemo(
    () =>
      debounce(async (q) => {
        const searchId = Symbol();
        activeSearchRef.current = searchId;

        if (!q || q.trim().length < MIN_QUERY_LENGTH) {
          setResults(null);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        try {
          const result = await api.search(
            { q: q.trim() },
            { Authorization: `Bearer ${accessToken}` },
          );
          if (activeSearchRef.current === searchId) {
            setResults(result);
          }
        } catch {
          if (activeSearchRef.current === searchId) {
            setResults(null);
          }
        } finally {
          if (activeSearchRef.current === searchId) {
            setIsLoading(false);
          }
        }
      }, DEBOUNCE_DELAY),
    [],
  );

  useEffect(() => () => performSearch.cancel(), [performSearch]);

  const handleQueryChange = useCallback(
    (e) => {
      const { value } = e.target;
      setQuery(value);
      if (value.trim().length >= MIN_QUERY_LENGTH) {
        setIsLoading(true);
      } else {
        setIsLoading(false);
        setResults(null);
      }
      performSearch(value);
    },
    [performSearch],
  );

  const handleTabChange = useCallback((_, { activeIndex }) => {
    setActiveTabIndex(activeIndex);
  }, []);

  const [ClosableModal] = useClosableModal();

  const boardById = useMemo(() => {
    if (!results) return {};
    return Object.fromEntries((results.included.boards || []).map((b) => [b.id, b]));
  }, [results]);

  const projectById = useMemo(() => {
    if (!results) return {};
    return Object.fromEntries((results.included.projects || []).map((p) => [p.id, p]));
  }, [results]);

  const cardById = useMemo(() => {
    if (!results) return {};
    return Object.fromEntries((results.included.cards || []).map((c) => [c.id, c]));
  }, [results]);

  const cardCount = results ? results.cards.length : 0;
  const commentCount = results ? results.comments.length : 0;

  const renderEmpty = (searched) =>
    searched ? (
      <div className={styles.empty}>{t('common.noResultsFound')}</div>
    ) : (
      <div className={styles.placeholder}>{t('common.typeToSearch')}</div>
    );

  const hasSearched = results !== null;

  const cardsContent = (
    <div className={styles.results}>
      {isLoading && (
        <div className={styles.loaderWrapper}>
          <Loader active inline="centered" size="small" />
        </div>
      )}
      {!isLoading && cardCount === 0 && renderEmpty(hasSearched)}
      {!isLoading &&
        results &&
        results.cards.map((card) => {
          const board = boardById[card.boardId];
          const project = board ? projectById[board.projectId] : null;

          return (
            <button
              key={card.id}
              type="button"
              className={styles.resultItem}
              onClick={() => handleCardNavigate(card.id)}
            >
              <div className={styles.resultTitle}>{card.name}</div>
              {(project || board) && (
                <div className={styles.resultPath}>
                  {project && <span>{project.name}</span>}
                  {project && board && <span className={styles.separator}> › </span>}
                  {board && <span>{board.name}</span>}
                </div>
              )}
              {card.description && (
                <div className={styles.resultSnippet}>
                  {card.description.length > 120
                    ? `${card.description.substring(0, 120)}…`
                    : card.description}
                </div>
              )}
            </button>
          );
        })}
    </div>
  );

  const commentsContent = (
    <div className={styles.results}>
      {isLoading && (
        <div className={styles.loaderWrapper}>
          <Loader active inline="centered" size="small" />
        </div>
      )}
      {!isLoading && commentCount === 0 && renderEmpty(hasSearched)}
      {!isLoading &&
        results &&
        results.comments.map((comment) => {
          const card = cardById[comment.cardId];
          const board = card ? boardById[card.boardId] : null;
          const project = board ? projectById[board.projectId] : null;

          return (
            <button
              key={comment.id}
              type="button"
              className={styles.resultItem}
              onClick={() => handleCardNavigate(comment.cardId)}
            >
              {card && <div className={styles.resultTitle}>{card.name}</div>}
              {(project || board) && (
                <div className={styles.resultPath}>
                  {project && <span>{project.name}</span>}
                  {project && board && <span className={styles.separator}> › </span>}
                  {board && <span>{board.name}</span>}
                </div>
              )}
              <div className={styles.resultSnippet}>
                <Icon name="comment outline" size="small" />
                {comment.text.length > 150
                  ? `${comment.text.substring(0, 150)}…`
                  : comment.text}
              </div>
            </button>
          );
        })}
    </div>
  );

  const panes = [
    {
      menuItem: (
        <Menu.Item key="cards" className={styles.tabItem}>
          {t('common.cards', { context: 'title' })}
          {cardCount > 0 && (
            <Label circular size="mini" className={styles.count}>
              {cardCount}
            </Label>
          )}
        </Menu.Item>
      ),
      render: () => cardsContent,
    },
    {
      menuItem: (
        <Menu.Item key="comments" className={styles.tabItem}>
          {t('common.comments', { context: 'title' })}
          {commentCount > 0 && (
            <Label circular size="mini" className={styles.count}>
              {commentCount}
            </Label>
          )}
        </Menu.Item>
      ),
      render: () => commentsContent,
    },
  ];

  return (
    <ClosableModal
      closeIcon
      size="small"
      centered={false}
      className={styles.wrapper}
      onClose={handleClose}
    >
      <Modal.Content className={styles.modalContent}>
        <div className={styles.searchWrapper}>
          <Icon name="search" className={styles.searchIcon} />
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            className={styles.searchInput}
            placeholder={t('common.searchEverything')}
            value={query}
            onChange={handleQueryChange}
          />
        </div>
        <Tab
          menu={{ secondary: true, pointing: true }}
          panes={panes}
          activeIndex={activeTabIndex}
          onTabChange={handleTabChange}
          className={styles.tabs}
        />
      </Modal.Content>
    </ClosableModal>
  );
});

export default GlobalSearchModal;
