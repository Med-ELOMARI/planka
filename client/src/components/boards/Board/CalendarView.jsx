

import React, { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { getColorFromFirstLetter } from '../../../utils/colors';
import selectors from '../../../selectors';
import { push } from '../../../lib/redux-router';
import Paths from '../../../constants/Paths';

import styles from './CalendarView.module.scss';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const eventStyleGetter = (event) => {
  const style = {
    backgroundColor: getColorFromFirstLetter(event.title),
    borderRadius: '3px',
    border: 'none',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 500,
    padding: '2px 6px',
    cursor: 'pointer',
  };

  if (event.isClosed) {
    style.filter = 'saturate(0.5)';
    style.opacity = 0.64;
  }

  return { style };
};

const EventComponent = ({ event }) => (
  <span
    style={{
      textDecoration: event.isClosed ? 'line-through' : 'none',
    }}
  >
    {event.title}
  </span>
);

const CalendarView = React.memo(() => {
  const cards = useSelector(selectors.selectCalendarCardsForCurrentBoard);
  const dispatch = useDispatch();

  const events = useMemo(
    () =>
      cards.map((card) => ({
        id: card.id,
        title: card.name,
        start: new Date(card.createdAt),
        end: card.dueDate ? new Date(card.dueDate) : new Date(),
        allDay: true,
        isClosed: card.isClosed,
      })),
    [cards],
  );

  const handleSelectEvent = useCallback(
    (event) => {
      dispatch(push(Paths.CARDS.replace(':id', event.id)));
    },
    [dispatch],
  );

  return (
    <div className={styles.wrapper}>
      <Calendar
        localizer={localizer}
        events={events}
        defaultView={Views.MONTH}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        onSelectEvent={handleSelectEvent}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventStyleGetter}
        components={{ event: EventComponent }}
        style={{ height: '100%' }}
      />
    </div>
  );
});

export default CalendarView;
