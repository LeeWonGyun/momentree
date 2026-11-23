'use strict';
const navigation=document.querySelector('#main-navigation');
const menu=document.querySelector('.menu-toggle');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','메뉴 열기');navigation.classList.remove('is-open');navigation.querySelectorAll('details').forEach(d=>d.open=false);}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');navigation.classList.toggle('is-open',open);});
navigation.querySelectorAll('details').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)navigation.querySelectorAll('details').forEach(other=>{if(other!==details)other.open=false;});}));
document.addEventListener('click',event=>{if(!navigation.contains(event.target)&&!menu.contains(event.target))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
const privacy=document.querySelector('#privacy-dialog');
document.querySelector('[data-open-privacy]').addEventListener('click',()=>privacy.showModal());
privacy.querySelector('.dialog-close').addEventListener('click',()=>privacy.close());
privacy.addEventListener('click',event=>{const r=privacy.getBoundingClientRect();if(event.target===privacy&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))privacy.close();});

const search=document.querySelector('#program-search');
if(search){
 const cards=[...document.querySelectorAll('.program-card')];
 const update=()=>{const query=search.value.trim().toLocaleLowerCase('ko');let count=0;cards.forEach(card=>{const match=card.textContent.toLocaleLowerCase('ko').includes(query);card.hidden=!match;if(match)count++;});document.querySelector('#search-result').textContent=`${count}개의 체험프로그램`;document.querySelector('.no-results').hidden=count>0;document.querySelector('#clear-search').hidden=!search.value;};
 search.addEventListener('input',update);document.querySelector('#clear-search').addEventListener('click',()=>{search.value='';update();search.focus();});update();
}
document.querySelectorAll('[data-news]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-news]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 let count=0;document.querySelectorAll('[data-news-category]').forEach(item=>{const show=button.dataset.news==='전체'||item.dataset.newsCategory===button.dataset.news;item.hidden=!show;if(show)count++;});
 document.querySelector('#news-filter-status').textContent=`${count}개의 소식`;
}));

const form=document.querySelector('#application-form');
if(form){
 const type=document.querySelector('#application-type');const program=document.querySelector('#application-program');const schedule=document.querySelector('#application-schedule');const summary=document.querySelector('#selection-summary');const status=document.querySelector('#form-status');const receipt=document.querySelector('#demo-receipt');
 const categories={psychology:'심리프로그램',education:'교육프로그램',experience:'체험프로그램'};
 let programs=[];let dataReady=false;
 function selected(){return programs.find(p=>p.name===program.value);}
 function updateSummary(){
  const choice=selected();const member=type.value==='회원 참여';const title=choice?choice.name:member?'모먼트리 일반회원':'모먼트리 프로그램 문의';
  const date=choice?`${choice.date} ${choice.time}`:member?'2026-12-19 15:30':'2026-12-07 14:00';
  schedule.replaceChildren(new Option(`${date} · 일정`,date));
  const strong=document.createElement('strong');strong.textContent=`${title} · 운영 안내`;
  const info=document.createElement('span');info.textContent=choice?`${choice.price} / ${choice.duration} / 담당 ${choice.instructor}`:member?'연회비 30,000원 · 월 1회 모임':'운영 안내 문의 · 비용 없음 · 문의 내용 작성';
  summary.replaceChildren(strong,info);receipt.hidden=true;
 }
 function updatePrograms(preferred){
  const category=Object.keys(categories).find(key=>categories[key]===type.value);const options=programs.filter(p=>p.category===category);
  program.replaceChildren();if(options.length){options.forEach(p=>program.add(new Option(p.name,p.name)));program.disabled=false;if(preferred&&options.some(p=>p.name===preferred))program.value=preferred;}else{program.add(new Option(type.value==='회원 참여'?'일반회원 모임':'프로그램 문의',''));program.disabled=true;}
  updateSummary();
 }
 type.addEventListener('change',()=>updatePrograms());program.addEventListener('change',updateSummary);
 fetch('programs-data.json').then(response=>{if(!response.ok)throw new Error('Program data unavailable');return response.json();}).then(data=>{programs=data;dataReady=true;const params=new URLSearchParams(location.search);if([...type.options].some(o=>o.value===params.get('type')))type.value=params.get('type');updatePrograms(params.get('program')||(type.value==='심리프로그램'?'성인 상담':null));}).catch(()=>{program.disabled=true;status.textContent='프로그램 목록을 불러오지 못했습니다. 페이지를 새로고침해 주세요.';});
 function getValues(){const d=new FormData(form);return {name:String(d.get('name')||'').trim(),contact:String(d.get('contact')||'').trim(),type:String(d.get('type')||''),program:program.value||(type.value==='회원 참여'?'일반회원 모임':'프로그램 문의'),schedule:String(d.get('schedule')||''),message:String(d.get('message')||'').trim()};}
 function ready(){if(!dataReady){status.textContent='프로그램 정보를 불러온 뒤 다시 확인해 주세요.';return false;}if(!form.reportValidity())return false;const d=getValues();if(!d.name||!d.contact){status.textContent='이름과 연락처를 입력해 주세요.';return false;}return true;}
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!ready())return;
  const d=getValues();const id=`MT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`;
  const rows=[['신청서 번호',id],['이름',d.name],['신청 분야',d.type],['프로그램',d.program],['희망 일정',d.schedule],['처리 결과','작성 완료']];
  const list=document.querySelector('#receipt-details');list.replaceChildren();rows.forEach(([label,value])=>{const row=document.createElement('div');const dt=document.createElement('dt');const dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);list.append(row);});
  receipt.hidden=false;status.textContent='신청 내용 확인이 완료되었습니다. 작성한 내용을 확인하거나 파일로 저장해 주세요.';receipt.focus();
 });
 document.querySelector('#download-application').addEventListener('click',()=>{
  if(!ready())return;const d=getValues();
  const text=['모먼트리 · 신청 내용 확인 파일','','',`이름: ${d.name}`,`회신받을 연락처: ${d.contact}`,`신청 분야: ${d.type}`,`프로그램: ${d.program}`,`희망 일정: ${d.schedule}`,'',`메모: ${d.message||'없음'}`,'',''].join('\r\n');
  const blob=new Blob(['\uFEFF',text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='모먼트리_신청서.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='작성한 신청서의 파일 저장을 요청했습니다.';
 });
 form.addEventListener('input',()=>{receipt.hidden=true;status.textContent='';});
 form.addEventListener('reset',()=>{receipt.hidden=true;status.textContent='입력 내용을 초기화했습니다.';setTimeout(()=>{type.value='심리프로그램';if(dataReady)updatePrograms('성인 상담');},0);});
}
if(location.pathname==='/'||location.pathname.endsWith('/index.html')){const legacy={'#about':'about.html','#programs':'counseling.html','#people':'people.html','#teachers':'people.html','#guide':'guide.html','#apply':'apply.html'};if(legacy[location.hash])location.replace(legacy[location.hash]);}
