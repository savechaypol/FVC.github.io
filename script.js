    //<!-- ===== ปี ===== -->
    document.getElementById('y').textContent = new Date().getFullYear();

    //<!-- ===== แผงเมนูเลื่อนออกมาทางขวา ===== -->
    const drawer = document.getElementById('drawer');
    const openBtn = document.getElementById('openMenu');
    const closeBtn = document.getElementById('closeMenu');
    function toggleMenu(force){
    const open = (typeof force === 'boolean') ? force : !drawer.classList.contains('is-open');
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    if(open) document.body.style.overflow='hidden'; else document.body.style.overflow='';
    }
    openBtn.addEventListener('click', () => toggleMenu(true));
    closeBtn.addEventListener('click', () => toggleMenu(false));
    drawer.addEventListener('click', (e)=>{ if(e.target===drawer) toggleMenu(false) });
    drawer.addEventListener('touchmove', (e) => {
      if (!e.target.closest('.drawer__panel')) e.preventDefault();
      }, { passive:false });

    //<!-- ===== เลื่อยโลโก้เลื่อยๆ ===== -->
    function setupLogoTicker(root){
    const track = root.querySelector('#track');
    const viewport = root.querySelector('.ticker__viewport');
    const speed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--speed')) || 100;
    const minWidth = viewport.clientWidth * 2;
    let totalWidth = track.scrollWidth;
    while (totalWidth < minWidth) {
      [...track.children].forEach(node => track.appendChild(node.cloneNode(true)));
      totalWidth = track.scrollWidth;
    }
    const shift = -Math.floor(totalWidth / 2);
    const duration = Math.abs(shift) / speed;
    track.style.setProperty('--to', shift + 'px');
    track.style.setProperty('--duration', duration + 's');
    track.classList.add('anim');
    }
    setupLogoTicker(document.getElementById('ticker'));
    
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
