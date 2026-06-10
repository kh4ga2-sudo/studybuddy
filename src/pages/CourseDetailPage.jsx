import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import MaterialsTab from './materials/MaterialsTab';
import * as api from '../api';

export default function CourseDetailPage() {
  const { state, t, setView, setState, courses: COURSES, majors: MAJORS } = useApp();
  const isAr = state.lang === 'ar';
  const courses = Array.isArray(COURSES) ? COURSES : [];
  const majors = Array.isArray(MAJORS) ? MAJORS : [];
  const course = courses.find(c => c.id === state.selectedCourseId) || null;
  const major = course ? majors.find(m => m.id === course.majorId) || null : null;
  const tab = state.detailTab || 'overview';

  const setTab = (newTab) => setState(p => ({...p, detailTab: newTab}));
  const goBack = () => setView(state.courseDetailFrom === 'major' ? 'major-detail' : 'courses');

  if (!course) {
    return (
      <div id="page-course-detail">
        <button className="major-hero__back" onClick={goBack}>
          <svg width="12" height="12"><use href="#icon-arrow-left"/></svg>
          {t('course.back')}
        </button>

        <div className="empty-state">
          <svg><use href="#icon-inbox"/></svg>
          <p>{isAr ? 'المقرر غير موجود' : 'Course not found'}</p>
        </div>
      </div>
    );
  }

  const courseCode = course.code || '-';
  const courseName = (isAr ? course.nameAr : course.nameEn) || course.nameEn || course.nameAr || courseCode;
  const instructorName = course.instructor || 'TBA';
  const progressValue = Number.isFinite(Number(course.progress)) ? Math.max(0, Math.min(100, Number(course.progress))) : 0;
  const creditsValue = course.credits ?? '-';

  return (
    <div id="page-course-detail">
      <button className="major-hero__back" onClick={goBack}>
        <svg width="12" height="12"><use href="#icon-arrow-left"/></svg>
        {t('course.back')}
      </button>

      <div className="course-detail-hero">
        <div className="course-detail-hero__head">
          <div>
            <div className="course-detail-hero__code mono">{courseCode}</div>
            <h2 className="course-detail-hero__name">{courseName}</h2>
            <div className="course-detail-hero__instr">
              <svg width="14" height="14"><use href="#icon-user"/></svg>
              {instructorName}
            </div>
          </div>
          <div className="course-detail-hero__meta">
            <div className="course-detail-hero__stat">
              <div className="lbl">{t('courses.progress')}</div>
              <div className="val mono">{progressValue}%</div>
            </div>
            <div className="course-detail-hero__stat">
              <div className="lbl">{t('courses.grade')}</div>
              <div className="val mono">{course.grade || '-'}</div>
            </div>
            <div className="course-detail-hero__stat">
              <div className="lbl">{t('courses.credits')}</div>
              <div className="val mono">{creditsValue}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="course-tabs">
        {['overview', 'materials', 'notes', 'chat', 'resources'].map(tk => (
          <button
            key={tk}
            className={`course-tab${tab === tk ? ' is-active' : ''}`}
            onClick={() => setTab(tk)}
          >
            {t(`course.tab.${tk}`)}
          </button>
        ))}
      </div>

      <div className="course-tab-content">
        {tab === 'overview' && <OverviewTab course={course} major={major} t={t} isAr={isAr} instructorName={instructorName} progressValue={progressValue}/>}
        {tab === 'materials' && <MaterialsTab course={course}/>}
        {tab === 'notes' && <NotesTab course={course} isAr={isAr}/>}
        {tab === 'chat' && <ChatTab course={course} isAr={isAr}/>}
        {tab === 'resources' && <ResourcesTab course={course} isAr={isAr}/>}
      </div>
    </div>
  );
}

function getInitials(name) {
  return String(name || 'TBA')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0])
    .slice(-2)
    .join('') || 'TB';
}

