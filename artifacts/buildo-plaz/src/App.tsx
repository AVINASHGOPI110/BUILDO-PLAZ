import { useEffect, useRef, useState } from 'react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Menu,
  Mic,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Dashboard } from '@/pages/dashboard';

const queryClient = new QueryClient();

const EXAMPLE_UPDATE =
  'We poured the east stair landing this morning. Steel is in and the crew is stripping forms after lunch. We are about half a day behind because the pump arrived late, but we can make it back on the next pour.';

type SpeechResult = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechResultEvent = {
  resultIndex: number;
  results: ArrayLike<SpeechResult>;
};

type SpeechErrorEvent = {
  error?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  const browserWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
}

function Brand() {
  return (
    <span className="brand" data-testid="text-brand">
      <span className="brand-mark"><span /></span>
      buildo plaz
    </span>
  );
}

function SiteNav({ dark = false }: { dark?: boolean }) {
  const [, setLocation] = useLocation();
  return (
    <header className={`nav-wrap ${dark ? 'demo-header' : ''}`}>
      <div className="max-width nav">
        <Link href="/" className="brand-link" data-testid="link-home"><Brand /></Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/#how-it-works" data-testid="link-how-it-works">How it works</Link>
          <Link href="/intelligence" data-testid="link-intelligence">Progress intelligence</Link>
          <Link href="/#field-notes" data-testid="link-field-notes">Field notes</Link>
          <Link href="/dashboard" data-testid="link-dashboard">Workspace</Link>
        </nav>
        <div className="hero-actions">
          <Link href="/dashboard" className="nav-demo" data-testid="link-start-demo">Open workspace <ArrowUpRight size={14} /></Link>
          <button className="mobile-menu" aria-label="Open menu" data-testid="button-mobile-menu" onClick={() => setLocation('/demo')}><Menu size={22} /></button>
        </div>
      </div>
    </header>
  );
}

