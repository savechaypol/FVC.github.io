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
      };
      const langFlags = {
        th: "https://flagcdn.com/w20/th.png",
        en: "https://flagcdn.com/w20/gb.png",
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

    // ======= ภาษา =======
    const i18n = {
        th: {//index
          about: "เกี่ยวกับเรา",
          services: "บริการ",
          Our_services: "บริการของเรา",
          performance:"ผลงาน",
          news: "ข่าวสาร",
          contact: "ติดต่อเรา",
          menu:"เมนู",
          home_page:"หน้าแรก",
          Name_Company:"บริษัท ฟอร์เวิร์ด วิชั่น คอนซัลแทนท์ จำกัด",
          hero_Our_services:"บริการของเราเริ่มต้นตั้งแต่การออกแบบไปจนถึงการขอใบอนุญาตก่อสร้างในนิคมอุตสาหกรรม (กนอ.) และได้กำหนดกลยุทธ์การบริหารจัดการเพื่อลดต้นทุนและเพิ่มประสิทธิภาพ ซึ่งเป็นนโยบายสำคัญ เรามีวิศวกรผู้เชี่ยวชาญและการพัฒนาบุคลากรอย่างต่อเนื่อง เราได้รับมาตรฐาน ISO9001:2015",
          See_the_work:"ดูผลงาน",
          experience_10:"ประสบการณ์กว่า 10 ปี",
          experience_services:"งานก่อสร้างโยธา งานติดตั้งระบบไฟฟ้า ระบบสื่อสารโทรคมนาคม ระบบปรับอากาศ ระบบสุขาภิบาล และระบบป้องกันอัคคีภัย ตามมาตรฐานอุตสาหกรรม",
          about_build:"ก่อตั้งโดยทีมวิศวกรผู้เชี่ยวชาญ ให้บริการงานวิศวกรรม",
          vision_and_mission:"ดูวิสัยทัศน์และพันธกิจ",
          vision:"วิสัยทัศน์",
          vision_text:"Forward Vision Consultant คือผู้ให้บริการด้านไฟฟ้า เครื่องกล และก่อสร้างที่มีประสิทธิภาพ เพื่อความพึงพอใจสูงสุดของลูกค้า",
          mission:"พันธกิจ",
          mission_text:"บริษัท ฟอร์เวิร์ด วิชั่น คอนซัลแทนท์ ให้บริการด้านวิศวกรรมด้วยเทคโนโลยีที่ทันสมัยและคุณภาพที่ได้มาตรฐานสากล",
          experience:"ประสบการณ์",
          year:"10+ ปี",
          Group_companies:"กลุ่มบริษัท",
          FVC:"FORWARD VISION CONSULTANT CO.,LTD บริษัทออกแบบและที่ปรึกษา",
          TTR:"THAI THARIT CO.,LTD บริษัท วิศวกรรมและรับเหมาก่อสร้าง",
          Explore_all:"สำรวจบริการทั้งหมด",
          services_text:"ออกแบบ จัดหา ติดตั้ง ทดสอบ เดินระบบ และบำรุงรักษา",
          all:"ดูทั้งหมด",
          civil_details:"ให้บริการงานก่อสร้างโยธาอย่างมีคุณภาพสูง มีความปลอดภัยและตรงตามความคาดหวังทุกประการ",
          EE_details:"ให้บริการด้านระบบไฟฟ้า HV/LV รวมถึงระบบควบคุม ระบบไฟฟ้าและระบบสื่อสาร ฯลฯ",
          Me_details:"ให้บริการงานเครื่องกลครอบคลุมการติดตั้งระบบท่อ การติดตั้งเครื่องจักรและปรับฐานรากให้มั่นคง และระบบ Air Compressed ฯลฯ",
          project_title:"ตัวอย่างผลงานโครงการเด่นจากโครงกการทั้งหมดของเรา",
          customer:"ลูกค้าที่ไว้วางใจเรา",
          FVC_title:"ผู้รับเหมางานโครงการก่อสร้าง",
          Contact_us:"ติดต่อเรา",
          //Project
          project:"โครงการ",
          subtitle_title:"รวมโครงการของ FVC ครอบคลุมงานโยธา ระบบไฟฟ้า เครื่องกล และงานอื่นๆ",
          Other_work:"งานอื่นๆ",
          Samut_Sakhon:"สมุทรสาคร",
          Bangkok:"กรุงเทพฯ",
          Chachoengsao:"ฉะเชิงเทรา",
          Ratchaburi:"ราชบุรี",
          install_Tr_MDB:"ติดตั้งหม้อแปลงและตู้ MDB",
          ins_ap:"งารติดตั้ง Accesport",
          office_training:"ออกแบบและสร้าง – สำนักงานและศูนย์ฝึกอบรม",
          making_machine_floors:"ทำพื้นเครื่องจักร โรงไฟฟ้า",
          //News
          white_plant:" โรงงานสีขาว ระดับที่ 3",
          Quality:"ระบบคุณภาพ",
          Certificate_details:"รายละเอียดใบรับรอง",
          address:"ที่อยู่ : ",
          standard:"มาตรฐาน : ",
          Certification_body:"หน่วยรับรอง :",
          details_white_plant:"กรมสวัสดิการและคุ้มครองแรงงาน (กระทรวงแรงงาน) มอบเกียรติบัตรรับรองว่า FVC มีระบบการจัดการด้านยาเสพติดในสถานประกอบกิจการที่มีประสิทธิภาพ ครอบคลุมการป้องกัน–เฝ้าระวัง–แก้ไข และการดูแลพนักงานตามระเบียบกฎหมาย โดยได้รับมอบเมื่อวันที่ 30 กันยายน 2567 สะท้อนความมุ่งมั่นในการสร้างสถานประกอบการปลอดยาเสพติดและสภาพแวดล้อมการทำงานที่ปลอดภัยอย่างยั่งยืน",
          Click_Details:"คลิกที่รูปเพื่อขยายดูรายละเอียด",
          back:"⬅ กลับ",
          //contact
          contact_title:"ขอใบเสนอราคา นัดสำรวจหน้างาน หรือสอบถามข้อมูล",
          phone:"โทร : ",
          email:"อีเมล : ",
          time:"เวลาทำการ : ",
          address_real:" 104 หมู่บ้านไอดี-ไซน์ 21 ถนน เลียบคลองสอง แขวงบางชัน เขตคลองสามวา กรุงเทพมหานคร 10510",
          day:"จันทร์–ศุกร์ 08:30–17:30",
          //About
          FVC_grup_title:"FVC GROUP ดำเนินธุรกิจหลัก 3 ด้าน: วิศวกรรมไฟฟ้า วิศวกรรมเครื่องกล และวิศวกรรมก่อสร้าง ด้วยประสบการณ์มากกว่า 10 ปี ทั้งภาครัฐและเอกชน พร้อมมาตรฐาน ISO 9001:2015",
          highlights:"จุดเด่น",
          highlights_1:"ให้บริการครบวงจร ตั้งแต่ออกแบบ ขออนุญาต (IEAT) ถึงก่อสร้างและส่งมอบ",
          highlights_2:"บริหารโครงการเพื่อ ลดต้นทุนและพิ่มประสิทธิภาพ",
          highlights_3:"ทีมวิศวกรผู้เชี่ยวชาญ พัฒนาทักษะอย่างต่อเนื่อง",
          FVC_text:"ผู้เชี่ยวชาญด้าน การออกแบบและที่ปรึกษา",
          TTR_text:"ผู้เชี่ยวชาญด้านวิศวกรรมและงานรับเหมาก่อสร้าง",
          company_information:"ข้อมูลบริษัท",
          company_name:"ชื่อบริษัท : ",
          legal_entity_number:"เลขทะเบียนนิติบุคคล : ",
          registered_capital:"ทุนจดทะเบียน : ",
          founding_day:"วันที่ก่อนตั้ง : ",
          website:"เว็บไซต์ : ",
          license_standard:"ใบอนุญาต / มาตรฐาน",
          standard_text:"ระบบบริหารคุณภาพ ISO 9001:2015",
          safety:"ความปลอดภัย : ",
          safety_text:"อบรม safety, Work Permit/JSR ตามระเบียบโรงงาน",
          //service_civil
          civil_work:"งานก่อสร้างโยธา",
          civil_work_text:"บริษัทให้บริการงานก่อสร้างโยธา สามารถทำให้ลูกค้าของบริษัทมั่นใจได้ว่างานที่บริษัททำเป็นงานที่มีคุณภาพสูง มีความปลอดภัยและตรงตามความคาดหวังของลูกค้าทุกประการ",
          civil_1:"ก่อสร้างโครงสร้างพื้นฐาน",
          civil_2:"ก่อสร้างถนน",
          civil_3:"งานรั้วและโครงเหล็ก",
          civil_4:"งานฐานเครื่องจักร ฐานหม้อแปลง",
          civil_5:"ต่อเติม ปรับปรุงอาคารและคลังสินค้า",
          civil_6:"งานพื้นคอนกรีต พื้นอีพ็อกซี่",
          civil_7:"งานภูมิทัศน์และงานทางเดิน",
          civil_8:"งานระบบระบายน้ำและงานท่อ",
          //service_electrical
          electrical_work:"งานระบบไฟฟ้า",
          electrical_work_text:"บริษัทให้บริการด้านระบบไฟฟ้าอย่างครบวงจร ซึ่งรวมถึงการ ก่อสร้างและติดตั้งอุปกรณ์ต่าง ๆ ระบบควบคุม ระบบไฟฟ้าและระบบสื่อสาร โดยบริการของบริษัทครอบคลุมงานระบบ ต่างๆ ดังนี้",
          electrical_1:"ไฟฟ้าแรงดันสูง/ไฟฟ้าแรงดังต่ำ",
          electrical_2:"ระบบการจ่ายกระแสไฟฟ้า",
          electrical_3:"PM ระบบไฟฟ้า",
          electrical_4:"ระบบไฟฟ้าส่องสว่าง",
          electrical_5:"ระบบควบคุมแสงไฟส่องสว่างอัตโนมัติ",
          electrical_6:"ระบบป้องกันฟ้าผ่า",
          electrical_7:"ระบบการต่อลงดิน",
          electrical_8:"ระบบพลังงานแสงอาทิตย์",
          //service_mechanical
          mechanical_work:"งานเครื่องกล",
          mechanical_work_text:"บริษัทให้บริการด้านระบบเครื่องกล ซึ่งรวมถึงการก่อสร้างและติดตั้งอุปกรณ์ต่าง ๆ ระบบท่อส่งน้ำและก๊าซ ระบบปรับอากาศและระบายอากาศ (HVAC) ระบบเครื่องจักรกลอุตสาหกรรม และระบบอัดอากาศ ครอบคลุมงานระบบต่างๆ ดังนี้",
          mechanical_1:"ระบบท่อ",
          mechanical_2:"ติดตั้งเครื่องจักร",
          mechanical_3:"ระบบปรับอากาศและระบายอากาศ (HVAC)",
          mechanical_4:"ระบบประปา",
          mechanical_5:"ระบบป้องกันอัคคีภัย",
          mechanical_6:"ระบบบำบัดน้ำเสียและอากาศเสีย",
          mechanical_7:"ระบบน้ำหล่อเย็น",
        },
        en: {//service_mechanical
          mechanical_work:"Mechanical work",
          mechanical_work_text:"The company provides mechanical system services, including construction and installation of various equipment, water and gas piping systems, air conditioning and ventilation (HVAC) systems, industrial machinery systems, and compressed air systems, covering the following systems:",
          mechanical_1:"Pipe system",
          mechanical_2:"Install machinery",
          mechanical_3:"Air conditioning and ventilation systems (HVAC)",
          mechanical_4:"Plumbing system",
          mechanical_5:"Fire protection system",
          mechanical_6:"Wastewater and air pollution treatment systems",
          mechanical_7:"Cooling water system",
          //service_electrical
          electrical_work:"Electrical system work",
          electrical_work_text:"บริษัทให้บริการด้านระบบไฟฟ้าอย่างครบวงจร ซึ่งรวมถึงการ ก่อสร้างและติดตั้งอุปกรณ์ต่าง ๆ ระบบควบคุม ระบบไฟฟ้าและระบบสื่อสาร โดยบริการของบริษัทครอบคลุมงานระบบ ต่างๆ ดังนี้",
          electrical_1:"High voltage/low voltage",
          electrical_2:"Electrical distribution system",
          electrical_3:"PM electrical system",
          electrical_4:"ระบบไฟฟ้าส่องสว่าง",
          electrical_5:"Electrical lighting system",
          electrical_6:"Lightning protection system",
          electrical_7:"Grounding system",
          electrical_8:"Solar power system",
          //service_civil
          civil_1:"Infrastructure construction",
          civil_2:"Road construction",
          civil_3:"Fence and steel frame work",
          civil_4:"Machine base work, transformer base",
          civil_5:"Additions and improvements to buildings and warehouses",
          civil_6:"Concrete floor work, epoxy floor",
          civil_7:"Landscaping and walkway work",
          civil_8:"Drainage and pipe work",
          civil_work:"Civil construction work",
          civil_work_text:"Civil construction services companies can assure their clients that the work they undertake is of high quality, safe, and meets all customer expectations.",
          //About
          safety_text:"Safety training, Work Permit/JSR according to factory regulations",
          standard_text:"Quality management system ISO 9001:2015",
          safety:"Safety : ",
          founding_day:"Founding Day : ",
          website:"Website : ",
          registered_capital:"Registered capital : ",
          legal_entity_number:"Legal entity registration number  : ",
          company_name:"Company Name : ",
          company_information:"Company Information",
          FVC_text:"Design and consulting experts",
          TTR_text:"Engineering and construction contracting experts",
          highlights:"Highlights",
          highlights_1:"Providing a full range of services, from design, permit application (IEAT) to construction and delivery.",
          highlights_2:"Manage projects to reduce costs and increase efficiency.",
          highlights_3:"A team of expert engineers continuously develop their skills.",
          FVC_grup_title:"FVC GROUP operates in three main areas: electrical engineering, mechanical engineering, and construction engineering. With over 10 years of experience in both the public and private sectors, FVC Group is certified with ISO 9001:2015 standards.",
          //contact
          address_real:" 104/21 Liapklongsong Road, Bangchan, Klongsamwa, Bangkok 10510 Thailand",
          time:"Business hours : ",
          email:"Email : ",
          phone:"Phone : ",
          contact_title:"Request a quote, schedule a site survey, or inquire about information.",
          back:"⬅ Back",
          day:"Monday–Friday 8:30 AM–5:30 PM",
          //News
          white_plant:" White Factory Level 3",
          Quality:"Quality system ",
          Certificate_details:"Certificate details",
          address:"Address : ",
          standard:"Standard : ",
          Certification_body:"Certification_body :",
          details_white_plant:"The Department of Labor Protection and Welfare (Ministry of Labor) awarded a certificate of recognition to FVC for its effective workplace drug management system, covering prevention, surveillance, correction, and employee care in accordance with legal regulations. The award, received on September 30, 2024, reflects the company's commitment to creating a drug-free workplace and a sustainable safe working environment.",
          Click_Details:"Click on the image to enlarge and view details.",
          //Project
          project:"Project",
          subtitle_title:"FVC projects cover civil, electrical, mechanical and other works.",
          Other_work:"Other work",
          Samut_Sakhon:"Samut Sakhon",
          Bangkok:"Bangkok",
          Chachoengsao:"Chachoengsao",
          Ratchaburi:"Ratchaburi",
          install_Tr_MDB:"Install the transformer and MDB",
          office_training:"Design & Build – Office & Training Center",
          ins_ap:"Accesport installation work",
          making_machine_floors:"Make floors for machinery and power plants",
          //index
          about: "About us",
          services: "Services",
          Our_services: "Our Services",
          performance: "Performance",
          news: "News",
          contact: "Contact",
          menu:"Munu",
          home_page:"Home page",
          Name_Company:"Forward Vision Consultant Co.,Ltd",
          hero_Our_services:"Our services can be start with design services and proceed with the construction permit in the Industrial Estate (IEAT) and has established a management strategy to reduce costs and increase efficiency as an important policy. We has skilled engineers and continuous staff development. We have received the certification standard ISO9001:2015",
          See_the_work:"See the work",
          experience_10:"Over 10 years of experience",
          experience_services:"Civil construction work, installation of electrical systems, telecommunication systems, air conditioning systems, sanitation systems, and fire protection systems according to industry standards.",
          about_build:"Founded by a team of expert engineers, providing engineering services.",
          vision_and_mission:"See vision and mission",
          vision:"Vision",
          vision_text:"Forward Vision Consultant are an efficient electrical, mechanical and construction service provider for the ultimate customer satisfaction.",
          mission:"Mission",
          mission_text:"Forward Vision Consultants Co., Ltd. provides engineering services with modern technology and quality that meets international standards.",
          experience:"Experience",
          year:"10+ Year",
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
          customer:"Customers who trust us",
          FVC_title:"Construction project contractor",
          Contact_us:"Contact us",
        },
      };

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
    document.querySelector('.hero_').addEventListener('mouseenter',stop);
    document.querySelector('.hero_').addEventListener('mouseleave',start);
    render();
    start();
    }

    //<!-- ===== สไลด์รูปภาพ + เลือกรูปภาพ ===== -->
    {const main = document.getElementById('main');
    const thumbs = Array.from(document.querySelectorAll('.thumb'));
    const dotsWrap = document.getElementById('dots');
    let idx = 0, timer;
    const INTERVAL = 4000;
    function buildDots(){
      dotsWrap.innerHTML='';
      thumbs.forEach((_,i)=>{
        const d=document.createElement('div');
        d.className='dot'+(i===idx?' active':'');
        d.addEventListener('click',()=>go(i,true));
        dotsWrap.appendChild(d);
      });
    }
    function setActive(i){
      thumbs.forEach((b,j)=>b.classList.toggle('active', j===i));
      [...dotsWrap.children].forEach((d,j)=>d.classList.toggle('active', j===i));
    }
    function show(i){
      idx=(i+thumbs.length)%thumbs.length;
      const url=thumbs[idx].dataset.src;
      main.style.opacity=0;
      const img=new Image();
      img.onload=()=>{main.src=url;main.style.opacity=1;setActive(idx);};
      img.src=url;
    }
    function go(i,manual=false){show(i);if(manual) restart();}
    function next(){go(idx+1);}
    function start(){if(!timer) timer=setInterval(next,INTERVAL);}
    function stop(){clearInterval(timer);timer=null;}
    function restart(){stop();start();}
    thumbs.forEach((btn,i)=>btn.addEventListener('click',()=>go(i,true)));
    buildDots();
    show(0);
    start();
    }




