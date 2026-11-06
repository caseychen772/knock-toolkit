'use strict';
let data=window.RESOURCE_SNAPSHOT||{},tab=document.body?.dataset?.resourcePage||'providers',live=false;
let applied={priority:'none',district:'',search:'',remote:false,slots:false};
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,label)=>/^https?:\/\//.test(url||'')?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`:'';
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function feeInfo(fee){
 const raw=(fee||'').trim();
 if(/^(無|免收費|免費|0元)$/.test(raw))return {amount:0,label:'NT$ 0',detail:'官方自付欄標示無費用'};
 const m=raw.match(/^掛號費[：:]?\s*(\d+)元$/);
 if(m)return {amount:Number(m[1]),label:'NT$ '+Number(m[1]).toLocaleString(),detail:'機構公告的掛號費'};
 return {amount:null,label:'費用依條件而定',detail:raw||'官方尚未提供費用'};
}
function available(x){return x.slots.map((n,i)=>({n,i})).filter(({n,i})=>typeof n==='number'&&n>0&&(!data.providers.weekLabels?.[i]||data.providers.weekLabels[i].slice(-10).replaceAll('/','-')>=today()));}
function rankValue(x,p){if(p==='cost')return feeInfo(x.fee).amount??Infinity;if(p==='remote')return x.remote?0:1;if(p==='soon')return available(x)[0]?.i??99;return 0;}
function reason(x){const p=applied.priority;if(p==='cost')return feeInfo(x.fee).amount===null?'費用條件需先確認':'依明確公告的自付費用，由低到高排列';if(p==='remote')return x.remote?'官方標示提供通訊服務':'官方未標示通訊服務';if(p==='soon')return available(x).length?'較早的週次有預估名額':'目前沒有仍有效的正數名額';return '選擇偏好後，這裡會顯示推薦原因';}
function weekCards(x){return '<div class="weeks">'+x.slots.map((n,i)=>{const full=data.providers.weekLabels?.[i]||'';const stale=full&&full.slice(-10).replaceAll('/','-')<today();const date=full.replaceAll(/20\d{2}\//g,'').replace(' ~ ','–');return `<div class="week ${!stale&&n>0?'has-slots':''}"><span>${esc(date||'日期待確認')}</span><strong>${stale?'—':n==null?'?':esc(n)}</strong><small>${stale?'此週已過':n==null?'未提供':n===0?'暫無預估名額':'個預估名額'}</small></div>`;}).join('')+'</div>';}
function institutionMark(x){const type=x.name.includes('醫院')?'醫院':x.name.includes('診所')?'診所':'諮商所';return `<div class="institution-mark" aria-label="${type}類型圖示，非官方標誌"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 42V12h28v30M6 42h36M19 42V32h10v10M20 18h8M24 14v8M16 27h4M28 27h4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><span>${type}</span><small>類型圖示</small></div>`;}
function activityCard(x){
 const poster=/^https:\/\//.test(x.imageUrl||'')?`<a class="event-poster" href="${esc(x.imageUrl)}" target="_blank" rel="noopener noreferrer"><img src="${esc(x.imageUrl)}" alt="${esc(x.title)} 官方活動海報" loading="lazy" referrerpolicy="no-referrer"><span>放大閱讀官方海報 ↗</span></a>`:'<div class="event-poster no-poster">官方未提供活動海報</div>';
 const organizer=x.organizer||x.source;const logo=/^https:\/\//.test(x.organizerLogo||'')?`<img src="${esc(x.organizerLogo)}" alt="${esc(organizer)} 官方網站標誌" loading="lazy" referrerpolicy="no-referrer">`:'';
 const time=x.start?.slice(11),sameDay=x.start?.slice(0,10)===x.end?.slice(0,10);
 const date=`${esc(x.start?.slice(0,10)||'日期請見公告')}<span>${esc(time||'')}${x.end&&x.end!==x.start?' – '+esc(sameDay?x.end.slice(11):x.end):''}</span>`;
 const expired=x.deadline&&Date.parse(x.deadline.replace(' ','T')+(x.deadline.length===10?'T23:59:59+08:00':'+08:00'))<Date.now();
 const status=x.full?'公告已額滿':expired?'報名已截止':x.registrationStart&&Date.parse(x.registrationStart.replace(' ','T')+'+08:00')>Date.now()?'尚未開放報名':'';
 const facts=[['報名截止',x.deadline],['報到時間',x.checkIn],['招收名額',x.capacity!=null?x.capacity+' 人'+(x.waitlistCapacity!=null?'，備取 '+x.waitlistCapacity+' 人':''):'']].filter(a=>a[1]);
 return `<article class="card activity-card"><header class="event-heading"><div><span class="tag">${esc(x.fee==='待確認'?'費用待確認':x.fee)}</span><span class="tag">${x.online?'含線上場次':'場地請見公告'}</span>${status?`<span class="tag pink">${status}</span>`:''}<h3>${esc(x.title)}</h3></div><p class="event-date">${date}</p></header><div class="event-content"><dl class="event-facts">${facts.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}${x.registrationStart?`<div><dt>開放報名</dt><dd>${esc(x.registrationStart)}</dd></div>`:''}</dl><p class="event-location"><strong>活動地點</strong>${esc(x.location||'請見官方公告')}</p>${x.description?`<section class="event-description"><h4>活動內容</h4><p>${esc(x.description)}</p>${x.highlights?`<ul>${x.highlights.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:''}</section>`:''}${x.audience?`<p class="event-location"><strong>參加對象</strong>${esc(x.audience)}</p>`:''}${x.registrationNote?`<p class="event-location"><strong>報名方式</strong>${esc(x.registrationNote)}</p>`:''}${x.contact?`<p class="event-location"><strong>聯絡窗口</strong>${esc(x.contact)}</p>`:''}${x.dateConflict?'<p>官方日期欄位有矛盾，請向主辦確認</p>':''}<div class="links event-cta">${link(x.url,'查看完整公告與報名')}</div><section class="event-more"><h4>報名人數與其他說明</h4><p>已報名人數 ${x.registeredCount==null?'官方未公開':esc(x.registeredCount)+' 人'}</p>${!x.deadline?'<p>報名截止時間請向主辦確認</p>':''}${!x.checkIn?'<p>報到時間請向主辦確認</p>':''}<p>${esc(x.evidence||'費用與參加資格請見官方公告')}</p></section></div><aside class="event-side">${poster}<div class="event-organizer">${logo}<small>${x.organizer?'主辦單位':'公告單位'}</small><strong>${esc(organizer)}</strong></div></aside></article>`;
}
function providerCard(x,i){const f=feeInfo(x.fee);return `<article class="card provider-card">${institutionMark(x)}<div class="provider-heading"><span class="tag">${esc(x.district)}</span>${x.remote?'<span class="tag pink">提供通訊服務</span>':''}<p class="match">${esc(reason(x))}</p><h3>${esc(x.name)}</h3><p>${esc(x.address)}</p></div><div class="fee-panel"><div><span>方案內個別諮商</span><strong>補助最多 3 次</strong></div><div><span>每次需另外支付</span><strong>${esc(f.label)}</strong><small>${esc(f.detail)}</small></div></div><p class="subsidy-benefit">政府每次最高補助 <strong>NT$ 1,600</strong> 諮商費，最多 3 次合計最高 <strong>NT$ 4,800</strong></p><p class="small">須符合方案資格並有剩餘次數。上方金額不是一般自費諮商價格，實際收費請預約時確認。</p><h4>接下來四週的預估名額</h4>${weekCards(x)}<p class="small">0 不代表機構停業，可詢問候補。名額須由機構確認。<br>機構更新 ${esc(x.updated||'未提供')}</p><button class="choose-place" data-place="${i}" aria-expanded="false" aria-controls="mapPanel">看地圖與聯絡方式 ↓</button><div class="links">${link(x.url,'機構網站')}${link(x.source,'官方資料')}</div></article>`;}
let visibleProviders=[];
let selectedPlace='';
function updateMapButtons(){document.querySelectorAll('.choose-place').forEach(b=>{const open=!$('mapPanel').hidden&&visibleProviders[Number(b.dataset.place)]?.name===selectedPlace;b.setAttribute('aria-expanded',String(open));b.textContent=open?'收起地圖與聯絡方式 ↑':'看地圖與聯絡方式 ↓';b.closest('article').classList.toggle('expanded',open);});}
function showPlace(x){if(!x)return;if(selectedPlace===x.name&&!$('mapPanel').hidden){$('closeMap').click();return;}selectedPlace=x.name;const i=visibleProviders.indexOf(x),card=$('results').querySelector(`[data-place="${i}"]`)?.closest('article');if(!card)return;card.append($('mapPanel'));$('mapPanel').hidden=false;card.classList.add('expanded');const query=encodeURIComponent(x.name+' '+x.address);$('placeCard').innerHTML=`<p class="contact-phone">${esc(x.phone)}</p><div class="links">${link('https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(x.address),'規劃路線')}${link('https://www.google.com/maps/search/?api=1&query='+query,'在 Google 地圖開啟')}</div><details class="call-script"><summary>第一次預約，可以怎麼問</summary><p>我想使用青壯世代心理健康支持方案。請問還有名額嗎？我需要帶什麼證件，另外要付哪些費用？</p></details>`;const frame=document.createElement('iframe');frame.title=x.name+' Google 地圖';frame.referrerPolicy='no-referrer';frame.src='https://www.google.com/maps?q='+query+'&output=embed';$('map').replaceChildren(frame);updateMapButtons();$('mapPanel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
function districts(){const old=$('district').value;$('district').innerHTML='<option value="">臺北市全部</option>'+[...new Set((data.providers?.items||[]).map(x=>x.district).filter(Boolean))].sort().map(x=>`<option>${esc(x)}</option>`).join('');$('district').value=old;}
function render(){
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tab===tab));
 $('providerFilters').hidden=tab!=='providers';$('activityFilters').hidden=tab!=='activities';$('mapToggle').hidden=tab!=='providers';if(tab!=='providers')$('mapPanel').hidden=true;
 $('categoryHelp').textContent=tab==='providers'?'一對一的專業諮商，先挑機構，再聯絡預約。':tab==='activities'?'有日期與報名安排的心理健康講座、情緒照顧、親職與人際溝通活動。預設只看公告明確免費的場次。':'可以隨時開啟的官方網站，提供心理健康衛教與服務說明。這裡不是可直接報名的活動清單。';
 const part=data[tab];$('status').textContent=tab==='resources'?'官方資源入口，活動內容請到各網站確認':`${live?'已連接本機更新服務':'目前顯示已下載的資料'}　上次成功抓取 ${part?.fetchedAt||'尚無資料'}${part?.error?'　更新有問題，保留原資料':''}${data.syncing?'　正在背景更新':''}`;
 let rows=[];
 if(tab==='providers'){
 $('notice').textContent='補助方案仍可能有掛號費。四週名額是官方預估，請先電話確認資格、費用與可約時間。';
 const q=applied.search;visibleProviders=(part?.items||[]).filter(x=>(!applied.district||x.district===applied.district)&&(!q||(x.name+x.address).includes(q))&&(!applied.remote||x.remote)&&(!applied.slots||available(x).length)).sort((a,b)=>rankValue(a,applied.priority)-rankValue(b,applied.priority));rows=visibleProviders.map(providerCard);
 }else if(tab==='activities'){
 $('notice').textContent='新增家庭教育中心的情感互動課程，費用尚待確認，取消「只看公告明確免費」即可查看。活動按日期排列，報名狀態與資格請以官方公告為準。';
 rows=(part?.items||[]).filter(x=>(!$('free').checked||x.fee==='免費')&&($('past').checked||!x.end||x.end.slice(0,10)>=today())&&($('professional').checked||!x.professional)).sort((a,b)=>(a.start||'').localeCompare(b.start||'')).map(activityCard);
 }else{
 $('notice').textContent='從公立醫院與公共服務的官方入口，找衛教、講座與家庭支持。以下是資源網站，不代表網站內所有服務都免費。';
 rows=(data.resources||[]).map(x=>`<article class="card"><span class="tag">${esc(x.type)}</span><h3>${esc(x.title)}</h3><p>${esc(x.note)}</p><div class="links">${link(x.url,'前往官方網站')}</div></article>`);
 }
 $('count').textContent=`找到 ${rows.length} ${tab==='providers'?'家機構':tab==='activities'?'則活動':'個入口'}`;
 $('mapToggle').disabled=tab==='providers'&&!visibleProviders.length;
 const panel=$('mapPanel');$('results').before(panel);
 $('results').innerHTML=rows.join('')||'<p class="empty">這組條件目前沒有符合的資料。可以調整篩選，或從公開資源入口繼續找。</p>';
 const selectedIndex=tab==='providers'?visibleProviders.findIndex(x=>x.name===selectedPlace):-1;
 if(selectedIndex>=0){const card=$('results').querySelector(`[data-place="${selectedIndex}"]`).closest('article');card.append(panel);card.classList.add('expanded');updateMapButtons();}else{panel.hidden=true;selectedPlace='';$('map').replaceChildren();}
}
async function sync(){if(!/^https?:$/.test(location.protocol)){live=false;render();$('status').textContent+='　開啟「啟動資源工具包.command」後可連線更新';return;}try{const r=await fetch('/api/resources',{cache:'no-store'});if(!r.ok)throw Error();data=await r.json();live=true;districts();render();if(data.syncing)setTimeout(sync,5000);}catch{live=false;render();$('status').textContent+='　連線失敗，使用已下載資料';}}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render();});['free','past','professional'].forEach(id=>$(id).addEventListener('input',render));
['priority','district','search','remote','slots'].forEach(id=>$(id).addEventListener('input',()=>{$('filterStatus').textContent='條件已修改，確認後才會更新下方推薦。';}));
$('providerFilters').addEventListener('submit',e=>{e.preventDefault();applied={priority:$('priority').value,district:$('district').value,search:$('search').value.trim(),remote:$('remote').checked,slots:$('slots').checked};render();$('filterStatus').textContent='已套用偏好，找到 '+visibleProviders.length+' 家機構。';$('count').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});$('refresh').onclick=sync;
$('mapToggle').onclick=()=>{if(visibleProviders.length)showPlace(visibleProviders[0]);else{$('notice').textContent='目前沒有符合條件的機構，請先調整篩選。';}};
$('closeMap').onclick=()=>{selectedPlace='';$('mapPanel').hidden=true;$('map').replaceChildren();document.querySelectorAll('.expanded').forEach(c=>c.classList.remove('expanded'));updateMapButtons();};
$('results').addEventListener('click',e=>{const b=e.target.closest('[data-place]');if(b)showPlace(visibleProviders[Number(b.dataset.place)]);});
districts();render();sync();setInterval(()=>{if(!document.hidden)sync();},60000);

const stepDetails=[
 ['1 挑一家方便前往的機構','依地區、自付費用、通訊服務與預估名額，找符合你需求的地方。','<a href="#providerFilters">開始依偏好找機構 ↓</a>'],
 ['2 聯絡機構，先確認再預約','說明想使用青壯世代心理健康支持方案，詢問剩餘次數、可約時間與另外需要支付的費用。',''],
 ['3 帶好證件，也帶上想說的話','準備身分證明文件。未成年者先向機構確認同意文件。想說的內容可以先整理，不必一次寫完整。','<a href="prepare.html">回到諮商前準備工具 →</a>'],
 ['4 依約前往，照自己的步調談','依預約時間接受服務。有不知道怎麼說的地方，也可以直接告訴心理師。','']
];
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-step]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const d=stepDetails[Number(b.dataset.step)];$('stepDetail').innerHTML=`<strong>${d[0]}</strong><p>${d[1]}</p>${d[2]}`;});
