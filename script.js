    //<!-- ===== ปี ===== -->
    document.getElementById('y').textContent = new Date().getFullYear();

    //<!-- ===== แผงเมนูเลื่อนออกมาทางขวา ===== -->
    {const drawer = document.getElementById('drawer');
    const openBtn = document.getElementById('openMenu');
    const closeBtn = document.getElementById('closeMenu');
    function toggleMenu(force){
      if (!drawer) return;
      const open = (typeof force === 'boolean') ? force : !drawer.classList.contains('is-open');
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
      }
      if (openBtn) openBtn.addEventListener('click', () => toggleMenu(true));
      if (closeBtn) closeBtn.addEventListener('click', () => toggleMenu(false));
      if (drawer) {
      drawer.addEventListener('click', (e)=>{ if(e.target===drawer) toggleMenu(false) });
      drawer.addEventListener('touchmove', (e) => {
      if (!e.target.closest('.drawer__panel')) e.preventDefault();
      }, { passive:false });
    }}

    //<!-- ===== เลื่อยโลโก้เลื่อยๆ ===== -->
    {function setupLogoTicker(root) {
    if (!root) return;
    const track = root.querySelector('#track');
    const viewport = root.querySelector('.ticker__viewport');
    if (!track || !viewport) return;
    const speed = parseFloat(
      getComputedStyle(document.documentElement)
      .getPropertyValue('--speed')
    ) || 100;
    const minWidth = (viewport.clientWidth || 300) * 2;
    let totalWidth = track.scrollWidth;
    while (totalWidth < minWidth) {
      const children = [...track.children];
      children.forEach(node => {
        track.appendChild(node.cloneNode(true));
      });
      totalWidth = track.scrollWidth;
    }
    const shift = -Math.floor(totalWidth / 2);
    const duration = Math.abs(shift) / speed;
    track.style.setProperty('--to', shift + 'px');
    track.style.setProperty('--duration', duration + 's');
    void track.offsetWidth;
    track.classList.add('anim');}
    window.addEventListener('DOMContentLoaded', () => {
    setupLogoTicker(document.getElementById('ticker'));
    });}
    
    //<!-- ===== เนื้อหาล่นลงมา ===== -->
    (function(){
      const SELECTOR   = 'h1.text-animate, h2.text-animate, h3.text-animate, h4.text-animate, p.text-animate, .text-animate';
      const DELAY_STEP = 0.06;
      const START_DELAY= 0.00;
      const REPLAY     = false;
      const hasSeg = 'Intl' in window && 'Segmenter' in Intl;
      const seg    = hasSeg ? new Intl.Segmenter('th', { granularity:'grapheme' }) : null;
      function splitToSpans(el){
        if (!el.dataset.orig) el.dataset.orig = el.textContent;
        const text  = el.dataset.orig;
        el.textContent = '';
        const units = seg ? Array.from(seg.segment(text), s => s.segment) : Array.from(text);
        let i = 0;
        for (const u of units){
          if (u === ' '){
            const sp = document.createElement('span');
            sp.className = 'space';
            sp.textContent = ' ';
            el.appendChild(sp);
            continue;
          }
          const span = document.createElement('span');
          span.className = 'char';
          span.textContent = u;
          // ตั้งดีเลย์ทีละตัว
          span.style.animationDelay = (START_DELAY + i * DELAY_STEP) + 's';
          el.appendChild(span);
          i++;
        }
        el.dataset.ready = '1';
        // ให้เบราว์เซอร์คำนวณ layout ก่อน จากนั้นเปิดเล่น
        requestAnimationFrame(()=> el.dataset.in = '1');
      }
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
          const el = e.target;
          if (e.isIntersecting){
            if (el.dataset.ready !== '1') splitToSpans(el);
            else el.dataset.in = '1';
            if (!REPLAY) io.unobserve(el); // เล่นครั้งเดียว
          }else if (REPLAY){
            // รีเซ็ตเพิ่อให้เล่นใหม่เมื่อกลับเข้าจอ
            el.dataset.in = '0';
            el.textContent = el.dataset.orig || el.textContent;
            el.dataset.ready = '0';
          }
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
      document.querySelectorAll(SELECTOR).forEach(el => io.observe(el));
    })();
    
    //<!-- ===== เนื้อหาค่อยๆโผล่ ===== -->
    (function(){
      const REPLAY = false; // เล่นครั้งเดียว (false); ถ้าอยากเล่นซ้ำทุกครั้งให้เป็น true
      function initPopReveal(){
        const els = document.querySelectorAll('[data-pop]');
        if(!els.length) return;
        const io = new IntersectionObserver((entries)=>{
          entries.forEach(e=>{
            const el = e.target;
            if(e.isIntersecting){
              el.classList.add('is-in');
              if(!REPLAY) io.unobserve(el);  // เล่นครั้งเดียวแล้วเลิกสังเกต
            }else if(REPLAY){
              el.classList.remove('is-in');  // รีเซ็ตเพื่อเล่นใหม่รอบหน้า
            }
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
        els.forEach(el => io.observe(el));
      }
      if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', initPopReveal, { once:true });
      }else{
        initPopReveal();
      }
    })();
    //<!-- ===== เปลี่ยนภาษา ===== -->
    (function(){
      const STORAGE_KEY = "fvc_lang";
      const DEFAULT_LANG = "th";

      const langNames = {
        th: "ไทย (TH)",
        en: "English (EN)",
        zh: "中文 (ZH)"
      };
      const langFlags = {
        th: "https://flagcdn.com/w20/th.png",
        en: "https://flagcdn.com/w20/gb.png",
        zh: "https://flagcdn.com/w20/cn.png"
      };

      // ======= คำแปล =======
      const i18n = {
        th: {
          lang_btn: "ภาษา",
          about: "เกี่ยวกับเรา",
          services: "บริการ",
          project: "ผลงาน",
          news: "ข่าวสาร",
          contact: "ติดต่อเรา",
          menu:"เมนู",
          home_page:"หน้าแรก",
          Name_Company:"บริษัท ฟอร์เวิร์ด วิชั่น คอนซัลแทนท์ จำกัด",
          hero_Our_services:"บริการของเราเริ่มต้นตั้งแต่การออกแบบไปจนถึงการขอใบอนุญาตก่อสร้างในนิคมอุตสาหกรรม (กนอ.) และได้กำหนดกลยุทธ์การบริหารจัดการเพื่อลดต้นทุนและเพิ่มประสิทธิภาพ ซึ่งเป็นนโยบายสำคัญ เรามีวิศวกรผู้เชี่ยวชาญและการพัฒนาบุคลากรอย่างต่อเนื่อง เราได้รับมาตรฐาน ISO9001:2015",
          See_the_work:"ดูผลงาน",
          experience:"ประสบการณ์กว่า 10 ปี",
          experience_services:"งานก่อสร้างโยธา งานติดตั้งระบบไฟฟ้า ระบบสื่อสารโทรคมนาคม ระบบปรับอากาศ ระบบสุขาภิบาล และระบบป้องกันอัคคีภัย ตามมาตรฐานอุตสาหกรรม",
          about_build:"ก่อตั้งโดยทีมวิศวกรผู้เชี่ยวชาญ ให้บริการงานวิศวกรรม",
          vision_and_mission:"ดูวิสัยทัศน์และพันธกิจ",
          vision:"วิสัยทัศน์",
          vision_text:"Forward Vision Consultant คือผู้ให้บริการด้านไฟฟ้า เครื่องกล และก่อสร้างที่มีประสิทธิภาพ เพื่อความพึงพอใจสูงสุดของลูกค้า",
          project:"ผลงาน",
          Group_companies:"กลุ่มบริษัท",
          FVC:"FORWARD VISION CONSULTANT CO.,LTD บริษัทออกแบบและที่ปรึกษา",
          TTR:"THAI THARIT CO.,LTD บริษัท วิศวกรรมและรับเหมาก่อสร้าง",
          Explore_all:"สำรวจบริการทั้งหมด",
          services_text:"ออกแบบ จัดหา ติดตั้ง ทดสอบ เดินระบบ และบำรุงรักษา",
          all:"ดูทั้งหมด",
          civil_details:"ให้บริการงานก่อสร้างโยธาอย่างมีคุณภาพสูง มีความปลอดภัยและตรงตามความคาดหวังทุกประการ",
          civil_details:"ให้บริการด้านระบบไฟฟ้า HV/LV รวมถึงระบบควบคุม ระบบไฟฟ้าและระบบสื่อสาร ฯลฯ",
          civil_details:"ให้บริการงานเครื่องกลครอบคลุมการติดตั้งระบบท่อ การติดตั้งเครื่องจักรและปรับฐานรากให้มั่นคง และระบบ Air Compressed ฯลฯ",
          project_title:"ตัวอย่างผลงานโครงการเด่นจากโครงกการทั้งหมดของเรา",
          install_Tr_MDB:"ติดตั้งหม้อแปลงและตู้ MDB",
          customer:"ลูกค้าที่ไว้วางใจเรา",
          FVC_title:"ผู้รับเหมางานโครงการก่อสร้าง",
          Contact_us:"ติดต่อเรา",
        },
        en: {
          lang_btn: "Language",
          about: "About us",
          services: "Services",
          project: "Performance",
          news: "News",
          contact: "Contact",
          menu:"Munu",
          home_page:"Home page",
          Name_Company:"Forward Vision Consultant Co.,Ltd",
          hero_Our_services:"Our services can be start with design services and proceed with the construction permit in the Industrial Estate (IEAT) and has established a management strategy to reduce costs and increase efficiency as an important policy. We has skilled engineers and continuous staff development. We have received the certification standard ISO9001:2015",
          See_the_work:"See the work",
          experience:"Over 10 years of experience",
          experience_services:"Civil construction work, installation of electrical systems, telecommunication systems, air conditioning systems, sanitation systems, and fire protection systems according to industry standards.",
          about_build:"Founded by a team of expert engineers, providing engineering services.",
          vision_and_mission:"See vision and mission",
          vision:"Vision",
          vision_text:"Forward Vision Consultant are an efficient electrical, mechanical and construction service provider for the ultimate customer satisfaction.",
          Group_companies:"Group Companies",
          FVC:"FORWARD VISION CONSULTANT CO.,LTD are be Design & Consultant.",
          TTR:"THAI THARIT CO.,LTD are be Engineering & Contractor.",
          Explore_all:"Explore all services",
          services_text:"Design, supply, install, test, commission and maintain systems.",
          all:"See All",
          civil_details:"Providing high-quality civil construction services that are safe and meet all expectations.",
          EE_details:"Providing services in HV/LV electrical systems, including control systems, electrical systems, and communication systems, etc.",
          Me_details:"Providing mechanical services covering piping installation, machinery installation and foundation stabilization, and air compressed systems, etc.",
          project_title:"Examples of outstanding project work from all our projects",
          install_Tr_MDB:"Install the transformer and MDB cabinet.",
          customer:"Customers who trust us",
          FVC_title:"Construction project contractor",
          Contact_us:"Contact us",
        },
        zh: {
          lang_btn: "语言",
          about: "关于我们",
          services: "服务",
          project: "项目",
          news: "新闻",
          contact: "联系我们"
        }
      };
      const currentLangEl = document.getElementById("currentLang");
      const currentFlagEl = document.getElementById("currentFlag");
      const menuLinks     = document.querySelectorAll(".lang__menu a");
      const langBtn       = document.getElementById("langBtn");
      function applyI18n(lang){
        const dict = i18n[lang] || i18n[DEFAULT_LANG];
        document.querySelectorAll("[data-i18n]").forEach(el=>{
          if (el === langBtn) return; // ปุ่มหลักดูแลข้อความเอง
          const key = el.getAttribute("data-i18n");
          if (dict[key]) el.textContent = dict[key];
        });
      }
      function setLangAttr(lang){
        document.documentElement.setAttribute("lang", lang);
      }
      function applyLanguage(lang){
        const safe = langNames[lang] ? lang : DEFAULT_LANG;
        currentLangEl.textContent = langNames[safe];
        currentFlagEl.src = langFlags[safe];
        const label = (i18n[safe] && i18n[safe].lang_btn) || i18n[DEFAULT_LANG].lang_btn;
        langBtn.setAttribute("data-i18n","lang_btn");
        langBtn.setAttribute("aria-label", label);
        applyI18n(safe);
        setLangAttr(safe);
        try { localStorage.setItem(STORAGE_KEY, safe); } catch(e){}

        window.dispatchEvent(new CustomEvent("language-change", { detail: { lang: safe }}));
      }
      document.addEventListener("DOMContentLoaded", ()=>{
        const paramLang = new URLSearchParams(location.search).get("lang"); 
        let saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch(e){}
        applyLanguage(paramLang || saved || DEFAULT_LANG);
      });
      menuLinks.forEach(a=>{
        a.addEventListener("click",(e)=>{
          e.preventDefault();
          const lang = a.getAttribute("data-lang");
          applyLanguage(lang);
        });
      });
    })();
    //<!-- ===== สไลด์รูปภาพ ===== -->
    {const slides = document.getElementById('slides');
    const total = slides.children.length;
    const dotsWrap = document.getElementById('dots');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    let i = 0, timer = 0;
    //<!-- ===== สร้าง dot ตามจำนวนภาพ ===== -->
    for(let k=0;k<total;k++){
      const d=document.createElement('button');
      d.className='dot';
      d.setAttribute('role','tab');
      d.setAttribute('aria-label','ไปยังสไลด์ที่ '+(k+1));
      d.addEventListener('click',()=>go(k,true));
      dotsWrap.appendChild(d);
    }
    function render(){
      slides.style.transform = `translateX(-${i*100}%)`;
      [...dotsWrap.children].forEach((el,idx)=>el.classList.toggle('active', idx===i));
    }
    function go(idx,manual=false){ i=(idx+total)%total; render(); if(manual) restart(); }
    function next(){ go(i+1); }
    function prev(){ go(i-1); }
    prevBtn.addEventListener('click',()=>go(i-1,true));
    nextBtn.addEventListener('click',()=>go(i+1,true));
    function start(){ timer=setInterval(next,5000); }
    function stop(){ clearInterval(timer); }
    function restart(){ stop(); start(); }
    document.querySelector('.hero').addEventListener('mouseenter',stop);
    document.querySelector('.hero').addEventListener('mouseleave',start);
    render();
    start();
    }




