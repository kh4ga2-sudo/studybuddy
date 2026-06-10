import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../api';

const fmtTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

export default function AIPage() {
  const { state, t, toast, courses: COURSES, profile: PROFILE } = useApp();
  const isAr = state.lang === 'ar';
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('chat');
  const [typing, setTyping] = useState(false);
  const [activeConvId, setActiveConvId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [attachment, setAttachment] = useState(null);
  
  const bodyRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleCourseClick = async (courseId) => {
    const isSelecting = selectedCourseId !== courseId;
    setSelectedCourseId(isSelecting ? courseId : null);
    
    if (isSelecting) {
      const targetCourse = COURSES.find(c => c.id === courseId);
      if (targetCourse) {
        const courseName = isAr ? targetCourse.nameAr : targetCourse.nameEn;
        toast(
          isAr 
            ? `تم تفعيل سياق المساق: ${courseName}` 
            : `Course context activated: ${courseName}`,
          'success'
        );
      }
    }
  };

  // Auto-scroll messages
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, typing]);

  // Load conversations list
  const loadConversations = async () => {
    try {
      const data = await api.getAIConversations();
      setConversations(data);
    } catch (err) {
      console.warn('Failed to load AI conversations', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages for active conversation
  useEffect(() => {
    if (activeConvId) {
      api.getAIMessages(activeConvId)
        .then(data => {
          setMessages(data.map(m => ({
            id: m.id,
            role: m.role,
            text: m.text,
            time: m.created_at ? new Date(m.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : fmtTime(),
            fileName: m.file_name,
            fileType: m.file_type,
            fileData: m.file_data,
          })));
        })
        .catch(err => {
          console.warn('Failed to load AI messages', err);
        });
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  const newConv = () => {
    setActiveConvId(null);
    setMessages([]);
    setAttachment(null);
  };

  const deleteConv = async (e, convId) => {
    e.stopPropagation();
    try {
      await api.deleteAIConversation(convId);
      toast(isAr ? 'تم حذف المحادثة' : 'Conversation deleted', 'success');
      if (activeConvId === convId) {
        newConv();
      }
      await loadConversations();
    } catch (err) {
      toast(err.message || 'Failed to delete conversation', 'warning');
    }
  };

  const sendMessage = async (text, customMode = null) => {
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;

    let currentConvId = activeConvId;
    setTyping(true);

    try {
      // 1. If no active conversation, create one first
      if (!currentConvId) {
        const titleText = trimmed || (attachment ? attachment.name : 'New File Upload');
        const title = titleText.slice(0, 30) + (titleText.length > 30 ? '...' : '');
        const newConvRes = await api.createAIConversation(title);
        currentConvId = newConvRes.id;
        setActiveConvId(currentConvId);
      }

      // 2. Send the message to the backend
      await api.sendAIMessage(currentConvId, 'user', trimmed, attachment, customMode || mode, selectedCourseId);
      
      // 3. Reset inputs
      setInput('');
      setAttachment(null);

      // 4. Reload conversations list to update title/timestamp if needed
      await loadConversations();

      // 5. Reload messages
      const msgs = await api.getAIMessages(currentConvId);
      setMessages(msgs.map(m => ({
        id: m.id,
        role: m.role,
        text: m.text,
        time: m.created_at ? new Date(m.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : fmtTime(),
        fileName: m.file_name,
        fileType: m.file_type,
        fileData: m.file_data,
      })));
    } catch (err) {
      if (!err?.isAuthError) toast(err.message || 'Failed to send message', 'warning');
    } finally {
      setTyping(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        data: reader.result
      });
      toast(isAr ? 'تم إرفاق الملف بنجاح' : 'File attached successfully', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset file input
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const suggests = [
    { key: 'explain', icon: 'book', prompt: isAr ? 'اشرح مفهوم المنح في UX' : 'Explain the concept of affordances in UX' },
    { key: 'quiz', icon: 'edit-2', prompt: isAr ? 'اختبرني في مفاهيم HCI' : 'Quiz me on HCI concepts' },
    { key: 'plan', icon: 'calendar', prompt: isAr ? 'أنشئ خطة دراسة للامتحانات' : 'Create a study plan for finals' },
    { key: 'summary', icon: 'file-text', prompt: isAr ? 'لخّص ملاحظاتي في HCI' : 'Summarize my HCI notes' },
  ];

  const copyMsg = (text) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    toast(isAr ? 'تم النسخ' : 'Copied', 'success');
  };

  return (
    <div className="ai-shell">
      <aside className="ai-rail">
        <button className="btn btn--primary btn--block" onClick={newConv}>
          <svg width="14" height="14"><use href="#icon-plus"/></svg> {t('ai.new')}
        </button>
        <div className="ai-rail__search">
          <svg><use href="#icon-search"/></svg>
          <input placeholder={t('ai.search')}/>
        </div>
        <div className="ai-rail__group">
          <div className="ai-rail__group-label">{t('ai.today')}</div>
          {conversations.length === 0 ? (
            <div className="ai-context__row" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
              {isAr ? 'لا توجد محادثات سابقة' : 'No previous chats'}
            </div>
          ) : (
            conversations.map(item => (
              <button
                key={item.id}
                className={`ai-conv-item${activeConvId === item.id ? ' is-active' : ''}`}
                onClick={() => setActiveConvId(item.id)}
              >
                <div className="ai-conv-item__title">{item.title}</div>
                <div className="ai-conv-item__time-row">
                  <span className="ai-conv-item__time">
                    {item.created_at ? new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                  </span>
                  <span className="ai-conv-item__delete" onClick={(e) => deleteConv(e, item.id)}>
                    <svg width="12" height="12"><use href="#icon-trash-2"/></svg>
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
        <div className="ai-rail__group">
          <div className="ai-rail__group-label">{t('ai.context')}</div>
          <div className="ai-context">
            {COURSES.slice(0, 4).map(c => {
              const isActive = selectedCourseId === c.id;
              return (
                <button
                  key={c.id}
                  className={`ai-context__row${isActive ? ' is-active' : ''}`}
                  onClick={() => handleCourseClick(c.id)}
                  style={isActive ? {
                    border: '1.5px solid var(--accent)',
                    background: 'var(--accent-soft)',
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(109, 40, 217, 0.08)',
                    borderRadius: 'var(--radius-sm)'
                  } : {}}
                >
                  <svg style={isActive ? { color: 'var(--accent)' } : {}}><use href="#icon-book-open"/></svg>
                  <span style={isActive ? { color: 'var(--accent)', fontWeight: '700' } : {}}>{isAr ? c.nameAr : c.nameEn}</span>
                  {isActive ? (
                    <span className="ai-context__code" style={{
                      background: 'var(--accent)',
                      color: 'var(--text-inverse)',
                      borderColor: 'var(--accent)'
                    }}>{c.code}</span>
                  ) : (
                    <span className="ai-context__code">{c.code}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <section className="ai-conv">
        <header className="ai-conv__header">
          <div className="ai-conv__title-wrap">
            <h3>{t('ai.title')}</h3>
            <span className="ai-conv__badge">Claude Sonnet 4.6</span>
          </div>
        </header>
        <div className="ai-conv__body" ref={bodyRef}>
          {messages.length === 0 ? (
            <div className="ai-intro">
              <div className="ai-intro__spark"><svg><use href="#icon-sparkles"/></svg></div>
              <h4>{t('ai.intro.title')}</h4>
              <p>{t('ai.intro.desc')}</p>
              <div className="ai-suggest-grid">
                {suggests.map(s => (
                  <button key={s.key} className="ai-suggest" onClick={() => {
                    setMode(s.key);
                    sendMessage(s.prompt, s.key);
                  }}>
                    <div className="ai-suggest__icon"><svg><use href={`#icon-${s.icon}`}/></svg></div>
                    <div className="ai-suggest__title">{t(`ai.suggest.${s.key}.title`)}</div>
                    <div className="ai-suggest__desc">{t(`ai.suggest.${s.key}.desc`)}</div>
                  </button>
                ))}
              </div>
              <div className="ai-tips">
                <span className="ai-tips__label">{t('ai.tips.label')}</span>
                {['ai.tip.1','ai.tip.2','ai.tip.3'].map(k => (
                  <button key={k} className="ai-tip" onClick={() => sendMessage(t(k))}>{t(k)}</button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map(m => (
                <div key={m.id} className={`ai-msg${m.role === 'user' ? ' ai-msg--user' : ''}`}>
                  <div className="ai-msg__avatar">{m.role === 'user' ? (PROFILE?.initials || 'YH') : 'AI'}</div>
                  <div className="ai-msg__main">
                    <div className="ai-msg__name">{m.role === 'user' ? t('ai.you') : 'Study Buddy'} <time>{m.time}</time></div>
                    <div className="ai-msg__bubble">
                      <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                      {m.fileName && (
                        <div className="ai-msg__attachment" style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--s-1)',
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          padding: 'var(--s-1) var(--s-2)',
                          borderRadius: 'var(--radius-sm)',
                          marginTop: 'var(--s-2)',
                          fontSize: 'var(--fs-xs)',
                          color: 'inherit'
                        }}>
                          <svg width="14" height="14"><use href={m.fileType?.startsWith('image/') ? '#icon-image' : '#icon-file-text'}/></svg>
                          <a href={m.fileData} download={m.fileName} style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }} className="ai-msg__attachment-link">
                            {m.fileName}
                          </a>
                        </div>
                      )}
                    </div>
                    {(m.role === 'assistant' || m.role === 'ai') && (
                      <div className="ai-msg__actions">
                        <button className="ai-msg__act" onClick={() => copyMsg(m.text)}>{t('ai.copy')}</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="ai-msg">
                  <div className="ai-msg__avatar">AI</div>
                  <div className="ai-msg__main">
                    <div className="ai-msg__bubble"><div className="ai-typing"><span/><span/><span/></div></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="ai-composer">
          {attachment && (
            <div className="ai-composer__file-preview" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--s-2)',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              padding: 'var(--s-2) var(--s-3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--s-2)',
              width: 'fit-content',
              maxWidth: '100%'
            }}>
              <svg width="14" height="14" style={{ color: 'var(--accent)', flexShrink: 0 }}><use href={attachment.type?.startsWith('image/') ? '#icon-image' : '#icon-file-text'}/></svg>
              <span className="ai-composer__file-preview-name" style={{
                fontSize: 'var(--fs-xs)',
                color: 'var(--text-primary)',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                maxWidth: '200px'
              }}>{attachment.name}</span>
              <button className="ai-composer__file-preview-remove" style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} onClick={removeAttachment}>
                <svg width="12" height="12"><use href="#icon-x"/></svg>
              </button>
            </div>
          )}
          <div className="ai-composer__bar">
            <button className="ai-composer__attach" onClick={handleFileClick}><svg><use href="#icon-paperclip"/></svg></button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              accept="image/*,application/pdf"
            />
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={t('ai.placeholder')}
              rows={1}
            />
            <button className="btn btn--primary btn--sm ai-composer__send" onClick={handleSend}>
              <svg width="14" height="14"><use href="#icon-send"/></svg>
              <span>{t('ai.send')}</span>
            </button>
          </div>
          <div className="ai-composer__chips">
            {['chat','explain','quiz','summary'].map(m => (
              <button key={m} className={`ai-mode-chip${mode === m ? ' is-active' : ''}`} onClick={() => setMode(m)}>
                {t(`ai.mode.${m}`)}
              </button>
            ))}
            <span className="ai-composer__hint">↵ {isAr ? 'للإرسال' : 'to send'}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
