var ProofKit=(()=>{var l=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var g=Object.getOwnPropertyNames;var f=Object.prototype.hasOwnProperty;var u=(t,n)=>{for(var i in n)l(t,i,{get:n[i],enumerable:!0})},x=(t,n,i,o)=>{if(n&&typeof n=="object"||typeof n=="function")for(let e of g(n))!f.call(t,e)&&e!==i&&l(t,e,{get:()=>n[e],enumerable:!(o=m(n,e))||o.enumerable});return t};var h=t=>x(l({},"__esModule",{value:!0}),t);var $={};u($,{init:()=>C});function y(t){let n=Date.now()-new Date(t).getTime(),i=Math.floor(n/6e4),o=Math.floor(i/60),e=Math.floor(o/24);return e>0?`${e}d ago`:o>0?`${o}h ago`:i>0?`${i}m ago`:"just now"}function b(t){return{signup:"just signed up",purchase:"just purchased",pageview:"is viewing this page",custom:"triggered an event"}[t.type]||"just did something"}function v(t){return t?t.charAt(0).toUpperCase():"?"}function w(t,n,i){let o=i==="dark",e=document.createElement("div");e.style.cssText=`
    position: fixed;
    z-index: 999999;
    ${n.position.includes("bottom")?"bottom: 20px;":"top: 20px;"}
    ${n.position.includes("right")?"right: 20px;":"left: 20px;"}
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    background: ${o?"#1f2937":"#ffffff"};
    color: ${o?"#f9fafb":"#111827"};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    max-width: 280px;
    min-width: 220px;
    transition: opacity 0.3s ease, transform 0.3s ease;
    opacity: 0;
    transform: translateY(${n.position.includes("bottom")?"10px":"-10px"});
    cursor: pointer;
  `;let p=document.createElement("div");p.style.cssText=`
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #ea580c);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 14px; color: white; flex-shrink: 0;
  `,p.textContent=v(t.personName);let r=document.createElement("div"),a=document.createElement("div");a.style.cssText="font-weight: 600; font-size: 13px; margin-bottom: 2px;",a.textContent=t.personName?`${t.personName}${t.personLocation?` from ${t.personLocation}`:""}`:t.personLocation||"Someone";let c=document.createElement("div");c.style.cssText=`color: ${o?"#9ca3af":"#6b7280"}; font-size: 12px;`,c.textContent=`${b(t)} \xB7 ${y(t.createdAt)}`;let d=document.createElement("div");return d.style.cssText=`
    position: absolute; top: 6px; right: 8px;
    cursor: pointer; color: ${o?"#6b7280":"#9ca3af"};
    font-size: 14px; line-height: 1;
  `,d.textContent="\xD7",d.onclick=s=>{s.stopPropagation(),e.remove()},r.appendChild(a),r.appendChild(c),e.appendChild(p),e.appendChild(r),e.appendChild(d),e}function C(t){let n=t.apiUrl||"https://proofkit.threestack.io",i=0;fetch(`${n}/api/widget/${t.siteId}`).then(o=>o.json()).then(o=>{if(!o.active||!o.campaign||!o.events?.length)return;fetch(`${n}/api/widget/${t.siteId}/track`,{method:"POST"}).catch(()=>{});let e=o.campaign,p=t.position||e.position,r=o.events,a=0,c=()=>{if(a>=r.length||i>=e.maxPerSession)return;let d=r[a++],s=w(d,{...e,position:p},e.theme);document.body.appendChild(s),requestAnimationFrame(()=>{requestAnimationFrame(()=>{s.style.opacity="1",s.style.transform="translateY(0)"})}),setTimeout(()=>{s.style.opacity="0",s.style.transform=`translateY(${p.includes("bottom")?"10px":"-10px"})`,setTimeout(()=>{s.parentNode&&s.remove()},300)},e.displayTimeMs),i++,i<e.maxPerSession&&a<r.length&&setTimeout(c,e.displayTimeMs+e.delayBetweenMs)};setTimeout(c,1e3)}).catch(console.error)}return h($);})();
