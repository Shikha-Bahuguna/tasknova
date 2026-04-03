import React, { useState, useEffect } from 'react';
import ReminderAlarm from './ReminderAlarm';
import Chatbot from './Chatbot';

// const API = 'http://localhost:5000';
const API = "https://tasknova-sj9f.onrender.com";

const getToken = () => localStorage.getItem('tasknova_token');
const getUser  = () => { try { return JSON.parse(localStorage.getItem('tasknova_user')); } catch { return null; } };
const apiFetch = (path, opts={}) =>
  fetch(`${API}${path}`, {
    ...opts,
    headers:{'Content-Type':'application/json',Authorization:`Bearer ${getToken()}`,...(opts.headers||{})},
    body:opts.body?JSON.stringify(opts.body):undefined,
  }).then(r=>r.json());

const PC = { high:'#ff6a6a', medium:'#ffd96a', low:'#6affd4' };
const SC = ['#7c6aff','#6ab4ff','#ff6a9f','#ffd96a','#6affd4','#ff9b3d'];

function Toast({ msg, type, onDone }) {
  useEffect(()=>{const t=setTimeout(onDone,2800);return()=>clearTimeout(t);},[]);
  return <div style={{position:'fixed',bottom:'2rem',right:'2rem',zIndex:9999,background:type==='error'?'#ff6a6a':'#6affd4',color:'#06060f',padding:'12px 20px',borderRadius:'12px',fontWeight:600,fontSize:'.85rem',boxShadow:'0 8px 30px rgba(0,0,0,.3)',animation:'slideUp .3s ease'}}>{msg}</div>;
}

