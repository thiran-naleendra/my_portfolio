/* Buildless, dependency-free portfolio interactions. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const projects = [...window.portfolioProjects].sort((a,b) => Number(b.featured)-Number(a.featured) || a.displayOrder-b.displayOrder);
  const $ = selector => document.querySelector(selector);
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  };
  const external = (label,url) => {
    const a = el('a','btn btn-secondary',label);
    a.href=url; a.target='_blank'; a.rel='noopener noreferrer';
    return a;
  };
  const tags = project => {
    const group = el('div','project-tags');
    project.technologies.forEach(tech => group.append(el('span','tag',tech)));
    return group;
  };
  const media = project => {
    if (project.image) {
      const img=el('img','project-image');
      img.src=project.image; img.alt=project.imageAlt || `${project.name} application screenshot`;
      img.loading='lazy'; img.width=640; img.height=360;
      return img;
    }
    const placeholder=el('div','project-placeholder');
    placeholder.append(el('strong','',project.name),el('span','','Screenshot coming soon'));
    return placeholder;
  };
  const links = project => {
    const group=el('div','project-links');
    if (project.liveUrl) group.append(external(project.status==='Demo' ? 'View Demo' : 'View Website',project.liveUrl));
    const repositories=project.repositoryLinks?.length ? project.repositoryLinks : project.githubUrl ? [{label:'GitHub',url:project.githubUrl}] : [];
    repositories.forEach(repo => group.append(external(repo.label,repo.url)));
    return group;
  };
  const dialog=$('#project-dialog');
  let opener;
  function showDetails(project,button) {
    opener=button;
    const content=$('#dialog-content'); content.replaceChildren();
    const title=el('h2','',project.name); title.id='dialog-title';
    content.append(title,el('p','',`${project.category} · ${project.status}`),media(project),el('h3','','Overview'),el('p','',project.fullDescription));
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
    const article=el('article','card project-card');
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
  const categories=['All Projects','Web Applications','Business Websites','Mobile Applications','Demos & Prototypes'];
  let category='All Projects',expanded=false;
  const limit=6;
  function renderGallery() {
    const filtered=projects.filter(p=>category==='All Projects' || p.category===category);
    const visible=expanded ? filtered : filtered.slice(0,limit);
    $('#project-gallery').replaceChildren(...visible.map(card));
    $('#gallery-count').textContent=`Showing ${visible.length} of ${filtered.length} projects${category==='All Projects' ? '' : ` in ${category}`}`;
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
  $('#certification-count').textContent=document.querySelectorAll('.cert-list .line-item').length;
  const today=new Date();
  // Count completed months from the actual employment start date.
  const experienceStart=new Date(2023,1,20);
  const months=Math.max(0,(today.getFullYear()-experienceStart.getFullYear())*12
    +today.getMonth()-experienceStart.getMonth()
    -(today.getDate()<experienceStart.getDate() ? 1 : 0));
  const years=Math.floor(months/12), remaining=months%12;
  $('#experience-count').textContent=`${years}y ${remaining}m`;
  $('#experience-count').title='Experience since February 20, 2023, measured in completed years and months';
  $('#year').textContent=today.getFullYear();
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
})();
