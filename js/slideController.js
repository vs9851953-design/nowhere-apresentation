/* ==========================================================================
   slideController.js
   Motor de navegação da apresentação.

   Regras:
   - Navegação estritamente linear (um slide por vez, sem pular etapas).
   - Avança com: clique na metade direita da tela, seta →/↓, ou swipe
     para a esquerda/cima.
   - Volta com: clique na metade esquerda, seta ←/↑, ou swipe contrário.
   - Ao avançar a partir do ÚLTIMO slide de conteúdo, a apresentação
     encerra o modo "slide" e libera a rolagem vertical contínua
     (etapa 9 — Apresentação Completa). A partir daí a navegação por
     clique/seta/swipe é desativada.
   ========================================================================== */

class SlideController {
  /**
   * @param {Object} opts
   * @param {HTMLElement[]} opts.slides - elementos .slide, na ordem de exibição (não inclui a revisão final)
   * @param {HTMLElement} opts.progressBar - container da progress bar
   * @param {HTMLElement} opts.navHint - elemento de dica de navegação
   * @param {HTMLElement} opts.prevZone - área clicável de "voltar"
   * @param {HTMLElement} opts.nextZone - área clicável de "avançar"
   * @param {Function} opts.onEnterReview - callback disparado ao sair do último slide
   */
  constructor({ slides, progressBar, navHint, prevZone, nextZone, onEnterReview }) {
    this.slides = slides;
    this.progressBar = progressBar;
    this.navHint = navHint;
    this.prevZone = prevZone;
    this.nextZone = nextZone;
    this.onEnterReview = onEnterReview;

    this.current = 0;
    this.locked = false;      // trava durante a transição para evitar cliques duplos
    this.reviewMode = false;  // true após a etapa 9 assumir a rolagem

    this._buildProgress();
    this._bindEvents();
    this._show(0);
  }

  _buildProgress() {
    this.progressSegs = this.slides.map(() => {
      const seg = document.createElement('div');
      seg.className = 'progress-seg';
      this.progressBar.appendChild(seg);
      return seg;
    });
  }

  _updateProgress() {
    this.progressSegs.forEach((seg, i) => {
      seg.classList.toggle('done', i < this.current);
      seg.classList.toggle('active', i === this.current);
    });
  }

  _show(index) {
    this.slides.forEach((slide, i) => {
      slide.classList.remove('active', 'leaving-up', 'leaving-down');
      if (i === index) slide.classList.add('active');
    });
    this._updateProgress();
  }

  _dismissHint() {
    if (this.navHint) this.navHint.classList.add('hidden');
  }

  /**
   * Avança um slide. Se já estiver no último, dispara a transição
   * definitiva para o modo de revisão (rolagem contínua).
   */
  next() {
    if (this.locked || this.reviewMode) return;
    this._dismissHint();

    const isLast = this.current === this.slides.length - 1;

    if (isLast) {
      this._enterReviewMode();
      return;
    }

    this.locked = true;
    const outgoing = this.slides[this.current];
    outgoing.classList.add('leaving-up');
    outgoing.classList.remove('active');

    this.current += 1;
    const incoming = this.slides[this.current];
    incoming.classList.remove('leaving-up', 'leaving-down');
    // força reflow para garantir que a transição de entrada rode
    void incoming.offsetWidth;
    incoming.classList.add('active');

    this._updateProgress();
    setTimeout(() => { this.locked = false; }, 500);
  }

  /**
   * Volta um slide. Não tem efeito no primeiro slide nem no modo de revisão.
   */
  prev() {
    if (this.locked || this.reviewMode || this.current === 0) return;
    this._dismissHint();

    this.locked = true;
    const outgoing = this.slides[this.current];
    outgoing.classList.add('leaving-down');
    outgoing.classList.remove('active');

    this.current -= 1;
    const incoming = this.slides[this.current];
    incoming.classList.remove('leaving-up', 'leaving-down');
    void incoming.offsetWidth;
    incoming.classList.add('active');

    this._updateProgress();
    setTimeout(() => { this.locked = false; }, 500);
  }

  _enterReviewMode() {
    this.reviewMode = true;

    // marca a última etapa como concluída na progress bar antes de escondê-la
    this.progressSegs[this.progressSegs.length - 1].classList.add('done');
    this.progressSegs[this.progressSegs.length - 1].classList.remove('active');

    this.progressBar.classList.add('hidden');
    if (this.navHint) this.navHint.classList.add('hidden');
    if (this.prevZone) this.prevZone.style.display = 'none';
    if (this.nextZone) this.nextZone.style.display = 'none';

    document.body.classList.add('scroll-mode');

    if (typeof this.onEnterReview === 'function') this.onEnterReview();
  }

  _bindEvents() {
    // clique nas metades da tela
    if (this.nextZone) this.nextZone.addEventListener('click', () => this.next());
    if (this.prevZone) this.prevZone.addEventListener('click', () => this.prev());

    // teclado
    window.addEventListener('keydown', (e) => {
      if (this.reviewMode) return;
      if (['ArrowRight', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
        this.next();
      } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        this.prev();
      }
    });

    // swipe (touch)
    let startX = 0, startY = 0, tracking = false;
    const threshold = 50;

    window.addEventListener('touchstart', (e) => {
      if (this.reviewMode) return;
      tracking = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (this.reviewMode || !tracking) return;
      tracking = false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;

      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) this.next(); else this.prev();
      } else {
        if (dy < 0) this.next(); else this.prev();
      }
    }, { passive: true });
  }
}