function OverviewTab({ course, major, t, isAr, instructorName, progressValue }) {
  const majorLabel = major ? ((isAr ? major.nameAr : major.nameEn) || major.nameEn || major.nameAr) : (course.majorId || (isAr ? 'التخصص غير متوفر' : 'Major unavailable'));

  return (
    <div className="overview-grid">
      <section className="card">
        <h3 className="card__title">{t('course.overview.instructor')}</h3>
        <div className="instructor-card">
          <div className="instructor-card__avatar">{getInitials(instructorName)}</div>
          <div>
            <div className="instructor-card__name">{instructorName}</div>
            <div className="instructor-card__meta">{majorLabel}</div>
          </div>
        </div>
      </section>
      <section className="card">
        <h3 className="card__title">{t('course.overview.schedule')}</h3>
        <ul className="syllabus-list">
          <li><span>{isAr ? 'الأحد' : 'Sunday'}</span><span className="mono">10:00 - 11:30</span></li>
          <li><span>{isAr ? 'الثلاثاء' : 'Tuesday'}</span><span className="mono">10:00 - 11:30</span></li>
        </ul>
      </section>
      <section className="card">
        <h3 className="card__title">{t('course.overview.progress')}</h3>
        <div className="progress-detail">
          <div className="progress-bar"><span style={{width:`${progressValue}%`}}/></div>
          <div className="progress-detail__label">{progressValue}% {isAr ? 'مكتمل' : 'completed'}</div>
        </div>
      </section>
      <section className="card" style={{gridColumn:'1 / -1'}}>
        <h3 className="card__title">{t('course.overview.syllabus')}</h3>
        <ul className="syllabus-list">
          {[1,2,3,4,5,6].map(w => (
            <li key={w}>
              <span>{isAr ? `الأسبوع ${w}` : `Week ${w}`}</span>
              <span>{['Introduction','Core Concepts','Methods','Practical','Advanced','Review'][w-1]}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ChatTab({ course, isAr }) {
  const { user, toast } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const messagesEndRef = useRef(null);
  const fileRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const data = await api.getChat(course.id);
      setMessages(data.map(m => ({
        id: m.id,
        author: m.author_initials,
        authorName: m.author_name,
        text: m.text,
        time: m.created_at ? new Date(m.created_at).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'now',
        isMe: user?.id ? m.user_id === user.id : false
      })));
    } catch (err) {
      console.warn('Failed to fetch chat messages', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [course.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const body = input.trim();
    if (!body && !attachmentName) return;

    const finalText = attachmentName
      ? `${body || (isAr ? 'مرفق ملف' : 'File attached')} (${attachmentName})`
      : body;

    try {
      await api.sendChat(course.id, finalText);
      setInput('');
      setAttachmentName('');
      await fetchMessages();
    } catch (err) {
      toast(err.message || 'Failed to send message', 'warning');
    }
  };

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentName(file.name);
    toast(isAr ? 'تم اختيار الملف، اضغط إرسال لمشاركته في المحادثة' : 'File selected. Press send to share it in the chat.', 'info');
    e.target.value = '';
  };

  return (
    <div className="card chat chat--group">
      <header className="chat__group-header">
        <div className="chat__group-info">
          <div className="chat__group-icon"><svg width="16" height="16"><use href="#icon-message-circle"/></svg></div>
          <div className="chat__group-meta">
            <div className="chat__group-title">{course.code} {isAr ? 'مجموعة المادة' : 'Course Group'}</div>
            <div className="chat__group-sub">
              <span>{isAr ? '28 عضو' : '28 members'}</span>
              <span className="chat__group-sep">·</span>
              <span className="chat__group-online"><span className="chat__group-online-dot"></span>{isAr ? '5 متصلين' : '5 online'}</span>
            </div>
          </div>
        </div>
        <div className="chat__group-avatars">
          {['AK','SM','YH','LF'].map(a => <div key={a} className="chat__group-av">{a}</div>)}
          <div className="chat__group-av chat__group-av--more">+24</div>
        </div>
      </header>
      <div className="chat__messages">
        <div className="chat__day-divider"><span>{isAr ? 'اليوم' : 'Today'}</span></div>
        {messages.map(m => (
          <div key={m.id} className={`chat__msg${m.isMe ? ' chat__msg--user chat__msg--me' : ''}`}>
            <div className="chat__msg-avatar">{m.author}</div>
            <div className="chat__msg-body">
              <div className="chat__msg-meta">{m.authorName} · {m.time}</div>
              <div className="chat__msg-bubble">{m.text}</div>
            </div>
          </div>
        ))}
        {!messages.length && (
          <div className="chat__empty">
            {isAr ? 'ابدأ محادثة المادة مع زملائك.' : 'Start the course discussion with your classmates.'}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {attachmentName && (
        <div className="chat__attachment-chip">
          <svg width="14" height="14"><use href="#icon-paperclip"/></svg>
          <span>{attachmentName}</span>
          <button type="button" onClick={() => setAttachmentName('')}>×</button>
        </div>
      )}
      <div className="chat__composer chat__composer--large">
        <input ref={fileRef} type="file" hidden onChange={pickFile} />
        <button type="button" className="icon-btn chat__attach-btn" onClick={() => fileRef.current?.click()} aria-label={isAr ? 'إرفاق ملف' : 'Attach file'}>
          <svg width="18" height="18"><use href="#icon-paperclip"/></svg>
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) send(); }}
          placeholder={isAr ? 'اكتب رسالة للمجموعة...' : 'Type a message to the group...'}
          aria-label={isAr ? 'رسالة المجموعة' : 'Group message'}
        />
        <button type="button" className="btn btn--primary chat__send-btn" onClick={send}>
          <svg width="16" height="16"><use href="#icon-send"/></svg>
          <span>{isAr ? 'إرسال' : 'Send'}</span>
        </button>
      </div>
    </div>
  );
}

function NotesTab({ course, isAr }) {
  const { toast } = useApp();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const load = async () => {
    try { setNotes(await api.getNotes(course.id)); }
    catch { setNotes([]); }
  };

  useEffect(() => { load(); }, [course.id]);

  const add = async () => {
    if (!title.trim()) return;
    try {
      await api.createNote({ course_id: course.id, title, body });
      setTitle(''); setBody(''); await load();
    } catch (err) { toast(err.message || 'Failed to save note', 'warning'); }
  };

  return (
    <div className="card">
      <h3 className="card__title">{isAr ? 'الملاحظات' : 'Notes'}</h3>
      <div className="chat__composer" style={{ marginBottom: 'var(--s-3)' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder={isAr ? 'عنوان الملاحظة' : 'Note title'} />
        <button className="btn btn--primary btn--sm" onClick={add}>{isAr ? 'حفظ' : 'Save'}</button>
      </div>
      <textarea
        className="input"
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={isAr ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
        rows={3}
        style={{ width: '100%', marginBottom: 'var(--s-3)' }}
      />
      <div className="file-list">
        {notes.map(n => (
          <div key={n.id} className="file-row">
            <div className="file-row__icon"><svg width="16" height="16"><use href="#icon-file-text"/></svg></div>
            <div className="file-row__main">
              <strong>{n.title}</strong>
              <div style={{ color: 'var(--muted)', marginTop: 4 }}>{n.body}</div>
            </div>
          </div>
        ))}
        {!notes.length && <div className="empty-state">{isAr ? 'لا توجد ملاحظات بعد' : 'No notes yet'}</div>}
      </div>
    </div>
  );
}

function ResourcesTab({ course, isAr }) {
  const fallback = [
    { icon: 'link', titleEn: 'Course Website', titleAr: 'موقع المقرر', url: 'https://elearning.uqu.edu.sa' },
    { icon: 'file-text', titleEn: 'Recommended Textbook', titleAr: 'الكتاب الموصى به', url: 'https://www.uqu.edu.sa' },
    { icon: 'video', titleEn: 'Recorded Lectures', titleAr: 'المحاضرات المسجلة', url: 'https://www.youtube.com/results?search_query=university+lecture' },
    { icon: 'globe', titleEn: 'External Resources', titleAr: 'موارد خارجية', url: 'https://scholar.google.com' },
  ];
  const [resources, setResources] = useState(fallback);

  useEffect(() => {
    let ignore = false;
    api.getResources(course.id)
      .then(rows => {
        if (ignore || !Array.isArray(rows) || !rows.length) return;
        setResources(rows.map(r => ({
          icon: r.type === 'book' ? 'file-text' : r.type === 'video' ? 'video' : 'link',
          titleEn: r.title_en,
          titleAr: r.title_ar || r.title_en,
          url: r.url || '',
        })));
      })
      .catch(() => setResources(fallback));
    return () => { ignore = true; };
  }, [course.id]);

  return (
    <div className="card">
      <h3 className="card__title">{isAr ? 'الموارد' : 'Resources'}</h3>
      <div className="file-list">
        {resources.map((r, i) => (
          r.url ? (
            <a key={i} className="file-row" href={r.url} target="_blank" rel="noreferrer">
              <div className="file-row__icon"><svg width="16" height="16"><use href={`#icon-${r.icon}`}/></svg></div>
              <div className="file-row__main">{isAr ? r.titleAr : r.titleEn}</div>
              <svg width="14" height="14"><use href="#icon-external-link"/></svg>
            </a>
          ) : (
            <div key={i} className="file-row" aria-disabled="true">
              <div className="file-row__icon"><svg width="16" height="16"><use href={`#icon-${r.icon}`}/></svg></div>
              <div className="file-row__main">{isAr ? r.titleAr : r.titleEn}</div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
