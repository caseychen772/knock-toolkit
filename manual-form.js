(() => {
const setup=(sectionId,prefix,title,printClass)=>{
const section=document.getElementById(sectionId), fields=[...section.querySelectorAll('.empty textarea')], status=document.getElementById(prefix+'-status');
const full=()=>title+'\n\n'+fields.filter(x=>x.value.trim()).map(x=>x.previousElementSibling.textContent+'\n'+x.value.trim()).join('\n\n');
const sync=()=>fields.forEach(x=>x.nextElementSibling.textContent=x.value||'（留白）');
const ready=()=>{if(fields.some(x=>x.value.trim()))return true;status.textContent='先寫下一點想保留的內容，再複製或儲存。';fields[0].focus();return false;};
fields.forEach(x=>x.addEventListener('input',()=>{status.textContent='';sync();}));
document.getElementById(prefix+'-copy').onclick=async()=>{if(!ready())return;try{await navigator.clipboard.writeText(full());status.textContent='已複製，可以貼到自己的筆記或文件留存。';}catch{const t=document.getElementById(prefix+'-copy-fallback');t.hidden=false;t.value=full();t.focus();t.select();if(document.execCommand('copy')){t.hidden=true;status.textContent='已複製完整內容。';}else status.textContent='已選取內容，請按 ⌘C 或 Ctrl+C 複製。';}};
document.getElementById(prefix+'-pdf').onclick=()=>{if(!ready())return;sync();document.body.classList.add(printClass);window.print();};
window.addEventListener('beforeprint',sync);window.addEventListener('afterprint',()=>document.body.classList.remove(printClass));
};
setup('personal-sheet','manual','陪你敲門｜我的諮商前準備單','print-personal');
setup('after-sheet','after','陪你敲門｜我的諮商後回顧卡','print-after');
})();
(() => {
const examples = [
['換工作後，上班前常緊張，想先談工作。','和朋友聊，也試過寫下事情。','找到壓力來源，了解自己的需要。','家庭的事想之後再談。','希望慢慢引導，一次問一個問題。','我需要一點時間整理語句。','第一次諮商有點緊張，希望先了解流程。'],
['朋友常請我幫忙，我不敢拒絕，最近很累。','試著晚點回訊息，也找信任的朋友討論。','練習表達界線，又不一直責怪自己。','有些關係細節先不說。','希望先聽我說，再一起整理重點。','不希望太快給建議，想先釐清感受。','如果我說沒關係，也許其實還需要想一下。'],
['說不出明確原因，只覺得最近提不起勁。','試過散步、調整作息，還不確定有沒有幫助。','先知道自己可以怎麼開始談。','還不知道哪些事願意說，可以慢慢確認。','還不確定適合哪種風格，想先試著談。','沉默時希望給我多一點時間。','我帶了這張卡，可以先一起看看嗎？']
];
const choice=document.getElementById('manual-example-choice'),preview=document.getElementById('manual-example-preview');
const labels=[...document.querySelectorAll('#personal-sheet .empty label')].map(x=>x.textContent);
function show(){preview.replaceChildren();examples[Number(choice.value)].forEach((answer,i)=>{const row=document.createElement('div');row.className='example-row';const title=document.createElement('b');title.textContent=labels[i];const text=document.createElement('p');text.textContent=answer;row.append(title,text);preview.append(row);});}
choice.addEventListener('change',show);show();
})();
