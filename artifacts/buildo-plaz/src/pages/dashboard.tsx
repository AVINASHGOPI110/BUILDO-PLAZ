import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  HardHat,
  Layers3,
  Mic,
  Package,
  Plus,
  Save,
  Table2,
  Users,
  X,
} from 'lucide-react';

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  area: string;
};

type Activity = {
  id: string;
  code: string;
  level: number;
  name: string;
  parent: string;
  discipline: string;
  status: string;
  progress: number;
};

type DailyRecord = {
  id: string;
  date: string;
  supervisor: string;
  rawUpdate: string;
  engineeringActivity: string;
  location: string;
  level: string;
  status: string;
  quantity: string;
  materialsReceived: string;
  materialsUsed: string;
  materialsRemaining: string;
  labor: string;
  duration: string;
  delay: string;
};

type Project = {
  id: string;
  name: string;
  type: string;
  location: string;
  client: string;
  startDate: string;
  plannedEndDate: string;
  description: string;
  members: Member[];
  activities: Activity[];
  dailyRecords: DailyRecord[];
};

type SpeechResult = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechResultEvent = {
  resultIndex: number;
  results: ArrayLike<SpeechResult>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const STORAGE_KEY = 'buildo-plaz-projects-v2';
const SAMPLE_UPDATE =
  'Today Block A footing excavation was completed. We used two excavators and 18 workers. Twelve tonnes of reinforcement steel arrived and the pump came two hours late.';

function getRecognition(): SpeechRecognitionConstructor | undefined {
  const browserWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
}

function todayLabel() {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());
}

function seedActivities(projectName: string): Activity[] {
  return [
    { id: 'l1-project', code: 'L1', level: 1, name: projectName, parent: '—', discipline: 'All disciplines', status: 'In progress', progress: 42 },
    { id: 'l2-foundation', code: 'L2', level: 2, name: 'Foundation Works', parent: 'L1', discipline: 'Civil', status: 'In progress', progress: 58 },
    { id: 'l3-block-a', code: 'L3', level: 3, name: 'Block A Foundation', parent: 'L2', discipline: 'Civil', status: 'In progress', progress: 64 },
    { id: 'l4-footing', code: 'L4', level: 4, name: 'Footing F1', parent: 'L3', discipline: 'Structural', status: 'In progress', progress: 71 },
    { id: 'l5-rebar', code: 'L5', level: 5, name: 'Footing F1 Reinforcement', parent: 'L4', discipline: 'Structural', status: 'In progress', progress: 80 },
    { id: 'l6-bars', code: 'L6', level: 6, name: 'Install bottom reinforcement bars for F1', parent: 'L5', discipline: 'Structural', status: 'In progress', progress: 72 },
    { id: 'l5-excavation', code: 'L5', level: 5, name: 'Block A footing excavation', parent: 'L4', discipline: 'Civil', status: 'Completed', progress: 100 },
    { id: 'l6-pcc', code: 'L6', level: 6, name: 'Prepare PCC bed for F1', parent: 'L5', discipline: 'Civil', status: 'At risk', progress: 28 },
  ];
}

function seedProject(): Project {
  return {
    id: 'northline-civic-centre',
    name: 'Northline Civic Centre',
    type: 'Building',
    location: 'Hyderabad',
    client: 'Northline Development Group',
    startDate: '01 Sep 2026',
    plannedEndDate: '30 Jun 2027',
    description: 'A live execution record for the Block A foundation and structural package.',
    members: [
      { id: 'member-ravi', name: 'Ravi Kumar', email: 'ravi@northline.demo', role: 'Supervisor', area: 'Block A foundation' },
      { id: 'member-arun', name: 'Arun Das', email: 'arun@northline.demo', role: 'Supervisor', area: 'Structural works' },
      { id: 'member-meera', name: 'Meera Shah', email: 'meera@northline.demo', role: 'Engineer', area: 'Project controls' },
      { id: 'member-mateo', name: 'Mateo Ruiz', email: 'mateo@northline.demo', role: 'Project Manager', area: 'All areas' },
    ],
    activities: seedActivities('Northline Civic Centre'),
    dailyRecords: [
      {
        id: 'record-day-2',
        date: '16 Sep 2026',
        supervisor: 'Ravi Kumar',
        rawUpdate: 'Foundation excavation completed in Block A. Steel delivery received.',
        engineeringActivity: 'Block A footing excavation',
        location: 'Block A / Footing F1',
        level: 'L5',
        status: 'Completed',
        quantity: '120 m³',
        materialsReceived: '12 tonnes reinforcement steel',
        materialsUsed: 'Diesel 42 L',
        materialsRemaining: 'Steel 12 tonnes',
        labor: '18',
        duration: '7h 20m',
        delay: 'None reported',
      },
      {
        id: 'record-day-1',
        date: '15 Sep 2026',
        supervisor: 'Arun Das',
        rawUpdate: 'PCC started at the east footing. Pump reached site late.',
        engineeringActivity: 'Prepare PCC bed for F1',
        location: 'Block A / Footing F1',
        level: 'L6',
        status: 'At risk',
        quantity: '18 m³',
        materialsReceived: 'Cement 140 bags',
        materialsUsed: 'Concrete 18 m³',
        materialsRemaining: 'Cement 260 bags',
        labor: '24',
        duration: '5h 40m',
        delay: 'Pump arrival +2h',
      },
    ],
  };
}

