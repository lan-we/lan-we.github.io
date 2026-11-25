/* ============================================================
   水乡小筑 — 2.5D 视差交互引擎
   ============================================================ */
(function(){
  "use strict";
  const $=id=>document.getElementById(id);
  const stage=$("stage"),world=$("world"),bgA=$("bgA"),bgB=$("bgB"),markersEl=$("markers");
  const veil=(()=>{const v=document.createElement("div");v.className="scene-veil";v.id="veil";stage.appendChild(v);return v;})();

  const IMG="assets/img/";
  const EMAIL="2226528897@qq.com";
  // content.js 作为原文存档保留在 assets/ 下；页面只展示短卷，不再引用其中的长文

  /* 短卷：只写「过程」与「结果」 */
  function brief(proc,res){
    return '<div class="brief">'+
      '<p><span class="brief__tag">过程</span>'+proc+'</p>'+
      '<p><span class="brief__tag">结果</span>'+res+'</p>'+
    '</div>';
  }

  /* ---------- 场景与热点数据（坐标为裁剪后图的百分比） ---------- */
  const SCENES={
    village:{
      img:IMG+"village.png",fx:"leaves",
      kicker:"江南 · 烟波",title:"水乡小筑",
      desc:"拖动环视水乡，滚轮推近。点击建筑，推门而入。",
      spots:[
        {x:16,y:23,label:"观云阁",enter:"guanyun",zoom:{x:16,y:22}},
        {x:76,y:17,label:"藏书楼",enter:"cangshu",zoom:{x:76,y:18}},
        {x:85,y:74,label:"听雨轩",enter:"tingyu",zoom:{x:84,y:78}},
        {x:47,y:45,label:"临水亭",panel:{
          kicker:"水乡小筑 · 题记",title:"湖上小亭",
          html:'<p class="panel-lede">湖上有亭，山间有阁，三栋建筑各藏一卷。</p>'+
            '<p>观云阁看自述，藏书楼翻三卷随笔，听雨轩留着来信。</p>'+
            '<p>点建筑推门，点光点展卷。</p>'+
            '<p class="quote">烟波浩渺，客官里边请。</p>'}}
      ]
    },
    guanyun:{
      img:IMG+"guanyun.png",fx:"smoke",
      kicker:"观云阁 · 山巅",title:"湖山书房",
      desc:"晨光透窗，墨香未散。案上有自述，架上有卷宗，窗畔是近况。",
      spots:[
        {x:46,y:64,label:"书案 · 自述",panel:{
          kicker:"观云阁 · 自述",title:"你好，我是 lanwe。",
          html:'<p class="panel-lede">物理出身，把「回答好不好」拆成能复核的标准。</p>'+
            brief('物理训练让我习惯先定义变量、再看数据；毕业没走工厂或学校那条稳路，改用 AI 补能力——查资料、写代码、拆问题。',
                  '现在做 AI 评测，把模糊的「感觉不对」拆成别人也能复核的标准。')+
            '<p class="quote">先问清给谁用 · 先跑样本再定标准 · 保留反例。</p>'}},
        {x:75,y:42,label:"书架 · 卷宗",panel:{
          kicker:"观云阁 · 卷宗",title:"行止小录",
          html:'<p class="panel-lede">桂林理工 · 应用物理 · 2026 届 · 深圳。</p>'+
            '<p>方向 AI 评测 / 训练；Python、C、标注平台；中文母语、英语 CET-4。</p>'+
            '<p class="quote">没有正式工作经验，都是公开练习，欢迎指出问题。</p>'}},
        {x:40,y:32,label:"窗畔 · 近况",panel:{
          kicker:"观云阁 · 近况",title:"在深圳 · 寻找 AI 评测 / 训练岗位",
          html:'<p class="panel-lede">人在深圳，找 AI 评测 / 训练的岗位。</p>'+
            '<p>应用物理 2026 届。附上 JD、作品链接或具体问题，我会回信。</p>'}}
      ]
    },
    cangshu:{
      img:IMG+"cangshu.png",fx:"dust",
      kicker:"藏书楼 · 卷帙",title:"三卷随笔",
      desc:"万卷之间，三张书案各摊开一卷。点击光点，展卷一读。",
      spots:[
        {x:17,y:71,label:"随笔一 · 评测设计",panel:{
          kicker:"藏书楼 · 随笔一",title:"同一句「回答得不错」，我们到底在说什么？",
          html:'<p class="panel-lede">把模糊需求拆成能打分的表。</p>'+
            brief('先追问 6 个问题（用途、代价、谁评、否决项、允许误差），拆成 5 个维度与 0/1/2 锚点，加两道一票否决门槛，用 6 条示意样本试跑。',
                  '门槛拦下了「总分高但越权」的回答，也看出「准确 ≠ 有用」。发现维度有重叠、语气最主观；6 条只够验证表能不能用。')}},
        {x:50,y:64,label:"随笔二 · 方法选择",panel:{
          kicker:"藏书楼 · 随笔二",title:"人工评测 vs LLM-as-judge：先算账，再选路",
          html:'<p class="panel-lede">200 条、2 人天，先算账再选路。</p>'+
            brief('算账发现 600 条次在 2 人天做不完；再分清哪些标准模型判不了，对比三条路线成本，设计 30 条分层校准集与一致性门槛。',
                  '不做全自动 judge：人工定标准、建校准集、终审高风险，LLM 做全量初筛与回归监控。换模型或 prompt 就重跑校准；最贵的是校准集和仲裁。')}},
        {x:82,y:71,label:"随笔三 · 标注规范",panel:{
          kicker:"藏书楼 · 随笔三",title:"「注意准确性」不是规范",
          html:'<p class="panel-lede">把形容词改成可取证的规则。</p>'+
            brief('把「准确、完整、不臆造」拆成可观察、可取证的检查项，定成 F1–F7 规则与 P0–P2 处理动作，再用 5 个边界案例试跑。',
                  '判定必须附证据，不再靠「我觉得」；「不确定就拒答、转人工」被保护而不扣分。也发现规则宜精不宜多、P0 不能泛滥、规则要版本化。')}}
      ]
    },
    tingyu:{
      img:IMG+"tingyu.png",fx:"rain",
      kicker:"听雨轩 · 檐下",title:"煮茶候信",
      desc:"雨打芭蕉，炉上水沸。案头一封信候着回音。",
      spots:[
        {x:85,y:60,label:"信笺 · 来信",panel:{
          kicker:"听雨轩 · 来信",title:"想聊评测，或者你在招人？",
          html:'<p class="panel-lede">想聊评测，或你在招人？来信。</p>'+
            '<p>附上 JD、作品链接或具体问题，我会回信。</p><div class="divider"></div>'+
            '<span class="tag">Email</span><br><a class="mail-link" href="mailto:'+EMAIL+'">'+EMAIL+'</a><br>'+
            '<button class="copy-mini" type="button" data-copy="'+EMAIL+'">抄录邮箱</button>'}},
        {x:48,y:66,label:"茶席 · 箴言",panel:{
          kicker:"听雨轩 · 箴言",title:"「人定义标准，机器放大规模，人兜底。」",
          html:'<p class="panel-lede">不建议「全自动 judge」，人机要分工。</p>'+
            '<p>人工定义标准、做校准集、终审高风险样本；LLM 做全量初筛、回归监控、高分歧预警。</p>'+
            '<p class="quote">这不是「人 vs 机器」，是分工。</p>'}},
        {x:8,y:38,label:"屏风 · 藏言",panel:{
          kicker:"听雨轩 · 藏言",title:"欢迎指出问题",
          html:'<p class="panel-lede">都是公开练习，欢迎指出问题。</p>'+
            '<p>没有正式工作经验；30 条校准集只能证明「能不能用」，不能证明「有多准」。</p>'}}
      ]
    }
  };

  /* ---------- 状态 ---------- */
  let current="village";
  let scale=1.06,tx=0,ty=0;          // 当前 transform
  let tScale=1.06,tTx=0,tTy=0;        // 目标 transform（lerp）
  let parX=0,parY=0;                  // 鼠标视差
  let dragging=false,dragMoved=0,lastX=0,lastY=0;
  let switching=false;
  const BASE=1.06;
  let VW=innerWidth,VH=innerHeight;

  /* ---------- 应用 transform ---------- */
  function applyTransform(){
    world.style.transform=`translate(${tx+parX}px,${ty+parY}px) scale(${scale})`;
  }
  function clampPan(){
    const mx=VW*(scale-1)/2+40,my=VH*(scale-1)/2+40;
    tTx=Math.max(-mx,Math.min(mx,tTx));
    tTy=Math.max(-my,Math.min(my,tTy));
  }

  /* ---------- 热点渲染 ---------- */
  function buildSpots(){
    markersEl.innerHTML="";
    SCENES[current].spots.forEach(s=>{
      const el=document.createElement("div");
      el.className="spot"+(s.enter?" spot--nav":" spot--hot");
      el.style.left=s.x+"%";el.style.top=s.y+"%";
      el.innerHTML='<span class="spot__dot"></span><span class="spot__label">'+s.label+'</span>';
      el.addEventListener("pointerdown",e=>{el._dx=e.clientX;el._dy=e.clientY;});
      el.addEventListener("click",e=>{
        e.stopPropagation();
        if(el._dx!==undefined && Math.hypot(e.clientX-el._dx,e.clientY-el._dy)>8)return;
        if(s.enter) enterBuilding(s);
        else if(s.panel) openPanel(s.panel);
      });
      markersEl.appendChild(el);
    });
  }

  /* ---------- 卷宗面板 ---------- */
  const panel=$("panel");
  function openPanel(d){
    $("panelKicker").textContent=d.kicker||"卷宗";
    $("panelTitle").textContent=d.title||"";
    $("panelBody").innerHTML=d.html||"";
    panel.classList.add("is-open");panel.setAttribute("aria-hidden","false");
    $("panelBody").scrollTop=0;
    panel.querySelectorAll("[data-copy]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        if(navigator.clipboard)navigator.clipboard.writeText(btn.dataset.copy).catch(()=>{});
        const old=btn.textContent;btn.textContent="已抄录 ✓";
        setTimeout(()=>btn.textContent=old,1600);
      });
    });
  }
  function closePanel(){panel.classList.remove("is-open");panel.setAttribute("aria-hidden","true");}
  $("panelClose").addEventListener("click",closePanel);

  /* ---------- 场景切换 ---------- */
  function setSceneInfo(name){
    const s=SCENES[name];
    $("sceneKicker").textContent=s.kicker;
    $("sceneTitle").textContent=s.title;
    $("sceneDesc").textContent=s.desc;
    document.querySelectorAll(".realm-nav button").forEach(b=>b.classList.toggle("is-active",b.dataset.scene===name));
    $("backBtn").classList.toggle("is-show",name!=="village");
  }

  function enterBuilding(spot){
    if(switching)return;
    switching=true;closePanel();
    // 阶段1：推进放大到建筑
    const zx=spot.zoom?spot.zoom.x/100:spot.x/100;
    const zy=spot.zoom?spot.zoom.y/100:spot.y/100;
    const targetScale=2.0;
    tScale=targetScale;
    // 让图上 (zx,zy) 点位于屏幕中心
    tTx=(0.5-zx)*VW*targetScale;
    tTy=(0.5-zy)*VH*targetScale;
    world.style.transition="transform 1.05s cubic-bezier(.45,.02,.2,1)";
    scale=targetScale;tx=tTx;ty=tTy;
    world.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;
    // 阶段2：墨晕转场
    setTimeout(()=>{
      veil.classList.add("is-on");
      setTimeout(()=>{ swapScene(spot.enter); },480);
    },1050);
  }

  function swapScene(name){
    current=name;
    const s=SCENES[name];
    bgA.src=s.img;bgA.alt=s.title;
    world.style.transition="none";
    scale=BASE;tx=0;ty=0;tScale=BASE;tTx=0;tTy=0;parX=0;parY=0;
    applyTransform();
    buildSpots();setSceneInfo(name);setFx(s.fx);
    $("mistLayer").style.opacity=(name==="village")?"1":"0";
    requestAnimationFrame(()=>{
      world.style.transition="";
      veil.classList.remove("is-on");
      switching=false;
    });
  }

  function goVillage(){
    if(current==="village"||switching)return;
    closePanel();veil.classList.add("is-on");
    setTimeout(()=>swapScene("village"),420);
  }

  /* ---------- 交互：拖动 / 滚轮 / 鼠标视差 ---------- */
  stage.addEventListener("pointerdown",e=>{
    if(switching)return;
    if(e.target.closest(".spot"))return; // 热点自己处理点击，不捕获指针
    dragging=true;dragMoved=0;lastX=e.clientX;lastY=e.clientY;
    stage.setPointerCapture(e.pointerId);stage.classList.add("is-drag");
  });
  stage.addEventListener("pointermove",e=>{
    if(dragging){
      const dx=e.clientX-lastX,dy=e.clientY-lastY;
      dragMoved+=Math.abs(dx)+Math.abs(dy);
      tTx+=dx;tTy+=dy;clampPan();
      lastX=e.clientX;lastY=e.clientY;
    }
  });
  stage.addEventListener("pointerup",()=>{dragging=false;stage.classList.remove("is-drag");});
  stage.addEventListener("pointercancel",()=>{dragging=false;stage.classList.remove("is-drag");});
  stage.addEventListener("wheel",e=>{
    e.preventDefault();
    if(switching)return;
    tScale=Math.max(1.0,Math.min(2.2,tScale+(e.deltaY>0?-.12:.12)));
  },{passive:false});
  addEventListener("mousemove",e=>{
    if(dragging)return;
    parX=(e.clientX/VW-.5)*-26;
    parY=(e.clientY/VH-.5)*-18;
  });

  /* ---------- 主循环（lerp 平滑） ---------- */
  function loop(){
    if(!switching){
      scale+=(tScale-scale)*.08;
      tx+=(tTx-tx)*.08;ty+=(tTy-ty)*.08;
      applyTransform();
    }
    requestAnimationFrame(loop);
  }
  loop();

  /* ---------- 动效粒子 ---------- */
  const fx=$("fx"),fctx=fx.getContext("2d");
  let fxType="leaves",parts=[];
  function sizeFx(){fx.width=VW;fx.height=VH;}
  function setFx(type){
    fxType=type;parts=[];
    const N=type==="leaves"?46:type==="rain"?120:type==="dust"?60:26;
    for(let i=0;i<N;i++){
      parts.push({
        x:Math.random()*VW,y:Math.random()*VH,
        r:type==="rain"?0:1+Math.random()*2.2,
        vy:type==="rain"?9+Math.random()*5:type==="smoke"?-.4-Math.random()*.5:.5+Math.random()*1.1,
        vx:type==="leaves"?(Math.random()-.3)*1.2:(Math.random()-.5)*.4,
        rot:Math.random()*6.28,vr:(Math.random()-.5)*.06,
        a:.3+Math.random()*.5,hue:Math.random()
      });
    }
  }
  function drawFx(){
    fctx.clearRect(0,0,VW,VH);
    if(fxType==="leaves"){
      parts.forEach(p=>{
        p.y+=p.vy;p.x+=p.vx+Math.sin(p.y*.02)*0.6;p.rot+=p.vr;
        if(p.y>VH+10){p.y=-10;p.x=Math.random()*VW;}
        if(p.x<-10)p.x=VW+10;if(p.x>VW+10)p.x=-10;
        fctx.save();fctx.translate(p.x,p.y);fctx.rotate(p.rot);
        fctx.globalAlpha=p.a;
        fctx.fillStyle=p.hue>.5?"#c1542c":"#d4882c";
        fctx.beginPath();fctx.ellipse(0,0,p.r*1.6,p.r*.9,0,0,7);fctx.fill();
        fctx.restore();
      });
    }else if(fxType==="rain"){
      fctx.strokeStyle="rgba(180,200,215,.28)";fctx.lineWidth=1;
      // 雨丝集中在月窗区域（图中部）
      const cx=VW*.5,cy=VH*.40,rw=VW*.17,rh=VH*.36;
      parts.forEach(p=>{
        p.y+=p.vy;p.x+=p.vx*.3;
        if(p.y>rh){p.y=0;p.x=(Math.random()-.5)*rw*2;}
        const px=cx+p.x,py=cy-rh/2+p.y;
        const dx=(px-cx)/rw,dy=(py-cy)/rh;
        if(dx*dx+dy*dy<1){
          fctx.beginPath();fctx.moveTo(px,py);fctx.lineTo(px-1.5,py+9);fctx.stroke();
        }
      });
    }else if(fxType==="dust"){
      parts.forEach(p=>{
        p.y+=p.vy*.2;p.x+=p.vx;
        if(p.y>VH)p.y=0;if(p.x<0)p.x=VW;if(p.x>VW)p.x=0;
        fctx.globalAlpha=p.a*.5;
        fctx.fillStyle="#ffe0b0";
        fctx.beginPath();fctx.arc(p.x,p.y,p.r*.7,0,7);fctx.fill();
      });
    }else if(fxType==="smoke"){
      // 香炉青烟（左下）
      const cx=VW*.075,cy=VH*.72;
      parts.forEach(p=>{
        p.y+=p.vy;p.x+=p.vx*.4;
        if(p.y<-VH*.35){p.y=0;p.x=(Math.random()-.5)*30;}
        fctx.globalAlpha=Math.max(0,p.a*(1+p.y/(VH*.4)))*.5;
        fctx.fillStyle="#d8d0c0";
        fctx.beginPath();fctx.arc(cx+p.x+Math.sin(p.y*.02)*8,cy+p.y,6+p.r*3,0,7);fctx.fill();
      });
    }
    fctx.globalAlpha=1;
    requestAnimationFrame(drawFx);
  }

  /* ---------- 事件绑定 ---------- */
  document.querySelectorAll(".realm-nav button").forEach(b=>{
    b.addEventListener("click",()=>{
      if(switching)return;
      const t=b.dataset.scene;
      if(t===current)return;
      if(current==="village"){
        const spot=SCENES.village.spots.find(s=>s.enter===t);
        if(spot)enterBuilding(spot);
      }else{
        closePanel();veil.classList.add("is-on");
        setTimeout(()=>swapScene(t),420);
      }
    });
  });
  $("backBtn").addEventListener("click",goVillage);
  addEventListener("keydown",e=>{
    if(e.key==="Escape"){
      if(panel.classList.contains("is-open"))closePanel();
      else goVillage();
    }
  });
  const helpCard=$("helpCard");
  $("helpBtn").addEventListener("click",()=>helpCard.classList.toggle("is-open"));
  $("helpClose").addEventListener("click",()=>helpCard.classList.remove("is-open"));

  /* ---------- 环境音 ---------- */
  let audioCtx=null,ambientGain=null,soundOn=false;
  function initAudio(){
    if(audioCtx)return;
    try{
      audioCtx=new (window.AudioContext||window.webkitAudioContext)();
      const o1=audioCtx.createOscillator(),o2=audioCtx.createOscillator();
      o1.type="sine";o2.type="sine";o1.frequency.value=110;o2.frequency.value=164.8;
      const filter=audioCtx.createBiquadFilter();filter.type="lowpass";filter.frequency.value=300;
      ambientGain=audioCtx.createGain();ambientGain.gain.value=0;
      o1.connect(filter);o2.connect(filter);filter.connect(ambientGain);ambientGain.connect(audioCtx.destination);
      o1.start();o2.start();
    }catch(e){}
  }
  $("soundBtn").addEventListener("click",function(){
    initAudio();soundOn=!soundOn;
    this.classList.toggle("is-off",!soundOn);
    if(audioCtx&&ambientGain){
      if(audioCtx.state==="suspended")audioCtx.resume();
      ambientGain.gain.setTargetAtTime(soundOn?.05:0,audioCtx.currentTime,.4);
    }
  });

  /* ---------- 开场 ---------- */
  const boot=$("boot"),bootBar=$("bootBar"),bootStatus=$("bootStatus"),bootEnter=$("bootEnter");
  const steps=["正在调墨山水…","叠石为岸，引水成湖…","筑观云阁于崖上…","万卷入藏书楼…","檐下煮茶，静候听雨…","水乡已就绪。"];
  let progress=0;
  const preload=["village","guanyun","cangshu","tingyu"].map(n=>{
    const im=new Image();im.src=IMG+n+".png";return im;
  });
  (function tickBoot(){
    progress=Math.min(100,progress+7+Math.random()*11);
    bootBar.style.width=progress+"%";
    bootStatus.textContent=steps[Math.min(steps.length-1,Math.floor(progress/100*steps.length))];
    if(progress<100)setTimeout(tickBoot,110);
    else{bootEnter.disabled=false;bootStatus.textContent="水乡已就绪，请移步入内。";}
  })();
  bootEnter.addEventListener("click",()=>{
    boot.classList.add("is-gone");initAudio();
    setTimeout(()=>$("hint").classList.add("is-hidden"),9000);
  });

  /* ---------- 初始化 ---------- */
  function init(){
    VW=innerWidth;VH=innerHeight;sizeFx();
    bgA.src=SCENES.village.img;
    buildSpots();setSceneInfo("village");setFx("leaves");
    applyTransform();
  }
  init();drawFx();
  addEventListener("resize",()=>{VW=innerWidth;VH=innerHeight;sizeFx();});

  // 暴露给测试
  window.PANO={go:(n)=>{if(n==="village")goVillage();else{veil.classList.add("is-on");setTimeout(()=>swapScene(n),420);}},
    get current(){return current;},SCENES};
})();
