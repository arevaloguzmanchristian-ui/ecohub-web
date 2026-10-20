"""Official identity, centered proposal and every partner visible without a carousel."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
shots = Path.home() / 'AppData/Local/Temp/opencode/ecohub-branding-review'
shots.mkdir(exist_ok=True)

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width, height in ((1920, 1080), (1366, 768), (768, 900), (390, 844), (320, 740)):
            page = browser.new_page(viewport={'width': width, 'height': height})
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(f'http://127.0.0.1:{server.server_port}/', wait_until='networkidle')
            assert page.locator('.brand__cobrand').evaluate('(el)=>getComputedStyle(el).opacity==="1"')
            header_height = page.locator('.header').evaluate('(el)=>el.offsetHeight')
            page.screenshot(path=str(shots / f'hero-{width}.png'))
            page.evaluate('document.querySelector("#proyecto").scrollIntoView()')
            page.wait_for_timeout(700)
            page.evaluate('document.querySelector("#proyecto").scrollIntoView()')
            page.evaluate('window.scrollBy(0, 8)')
            page.wait_for_function('getComputedStyle(document.querySelector(".brand__primary")).opacity==="1"')
            assert page.locator('.brand__primary').evaluate('(el)=>getComputedStyle(el).opacity==="1"')
            assert header_height == page.locator('.header').evaluate('(el)=>el.offsetHeight')
            page.evaluate('document.querySelector("#propuesta").scrollIntoView()')
            page.wait_for_timeout(900)
            assert page.locator('#chapters-title').evaluate('(el)=>Math.abs(el.getBoundingClientRect().left+el.getBoundingClientRect().width/2-innerWidth/2)<12')
            page.screenshot(path=str(shots / f'proposal-{width}.png'))
            if width > 760:
                assert page.locator('#chapters-title').evaluate('(el)=>{const boxes=[...el.children].map(x=>x.getBoundingClientRect());return Math.max(...boxes.map(x=>x.top))-Math.min(...boxes.map(x=>x.top))<2}')
            assert page.locator('.image-credit a').count() == 0
            page.locator('.partners').scroll_into_view_if_needed()
            page.wait_for_timeout(400)
            assert page.locator('.partners img').count() == 7
            page.wait_for_function('[...document.querySelectorAll(".partners img")].every(el=>el.complete&&el.naturalWidth>0)')
            assert page.locator('.partners .image-credit').count() == 0
            page.screenshot(path=str(shots / f'partners-{width}.png'))
            assert page.locator('.partners button,.partners__track,.partners__hint').count() == 0
            assert page.locator('.partners__grid').evaluate('(el)=>getComputedStyle(el).display==="grid"&&el.scrollWidth<=el.clientWidth')
            assert page.locator('.partners img').evaluate_all('(images)=>images.every(image=>{const r=image.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth})')
            if width <= 760:
                assert page.locator('.partners').evaluate('(el)=>el.getBoundingClientRect().height<innerHeight')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            page.locator('#para-quien').evaluate('(el)=>el.scrollIntoView()')
            page.wait_for_timeout(1100)
            assert page.locator('#audience-title').get_attribute('data-letter-effect') == 'words'
            assert page.locator('.audience__situations article').evaluate_all('(els)=>els.every(el=>getComputedStyle(el).opacity==="1"&&getComputedStyle(el).transform==="none")')
            page.screenshot(path=str(shots / f'audience-{width}.png'))
            assert not errors, errors
            page.close()
            print('PASS branding, centered proposal, all logos without scrolling and audience reveal:', width)
        live = browser.new_page(viewport={'width':390,'height':844})
        live.goto('https://ecohub.mittril.com/form/?branding-check=20261019', wait_until='networkidle')
        logo = live.locator('.marca img')
        assert logo.get_attribute('src') == '/assets/ecohub-ue-02.webp'
        assert logo.evaluate('(el)=>el.complete&&el.naturalWidth===1684')
        assert live.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert live.locator('script[src*="pablito-chat"]').count() == 1
        assert live.locator('#ir-form').count() == 0
        live.screenshot(path=str(shots / 'live-form-logo-390.png'))
        print('PASS live preregistration UE-02 logo; Pablito script retained')
        browser.close()
finally:
    server.shutdown()
    server.server_close()
