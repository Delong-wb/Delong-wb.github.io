document.querySelectorAll('[data-year]').forEach((el)=>{el.textContent=new Date().getFullYear()});

document.querySelectorAll('.nav-toggle').forEach((button)=>button.addEventListener('click',()=>{
  const target=document.querySelector(button.dataset.target||'.nav');
  if(target) target.classList.toggle('open');
}));

const copyText=async(text,button,done='已复制')=>{
  try{await navigator.clipboard.writeText(text);button.textContent=done;}
  catch(error){window.prompt('请复制以下内容',text);}
};

document.querySelectorAll('[data-copy-wechat]').forEach((button)=>button.addEventListener('click',()=>copyText('13717373389',button,'微信号已复制')));

const quoteForm=document.querySelector('#quote-form');
if(quoteForm){
  const result=document.querySelector('#quote-result');
  const next=document.querySelector('#quote-next');
  const copyButton=document.querySelector('#copy-quote');
  const smsLink=document.querySelector('#sms-quote');
  const productField=document.querySelector('#q-product');
  const query=new URLSearchParams(location.search).get('product');
  if(query&&productField){
    const option=[...productField.options].find((item)=>item.textContent.includes(query)||item.value===query);
    if(option) productField.value=option.value;
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
    const message=`肖总您好，我从德尔隆官网咨询：\n公司/称呼：${data.get('name')}\n联系电话：${data.get('phone')}\n产品：${data.get('product')}\n数量：${data.get('quantity')||'待确认'}\n收货地区：${data.get('location')||'待确认'}\n应用与要求：${data.get('detail')}\n请协助提供含税/含运报价、交期及可提供资料，谢谢。`;
    result.textContent=message;
    result.classList.add('show');
    next?.classList.add('show');
    copyButton.hidden=false;
    if(smsLink) smsLink.href=`sms:13717373389?body=${encodeURIComponent(message)}`;
  });
  copyButton?.addEventListener('click',()=>copyText(result.textContent,copyButton,'已复制，打开微信发给肖总'));
}

const productSearch=document.querySelector('#product-search');
if(productSearch){
  const cards=[...document.querySelectorAll('[data-product-card]')];
  const buttons=[...document.querySelectorAll('[data-filter]')];
  const empty=document.querySelector('#empty-state');
  const params=new URLSearchParams(location.search);
  let currentCategory=params.get('category')||'all';
  const filterProducts=()=>{
    const query=productSearch.value.trim().toLowerCase();let visible=0;
    cards.forEach((card)=>{const show=(!query||card.textContent.toLowerCase().includes(query))&&(currentCategory==='all'||(card.dataset.category||'').includes(currentCategory));card.classList.toggle('hidden',!show);if(show) visible++;});
    empty?.classList.toggle('show',visible===0);
  };
  productSearch.value=params.get('q')||'';
  buttons.forEach((button)=>{button.classList.toggle('active',button.dataset.filter===currentCategory);button.addEventListener('click',()=>{currentCategory=button.dataset.filter;buttons.forEach((item)=>item.classList.toggle('active',item===button));filterProducts();});});
  productSearch.addEventListener('input',filterProducts);filterProducts();
}
