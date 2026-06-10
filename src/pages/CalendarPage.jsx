import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import EventModal from '../components/EventModal';

const NOW = new Date();
const pad = n => String(n).padStart(2, '0');
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function CalendarPage() {
  const { state, t, toast, events: EVENTS, addEvent } = useApp();
  const isAr = state.lang === 'ar';
  const [view, setView] = useState('month');
  const [cursor, setCursor] = useState(new Date(NOW.getFullYear(), NOW.getMonth(), 1));
  const [selected, setSelected] = useState(new Date(NOW));
  const [miniCursor, setMiniCursor] = useState(new Date(NOW.getFullYear(), NOW.getMonth(), 1));
  const [filters, setFilters] = useState({ lecture: true, study: true, exam: true, deadline: true });
  const [modalOpen, setModalOpen] = useState(false);
  const allEvents = EVENTS;

  const fmtTime = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const fmtMonth = d => {
    const monthsAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    if (isAr) return `${monthsAr[d.getMonth()]} ${d.getFullYear()}`;
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };
  const evTitle = e => isAr ? e.titleAr : e.titleEn;
  const eventsOnDay = d => allEvents.filter(e => sameDay(e.start, d) && filters[e.type]);

  const buildMonthGrid = (curs) => {
    const y = curs.getFullYear(), m = curs.getMonth();
    const first = new Date(y, m, 1);
    const startDay = first.getDay();
    const start = new Date(y, m, 1 - startDay);
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return { date, other: date.getMonth() !== m };
    });
  };

  const monthCells = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const miniCells = useMemo(() => buildMonthGrid(miniCursor), [miniCursor]);

  const weekdays = isAr
    ? ['أحد','إثن','ثلا','أرب','خمي','جمع','سبت']
    : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const typeLabels = {
    lecture: t('calendar.type.lecture'),
    study: t('calendar.type.study'),
    exam: t('calendar.type.exam'),
    deadline: t('calendar.type.deadline'),
  };
  const filterColors = { lecture: 'var(--accent)', study: 'var(--info)', exam: 'var(--warning)', deadline: 'var(--danger)' };

  const navPrev = () => {
    if (view === 'week') setCursor(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 7));
    else setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  };
  const navNext = () => {
    if (view === 'week') setCursor(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 7));
    else setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  };
  const navToday = () => {
    setCursor(new Date(NOW.getFullYear(), NOW.getMonth(), 1));
    setMiniCursor(new Date(NOW.getFullYear(), NOW.getMonth(), 1));
    setSelected(new Date(NOW));
  };

  const fmtSideTitle = d => {
    if (isAr) {
      const m = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][d.getMonth()];
      return `${d.getDate()} ${m}`;
    }
    return d.toLocaleString('en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="cal-shell" id="page-calendar">
      <aside className="cal-side">
        <div className="card cal-mini">
          <div className="cal-mini__header">
            <button className="icon-btn" onClick={() => setMiniCursor(new Date(miniCursor.getFullYear(), miniCursor.getMonth() - 1, 1))}>
              <svg width="14" height="14"><use href="#icon-chevron-left"/></svg>
            </button>
            <div className="cal-mini__title">{fmtMonth(miniCursor)}</div>
            <button className="icon-btn" onClick={() => setMiniCursor(new Date(miniCursor.getFullYear(), miniCursor.getMonth() + 1, 1))}>
              <svg width="14" height="14"><use href="#icon-chevron-right"/></svg>
            </button>
          </div>
          <div className="cal-mini__weekdays">
            {weekdays.map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="cal-mini__grid">
            {miniCells.map((c, i) => {
              const evs = eventsOnDay(c.date);
              const cls = `cal-mini__day${c.other ? ' is-other' : ''}${sameDay(c.date, NOW) ? ' is-today' : ''}${sameDay(c.date, selected) ? ' is-selected' : ''}${evs.length ? ' has-events' : ''}`;
              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => {
                    setSelected(c.date);
                    if (view === 'week') setCursor(new Date(c.date));
                    else setCursor(new Date(c.date.getFullYear(), c.date.getMonth(), 1));
                  }}
                >{c.date.getDate()}</button>
              );
            })}
          </div>
        </div>

        <div className="card">
          <header className="card__header"><h3 className="card__title">{t('calendar.filters')}</h3></header>
          <div className="cal-filter-list">
            {Object.keys(filters).map(type => {
              const on = filters[type];
              const cnt = allEvents.filter(e => e.type === type).length;
              return (
                <button
                  key={type}
                  className={`cal-filter${on ? '' : ' is-off'}`}
                  style={{ color: filterColors[type] }}
                  onClick={() => setFilters({ ...filters, [type]: !filters[type] })}
                >
                  <span className="cal-filter__sw"/>
                  <span className="cal-filter__name" style={{ color: 'var(--text-secondary)' }}>{typeLabels[type]}</span>
                  <span className="cal-filter__count">{cnt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card">
          <header className="card__header"><h3 className="card__title">{fmtSideTitle(selected)}</h3></header>
          <div className="cal-side-events" data-empty={t('calendar.side.empty')}>
            {eventsOnDay(selected).map(e => (
              <div key={e.id} className={`cal-side-event cal-side-event--${e.type}`}>
                <div className="cal-side-event__time">{fmtTime(e.start)}</div>
                <div>
                  <div className="cal-side-event__title">{evTitle(e)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="cal-main">
        <div className="cal-toolbar">
          <div className="cal-toolbar__nav">
            <button className="icon-btn" onClick={navPrev}><svg width="14" height="14"><use href="#icon-chevron-left"/></svg></button>
            <button className="btn btn--ghost btn--sm" onClick={navToday}>{t('calendar.today')}</button>
            <button className="icon-btn" onClick={navNext}><svg width="14" height="14"><use href="#icon-chevron-right"/></svg></button>
            <div className="cal-toolbar__title">{fmtMonth(cursor)}</div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
            <div className="cal-view-switch">
              {['month','week','agenda'].map(v => (
                <button key={v} className={view === v ? 'is-active' : ''} onClick={() => setView(v)}>
                  {t(`calendar.${v}`)}
                </button>
              ))}
            </div>
            <button className="btn btn--primary" onClick={() => setModalOpen(true)}>
              <svg width="14" height="14"><use href="#icon-plus"/></svg> {t('calendar.new')}
            </button>
          </div>
        </div>

        <div className="card cal-card">
          {view === 'month' && (
            <>
              <div className="cal-weekdays">{weekdays.map(d => <span key={d}>{d}</span>)}</div>
              <div className="cal-grid">
                {monthCells.map((c, i) => {
                  const evs = eventsOnDay(c.date);
                  const isToday = sameDay(c.date, NOW);
                  const isSel = sameDay(c.date, selected);
                  const visible = evs.slice(0, 3);
                  const more = evs.length - visible.length;
                  return (
                    <div
                      key={i}
                      className={`cal-day${c.other ? ' is-other' : ''}${isToday ? ' is-today' : ''}${isSel ? ' is-selected' : ''}`}
                      onClick={() => setSelected(c.date)}
                    >
                      <span className="cal-day__num">{c.date.getDate()}</span>
                      {visible.map(e => (
                        <div
                          key={e.id}
                          className={`cal-event cal-event--${e.type}`}
                          onClick={(ev) => { ev.stopPropagation(); toast(`${evTitle(e)} · ${fmtTime(e.start)}`, 'info'); }}
                        >
                          <span className="cal-event__time">{fmtTime(e.start)}</span>
                          <span className="cal-event__title">{evTitle(e)}</span>
                        </div>
                      ))}
                      {more > 0 && <span className="cal-day__more">+{more} {t('calendar.more')}</span>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {view === 'agenda' && (
            <div className="cal-agenda">
              {(() => {
                const y = cursor.getFullYear(), m = cursor.getMonth();
                const list = allEvents
                  .filter(e => e.start.getFullYear() === y && e.start.getMonth() === m && filters[e.type])
                  .sort((a, b) => a.start - b.start);
                const groups = {};
                list.forEach(e => {
                  const k = `${e.start.getFullYear()}-${pad(e.start.getMonth() + 1)}-${pad(e.start.getDate())}`;
                  (groups[k] = groups[k] || []).push(e);
                });
                const dayNames = isAr
                  ? ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']
                  : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                const entries = Object.entries(groups);
                if (entries.length === 0) {
                  return <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', padding: 'var(--s-6)' }}>{isAr ? 'لا أحداث في هذا الشهر' : 'No events this month'}</div>;
                }
                return entries.map(([k, evs]) => {
                  const d = new Date(k + 'T00:00:00');
                  const isToday = sameDay(d, NOW);
                  return (
                    <div key={k} className="cal-agenda__day">
                      <div className={`cal-agenda__date${isToday ? ' is-today' : ''}`}>
                        <div className="cal-agenda__date-num">{d.getDate()}</div>
                        <div className="cal-agenda__date-day">{dayNames[d.getDay()]}</div>
                      </div>
                      <div className="cal-agenda__events">
                        {evs.map(e => (
                          <div
                            key={e.id}
                            className={`cal-agenda__event cal-agenda__event--${e.type}`}
                            onClick={() => toast(`${evTitle(e)} · ${fmtTime(e.start)}`, 'info')}
                          >
                            <div className="cal-agenda__event-time">{fmtTime(e.start)}-{fmtTime(e.end)}</div>
                            <div>
                              <div className="cal-agenda__event-title">{evTitle(e)}</div>
                            </div>
                            <span className={`tag tag--${e.type}`}>{typeLabels[e.type]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {view === 'week' && (
            <div className="cal-week">
              <div className="cal-week__time-col">
                <div className="cal-week__day-head" style={{ visibility: 'hidden' }}>·</div>
                {Array.from({ length: 15 }, (_, i) => i + 8).map(h => (
                  <div key={h} className="cal-week__hour">{pad(h)}:00</div>
                ))}
              </div>
              {(() => {
                const start = new Date(cursor);
                start.setDate(cursor.getDate() - start.getDay());
                return Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(start);
                  d.setDate(start.getDate() + i);
                  const isToday = sameDay(d, NOW);
                  const evs = allEvents.filter(e => sameDay(e.start, d) && filters[e.type] && e.type !== 'deadline');
                  return (
                    <div key={i} className="cal-week__day-col">
                      <div className={`cal-week__day-head${isToday ? ' is-today' : ''}`}>
                        <div className="day-name">{weekdays[i]}</div>
                        <div className="day-num">{d.getDate()}</div>
                      </div>
                      <div className="cal-week__slots">
                        {Array.from({ length: 15 }, (_, j) => <div key={j} className="cal-week__slot"/>)}
                        {evs.map(e => {
                          const sh = e.start.getHours() + e.start.getMinutes() / 60;
                          const dur = (e.end - e.start) / 3600000;
                          if (sh < 8) return null;
                          const top = (sh - 8) * 56;
                          const height = Math.max(28, dur * 56 - 4);
                          return (
                            <div
                              key={e.id}
                              className={`cal-week__event cal-week__event--${e.type}`}
                              style={{ top: `${top}px`, height: `${height}px` }}
                              onClick={() => toast(`${evTitle(e)} · ${fmtTime(e.start)}-${fmtTime(e.end)}`, 'info')}
                            >
                              <span className="cal-week__event-time">{fmtTime(e.start)}-{fmtTime(e.end)}</span>
                              {evTitle(e)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </main>
      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={selected}
        onSave={async (ev) => {
          try {
            await addEvent(ev);
            toast(t('calendar.event.added'), 'success');
          } catch (err) {
            toast(err.message || 'Failed to save event', 'warning');
          }
        }}
      />
    </div>
  );
}
