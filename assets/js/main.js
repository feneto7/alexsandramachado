(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s), $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 767px)');
  let lenis = null;
  $('#year').textContent = new Date().getFullYear();

  /*
   * NATIVE STRUCTURAL ASSEMBLY — no WebGL, network or animation library required.
   * Orthographic 3D geometry + depth-sorted shaded faces, redrawn only on scroll/resize.
   * Inspired by the metal-truss typology of Ponte Dom Pedro II. Three illustrative
   * modules are shown, not a measured reconstruction or an actual construction plan.
   */
  function initStructures() {
    const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
    const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
    const lerp=(a,b,t)=>a+(b-a)*t;
    const stages=[
      ['Apoios e pilares','A estrutura começa na base. Os apoios se elevam e definem os pontos de sustentação.'],
      ['Vigas e travessas','As longarinas conectam os apoios. As travessas compõem a base do tabuleiro.'],
      ['Pórticos metálicos','Montantes e vigas superiores chegam em módulos e formam os pórticos da ponte.'],
      ['Treliças e ligações','As diagonais fecham os painéis. Os contraventamentos conectam os planos da estrutura.'],
      ['Tabuleiro e trilhos','O tabuleiro se encaixa sobre as vigas. Dormentes, trilhos e guarda-corpos completam o conjunto.'],
      ['Estrutura completa','Uma nova perspectiva revela a integração das peças e os elementos de atenção na manutenção estrutural.']
    ];
    const components=[];
    const faceIndices=[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
    const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    const normal=a=>{let l=Math.hypot(...a)||1;return a.map(n=>n/l);};
    function beam(a,b,size,stage,index=0,color=[43,128,147],lift=[0,65,0]) {
      const direction=normal(b.map((v,i)=>v-a[i]));
      const u=normal(cross(direction,Math.abs(direction[1])>.9?[1,0,0]:[0,1,0]));
      const v=cross(direction,u);
      const vertices=[];
      for(const p of [a,b])for(const [su,sv] of [[-1,-1],[1,-1],[1,1],[-1,1]])vertices.push(p.map((n,i)=>n+(u[i]*su+v[i]*sv)*size/2));
      const faces=faceIndices.map((ids,i)=>({ids,color:color.map(c=>Math.round(c*[.62,.98,.72,1.2,.84,1.05][i]))}));
      components.push({vertices,faces,stage,index,lift,center:a.map((n,i)=>(n+b[i])/2)});
    }
    function slab(x0,x1,y,z0,z1,depth,stage,index,color,lift=[0,50,0]){
      const vertices=[[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1],[x0,y+depth,z0],[x1,y+depth,z0],[x1,y+depth,z1],[x0,y+depth,z1]];
      const faces=faceIndices.map((ids,i)=>({ids,color:color.map(c=>Math.round(c*[.5,1.25,.75,.92,.65,1][i]))}));
      components.push({vertices,faces,stage,index,lift,center:[(x0+x1)/2,y,(z0+z1)/2]});
    }
    function column(x,z,index){
      const vertices=[];for(const y of [-4,51])for(let i=0;i<8;i++){let a=i*Math.PI/4;vertices.push([x+Math.cos(a)*5.4,y,z+Math.sin(a)*5.4]);}
      const faces=[];for(let i=0;i<8;i++){let shade=.65+.35*Math.sin(i*Math.PI/4+.8);faces.push({ids:[i,(i+1)%8,(i+1)%8+8,i+8],color:[78,101,113].map(v=>Math.round(v*shade))});}
      faces.push({ids:[8,9,10,11,12,13,14,15],color:[113,139,147]});
      components.push({vertices,faces,stage:0,index,lift:[0,-65,0],center:[x,26,z]});
    }
    // The original structural study uses three repeated modules with open truss sides.
    [-180,-60,60,180].forEach((x,i)=>{[-20,20].forEach(z=>{slab(x-9,x+9,-7,z-9,z+9,5,0,i*.15,[51,78,88],[0,-18,0]);column(x,z,i*.15);});slab(x-9,x+9,49,-28,28,7,0,i*.15+.08,[97,117,124],[0,-35,0]);});
    for(let s=0;s<3;s++){
      const left=-180+s*120,right=left+120;
      [-22,22].forEach(z=>{beam([left,58,z],[right,58,z],5,1,s*.15,[39,115,134]);beam([left,109,z],[right,109,z],4,2,s*.14+.12,[48,153,174]);});
      for(let j=0;j<=5;j++){
        const x=left+j*24;
        beam([x,57,-24],[x,57,24],3.1,1,s*.12+j*.04,[60,132,148]);
        [-22,22].forEach(z=>beam([x,60,z],[x,109,z],2.7,2,s*.12+j*.035,[43,147,168],[0,70,z>0?12:-12]));
        beam([x,109,-22],[x,109,22],2.3,2,s*.12+j*.035+.08,[46,142,160]);
        if(j<5){
          [-22,22].forEach(z=>{beam([x,61,z],[x+24,107,z],1.65,3,s*.12+j*.035,[38,150,173],[0,12,z>0?48:-48]);beam([x,107,z],[x+24,61,z],1.65,3,s*.12+j*.035+.04,[34,120,145],[0,16,z>0?48:-48]);});
          beam([x,109,-22],[x+24,109,22],1.25,3,s*.12+j*.03,[49,131,150],[0,42,0]);
          beam([x,109,22],[x+24,109,-22],1.25,3,s*.12+j*.03,[49,131,150],[0,42,0]);
          slab(x+.8,x+23.2,60,-21,21,1.6,4,s*.12+j*.035,[46,76,88],[0,50,0]);
        }
      }
    }
    for(let i=0;i<=45;i++){const x=-180+i*8;beam([x,63,-14],[x,63,14],1.6,4,i*.012,[132,109,70],[0,32,0]);}
    [-8,8].forEach(z=>beam([-180,65,z],[180,65,z],1.4,4,.62,[159,184,187],[0,32,0]));
    [-26,26].forEach(z=>{beam([-180,73,z],[180,73,z],1.1,4,.68,[74,143,155]);for(let i=0;i<=18;i++)beam([-180+i*20,62,z],[-180+i*20,73,z],.8,4,i*.025,[64,119,135]);});

    const scenes=$$('.structure-scene').map(host=>{
      const canvas=$('canvas',host),ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return null;
      host.classList.add('is-rendered');
      return {host,canvas,ctx,kind:host.dataset.scene,current:reduced.matches?1:0,target:0,last:NaN,width:0,height:0,visible:true,phase:-1,percent:-1};
    }).filter(Boolean);
    if(!scenes.length)return;
    function measure(scene){
      const r=scene.host.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
      if(scene.width!==r.width||scene.height!==r.height||scene.dpr!==dpr){scene.width=r.width;scene.height=r.height;scene.dpr=dpr;scene.canvas.width=Math.round(r.width*dpr);scene.canvas.height=Math.round(r.height*dpr);scene.last=NaN;}
    }
    function metrics(scene){
      const small=mobile.matches;
      const track=scene.kind==='case'?$('.build-track'):small?$('.hero-visual'):$('.hero-scroll');
      const sticky=scene.kind==='case'?$('.build-stage'):small?$('.model-frame'):$('.hero-main');
      const top=parseFloat(getComputedStyle(sticky).top)||0;
      return {track,sticky,top,start:scrollY+track.getBoundingClientRect().top-top,travel:Math.max(1,track.offsetHeight-sticky.offsetHeight)};
    }
    function updateHud(scene,p){
      let step=Math.min(5,Math.floor(p*6)),percent=Math.round(p*100);
      scene.host.dataset.progress=p.toFixed(4);
      scene.host.dataset.phase=String(step);
      const scope=scene.kind==='case'?$('.build-stage'):$('.model-frame');
      if(scene.percent!==percent){$('.assembly-percent',scope).textContent=String(percent).padStart(2,'0')+'%';scene.percent=percent;}
      $('.assembly-meter i',scope).style.transform=`scaleX(${p})`;
      if(scene.phase!==step){
        if(scene.kind==='hero')$('.assembly-label',scope).textContent=String(step+1).padStart(2,'0')+' / '+stages[step][0];
        else{$('.build-count').textContent=String(step+1).padStart(2,'0')+' / 06';$('.build-title').textContent=stages[step][0];$('.build-description').textContent=stages[step][1];$$('.build-stages button').forEach((b,i)=>{b.classList.toggle('is-complete',i<step);if(i===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});}
        scene.phase=step;
      }
    }
    function render(scene,p){
      const {ctx,width:w,height:h,dpr}=scene;if(!w||!h)return;
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
      const small=w<510;
      const yaw=lerp(small?-.88:-.48,small?-.62:-.2,smooth(p)) + Math.sin(p*Math.PI)*-.2;
      const pitch=lerp(.58,.38,smooth(p));
      const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
      const raw=([x,y,z])=>{let xx=x*cy-z*sy,zz=x*sy+z*cy;return [xx,-(y-55)*cp+zz*sp,(y-55)*sp+zz*cp];};
      const bounds=[];for(const x of [-202,202])for(const y of [-15,135])for(const z of [-34,34])bounds.push(raw([x,y,z]));
      const spanX=Math.max(...bounds.map(v=>v[0]))-Math.min(...bounds.map(v=>v[0]));
      const spanY=Math.max(...bounds.map(v=>v[1]))-Math.min(...bounds.map(v=>v[1]));
      const scale=Math.min(w*.9/spanX,h*(scene.kind==='hero'?.62:.73)/spanY)*(1+.035*smooth(p));
      const cx=w*.5,centerY=h*(scene.kind==='hero'?.49:.52);
      const project=v=>{let a=raw(v);return [cx+a[0]*scale,centerY+a[1]*scale,a[2]];};
      function path(points,color,width=1,fill=null){ctx.beginPath();points.forEach((a,i)=>{const q=project(a);if(i)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1]);});if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}if(color){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}}
      // River plane / drafting grid, deliberately unscaled and non-dimensional.
      path([[-240,-8,-90],[240,-8,-90],[240,-8,90],[-240,-8,90]],null,0,'rgba(13,58,70,.2)');
      for(let x=-240;x<=240;x+=24)path([[x,-7,-100],[x,-7,100]],'rgba(69,133,151,.12)',.6);
      for(let z=-96;z<=96;z+=24)path([[-240,-7,z],[240,-7,z]],'rgba(69,133,151,.12)',.6);
      ctx.setLineDash([3,5]);
      [-180,-60,60,180].forEach(x=>path([[x,-6,-55],[x,-6,55]],'rgba(255,176,32,.32)',.7));
      // Subtle reference envelope stays visible before assembly starts.
      for(const z of [-22,22]){path([[-180,58,z],[180,58,z],[180,109,z],[-180,109,z],[-180,58,z]],'rgba(78,141,161,.18)',.65);for(let x=-180;x<=180;x+=24)path([[x,58,z],[x,109,z]],'rgba(78,141,161,.10)',.6);}
      ctx.setLineDash([]);
      const faces=[];
      for(const c of components){
        const start=c.stage*.166 + c.index*.055;
        const t=smooth((p-start)/.115);if(t<=.001)continue;
        const shift=c.lift.map(v=>v*(1-t));
        const verts=c.vertices.map(v=>project(v.map((n,i)=>n+shift[i])));
        for(const f of c.faces){
          const points=f.ids.map(i=>verts[i]);
          const area=points.reduce((s,a,i)=>{let b=points[(i+1)%points.length];return s+a[0]*b[1]-b[0]*a[1];},0);
          if(area>-.08)continue;
          const depth=points.reduce((s,v)=>s+v[2],0)/points.length;
          faces.push({points,depth,color:f.color,alpha:Math.min(1,t*3),active:t<.99});
        }
      }
      faces.sort((a,b)=>a.depth-b.depth);
      for(const f of faces){ctx.globalAlpha=f.alpha;ctx.beginPath();f.points.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.closePath();ctx.fillStyle=`rgb(${f.color.join(',')})`;ctx.fill();ctx.lineWidth=f.active?.8:.45;ctx.strokeStyle=f.active?'rgba(255,185,65,.85)':'rgba(134,220,230,.42)';ctx.stroke();}
      ctx.globalAlpha=1;
      // Amber inspection sweep is the final chapter, moving in exact reverse on scroll-up.
      if(p>.84){const scan=smooth((p-.84)/.16),x=lerp(-180,180,scan);path([[x,54,-25],[x,113,-25],[x,113,25],[x,54,25]],'rgba(255,176,32,.8)',1.2,'rgba(255,176,32,.035)');}
      // Readable callout to the element currently being assembled.
      const step=Math.min(5,Math.floor(p*6));
      const anchors=[[-60,28,20],[-60,58,22],[60,109,22],[36,85,22],[0,65,8],[140,109,22]];
      const labels=['APOIOS','LONGARINAS','PÓRTICOS','DIAGONAIS','TABULEIRO','CONJUNTO'];
      if(p>.03){const q=project(anchors[step]);let endX=clamp(q[0]+(q[0]>w*.5?-50:50),22,w-85),endY=clamp(q[1]-42,55,h-70);ctx.strokeStyle='rgba(255,176,32,.7)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(endX,endY);ctx.lineTo(endX+62,endY);ctx.stroke();ctx.beginPath();ctx.arc(q[0],q[1],2,0,Math.PI*2);ctx.fillStyle='#ffb020';ctx.fill();ctx.font=`${small?7:9}px monospace`;ctx.fillStyle='#c7dce4';ctx.fillText(labels[step],endX,endY-6);}
      updateHud(scene,p);
      scene.last=p;
    }
    let pending=0;
    function frame(){
      pending=0;let again=false;
      for(const scene of scenes){
        if(!scene.visible)continue;
        const delta=scene.target-scene.current;
        scene.current=reduced.matches?1:Math.abs(delta)<.0004?scene.target:scene.current+delta*.2;
        if(scene.current!==scene.last)render(scene,scene.current);
        if(Math.abs(scene.target-scene.current)>.0004&&!reduced.matches)again=true;
      }
      if(again)pending=requestAnimationFrame(frame);
    }
    function request(){if(!pending)pending=requestAnimationFrame(frame);}
    function update(){for(const scene of scenes){const m=metrics(scene);scene.target=reduced.matches?1:clamp((scrollY-m.start)/m.travel);}request();}
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){const scene=scenes.find(s=>s.host===entry.target);scene.visible=entry.isIntersecting;if(scene.visible){measure(scene);scene.last=NaN;}}update();},{rootMargin:'100px'});
    scenes.forEach(scene=>{measure(scene);observer.observe(scene.host);render(scene,reduced.matches?1:0);});
    const resize=new ResizeObserver(()=>{scenes.forEach(measure);update();});scenes.forEach(s=>resize.observe(s.host));
    addEventListener('scroll',update,{passive:true});addEventListener('resize',()=>{scenes.forEach(measure);update();},{passive:true});
    reduced.addEventListener('change',()=>{scenes.forEach(s=>{s.current=reduced.matches?1:0;s.last=NaN;});update();});
    mobile.addEventListener('change',()=>{scenes.forEach(s=>{measure(s);s.last=NaN;});update();});
    function seek(progress){if(reduced.matches)return;const m=metrics(scenes.find(s=>s.kind==='case'));const y=m.start+m.travel*progress;if(lenis)lenis.scrollTo(y,{duration:1.2});else scrollTo({top:y,behavior:'smooth'});}
    $$('.build-stages button').forEach((button,i)=>button.addEventListener('click',()=>seek(i===5?1:(i+.78)/6)));
    $('.build-replay').addEventListener('click',()=>seek(0));
    document.fonts?.ready.then(()=>{scenes.forEach(measure);update();});
    update();
  }
  initStructures();


  /* Accessible mobile navigation: focus trapping, Escape, return focus, inert background. */
  const toggle=$('.menu-toggle'),nav=$('.nav'),header=$('.header');
  function setMenu(open,returnFocus=false){toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');nav.classList.toggle('is-open',open);header.classList.toggle('menu-active',open);document.body.classList.toggle('menu-open',open);$('main').inert=open;$('.whatsapp-float').inert=open;if(open){lenis?.stop();nav.querySelector('a').focus({preventScroll:true});}else{lenis?.start();if(returnFocus)toggle.focus({preventScroll:true});}}
  toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true',toggle.getAttribute('aria-expanded')==='true'));
  nav.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false);});
  document.addEventListener('keydown',e=>{if(toggle.getAttribute('aria-expanded')!=='true')return;if(e.key==='Escape'){setMenu(false,true);return;}if(e.key==='Tab'){const items=[...$$('a',nav),toggle],first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  mobile.addEventListener('change',()=>setMenu(false));
  $$('.skill').forEach(button=>button.addEventListener('click',()=>button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true'))));

  /* Active navigation is determined in document order in both scrolling directions. */
  let scrollQueued=false;
  function updateScroll(){const y=scrollY,total=document.documentElement.scrollHeight-innerHeight;$('.progress').style.transform=`scaleX(${total>0?y/total:0})`;header.classList.toggle('scrolled',y>30);let active=null;$$('main section[id]').forEach(section=>{if(section.getBoundingClientRect().top<=innerHeight*.38)active=section.id;});$$('.nav a').forEach(a=>{if(a.hash==='#'+active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});scrollQueued=false;}
  addEventListener('scroll',()=>{if(!scrollQueued){requestAnimationFrame(updateScroll);scrollQueued=true;}},{passive:true});updateScroll();

  /* Loading is decorative and never blocks access if scripts or networks fail. */
  const loader=$('.loader');
  if(!reduced.matches&&!location.hash){loader.hidden=false;let start=performance.now();const length=$('.loader path').getTotalLength();$('.loader path').style.strokeDasharray=length;function load(now){let p=Math.min(1,(now-start)/1100);$('.loader-value').textContent=String(Math.round(p*100)).padStart(3,'0')+'%';$('.loader-bar i').style.transform=`scaleX(${p})`;$('.loader path').style.strokeDashoffset=length*(1-p);if(p<1)requestAnimationFrame(load);else{loader.classList.add('done');setTimeout(()=>loader.hidden=true,550);}}requestAnimationFrame(load);setTimeout(()=>{loader.hidden=true;},2200);}

  function initMotion(){
    if(!window.gsap||!window.ScrollTrigger)return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ignoreMobileResize:true});
    const mm=gsap.matchMedia();
    mm.add({desktop:'(min-width: 768px)',mobile:'(max-width: 767px)',reduce:'(prefers-reduced-motion: reduce)'},context=>{
      const {desktop,reduce}=context.conditions;
      if(reduce)return;
      if(desktop&&window.Lenis&&matchMedia('(pointer: fine)').matches){lenis=new Lenis({duration:1.05,smoothWheel:true,syncTouch:false,anchors:false});lenis.on('scroll',ScrollTrigger.update);}
      const tick=time=>lenis?.raf(time*1000);gsap.ticker.add(tick);
      /* Split into spans without altering the accessible name or paragraph text. */
      $$('.name-line').forEach(line=>{if(!line.dataset.split){const text=line.textContent;line.textContent='';Array.from(text).forEach(char=>{const span=document.createElement('span');span.className='char';span.textContent=char;line.appendChild(span);});line.dataset.split='true';}});
      const paragraph=$('.about-text');if(!paragraph.dataset.split){const text=paragraph.textContent;paragraph.textContent='';text.split(/\s+/).forEach((word,i)=>{if(i)paragraph.appendChild(document.createTextNode(' '));const span=document.createElement('span');span.className='word';span.textContent=word;paragraph.appendChild(span);});paragraph.dataset.split='true';}
      if(desktop){gsap.fromTo('.char',{x:0,y:0,opacity:1},{y:(i)=>(i%2?1:-1)*13,x:(i)=>(i-9)*.8,opacity:.7,stagger:.006,ease:'none',scrollTrigger:{trigger:'.hero-scroll',start:'top top',end:'bottom bottom',scrub:.4}});}
      gsap.fromTo('.word',{opacity:.16},{opacity:1,stagger:.07,ease:'none',scrollTrigger:{trigger:'.about-text',start:'top 85%',end:'bottom 65%',scrub:.5}});
      gsap.from('.chips .pill',{y:18,opacity:0,stagger:.1,ease:'power3.out',scrollTrigger:{trigger:'.chips',start:'top 93%',end:'top 72%',scrub:.5}});
      const counterTweens=[];
      $$('.stat-value').forEach(el=>{const count={value:0};counterTweens.push(gsap.to(count,{value:+el.dataset.count,ease:'none',onUpdate:()=>el.textContent=Math.round(count.value),scrollTrigger:{trigger:'.stats',start:'top 96%',end:'top 65%',scrub:.4}}));});
      gsap.fromTo('.timeline-fill',{scaleY:0},{scaleY:1,ease:'none',scrollTrigger:{trigger:'.timeline',start:'top 72%',end:'bottom 60%',scrub:.4}});
      $$('.job').forEach((card,i)=>{gsap.from(card,{x:desktop?(i%2?35:-35):16,y:18,opacity:0,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 95%',end:'top 72%',scrub:.5}});ScrollTrigger.create({trigger:card,start:'top 65%',end:'bottom 35%',toggleClass:'is-active'});});
      gsap.from('.skill',{y:26,opacity:0,stagger:.06,ease:'power3.out',scrollTrigger:{trigger:'.skills-grid',start:'top 92%',end:'top 45%',scrub:.6}});
      const track=$('.education-track'),windowEl=$('.education-window');
      if(desktop){gsap.set(windowEl,{scrollSnapType:'none'});gsap.to(windowEl,{scrollLeft:()=>Math.max(0,track.scrollWidth-windowEl.clientWidth),ease:'none',scrollTrigger:{trigger:'.education-window',start:'top 76%',end:'bottom 22%',scrub:.7,invalidateOnRefresh:true}});}
      gsap.from('.contact-title',{yPercent:105,ease:'power3.out',scrollTrigger:{trigger:'.contact-mask',start:'top 95%',end:'top 58%',scrub:.65}});
      const refresh=()=>ScrollTrigger.refresh();document.fonts?.ready.then(refresh);refresh();
      return()=>{gsap.ticker.remove(tick);lenis?.destroy();lenis=null;$$('.stat-value').forEach(el=>el.textContent=el.dataset.count);$$('.job').forEach(el=>el.classList.remove('is-active'));};
    });
    const pointer=gsap.matchMedia();
    pointer.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',()=>{
      const cleanups=[];$$('.magnetic').forEach(el=>{const move=e=>{const r=el.getBoundingClientRect();gsap.to(el,{x:(e.clientX-r.left-r.width/2)*.12,y:(e.clientY-r.top-r.height/2)*.16,duration:.4});};const leave=()=>gsap.to(el,{x:0,y:0,duration:.6,ease:'power3.out'});el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);cleanups.push(()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);gsap.set(el,{clearProps:'transform'});});});
      return()=>cleanups.forEach(fn=>fn());
    });
    /* Resolve anchors against ScrollTrigger's natural positions, accounting for pin spacing. */
    document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const target=$(a.hash);if(!target)return;e.preventDefault();setMenu(false);const position=Math.max(0,scrollY+target.getBoundingClientRect().top-86);if(lenis&&!reduced.matches)lenis.scrollTo(position,{duration:1.1});else window.scrollTo({top:position,behavior:reduced.matches?'instant':'smooth'});history.replaceState(null,'',a.hash);target.setAttribute('tabindex','-1');target.focus({preventScroll:true});});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMotion,{once:true});else initMotion();
})();
