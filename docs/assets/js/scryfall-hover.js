(() => {
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  let preview, backdrop;
  let currentTarget = null;
  let hideTimer = null;

  function ensureNodes() {
    if (!preview) {
      preview = document.createElement('div');
      preview.className = 'sf-preview';
      document.body.appendChild(preview);
    }
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sf-backdrop';
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', hideTouchPreview, { passive: true });
    }
  }

  function imgUrlFrom(el) {
    // data-scry="set/num/lang" 例: "acr/113/ja"
    const key = el.getAttribute('data-scry') || '';
    // version は必要に応じて変更可: normal/large/small/png
    return `https://api.scryfall.com/cards/${key}?format=image&version=large`;
  }

  function showHoverPreview(e, el) {
    ensureNodes();
    currentTarget = el;
    preview.classList.remove('touch');
    preview.innerHTML = `<img alt="" loading="lazy" src="${imgUrlFrom(el)}">`;
    const x = e.clientX + 12;
    const y = e.clientY + 12;
    Object.assign(preview.style, { left: x + 'px', top: y + 'px' });
    preview.classList.add('show');
    // PCでは backdrop は使わない
  }

  function moveHoverPreview(e) {
    if (!preview || !preview.classList.contains('show') || preview.classList.contains('touch')) return;
    const x = e.clientX + 12;
    const y = e.clientY + 12;
    Object.assign(preview.style, { left: x + 'px', top: y + 'px' });
  }

  function hideHoverPreview() {
    if (!preview) return;
    preview.classList.remove('show');
    currentTarget = null;
  }

  // ---- タッチ（スマホ）: タップで中央表示、外側タップで閉じる ----
  function toggleTouchPreview(el) {
    ensureNodes();
    const isOpen = preview.classList.contains('show') && preview.classList.contains('touch');
    const same = (currentTarget === el);
    if (isOpen && same) {
      hideTouchPreview();
      return;
    }
    currentTarget = el;
    preview.classList.add('touch');
    preview.innerHTML = `<img alt="" loading="lazy" src="${imgUrlFrom(el)}">`;
    preview.classList.add('show');
    backdrop.classList.add('show');

    // スクロールや戻る操作で閉じたい時
    requestAnimationFrame(() => {
      document.addEventListener('keydown', escToClose, { once: true });
    });
  }

  function hideTouchPreview() {
    if (!preview) return;
    preview.classList.remove('show', 'touch');
    backdrop.classList.remove('show');
    currentTarget = null;
  }

  function escToClose(e) {
    if (e.key === 'Escape') hideTouchPreview();
  }

  // ---- 初期化：.card-hover を拾ってイベント付与 ----
  function bind(el) {
    // 既存クラスがなければ見た目用に付与
    el.classList.add('card-hover');

    if (isCoarse) {
      // スマホ/タブレット：タップで開閉
      el.addEventListener('click', (ev) => {
        ev.preventDefault(); // 文字リンク化してる場合の遷移防止
        ev.stopPropagation();
        toggleTouchPreview(el);
      }, { passive: false });

      // ページのどこかをタップしたら閉じる（カード画像以外）
      document.addEventListener('click', (ev) => {
        if (!preview || !preview.classList.contains('show')) return;
        const withinPreview = preview.contains(ev.target);
        const withinTrigger = el.contains(ev.target);
        if (!withinPreview && !withinTrigger) hideTouchPreview();
      }, { passive: true });

      // スクロールで閉じる（好みで）
      window.addEventListener('scroll', hideTouchPreview, { passive: true });
    } else {
      // PC：ホバーで表示・移動、外れたら隠す
      el.addEventListener('mouseenter', (e) => {
        clearTimeout(hideTimer);
        showHoverPreview(e, el);
      });
      el.addEventListener('mousemove', moveHoverPreview);
      el.addEventListener('mouseleave', () => {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hideHoverPreview, 100);
      });
    }
  }

  function init() {
    const targets = document.querySelectorAll('.card-hover[data-scry], [data-scry].card-hover, [data-scry]:not(.card-hover)');
    targets.forEach(bind);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
