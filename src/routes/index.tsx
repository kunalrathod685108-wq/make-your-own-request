import { createFileRoute } from "@tanstack/react-router";
import { MusicSearch } from '@/components/music-search';
import { SongStudio } from '@/components/song-studio';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI in Music & Entertainment" },
      { name: "description", content: "Discover songs with AI music search, explore live music charts, and learn how AI is reshaping entertainment." },
      { property: "og:title", content: "AI in Music & Entertainment" },
      { property: "og:description", content: "Find songs for your mood, browse trending music, and explore AI in music and entertainment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const agenda = [
  ["The Rise of AI", "Why creative industries are embracing intelligent systems"],
  ["Music Creation", "Composition, generation, and AI-powered songwriting tools"],
  ["Production & Mastering", "Mixing, sound design, and automated studio workflows"],
  ["Film, TV & Games", "Script, VFX, scoring, and interactive storytelling"],
  ["Personalization", "Recommendations, fan experiences, and live events"],
  ["Challenges & Future", "Ethics, rights, and where the industry is heading"],
] as const;

const rise = [
  ["Speed", "AI generates melodies, stems, and full tracks in seconds — compressing weeks of studio time into minutes."],
  ["Scale", "Personalized soundtracks, infinite variations, and adaptive content for millions of users simultaneously."],
  ["Access", "Professional-grade tools now available to independent creators, democratizing high-end production."],
] as const;

const tools = [
  ["Suno & Udio", "Text-to-music generation of full songs with vocals and lyrics"],
  ["AIVA & Amper", "Classical and commercial composition assistants for film & ads"],
  ["Google MusicLM", "Research-grade text and image conditioned audio models"],
  ["OpenAI Jukebox", "Neural net that generates music in the style of popular artists"],
] as const;

const production = [
  ["Intelligent Mixing", "AI analyzes tracks and suggests balance, EQ, and compression settings tailored to genre and target loudness."],
  ["Stem Separation", "Real-time isolation of vocals, drums, bass, and instruments from mixed tracks for remixing and sampling."],
  ["Mastering Assistants", "Cloud services deliver broadcast-ready masters with style matching and reference track comparison."],
  ["Sound Design", "Generative models create unique textures, atmospheres, and effects that expand the sonic palette."],
] as const;

const stack: [string, string[]][] = [
  ["Script & Story", ["Plot generation & outline tools", "Dialogue refinement assistants", "Character consistency checkers"]],
  ["Visual Effects", ["AI upscaling & frame interpolation", "Background generation & cleanup", "Deepfake-safe face replacement"]],
  ["Scoring & Audio", ["Adaptive game soundtracks", "Emotion-driven music beds", "Automated Foley & ambience"]],
  ["Interactive", ["Player-responsive narratives", "Procedural level design", "NPC dialogue generation"]],
];

const stats = [
  ["70%+", "of listening time on major platforms is driven by recommendation algorithms"],
  ["Real-time", "adaptive playlists that evolve with mood, context, and activity"],
  ["1:1", "personalized concert visuals, setlists, and merch recommendations"],
] as const;

const ethics = [
  ["Copyright & Ownership", "Who owns AI-generated music? Training data rights, derivative works, and artist compensation remain unsettled."],
  ["Authenticity", "Listeners and fans increasingly value human authorship. Transparency about AI involvement is becoming essential."],
  ["Job Displacement", "Session musicians, junior composers, and editors face pressure as AI handles more routine creative tasks."],
  ["Bias & Quality", "Models reflect the data they are trained on — cultural bias, homogenization of style, and quality control are ongoing issues."],
] as const;

const future = [
  ["Now", "Co-creation tools", "Artists treat AI as a collaborator for ideation, arrangement, and rapid prototyping."],
  ["Near", "Hyper-personal media", "Dynamic soundtracks and stories that adapt in real time to individual users."],
  ["Next", "New business models", "AI-native labels, rights frameworks, and creator economies built around generative content."],
  ["Ahead", "Human + AI artistry", "The most valued work will combine emotional intelligence of humans with scale of machines."],
] as const;

const takeaways = [
  "AI accelerates creation without replacing the need for human taste and emotion.",
  "Music production, film, and games are all being reshaped by generative models.",
  "Personalization at scale is the biggest opportunity for artists and platforms.",
  "Ethics, rights, and transparency will define the winners of the next decade.",
];

const n = (i: number) => String(i + 1).padStart(2, "0");

function Section({ id, num, label, title, children }: { id: string; num: string; label: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl border-t border-border px-6 py-20 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">{num} / {label}</p>
      <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">{title}</h2>
      <div className="mt-12">{children}</div>
    </section>
  );
}

