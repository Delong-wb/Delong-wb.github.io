(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));
  }

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  const copyText = async (text, trigger) => {
    try {
      await navigator.clipboard.writeText(text);
      const old = trigger.textContent;
      trigger.textContent = '已复制';
      setTimeout(() => { trigger.textContent = old; }, 1600);
    } catch (_) {
      window.prompt('请复制以下内容：', text);
    }
  };

  document.querySelectorAll('[data-copy-phone]').forEach((button) => {
    button.addEventListener('click', () => copyText('13717373389', button));
  });

  const form = document.querySelector('#quote-form');
  const result = document.querySelector('#quote-result');
  if (form && result) {
    const params = new URLSearchParams(location.search);
    const requestedProduct = params.get('product');
    if (requestedProduct && form.elements.product) form.elements.product.value = requestedProduct;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const text = [
        '您好，我想咨询德尔隆化工产品：',
        `产品：${data.get('product') || '待确认'}`,
        `用量：${data.get('quantity') || '待确认'}`,
        `联系人：${data.get('name') || '未填写'}`,
        `电话/微信：${data.get('contact') || '未填写'}`,
        `应用或要求：${data.get('note') || '无'}`
      ].join('\n');
      result.textContent = text;
      result.classList.add('show');
      const copyButton = document.querySelector('#copy-quote');
      if (copyButton) copyButton.hidden = false;
    });

    const copyButton = document.querySelector('#copy-quote');
    if (copyButton) copyButton.addEventListener('click', () => copyText(result.textContent, copyButton));
  }
})();

