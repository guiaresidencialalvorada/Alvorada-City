'use strict';
const people=Array.isArray(window.PROFISSIONAIS)?window.PROFISSIONAIS:[];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const link=p=>'profissional.html?id='+encodeURIComponent(p.id);
const avatar=p=>`<span class="avatar ${['blue','orange','teal'].includes(p.cor)?p.cor:'blue'}" aria-hidden="true">${esc(p.iniciais)}</span>`;
const services=p=>Array.isArray(p.servicos)?p.servicos:[];
const demo=p=>p.demonstracao===true;
const tag=p=>demo(p)?'<span class="tag">Demonstração</span>':'';
function personCard(p){return `<article class="card"><div class="card-banner">${avatar(p)}${tag(p)}</div><div class="card-body"><div class="specialty">${esc(p.categoria)}</div><h3>${esc(p.nome)}</h3><p class="location">${esc(p.bairro)}</p><p class="muted">${esc(p.descricao)}</p><ul class="service-list">${services(p).slice(0,3).map(s=>`<li>${esc(s.nome)}</li>`).join('')}</ul><a class="button" href="${link(p)}">Conhecer profissional <span aria-hidden="true">↗</span></a></div></article>`;}
function serviceCard(p,s,i){return `<article class="card service-card"><div class="card-body"><div class="specialty">${esc(p.categoria)}</div><h3>${esc(s.nome)}</h3><p class="muted">${esc(s.descricao)}</p><div class="price">Sob orçamento<small>Condições combinadas com o profissional.</small></div><div class="provider">${avatar(p)}<div><strong>${esc(p.nome)}</strong><br><span class="muted">${esc(p.bairro)}</span></div></div><a class="button secondary" href="${link(p)}#servico-${i}">Ver serviço e profissional <span aria-hidden="true">↗</span></a></div></article>`;}
const menu=document.getElementById('menu-button'),nav=document.getElementById('navigation');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();}});
document.addEventListener('click',e=>{if(!e.target.closest('header'))closeMenu();});
const page=document.body.dataset.page;
if(page!=='perfil'){
 const input=document.getElementById('busca'),select=document.getElementById('categoria'),out=document.getElementById('resultados');
 [...new Set(people.map(p=>p.categoria))].filter(Boolean).sort((a,b)=>a.localeCompare(b,'pt-BR')).forEach(c=>select.add(new Option(c,c)));
 if(!people.some(demo))document.querySelector('.demo-note').hidden=true;
 function render(){const q=norm(input.value.trim()),category=select.value;let cards=[];
 people.filter(p=>!category||p.categoria===category).forEach(p=>{if(page==='profissionais'){if(norm([p.nome,p.categoria,p.bairro,...services(p).map(s=>s.nome)].join(' ')).includes(q))cards.push(personCard(p));}else services(p).forEach((s,i)=>{if(norm([p.nome,p.categoria,p.bairro,s.nome,s.descricao].join(' ')).includes(q))cards.push(serviceCard(p,s,i));});});
 document.getElementById('contador').textContent=cards.length+' '+(cards.length===1?'resultado':'resultados');
 out.innerHTML=cards.length?cards.join(''):'<div class="empty"><h2>Nenhum resultado encontrado</h2><p>Tente outra palavra ou remova os filtros.</p><button class="button secondary" id="limpar">Limpar filtros</button></div>';
 document.getElementById('limpar')?.addEventListener('click',()=>{input.value='';select.value='';render();input.focus();});}
 input.addEventListener('input',render);select.addEventListener('change',render);render();
}else{
 const p=people.find(x=>x.id===new URLSearchParams(location.search).get('id')),root=document.getElementById('perfil');
 if(!p){root.innerHTML='<div class="empty"><h1>Profissional não encontrado</h1><p>Este perfil não está disponível. Consulte os profissionais do catálogo.</p><a class="button" href="profissionais.html">Ver profissionais</a></div>';}
 else{document.title=p.nome+' | Guia Alvorada';let phone=String(p.whatsapp||'').replace(/\D/g,'');if(phone.length===10||phone.length===11)phone='55'+phone;const canContact=!demo(p)&&/^55\d{10,11}$/.test(phone);
 const wa=(s='')=>'https://wa.me/'+phone+'?text='+encodeURIComponent('Olá! Encontrei seu perfil no Guia Alvorada e gostaria de um orçamento'+(s?' para '+s:'')+'.');
 root.innerHTML=`<div class="breadcrumb"><a href="profissionais.html">Profissionais</a><span>/</span>${esc(p.categoria)}</div>${demo(p)?'<div class="demo-note">Perfil demonstrativo · Os dados abaixo são exemplos. Contato indisponível nesta prévia.</div>':''}<section class="profile-hero">${avatar(p)}<div><span class="tag">${esc(p.categoria)}</span><h1>${esc(p.nome)}</h1><p>${esc(p.bairro)} · ${esc(p.atendimento)}</p></div></section><div class="profile-layout"><div><section class="panel"><h2>Conheça o profissional</h2><p class="muted">${esc(p.sobre)}</p></section><section class="panel"><h2>Serviços oferecidos</h2><div class="profile-services">${services(p).map((s,i)=>`<article class="profile-service" id="servico-${i}"><h3>${esc(s.nome)}</h3><p>${esc(s.descricao)}</p><div class="price">Sob orçamento</div>${canContact?`<a class="button secondary" href="${wa(s.nome)}" target="_blank" rel="noopener noreferrer">Solicitar este serviço</a>`:''}</article>`).join('')||'<p>Nenhum serviço informado.</p>'}</div></section></div><aside class="panel contact"><h2>Vamos conversar?</h2><p class="muted">Informe o serviço, o bairro e quando pretende realizar o trabalho.</p>${canContact?`<a class="button" href="${wa()}" target="_blank" rel="noopener noreferrer">Solicitar orçamento pelo WhatsApp</a>`:'<p class="contact-note">'+(demo(p)?'Este é um perfil de demonstração, sem contato real.':'Contato não informado pelo profissional.')+'</p>'}<h3>Região de atendimento</h3><ul>${(Array.isArray(p.regioes)?p.regioes:[]).map(r=>`<li>${esc(r)}</li>`).join('')}</ul><small>Confirme disponibilidade, materiais, valores e condições diretamente com o profissional.</small><a class="button secondary" style="margin-top:22px" href="profissionais.html">Ver outros profissionais</a></aside></div>`;
 if(location.hash){requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());}
 }
}