function loadProjects(): Project[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Project[];
  } catch {
    // Fall back to the starting project when browser storage is unavailable.
  }
  return [seedProject()];
}

function createRecord(text: string, supervisor: string): DailyRecord {
  const normalized = text.toLowerCase();
  const isCompleted = /completed|complete|finished|done/.test(normalized);
  const hasDelay = /late|delay|behind|slip|issue|problem/.test(normalized);
  const hasSteel = /steel|rebar|reinforcement/.test(normalized);
  const hasConcrete = /pcc|concrete|pour/.test(normalized);
  const hasExcavation = /excavat|footing/.test(normalized);
  const quantityMatch = text.match(/\b\d+(?:\.\d+)?\s*(?:m3|m³|m2|m²|tonnes?|bags?|units?)\b/i);
  const laborMatch = text.match(/\b\d+\s*(?:workers?|labou?rs?|people)\b/i);
  const durationMatch = text.match(/\b\d+(?:\.\d+)?\s*(?:hours?|hrs?)\b/i);
  const engineeringActivity = hasExcavation
    ? 'Block A footing excavation'
    : hasConcrete
      ? 'Prepare PCC bed for F1'
      : hasSteel
        ? 'Footing F1 Reinforcement'
        : 'Field activity pending match';

  return {
    id: `record-${Date.now()}`,
    date: todayLabel(),
    supervisor,
    rawUpdate: text,
    engineeringActivity,
    location: /block a/i.test(text) ? 'Block A / Footing F1' : 'Site area pending',
    level: hasSteel || hasExcavation ? 'L5' : 'L6',
    status: hasDelay ? 'At risk' : isCompleted ? 'Completed' : 'In progress',
    quantity: quantityMatch?.[0] ?? 'Not stated',
    materialsReceived: /received|arrived|delivered/.test(normalized)
      ? hasSteel
        ? 'Reinforcement steel received'
        : 'Material delivery received'
      : 'Not stated',
    materialsUsed: hasConcrete ? 'Concrete / PCC used' : hasSteel ? 'Reinforcement steel used' : 'Not stated',
    materialsRemaining: 'Confirm in next update',
    labor: laborMatch?.[0] ?? 'Not stated',
    duration: durationMatch?.[0] ?? 'Not stated',
    delay: hasDelay ? 'Delay signal detected in update' : 'None reported',
  };
}

function makeProject(input: Omit<Project, 'id' | 'activities' | 'dailyRecords'>): Project {
  return {
    ...input,
    id: `project-${Date.now()}-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 18)}`,
    activities: seedActivities(input.name),
    dailyRecords: [],
  };
}

function DashboardNav() {
  return (
    <header className="workspace-header">
      <div className="max-width workspace-nav">
        <Link href="/" className="brand-link">
          <span className="brand workspace-brand"><span className="brand-mark"><span /></span>buildo plaz</span>
        </Link>
        <div className="workspace-nav-right">
          <span className="workspace-role">Engineer workspace</span>
          <Link href="/" className="workspace-exit">Exit workspace <ArrowRight size={13} /></Link>
        </div>
      </div>
    </header>
  );
}

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'projects' | 'new' | 'project'>('projects');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const selectedProject = projects.find((project) => project.id === selectedId);
  const updateProject = (updated: Project) => {
    setProjects((current) => current.map((project) => project.id === updated.id ? updated : project));
  };

  return (
    <div className="workspace-page">
      <DashboardNav />
      {view === 'new' && (
        <NewProject
          onCancel={() => setView('projects')}
          onCreate={(project) => {
            setProjects((current) => [...current, project]);
            setSelectedId(project.id);
            setView('project');
          }}
        />
      )}
      {view === 'project' && selectedProject && (
        <ProjectView project={selectedProject} onBack={() => setView('projects')} onUpdate={updateProject} />
      )}
      {view === 'projects' && (
        <ProjectList
          projects={projects}
          onNew={() => setView('new')}
          onOpen={(id) => {
            setSelectedId(id);
            setView('project');
          }}
        />
      )}
    </div>
  );
}

