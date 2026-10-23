/* Buildless, dependency-free portfolio interactions. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = selector => document.querySelector(selector);
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  };
  const fallbackImage='images/Project Preview_ Modern Software Showcase.png';
  function safeUrl(value) {
    if (!value) return '';
    try { const url=new URL(value,document.baseURI); return ['http:','https:','mailto:','tel:'].includes(url.protocol) ? value : ''; } catch { return ''; }
  }
  function anchor(label,url,className='') {
    const a=el('a',className,label);a.href=safeUrl(url);
    if(/^https?:/i.test(url || '')) { a.target='_blank';a.rel='noopener noreferrer'; }
    return a;
  }
  const list=value=>Array.isArray(value) ? value : value ? [value] : [];
  function pills(values) {
    const wrap=el('div','pill-wrap');
    list(values).forEach(value=>wrap.append(el('span','pill',typeof value==='string' ? value : value.name)));
    return wrap;
  }
  function fill(selector,...children) {
    const target=$(selector);target.replaceChildren(...children);target.removeAttribute('aria-busy');
  }
  function renderProfile(p) {
    const heading=el('h1',"","");heading.append(el('span','hero-greeting',"Hi, I'm"));heading.append(el('span','gradient-text',p.name));
    const actions=el('div','hero-actions');actions.append(anchor('View My Projects','#projects','btn btn-primary'));
    if(p.resumeUrl) {
      const resume=anchor('Download CV',p.resumeUrl,'btn btn-secondary btn-cv');
      if(new URL(p.resumeUrl,document.baseURI).origin===location.origin)resume.download='Thiran_Naleendra_CV.pdf';
      actions.append(resume);
    }
    actions.append(anchor('Contact Me','#contact','btn btn-secondary'));
    if(p.github) actions.append(anchor('GitHub',p.github,'btn btn-secondary'));
    fill('#hero-content',el('div','badge',p.availability),heading,el('p','hero-role',p.jobTitle),el('p','hero-tagline',p.tagline),el('p','',p.summary),actions);
    const ring=el('div','profile-ring'),img=el('img');img.src=safeUrl(p.image || 'images/t2.jpg');img.alt=`Portrait of ${p.name}`;img.width=132;img.height=132;img.fetchPriority='high';ring.append(img);
    const meta=el('ul','meta-list');
    const fields=[['email',p.email,p.email ? `mailto:${p.email}` : ''],['phone',p.phone,p.phone ? `tel:${p.phone.replace(/[^+0-9]/g,'')}` : ''],['location',p.location,''],['linkedin','LinkedIn Profile',p.linkedin],['github',p.github?.replace(/^https?:\/\//,''),p.github]];
    fields.forEach(([icon,label,url])=>{
      if(!label)return;
      const li=el('li','meta-item'),badge=el('span','meta-icon'),img=el('img');
      badge.setAttribute('aria-hidden','true');
      img.src=`images/icons/${icon}.svg`;img.alt='';img.width=18;img.height=18;
      badge.append(img);li.append(badge,url ? anchor(label,url) : el('span','',label));meta.append(li);
    });
    fill('#profile-content',ring,el('h2','',p.name),el('div','role',p.jobTitle),meta);
    const summary=el('div','card reveal');summary.append(el('h3','','Professional Summary'),...list(p.about).map(text=>el('p','',text)),pills(p.aboutBadges));
    summary.classList.add('about-summary');
    summary.querySelector('.pill-wrap').style.marginTop='18px';
    const expertise=el('div','card reveal');expertise.append(el('h3','','Domain Expertise'),el('p','',p.expertiseSummary),pills(p.expertise));expertise.classList.add('about-expertise');expertise.querySelector('.pill-wrap').classList.add('expertise-list');expertise.querySelector('.pill-wrap').style.marginTop='18px';fill('#about-content',summary,expertise);
    const contacts=el('div','contact-list');
    [['Email',p.email,p.email ? `mailto:${p.email}` : ''],['Phone',p.phone,p.phone ? `tel:${p.phone.replace(/[^+0-9]/g,'')}` : ''],['LinkedIn',p.linkedin?.split('/').filter(Boolean).pop(),p.linkedin],['GitHub',p.github?.split('/').filter(Boolean).pop(),p.github]].forEach(([label,value,url])=>{if(!value || !url)return;const item=el('div','line-item'),span=el('span');span.append(anchor(value,url));item.append(el('strong','',label),span);contacts.append(item);});
    const intro=el('p','',p.contactIntro || 'Have a project in mind?');
    const contactActions=el('div','contact-actions');
    if(p.email)contactActions.append(anchor('Email Me',`mailto:${p.email}`,'btn btn-primary'));
    if(p.linkedin)contactActions.append(anchor('LinkedIn',p.linkedin,'btn btn-secondary'));
    if(p.github)contactActions.append(anchor('GitHub',p.github,'btn btn-secondary'));
    fill('#contact-content',el('h3','','Contact Information'),intro,el('p','',p.location),contactActions,contacts);
    const interests=el('h3','','Interests');interests.style.marginTop='24px';fill('#strengths-content',el('h3','','Strengths'),pills(p.strengths),interests,pills(p.interests));
    const footer=el('div','container'),footerLinks=el('div','footer-links');footerLinks.append(anchor('Home','#home'),anchor('Projects','#projects'));
    [['LinkedIn',p.linkedin],['GitHub',p.github],['Email',p.email ? `mailto:${p.email}` : '']].forEach(([label,url])=>{if(url)footerLinks.append(anchor(label,url));});
    footer.append(el('strong','',p.name),el('p','',p.jobTitle),footerLinks,el('p','',`\u00a9 ${new Date().getFullYear()} ${p.name}`));fill('#footer-content',footer);
    document.querySelector('.brand').replaceChildren(document.createTextNode(p.name.split(' ')[0]),el('span','','.'));
    const hire=$('.nav-cta');hire.hidden=!p.email;if(p.email)hire.href=safeUrl(`mailto:${p.email}`);
  }

  function dateLabel(value) {
    if(!value)return '';
    const [year,month,day=1]=value.split('-').map(Number);
    return new Intl.DateTimeFormat('en',{month:'short',year:'numeric'}).format(new Date(year,month-1,day));
  }
  function updateExperienceCount(data,today=new Date()) {
    const starts=data.map(role=>{
      if(!/^\d{4}-\d{2}(-\d{2})?$/.test(role.startDate || ''))return null;
      const [year,month,day=1]=role.startDate.split('-').map(Number);
      const date=new Date(year,month-1,day);
      return date.getFullYear()===year && date.getMonth()===month-1 && date.getDate()===day && date<=today ? date : null;
    }).filter(Boolean);
    const counter=$('#experience-count');
    if(!starts.length) { counter.textContent='0y 0m';counter.removeAttribute('title');return; }
    const start=new Date(Math.min(...starts.map(date=>date.getTime())));
    const months=Math.max(0,(today.getFullYear()-start.getFullYear())*12+today.getMonth()-start.getMonth()-(today.getDate()<start.getDate() ? 1 : 0));
    counter.textContent=`${Math.floor(months/12)}y ${months%12}m`;
    counter.title=`Experience since ${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}, measured in completed years and months`;
  }
  function renderExperience(data) {
    updateExperienceCount(data);
    const sorted=[...data].sort((a,b)=>b.startDate.localeCompare(a.startDate));
    const groups=new Map();sorted.forEach(role=>{const key=role.employmentType || 'Experience';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(role);});
    const cards=[];
    const groupPriority=type=>type==='Full-Time' ? 0 : type==='Freelance' ? 1 : 2;
    [...groups].sort(([a],[b])=>groupPriority(a)-groupPriority(b)).forEach(([type,roles])=>{
      const card=el('div','card reveal'),timeline=el('div','timeline');card.append(el('h3','exp-title',type),timeline);
      roles.forEach(role=>{const item=el('div','timeline-item');item.append(el('span','date',`${dateLabel(role.startDate)} - ${role.current ? 'Present' : dateLabel(role.endDate)}`),el('h4','',role.position),el('div','company',role.company));const ul=el('ul','responsibilities');
      const points=list(role.description);points.slice(0,3).forEach(text=>ul.append(el('li','',text)));item.append(ul);
      if(points.length>3) {
        const details=el('details','experience-more'),summary=el('summary','','Show More'),extra=el('ul','responsibilities');
        points.slice(3).forEach(text=>extra.append(el('li','',text)));details.append(summary,extra);
        details.addEventListener('toggle',()=>{summary.textContent=details.open ? 'Show Less' : 'Show More';});item.append(details);
      }
if(role.technologies?.length)item.append(pills(role.technologies));timeline.append(item);});cards.push(card);
    });fill('#experience-content',...cards);
  }
  function renderSkills(data) {
    fill('#skills-content',...data.map(group=>{
      const card=el('div','card skill-category'),skills=el('div','skill-items');
      list(group.skills).forEach(skill=>{
        const name=typeof skill==='string' ? skill : skill.name;
        const item=el('div','skill-item');
        if(skill.icon) {
          const img=el('img','skill-icon');img.src=safeUrl(skill.icon);img.alt='';img.width=24;img.height=24;img.loading='lazy';
          img.addEventListener('error',()=>img.remove(),{once:true});item.append(img);
        } else {const mark=el('span','skill-initial',name?.slice(0,2));mark.setAttribute('aria-hidden','true');item.append(mark);}
        item.append(el('span','',name));skills.append(item);
      });card.append(el('h3','',group.category),skills);return card;
    }));
  }
  function renderEducation(data) {
    fill('#education-content',...data.map(item=>{const node=el('div','timeline-item');node.append(el('span','date',item.date),el('h4','',item.title),el('div','company',item.institution));if(item.url)node.append(anchor('View qualification',item.url));return node;}));
  }
  function renderCertifications(data) {
    fill('#certifications-content',...data.map(item=>{
      const node=el('div','line-item');
      node.append(el('strong','',item.title),el('span','',`${item.provider} \u2022 ${item.date}`));
      if(item.certificate_id != null && String(item.certificate_id).trim()) {
        const identifier=el('div','certificate-id','Certificate ID: ');
        identifier.append(el('code','',String(item.certificate_id).trim()));
        node.append(identifier);
      }
      if(item.url && safeUrl(item.url))node.append(anchor('View Certificate',item.url,'btn btn-secondary'));
      return node;
    }));
    $('#certification-count').textContent=data.length;
  }
  function renderCompanyProjects(data) {
    const seen=new Set();
    const projects=data.filter(project=>{
      const key=project.id || project.title?.trim().toLowerCase();
      if(!key || seen.has(key))return false;seen.add(key);return true;
    }).sort((a,b)=>(a.order ?? 0)-(b.order ?? 0));
    const cards=projects.map(project=>{
      const card=el('article','card project-card');
      const image=el('img','project-image');image.src=safeUrl(project.image || fallbackImage);
      image.alt=project.imageAlt || (project.image ? `${project.title} screenshot` : 'Project preview illustration');
      image.width=640;image.height=400;image.loading='lazy';
      if(project.imageFit==='contain')image.classList.add('project-image-contain');
      image.addEventListener('error',()=>{image.src=fallbackImage;image.alt='Project preview illustration';},{once:true});
      card.append(image);
      const labels=el('div','project-labels');
      if(project.company)labels.append(el('span','',project.company));
      if(project.status)labels.append(el('span','status',project.status));
      card.append(labels,el('h3','',project.title));
      if(project.date)card.append(el('span','project-meta',project.date));
      if(project.role)card.append(el('span','project-meta',project.role));
      if(project.description)card.append(el('p','',project.description));
      if(project.contribution) {
        const details=el('details','experience-more');details.append(el('summary','','My contribution'));
        const points=el('ul','responsibilities');list(project.contribution).forEach(text=>points.append(el('li','',text)));details.append(points);card.append(details);
      }
      if(project.technologies?.length)card.append(pills(project.technologies));
      const links=el('div','project-links');
      if(project.liveUrl && safeUrl(project.liveUrl))links.append(external('View Website',project.liveUrl));
      if(project.githubUrl && !project.githubPrivate && safeUrl(project.githubUrl))links.append(external('GitHub',project.githubUrl));
      if(links.childElementCount)card.append(links);
      return card;
    });
    if(!cards.length)cards.push(el('p','content-status','Company project details will be added soon.'));
    fill('#company-project-gallery',...cards);
  }
  async function loadContent(name,render,selector) {
    const target=$(selector);target.setAttribute('aria-busy','true');
    try {
      const response=await fetch(`./data/${name}.json`);
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const data=await response.json();
      if(name!=='profile' && !Array.isArray(data))throw new Error('Expected an array');
      if(name==='profile' && (!data || typeof data.name!=='string'))throw new Error('Expected a profile');
      render(data);target.removeAttribute('aria-busy');
    } catch(error) {
      target.removeAttribute('aria-busy');
      if(name==='profile') ['#profile-content','#about-content','#contact-content','#strengths-content','#footer-content'].forEach(selector=>fill(selector,el('p','content-status','Profile content unavailable. Use Retry in the introduction.')));
      const message=el('p','content-status',`Unable to load ${name}. Please try again.`),retry=el('button','btn btn-secondary','Retry');retry.type='button';
      retry.addEventListener('click',()=>{retry.disabled=true;loadContent(name,render,selector);});target.replaceChildren(message,retry);
    }
  }
  const external = (label,url) => {
    const a = el('a','btn btn-secondary',label);
    a.href=safeUrl(url); a.target='_blank'; a.rel='noopener noreferrer';
    return a;
  };
  function renderProjects(data) {
  const seen=new Set();
  const projects=data.filter(p=>{const key=p.id || p.title?.trim().toLowerCase();if(!key || seen.has(key))return false;seen.add(key);return true;}).map((p,index)=>({...p,name:p.title || '',shortDescription:p.description || '',fullDescription:p.fullDescription || p.description || '',category:p.category || 'Other Projects',status:p.status || 'Unverified',technologies:p.technologies || [],features:p.features || [],verificationNotes:p.verificationNotes || [],order:p.order ?? index})).sort((a,b)=>a.order-b.order);
  const tags = project => {
    const group = el('div','project-tags');
    project.technologies.forEach(tech => group.append(el('span','tag',tech)));
    return group;
  };
  const media = project => {
    {
      const img=el('img','project-image');
      img.src=safeUrl(project.image || fallbackImage);
      img.addEventListener('error',()=>{if(img.getAttribute('src')!==fallbackImage) {img.src=fallbackImage;img.alt='Project preview illustration';}},{once:true}); img.alt=project.imageAlt || (project.image ? `${project.name} application screenshot` : 'Generic project preview illustration; project screenshot not yet available');
      img.loading='lazy'; img.width=640; img.height=360;
      return img;
    }

  };
  const links = project => {
    const group=el('div','project-links');
    if (project.liveUrl && safeUrl(project.liveUrl)) group.append(external(project.status==='Demo' ? 'View Demo' : 'View Website',project.liveUrl));
    const repositories=project.repositoryLinks?.length ? project.repositoryLinks : project.githubUrl && !project.githubPrivate ? [{label:'GitHub',url:project.githubUrl}] : [];
    repositories.filter(repo=>repo.url && safeUrl(repo.url) && !repo.private && repo.public!==false && !project.githubPrivate).forEach(repo => group.append(external(repo.label || 'GitHub',repo.url)));
    return group;
  };
  const dialog=$('#project-dialog');
  let opener;
  function showDetails(project,button) {
    opener=button;
    const content=$('#dialog-content'); content.replaceChildren();
    const title=el('h2','',project.name); title.id='dialog-title';
    content.append(title,el('p','',`${project.category} \u00b7 ${project.status}`),media(project),el('h3','','Overview'),el('p','',project.fullDescription));
    if (project.date) content.append(el('p','project-meta',project.date));
    if(project.features.length) {
      content.append(el('h3','','Main features'));
      const list=el('ul'); project.features.forEach(feature=>list.append(el('li','',feature))); content.append(list);
    }
    if(project.technologies.length) content.append(el('h3','','Technology stack'),tags(project));
    if(project.contribution) content.append(el('h3','','My contribution'),el('p','',project.contribution));
    if(project.businessProblem) content.append(el('h3','','Business problem'),el('p','',project.businessProblem));
    if(project.verificationNotes.length) content.append(el('h3','','Scope notes'),el('p','verification-note',project.verificationNotes.join(' ')));
    content.append(links(project)); dialog.showModal(); document.body.classList.add('dialog-open');
  }
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{ document.body.classList.remove('dialog-open'); opener?.focus(); });
  dialog.addEventListener('click',event=>{ if(event.target===dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close(); } });
  function card(project) {
    const article=el('article','card project-card');article.dataset.projectId=project.id || project.name;
    article.append(media(project));
    const labels=el('div','project-labels'); labels.append(el('span','',project.category),el('span',`status status-${project.status.toLowerCase().replaceAll(' ','-')}`,project.status));
    article.append(labels,el('h4','',project.name),el('p','',project.shortDescription));
    if(project.date) article.append(el('span','project-meta',project.date));
    article.append(tags(project));
    const actions=links(project); const button=el('button','btn btn-secondary','View Details'); button.type='button'; button.setAttribute('aria-label',`View details for ${project.name}`); button.addEventListener('click',()=>showDetails(project,button)); actions.append(button); article.append(actions);
    return article;
  }
  // Featured projects get their own concise selection; all entries remain available below.
  $('#featured-projects').replaceChildren(...projects.filter(p=>p.featured).slice(0,3).map(card));
  const categories=['All',...new Set(projects.map(p=>p.category))];
  $('.project-filters').replaceChildren();
  let category='All',expanded=false;
  const limit=6;
  function renderGallery() {
    const filtered=projects.filter(p=>category==='All' || p.category===category);
    const visible=expanded ? filtered : filtered.slice(0,limit);
    $('#project-gallery').replaceChildren(...visible.map(card));
    $('#gallery-count').textContent=`Showing ${visible.length} of ${filtered.length} projects${category==='All' ? '' : ` in ${category}`}`;
    $('#project-empty').hidden=filtered.length>0;
    $('#show-more').hidden=filtered.length<=limit;
    $('#show-more').textContent=expanded ? 'Show Less' : 'Show More';
    $('#show-more').setAttribute('aria-expanded',String(expanded));
    document.querySelectorAll('.project-filters button').forEach(button=>button.setAttribute('aria-pressed',String(button.textContent===category)));
  }
  categories.forEach(name=>{
    const button=el('button','',name); button.type='button'; button.setAttribute('aria-controls','project-gallery');
    button.addEventListener('click',()=>{category=name;expanded=false;renderGallery();}); $('.project-filters').append(button);
  });
  $('#show-more').addEventListener('click',()=>{expanded=!expanded;renderGallery();if(!expanded) $('#all-projects-heading').scrollIntoView({block:'start'});});
  renderGallery();
  $('#project-count').textContent=projects.length;
  }

  const toggle=$('.menu-toggle'), navigation=$('#navigation');
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));navigation.classList.toggle('is-open',open);});
  navigation.addEventListener('click',event=>{if(event.target.closest('a')){toggle.setAttribute('aria-expanded','false');navigation.classList.remove('is-open');}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape' && toggle.getAttribute('aria-expanded')==='true'){toggle.setAttribute('aria-expanded','false');navigation.classList.remove('is-open');toggle.focus();}});
  if('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){navigation.querySelectorAll('a').forEach(a=>{if(a.hash===`#${entry.target.id}`) a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}});
    },{rootMargin:'-15% 0px -65% 0px',threshold:0});
    navigation.querySelectorAll('a').forEach(a=>{const target=document.getElementById(a.hash.slice(1));if(target) observer.observe(target);});
  }
  loadContent('profile',renderProfile,'#hero-content');
  loadContent('projects',renderProjects,'#gallery-count');
  loadContent('company-projects',renderCompanyProjects,'#company-project-gallery');
  loadContent('experience',renderExperience,'#experience-content');
  loadContent('skills',renderSkills,'#skills-content');
  loadContent('education',renderEducation,'#education-content');
  loadContent('certifications',renderCertifications,'#certifications-content');
})();
