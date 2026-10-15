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
        requests = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('request', lambda request: requests.append(request.url))
        for width in (320, 390, 768, 1024, 1440):
            page.set_viewport_size({'width': width, 'height': 960})
            page.goto(base, wait_until='networkidle')
            if width == 320:
                assert not any('atardecer' in url or 'illimani-noche' in url for url in requests)
            assert page.locator('h1').count() == 1
            assert page.locator('h1').is_visible()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert page.locator('.button').count() == 1
            assert page.locator('.hero__human').count() == 0
            assert page.locator('.hero__landscape img').count() == 3
            assert page.locator('main img[src*="/bolivia/"], main img[data-src*="/bolivia/"]').evaluate_all('(images) => {const sources=images.filter(img=>!img.closest(".chapters__visual, .agent-measure")).map(img=>(img.getAttribute("src")||img.dataset.src).replace("-small.webp",".webp"));return new Set(sources).size===sources.length && sources.length>=12;}')
            assert page.locator('a[href^="#"]').evaluate_all(
                '(links) => links.every(a => document.getElementById(a.hash.slice(1)))'
            )
            if width <= 760:
                page.locator('.menu-toggle').click()
                assert page.locator('#navigation').is_visible()
                page.keyboard.press('Escape')
                assert not page.locator('#navigation').is_visible()
                assert page.locator('.pin-spacer').count() == 0
            stage_height = page.locator('.agent-panels').bounding_box()['height']
            for name in ('impulso', 'brujula', 'nexo'):
                page.locator(f'#tab-{name}').click()
                assert page.locator(f'#panel-{name}').is_visible()
                assert page.locator('[role="tabpanel"]:visible').count() == 1
                assert abs(page.locator('.agent-panels').bounding_box()['height'] - stage_height) < 1
                assert page.locator(f'#panel-{name}').evaluate('(el) => getComputedStyle(el).transform') == 'none'
            page.locator('#tab-nexo').focus()
            page.keyboard.press('End')
            assert page.locator('#panel-brujula').is_visible()
            page.keyboard.press('Home')
            assert page.locator('#panel-nexo').is_visible()
            assert page.locator('input, textarea').count() == 0
            assert page.locator('figure, img').evaluate_all('(nodes) => nodes.every(el => { const m = new DOMMatrix(getComputedStyle(el).transform); return Math.abs(m.b) < .0001 && Math.abs(m.c) < .0001; })')
            print(f'PASS {width}px: layout, navigation, agents and keyboard')

        for progress in (0, .98, 0):
            page.evaluate('p => { const t = ScrollTrigger.getById("ecohub-hero"); scrollTo({top: t.start + (t.end-t.start)*p, behavior:"instant"}); }', progress)
            selector = '.hero__connection' if progress else '.hero__message'
            page.wait_for_function('selector => Number(getComputedStyle(document.querySelector(selector)).opacity) > .95', arg=selector)
            page.wait_for_function('() => {const t=ScrollTrigger.getById("ecohub-hero"); return Math.abs(t.animation.progress()-t.progress)<.001;}')
            zoom = page.locator('.hero__landscape img').first.evaluate('(el) => new DOMMatrix(getComputedStyle(el).transform).a')
            page.wait_for_timeout(350)
            assert abs(page.locator('.hero__landscape img').first.evaluate('(el) => new DOMMatrix(getComputedStyle(el).transform).a') - zoom) < .0001
            assert 1 <= zoom <= 1.101
            if progress == .98:
                assert zoom > 1.08
            assert page.locator('.hero__copy, .button').evaluate_all('(nodes) => nodes.every(el => { const m=new DOMMatrix(getComputedStyle(el).transform); return Math.abs(m.a-1)<.0001 && Math.abs(m.d-1)<.0001; })')
        for progress, index in ((.1,0),(.32,1),(.5,1),(.72,2),(.95,2),(.5,1),(.05,0)):
            page.evaluate('p => {const t=ScrollTrigger.getById("ecohub-hero");scrollTo({top:t.start+(t.end-t.start)*p,behavior:"instant"});}', progress)
            page.wait_for_function('p => Math.abs(Number(document.querySelector(".hero").dataset.progress)-p)<.002', arg=progress)
            page.wait_for_function('index => Number(document.querySelector(".hero").dataset.photo)===index', arg=index)
            assert page.locator('.hero__photo-count').inner_text() == f'0{index+1} / 03'
            assert page.locator('.hero__slide').first.evaluate('(el)=>getComputedStyle(el).opacity') == '1'
            assert page.locator('.hero__photo-bars .is-current').count() == 1
            assert page.locator('.hero__landscape img').evaluate_all('(images)=>images.every(el=>new DOMMatrix(getComputedStyle(el).transform).a<=1.101)')
        print('PASS three-photo hero gallery, synchronized labels, masks and reverse scrolling')
        assert page.locator('.hero__landscape').evaluate('(el)=>getComputedStyle(el).isolation') == 'isolate'
        assert page.locator('.hero__slide').evaluate_all('(slides)=>slides.every((el,index)=>Number(getComputedStyle(el).zIndex)===index)')
        for progress in (.1, .29, .32, .34, .37, .5, .63, .66, .68, .71, .9, .5, .1):
            page.evaluate('p => { const t = ScrollTrigger.getById("ecohub-chapters"); scrollTo({top: t.start+(t.end-t.start)*p, behavior:"instant"}); }', progress)
            page.wait_for_function('p => Math.abs(Number(document.querySelector(".chapters").dataset.progress) - p) < .002', arg=progress)
            assert page.locator('.chapter__copy').evaluate_all('(nodes) => nodes.filter(el => Number(getComputedStyle(el).opacity) > .95).length === 1')
            assert page.locator('.chapters__images img').first.evaluate('(el) => getComputedStyle(el).opacity') == '1'
            index = int(page.locator('.chapters').get_attribute('data-chapter'))
            assert page.locator('.chapters__counter span').inner_text() == f'0{index+1}'
            assert page.locator('.chapters__visual figcaption').inner_text() == page.locator(f'.chapter[data-chapter="{index}"] figcaption').inner_text()
            assert page.locator('.chapters__images img').evaluate_all('(nodes) => nodes.every(el => new DOMMatrix(getComputedStyle(el).transform).a <= 1.026)')
        assert page.locator('.pin-spacer').count() == 2
        print('PASS reversible photo zoom, continuous image blends and single synchronized text/counter')

        for anchor in ('registro', 'participar'):
            direct = browser.new_page(viewport={'width': 1440, 'height': 960})
            direct.on('pageerror', lambda error: errors.append(str(error)))
            direct.goto(base + '#' + anchor, wait_until='networkidle')
            direct.wait_for_function('() => { const y=document.querySelector("#registro").getBoundingClientRect().top; const h=document.querySelector(".header").offsetHeight; return y>=h-3 && y<=h+55; }')
            direct.wait_for_function('document.querySelector(".navigation a[aria-current]")?.getAttribute("href") === "#participar"')
            direct.close()
        print('PASS direct registration aliases below header')

        page.emulate_media(reduced_motion='reduce')
        page.wait_for_function('!document.querySelector(".pin-spacer")')
        assert page.locator('.chapter').evaluate_all('(elements) => elements.every(e => getComputedStyle(e).opacity === "1")')
        assert page.locator('.chapter__copy').evaluate_all('(elements) => elements.every(e => getComputedStyle(e).opacity === "1")')
        assert page.locator('.chapters__visual').count() == 0
        page.emulate_media(reduced_motion='no-preference')
        page.set_viewport_size({'width': 390, 'height': 844})
        page.wait_for_function('!document.querySelector(".pin-spacer")')
        page.set_viewport_size({'width': 1440, 'height': 960})
        page.wait_for_function('document.querySelectorAll(".pin-spacer").length === 2')
        print('PASS live reduced motion and resize')

        for mode in ('no-js', 'no-gsap', 'failed-images', 'failed-gallery', 'save-data', 'reduced'):
            context = browser.new_context(java_script_enabled=mode != 'no-js', reduced_motion='reduce' if mode == 'reduced' else 'no-preference', viewport={'width': 390, 'height': 844})
            if mode == 'save-data':
                context.add_init_script('Object.defineProperty(navigator,"connection",{value:{saveData:true,effectiveType:"4g"}})')
            fallback = context.new_page()
            extra_requests = []
            fallback.on('request', lambda request: extra_requests.append(request.url))
            fallback.on('pageerror', lambda error: errors.append(str(error)))
            if mode == 'no-gsap':
                fallback.route('**/assets/vendor/**', lambda route: route.abort())
            if mode == 'failed-images':
                fallback.route('**/assets/bolivia/**', lambda route: route.abort())
            if mode == 'failed-gallery':
                fallback.route('**/assets/bolivia/atardecer*', lambda route: route.abort())
                fallback.route('**/assets/bolivia/illimani-noche*', lambda route: route.abort())
            fallback.goto(base, wait_until='networkidle')
            assert fallback.locator('h1').is_visible()
            assert fallback.locator('.button').is_visible()
            assert fallback.locator('.chapter').count() == 3
            assert fallback.locator('.pin-spacer').count() == 0
            if mode == 'failed-gallery':
                fallback.evaluate('() => {const t=ScrollTrigger.getById("ecohub-hero");scrollTo({top:t.start+(t.end-t.start)*.85,behavior:"instant"});}')
                fallback.wait_for_function('Number(document.querySelector(".hero").dataset.progress)>.8')
                assert fallback.locator('.hero').get_attribute('data-photo') == '0'
                assert fallback.locator('.hero__slide').first.evaluate('(el)=>getComputedStyle(el).opacity') == '1'
            if mode == 'no-js':
                assert fallback.locator('.agent-panel:visible').count() == 3
                assert fallback.locator('#navigation').is_visible()
            else:
                fallback.locator('#tab-impulso').click()
                assert fallback.locator('#panel-impulso').is_visible()
            if mode in ('no-js', 'no-gsap', 'save-data', 'reduced'):
                assert not any('atardecer' in url or 'illimani-noche' in url for url in extra_requests)
            context.close()
            print('PASS fallback:', mode)
        assert not errors, errors
        browser.close()
finally:
    server.shutdown()
    server.server_close()
