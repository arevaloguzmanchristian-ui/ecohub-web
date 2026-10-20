"""Navigation/inline-chat/media regression; run browser suites sequentially."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(Path(__file__).resolve().parents[1])))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}/'
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        errors = []
        for width, height in ((1440, 900), (1366, 768), (1366, 650), (390, 844), (320, 740)):
            page = browser.new_page(viewport={'width': width, 'height': height})
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(base, wait_until='networkidle')
            assert page.locator('.header__preregister').is_hidden()
            assert 'Prerregistro' in page.locator('.hero__actions .button').first.inner_text()
            assert page.locator('img').evaluate_all('(els)=>els.every(el=>(el.getAttribute("src")||el.dataset.src).endsWith(".webp"))')
            assert 'Fotografía de contexto' not in page.locator('body').inner_text()
            assert 'Vista previa de la propuesta' not in page.locator('body').inner_text()
            assert 'Identidad visual:' not in page.locator('.footer').inner_text()
            assert 'Base técnica:' not in page.locator('.footer').inner_text()
            assert page.locator('.footer .photo-credits,dialog').count() == 0

            for target in ('proyecto', 'propuesta', 'agentes', 'participar'):
                if width <= 760:
                    page.locator('.menu-toggle').click()
                page.locator(f'#navigation a[href="#{target}"]').click()
                page.wait_for_function('document.documentElement.classList.contains("is-navigating")')
                assert page.locator('.scroll-smoke').evaluate('(el)=>getComputedStyle(el).pointerEvents==="none"')
                page.wait_for_function('!document.documentElement.classList.contains("is-navigating")')
                actual = 'registro' if target == 'participar' else target
                assert page.locator('#' + actual).evaluate('(el)=>el===document.activeElement'), page.evaluate('({active:document.activeElement.id,tag:document.activeElement.tagName,hash:location.hash,y:scrollY})')
                if actual in ('registro',):
                    assert page.locator('.header__preregister').is_hidden()
                else:
                    assert page.locator('.header__preregister').is_visible()
                if actual == 'propuesta':
                    assert page.locator('#chapters-title').evaluate('(el)=>{const r=el.getBoundingClientRect(),f=document.querySelector(".chapters__frame").getBoundingClientRect();return Math.abs((r.left+r.right-f.left-f.right)/2)<2&&getComputedStyle(el).display==="grid"&&getComputedStyle(el).textAlign==="center"}')
                if actual == 'agentes':
                    for name in ('kibo', 'hubito'):
                        page.locator('#tab-' + name).click()
                        assert page.locator('#example-' + name).is_visible()
                        assert page.locator('.agent-chat:visible').count() == 1
                        assert page.locator('.agent-panel[hidden][inert]').count() == 1

            page.locator('.footer__back').click()
            page.wait_for_function('scrollY<2&&!document.documentElement.classList.contains("is-navigating")')
            assert page.locator('.header__preregister').is_hidden()

            page.locator('#proyecto').evaluate('(el)=>el.scrollIntoView({block:"start",behavior:"instant"})')
            credit = page.locator('.purpose__main .image-credit')
            photo = page.locator('.purpose__main .scene-photo__frame')
            assert credit.locator('button').count() == 0
            photo.focus()
            credit.locator('.image-credit__body').wait_for(state='visible')
            page.wait_for_function('document.querySelector(".purpose__main .image-credit").textContent.includes("Julia WM Bo")')
            assert credit.locator('a').count() == 0
            assert 'Adaptación WebP y encuadre para la web.' not in credit.inner_text()
            assert 'CC BY-SA 4.0' in credit.inner_text()
            page.keyboard.press('Escape')
            credit.locator('.image-credit__body').wait_for(state='hidden')
            page.locator('#territorio').evaluate('(el)=>el.scrollIntoView({block:"start",behavior:"instant"})')
            if width > 1000:
                assert page.locator('.territory__aside').evaluate('(el)=>{const a=el.getBoundingClientRect(),s=document.querySelector(".territory__scene").getBoundingClientRect();return a.left>s.left+s.width*.55&&a.bottom<=s.bottom+1}')
            page.emulate_media(reduced_motion='reduce')
            page.wait_for_function('!document.querySelector(".pin-spacer")')
            if width <= 760:
                page.locator('.menu-toggle').click()
            page.locator('#navigation a[href="#proyecto"]').click()
            assert not page.locator('.is-travelling').count()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            page.close()
            print(f'PASS {width}x{height}: menu smoke, travelling CTA, inline chats, composition and local credits')

        slow = browser.new_page(viewport={'width': 1366, 'height': 768})
        slow.on('pageerror', lambda error: errors.append(str(error)))
        pending = []
        slow.route('**/assets/bolivia/aprendizaje*', lambda route: pending.append(route))
        slow.goto(base, wait_until='domcontentloaded')
        slow.locator('#proyecto').evaluate('(el)=>el.scrollIntoView({block:"start",behavior:"instant"})')
        slow.wait_for_function('document.querySelector(".purpose__main .scene-photo__frame.media-loading")')
        assert slow.locator('#purpose-title').is_visible()
        assert pending
        for route in pending:
            route.continue_()
        slow.wait_for_function('document.querySelector(".purpose__main img").naturalWidth>0&&!document.querySelector(".purpose__main .media-loading")')
        slow.close()

        failed = browser.new_page(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        failed.route('**/assets/bolivia/aprendizaje*', lambda route: route.abort())
        failed.goto(base, wait_until='networkidle')
        failed.locator('#proyecto').evaluate('(el)=>el.scrollIntoView({block:"start",behavior:"instant"})')
        failed.wait_for_function('document.querySelector(".purpose__main .media-failed")')
        assert failed.locator('.purpose__main .media-status').inner_text() == 'Imagen no disponible'
        assert failed.locator('.purpose__main .media-loading').count() == 0
        failed.close()
        touch = browser.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        touch.goto(base + '#sostenibilidad', wait_until='networkidle')
        photo = touch.locator('.gallery-piece--ceramic .image-shell')
        photo.tap(position={'x': 20, 'y': 20})
        touch.locator('.gallery-piece--ceramic .image-credit__body').wait_for(state='visible')
        photo.tap(position={'x': 20, 'y': 20})
        touch.locator('.gallery-piece--ceramic .image-credit__body').wait_for(state='hidden')
        touch.close()
        assert not errors, errors
        browser.close()
        print('PASS non-blocking skeleton, image decode completion, failed-image fallback and touch credits')
finally:
    server.shutdown()
    server.server_close()
