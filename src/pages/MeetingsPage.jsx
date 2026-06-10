import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import EventModal from '../components/EventModal';
import * as api from '../api';

export default function MeetingsPage() {
  const { state, t, toast, events: EVENTS, courses: COURSES, rooms: ROOMS, invites: INVITES, addEvent } = useApp();
  const isAr = state.lang === 'ar';
  const [view, setView] = useState('list'); // 'list' | 'timeline'
  const [modalOpen, setModalOpen] = useState(false);
  const allEvents = EVENTS;

  const NOW = new Date();
  const upcoming = allEvents
    .filter(e => e.start > NOW && e.type !== 'deadline')
    .sort((a,b) => a.start - b.start);
  const past = allEvents
    .filter(e => e.end < NOW && e.type !== 'deadline')
    .sort((a,b) => b.start - a.start)
    .slice(0, 3);
  const live = allEvents.filter(e => e.start <= NOW && e.end >= NOW && e.type !== 'deadline');
  const next = upcoming[0];

  const stats = [
    { label: t('meetings.stat.total'), value: allEvents.filter(e => e.type !== 'deadline').length, icon: 'video' },
    { label: t('meetings.stat.upcoming'), value: upcoming.length, icon: 'clock' },
    { label: t('meetings.stat.completed'), value: past.length + allEvents.filter(e => e.end < NOW && e.type !== 'deadline').length, icon: 'check-circle' },
    { label: t('meetings.stat.hours'), value: '18h', icon: 'trending-up' },
  ];

  const evTitle = e => isAr ? e.titleAr : e.titleEn;
  const fmtTime = d => d.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const fmtDate = d => `${d.getDate()} ${isAr ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][d.getMonth()] : d.toLocaleString('en-US',{month:'short'})}`;
  const courseCode = id => COURSES.find(c => c.id === id)?.code || '';

  return (
    <>
      <div className="page__header">
        <div>
          <h2 className="page__title">{t('meetings.title')}</h2>
          <p className="page__sub">{upcoming.length} {t('meetings.stat.upcoming').toLowerCase()}</p>
        </div>
        <div style={{display:'flex',gap:'var(--s-2)'}}>
          <div className="meet-view-switch">
            <button className={view==='list' ? 'is-active' : ''} onClick={() => setView('list')}>{isAr ? 'قائمة' : 'List'}</button>
            <button className={view==='timeline' ? 'is-active' : ''} onClick={() => setView('timeline')}>{t('meetings.timeline')}</button>
          </div>
          <button className="btn btn--primary" onClick={() => setModalOpen(true)}><svg width="14" height="14"><use href="#icon-plus"/></svg> {t('meetings.new')}</button>
        </div>
      </div>

      <div className="meet-stats">
        {stats.map((s,i) => (
          <div key={i} className="meet-stat">
            <div className="meet-stat__label"><svg><use href={`#icon-${s.icon}`}/></svg>{s.label}</div>
            <div className="meet-stat__value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2-1">
        <div>
          {view === 'list' ? (
            <>
              {live.length > 0 && (
                <div className="meet-section">
                  <div className="meet-section__header"><span className="meet-section__dot"/><div className="meet-section__title">{t('meetings.live')}</div></div>
                  <div className="meet-list">
                    {live.map(e => <MeetCard key={e.id} ev={e} live evTitle={evTitle} fmtTime={fmtTime} fmtDate={fmtDate} courseCode={courseCode} isAr={isAr} t={t} toast={toast}/>)}
                  </div>
                </div>
              )}
              <div className="meet-section">
                <div className="meet-section__header"><div className="meet-section__title">{t('meetings.upcoming')}</div></div>
                <div className="meet-list">
                  {upcoming.slice(0,5).map(e => <MeetCard key={e.id} ev={e} evTitle={evTitle} fmtTime={fmtTime} fmtDate={fmtDate} courseCode={courseCode} isAr={isAr} t={t} toast={toast}/>)}
                </div>
              </div>
              <div className="meet-section">
                <div className="meet-section__header"><div className="meet-section__title">{t('meetings.past')}</div></div>
                <div className="meet-list">
                  {past.map(e => <MeetCard key={e.id} ev={e} past evTitle={evTitle} fmtTime={fmtTime} fmtDate={fmtDate} courseCode={courseCode} isAr={isAr} t={t} toast={toast}/>)}
                </div>
              </div>
            </>
          ) : (
            <TimelineView events={allEvents} evTitle={evTitle} fmtTime={fmtTime} isAr={isAr} t={t} toast={toast}/>
          )}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'var(--s-4)'}}>
          {next && <NextMeetingCard next={next} evTitle={evTitle} fmtTime={fmtTime} t={t} isAr={isAr} toast={toast}/>}
          <RoomsCard rooms={ROOMS} isAr={isAr} t={t}/>
          <InvitesCard invites={INVITES} isAr={isAr} t={t} toast={toast}/>
        </div>
      </div>
      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode="meeting"
        onSave={async (ev) => {
          try {
            await addEvent(ev);
            toast(t('calendar.event.added'), 'success');
          } catch (err) {
            toast(err.message || 'Failed to save event', 'warning');
          }
        }}
      />
    </>
  );
}

function MeetCard({ ev, live, past, evTitle, fmtTime, fmtDate, courseCode, isAr, t, toast }) {
  const join = () => {
    if (ev.link) window.open(ev.link, '_blank', 'noopener,noreferrer');
    else toast(isAr ? 'لا يوجد رابط لهذا الاجتماع' : 'No meeting link is available', 'warning');
  };
  const viewRecording = () => toast(isAr ? 'سيتم ربط تسجيل الاجتماع لاحقاً' : 'Meeting recording will be linked later', 'info');
  const cls = `meet-card${live ? ' meet-card--live' : ''}${past ? ' meet-card--past' : ''}`;
  return (
    <div className={cls}>
      <div className="meet-card__when">
        <div className="meet-card__time">{fmtTime(ev.start)}</div>
        <div className="meet-card__date">{fmtDate(ev.start)}</div>
      </div>
      <div className="meet-card__main">
        <div className="meet-card__title">
          {evTitle(ev)}
          {live && <span className="tag tag--live">{t('meetings.live')}</span>}
          {courseCode(ev.courseId) && <span className={`tag tag--${ev.type}`}>{courseCode(ev.courseId)}</span>}
        </div>
        <div className="meet-card__meta">
          <span className="meet-card__meta-item"><svg><use href="#icon-user"/></svg>{isAr ? ev.host : ev.hostEn}</span>
          {ev.attendeesCount > 0 && <span className="meet-card__meta-item"><svg><use href="#icon-users"/></svg>{ev.attendeesCount}</span>}
          {ev.link && <a href={ev.link} className="meet-card__link">{ev.link.replace('https://','')}</a>}
        </div>
        {ev.attendees && ev.attendees.length > 0 && (
          <div className="meet-card__attendees">
            <div className="meet-avatar-stack">
              {ev.attendees.slice(0,4).map((a,i) => <div key={i} className="meet-avatar">{a}</div>)}
            </div>
            {ev.attendeesCount > 4 && <span className="meet-attendees__count">+{ev.attendeesCount - 4}</span>}
          </div>
        )}
      </div>
      <div className="meet-card__actions">
        {!past && <button type="button" className="btn btn--primary btn--sm" onClick={join}>{t('meetings.join')}</button>}
        {past && <button type="button" className="btn btn--ghost btn--sm" onClick={viewRecording}>{t('meetings.view')}</button>}
      </div>
    </div>
  );
}

function NextMeetingCard({ next, evTitle, fmtTime, t, isAr, toast }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, next.start - time);
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <div className="card">
      <header className="card__header"><h3 className="card__title">{t('meetings.next.title')}</h3></header>
      <div className="meet-next">
        <div className="meet-next__title">{evTitle(next)}</div>
        <div className="meet-next__when">
          <svg><use href="#icon-clock"/></svg>
          {fmtTime(next.start)} - {fmtTime(next.end)}
        </div>
        <div className="meet-next__countdown">
          {days > 0 && (
            <div className="meet-next__cd-cell">
              <div className="meet-next__cd-val">{String(days).padStart(2,'0')}</div>
              <div className="meet-next__cd-lbl">{t('meetings.countdown.d')}</div>
            </div>
          )}
          <div className="meet-next__cd-cell">
            <div className="meet-next__cd-val">{String(hrs).padStart(2,'0')}</div>
            <div className="meet-next__cd-lbl">{t('meetings.countdown.h')}</div>
          </div>
          <div className="meet-next__cd-cell">
            <div className="meet-next__cd-val">{String(mins).padStart(2,'0')}</div>
            <div className="meet-next__cd-lbl">{t('meetings.countdown.m')}</div>
          </div>
          <div className="meet-next__cd-cell">
            <div className="meet-next__cd-val">{String(secs).padStart(2,'0')}</div>
            <div className="meet-next__cd-lbl">{t('meetings.countdown.s')}</div>
          </div>
        </div>
        <div className="meet-next__actions">
          <button className="btn btn--primary btn--block" onClick={() => {
            if (next.link) window.open(next.link, '_blank', 'noopener,noreferrer');
            toast(isAr ? 'تم فتح رابط الاجتماع' : 'Meeting link opened', 'success');
          }}>{t('meetings.next.join')}</button>
        </div>
      </div>
    </div>
  );
}