function ProjectList({ projects, onNew, onOpen }: { projects: Project[]; onNew: () => void; onOpen: (id: string) => void }) {
  const totalRecords = projects.reduce((sum, project) => sum + project.dailyRecords.length, 0);
  const delayed = projects.reduce((sum, project) => sum + project.dailyRecords.filter((record) => record.status === 'At risk').length, 0);

  return (
    <main className="workspace-main max-width">
      <div className="workspace-intro">
        <div>
          <div className="eyebrow">Central execution record / 01</div>
          <h1>Good morning.<br /><span>See what moved.</span></h1>
          <p>One place for every project update, from the supervisor&apos;s voice to the engineer&apos;s daily record.</p>
        </div>
        <button className="workspace-primary" onClick={onNew} data-testid="button-new-project"><Plus size={17} /> New project</button>
      </div>

      <div className="workspace-stats">
        <div><span>Projects</span><strong>{projects.length}</strong></div>
        <div><span>Daily records</span><strong>{totalRecords}</strong></div>
        <div><span>Open risks</span><strong className={delayed ? 'stat-warn' : ''}>{delayed}</strong></div>
        <div><span>Teams connected</span><strong>{projects.reduce((sum, project) => sum + project.members.length, 0)}</strong></div>
      </div>

      <div className="workspace-section-heading">
        <div><div className="section-label">Your projects</div><h2>Project control room</h2></div>
        <span className="mono-note">Select a project to see its daily table</span>
      </div>

      <div className="project-grid">
        {projects.map((project) => {
          const latest = project.dailyRecords[0];
          const progress = project.activities[0]?.progress ?? 0;
          return (
            <button className="project-card" key={project.id} onClick={() => onOpen(project.id)} data-testid={`card-project-${project.id}`}>
              <div className="project-card-top"><span className="project-type">{project.type}</span><ArrowRight size={17} /></div>
              <h3>{project.name}</h3>
              <p>{project.location} · {project.client}</p>
              <div className="project-progress-row"><span>Overall progress</span><strong>{progress}%</strong></div>
              <div className="project-progress"><i style={{ width: `${progress}%` }} /></div>
              <div className="project-card-bottom">
                <span><Users size={13} /> {project.members.length} members</span>
                <span><Table2 size={13} /> {project.dailyRecords.length} records</span>
              </div>
              {latest && <div className="project-latest"><span>Latest field signal</span><strong>{latest.engineeringActivity}</strong><small>{latest.date} · {latest.status}</small></div>}
            </button>
          );
        })}
        <button className="project-card project-card-new" onClick={onNew} data-testid="button-new-project-card">
          <span className="new-project-icon"><Plus size={22} /></span>
          <strong>Start a new project</strong>
          <span>Set up the team, L1–L6 plan, and daily record.</span>
        </button>
      </div>
    </main>
  );
}

