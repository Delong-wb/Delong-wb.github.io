(function () {
  "use strict";

  var WECHAT_ID = "13717373389";
  var PHONE_LINK = "tel:+8613717373389";

  var header = document.querySelector(".site-header");
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  /* ---------- 工具 ---------- */
  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  function copyText(text, successMessage) {
    function done() {
      toast(successMessage || "已复制");
    }
    function fallback() {
      var area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
        done();
      } catch (e) {
        toast("复制失败，请手动复制");
      }
      document.body.removeChild(area);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
  }

  function openWechat() {
    try {
      window.location.href = "weixin://";
    } catch (e) {
      /* ignore */
    }
    toast("已尝试打开微信；如未打开，请在微信中搜索 " + WECHAT_ID);
  }

  /* ---------- 页头滚动阴影 ---------- */
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 移动端导航 ---------- */
  navToggle.addEventListener("click", function () {
    var open = mainNav.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  mainNav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      mainNav.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- 当前栏目高亮 ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(mainNav.querySelectorAll("a"));

  function highlightNav() {
    var pos = window.scrollY + 120;
    var current = sections[0] ? sections[0].id : "";
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) current = sec.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", highlightNav, { passive: true });
  highlightNav();

  /* ---------- 滚动显现动画 ---------- */
  var revealEls = document.querySelectorAll(".section-head, .product-card, .stat-item, .contact-card, .about-grid");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- 产品卡片 -> 报价表单 ---------- */
  var productLinks = document.querySelectorAll("[data-quote-product]");
  var productSelect = document.getElementById("productSelect");
  productLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      productSelect.value = link.getAttribute("data-quote-product");
    });
  });

  /* ---------- 图片预览 ---------- */
  var imageInput = document.getElementById("imageInput");
  var imagePreview = document.getElementById("imagePreview");
  var previewFiles = [];

  imageInput.addEventListener("change", function () {
    imagePreview.innerHTML = "";
    previewFiles = Array.prototype.slice.call(imageInput.files);
    previewFiles.forEach(function (file) {
      if (!file.type || file.type.indexOf("image/") !== 0) return;
      var img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.alt = file.name;
      img.title = file.name;
      imagePreview.appendChild(img);
    });
  });

  /* ---------- 报价表单 ---------- */
  var quoteForm = document.getElementById("quoteForm");
  var formResult = document.getElementById("formResult");
  var quoteText = document.getElementById("quoteText");
  var fields = {
    name: document.getElementById("f-name"),
    contact: document.getElementById("f-contact"),
    product: productSelect,
    quantity: document.getElementById("f-quantity"),
    message: document.getElementById("f-message")
  };

  function markInvalid(input) {
    input.classList.add("invalid");
  }
  function clearInvalid(input) {
    input.classList.remove("invalid");
  }

  quoteForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;

    Object.keys(fields).forEach(function (key) {
      clearInvalid(fields[key]);
    });

    if (!fields.name.value.trim()) {
      markInvalid(fields.name);
      valid = false;
    }
    if (!fields.contact.value.trim()) {
      markInvalid(fields.contact);
      valid = false;
    }
    if (!fields.product.value) {
      markInvalid(fields.product);
      valid = false;
    }

    if (!valid) {
      toast("请填写称呼、联系方式并选择产品");
      return;
    }

    var lines = [];
    lines.push("【德尔隆化工新材料 询价】");
    lines.push("产品：" + fields.product.value);
    if (fields.quantity.value.trim()) lines.push("预计数量：" + fields.quantity.value.trim());
    lines.push("称呼/公司：" + fields.name.value.trim());
    lines.push("联系电话：" + fields.contact.value.trim());
    if (fields.message.value.trim()) lines.push("需求：" + fields.message.value.trim());
    if (previewFiles.length) {
      lines.push("附图：" + previewFiles.map(function (f) { return f.name; }).join("、") + "（请在微信中发送原图）");
    }
    lines.push("——来自德尔隆化工官网询价");

    quoteText.textContent = lines.join("\n");
    formResult.hidden = false;
    formResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  Object.keys(fields).forEach(function (key) {
    fields[key].addEventListener("input", function () {
      clearInvalid(fields[key]);
    });
  });

  document.getElementById("copyQuoteBtn").addEventListener("click", function () {
    copyText(quoteText.textContent, "询价内容已复制");
  });

  document.getElementById("wechatQuoteBtn").addEventListener("click", openWechat);

  /* ---------- 联系区按钮 ---------- */
  document.getElementById("copyWechatBtn").addEventListener("click", function () {
    copyText(WECHAT_ID, "微信号 " + WECHAT_ID + " 已复制");
  });

  document.getElementById("wechatOpenBtn").addEventListener("click", openWechat);
})();