function Card({ k, title, body }: { k?: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary">
      {k && <span className="font-display text-sm text-primary">{k}</span>}
      <h3 className="mt-2 text-xl font-bold">{title}</h3>
      <p className="mt-3 text-muted-foreground">{body}</p>
    </div>
  );
}

function Index() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <header className="bg-glow relative flex flex-col justify-center px-6 py-16 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Artificial Intelligence · Music · Entertainment</p>
          <h1 className="mt-6 text-4xl font-extrabold leading-[0.95] sm:text-6xl md:text-7xl lg:text-9xl">
            AI in<br />Music &<br /><span className="text-primary">Entertainment</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground md:text-xl">
            How artificial intelligence is reshaping creation, discovery, and the fan experience.
          </p>
          <p className="mt-12 text-xs uppercase tracking-[0.2em] text-muted-foreground">Creation · Production · Personalization · The Future</p>
        </div>
      </header>

      <MusicSearch />
      <SongStudio />

      <Section id="agenda" num="01" label="Agenda" title="What we'll explore today.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agenda.map(([t, b], i) => <Card key={t} k={n(i)} title={t} body={b} />)}
        </div>
      </Section>

      <Section id="rise" num="02" label="The Rise of AI" title="Creative industries are moving from tools to collaborators.">
        <div className="grid gap-4 md:grid-cols-3">
          {rise.map(([t, b]) => (
            <div key={t} className="border-l-2 border-primary pl-6">
              <h3 className="text-3xl font-extrabold uppercase">{t}</h3>
              <p className="mt-3 text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="creation" num="03" label="Music Creation" title="From blank page to finished track.">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {tools.map(([t, b]) => <Card key={t} title={t} body={b} />)}
          </div>
          <div className="rounded-xl bg-primary p-8 text-primary-foreground">
            <p className="text-xs font-bold uppercase tracking-[0.25em]">Key Shift</p>
            <p className="mt-4 font-display text-2xl font-bold leading-snug">AI is no longer just a tool — it is becoming a creative partner that suggests, iterates, and co-writes.</p>
            <p className="mt-6 opacity-80">Artists use it for ideation, writers for hooks, and producers for rapid prototyping of entire arrangements.</p>
          </div>
        </div>
      </Section>

      <Section id="production" num="04" label="Production & Mastering" title="The modern studio runs on intelligence.">
        <div className="grid gap-4 md:grid-cols-2">
          {production.map(([t, b], i) => <Card key={t} k={n(i)} title={t} body={b} />)}
        </div>
      </Section>

      <Section id="film" num="05" label="Film, TV & Games" title="Beyond music: AI across the entertainment stack.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stack.map(([t, items]) => (
            <div key={t} className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold text-primary">{t}</h3>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                {items.map((x) => <li key={x}>▸ {x}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="personalization" num="06" label="Personalization & Fan Experience" title="Every listener and viewer is unique.">
        <div className="grid gap-8 md:grid-cols-3">
          {stats.map(([s, b]) => (
            <div key={s}>
              <p className="font-display text-5xl font-extrabold text-primary md:text-6xl">{s}</p>
              <p className="mt-3 text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-xl border border-primary bg-card p-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">The Opportunity</p>
          <p className="mt-4 text-xl md:text-2xl">AI turns passive consumption into active relationships. Artists and studios can deliver experiences that feel hand-crafted for each fan — at global scale.</p>
        </div>
      </Section>

      <Section id="ethics" num="07" label="Challenges & Ethics" title="Powerful tools come with real questions.">
        <div className="grid gap-4 md:grid-cols-2">
          {ethics.map(([t, b]) => <Card key={t} title={t} body={b} />)}
        </div>
      </Section>

      <Section id="future" num="08" label="Future Outlook" title="Where the industry is heading.">
        <ol className="grid gap-6 md:grid-cols-4">
          {future.map(([p, t, b]) => (
            <li key={p} className="border-t-2 border-primary pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{p}</p>
              <h3 className="mt-2 text-xl font-bold">{t}</h3>
              <p className="mt-3 text-muted-foreground">{b}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="takeaways" num="09" label="Key Takeaways" title="Remember these points.">
        <ol className="space-y-6">
          {takeaways.map((t, i) => (
            <li key={i} className="flex gap-6 border-b border-border pb-6">
              <span className="font-display text-3xl font-extrabold text-primary">{n(i)}</span>
              <p className="text-lg md:text-2xl">{t}</p>
            </li>
          ))}
        </ol>
      </Section>

      <footer className="border-t border-border px-6 py-10 text-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
        AI in Music & Entertainment
      </footer>
    </main>
  );
}
