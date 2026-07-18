/**
 * Jossane Ferraz — script compartilhado das páginas internas.
 * Lightbox unificado (fotos e vídeos, teclado + swipe) e reveal on scroll.
 * Sem dependências externas.
 */
(function () {
    'use strict';

    /* ----------------------------------------------------------------------
       Lightbox
       Lê a galeria direto do DOM:
       - <figure><img src="..."></figure>            → foto
       - <figure class="is-video" data-video="...">  → vídeo (img = capa)
       ---------------------------------------------------------------------- */

    var figures = Array.prototype.slice.call(document.querySelectorAll('.gallery > figure'));

    if (figures.length) {
        var items = figures.map(function (fig) {
            var img = fig.querySelector('img');
            return {
                video: fig.getAttribute('data-video'),
                src: img ? (img.currentSrc || img.src) : '',
                alt: img ? img.alt : ''
            };
        });

        var lb = document.createElement('div');
        lb.className = 'lightbox';
        lb.setAttribute('role', 'dialog');
        lb.setAttribute('aria-modal', 'true');
        lb.setAttribute('aria-label', 'Galeria ampliada');
        lb.innerHTML =
            '<span class="lb-counter"></span>' +
            '<button type="button" class="lb-close" aria-label="Fechar">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 4l16 16M20 4L4 20"/></svg>' +
            '</button>' +
            '<button type="button" class="lb-prev" aria-label="Anterior">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M15 4l-8 8 8 8"/></svg>' +
            '</button>' +
            '<div class="lb-media"></div>' +
            '<button type="button" class="lb-next" aria-label="Próximo">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M9 4l8 8-8 8"/></svg>' +
            '</button>';
        document.body.appendChild(lb);

        var media = lb.querySelector('.lb-media');
        var counter = lb.querySelector('.lb-counter');
        var current = 0;
        var lastFocus = null;

        function render() {
            var item = items[current];
            media.innerHTML = '';
            if (item.video) {
                var video = document.createElement('video');
                video.src = item.video;
                video.controls = true;
                video.autoplay = true;
                video.playsInline = true;
                if (item.src) { video.poster = item.src; }
                media.appendChild(video);
            } else {
                var img = document.createElement('img');
                img.src = item.src;
                img.alt = item.alt;
                media.appendChild(img);
            }
            counter.textContent = (current + 1) + ' / ' + items.length;
        }

        function open(index) {
            current = index;
            lastFocus = document.activeElement;
            lb.classList.add('active');
            document.body.classList.add('lb-open');
            render();
            lb.querySelector('.lb-close').focus();
        }

        function close() {
            lb.classList.remove('active');
            document.body.classList.remove('lb-open');
            media.innerHTML = ''; // interrompe vídeo em reprodução
            if (lastFocus) { lastFocus.focus(); }
        }

        function step(delta) {
            current = (current + delta + items.length) % items.length;
            render();
        }

        figures.forEach(function (fig, index) {
            fig.setAttribute('tabindex', '0');
            fig.setAttribute('role', 'button');
            fig.addEventListener('click', function () { open(index); });
            fig.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open(index);
                }
            });
        });

        lb.querySelector('.lb-close').addEventListener('click', close);
        lb.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
        lb.querySelector('.lb-next').addEventListener('click', function () { step(1); });

        lb.addEventListener('click', function (e) {
            if (e.target === lb || e.target === media) { close(); }
        });

        document.addEventListener('keydown', function (e) {
            if (!lb.classList.contains('active')) { return; }
            if (e.key === 'Escape') { close(); }
            else if (e.key === 'ArrowRight') { step(1); }
            else if (e.key === 'ArrowLeft') { step(-1); }
        });

        // Swipe no mobile
        var touchX = null;
        var touchY = null;
        lb.addEventListener('touchstart', function (e) {
            touchX = e.changedTouches[0].clientX;
            touchY = e.changedTouches[0].clientY;
        }, { passive: true });
        lb.addEventListener('touchend', function (e) {
            if (touchX === null) { return; }
            var dx = e.changedTouches[0].clientX - touchX;
            var dy = e.changedTouches[0].clientY - touchY;
            touchX = touchY = null;
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
                step(dx < 0 ? 1 : -1);
            }
        }, { passive: true });
    }

    /* ----------------------------------------------------------------------
       Menu mobile (hambúrguer)
       Botão e overlay são injetados aqui para não repetir markup nas páginas.
       ---------------------------------------------------------------------- */

    var header = document.querySelector('.site-header');
    if (header) {
        var logoImg = header.querySelector('.logo img');
        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-label', 'Abrir menu');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i></i><i></i><i></i>';
        header.appendChild(toggle);

        var menu = document.createElement('div');
        menu.className = 'mobile-menu';
        menu.innerHTML =
            '<nav aria-label="Menu">' +
                '<a href="/">Início</a>' +
                '<a href="/#portfolio">Projetos</a>' +
                '<a href="/#oficinas">Oficinas</a>' +
                '<a href="/#extras">Extras</a>' +
                '<a href="/html/about.html">Sobre</a>' +
                '<a href="/html/entre2producoes.html">Entre 2 Produções</a>' +
                '<a href="#contato">Contato</a>' +
            '</nav>';
        document.body.appendChild(menu);

        var setMenu = function (open) {
            menu.classList.toggle('open', open);
            toggle.classList.toggle('open', open);
            document.body.classList.toggle('menu-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
            if (logoImg) {
                logoImg.src = open ? '/assets/images/logo2.png' : '/assets/images/logo.png';
            }
        };

        toggle.addEventListener('click', function () {
            setMenu(!menu.classList.contains('open'));
        });

        menu.addEventListener('click', function (e) {
            if (e.target === menu || e.target.closest('a')) { setMenu(false); }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); }
        });
    }

    /* ----------------------------------------------------------------------
       Reveal on scroll
       ---------------------------------------------------------------------- */

    var revealTargets = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealTargets.length) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
        revealTargets.forEach(function (el) { observer.observe(el); });
    } else {
        revealTargets.forEach(function (el) { el.classList.add('in-view'); });
    }
})();
