(function () {
  const isTouch = matchMedia("(pointer: coarse)").matches;
  if (isTouch) return; // スマホ等は無効（必要なら外してOK）

  let tip, hideTimer, showTimer;

  const srcFromEl = (el) => {
    if (el.dataset.scry) {
      // セット/番号/言語 指定（例: acr/113/ja）
      return `https://api.scryfall.com/cards/${el.dataset.scry}?format=image&version=large`;
    }
    if (el.dataset.card) {
      // 名前一致（英語名推奨・exact）
      const q = encodeURIComponent(el.dataset.card);
      return `https://api.scryfall.com/cards/named?exact=${q}&format=image&version=large`;
    }
    return null;
  };

  const createTip = () => {
    tip = document.createElement('div');
    tip.className = 'sf-preview';
    document.body.appendChild(tip);
  };

  const show = (el, e) => {
    clearTimeout(hideTimer);
    clearTimeout(showTimer);
    if (!tip) createTip();

    const src = srcFromEl(el);
    if (!src) return;

    // 遅延してふわっと
    showTimer = setTimeout(() => {
      // 画像貼り替え（同一なら再読込しない）
      const cur = tip.querySelector('img')?.getAttribute('src');
      if (cur !== src) {
        tip.innerHTML = '';
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = el.dataset.card || el.dataset.scry || 'card';
        img.src = src;
        tip.appendChild(img);
      }
      position(e);
      tip.classList.add('show');
    }, 120);
  };

  const hide = () => {
    clearTimeout(showTimer);
    hideTimer = setTimeout(() => {
      tip && tip.classList.remove('show');
    }, 60);
  };

  const position = (e) => {
    if (!tip) return;
    const margin = 12;
    const w = tip.offsetWidth || 360;
    const h = tip.offsetHeight || 500;
    let x = e.clientX + margin;
    let y = e.clientY + margin;

    // 右端・下端ははみ出しを抑制
    const vw = window.innerWidth, vh = window.innerHeight;
    if (x + w > vw - margin) x = e.clientX - w - margin;
    if (y + h > vh - margin) y = e.clientY - h - margin;

    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';
  };

  const attach = (root=document) => {
    root.querySelectorAll('.card-hover').forEach(el => {
      el.addEventListener('mouseenter', (e) => show(el, e));
      el.addEventListener('mousemove',  (e) => { if (tip?.classList.contains('show')) position(e); });
      el.addEventListener('mouseleave', hide);
      el.addEventListener('click', hide);
    });
  };

  // 初期化
  attach();
  // ページ内で後から追加された場合
  const mo = new MutationObserver(() => attach());
  mo.observe(document.body, { childList: true, subtree: true });

  // スクロール/ESCで閉じる
  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') hide(); });
})();
