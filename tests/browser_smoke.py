"""Optional browser smoke tests. Run: python tests/browser_smoke.py."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class TestServer(ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        # A page navigation can cancel a lazy-image response.
        import sys
        if not isinstance(sys.exc_info()[1], ConnectionError):
            super().handle_error(request, client_address)


root = Path(__file__).resolve().parents[1]
server = TestServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}/'

try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        for width in (320, 390, 768, 1024, 1440):
            page.set_viewport_size({'width': width, 'height': 960})
            page.goto(base, wait_until='networkidle')
            assert page.locator('h1').count() == 1
            assert page.locator('h1').is_visible()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert page.locator('.button').count() == 1
            assert page.locator('a[href^="#"]').evaluate_all(
                '(links) => links.every(a => document.getElementById(a.hash.slice(1)))'
            )
            if width <= 760:
                page.locator('.menu-toggle').click()
                assert page.locator('#navigation').is_visible()
                page.keyboard.press('Escape')
                assert not page.locator('#navigation').is_visible()
                assert page.locator('.pin-spacer').count() == 0
            for name in ('impulso', 'brujula', 'nexo'):
                page.locator(f'#tab-{name}').click()
                assert page.locator(f'#panel-{name}').is_visible()
                assert page.locator('[role="tabpanel"]:visible').count() == 1
            page.locator('#tab-nexo').focus()
            page.keyboard.press('End')
            assert page.locator('#panel-brujula').is_visible()
            page.keyboard.press('Home')
            assert page.locator('#panel-nexo').is_visible()
            assert page.locator('input, textarea').count() == 0
            print(f'PASS {width}px: layout, navigation, agents and keyboard')

        for progress in (0, .98, 0):
            page.evaluate('p => { const t = ScrollTrigger.getById("ecohub-hero"); scrollTo({top: t.start + (t.end-t.start)*p, behavior:"instant"}); }', progress)
            selector = '.hero__connection' if progress else '.hero__message'
            page.wait_for_function('selector => Number(getComputedStyle(document.querySelector(selector)).opacity) > .95', arg=selector)
        for progress, index in ((.1, 0), (.5, 1), (.9, 2), (.1, 0)):
            page.evaluate('p => { const t = ScrollTrigger.getById("ecohub-chapters"); scrollTo({top: t.start+(t.end-t.start)*p, behavior:"instant"}); }', progress)
            page.wait_for_function('index => Number(getComputedStyle(document.querySelector(`.chapter[data-chapter="${index}"]`)).opacity) > .95', arg=index)
        assert page.locator('.pin-spacer').count() == 2
        print('PASS two reversible scroll scenes')

        for anchor in ('registro', 'participar'):
            direct = browser.new_page(viewport={'width': 1440, 'height': 960})
            direct.on('pageerror', lambda error: errors.append(str(error)))
            direct.goto(base + '#' + anchor, wait_until='networkidle')
            direct.wait_for_function('() => { const y=document.querySelector("#registro").getBoundingClientRect().top; const h=document.querySelector(".header").offsetHeight; return y>=h-3 && y<=h+55; }')
            direct.close()
        print('PASS direct registration aliases below header')

        page.emulate_media(reduced_motion='reduce')
        page.wait_for_function('!document.querySelector(".pin-spacer")')
        assert page.locator('.chapter').evaluate_all('(elements) => elements.every(e => getComputedStyle(e).opacity === "1")')
        page.emulate_media(reduced_motion='no-preference')
        page.set_viewport_size({'width': 390, 'height': 844})
        page.wait_for_function('!document.querySelector(".pin-spacer")')
        page.set_viewport_size({'width': 1440, 'height': 960})
        page.wait_for_function('document.querySelectorAll(".pin-spacer").length === 2')
        print('PASS live reduced motion and resize')

        for mode in ('no-js', 'no-gsap', 'failed-images', 'save-data'):
            context = browser.new_context(java_script_enabled=mode != 'no-js', viewport={'width': 390, 'height': 844})
            if mode == 'save-data':
                context.add_init_script('Object.defineProperty(navigator,"connection",{value:{saveData:true,effectiveType:"4g"}})')
            fallback = context.new_page()
            fallback.on('pageerror', lambda error: errors.append(str(error)))
            if mode == 'no-gsap':
                fallback.route('**/assets/vendor/**', lambda route: route.abort())
            if mode == 'failed-images':
                fallback.route('**/assets/bolivia/**', lambda route: route.abort())
            fallback.goto(base, wait_until='networkidle')
            assert fallback.locator('h1').is_visible()
            assert fallback.locator('.button').is_visible()
            assert fallback.locator('.chapter').count() == 3
            assert fallback.locator('.pin-spacer').count() == 0
            if mode == 'no-js':
                assert fallback.locator('.agent-panel:visible').count() == 3
                assert fallback.locator('#navigation').is_visible()
            else:
                fallback.locator('#tab-impulso').click()
                assert fallback.locator('#panel-impulso').is_visible()
            context.close()
            print('PASS fallback:', mode)
        assert not errors, errors
        browser.close()
finally:
    server.shutdown()
    server.server_close()
