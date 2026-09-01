import { env } from '@/lib/config';
export type NewsItem={title:string;url:string;source:string;publishedAt:string;description:string|null};
export async function fetchNews(query:string):Promise<NewsItem[]>{
  if(!env.newsApiKey) return [];
  const url=new URL('https://newsapi.org/v2/everything');
  url.searchParams.set('q',query); url.searchParams.set('sortBy','publishedAt'); url.searchParams.set('pageSize','10');
  const r=await fetch(url,{headers:{'X-Api-Key':env.newsApiKey},cache:'no-store'}); if(!r.ok) throw new Error(`news ${r.status}`);
  const j=await r.json();
  return (j.articles||[]).map((a:any)=>({title:a.title,url:a.url,source:a.source?.name||'Unknown',publishedAt:a.publishedAt,description:a.description||null}));
}
