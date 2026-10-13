"""Check source-image fidelity and the interactions most affected by the layout fix.
Requires: pip install pillow playwright; playwright install chromium webkit.
Run the Vite server first. Override SITE_URL to test a deployed build.
"""
from pathlib import Path
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright, expect
import os, json
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'docs/qa-original'
OUT.mkdir(exist_ok=True)
BASE = os.environ.get('SITE_URL', 'http://127.0.0.1:4173/')
ENGINES = os.environ.get('BROWSERS', 'chromium').split(',')
checks = []
with sync_playwright() as p:
 for engine in ENGINES:
  options={'headless': True}
  if engine == 'chromium' and Path('/usr/bin/chromium').exists():
   options.update(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  browser=getattr(p,engine).launch(**options)
  page=browser.new_page(viewport={'width':1280,'height':810},device_scale_factor=1,reduced_motion='reduce')
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('response',lambda r:errors.append(f'{r.status} {r.url}') if r.status>=400 else None)
  page.goto(BASE,wait_until='networkidle')
  for i,name in enumerate(['hudson','demulan','mandel']):
   page.locator(f'[data-action="hero"][data-index="{i}"]').click()
   page.mouse.move(1270,800)
   screen=OUT/f'{engine}-home-{name}.png'
   page.screenshot(path=str(screen))
   diff=ImageChops.difference(Image.open(screen).convert('RGB'),Image.open(ROOT/f'public/assets/home-{name}-original.png').convert('RGB'))
   # Raster-only homepage has no browser-dependent font layout.
   assert diff.getbbox() is None, (engine,name,'image differs from original pixels')
  checks.append(f'{engine}: all three homepage frames match the original image pixels')
  page.locator('[data-action="employee"]').first.click()
  expect(page.get_by_role('dialog')).to_be_visible()
  page.keyboard.press('Escape')
  page.get_by_role('link',name='员工论坛',exact=True).click()
  expect(page.locator('.thread-row')).to_have_count(6)
  page.locator('a[href="#forum/archery"]').click()
  page.get_by_placeholder('回复点什么…').fill('原版布局回归检查')
  page.get_by_role('button',name='发送回复').click()
  expect(page.locator('.reply').last).to_contain_text('原版布局回归检查')
  page.get_by_role('link',name='解决方案',exact=True).click()
  expect(page.locator('.product-row')).to_have_count(7)
  page.locator('[data-action="product"][data-id="hmp"]').first.click()
  expect(page.locator('.durability')).to_contain_text('80.0/80.0')
  page.keyboard.press('Escape')
  expect(page.locator('[data-action="buy"][data-id="h09"]')).to_be_disabled()
  expect(page.locator('[data-action="buy"][data-id="hvk"]')).to_be_disabled()
  page.locator('[data-action="buy"][data-id="hls"]').click()
  page.get_by_role('button',name='确认采购').click()
  expect(page.locator('[data-action="buy"][data-id="hls"]')).to_be_disabled()
  page.get_by_role('link',name='寻人启事',exact=True).click()
  page.locator('[data-action="clue"][data-id="zoya"]').click()
  page.get_by_label('发现地点').fill('测试')
  page.get_by_label('线索描述').fill('原版布局回归检查')
  page.get_by_role('button',name='提交线索').click()
  expect(page.locator('[data-action="clue"][data-id="zoya"]')).to_be_disabled()
  checks.append(f'{engine}: navigation, profiles, replies, product drawer, purchasing and clue form pass')
  for width,height in [(390,844),(844,390)]:
   page.set_viewport_size({'width':width,'height':height})
   for route in ['about','forum','solutions','wanted']:
    page.goto(BASE+'#'+route,wait_until='networkidle')
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),(engine,width,route)
    assert not page.locator('img').evaluate_all('(xs)=>xs.some(x=>x.complete&&!x.naturalWidth)'),(engine,width,route,'broken image')
   page.goto(BASE+'#about',wait_until='networkidle')
   box=page.locator('.original-screen.active').bounding_box()
   assert abs(box['width']-width)<1 and abs(box['height']-width*810/1280)<1
   page.screenshot(path=str(OUT/f'{engine}-{width}-home.png'))
   page.get_by_role('link',name='解决方案',exact=True).click()
   page.locator('[data-action="product"][data-id="hmp"]').first.click()
   expect(page.get_by_role('dialog')).to_be_visible()
   page.get_by_role('button',name='关闭').click()
  checks.append(f'{engine}: portrait and landscape preserve the whole composition; mobile targets work')
  assert not errors,errors
  browser.close()
print('\n'.join(checks))
(OUT/'regression-results.json').write_text(json.dumps({'url':BASE,'checks':checks},ensure_ascii=False,indent=2))
