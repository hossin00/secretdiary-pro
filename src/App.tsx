import { useState, useEffect } from 'react'
import { Lock, BookOpen, Plus, Trash2, Eye, EyeOff, Calendar, Shield, Save } from 'lucide-react'

const ACCENT = '#a855f7'

interface Entry {
  id: string
  date: string
  title: string
  content: string
  mood: number
  encrypted: boolean
}

function xorEncrypt(text: string, key: string): string {
  return btoa(text.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join(''))
}
function xorDecrypt(encoded: string, key: string): string {
  try {
    const text = atob(encoded)
    return text.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('')
  } catch { return '' }
}

export default function App() {
  const [pin, setPin] = useState('')
  const [savedPin, setSavedPin] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [error, setError] = useState('')
  const [entries, setEntries] = useState<Entry[]>([])
  const [selected, setSelected] = useState<Entry | null>(null)
  const [writing, setWriting] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState(3)
  const [showContent, setShowContent] = useState(false)
  const [pinSetup, setPinSetup] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [settingPin, setSettingPin] = useState(false)

  useEffect(() => {
    const p = localStorage.getItem('sd_pin')
    if (p) setSavedPin(p)
    else setSettingPin(true)
  }, [])

  useEffect(() => {
    if (unlocked && savedPin) {
      const raw = localStorage.getItem('sd_entries')
      if (raw) {
        try {
          const dec = xorDecrypt(raw, savedPin)
          setEntries(JSON.parse(dec))
        } catch { setEntries([]) }
      }
    }
  }, [unlocked, savedPin])

  function saveEntries(list: Entry[]) {
    setEntries(list)
    if (savedPin) {
      localStorage.setItem('sd_entries', xorEncrypt(JSON.stringify(list), savedPin))
    }
  }

  function setupPin() {
    if (pinSetup.length < 4) { setError('PIN must be at least 4 digits'); return }
    if (pinSetup !== pinConfirm) { setError('PINs do not match'); return }
    localStorage.setItem('sd_pin', pinSetup)
    setSavedPin(pinSetup)
    setSettingPin(false)
    setUnlocked(true)
    setError('')
  }

  function unlock() {
    if (pinInput === savedPin) {
      setUnlocked(true)
      setPinInput('')
      setError('')
    } else {
      setError('Wrong PIN')
      setPinInput('')
    }
  }

  function addEntry() {
    if (!title.trim() || !content.trim()) return
    const e: Entry = { id: Date.now().toString(), date: new Date().toISOString(), title: title.trim(), content: content.trim(), mood, encrypted: true }
    saveEntries([e, ...entries])
    setWriting(false)
    setTitle('')
    setContent('')
    setMood(3)
  }

  function deleteEntry(id: string) {
    saveEntries(entries.filter(e => e.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const moods = ['😢', '😕', '😐', '🙂', '😊']

  if (settingPin) return (
    <div style={{ background: 'linear-gradient(135deg,#1a0533,#2d1054)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif', padding: '2rem' }}>
      <div style={{ background: '#1e1e2e', borderRadius: 24, padding: '2.5rem', width: '100%', maxWidth: 380, textAlign: 'center', boxShadow: '0 20px 60px rgba(168,85,247,0.3)' }}>
        <Shield size={40} style={{ color: ACCENT, marginBottom: '1rem' }} />
        <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Set Your PIN</h2>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>Your diary is encrypted with your PIN</p>
        <input type="password" inputMode="numeric" placeholder="Choose PIN (min 4 digits)" value={pinSetup} onChange={e => setPinSetup(e.target.value)} style={{ width: '100%', background: '#2a2a3e', border: '2px solid #3a3a5e', borderRadius: 12, padding: '0.8rem', color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 12, boxSizing: 'border-box', letterSpacing: 8 }} />
        <input type="password" inputMode="numeric" placeholder="Confirm PIN" value={pinConfirm} onChange={e => setPinConfirm(e.target.value)} style={{ width: '100%', background: '#2a2a3e', border: '2px solid #3a3a5e', borderRadius: 12, padding: '0.8rem', color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 16, boxSizing: 'border-box', letterSpacing: 8 }} />
        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button onClick={setupPin} style={{ width: '100%', background: ACCENT, border: 'none', borderRadius: 12, padding: '0.9rem', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Create Diary</button>
      </div>
    </div>
  )

  if (!unlocked) return (
    <div style={{ background: 'linear-gradient(135deg,#1a0533,#2d1054)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif' }}>
      <div style={{ background: '#1e1e2e', borderRadius: 24, padding: '2.5rem', width: '100%', maxWidth: 340, textAlign: 'center', boxShadow: '0 20px 60px rgba(168,85,247,0.3)' }}>
        <Lock size={40} style={{ color: ACCENT, marginBottom: '1rem' }} />
        <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Secret Diary</h2>
        <input type="password" inputMode="numeric" placeholder="Enter PIN" value={pinInput} onChange={e => setPinInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && unlock()} style={{ width: '100%', background: '#2a2a3e', border: '2px solid #3a3a5e', borderRadius: 12, padding: '0.9rem', color: '#fff', fontSize: 22, textAlign: 'center', marginBottom: 16, boxSizing: 'border-box', letterSpacing: 10 }} />
        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button onClick={unlock} style={{ width: '100%', background: ACCENT, border: 'none', borderRadius: 12, padding: '0.9rem', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Unlock</button>
      </div>
    </div>
  )

  if (writing) return (
    <div style={{ background: '#0f0f1a', minHeight: '100vh', fontFamily: 'Inter,sans-serif', padding: '2rem', color: '#fff' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ color: ACCENT, fontSize: 20, fontWeight: 700 }}>New Entry</h2>
          <button onClick={() => setWriting(false)} style={{ background: '#2a2a3e', border: 'none', borderRadius: 10, padding: '0.5rem 1rem', color: '#888', cursor: 'pointer' }}>Cancel</button>
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Entry title..." style={{ width: '100%', background: '#1e1e2e', border: '2px solid #3a3a5e', borderRadius: 12, padding: '0.9rem', color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 16, boxSizing: 'border-box' }} />
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>Mood</p>
          <div style={{ display: 'flex', gap: 12 }}>
            {moods.map((m, i) => <button key={i} onClick={() => setMood(i + 1)} style={{ fontSize: 28, background: mood === i + 1 ? '#3a2a5e' : 'transparent', border: mood === i + 1 ? '2px solid ' + ACCENT : '2px solid transparent', borderRadius: 12, padding: '0.4rem 0.7rem', cursor: 'pointer' }}>{m}</button>)}
          </div>
        </div>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your thoughts..." rows={12} style={{ width: '100%', background: '#1e1e2e', border: '2px solid #3a3a5e', borderRadius: 12, padding: '1rem', color: '#fff', fontSize: 15, lineHeight: 1.7, resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 }} />
        <button onClick={addEntry} style={{ background: ACCENT, border: 'none', borderRadius: 12, padding: '0.9rem 2rem', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><Save size={18} /> Save Entry</button>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#0f0f1a', minHeight: '100vh', fontFamily: 'Inter,sans-serif', color: '#fff' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BookOpen size={28} style={{ color: ACCENT }} />
            <h1 style={{ fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Secret Diary</h1>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: '#555', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={14} /> Encrypted</span>
            <button onClick={() => setWriting(true)} style={{ background: ACCENT, border: 'none', borderRadius: 12, padding: '0.6rem 1.2rem', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16} /> New Entry</button>
          </div>
        </div>

        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>
            <BookOpen size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
            <p>Your diary is empty. Start writing!</p>
          </div>
        ) : selected ? (
          <div style={{ background: '#1e1e2e', borderRadius: 20, padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{selected.title}</h2>
                <p style={{ color: '#666', fontSize: 13 }}>{new Date(selected.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {moods[selected.mood - 1]}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowContent(!showContent)} style={{ background: '#2a2a3e', border: 'none', borderRadius: 10, padding: '0.5rem', color: '#888', cursor: 'pointer' }}>{showContent ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                <button onClick={() => deleteEntry(selected.id)} style={{ background: '#2a2a3e', border: 'none', borderRadius: 10, padding: '0.5rem', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                <button onClick={() => setSelected(null)} style={{ background: '#2a2a3e', border: 'none', borderRadius: 10, padding: '0.5rem 1rem', color: '#888', cursor: 'pointer', fontSize: 13 }}>Back</button>
              </div>
            </div>
            {showContent ? <p style={{ color: '#ccc', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: 15 }}>{selected.content}</p> : <div style={{ background: '#151525', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#555' }}><Lock size={24} style={{ marginBottom: 8 }} /><p>Tap the eye icon to reveal</p></div>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entries.map(e => (
              <div key={e.id} onClick={() => { setSelected(e); setShowContent(false) }} style={{ background: '#1e1e2e', borderRadius: 16, padding: '1.2rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #2a2a3e', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{moods[e.mood - 1]}</span>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 2 }}>{e.title}</p>
                    <p style={{ color: '#555', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} /> {new Date(e.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <Lock size={14} style={{ color: ACCENT }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
