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
            assert page.locator('.hero__actions .button:not(.button--secondary)').count() == 1
            assert page.locator('.hero .button').count() == 2
            assert page.locator('.hero a[href="#proyecto"]').count() == 1
            assert 'Seguir explorando' not in page.locator('.hero').inner_text()
            assert page.locator('.hero .button').evaluate_all('(els)=>els.every(el=>!el.hasAttribute("disabled")&&el.getAttribute("aria-disabled")!=="true"&&getComputedStyle(el).backgroundColor!=="rgba(0, 0, 0, 0)")')
            assert page.locator('.agent-lineup .agent-figure:visible').count() == 1
            assert page.locator('.audience__situations article').count() == 3
            assert page.locator('.chapter__copy li').count() == 9
            assert page.locator('.hero__copy').evaluate('(el)=>getComputedStyle(el).textAlign==="left"')
            assert page.locator('.hero__copy > .eyebrow').count() == 0
            assert page.locator('.hero__messages > div').evaluate_all('(els)=>els.every(el=>el.querySelector("p:last-child").textContent.length>120)')
            assert page.locator('.hero__human').count() == 0
            assert page.locator('.hero__landscape img').count() == 3
            assert page.locator('main img[src*="/bolivia/"], main img[data-src*="/bolivia/"]').evaluate_all('(images) => {const sources=images.filter(img=>!img.closest(".chapters__visual, .agent-measure")).map(img=>(img.getAttribute("src")||img.dataset.src).replace("-small.webp",".webp"));return new Set(sources).size===sources.length && sources.length===14;}')
            assert page.locator('a[href^="#"]').evaluate_all(
                '(links) => links.every(a => document.getElementById(a.hash.slice(1)))'
            )
            if width <= 760:
                page.locator('.menu-toggle').click()
                assert page.locator('#navigation').is_visible()
                page.keyboard.press('Escape')
                assert not page.locator('#navigation').is_visible()
                assert page.locator('.pin-spacer').count() == 0
                page.locator('.menu-toggle').click()
                page.locator('#navigation a[href="#proyecto"]').click()
                page.wait_for_function('()=>{const top=document.querySelector("#proyecto").getBoundingClientRect().top,h=document.querySelector(".header").offsetHeight;return top>=h-2&&top<=h+55}')
                assert not page.locator('#navigation').is_visible()
            stage_height = page.locator('.agent-panels').bounding_box()['height']
            for name in ('kibo', 'hubito'):
                page.locator(f'#tab-{name}').click()
                assert page.locator(f'#panel-{name}').is_visible()
                assert page.locator('[role="tabpanel"]:visible').count() == 1
                assert abs(page.locator('.agent-panels').bounding_box()['height'] - stage_height) < 1
                assert page.locator(f'#panel-{name}').evaluate('(el) => getComputedStyle(el).transform') == 'none'
                assert page.locator(f'[data-agent-figure="{name}"]').get_attribute('class').endswith('is-selected')
                assert page.locator('.agent-selector').evaluate('(el)=>getComputedStyle(el).getPropertyValue("--agent-index").trim()') == str(('kibo','hubito').index(name))
                assert page.locator('.agent-figure:visible').count() == 1
                assert page.locator('.agent-figure[hidden][inert]').count() == 1
                trigger = page.locator(f'#panel-{name} .agent-example-link')
                trigger.click()
                assert page.locator('#agent-example').is_visible()
                assert page.locator('#example-title').inner_text().lower() == name
                assert page.locator('#agent-example .conversation blockquote > p').count() == 2
                for key in ('Tab', 'Shift+Tab'):
                    page.keyboard.press(key)
                    assert page.evaluate('document.querySelector("#agent-example").contains(document.activeElement)')
                if name == 'kibo':
                    assert 'necesidad' in page.locator('#agent-example .conversation__answer').inner_text()
                    page.keyboard.press('Escape')
                else:
                    assert 'entregas' in page.locator('#agent-example .conversation__answer').inner_text()
                    page.locator('.dialog-close').click()
                page.wait_for_function('!document.querySelector("#agent-example").open')
                assert trigger.evaluate('(el)=>el===document.activeElement')
                assert not page.locator('body').evaluate('(el)=>el.classList.contains("modal-open")')
            page.locator('#tab-kibo').focus()
            page.keyboard.press('End')
            assert page.locator('#panel-hubito').is_visible()
            page.keyboard.press('Home')
            assert page.locator('#panel-kibo').is_visible()
            page.wait_for_function('[...document.querySelectorAll(".agent-lineup img")].every(el=>el.naturalWidth>0)')
            assert page.locator('.agent-lineup img').evaluate_all('(els)=>els.every(el=>/hubito|kibo/.test(el.currentSrc))')
            assert page.locator('input, textarea').count() == 0
            assert page.locator('figure, img').evaluate_all('(nodes) => nodes.every(el => { const m = new DOMMatrix(getComputedStyle(el).transform); return Math.abs(m.b) < .0001 && Math.abs(m.c) < .0001; })')
            print(f'PASS {width}px: layout, working buttons, single agent, modal focus and keyboard')

        for progress in (0, .98, 0):
            page.evaluate('p => { const t = ScrollTrigger.getById("ecohub-hero"); scrollTo({top: t.start + (t.end-t.start)*p, behavior:"instant"}); }', progress)
            selector = '.hero__community' if progress else '.hero__message'
            page.wait_for_function('selector => Number(getComputedStyle(document.querySelector(selector)).opacity) > .95', arg=selector)
            page.wait_for_function('() => {const t=ScrollTrigger.getById("ecohub-hero"); return Math.abs(t.animation.progress()-t.progress)<.001;}')
            zoom = page.locator('.hero__landscape img').first.evaluate('(el) => new DOMMatrix(getComputedStyle(el).transform).a')
            page.wait_for_timeout(350)
            assert abs(page.locator('.hero__landscape img').first.evaluate('(el) => new DOMMatrix(getComputedStyle(el).transform).a') - zoom) < .0001
            assert 1 <= zoom <= 1.081
            if progress == .98:
                assert zoom > 1.065
            assert page.locator('.hero__copy, .button').evaluate_all('(nodes) => nodes.every(el => { const m=new DOMMatrix(getComputedStyle(el).transform); return Math.abs(m.a-1)<.0001 && Math.abs(m.d-1)<.0001; })')
        for progress, index in ((.1,0),(.4,1),(.5,1),(.76,2),(.95,2),(.5,1),(.05,0)):
            page.evaluate('p => {const t=ScrollTrigger.getById("ecohub-hero");scrollTo({top:t.start+(t.end-t.start)*p,behavior:"instant"});}', progress)
            page.wait_for_function('p => Math.abs(Number(document.querySelector(".hero").dataset.progress)-p)<.002', arg=progress)
            page.wait_for_function('index => Number(document.querySelector(".hero").dataset.photo)===index', arg=index)
            assert page.locator('.hero__photo-count').inner_text() == f'0{index+1} / 03'
            assert page.locator(('.hero__message', '.hero__connection', '.hero__community')[index]).evaluate('(el)=>Number(getComputedStyle(el).opacity)>.5')
            assert page.locator('.hero__slide').first.evaluate('(el)=>getComputedStyle(el).opacity') == '1'
            assert page.locator('.hero__photo-bars .is-current').count() == 1
            assert page.locator('.hero__landscape img').evaluate_all('(images)=>images.every(el=>new DOMMatrix(getComputedStyle(el).transform).a<=1.081)')
        assert page.locator('.hero__slide').evaluate_all('(slides)=>slides.every(el=>getComputedStyle(el).clipPath==="none")')
        for progress in (.37, .385, .39, .395, .41, .69, .71, .72, .735):
            page.evaluate('p=>{const t=ScrollTrigger.getById("ecohub-hero");scrollTo({top:t.start+(t.end-t.start)*p,behavior:"instant"})}', progress)
            page.wait_for_function('p=>Math.abs(Number(document.querySelector(".hero").dataset.progress)-p)<.002', arg=progress)
            assert page.locator('.hero__messages > div').evaluate_all('(els)=>els.filter(el=>Number(getComputedStyle(el).opacity)>.05).length===1&&els.some(el=>Number(getComputedStyle(el).opacity)>.95)')
        print('PASS three-photo hero gallery, synchronized labels, full-frame crossfades and reverse scrolling')
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
            assert page.locator('.chapters .section-heading').evaluate('(el)=>{const r=el.getBoundingClientRect();return r.top>=document.querySelector(".header").offsetHeight-2&&r.bottom<innerHeight}')
            assert page.locator('.chapter__copy').evaluate_all('(els)=>els.filter(el=>Number(getComputedStyle(el).opacity)>.95).every(el=>{const r=el.getBoundingClientRect(),s=document.querySelector(".chapters__stage").getBoundingClientRect();return r.top>=s.top-1&&r.bottom<=s.bottom+1})')
        assert page.locator('.pin-spacer').count() == 2
        page.evaluate('()=>{const t=ScrollTrigger.getById("ecohub-chapters");scrollTo({top:t.end+20,behavior:"instant"})}')
        page.wait_for_timeout(60)
        assert page.evaluate('()=>{const a=document.querySelector("#para-quien").getBoundingClientRect(),f=document.querySelector(".chapters__frame").getBoundingClientRect();return a.top-f.bottom>=0&&a.top-f.bottom<=56}')
        print('PASS pinned heading, synchronized chapters, contained copy and clean pin release')

        for anchor in ('proyecto', 'propuesta', 'para-quien', 'sostenibilidad', 'agentes', 'territorio', 'registro', 'participar'):
            direct = browser.new_page(viewport={'width': 1440, 'height': 960})
            direct.on('pageerror', lambda error: errors.append(str(error)))
            direct.goto(base + '#' + anchor, wait_until='networkidle')
            target = 'registro' if anchor == 'participar' else anchor
            direct.wait_for_function('id => { const y=document.getElementById(id).getBoundingClientRect().top; const h=document.querySelector(".header").offsetHeight; return y>=h-3 && y<=h+55; }', arg=target)
            if anchor in ('registro', 'participar'):
                direct.wait_for_function('document.querySelector(".navigation a[aria-current]")?.getAttribute("href") === "#participar"')
            direct.close()
        print('PASS all eight direct section anchors below header')

        for width, height in ((1366, 768), (1366, 650), (1280, 720), (1024, 600)):
            page.set_viewport_size({'width': width, 'height': height})
            page.goto(base, wait_until='networkidle')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            if page.locator('.chapters.is-enhanced').count():
                for progress in (0, .5, .95, .5, 0):
                    page.evaluate('p=>{const t=ScrollTrigger.getById("ecohub-chapters");scrollTo({top:t.start+(t.end-t.start)*p,behavior:"instant"});}', progress)
                    page.wait_for_function('p=>Math.abs(Number(document.querySelector(".chapters").dataset.progress)-p)<.002', arg=progress)
                    assert page.locator('.chapter__copy').evaluate_all('(els)=>els.filter(el=>Number(getComputedStyle(el).opacity)>.95).every(el=>{const r=el.getBoundingClientRect();return r.top>=document.querySelector(".header").offsetHeight&&r.bottom<=innerHeight})')
            else:
                assert page.locator('.chapter__copy').evaluate_all('(els)=>els.every(el=>getComputedStyle(el).opacity==="1")')
            summary = page.locator('.faq summary').first
            summary.click()
            page.wait_for_timeout(350)
            assert page.locator('.faq details').first.get_attribute('open') is not None
            summary.click()
            page.wait_for_timeout(350)
            assert page.locator('.faq details').first.get_attribute('open') is None
        print('PASS short laptops, reversible chapters and accordion')

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

        motion = browser.new_page(viewport={'width': 1366, 'height': 768})
        motion.on('pageerror', lambda error: errors.append(str(error)))
        motion.goto(base, wait_until='networkidle')
        assert motion.evaluate('performance.getEntriesByType("resource").some(r=>r.name.includes("motion-mini-14.3.0.mjs"))')
        motion.locator('#agentes').scroll_into_view_if_needed()
        assert motion.evaluate('()=>{document.querySelector("#tab-hubito").click();return document.querySelector("[data-agent-figure=hubito] img").getAnimations().length>0}')
        motion.evaluate('()=>{for(let i=0;i<8;i++)document.querySelector(i%2?"#tab-hubito":"#tab-kibo").click()}')
        motion.wait_for_timeout(650)
        assert motion.locator('.agent-figure:visible').count() == 1
        assert motion.locator('.agent-figure img,.agent-panel__copy,.agent-example-link').evaluate_all('(els)=>els.every(el=>!el.style.opacity&&!el.style.transform&&el.getAnimations().length===0)')
        assert motion.evaluate('()=>{document.querySelector("#panel-hubito .agent-example-link").click();return document.querySelector("#agent-example").getAnimations().length>0}')
        motion.keyboard.press('Escape')
        assert motion.locator('#agent-example').evaluate('(el)=>!el.style.opacity&&!el.style.transform&&el.getAnimations().length===0')
        motion.emulate_media(reduced_motion='reduce')
        assert motion.evaluate('()=>{document.querySelector("#tab-kibo").click();return document.querySelector("[data-agent-figure=kibo] img").getAnimations().length===0}')
        motion.close()
        fallback_effects = browser.new_page()
        fallback_effects.route('**/motion-mini-14.3.0.mjs', lambda route: route.abort())
        fallback_effects.goto(base, wait_until='networkidle')
        fallback_effects.locator('#tab-hubito').click()
        assert fallback_effects.locator('#panel-hubito').is_visible()
        fallback_effects.locator('#panel-hubito .agent-example-link').click()
        assert fallback_effects.locator('#agent-example').is_visible()
        fallback_effects.keyboard.press('Escape')
        assert fallback_effects.locator('.gallery-copy').evaluate_all('(els)=>els.every(el=>getComputedStyle(el).opacity==="1")')
        fallback_effects.close()
        print('PASS local Motion effects, rapid switching, cancellation, reduced motion and module failure')

        for width, height in ((1440, 900), (1366, 768)):
            reflow = browser.new_page(viewport={'width': width, 'height': height})
            reflow.on('pageerror', lambda error: errors.append(str(error)))
            reflow.goto(base, wait_until='networkidle')
            reflow.wait_for_function('[...document.querySelectorAll(".purpose,.audience,.agents,.gallery-piece")].every(el=>el.classList.contains("is-screen"))')
            assert reflow.locator('.is-screen').evaluate_all('(els)=>els.every(el=>el.offsetHeight<=innerHeight-document.querySelector(".header").offsetHeight+2)')
            assert reflow.locator('.gallery-piece').evaluate_all('(els)=>els.every(el=>{const p=el.getBoundingClientRect();return [...el.children].every(child=>{const r=child.getBoundingClientRect();return r.top>=p.top&&r.bottom<=p.bottom})})')
            reflow.locator('#territorio').scroll_into_view_if_needed()
            reflow.wait_for_function('document.querySelector(".territory-stack").classList.contains("is-layered")')
            reflow.evaluate('()=>{const nodes=[...document.querySelectorAll("p,li,h1,h2,h3,figcaption,a.button,button")].map(el=>[el,parseFloat(getComputedStyle(el).fontSize)]);nodes.forEach(([el,size])=>el.style.fontSize=`${size*2}px`)}')
            reflow.wait_for_function('!document.querySelector(".pin-spacer")&&!document.querySelector(".territory-stack.is-layered")&&document.querySelector(".hero.is-flow")')
            assert reflow.evaluate('document.documentElement.scrollWidth<=innerWidth')
            assert reflow.locator('.purpose,.audience,.agents,.gallery-copy').evaluate_all('(els)=>els.every(el=>!["hidden","clip","scroll"].includes(getComputedStyle(el).overflowY))')
            assert reflow.locator('.chapter__copy').evaluate_all('(els)=>els.every(el=>getComputedStyle(el).opacity==="1"&&el.scrollHeight<=el.clientHeight+1)')
            reflow.close()
        print('PASS useful-screen compositions and 200% text: automatic flow, no clipping or extra pins')

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
            assert fallback.locator('.hero__actions .button').first.is_visible()
            assert fallback.locator('.chapter').count() == 3
            assert fallback.locator('.purpose__audience').is_visible()
            assert fallback.locator('.purpose__detail img').is_visible()
            assert fallback.locator('.pin-spacer').count() == 0
            if mode == 'failed-gallery':
                fallback.evaluate('() => {const t=ScrollTrigger.getById("ecohub-hero");scrollTo({top:t.start+(t.end-t.start)*.85,behavior:"instant"});}')
                fallback.wait_for_function('Number(document.querySelector(".hero").dataset.progress)>.8')
                assert fallback.locator('.hero').get_attribute('data-photo') == '0'
                assert fallback.locator('.hero__slide').first.evaluate('(el)=>getComputedStyle(el).opacity') == '1'
            if mode == 'no-js':
                assert fallback.locator('.agent-panel:visible').count() == 2
                assert fallback.locator('#navigation').is_visible()
                assert fallback.locator('.agent-examples').is_visible()
                fallback.locator('#navigation a[href="#proyecto"]').click()
                assert fallback.locator('.header').evaluate('(el)=>el.getBoundingClientRect().bottom<=0')
                assert fallback.locator('#proyecto').evaluate('(el)=>el.getBoundingClientRect().top>=0')
            else:
                fallback.locator('#tab-kibo').click()
                assert fallback.locator('#panel-kibo').is_visible()
                fallback.locator('#panel-kibo .agent-example-link').click()
                assert fallback.locator('#agent-example').is_visible()
                fallback.keyboard.press('Escape')
                fallback.wait_for_function('!document.querySelector("#agent-example").open')
            if mode in ('no-js', 'no-gsap', 'save-data', 'reduced'):
                assert fallback.locator('.hero__messages > div').evaluate_all('(els)=>els.every(el=>getComputedStyle(el).display!=="none"&&Number(getComputedStyle(el).opacity)>.95)')
                assert fallback.locator('.hero__messages > div[aria-hidden="true"]').count() == 0
                assert not any('atardecer' in url or 'illimani-noche' in url for url in extra_requests)
            context.close()
            print('PASS fallback:', mode)
        assert not errors, errors
        browser.close()
finally:
    server.shutdown()
    server.server_close()
