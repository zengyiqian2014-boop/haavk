"""Verify supplied equipment images are correctly mapped and remain interactive."""
from pathlib import Path
from PIL import Image,ImageChops
from playwright.sync_api import sync_playwright,expect
import json,os
ROOT=Path(__file__).resolve().parent.parent
OUT=Path(os.environ.get('QA_OUT',str(ROOT/'docs/qa-original')));OUT.mkdir(parents=True,exist_ok=True)
BASE=os.environ.get('SITE_URL','http://127.0.0.1:4173/')
checks=[]
def same_pixels(actual,name):
    assert ImageChops.difference(Image.open(actual).convert('RGB'),Image.open(ROOT/'public/assets'/name).convert('RGB')).getbbox() is None,name
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1280,'height':810},reduced_motion='reduce')
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:errors.append(f'{r.status} {r.url}') if r.status>=400 else None)
    page.goto(BASE+'#solutions',wait_until='networkidle')
    for i,name in enumerate(['mhs','hvk','turing']):
        page.locator(f'[data-action="banner"][data-index="{i}"]').click()
        page.mouse.move(1270,800)
        shot=OUT/f'banner-{name}.png'
        page.locator('.product-banner').screenshot(path=str(shot))
        same_pixels(shot,'banner-hvk-uploaded.png' if name=='hvk' else f'banner-{name}-original.png')
    checks.append('All three banners match supplied original crops pixel-for-pixel')
    for id in ['hls','hmp','hvk','assault']:
        row=page.locator(f'.product-row[data-product-id="{id}"]')
        row.scroll_into_view_if_needed()
        page.mouse.move(1270,800)
        shot=OUT/f'row-{id}.png';row.screenshot(path=str(shot))
        same_pixels(shot,f'row-{id}-original.png')
    checks.append('Four complete product rows match original crops pixel-for-pixel')
    for id in ['h09','mhs','hls','hmp','hvk','assault']:
        trigger=page.locator(f'[data-action="product"][data-id="{id}"]').first
        trigger.click();page.wait_for_timeout(80)
        expect(page.locator('.original-equipment-modal')).to_have_attribute('data-product-id',id)
        page.mouse.move(1270,800)
        shot=OUT/f'detail-{id}.png';page.locator('.original-equipment-modal').screenshot(path=str(shot))
        same_pixels(shot,f'detail-{id}-original.png')
        page.locator('[data-action="favorite"]').click()
        expect(page.locator('[data-action="favorite"]')).to_have_attribute('aria-pressed','true')
        page.get_by_role('button',name='关闭').click()
        expect(page.get_by_role('dialog')).to_have_count(0)
    checks.append('All six named detail panels match original crops; favorite and close work')
    page.locator('[data-action="banner"][data-index="0"]').click()
    page.locator('.product-list').evaluate('(el)=>el.scrollTop=420')
    page.mouse.move(1270,800)
    page.wait_for_timeout(3500)  # Let the actual favorite feedback finish before capture.
    page.screenshot(path=str(OUT/'equipment-original-overview.png'))
    for width,height in [(390,844),(844,390)]:
        page.set_viewport_size({'width':width,'height':height})
        for id in ['h09','mhs','hls','hmp','hvk','assault']:
            page.locator(f'[data-action="product"][data-id="{id}"]').first.click()
            expect(page.locator('.original-equipment-modal')).to_have_attribute('data-product-id',id)
            box=page.locator('.original-equipment-modal').bounding_box()
            assert abs(box['width']-402*width/1280)<1
            assert box['x']>=0 and box['x']+box['width']<=width+1
            page.locator('.original-equipment-backdrop').evaluate('(el)=>el.scrollTop=el.scrollHeight')
            box=page.locator('.original-equipment-modal').bounding_box()
            assert box['y']+box['height']<=height+1,(id,width,'detail bottom unreachable')
            page.get_by_role('button',name='关闭').click()
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
    checks.append('Portrait and landscape: six details preserve scale, remain clickable and scroll fully into view')
    expect(page.locator('[data-action="buy"][data-id="h09"]')).to_be_disabled()
    expect(page.locator('[data-action="buy"][data-id="hvk"]')).to_be_disabled()
    page.locator('[data-action="buy"][data-id="hls"]').click()
    page.get_by_role('button',name='确认采购').click()
    expect(page.locator('[data-action="buy"][data-id="hls"]')).to_be_disabled()
    page.reload(wait_until='networkidle')
    expect(page.locator('[data-action="buy"][data-id="hls"]')).to_be_disabled()
    checks.append('Original unavailable states and purchase limit persist correctly')
    # A normal-motion visitor gets the restored original-banner rotation.
    auto=browser.new_page(viewport={'width':1280,'height':810},reduced_motion='no-preference')
    auto.goto(BASE+'#solutions',wait_until='networkidle')
    expect(auto.locator('[data-action="banner"][data-index="1"]')).to_have_attribute('aria-pressed','true',timeout=9000)
    checks.append('Original banner autoplay advances')
    assert not errors,errors
    browser.close()
print('\n'.join(checks))
(OUT/'equipment-results.json').write_text(json.dumps({'url':BASE,'checks':checks},ensure_ascii=False,indent=2))