function AddTaskModal({ subjects, onClose, onSave }) {
  const [form,setForm]=useState({title:'',subject:subjects[0]||'',dueDate:'',priority:'medium',status:'todo'});
  const s=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const INP={width:'100%',background:'#13132a',border:'1px solid #ffffff18',borderRadius:10,padding:'10px 14px',color:'#f0efff',fontSize:'.9rem',outline:'none',fontFamily:'inherit'};
  const LBL={display:'block',fontSize:'.78rem',color:'#7b79a0',marginBottom:6,fontWeight:500};
  return(
    <div style={{position:'fixed',inset:0,zIndex:500,background:'rgba(6,6,15,.85)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div style={{background:'#0d0d1f',border:'1px solid #ffffff18',borderRadius:20,padding:'2rem',width:'100%',maxWidth:440,animation:'fadeUp .3s ease'}}>
        <h3 style={{fontFamily:"'Syne',sans-serif",fontSize:'1.2rem',fontWeight:800,marginBottom:'1.5rem'}}>✦ Add New Task</h3>
        <div style={{marginBottom:'1rem'}}><label style={LBL}>Task Title</label><input style={INP} placeholder="e.g. Complete algebra homework" value={form.title} onChange={s('title')} onKeyDown={e=>e.key==='Enter'&&form.title.trim()&&(onSave(form),onClose())}/></div>
        <div style={{marginBottom:'1rem'}}><label style={LBL}>Due Date</label><input type="date" style={INP} value={form.dueDate} onChange={s('dueDate')}/></div>
        <div style={{marginBottom:'1rem'}}><label style={LBL}>Subject</label><select style={INP} value={form.subject} onChange={s('subject')}>{subjects.map(sub=><option key={sub} value={sub}>{sub}</option>)}</select></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
          <div><label style={LBL}>Priority</label><select style={INP} value={form.priority} onChange={s('priority')}>{['low','medium','high'].map(o=><option key={o} value={o}>{o}</option>)}</select></div>
          <div><label style={LBL}>Status</label><select style={INP} value={form.status} onChange={s('status')}>{['todo','in_progress','done'].map(o=><option key={o} value={o}>{o}</option>)}</select></div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'11px',borderRadius:10,border:'1px solid #ffffff18',background:'transparent',color:'#7b79a0',cursor:'pointer',fontFamily:'inherit'}}>Cancel</button>
          <button onClick={()=>{if(!form.title.trim())return;onSave(form);onClose();}} style={{flex:2,padding:'11px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#7c6aff,#ff6a9f)',color:'#fff',cursor:'pointer',fontFamily:'inherit',fontWeight:700}}>Add Task ✦</button>
        </div>
      </div>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [mode,setMode]=useState('login');
  const [email,setEmail]=useState('');
  const [pw,setPw]=useState('');
  const [err,setErr]=useState('');
  const [loading,setLoad]=useState(false);
  const submit=async()=>{
    setErr('');setLoad(true);
    try{
      const res=await fetch(`${API}/api/auth/${mode==='login'?'login':'signup'}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pw})});
      const d=await res.json();
      if(!res.ok){setErr(d.error||'Error');return;}
      localStorage.setItem('tasknova_token',d.token);
      localStorage.setItem('tasknova_user',JSON.stringify(d.user));
      onAuth(d.user);
    }catch{setErr('Cannot connect to server. Please check your internet connection or try again.');}
    finally{setLoad(false);}
  };
  const INP={width:'100%',background:'#13132a',border:'1px solid #ffffff18',borderRadius:10,padding:'11px 14px',color:'#f0efff',fontSize:'.9rem',outline:'none',fontFamily:'inherit'};
  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#06060f',fontFamily:"'DM Sans',sans-serif",padding:'1rem'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{position:'fixed',inset:0,background:'radial-gradient(ellipse 80% 60% at 10% 0%,rgba(124,106,255,.12),transparent 60%),radial-gradient(ellipse 60% 50% at 90% 10%,rgba(255,106,159,.08),transparent 55%)',pointerEvents:'none'}}/>
      <div style={{width:'100%',maxWidth:400,animation:'fadeUp .5s ease',position:'relative',zIndex:1}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#7c6aff,#ff6a9f)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',margin:'0 auto 1rem',boxShadow:'0 0 30px rgba(124,106,255,.5)'}}>✦</div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'2.2rem',fontWeight:800,color:'#f0efff',letterSpacing:'-.03em'}}>TaskNova</h1>
          <p style={{color:'#7b79a0',fontSize:'.9rem',marginTop:4}}>Track tasks. See growth.</p>
        </div>
        <div style={{background:'#0d0d1f',border:'1px solid #ffffff18',borderRadius:20,padding:'2rem'}}>
          <div style={{display:'flex',gap:6,marginBottom:'1.75rem',background:'#13132a',borderRadius:10,padding:4}}>
            {['login','signup'].map(m=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:9,borderRadius:7,border:'none',background:mode===m?'#7c6aff':'transparent',color:mode===m?'#fff':'#7b79a0',fontWeight:600,cursor:'pointer',fontFamily:'inherit',fontSize:'.85rem',transition:'all .2s'}}>{m==='login'?'Log In':'Sign Up'}</button>)}
          </div>
          <div style={{marginBottom:'1rem'}}><label style={{display:'block',fontSize:'.78rem',color:'#7b79a0',marginBottom:6,fontWeight:500}}>Email</label><input type="email" style={INP} placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
          <div style={{marginBottom:'1rem'}}><label style={{display:'block',fontSize:'.78rem',color:'#7b79a0',marginBottom:6,fontWeight:500}}>Password</label><input type="password" style={INP} placeholder="Min 6 characters" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
          {err&&<div style={{background:'rgba(255,106,106,.1)',border:'1px solid rgba(255,106,106,.3)',borderRadius:8,padding:'10px 14px',fontSize:'.82rem',color:'#ff6a6a',marginBottom:'1rem'}}>{err}</div>}
          <button onClick={submit} disabled={loading} style={{width:'100%',padding:12,borderRadius:10,border:'none',background:'linear-gradient(135deg,#7c6aff,#ff6a9f)',color:'#fff',fontWeight:700,fontSize:'.92rem',cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 20px rgba(124,106,255,.4)',opacity:loading?.7:1,transition:'opacity .2s'}}>
            {loading?'Please wait...':(mode==='login'?'Log In →':'Create Account →')}
          </button>
          {mode==='login'&&<p style={{textAlign:'center',marginTop:'1rem',fontSize:'.8rem',color:'#7b79a0'}}>Don't have an account? <span onClick={()=>setMode('signup')} style={{color:'#7c6aff',cursor:'pointer',fontWeight:600}}>Sign up</span></p>}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [user,setUser]           = useState(getUser);
  const [tasks,setTasks]         = useState([]);
  const [subjects,setSubjects]   = useState([]);
  const [growth,setGrowth]       = useState(null);
  const [suggestions,setSuggestions] = useState([]);
  const [view,setView]           = useState('dashboard');
  const [sugLoading,setSugLoad]  = useState(false);
  const [showModal,setShowModal] = useState(false);
  const [toast,setToast]         = useState(null);
  const [filter,setFilter]       = useState('all');
  const [newSubject,setNewSub]   = useState('');

  const showToast=(msg,type='success')=>setToast({msg,type});
  useEffect(()=>{if(user){loadTasks();loadSubjects();loadGrowth();}},[user]);
  const loadTasks    = ()=>apiFetch('/api/tasks').then(setTasks).catch(()=>{});
  const loadSubjects = ()=>apiFetch('/api/subjects').then(setSubjects).catch(()=>{});
  const loadGrowth   = ()=>apiFetch('/api/growth').then(setGrowth).catch(()=>{});
  const addTask=async(form)=>{const t=await apiFetch('/api/tasks',{method:'POST',body:form});setTasks(p=>[t,...p]);loadGrowth();showToast('Task added! 🎉');};
  const toggleStatus=async(task)=>{const next=task.status==='done'?'todo':task.status==='todo'?'in_progress':'done';const u=await apiFetch(`/api/tasks/${task.id}`,{method:'PUT',body:{status:next}});setTasks(p=>p.map(t=>t.id===task.id?u:t));loadGrowth();};
  const deleteTask=async(id)=>{await fetch(`${API}/api/tasks/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${getToken()}`}});setTasks(p=>p.filter(t=>t.id!==id));loadGrowth();showToast('Task deleted','error');};
  const addSuggestion=async(s)=>{await addTask({title:s.title,subject:s.subject,priority:s.priority,status:'todo'});setSuggestions(p=>p.filter(x=>x.title!==s.title));};
  const getSuggestions=async()=>{setSugLoad(true);const d=await apiFetch('/api/tasks/suggest',{method:'POST',body:{}}).catch(()=>null);if(d?.suggestions)setSuggestions(d.suggestions);setSugLoad(false);};
  const addSubject=async()=>{if(!newSubject.trim())return;const u=await apiFetch('/api/subjects',{method:'POST',body:{name:newSubject.trim()}});setSubjects(u);setNewSub('');showToast('Subject added!');};
  const logout=()=>{localStorage.removeItem('tasknova_token');localStorage.removeItem('tasknova_user');setUser(null);};

  if(!user) return <AuthScreen onAuth={u=>setUser(u)}/>;

  const todo=tasks.filter(t=>t.status==='todo').length;
  const inProg=tasks.filter(t=>t.status==='in_progress').length;
  const done=tasks.filter(t=>t.status==='done').length;
  const filtered=filter==='all'?tasks:tasks.filter(t=>t.status===filter);
  const sIcon=s=>s==='done'?'✓':s==='in_progress'?'⚡':'';
  const sBorder=s=>s==='done'?'#6affd4':s==='in_progress'?'#6ab4ff':'#ffffff18';

  const CARD={background:'#0d0d1f',border:'1px solid #ffffff18',borderRadius:16};
  const BTN={background:'linear-gradient(135deg,#7c6aff,#ff6a9f)',border:'none',color:'#fff',padding:'8px 18px',borderRadius:10,fontWeight:700,fontSize:'.83rem',cursor:'pointer',fontFamily:'inherit',transition:'all .2s'};
  const NAV=[['dashboard','⊞ Dashboard'],['tasks','☑ Tasks'],['growth','📈 My Growth'],['reminders','⏰ Reminders']];

  return(
    <div style={{minHeight:'100vh',background:'#06060f',color:'#f0efff',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#1a1a35;border-radius:3px}
        select:focus,input:focus,textarea:focus{outline:none!important;border-color:#7c6aff!important;box-shadow:0 0 0 3px rgba(124,106,255,.15)!important}
      `}</style>
      <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',background:'radial-gradient(ellipse 80% 60% at 10% 0%,rgba(124,106,255,.1),transparent 60%),radial-gradient(ellipse 60% 50% at 90% 10%,rgba(255,106,159,.07),transparent 55%)'}}/>
      <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',backgroundImage:'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)',backgroundSize:'60px 60px',maskImage:'radial-gradient(ellipse 100% 100% at 50% 0%,black 30%,transparent 80%)'}}/>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 2rem',height:66,background:'rgba(6,6,15,.85)',backdropFilter:'blur(20px)',borderBottom:'1px solid #ffffff0f',gap:'1rem',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
          <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#7c6aff,#ff6a9f)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',boxShadow:'0 0 18px rgba(124,106,255,.4)'}}>✦</div>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:'1.2rem',fontWeight:800,letterSpacing:'-.02em'}}>TaskNova</span>
        </div>
        <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
          {NAV.map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{padding:'6px 14px',borderRadius:8,fontSize:'.83rem',border:'1px solid',borderColor:view===v?'rgba(124,106,255,.4)':'transparent',background:view===v?'#7c6aff':'transparent',color:view===v?'#fff':'#7b79a0',cursor:'pointer',fontFamily:'inherit',fontWeight:500,transition:'all .2s'}}>{l}</button>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:7,background:'#13132a',border:'1px solid #ffffff18',padding:'5px 11px 5px 7px',borderRadius:100,fontSize:'.78rem'}}>
            <div style={{width:24,height:24,borderRadius:'50%',background:'linear-gradient(135deg,#7c6aff,#ff6a9f)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.6rem',fontWeight:700}}>{user.email[0].toUpperCase()}</div>
            <span style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.email}</span>
          </div>
          <button onClick={logout} style={{background:'transparent',border:'1px solid #ffffff18',color:'#7b79a0',padding:'6px 12px',borderRadius:8,fontSize:'.78rem',cursor:'pointer',fontFamily:'inherit',transition:'all .2s'}}>Log out</button>
        </div>
      </nav>

      <main style={{maxWidth:1240,margin:'0 auto',padding:'2.5rem 2rem 6rem',position:'relative',zIndex:1}}>

        {/* ── DASHBOARD ── */}
        {view==='dashboard'&&(
          <div style={{animation:'fadeUp .5s ease'}}>
            <div style={{marginBottom:'2.5rem'}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:'.72rem',fontWeight:500,letterSpacing:'.1em',textTransform:'uppercase',color:'#7c6aff',background:'rgba(124,106,255,.1)',border:'1px solid rgba(124,106,255,.2)',padding:'4px 12px',borderRadius:100,marginBottom:'.8rem'}}>
                <span style={{width:7,height:7,borderRadius:'50%',background:'#6affd4',display:'inline-block'}}/>Live Dashboard
              </div>
              <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(1.8rem,3.5vw,2.6rem)',fontWeight:800,letterSpacing:'-.03em',lineHeight:1.1,marginBottom:'.4rem'}}>
                Welcome back, <span style={{background:'linear-gradient(90deg,#7c6aff,#ff6a9f)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{user.email.split('@')[0]}</span> 👋
              </h1>
              <p style={{color:'#7b79a0',fontWeight:300}}>Here's what's on your plate. Let's crush it.</p>
            </div>

            {/* STAT CARDS */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1.25rem',marginBottom:'1.75rem'}}>
              {[{l:'To Do',v:todo,c:'#ff9b3d',ic:'📋',bg:'rgba(255,155,61,.1)',bc:'rgba(255,155,61,.2)'},{l:'In Progress',v:inProg,c:'#6ab4ff',ic:'⚡',bg:'rgba(106,180,255,.1)',bc:'rgba(106,180,255,.2)'},{l:'Completed',v:done,c:'#6affd4',ic:'✅',bg:'rgba(106,255,212,.1)',bc:'rgba(106,255,212,.2)'}].map(({l,v,c,ic,bg,bc})=>(
                <div key={l} style={{...CARD,padding:'1.75rem',overflow:'hidden',transition:'transform .25s,box-shadow .25s'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 20px 60px rgba(0,0,0,.4)'}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
                  <div style={{width:44,height:44,borderRadius:12,background:bg,border:`1px solid ${bc}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',marginBottom:'1.2rem'}}>{ic}</div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:'2.8rem',fontWeight:800,lineHeight:1,marginBottom:'.4rem',color:c}}>{v}</div>
                  <div style={{color:'#7b79a0',fontSize:'.85rem'}}>{l}</div>
                </div>
              ))}
            </div>

            {/* AI BANNER */}
            <div style={{background:'linear-gradient(135deg,#1a1040,#0f1a3a)',border:'1px solid rgba(124,106,255,.25)',borderRadius:20,padding:'1.75rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.75rem',position:'relative',overflow:'hidden',flexWrap:'wrap',gap:'1rem'}}>
              <div style={{position:'absolute',width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,106,255,.18),transparent 70%)',top:-100,right:60,pointerEvents:'none'}}/>
              <div style={{display:'flex',alignItems:'center',gap:'1rem',zIndex:1}}>
                <div style={{fontSize:'2rem'}}>🤖</div>
                <div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'1.05rem',marginBottom:3}}>AI Task Suggestions</div>
                  <div style={{color:'#7b79a0',fontSize:'.82rem'}}>Let AI analyze your subjects and suggest what to study next</div>
                </div>
              </div>
              <button onClick={getSuggestions} disabled={sugLoading} style={{...BTN,zIndex:1,opacity:sugLoading?.7:1}}>{sugLoading?'✨ Thinking...':'✦ Get Suggestions'}</button>
            </div>

            {/* SUGGESTIONS */}
            {suggestions.length>0&&(
              <div style={{...CARD,marginBottom:'1.75rem',padding:'1.5rem'}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:'1rem',fontSize:'.95rem'}}>✦ Suggested Tasks</div>
                <div style={{display:'grid',gap:'.75rem'}}>
                  {suggestions.map((s,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',background:'#13132a',borderRadius:12,borderLeft:`3px solid ${PC[s.priority]||'#7c6aff'}`,transition:'padding-left .2s'}}
                      onMouseEnter={e=>e.currentTarget.style.paddingLeft='20px'} onMouseLeave={e=>e.currentTarget.style.paddingLeft='14px'}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'.9rem',fontWeight:500,marginBottom:4}}>{s.title}</div>
                        <div style={{display:'flex',gap:8}}>
                          <span style={{fontSize:'.72rem',background:'#1a1a35',padding:'2px 8px',borderRadius:6,color:'#7b79a0'}}>{s.subject}</span>
                          <span style={{fontSize:'.72rem',color:PC[s.priority],background:`${PC[s.priority]}15`,padding:'2px 8px',borderRadius:6}}>{s.priority}</span>
                        </div>
                      </div>
                      <button onClick={()=>addSuggestion(s)} style={{width:32,height:32,borderRadius:'50%',border:'none',background:'linear-gradient(135deg,#7c6aff,#ff6a9f)',color:'#fff',fontSize:'1.1rem',cursor:'pointer',transition:'transform .2s'}}
                        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.15)'} onMouseLeave={e=>e.currentTarget.style.transform=''}>+</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RECENT + PROGRESS */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:'1.5rem'}}>
              <div style={CARD}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1.25rem 1.75rem',borderBottom:'1px solid #ffffff0f'}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'.95rem'}}>📌 Recent Tasks</div>
                  <button onClick={()=>setShowModal(true)} style={BTN}>+ Add Task</button>
                </div>
                <div style={{padding:'1rem 1.75rem'}}>
                  {tasks.slice(0,6).map(task=>(
                    <div key={task.id} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 0',borderBottom:'1px solid #ffffff0f',transition:'padding-left .2s'}}
                      onMouseEnter={e=>e.currentTarget.style.paddingLeft='6px'} onMouseLeave={e=>e.currentTarget.style.paddingLeft='0'}>
                      <div style={{width:7,height:7,borderRadius:'50%',background:PC[task.priority]||'#7b79a0',flexShrink:0}}/>
                      <div onClick={()=>toggleStatus(task)} style={{width:22,height:22,borderRadius:7,border:`2px solid ${sBorder(task.status)}`,background:task.status==='done'?'#6affd4':task.status==='in_progress'?'rgba(106,180,255,.18)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.65rem',fontWeight:700,color:'#06060f',flexShrink:0,cursor:'pointer',transition:'all .2s'}}>{sIcon(task.status)}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:'.88rem',fontWeight:500,textDecoration:task.status==='done'?'line-through':'none',color:task.status==='done'?'#7b79a0':'#f0efff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{task.title}</div>
                        <div style={{display:'flex',gap:6,marginTop:3}}>
                          <span style={{fontSize:'.7rem',background:'#13132a',padding:'1px 7px',borderRadius:5,color:'#7b79a0'}}>{task.subject}</span>
                          {task.dueDate&&<span style={{fontSize:'.7rem',color:'#7b79a0'}}>{new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <button onClick={()=>deleteTask(task.id)} style={{background:'transparent',border:'none',color:'#7b79a0',cursor:'pointer',fontSize:'.85rem',padding:'4px',borderRadius:5,transition:'all .2s'}}
                        onMouseEnter={e=>{e.currentTarget.style.color='#ff6a6a';e.currentTarget.style.background='rgba(255,106,106,.1)'}}
                        onMouseLeave={e=>{e.currentTarget.style.color='#7b79a0';e.currentTarget.style.background='transparent'}}>✕</button>
                    </div>
                  ))}
                  {tasks.length===0&&<div style={{textAlign:'center',padding:'2rem',color:'#7b79a0',fontSize:'.9rem'}}>No tasks yet. Add your first! 📚</div>}
                </div>
              </div>
              <div style={CARD}>
                <div style={{padding:'1.25rem 1.75rem',borderBottom:'1px solid #ffffff0f'}}><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'.95rem'}}>📊 Progress</div></div>
                <div style={{padding:'1.5rem',display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <div style={{position:'relative',width:150,height:150,marginBottom:'1.5rem'}}>
                    <svg width="150" height="150" viewBox="0 0 150 150" style={{transform:'rotate(-90deg)'}}>
                      <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7c6aff"/><stop offset="100%" stopColor="#ff6a9f"/></linearGradient></defs>
                      <circle cx="75" cy="75" r="60" fill="none" stroke="#1a1a35" strokeWidth="10"/>
                      <circle cx="75" cy="75" r="60" fill="none" stroke="url(#pg)" strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={`${2*Math.PI*60}`} strokeDashoffset={`${2*Math.PI*60*(1-(growth?.completionRate||0)/100)}`} style={{transition:'stroke-dashoffset 1s ease'}}/>
                    </svg>
                    <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.8rem',fontWeight:800,background:'linear-gradient(135deg,#7c6aff,#ff6a9f)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{growth?.completionRate||0}%</div>
                      <div style={{fontSize:'.68rem',color:'#7b79a0'}}>Completion</div>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.7rem',width:'100%'}}>
                    {[{l:'Completed',v:growth?.completedCount||0,c:'#6affd4'},{l:'Remaining',v:(growth?.totalTasks||0)-(growth?.completedCount||0),c:'#ff9b3d'},{l:'Total',v:growth?.totalTasks||0,c:'#6ab4ff'},{l:'Subjects',v:subjects.length,c:'#ffd96a'}].map(({l,v,c})=>(
                      <div key={l} style={{background:'#13132a',border:'1px solid #ffffff0f',borderRadius:10,padding:'.7rem',textAlign:'center'}}>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.3rem',fontWeight:700,color:c,marginBottom:2}}>{v}</div>
                        <div style={{fontSize:'.7rem',color:'#7b79a0'}}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TASKS ── */}
        {view==='tasks'&&(
          <div style={{animation:'fadeUp .5s ease'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'2rem',flexWrap:'wrap',gap:'1rem'}}>
              <div><h2 style={{fontFamily:"'Syne',sans-serif",fontSize:'1.8rem',fontWeight:800,letterSpacing:'-.02em'}}>All Tasks</h2><p style={{color:'#7b79a0',fontSize:'.88rem',marginTop:4}}>{tasks.length} total tasks</p></div>
              <button onClick={()=>setShowModal(true)} style={BTN}>+ Add Task</button>
            </div>
            <div style={{display:'flex',gap:6,marginBottom:'1.5rem',flexWrap:'wrap'}}>
              {[['all','All'],['todo','To Do'],['in_progress','In Progress'],['done','Done']].map(([v,l])=>(
                <button key={v} onClick={()=>setFilter(v)} style={{padding:'6px 16px',borderRadius:8,fontSize:'.82rem',border:'1px solid',borderColor:filter===v?'rgba(124,106,255,.4)':'#ffffff18',background:filter===v?'#7c6aff':'transparent',color:filter===v?'#fff':'#7b79a0',cursor:'pointer',fontFamily:'inherit',fontWeight:500,transition:'all .2s'}}>{l}</button>
              ))}
            </div>
            <div style={{display:'grid',gap:'.75rem'}}>
              {filtered.map(task=>(
                <div key={task.id} style={{...CARD,padding:'1rem 1.5rem',display:'flex',alignItems:'center',gap:14,transition:'all .2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateX(4px)';e.currentTarget.style.borderColor='#ffffff25'}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='#ffffff18'}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:PC[task.priority],flexShrink:0}}/>
                  <div onClick={()=>toggleStatus(task)} style={{width:24,height:24,borderRadius:7,border:`2px solid ${sBorder(task.status)}`,background:task.status==='done'?'#6affd4':task.status==='in_progress'?'rgba(106,180,255,.18)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.7rem',fontWeight:700,color:'#06060f',flexShrink:0,cursor:'pointer',transition:'all .2s'}}>{sIcon(task.status)}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'.92rem',fontWeight:500,textDecoration:task.status==='done'?'line-through':'none',color:task.status==='done'?'#7b79a0':'#f0efff'}}>{task.title}</div>
                    <div style={{display:'flex',gap:8,marginTop:4,flexWrap:'wrap'}}>
                      <span style={{fontSize:'.72rem',background:'#13132a',padding:'2px 8px',borderRadius:6,color:'#7b79a0'}}>{task.subject}</span>
                      <span style={{fontSize:'.72rem',color:PC[task.priority],background:`${PC[task.priority]}15`,padding:'2px 8px',borderRadius:6}}>{task.priority}</span>
                      {task.dueDate&&<span style={{fontSize:'.72rem',color:'#7b79a0'}}>📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <button onClick={()=>deleteTask(task.id)} style={{background:'rgba(255,106,106,.08)',border:'1px solid rgba(255,106,106,.2)',color:'#ff6a6a',padding:'6px 12px',borderRadius:8,fontSize:'.78rem',cursor:'pointer',fontFamily:'inherit',transition:'all .2s'}}>Delete</button>
                </div>
              ))}
              {filtered.length===0&&<div style={{textAlign:'center',padding:'4rem',color:'#7b79a0'}}><div style={{fontSize:'3rem',marginBottom:'1rem'}}>📭</div><div>No tasks here! Add one above.</div></div>}
            </div>
          </div>
        )}

        {/* ── GROWTH ── */}
        {view==='growth'&&(
          <div style={{animation:'fadeUp .5s ease'}}>
            <div style={{marginBottom:'2rem'}}><h2 style={{fontFamily:"'Syne',sans-serif",fontSize:'1.8rem',fontWeight:800,letterSpacing:'-.02em'}}>My Growth</h2><p style={{color:'#7b79a0',fontSize:'.88rem',marginTop:4}}>Track your academic progress</p></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'1.25rem',marginBottom:'1.5rem'}}>
              {[{l:'Total Tasks',v:growth?.totalTasks||0,c:'#7c6aff'},{l:'Completed',v:growth?.completedCount||0,c:'#6affd4'},{l:'Completion Rate',v:`${growth?.completionRate||0}%`,c:'#ff6a9f'}].map(({l,v,c})=>(
                <div key={l} style={{...CARD,padding:'1.5rem',textAlign:'center'}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:'2.4rem',fontWeight:800,color:c,marginBottom:6}}>{v}</div><div style={{color:'#7b79a0',fontSize:'.85rem'}}>{l}</div></div>
              ))}
            </div>
            {growth?.last7Days&&(
              <div style={{...CARD,padding:'1.75rem',marginBottom:'1.5rem'}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:'1.5rem',fontSize:'.95rem'}}>📈 Last 7 Days Activity</div>
                <div style={{display:'flex',alignItems:'flex-end',gap:12,height:120}}>
                  {growth.last7Days.map((d,i)=>{const max=Math.max(...growth.last7Days.map(x=>x.count),1);const h=Math.max((d.count/max)*100,4);const isT=i===6;return(
                    <div key={d.date} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6,height:'100%',justifyContent:'flex-end'}}>
                      <div style={{fontSize:'.72rem',color:'#7b79a0',fontWeight:600}}>{d.count||''}</div>
                      <div style={{width:'100%',height:`${h}%`,borderRadius:'6px 6px 0 0',background:isT?'linear-gradient(180deg,#ff6a9f,rgba(255,106,159,.3))':'linear-gradient(180deg,#7c6aff,rgba(124,106,255,.3))',minHeight:4,transition:'height .8s ease'}}/>
                      <div style={{fontSize:'.68rem',color:isT?'#ff6a9f':'#7b79a0'}}>{d.label}</div>
                    </div>
                  );})}
                </div>
              </div>
            )}
            {growth?.bySubject?.length>0&&(
              <div style={{...CARD,padding:'1.75rem',marginBottom:'1.5rem'}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:'1.25rem',fontSize:'.95rem'}}>🎓 By Subject</div>
                <div style={{display:'grid',gap:'.75rem'}}>
                  {growth.bySubject.map((s,i)=>{const max=Math.max(...growth.bySubject.map(x=>x.count));return(
                    <div key={s.name}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:'.85rem'}}><span style={{fontWeight:500}}>{s.name}</span><span style={{color:'#7b79a0'}}>{s.count} done</span></div>
                      <div style={{height:8,background:'#13132a',borderRadius:100,overflow:'hidden'}}><div style={{height:'100%',width:`${(s.count/max)*100}%`,background:SC[i%SC.length],borderRadius:100,transition:'width 1s ease'}}/></div>
                    </div>
                  );})}
                </div>
              </div>
            )}
            <div style={CARD}>
              <div style={{padding:'1.25rem 1.75rem',borderBottom:'1px solid #ffffff0f'}}><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'.95rem'}}>🎓 Manage Subjects</div></div>
              <div style={{padding:'1.5rem'}}>
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:'1.25rem'}}>
                  {subjects.map((s,i)=><div key={s} style={{padding:'8px 16px',borderRadius:10,fontSize:'.83rem',fontWeight:500,border:'1px solid',borderColor:`${SC[i%SC.length]}40`,background:`${SC[i%SC.length]}12`,color:SC[i%SC.length]}}>{s}</div>)}
                </div>
                <div style={{display:'flex',gap:8}}>
                  <input value={newSubject} onChange={e=>setNewSub(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addSubject()} placeholder="Add new subject..."
                    style={{flex:1,background:'#13132a',border:'1px solid #ffffff18',borderRadius:10,padding:'10px 14px',color:'#f0efff',fontSize:'.88rem',fontFamily:'inherit',outline:'none'}}/>
                  <button onClick={addSubject} style={BTN}>Add</button>
                </div>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'center',marginTop:'1.5rem'}}>
              <button onClick={loadGrowth} style={{...BTN,background:'#13132a',boxShadow:'none',border:'1px solid #ffffff18',color:'#f0efff'}}>↻ Refresh Stats</button>
            </div>
          </div>
        )}

        {/* ── REMINDERS ── */}
        {view==='reminders'&&(
          <div style={{animation:'fadeUp .5s ease'}}>
            <ReminderAlarm tasks={tasks}/>
          </div>
        )}

      </main>

      {showModal&&<AddTaskModal subjects={subjects} onClose={()=>setShowModal(false)} onSave={addTask}/>}
      {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}

      <Chatbot tasks={tasks} subjects={subjects} onTasksChange={()=>{loadTasks();loadGrowth();}}/>

      <button onClick={()=>setShowModal(true)} title="Add Task"
        style={{position:'fixed',bottom:'2.5rem',right:'2.5rem',zIndex:50,width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#7c6aff,#ff6a9f)',border:'none',color:'#fff',fontSize:'1.4rem',cursor:'pointer',boxShadow:'0 8px 30px rgba(124,106,255,.5)',transition:'all .25s',display:'flex',alignItems:'center',justifyContent:'center'}}
        onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.1) rotate(90deg)';e.currentTarget.style.boxShadow='0 12px 40px rgba(124,106,255,.6)'}}
        onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 8px 30px rgba(124,106,255,.5)'}}>+</button>
    </div>
  );
}
