"use client";

import { useEffect, useRef, useState } from "react";

export type IntroMotif = "analysis" | "interview" | "column" | "archive" | "legal";

function Drawing({ kind, right }: { kind: IntroMotif; right: boolean }) {
  if (kind === "analysis") return <>
    <g className="motif-detail"><rect x="35" y="18" width="90" height="106" rx="7"/><path d="M48 34h58M48 47h39M48 83h58M48 96h46M48 109h31"/></g>
    <rect className="motif-accent" x="46" y="57" width="53" height="14" rx="3"/>
    <path className="motif-draw" pathLength="1" d="M100 64h28l22-28h24M126 90h24l22 22"/><circle cx="176" cy="36" r="5"/><circle cx="174" cy="112" r="5"/>
  </>;
  if (kind === "interview") return <>
    <path className="motif-accent" d={right ? "M150 43h-24v28h15q0 16-15 23v12q30-8 30-40V43zM107 43H83v28h15q0 16-15 23v12q30-8 30-40V43z" : "M49 98h24V70H58q0-16 15-23V35q-30 8-30 40v23zM92 98h24V70h-15q0-16 15-23V35q-30 8-30 40v23z"}/>
    <path className="motif-wave" d={right ? "M62 58q-15 12 0 24M48 45q-28 25 0 50M34 33q-40 37 0 74" : "M138 58q15 12 0 24M152 45q28 25 0 50M166 33q40 37 0 74"}/>
  </>;
  if (kind === "column") return <>
    <path className="motif-detail" d="M25 53h150M25 81h150M25 106h150"/>
    <path className="motif-draw" pathLength="1" d="M28 45q9-22 14-3t17-5q9-18 14 4t19-2q10-14 15 1t19-4q12-14 19 7M28 72q9-22 16-3t20-6q10-9 13 9t22-7q11-8 15 6t20-3M28 97q10-19 18-2t22-5q12-10 18 6t17-3"/>
    <path className="motif-underline motif-accent" pathLength="1" d="M25 115q63-8 147-3"/>
  </>;
  if (kind === "archive") return <>
    <g className="motif-stack motif-detail"><rect x="27" y="23" width="112" height="77" rx="7"/><path d="M38 38h32M38 49h70"/></g>
    <g className="motif-stack"><rect x="42" y="36" width="112" height="77" rx="7"/><path d="M54 52h38M54 64h68"/></g>
    <g className="motif-stack motif-accent"><path d="M59 69V54h45l9 10h62v62H59V69Z"/><path d="M72 85h32M72 99h75M72 111h54"/></g>
  </>;
  if (right) return <>
    <path className="motif-detail" d="M48 15h73l29 29v83H48Z M121 15v29h29 M63 58h70M63 72h51M63 113h63"/>
    <rect className="motif-accent" x="59" y="84" width="80" height="17" rx="3"/>
    <path className="motif-draw" pathLength="1" d="m156 91 9 9 19-25"/>
  </>;
  return <>
    <circle cx="100" cy="70" r="48"/><circle className="motif-detail" cx="100" cy="70" r="39"/>
    <path className="motif-detail" d="M100 13v15M100 112v15M43 70h15M142 70h15M60 30l11 11M129 99l11 11M60 110l11-11M129 41l11-11"/>
    <g className="motif-needle motif-accent"><path d="m100 32 12 38-12 38-12-38Z"/><path d="M100 32v76M88 70h24"/></g><circle cx="100" cy="70" r="4"/>
  </>;
}

export function IntroMotifs({ kind }: { kind: IntroMotif }) {
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setPlaying(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`intro-motifs intro-motifs--${kind}`} data-playing={playing} aria-hidden="true">
    {[false, true].map(right => <svg key={String(right)} className={`intro-motifs__drawing intro-motifs__drawing--${right ? "right" : "left"}`} viewBox="0 0 200 140" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" focusable="false"><Drawing kind={kind} right={right}/></svg>)}
  </div>;
}
