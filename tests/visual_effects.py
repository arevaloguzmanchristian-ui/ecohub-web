"""Expressive motion regression. Run separately from the other browser suites."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import argparse
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--screenshots', type=Path)
args = parser.parse_args()
if args.screenshots:
    args.screenshots.mkdir(parents=True, exist_ok=True)


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


root = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}/'


def capture(page, name):
    if args.screenshots:
        page.screenshot(path=str(args.screenshots / f'{name}.png'))


try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        errors = []
        for width, height in ((1440, 900), (1366, 768), (1366, 650), (390, 844)):
            page = browser.new_page(viewport={'width': width, 'height': height})
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(base, wait_until='networkidle')
            page.wait_for_timeout(650)
            assert page.locator('.header').evaluate('(el)=>getComputedStyle(el).backgroundColor==="rgba(0, 0, 0, 0)"')
            assert page.locator('.reading-progress').get_attribute('aria-valuenow') == '0'
            assert page.locator('.hero__stage').bounding_box()['y'] == 0
            assert page.locator('#hero-title').get_attribute('aria-label') == 'Tus ideas. El futuro de Bolivia.'
            assert page.locator('[data-letter-effect]').count() == 10
            assert page.locator('.type-char').count() > 100
            assert page.locator('.hero h1 > em').evaluate('(el)=>getComputedStyle(el).color==="rgb(255, 226, 46)"')
            capture(page, f'hero-{width}')

            page.locator('.hero__actions a[href="#proyecto"]').click()
            page.wait_for_function('!document.querySelector(".button.is-travelling")')
            page.wait_for_function('document.querySelector(".header").classList.contains("is-solid")')
            assert page.locator('#proyecto').evaluate('(el)=>el===document.activeElement')
            assert page.locator('#proyecto').bounding_box()['y'] >= page.locator('.header').bounding_box()['height']
            page.wait_for_timeout(1100)
            capture(page, f'project-{width}')

            for target in ('sostenibilidad', 'agentes', 'territorio'):
                page.locator('#' + target).evaluate('(el)=>el.scrollIntoView({block:"start",behavior:"instant"})')
                page.wait_for_timeout(1100)
                capture(page, f'{target}-{width}')

            if width > 1000 and height >= 740:
                page.wait_for_function('document.querySelector(".sustainability__gallery.is-curtain")')
                geometry = page.evaluate('()=>{const g=document.querySelector(".sustainability__gallery"),s=[...g.children];return {top:g.getBoundingClientRect().top+scrollY,heights:s.map(el=>el.offsetHeight),header:document.querySelector(".header").offsetHeight}}')
                y = geometry['top'] - geometry['header'] + geometry['heights'][0] * .3
                rects = []
                for offset in (0, geometry['heights'][0], 0):
                    page.evaluate('y=>scrollTo({top:y,behavior:"instant"})', y + offset)
                    page.wait_for_timeout(70)
                    rects.append(page.locator('.gallery-piece--ceramic').bounding_box())
                    assert page.locator('.gallery-piece--ceramic').evaluate('(el)=>getComputedStyle(el).position==="sticky"&&!el.closest(".pin-spacer")')
                    assert page.evaluate('()=>!!document.elementFromPoint(innerWidth*.85,innerHeight*.9).closest(".gallery-piece--people,.gallery-piece--environment")')
                assert abs(rects[0]['y'] - geometry['header']) < 1
                assert rects[0] == rects[-1]
                capture(page, f'editorial-curtain-{width}')
                assert page.locator('.pin-spacer').count() == 2
            else:
                assert page.locator('.sustainability__gallery.is-curtain').count() == 0

            page.evaluate('scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})')
            page.wait_for_function('document.querySelector(".reading-progress").getAttribute("aria-valuenow")==="100"')
            page.emulate_media(reduced_motion='reduce')
            page.wait_for_function('!document.querySelector(".sustainability__gallery.is-curtain")&&!document.querySelector(".pin-spacer")')
            assert page.locator('.type-char,.type-word').evaluate_all('(els)=>els.every(el=>!el.style.transform&&!el.style.opacity&&!el.style.filter)')
            page.evaluate('scrollTo({top:0,behavior:"instant"})')
            page.wait_for_function('!document.querySelector(".header.is-solid")')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            page.close()
            print(f'PASS {width}x{height}: typography, overlay header, progress, button travel, second curtain and reduced motion')

        page = browser.new_page(viewport={'width': 1366, 'height': 768})
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(base, wait_until='networkidle')
        page.locator('.hero__actions a[href="#registro"]').click()
        page.wait_for_function('document.querySelector(".button.is-travelling")')
        page.mouse.wheel(0, 140)
        page.wait_for_function('!document.querySelector(".button.is-travelling")')
        page.wait_for_timeout(200)  # Allow the user's native wheel event to finish.
        stop = page.evaluate('scrollY')
        page.wait_for_timeout(1000)
        assert abs(page.evaluate('scrollY') - stop) < 2
        page.evaluate('scrollTo({top:0,behavior:"instant"})')
        page.locator('.hero__actions a[href="#registro"]').click()
        page.wait_for_function('!document.querySelector(".button.is-travelling")')
        assert page.locator('#registro').evaluate('(el)=>el===document.activeElement')
        assert page.locator('#registro').bounding_box()['y'] >= 88
        assert not errors, errors
        browser.close()
        print('PASS interruptible button navigation and primary participation destination')
finally:
    server.shutdown()
    server.server_close()
