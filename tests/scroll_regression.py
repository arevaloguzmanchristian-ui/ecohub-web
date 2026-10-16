"""Pin/refresh regressions. Run after browser_smoke.py, not concurrently."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--screenshots', type=Path)
args = parser.parse_args()
if args.screenshots:
    args.screenshots.mkdir(parents=True, exist_ok=True)


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(Path(__file__).resolve().parents[1])))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}/'


def capture(page, name):
    if args.screenshots:
        page.screenshot(path=str(args.screenshots / f'{name}.png'))


def check_hero(page):
    # Test actual coverage of the visible hero, not just image opacity off-screen.
    assert page.evaluate('''() => {
      const hero=document.querySelector('.hero').getBoundingClientRect();
      const stage=document.querySelector('.hero__stage').getBoundingClientRect();
      const header=document.querySelector('.header').offsetHeight;
      const top=Math.max(header,hero.top), bottom=Math.min(innerHeight,hero.bottom);
      if(bottom<=top+2) return true;
      const base=document.querySelector('.hero__slide');
      return stage.top<=top+2 && stage.bottom>=bottom-2 &&
        getComputedStyle(base).opacity==='1' && getComputedStyle(base).clipPath==='none';
    }''')


try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        errors = []
        for width, height in ((1440, 900), (1366, 650), (1024, 600), (390, 844), (320, 740)):
            page = browser.new_page(viewport={'width': width, 'height': height})
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(base, wait_until='networkidle')
            # Visible editorial content, uncropped 3:4 ceramic, higher-resolution source.
            assert page.locator('details.editorial-details').count() == 0
            assert page.locator('.purpose__audience strong').inner_text() == '16 a 28 años'
            ceramic = page.locator('.purpose__detail img')
            ceramic.scroll_into_view_if_needed()
            page.wait_for_function('document.querySelector(".purpose__detail img").naturalWidth>0')
            assert ceramic.evaluate('(el)=>Math.abs(el.clientWidth/el.clientHeight-.75)<.01 && getComputedStyle(el).transform==="none"')
            if width > 760:
                assert 320 <= ceramic.bounding_box()['width'] <= 420
            page.locator('.sustainability__opening').scroll_into_view_if_needed()
            capture(page, f'editorial-{width}')
            page.locator('#propuesta').evaluate('(el)=>el.scrollIntoView({block:"start"})')
            page.wait_for_timeout(100)
            assert 'Actividades sujetas a convocatoria.' in page.locator('.chapters__note').inner_text()
            capture(page, f'chapters-{width}')
            if width > 760:
                heading = page.locator('.chapters .section-heading').bounding_box()
                image = page.locator('.chapters__visual' if page.locator('.chapters.is-enhanced').count() else '.chapter figure').first.bounding_box()
                assert 24 <= image['y'] - (heading['y'] + heading['height']) <= 36
                assert min(image['y'] + image['height'], height) - image['y'] >= image['height'] * .35, (heading, image)

            for anchor in ('proyecto', 'participar'):
                page.goto(base + '#' + anchor, wait_until='networkidle')
                target = 'registro' if anchor == 'participar' else anchor
                page.wait_for_function('id=>{const r=document.getElementById(id).getBoundingClientRect();const h=document.querySelector(".header").offsetHeight;return r.top>=h-2&&r.top<=h+55}', arg=target)
                page.mouse.wheel(0, 1)  # Real user interaction releases initial anchor settling.
                for step, delay in ((110, 25), (850, 16)):
                    total = page.evaluate('document.documentElement.scrollHeight-innerHeight')
                    for y in list(range(0, total, step)) + list(range(total, -step, -step)) + [0]:
                        page.evaluate('y=>scrollTo({top:Math.max(0,y),behavior:"instant"})', y)
                        page.wait_for_timeout(delay)
                        check_hero(page)
                # Force the exact refresh-at-scroll bug even when gallery images are cached.
                for y in (500, 2200):
                    page.evaluate('y=>{scrollTo({top:y,behavior:"instant"});ScrollTrigger.update();ScrollTrigger.refresh();}', y)
                    page.wait_for_timeout(100)
                    if width > 1000 and height >= 640:
                        assert abs(page.evaluate('ScrollTrigger.getById("ecohub-hero").start')) < 2
                page.locator('.footer__top > a:last-child').click()
                page.wait_for_function('scrollY<2')
                page.wait_for_timeout(40)  # Allow the native anchor scroll event to reach ScrollTrigger.
                check_hero(page)
                assert page.locator('.hero__slide').evaluate_all('(els)=>els.every(el=>getComputedStyle(el).clipPath==="none")')
            if width > 1000 and height >= 640:
                states = []
                for progress in (.95, .2, .95):
                    page.evaluate('p=>{const t=ScrollTrigger.getById("ecohub-hero");scrollTo({top:t.start+(t.end-t.start)*p,behavior:"instant"});}', progress)
                    page.wait_for_function('p=>Math.abs(Number(document.querySelector(".hero").dataset.progress)-p)<.002', arg=progress)
                    states.append(page.locator('.hero__slide').evaluate_all('(els)=>els.map(el=>({opacity:getComputedStyle(el).opacity,clip:getComputedStyle(el).clipPath,transform:getComputedStyle(el.querySelector("img")).transform}))'))
                assert states[0] == states[2]
                capture(page, f'illimani-{width}')
                # Resize while deep in the page, then return through the pin boundary.
                page.locator('#registro').scroll_into_view_if_needed()
                page.set_viewport_size({'width': width - 30, 'height': height + 25})
                page.wait_for_timeout(500)
                page.evaluate('scrollTo({top:0,behavior:"instant"})')
                page.wait_for_timeout(100)
                check_hero(page)
                assert abs(page.evaluate('ScrollTrigger.getById("ecohub-hero").start')) < 2
            page.emulate_media(reduced_motion='reduce')
            page.wait_for_function('!document.querySelector(".pin-spacer")')
            page.evaluate('scrollTo({top:0,behavior:"instant"})')
            page.wait_for_timeout(100)
            check_hero(page)
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            page.close()
            print(f'PASS {width}x{height}: full slow/fast round trips, anchors, refresh, framing and reduced motion')

        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.add_init_script('''const nativeDecode=HTMLImageElement.prototype.decode;
          HTMLImageElement.prototype.decode=function(){
            const decoded=nativeDecode.call(this);
            if(this.closest('.hero__slide') && this.dataset.src?.includes('illimani')) {
              return decoded.then(()=>new Promise(resolve=>{window.releaseNightDecode=resolve}));
            }
            return decoded;
          };''')
        pending = []
        page.route('**/assets/bolivia/atardecer*', lambda route: pending.append(route))
        page.route('**/assets/bolivia/illimani-noche*', lambda route: pending.append(route))
        page.goto(base, wait_until='networkidle')
        page.evaluate('()=>{const t=ScrollTrigger.getById("ecohub-hero");scrollTo({top:t.end*.95,behavior:"instant"})}')
        page.wait_for_function('Number(document.querySelector(".hero").dataset.progress)>.9')
        page.wait_for_timeout(100)
        assert len(pending) >= 2
        assert page.locator('.hero').get_attribute('data-photo') == '0'
        check_hero(page)
        for route in [route for route in pending if 'atardecer' in route.request.url]:
            route.continue_()
        page.wait_for_function('document.querySelector(".hero").dataset.photo==="1"')
        check_hero(page)
        for route in [route for route in pending if 'illimani' in route.request.url]:
            route.continue_()
        page.wait_for_function('typeof window.releaseNightDecode==="function"')
        assert page.locator('.hero').get_attribute('data-photo') == '1'
        page.evaluate('window.releaseNightDecode()')
        page.wait_for_function('document.querySelector(".hero").dataset.photo==="2"')
        assert abs(page.evaluate('ScrollTrigger.getById("ecohub-hero").start')) < 2
        check_hero(page)
        page.close()
        print('PASS delayed gallery: base / decoded dusk / decoded night, stable pin geometry')
        assert not errors, errors
        browser.close()
finally:
    server.shutdown()
    server.server_close()
