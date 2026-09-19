document.querySelectorAll('[data-year]').forEach((el)=>{el.textContent=new Date().getFullYear()});

document.querySelectorAll('.nav-toggle').forEach((button)=>{
  button.addEventListener('click',()=>{
    const target=document.querySelector(button.dataset.target||'.main-nav');
    if(target) target.classList.toggle('open');
  });
});

const quoteForm=document.querySelector('#quote-form');
if(quoteForm){
  const result=document.querySelector('#quote-result');
  const copyButton=document.querySelector('#copy-quote');
  quoteForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    const data=new FormData(quoteForm);
    const message=`您好，德尔隆化工：\n我是${data.get('name')}。\n咨询产品：${data.get('product')}\n应用与需求：${data.get('detail')}\n请协助提供产品资料、供货与报价信息，谢谢。`;
    result.textContent=message;
    result.classList.add('show');
    copyButton.hidden=false;
  });
  copyButton.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(result.textContent);copyButton.textContent='已复制，可粘贴到微信';}
    catch(error){copyButton.textContent='请手动选中上方信息复制';}
  });
}

const productSearch=document.querySelector('#product-search');
if(productSearch){
  const cards=[...document.querySelectorAll('[data-product-card]')];
  const buttons=[...document.querySelectorAll('[data-filter]')];
  const empty=document.querySelector('#empty-state');
  const params=new URLSearchParams(location.search);
  let currentCategory=params.get('category')||'all';

  const filterProducts=()=>{
    const query=productSearch.value.trim().toLowerCase();
    let visible=0;
    cards.forEach((card)=>{
      const text=card.textContent.toLowerCase();
      const category=card.dataset.category||'';
      const show=(!query||text.includes(query))&&(currentCategory==='all'||category.includes(currentCategory));
      card.classList.toggle('hidden',!show);
      if(show) visible++;
    });
    if(empty) empty.classList.toggle('show',visible===0);
  };

  productSearch.value=params.get('q')||'';
  buttons.forEach((button)=>{
    if(button.dataset.filter===currentCategory) button.classList.add('active');
    else button.classList.remove('active');
    button.addEventListener('click',()=>{
      currentCategory=button.dataset.filter;
      buttons.forEach((item)=>item.classList.toggle('active',item===button));
      filterProducts();
    });
  });
  productSearch.addEventListener('input',filterProducts);
  filterProducts();
}

