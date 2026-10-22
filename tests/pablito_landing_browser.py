"""Popup regressions with mocked answers. Never creates registrations or model calls."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import json, sys

root = Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width, height in ((1366, 768), (390, 844), (320, 740)):
            page = browser.new_page(viewport={'width':width,'height':height})
            errors = []; calls = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            def endpoint(route):
                payload = route.request.post_data_json
                calls.append(payload)
                if payload['mensaje'] == 'fallo':
                    route.fulfill(status=429, content_type='application/json', body=json.dumps({'ok':False,'error':'Espera unos minutos.'}))
                else:
                    route.fulfill(content_type='application/json', body=json.dumps({'ok':True,'respuesta':'EcoHub conecta aprendizaje y comunidad. <b>Texto seguro</b>','fuentes':['proyecto','registro','inventada']}))
            page.route('https://ecohub.mittril.com/api/asistente-landing-v1.php', endpoint)
            url = 'https://ecohub.mittril.com/' if '--live' in sys.argv else f'http://127.0.0.1:{server.server_port}/'
            page.goto(url, wait_until='networkidle')
            page.locator('.pl-launch').click()
            assert page.locator('#pl-question').evaluate('(e)=>e===document.activeElement')
            page.locator('.pl-suggestions button').first.click()
            page.wait_for_selector('.pl-message--assistant')
            assert len(calls) == 1 and calls[0]['historial'] == []
            assert page.locator('.pl-message--assistant b').count() == 0
            assert page.locator('.pl-sources a').count() == 2
            box = page.locator('#pl-dialog').bounding_box()
            assert box['x'] >= -1 and box['x'] + box['width'] <= width + 1, (width,box)
            assert box['y'] >= 0 and box['y'] + box['height'] <= height
            page.locator('#pl-question').fill('fallo')
            page.locator('.pl-actions button').click()
            page.wait_for_function("document.querySelector('.pl-status').textContent.includes('Espera')")
            assert page.locator('#pl-question').input_value() == 'fallo'
            page.locator('#pl-question').press('Escape')
            assert page.locator('#pl-dialog').is_hidden()
            assert page.locator('.pl-launch').evaluate('(e)=>e===document.activeElement')
            assert not errors, errors
            print('PASS landing Pablito', width, 'focus, safe text, sources, API failure, bounds and close')
            page.close()
        browser.close()
finally:
    server.shutdown()
