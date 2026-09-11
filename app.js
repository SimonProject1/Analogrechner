const $=id=>document.getElementById(id);
const fields=['pvMin','pvMax','pvUnit','sigMin','sigMax','sigUnit','inputValue'].map($);
const presets={pressure:[0,10,'bar',4,20,'mA',6],percent:[0,100,'%',4,20,'mA',50],temperature:[0,100,'°C',4,20,'mA',50],voltage:[0,100,'%',0,10,'V',50],voltage2:[0,100,'%',2,10,'V',50]};
let mode='processToSignal';
const value=id=>parseFloat($(id).value);
const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('de-DE',{maximumFractionDigits:3,minimumFractionDigits:3}).format(n):'–';
function calculate(){
 const p0=value('pvMin'),p1=value('pvMax'),s0=value('sigMin'),s1=value('sigMax'),x=value('inputValue');
 const pu=$('pvUnit').value.trim()||'PE',su=$('sigUnit').value.trim()||'Signal';
 let out,percent,inUnit,outUnit;
 $('validation').textContent='';
 if([p0,p1,s0,s1,x].some(n=>!Number.isFinite(n))){showError('Bitte alle Zahlenfelder vollständig ausfüllen.');return}
 if(p0===p1||s0===s1){showError('Von- und Bis-Wert dürfen nicht identisch sein.');return}
 if(mode==='processToSignal'){percent=(x-p0)/(p1-p0);out=s0+percent*(s1-s0);inUnit=pu;outUnit=su}
 else{percent=(x-s0)/(s1-s0);out=p0+percent*(p1-p0);inUnit=su;outUnit=pu}
 const pct=percent*100,clamped=Math.max(0,Math.min(100,pct));
 $('resultValue').textContent=fmt(out);$('resultUnit').textContent=outUnit;
 $('resultSentence').textContent=`${fmt(x)} ${inUnit} entsprechen ${fmt(out)} ${outUnit}`;
 $('percentValue').textContent=`${new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(pct)} %`;
 $('gaugeProgress').style.strokeDashoffset=100-clamped;
 $('gaugeNeedle').style.transform=`rotate(${clamped*1.8}deg)`;
 $('formulaText').textContent=mode==='processToSignal'?`${s0} + ((${x} - ${p0}) / (${p1} - ${p0})) × (${s1} - ${s0}) = ${fmt(out)} ${outUnit}`:`${p0} + ((${x} - ${s0}) / (${s1} - ${s0})) × (${p1} - ${p0}) = ${fmt(out)} ${outUnit}`;
 if(pct<0||pct>100)$('validation').textContent='Hinweis: Der eingegebene Wert liegt außerhalb des eingestellten Bereichs.';
}
function showError(msg){$('validation').textContent=msg;$('resultValue').textContent='–';$('resultSentence').textContent='Berechnung nicht möglich'}
function syncLabels(){const pu=$('pvUnit').value||'PE',su=$('sigUnit').value||'Signal';const forward=mode==='processToSignal';$('inputHeading').textContent=forward?'Prozesswert eingeben':'Signalwert eingeben';$('inputUnit').textContent=forward?pu:su;$('resultLabel').textContent=forward?'Ausgangssignal':'Prozesswert';calculate()}
fields.forEach(el=>el.addEventListener('input',()=>{if(!['pvUnit','sigUnit'].includes(el.id))$('preset').value='custom';syncLabels()}));
document.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.mode;document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b===btn));$('inputValue').value=mode==='processToSignal'?6:13.6;syncLabels()}));
$('preset').addEventListener('change',e=>{const p=presets[e.target.value];if(!p)return;['pvMin','pvMax','pvUnit','sigMin','sigMax','sigUnit','inputValue'].forEach((id,i)=>$(id).value=p[i]);mode='processToSignal';document.querySelectorAll('[data-mode]').forEach((b,i)=>b.classList.toggle('active',i===0));syncLabels()});
$('formulaToggle').addEventListener('click',()=>{const c=$('formulaContent'),open=c.hidden;c.hidden=!open;$('formulaToggle').setAttribute('aria-expanded',open)});
$('themeButton').addEventListener('click',()=>{document.body.classList.toggle('light');localStorage.setItem('msr-theme',document.body.classList.contains('light')?'light':'dark')});
if(localStorage.getItem('msr-theme')==='light')document.body.classList.add('light');
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));
syncLabels();