function NewProject({ onCancel, onCreate }: { onCancel: () => void; onCreate: (project: Project) => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Building');
  const [location, setLocation] = useState('');
  const [client, setClient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [plannedEndDate, setPlannedEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', role: 'Supervisor', area: '' });

  const addMember = () => {
    const name = memberForm.name.trim();
    if (!name) return;
    setMembers((current) => [...current, {
      name,
      email: memberForm.email.trim(),
      role: memberForm.role,
      area: memberForm.area.trim(),
      id: `member-${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 14)}`,
    }]);
    setMemberForm({ name: '', email: '', role: 'Supervisor', area: '' });
  };

  const handleMemberKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addMember();
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate(makeProject({
      name,
      type,
      location: location || 'Location pending',
      client: client || 'Client pending',
      startDate: startDate || 'Not set',
      plannedEndDate: plannedEndDate || 'Not set',
      description,
      members,
    }));
  };

  return (
    <main className="workspace-main max-width">
      <button className="workspace-back" onClick={onCancel}><ArrowLeft size={15} /> All projects</button>
      <div className="workspace-form-heading"><div className="eyebrow">Project setup / 01</div><h1>Create the project.<br /><span>Connect the people.</span></h1><p>Start with the project basics, then add the supervisors and engineers who will keep the daily record moving.</p></div>
      <form className="new-project-layout" onSubmit={submit}>
        <section className="workspace-form-card">
          <div className="workspace-card-heading"><span className="step-number">01</span><div><strong>Project information</strong><span>What are we building?</span></div></div>
          <div className="form-grid">
            <label className="form-field form-field-wide"><span>Project name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="ABC Building Project" required data-testid="input-project-name" /></label>
            <label className="form-field"><span>Project type</span><select value={type} onChange={(event) => setType(event.target.value)}><option>Building</option><option>Bridge</option><option>Road</option><option>Railway</option><option>Pipeline</option><option>Industrial</option><option>Water infrastructure</option></select></label>
            <label className="form-field"><span>Location</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Hyderabad" /></label>
            <label className="form-field"><span>Client</span><input value={client} onChange={(event) => setClient(event.target.value)} placeholder="Client or owner" /></label>
            <label className="form-field"><span>Start date</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
            <label className="form-field"><span>Planned completion</span><input type="date" value={plannedEndDate} onChange={(event) => setPlannedEndDate(event.target.value)} /></label>
            <label className="form-field form-field-wide"><span>Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What should the team know about this project?" rows={4} /></label>
          </div>
        </section>

        <section className="workspace-form-card">
          <div className="workspace-card-heading"><span className="step-number">02</span><div><strong>Add project members</strong><span>Who keeps the work moving?</span></div></div>
          <div className="member-form">
            <input value={memberForm.name} onChange={(event) => setMemberForm({ ...memberForm, name: event.target.value })} onKeyDown={handleMemberKeyDown} placeholder="Name" aria-label="Member name" />
            <input value={memberForm.email} onChange={(event) => setMemberForm({ ...memberForm, email: event.target.value })} onKeyDown={handleMemberKeyDown} placeholder="Email" aria-label="Member email" />
            <select value={memberForm.role} onChange={(event) => setMemberForm({ ...memberForm, role: event.target.value })} aria-label="Member role"><option>Supervisor</option><option>Engineer</option><option>Project Manager</option><option>Chief Engineer</option><option>Contractor</option></select>
            <input value={memberForm.area} onChange={(event) => setMemberForm({ ...memberForm, area: event.target.value })} onKeyDown={handleMemberKeyDown} placeholder="Assigned area" aria-label="Assigned area" />
            <button type="button" className="icon-add" onClick={addMember} aria-label="Add member" data-testid="button-add-member"><Plus size={16} /><span>Add member</span></button>
          </div>
          <div className="member-list">
            {members.length === 0 && <div className="empty-members"><Users size={18} /><span>Add supervisors, engineers, and the project manager.</span></div>}
            {members.length > 0 && <div className="member-count">{members.length} {members.length === 1 ? 'person' : 'people'} added · add as many as this project needs</div>}
            {members.map((member) => <div className="member-row" key={member.id}><span className="member-avatar">{member.name.slice(0, 2).toUpperCase()}</span><div><strong>{member.name}</strong><small>{member.role} · {member.area || 'Area pending'}</small></div><button type="button" onClick={() => setMembers((current) => current.filter((item) => item.id !== member.id))} aria-label={`Remove ${member.name}`}><X size={14} /></button></div>)}
          </div>
          <div className="workspace-form-actions"><button type="button" className="workspace-secondary" onClick={onCancel}>Cancel</button><button type="submit" className="workspace-primary" data-testid="button-create-project"><Save size={15} /> Create project</button></div>
        </section>
      </form>
    </main>
  );
}

function ProjectView({ project, onBack, onUpdate }: { project: Project; onBack: () => void; onUpdate: (project: Project) => void }) {
  const [tab, setTab] = useState<'records' | 'plan' | 'team'>('records');
  const [transcript, setTranscript] = useState('');
  const [supervisor, setSupervisor] = useState(project.members.find((member) => member.role === 'Supervisor')?.name ?? project.members[0]?.name ?? 'Supervisor');
  const [recording, setRecording] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef('');

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const toggleRecording = async () => {
    if (recording) {
      setRecording(false);
      recognitionRef.current?.stop();
      return;
    }
    const Recognition = getRecognition();
    if (!Recognition) {
      setVoiceMessage('Live speech needs Chrome or Edge. You can type the update below.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setVoiceMessage('Microphone access is blocked. Allow it in browser settings, then try again.');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    transcriptRef.current = '';
    setTranscript('');
    setVoiceMessage('Listening. Tell Buildo what happened on site today.');
    recognition.onstart = () => setRecording(true);
    recognition.onresult = (event) => {
      let interim = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) transcriptRef.current = `${transcriptRef.current} ${result[0]?.transcript ?? ''}`.trim();
        else interim += result[0]?.transcript ?? '';
      }
      setTranscript(`${transcriptRef.current} ${interim}`.trim());
    };
    recognition.onerror = () => {
      setRecording(false);
      setVoiceMessage('Speech stopped. Check microphone access and try again.');
    };
    recognition.onend = () => {
      setRecording(false);
      if (transcriptRef.current) setVoiceMessage('Update captured. Review it, then add it to today’s table.');
    };
    recognition.start();
  };

  const addRecord = () => {
    if (!transcript.trim()) return;
    const record = createRecord(transcript.trim(), supervisor);
    const nextActivities = project.activities.map((activity) => {
      if (activity.name === record.engineeringActivity) {
        return { ...activity, progress: Math.min(100, activity.progress + 8), status: record.status };
      }
      return activity;
    });
    onUpdate({ ...project, activities: nextActivities, dailyRecords: [record, ...project.dailyRecords] });
    setTranscript('');
    transcriptRef.current = '';
    setVoiceMessage('Added to the daily project record.');
  };

  return (
    <main className="workspace-main max-width">
      <button className="workspace-back" onClick={onBack}><ArrowLeft size={15} /> All projects</button>
      <div className="project-view-heading">
        <div><div className="eyebrow">Project execution record</div><h1>{project.name}</h1><p>{project.location} · {project.client} · {project.startDate} to {project.plannedEndDate}</p></div>
        <div className="project-health"><span>Project progress</span><strong>{project.activities[0]?.progress ?? 0}%</strong><div><i style={{ width: `${project.activities[0]?.progress ?? 0}%` }} /></div></div>
      </div>
      <div className="project-tabs" role="tablist">
        <button className={tab === 'records' ? 'active' : ''} onClick={() => setTab('records')}><Table2 size={15} /> Daily records <b>{project.dailyRecords.length}</b></button>
        <button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}><Layers3 size={15} /> L1–L6 plan</button>
        <button className={tab === 'team' ? 'active' : ''} onClick={() => setTab('team')}><Users size={15} /> Team <b>{project.members.length}</b></button>
      </div>
      {tab === 'records' && (
        <>
          <section className="record-capture-layout">
            <div className="record-capture">
              <div className="workspace-card-heading"><span className="step-number">TODAY</span><div><strong>Supervisor field update</strong><span>Speak it once. Buildo keeps the record.</span></div></div>
              <div className="capture-controls">
                <label className="form-field"><span>Submitted by</span><select value={supervisor} onChange={(event) => setSupervisor(event.target.value)}>{project.members.filter((member) => member.role === 'Supervisor' || member.role === 'Engineer').map((member) => <option key={member.id}>{member.name}</option>)}<option>New supervisor</option></select></label>
                <button className={`workspace-mic ${recording ? 'recording' : ''}`} onClick={toggleRecording}><Mic size={18} /> {recording ? 'Stop listening' : 'Speak update'}</button>
              </div>
              <textarea className="workspace-transcript" value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Example: Today Block A footing excavation was completed. Twelve tonnes of steel arrived. We used 18 workers..." rows={5} data-testid="input-daily-update" />
              {voiceMessage && <div className={`workspace-voice-message ${recording ? 'listening' : ''}`} role="status"><span />{voiceMessage}</div>}
              <div className="capture-footer"><button className="sample-link" onClick={() => { setTranscript(SAMPLE_UPDATE); setVoiceMessage('Example loaded. Edit it or add this update to the table.'); }}>Use a sample update</button><button className="workspace-primary" onClick={addRecord} disabled={!transcript.trim()} data-testid="button-add-daily-record"><Check size={15} /> Convert &amp; add to table</button></div>
            </div>
            <aside className="record-capture-aside"><div className="eyebrow">What Buildo records</div><h3>Every useful detail, in one daily row.</h3><div className="capture-detail-list"><span><ClipboardList size={14} /> Work completed</span><span><Package size={14} /> Materials in / used / left</span><span><HardHat size={14} /> Labour and duration</span><span><CalendarDays size={14} /> Delay and schedule impact</span></div><p>Supervisors can speak in site language. Engineers see the same update in clear engineering terms.</p></aside>
          </section>
          <section className="daily-table-section">
            <div className="workspace-section-heading"><div><div className="section-label">One table / every day</div><h2>Daily project record</h2></div><span className="mono-note">{project.dailyRecords.length} field signals captured</span></div>
            <div className="daily-table-wrap">
              {project.dailyRecords.length === 0 ? <div className="empty-records"><Table2 size={22} /><strong>Your first daily record will appear here.</strong><span>Ask a supervisor to speak what happened on site today.</span></div> : <table className="daily-table"><thead><tr><th>Date</th><th>Supervisor</th><th>Engineering record</th><th>Level</th><th>Status</th><th>Quantity</th><th>Materials</th><th>Labour</th><th>Time</th><th>Delay</th></tr></thead><tbody>{project.dailyRecords.map((record) => <tr key={record.id}><td>{record.date}</td><td><strong>{record.supervisor}</strong></td><td><strong>{record.engineeringActivity}</strong><small>{record.location}</small></td><td><span className={`level-badge ${record.level.toLowerCase()}`}>{record.level}</span></td><td><span className={`record-status ${record.status.toLowerCase().replace(' ', '-')}`}>{record.status}</span></td><td>{record.quantity}</td><td><strong>{record.materialsReceived}</strong><small>Used: {record.materialsUsed}<br />Left: {record.materialsRemaining}</small></td><td>{record.labor}</td><td>{record.duration}</td><td>{record.delay}</td></tr>)}</tbody></table>}
            </div>
          </section>
        </>
      )}
      {tab === 'plan' && <PlanView activities={project.activities} />}
      {tab === 'team' && <TeamView members={project.members} />}
    </main>
  );
}

function PlanView({ activities }: { activities: Activity[] }) {
  const levelLegend = [
    { level: 'L1', label: 'Project' },
    { level: 'L2', label: 'Phase' },
    { level: 'L3', label: 'Area' },
    { level: 'L4', label: 'Work package' },
    { level: 'L5', label: 'Activity' },
    { level: 'L6', label: 'Execution task' },
  ];

  return (
    <section className="plan-section">
      <div className="plan-intro"><div><div className="section-label">Schedule hierarchy / L1 to L6</div><h2>See the whole plan.<br /><span>Watch every level move.</span></h2></div><p>Buildo records the full chain from project to execution task. Dark levels set the structure; red levels show the work fronts that drive daily progress.</p></div>
      <div className="level-legend" aria-label="Schedule level legend">{levelLegend.map((item) => <div className={`level-legend-item legend-${item.level.toLowerCase()}`} key={item.level}><strong>{item.level}</strong><span>{item.label}</span></div>)}</div>
      <div className="hierarchy-card">
        <div className="hierarchy-head"><span>Code</span><span>Activity</span><span>Discipline</span><span>Status</span><span>Progress</span></div>
        {activities.map((activity) => <div className={`hierarchy-row level-${activity.level}`} key={activity.id}><span className="hierarchy-code">{activity.code}</span><div><strong>{activity.name}</strong><small>Parent: {activity.parent}</small></div><span>{activity.discipline}</span><span className={`record-status ${activity.status.toLowerCase().replace(' ', '-')}`}>{activity.status}</span><div className="hierarchy-progress"><i style={{ width: `${activity.progress}%` }} /><small>{activity.progress}%</small></div></div>)}
      </div>
      <div className="execution-note"><Layers3 size={18} /><div><strong>Every level is part of the record.</strong><span>Daily voice updates attach to the detailed L5 and L6 activities, while the full L1–L6 chain keeps every signal in its project context.</span></div></div>
    </section>
  );
}

function TeamView({ members }: { members: Member[] }) {
  return (
    <section className="team-section">
      <div className="workspace-section-heading"><div><div className="section-label">Project members</div><h2>Everyone on the same record.</h2></div><span className="mono-note">{members.length} people connected</span></div>
      <div className="team-grid">{members.map((member) => <article className="team-card" key={member.id}><span className="member-avatar">{member.name.slice(0, 2).toUpperCase()}</span><div><strong>{member.name}</strong><span>{member.role}</span><small>{member.email} · {member.area || 'Area pending'}</small></div><CheckCircle2 size={17} /></article>)}</div>
    </section>
  );
}