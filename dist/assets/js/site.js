document.querySelectorAll('[data-year]').forEach((element)=>{
  element.textContent=new Date().getFullYear();
});

document.querySelectorAll('.nav-toggle').forEach((button)=>{
  button.addEventListener('click',()=>{
    const target=document.querySelector(button.dataset.target||'.v3-nav');
    if(!target) return;
    const open=target.classList.toggle('open');
    button.setAttribute('aria-expanded',String(open));
  });
});

const copyText=async(text,button,done='已复制')=>{
  try{
    await navigator.clipboard.writeText(text);
    button.textContent=done;
  }catch(error){
    window.prompt('请复制以下内容',text);
  }
};

document.querySelectorAll('[data-copy-wechat]').forEach((button)=>{
  button.addEventListener('click',()=>copyText('13717373389',button,'微信号已复制'));
});

const quoteForm=document.querySelector('#quote-form');
if(quoteForm){
  const result=document.querySelector('#quote-result');
  const next=document.querySelector('#quote-next');
  const copyButton=document.querySelector('#copy-quote');
  const smsLink=document.querySelector('#sms-quote');
  const productField=document.querySelector('#q-product');
  const params=new URLSearchParams(location.search);
  const productQuery=params.get('product');
  const intentMap={sample:'样品与小试',document:'技术资料',technical:'应用选型',alternative:'替代牌号',price:'价格与交期'};
  const intentQuery=intentMap[params.get('intent')]||params.get('intent');

  if(productQuery&&productField){
    const option=[...productField.options].find((item)=>item.textContent.includes(productQuery)||item.value===productQuery);
    if(option) productField.value=option.value;
    else productField.add(new Option(productQuery,productQuery,true,true),0);
  }
  if(intentQuery){
    const intent=[...quoteForm.querySelectorAll('[name="intent"]')].find((item)=>item.value===intentQuery);
    if(intent) intent.checked=true;
  }

  document.querySelectorAll('[data-quote-product]').forEach((button)=>button.addEventListener('click',()=>{
    const product=button.dataset.quoteProduct;
    if(productField){
      const option=[...productField.options].find((item)=>item.textContent.includes(product)||item.value===product);
      if(option) productField.value=option.value;
    }
    quoteForm.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>document.querySelector('#q-name')?.focus(),450);
  }));

  quoteForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    const data=new FormData(quoteForm);
    const documents=data.getAll('documents').join('、')||'暂不确定';
    const message=[
      '肖总您好，我从德尔隆官网咨询：',
      `需求类型：${data.get('intent')}`,
      `公司/称呼：${data.get('name')}`,
      `联系电话：${data.get('phone')}`,
      `希望联系：${data.get('contact_method')||'待确认'}｜时间/到货：${data.get('target_time')||'待确认'}`,
      `产品：${data.get('product')}`,
      `现用厂家/牌号：${data.get('current_product')||'未提供'}`,
      `数量：${data.get('quantity')||'待确认'}｜收货地区：${data.get('location')||'待确认'}`,
      `报价口径：${data.get('trade_terms')||'待确认'}｜项目阶段：${data.get('project_stage')||'待确认'}`,
      `需要资料：${documents}`,
      `应用与要求：${data.get('detail')}`,
      '请协助核对产品、可提供资料、样品/价格与交期，谢谢。'
    ].join('\n');
    result.textContent=message;
    result.classList.add('show');
    next?.classList.add('show');
    copyButton.hidden=false;
    if(smsLink) smsLink.href=`sms:13717373389?body=${encodeURIComponent(message)}`;
    result.scrollIntoView({behavior:'smooth',block:'center'});
  });
  copyButton?.addEventListener('click',()=>copyText(result.textContent,copyButton,'已复制，打开微信发给肖总'));
}

const productFinder=document.querySelector('[data-product-finder]');
if(productFinder){
  const search=document.querySelector('#product-search');
  const filters=[...document.querySelectorAll('[data-product-filter]')];
  const cards=[...document.querySelectorAll('[data-product-card]')];
  const empty=document.querySelector('#empty-state');
  const count=document.querySelector('#product-count');
  const reset=document.querySelector('[data-reset-products]');
  const groupTitle=document.querySelector('[data-product-group-title]');
  const params=new URLSearchParams(location.search);
  const legacyFamily={pigment:'powder',engineering:'additive',food:'extended'};

  search.value=params.get('q')||'';
  filters.forEach((filter)=>{
    const key=filter.dataset.productFilter;
    const legacy=key==='family'?(params.get('category')||''):'';
    const value=params.get(key)||legacyFamily[legacy]||legacy||'all';
    if([...filter.options].some((option)=>option.value===value)) filter.value=value;
  });

  const matchesToken=(tokens,value)=>value==='all'||tokens.split(/\s+/).includes(value);
  const applyFilters=()=>{
    const query=search.value.trim().toLowerCase();
    const active=Object.fromEntries(filters.map((filter)=>[filter.dataset.productFilter,filter.value]));
    let visible=0;
    let extendedVisible=false;
    cards.forEach((card)=>{
      const text=card.textContent.toLowerCase();
      const show=(!query||text.includes(query))&&
        matchesToken(card.dataset.family||'',active.family||'all')&&
        matchesToken(card.dataset.function||'',active.function||'all')&&
        matchesToken(card.dataset.application||'',active.application||'all');
      card.hidden=!show;
      card.classList.toggle('hidden',!show);
      if(show){
        visible+=1;
        if((card.dataset.family||'').split(/\s+/).includes('extended')) extendedVisible=true;
      }
    });
    if(count) count.textContent=String(visible);
    empty?.classList.toggle('show',visible===0);
    if(groupTitle) groupTitle.hidden=!extendedVisible;

    const nextParams=new URLSearchParams();
    if(query) nextParams.set('q',search.value.trim());
    Object.entries(active).forEach(([key,value])=>{if(value&&value!=='all') nextParams.set(key,value)});
    const queryString=nextParams.toString();
    history.replaceState(null,'',`${location.pathname}${queryString?`?${queryString}`:''}${location.hash}`);
  };

  search.addEventListener('input',applyFilters);
  filters.forEach((filter)=>filter.addEventListener('change',applyFilters));
  reset?.addEventListener('click',()=>{
    search.value='';
    filters.forEach((filter)=>{filter.value='all'});
    applyFilters();
    search.focus();
  });
  applyFilters();
}