function RoomsCard({ rooms: ROOMS, isAr, t }) {
  return (
    <div className="card">
      <header className="card__header"><h3 className="card__title">{t('meetings.rooms')}</h3></header>
      <div className="meet-room-list">
        {ROOMS.map(r => (
          <div key={r.id} className={`meet-room${r.status==='busy' ? ' meet-room--busy' : ''}${r.status==='full' ? ' meet-room--full' : ''}`}>
            <div className="meet-room__avatar">{r.code.split('-')[0]}</div>
            <div>
              <div className="meet-room__name">{isAr ? r.nameAr : r.nameEn}</div>
              <div className="meet-room__meta">{r.code} · {r.current}/{r.capacity}</div>
            </div>
            <div className="meet-room__indicator">
              <span className="meet-room__indicator-dot"/>
              {t(`meetings.room.${r.status}`)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineView({ events, evTitle, fmtTime, isAr, t, toast }) {
  const NOW = new Date();
  const todayEvents = events
    .filter(e => e.start.getFullYear() === NOW.getFullYear() &&
                 e.start.getMonth() === NOW.getMonth() &&
                 e.start.getDate() === NOW.getDate())
    .sort((a, b) => a.start - b.start);

  const startHour = 8;
  const endHour = 22;
  const hours = [];
  for (let h = startHour; h <= endHour; h++) hours.push(h);
  const hourHeight = 56;

  const typeLabel = (type) => t(`calendar.type.${type}`) || type;

  return (
    <div className="card meet-timeline-card">
      <header className="card__header">
        <div>
          <h3 className="card__title">{t('meetings.timeline')}</h3>
          <p className="card__sub" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
            {isAr ? 'أحداث اليوم' : "Today's events"}
          </p>
        </div>
      </header>
      <div className="meet-timeline">
        {hours.map((h, i) => (
          <div key={`h${h}`} className="meet-timeline__hour" style={{ gridRow: i + 1, gridColumn: 1 }}>
            {String(h).padStart(2,'0')}:00
          </div>
        ))}
        <div style={{ gridColumn: 2, gridRow: `1 / ${hours.length + 1}`, position: 'relative' }}>
          {hours.map((h, i) => (
            <div key={`slot${h}`} className="meet-timeline__slot" style={{ height: hourHeight }} />
          ))}
          {todayEvents.map(ev => {
            const sh = ev.start.getHours() + ev.start.getMinutes() / 60;
            const dur = Math.max(0.5, (ev.end - ev.start) / 3600000);
            if (sh < startHour || sh > endHour) return null;
            const top = (sh - startHour) * hourHeight;
            const height = Math.max(28, dur * hourHeight - 4);
            return (
              <div
                key={ev.id}
                className={`meet-timeline__event meet-timeline__event--${ev.type}`}
                style={{ top: `${top}px`, height: `${height}px` }}
                onClick={() => toast(`${evTitle(ev)} · ${fmtTime(ev.start)}`, 'info')}
              >
                <div className="meet-timeline__event-title">{evTitle(ev)}</div>
                <div className="meet-timeline__event-meta">{fmtTime(ev.start)} - {fmtTime(ev.end)} · {typeLabel(ev.type)}</div>
              </div>
            );
          })}
        </div>
      </div>
      {todayEvents.length === 0 && (
        <div className="empty-state" style={{ padding: 'var(--s-4)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>
          {isAr ? 'لا أحداث اليوم' : 'No events today'}
        </div>
      )}
    </div>
  );
}

function InvitesCard({ invites: INVITES, isAr, t, toast }) {
  const [items, setItems] = useState(INVITES);

  useEffect(() => {
    setItems(INVITES);
  }, [INVITES]);

  const respond = async (id, accepted) => {
    try {
      await api.respondInvite(id, accepted ? 'accepted' : 'declined');
      setItems(items.filter(i => i.id !== id));
      toast(accepted ? (isAr ? 'تم القبول' : 'Accepted') : (isAr ? 'تم الرفض' : 'Declined'), accepted ? 'success' : 'info');
    } catch (err) {
      toast(err.message || (isAr ? 'تعذر تحديث الدعوة' : 'Failed to update invitation'), 'warning');
    }
  };
  return (
    <div className="card">
      <header className="card__header"><h3 className="card__title">{t('meetings.invites')}</h3></header>
      <div className="meet-invite-list">
        {items.map(inv => (
          <div key={inv.id} className="meet-invite">
            <div className="meet-invite__title"><svg width="14" height="14"><use href="#icon-inbox"/></svg>{isAr ? inv.titleAr : inv.titleEn}</div>
            <div className="meet-invite__from">{isAr ? 'من' : 'From'}: {isAr ? inv.fromAr : inv.fromEn}</div>
            <div className="meet-invite__actions">
              <button className="btn btn--primary btn--sm" onClick={() => respond(inv.id, true)}>{t('meetings.accept')}</button>
              <button className="btn btn--ghost btn--sm" onClick={() => respond(inv.id, false)}>{t('meetings.decline')}</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="empty-state" style={{padding:'var(--s-4)'}}>{isAr ? 'لا توجد دعوات' : 'No invitations'}</div>}
      </div>
    </div>
  );
}
