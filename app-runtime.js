import { DATA } from './data.js';
export function mount(){

const won=n=>n>=10000?(n/10000).toLocaleString('ko-KR')+'만원':n.toLocaleString('ko-KR')+'원';
const manWon=m=>m>=10000?(m/10000).toLocaleString('ko-KR')+'억 '+(m%10000?(m%10000).toLocaleString('ko-KR')+'만원':''):m.toLocaleString('ko-KR')+'만원';
const ORD={1:'첫째',2:'둘째',3:'셋째',4:'넷째',5:'다섯째'};
const CAP={'서울특별시':10,'경기도':10,'인천광역시':10};
function central(order,sido){
  const child=CAP[sido]||11;              // 아동수당 월액(만): 수도권10, 그외 11(가산 추정)
  const cheot=order>=2?300:200;           // 첫만남(만)
  const parent=1200+600;                  // 부모급여 0세 1200 + 1세 600
  const adong=child*96;                   // 아동수당 96개월(0~만8세 미만)
  const imsin=100;                        // 임신·출산 바우처
  return {imsin,cheot,parent,adong,child,total:imsin+cheot+parent+adong};
}
function repAmt(a){if(!a)return 0;if(a['1']!==undefined)return a['1'];if(a['0']!==undefined)return a['0'];return 0;}
function fmtAmt(a){if(!a||!Object.keys(a).length)return null;const p=[];for(const k of['1','2','3','4','5'])if(a[k]!==undefined)p.push(ORD[+k]+' '+won(a[k]));if(p.length)return p.join(' · ');if(a['0']!==undefined)return won(a['0']);return null;}
const VB={'공식확인':['ok','✓ 공식확인'],'웹확인':['web','🔎 웹확인'],'구청확인':['gu','📞 구청 확인']};
const $=id=>document.getElementById(id);
const sidoSel=$('sido'),sggSel=$('sgg');
const order=Object.keys(DATA).sort((a,b)=>{if(a==='(미상)')return 1;if(b==='(미상)')return -1;return Object.values(DATA[b]).flat().length-Object.values(DATA[a]).flat().length;});
sidoSel.innerHTML='<option value="">시·도</option>'+order.map(s=>`<option value="${s}">${s==='(미상)'?'지역미상':s}</option>`).join('');
function sggLabel(sido,k){return(k==='(시도)'||k==='(시도 직접)')?'시·도 직접사업':k;}
function fillSgg(sido){sggSel.innerHTML='<option value="">시·군·구</option>';if(!sido)return;Object.keys(DATA[sido]).sort((a,b)=>DATA[sido][b].length-DATA[sido][a].length).forEach(k=>{sggSel.insertAdjacentHTML('beforeend',`<option value="${k}">${sggLabel(sido,k)} (${DATA[sido][k].length})</option>`);});}
function localCash(sido,sgg){let s=0;const recs=(DATA[sido]&&DATA[sido][sgg])||[];recs.forEach(r=>{s+=repAmt(r.a);});return s;}
let _prevTotal=null;const CYC=20,BASE=100;
function rollNumber(el,man){
  const s=man.toLocaleString('ko-KR');const chars=[...s];
  const dir=_prevTotal===null?1:(man>=_prevTotal?1:-1);
  const spins=_prevTotal===null?1:2;
  if(el.getAttribute('data-len')!==String(chars.length)){
    el.innerHTML=chars.map(c=>c===','?'<span class="sep">,</span>':'<span class="reel"><span class="col">'+Array.from({length:CYC*10},(_,k)=>'<span>'+(k%10)+'</span>').join('')+'</span></span>').join('')+'<span class="unit">만원</span>';
    el.setAttribute('data-len',String(chars.length));
    el.querySelectorAll('.reel .col').forEach(col=>{col.dataset.d='0';col.style.transition='none';col.style.transform='translateY(-'+BASE+'em)';});
    void el.offsetHeight;
  }
  const cols=el.querySelectorAll('.reel .col');let i=0;
  for(const c of chars){
    if(c===','){continue;}
    const col=cols[i];const d=+c;const cur=+(col.dataset.d||0);
    col.style.transition='none';col.style.transform='translateY(-'+(BASE+cur)+'em)';void col.offsetHeight;
    let steps,newOff;
    if(dir>0){steps=((d-cur)%10+10)%10;if(steps===0)steps=10;steps+=10*spins;newOff=BASE+cur+steps;}
    else{steps=((cur-d)%10+10)%10;if(steps===0)steps=10;steps+=10*spins;newOff=BASE+cur-steps;}
    col.style.transition='transform .95s cubic-bezier(.16,.9,.3,1)';
    col.style.transitionDelay=(i*0.07)+'s';
    (function(co,off){requestAnimationFrame(()=>{co.style.transform='translateY(-'+off+'em)';});})(col,newOff);
    col.dataset.d=String(d);i++;
  }
  _prevTotal=man;
  el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');
}
function render(){
  const order=+$('ord').value, sido=sidoSel.value, sgg=sggSel.value;
  const c=central(order,sido);
  const localWon=(sido&&sgg)?localCash(sido,sgg):0; const localMan=Math.round(localWon/10000);
  const totalMan=c.total+localMan;
  rollNumber($('total'),totalMan);
  $('hsub').textContent=`중앙 ${manWon(c.total)} + 우리 동네 ${localMan?manWon(localMan):'0원'}`;
  $('brk').innerHTML=[
    ['부모급여','0세 월100만 + 1세 월50만',c.parent],
    ['첫만남이용권',order>=2?'둘째이후 300만':'첫째 200만',c.cheot],
    ['아동수당',`월 ${c.child}만 × 96개월`,c.adong],
    ['임신·출산 바우처','일태아 100만',c.imsin],
    ['우리 동네 지자체', (sido&&sgg)?(sggLabel(sido,sgg)+' 현금 지원'):'동네를 선택하세요', localMan]
  ].map(x=>`<div class="b"><div class="k"><b>${x[0]}</b> · ${x[1]}</div><div class="v">${x[2]?manWon(x[2]):'—'}</div></div>`).join('');
  // 타임라인 0~23개월
  let bars='';for(let m=0;m<24;m++){const v=(m<12?100:50)+c.child;const h=Math.round(v/150*100);bars+=`<div class="bar ${m>=12?'y1':''}" style="height:${h}%" title="${m}개월 ${v}만원"></div>`;}
  $('bars').innerHTML=bars;
  $('tlnote').innerHTML=`출생 직후 <b>첫만남 ${c.cheot}만원</b> 일시 지급 · 0~11개월 매월 <b>${100+c.child}만원</b>(부모급여100+아동수당${c.child}) · 12~23개월 매월 <b>${50+c.child}만원</b> · 아동수당은 만 8세까지 계속`;
  // 동네 목록
  const list=$('list');const recs=(sido&&sgg)?(DATA[sido][sgg]||[]):[];
  $('who').textContent=(sido&&sgg&&sgg!=='(시도)')?`${sggLabel(sido,sgg)} 우리 아이`:'우리 아이';
  $('lcnt').textContent=recs.length?`${recs.length}개`:'';
  if(!sido||!sgg){list.innerHTML='<div class="empty">시·도·시·군·구를 선택하면 우리 동네 지자체 지원이 떠요.</div>';return;}
  if(!recs.length){list.innerHTML='<div class="empty">자동수집된 지자체 사업이 없어요. 구청·정부24 확인 권장.</div>';return;}
  list.innerHTML=recs.map(r=>{const amt=fmtAmt(r.a);const vb=VB[r.v]||['auto','자동수집'];
    let h,cl='';if(amt)h=amt;else if(r.k==='svc'){h='🩺 서비스 지원';cl='svc';}else if(r.v==='구청확인'){h='📞 구청 문의';cl='chk';}else{h='💬 확인 필요';cl='chk';}
    return `<div class="item"><div class="ti">${r.p}</div><div class="am ${cl}">${h}</div><div class="meta"><span class="vb ${vb[0]}">${vb[1]}</span>${r.t?`<span class="chip">${r.t}</span>`:''}${r.u?`<a href="${r.u}" target="_blank">바로가기 ›</a>`:''}</div></div>`;}).join('');
}
['bd','ord'].forEach(id=>$(id).addEventListener('change',render));
sidoSel.addEventListener('change',()=>{fillSgg(sidoSel.value);render();});
sggSel.addEventListener('change',render);
// 기본: 지유(부산 서구)
sidoSel.value='부산광역시';fillSgg('부산광역시');
if([...sggSel.options].some(o=>o.value==='서구'))sggSel.value='서구';
render();

}
