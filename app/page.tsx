'use client';
import {useEffect,useState} from 'react';

type Asset={symbol:string;price:number;change24h:number;volume24h:number;score:number;confidence:number};
type Radar={symbol:string;event:string;severity:string;confidence:number;detail:string;createdAt:string};

export default function Home(){
 const [assets,setAssets]=useState<Asset[]>([]); const [radar,setRadar]=useState<Radar[]>([]); const [q,setQ]=useState(''); const [answer,setAnswer]=useState(''); const [loading,setLoading]=useState(false);
 useEffect(()=>{
  const load=()=>{fetch('/api/assets',{cache:'no-store'}).then(r=>r.json()).then(setAssets).catch(()=>setAssets([])); fetch('/api/radar',{cache:'no-store'}).then(r=>r.json()).then(setRadar).catch(()=>setRadar([]));};
  load();
  const id=setInterval(load,60000);
  return ()=>clearInterval(id);
},[]);
 async function ask(){setLoading(true);setAnswer(''); try{const r=await fetch('/api/ai/ask',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:q})}); const j=await r.json(); setAnswer(j.answer||j.error||'No response');}finally{setLoading(false);}}
 return <main className="container"><header className="top"><div><div className="brand">UMBRA</div><div className="muted">AI-Powered Crypto Intelligence</div></div><span className="pill">CLOUD MVP v0.4</span></header>
 <section><h2>Market Overview</h2><div className="grid grid5">{assets.map(a=><div className="card" key={a.symbol}><div className="symbol">{a.symbol}/USDT</div><div className="price">${a.price?.toLocaleString?.()??'—'}</div><div className="muted">24h {a.change24h?.toFixed?.(2)??'—'}%</div><div className="score">UMBRA {a.score??'—'}</div><div className="muted">Confidence {a.confidence??'—'}%</div></div>)}</div></section>
 <section className="section grid2"><div className="card"><h2>UMBRA Radar</h2>{radar.length===0?<div className="muted">No events yet. Run collection after connecting providers.</div>:radar.slice(0,8).map((r,i)=><div className="radar" key={i}><div><b>{r.symbol}</b> · {r.event}<div className="muted">{r.detail}</div></div><span className="pill">{r.severity} · {Math.round(r.confidence*100)}%</span></div>)}</div>
 <div className="card"><h2>Ask UMBRA</h2><textarea className="input" rows={5} value={q} onChange={e=>setQ(e.target.value)} placeholder="Why is SOL moving?"/><div style={{height:10}}/><button className="btn" onClick={ask} disabled={loading||!q}>{loading?'Analyzing…':'Analyze'}</button><div className="ai" style={{marginTop:15}}>{answer||'Ask a market question and UMBRA will use the latest stored context.'}</div></div></section>
 <div className="foot">Data freshness and unavailable sources are surfaced explicitly. UMBRA does not guarantee future prices or returns.</div></main>
}