function Ticker() {
  return (
    <div className="ticker">
      <div className="max-width ticker-inner">
        <span><span className="accent">Buildo signal 07:42</span> / East stair core</span>
        <span>Voice update received</span>
        <span>Schedule intelligence online</span>
        <span className="accent">No spreadsheet archaeology</span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="max-width hero-grid">
        <div className="reveal">
          <div className="eyebrow">The site-to-schedule layer</div>
          <h1>The site has a voice. Your schedule should <em>hear it.</em></h1>
          <p className="hero-lede">Buildo Plaz turns a supervisor&apos;s two-minute update into a structured record, a verified activity match, and the next risk worth knowing about.</p>
          <div className="hero-actions">
            <Link href="/demo" className="button-primary" data-testid="link-hero-demo">Try the live demo <ArrowRight size={16} /></Link>
            <a href="#how-it-works" className="button-ghost" data-testid="link-see-how">See how it works <ChevronRight size={15} /></a>
          </div>
          <div className="hero-note"><span className="live-dot" /> Built for the people who keep the pour moving</div>
        </div>
        <div className="hero-visual reveal delay-2" aria-label="Buildo Plaz voice update preview">
          <div className="site-card">
            <div className="site-card-top">
              <span className="site-card-title">East stair core / daily log</span>
              <span className="live-label"><span className="live-dot" /> live signal</span>
            </div>
            <div className="signal-line" aria-hidden="true">{Array.from({ length: 15 }, (_, index) => <i key={index} />)}</div>
            <p className="quote">“We poured the <mark>east stair landing</mark> this morning. Steel is in and we&apos;re stripping forms after lunch…”</p>
            <div className="interpretation">
              <div className="interpretation-head"><span>Buildo interpretation</span><span>98.4% match</span></div>
              <div className="interpretation-body">
                <div><span>activity</span><strong>STR-042 · Stair landing pour</strong></div>
                <div><span>schedule effect</span><strong>+ 0.5 day recovery window</strong></div>
              </div>
            </div>
          </div>
          <div className="hero-tag">FIELD NOTE / 0147</div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { number: '01', icon: <Mic size={20} />, title: 'Say what happened', copy: 'A supervisor records the update from the field. No forms, no codes, no perfect signal required.' },
    { number: '02', icon: <Sparkles size={20} />, title: 'Buildo makes it legible', copy: 'Speech becomes a timestamped engineering record, with quantities, constraints, and a schedule activity attached.' },
    { number: '03', icon: <Target size={20} />, title: 'The team sees what moves', copy: 'Approve the interpretation and the plan updates. If the next handoff is at risk, everyone knows before the meeting.' },
  ];
  return (
    <section className="section" id="how-it-works">
      <div className="max-width">
        <div className="section-label">One update / three useful outputs</div>
        <h2 className="section-heading">From spoken context to <strong>scheduled action.</strong></h2>
        <div className="steps">
          {steps.map((step, index) => (
            <article className={`step reveal delay-${index + 1}`} key={step.number} data-testid={`card-step-${step.number}`}>
              <div className="step-index">{step.number} <span className="step-icon">{step.icon}</span></div>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgressPreview() {
  const rows = [
    { activity: 'STR-042 / East stair landing', planned: 72, actual: 66, delta: '- 0.5 day', status: 'watch', warn: true },
    { activity: 'CON-118 / Core wall pour', planned: 48, actual: 48, delta: 'on plan', status: 'on plan', warn: false },
    { activity: 'MEP-031 / Level 04 sleeves', planned: 31, actual: 39, delta: '+ 0.5 day', status: 'ahead', warn: false },
  ];
  return (
    <section className="board-section" id="field-notes">
      <div className="max-width">
        <div className="board-heading-row">
          <div>
            <div className="section-label">A clearer view of the job</div>
            <h2 className="section-heading">The schedule gets <strong>eyes on it.</strong></h2>
          </div>
          <div className="board-meta">Northline Civic Centre<br />Last signal 07:42 / Tuesday</div>
        </div>
        <div className="board reveal delay-2">
          <div className="board-top"><strong>Lookahead / Level 04</strong><span>updated from 18 field signals</span></div>
          <div className="board-grid">
            <div className="board-cell header">Activity</div><div className="board-cell header">Planned</div><div className="board-cell header">Actual</div><div className="board-cell header">Signal</div>
            {rows.map((row, index) => (
              <div className="board-grid" key={row.activity} style={{ gridColumn: '1 / -1' }} data-testid={`row-activity-${index}`}>
                <div className="board-cell activity"><span>{row.activity.split(' / ')[0]}</span><span>{row.activity.split(' / ')[1]}</span></div>
                <div className="board-cell"><div className="bar"><i style={{ width: `${row.planned}%` }} /></div><span className="delta">{row.planned}% complete</span></div>
                <div className="board-cell"><div className="bar actual"><i style={{ width: `${row.actual}%` }} /></div><span className="delta">{row.actual}% complete</span></div>
                <div className="board-cell"><span className={`status-pill ${row.warn ? 'warn' : ''}`}>{row.status}</span><div className="delta" style={{ marginTop: 8 }}>{row.delta}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <div className="site-shell">
      <SiteNav />
      <main>
        <Hero />
        <Ticker />
        <HowItWorks />
        <ProgressPreview />
        <section className="quote-section">
          <div className="max-width quote-grid">
            <div>
              <div className="section-label">The human part matters</div>
              <p className="quote-large">The best data is already being said out loud.</p>
              <div className="quote-attribution"><span className="avatar">MR</span><div><strong>Mateo Ruiz</strong><div className="attribution-label">Project superintendent / Northline</div></div></div>
            </div>
            <div className="quote-side">“Before Buildo, the update lived in a voice note, then a notebook, then somebody&apos;s memory. Now the field crew talks once and the whole project can work from the same version of what happened.”</div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

type DemoStage = 'capture' | 'processing' | 'review' | 'approved';

function Demo() {
  const [stage, setStage] = useState<DemoStage>('capture');
  const [update, setUpdate] = useState('');
  const [recording, setRecording] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'unsupported' | 'denied' | 'error'>('idle');
  const [voiceMessage, setVoiceMessage] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef('');

  useEffect(() => () => {
    recognitionRef.current?.stop();
  }, []);

  const useExample = () => {
    recognitionRef.current?.stop();
    transcriptRef.current = EXAMPLE_UPDATE;
    setUpdate(EXAMPLE_UPDATE);
    setRecording(false);
    setVoiceState('idle');
    setVoiceMessage('Example loaded. You can edit it or record your own update.');
  };

  const reset = () => {
    recognitionRef.current?.stop();
    setStage('capture');
    setUpdate('');
    setRecording(false);
    setVoiceState('idle');
    setVoiceMessage('');
    transcriptRef.current = '';
  };

  const startAnalysis = () => {
    if (!update.trim()) return;
    recognitionRef.current?.stop();
    setStage('processing');
    window.setTimeout(() => setStage('review'), 1600);
  };

  const toggleRecording = async () => {
    if (recording) {
      setRecording(false);
      recognitionRef.current?.stop();
      return;
    }

    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setVoiceState('unsupported');
      setVoiceMessage('Live speech input is not supported in this browser. Try Chrome or Edge, or type the update below.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceState('unsupported');
      setVoiceMessage('This browser cannot request microphone access. Try the latest Chrome or Edge over a secure connection.');
      return;
    }

    try {
      const microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphone.getTracks().forEach((track) => track.stop());
    } catch {
      setVoiceState('denied');
      setVoiceMessage('Microphone access is blocked. Allow microphone access in your browser settings, then try again.');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    transcriptRef.current = '';
    setUpdate('');
    setVoiceState('listening');
    setVoiceMessage('Listening now. Speak naturally, then press the microphone to stop.');

    recognition.onstart = () => {
      setRecording(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) {
          transcriptRef.current = `${transcriptRef.current} ${text}`.trim();
        } else {
          interimTranscript += text;
        }
      }

      const combinedTranscript = `${transcriptRef.current} ${interimTranscript}`.trim();
      if (combinedTranscript) {
        setUpdate(combinedTranscript);
        setVoiceMessage('Words captured. Keep speaking or press the microphone to finish.');
      }
    };

    recognition.onerror = (event) => {
      setRecording(false);
      const permissionError = event.error === 'not-allowed' || event.error === 'service-not-allowed';
      setVoiceState(permissionError ? 'denied' : 'error');
      setVoiceMessage(
        permissionError
          ? 'Microphone access is blocked. Allow it in your browser settings, then try again.'
          : 'The speech service stopped unexpectedly. Check your connection and try again.',
      );
    };

    recognition.onend = () => {
      setRecording(false);
      if (transcriptRef.current.trim()) {
        setVoiceState('idle');
        setVoiceMessage('Voice update captured. Edit the transcript if needed, then interpret it.');
      }
    };

    try {
      recognition.start();
    } catch {
      setRecording(false);
      setVoiceState('error');
      setVoiceMessage('The microphone could not start. Try again in a moment.');
    }
  };

  return (
    <div className="demo-page site-shell">
      <SiteNav dark />
      <main className="demo-main">
        <div className="max-width">
          <div className="demo-intro reveal">
            <div><div className="eyebrow">Interactive field signal / 01</div><h1>Give us the update.<br />We&apos;ll find the <em>work.</em></h1></div>
            <p>Speak naturally from the field. Your browser captures the words, then Buildo turns them into an engineering record you can review.</p>
          </div>
          <div className="demo-layout">
            <section className="demo-panel reveal delay-1">
              {stage === 'capture' && (
                <>
                  <div className="panel-title"><strong>Supervisor voice update</strong><span>Input / field note</span></div>
                  <div className="record-box">
                    <div className="record-label"><span><AudioLines size={13} /> &nbsp; Northline Civic Centre</span><span>Today / 07:42</span></div>
                    <textarea value={update} onChange={(event) => setUpdate(event.target.value)} placeholder="Tell us what changed on site..." aria-label="Voice update transcript" data-testid="input-voice-update" />
                    <div className="record-bottom"><span className="record-duration">{recording ? 'LISTENING...' : update ? 'WORDS CAPTURED' : 'READY TO SPEAK'}</span><button className={`mic-button ${recording ? 'recording' : ''}`} onClick={toggleRecording} aria-label={recording ? 'Stop listening' : 'Start microphone'} data-testid="button-record"><Mic size={20} /></button></div>
                  </div>
                  {voiceMessage && <div className={`voice-feedback ${voiceState}`} role="status"><span className="voice-feedback-dot" />{voiceMessage}</div>}
                  <div className="demo-options"><button className="sample-button" onClick={useExample} data-testid="button-use-example">Use the provided example</button><button className="analyze-button" onClick={startAnalysis} disabled={!update.trim()} data-testid="button-analyze">Interpret update <ArrowRight size={14} /></button></div>
                  <div className="demo-footnote"><ShieldCheck size={14} /> Your transcript stays in this browser session until you submit it.</div>
                </>
              )}
              {stage === 'processing' && <ProcessingState />}
              {stage === 'review' && <ReviewState transcript={update} onApprove={() => setStage('approved')} onReset={reset} />}
              {stage === 'approved' && <ApprovedState onReset={reset} />}
            </section>
            <aside>
              <div className="side-card reveal delay-2">
                <div className="eyebrow">What happens next</div>
                <h3>One field signal. A better lookahead.</h3>
                <p>Buildo extracts the facts a planner needs, then puts the interpretation in front of a person before it touches the record.</p>
                <div className="side-kpis">
                  <div className="side-kpi"><b>98.4%</b><span>activity match</span></div>
                  <div className="side-kpi"><b>+0.5d</b><span>recovery window</span></div>
                  <div className="side-kpi"><b>L5 / L6</b><span>schedule depth</span></div>
                  <div className="side-kpi"><b>07:42</b><span>signal received</span></div>
                </div>
              </div>
              <div className="impact-card reveal delay-3">
                <div className="panel-title"><strong>Live project impact</strong><span>{stage === 'approved' ? 'updated now' : 'waiting for signal'}</span></div>
                <div className="impact-stat"><b>{stage === 'approved' ? '66%' : '—'}</b><span>East stair landing<br />actual completion</span></div>
                <p>{stage === 'approved' ? 'The approved field note is now part of the project record.' : 'Approve the interpretation to send a signal into the progress board.'}</p>
                {stage === 'approved' && <div className="risk-row"><CircleAlert className="risk-icon" size={16} /><span>Downstream risk surfaced: Level 04 drywall handoff may slip.</span></div>}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProcessingState() {
  return (
    <div className="processing-state" data-testid="status-processing">
      <div className="panel-title"><strong>Reading the field signal</strong><span>Buildo engine / active</span></div>
      <div className="processing-row"><div className="processing-indicator" /><div><strong>Finding the engineering facts</strong><span>Transcribing audio, resolving activity language</span></div></div>
      <div className="skeleton" /><div className="skeleton short" /><div className="skeleton tiny" />
      <div className="skeleton" /><div className="skeleton short" />
    </div>
  );
}

function ReviewState({ transcript, onApprove, onReset }: { transcript: string; onApprove: () => void; onReset: () => void }) {
  const normalizedTranscript = transcript.toLowerCase();
  const activity = normalizedTranscript.includes('wall')
    ? 'CON-118 / Core wall pour'
    : normalizedTranscript.includes('sleeve') || normalizedTranscript.includes('electrical')
      ? 'MEP-031 / Level 04 sleeves'
      : 'STR-042 / East stair landing pour';
  const hasDelaySignal = /late|delay|behind|slip|problem|issue/.test(normalizedTranscript);
  const location = normalizedTranscript.includes('east')
    ? 'east stair landing'
    : normalizedTranscript.includes('wall')
      ? 'core wall'
      : 'field activity';

  return (
    <div data-testid="status-review">
      <div className="panel-title"><strong>Review before it reaches the plan</strong><span>Human approval required</span></div>
      <div className="review-section"><h4>Clean transcription</h4><div className="transcript-card">{transcript}</div></div>
      <div className="review-section"><h4>Engineering interpretation</h4><div className="tag-row"><span className="tag">{location}</span><span className="tag">{normalizedTranscript.includes('steel') ? 'steel placement' : 'site update'}</span><span className="tag">{normalizedTranscript.includes('complete') || normalizedTranscript.includes('finished') ? 'work complete' : 'work in progress'}</span><span className="tag">{hasDelaySignal ? 'schedule risk detected' : 'no delay signal'}</span></div></div>
      <div className="review-section"><h4>Best schedule match</h4><div className="match-card"><div><strong>{activity}</strong><span>Matched from your transcript · Northline Civic Centre</span></div><div className="match-score"><b>{activity.startsWith('STR') ? '98.4%' : '86.7%'}</b>confidence</div></div></div>
      <div className="approve-row"><button className="edit-button" onClick={onReset} data-testid="button-edit-update">Edit update</button><button className="approve-button" onClick={onApprove} data-testid="button-approve"><Check size={15} /> Approve &amp; update plan</button></div>
    </div>
  );
}

function ApprovedState({ onReset }: { onReset: () => void }) {
  return (
    <div data-testid="status-approved">
      <div className="approved-banner"><CheckCircle2 size={17} /> Approved. The record and progress signal are now live.</div>
      <div className="panel-title"><strong>Progress intelligence unlocked</strong><span>Signal / STR-042</span></div>
      <div className="review-section"><h4>What changed</h4><div className="match-card"><div><strong>STR-042 / East stair landing pour</strong><span>Actual completion updated from field signal</span></div><div className="match-score"><b>66%</b>actual</div></div></div>
      <div className="review-section"><h4>Downstream impact</h4><div className="transcript-card">Level 04 drywall handoff now has a <strong>34% chance of slipping</strong> if the next pour does not recover the half day.</div></div>
      <div className="approve-row"><button className="reset-button" onClick={onReset} data-testid="button-reset-demo"><RefreshCw size={12} /> Run another signal</button><Link href="/intelligence" className="approve-button" data-testid="link-view-intelligence">View project intelligence <ArrowUpRight size={14} /></Link></div>
    </div>
  );
}

function Intelligence() {
  const bars = [
    { label: 'STR-042 / East stair landing', plan: 72, actual: 66, delta: '- 0.5d', behind: true },
    { label: 'CON-118 / Core wall pour', plan: 48, actual: 48, delta: 'on plan', behind: false },
    { label: 'MEP-031 / Level 04 sleeves', plan: 31, actual: 39, delta: '+ 0.5d', behind: false },
    { label: 'ARC-086 / Drywall handoff', plan: 18, actual: 12, delta: 'at risk', behind: true },
  ];
  return (
    <div className="intelligence-page site-shell">
      <SiteNav dark />
      <main className="intel-main">
        <div className="max-width">
          <div className="intel-top reveal"><div><div className="eyebrow">Project intelligence / Northline Civic Centre</div><h1>See the gap.<br /><span style={{ color: 'var(--lime)' }}>Move before it grows.</span></h1></div><p>Buildo connects the small facts from the field to the bigger decisions in the schedule. This is the view a manager opens at 07:45.</p></div>
          <section className="intel-board reveal delay-1" data-testid="card-progress-intelligence">
            <div className="intel-board-head"><span>Lookahead health / 14 June</span><b>18 field signals synced</b></div>
            <div className="intel-bars">
              {bars.map((bar) => <div className="intel-bar-row" key={bar.label}><label>{bar.label}</label><div className="intel-track"><i className="planned" style={{ width: `${bar.plan}%` }} /><i className={`actual ${bar.behind ? 'behind' : ''}`} style={{ width: `${bar.actual}%` }} /></div><small>{bar.delta}</small></div>)}
            </div>
            <div className="intel-legend"><span><i className="legend-dot plan" /> planned</span><span><i className="legend-dot" /> actual</span><span><i className="legend-dot warn" /> risk signal</span></div>
          </section>
          <div className="intel-cards">
            <article className="risk-card reveal delay-2"><div className="eyebrow">Downstream risk / surfaced 07:42</div><h2>Drywall handoff is losing its buffer.</h2><p>The east stair landing is 6 points behind plan. The handoff to Level 04 drywall now carries a 34% slip probability. One recovery decision today protects Thursday&apos;s inspection.</p><Link href="/demo" data-testid="link-resolve-risk">Open the source signal <ArrowUpRight size={13} /></Link></article>
            <article className="intel-signal reveal delay-3"><strong>Signal ledger</strong><div className="signal-item"><span>Steel placement complete</span><b>verified</b></div><div className="signal-item"><span>Pump arrival delay</span><b>+ 0.5d</b></div><div className="signal-item"><span>Recovery window</span><b>available</b></div><div className="signal-item"><span>Next decision</span><b>today</b></div></article>
          </div>
        </div>
      </main>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="max-width">
        <div className="footer-grid">
          <div><div className="eyebrow">Buildo Plaz / 2025</div><h2>Close the gap between the site and the <span>schedule.</span></h2><p>Made for the people who turn plans into places. Bring the field into focus.</p></div>
          <div className="footer-links"><span>Explore</span><Link href="/demo" data-testid="link-footer-demo">Live demo</Link><Link href="/intelligence" data-testid="link-footer-intelligence">Progress intelligence</Link><a href="#how-it-works" data-testid="link-footer-method">How it works</a></div>
          <div className="footer-links"><span>Built for</span><a href="#field-notes">Superintendents</a><a href="#field-notes">Planners</a><a href="#field-notes">Project teams</a></div>
        </div>
        <div className="footer-bottom"><span>Signal in. Clarity out.</span><span>Buildo Plaz / field intelligence for construction</span></div>
      </div>
    </footer>
  );
}

function NotFound() {
  return <div className="site-shell"><SiteNav /><main className="hero"><div className="max-width"><div className="eyebrow">404 / signal lost</div><h1>That page isn&apos;t on the <em>plan.</em></h1><Link className="button-primary" href="/" data-testid="link-back-home">Back to the live site <ArrowRight size={16} /></Link></div></main></div>;
}

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/demo" component={Demo} /><Route path="/intelligence" component={Intelligence} /><Route path="/dashboard" component={Dashboard} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}