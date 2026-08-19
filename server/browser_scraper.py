import sys
import json
import urllib.parse
import re
from playwright.sync_api import sync_playwright

EXTENDED_COLOR_MAP = {
  'navy blue': ('Navy Blue', '#0D47A1'),
  'dark blue': ('Dark Blue', '#1A237E'),
  'light blue': ('Light Blue', '#64B5F6'),
  'royal blue': ('Royal Blue', '#2962FF'),
  'sky blue': ('Sky Blue', '#87CEEB'),
  'baby blue': ('Baby Blue', '#89CFF0'),
  'lt.blue': ('Light Blue', '#64B5F6'),
  'lt blue': ('Light Blue', '#64B5F6'),
  'dk.blue': ('Dark Blue', '#1A237E'),
  'dk blue': ('Dark Blue', '#1A237E'),
  'dark green': ('Dark Green', '#1B5E20'),
  'light green': ('Light Green', '#81C784'),
  'dark khaki': ('Dark Khaki', '#BDB76B'),
  'dark brown': ('Dark Brown', '#3E2723'),
  'off-white': ('Off White', '#F5F5F0'),
  'off white': ('Off White', '#F5F5F0'),
  'hot pink': ('Hot Pink', '#FF69B4'),
  'd.blue': ('Dark Blue', '#1A237E'),
  'l.blue': ('Light Blue', '#64B5F6'),
  'khaki green': ('Khaki Green', '#556B2F'),
  'black': ('Black', '#111111'),
  'white': ('White', '#FFFFFF'),
  'red': ('Red', '#D32F2F'),
  'blue': ('Blue', '#1E88E5'),
  'navy': ('Navy', '#0D47A1'),
  'green': ('Green', '#2E7D32'),
  'olive': ('Olive', '#558B2F'),
  'mint': ('Mint', '#80CBC4'),
  'teal': ('Teal', '#00897B'),
  'pink': ('Pink', '#EC407A'),
  'rose': ('Rose', '#FF007F'),
  'purple': ('Purple', '#7B1FA2'),
  'lavender': ('Lavender', '#E6E6FA'),
  'lilac': ('Lilac', '#C8A2C8'),
  'burgundy': ('Burgundy', '#800020'),
  'maroon': ('Maroon', '#800000'),
  'wine': ('Wine', '#722F37'),
  'brown': ('Brown', '#6D4C41'),
  'camel': ('Camel', '#C19A6B'),
  'tan': ('Tan', '#D2B48C'),
  'beige': ('Beige', '#F5F5DC'),
  'khaki': ('Khaki', '#C2B280'),
  'cream': ('Cream', '#FFFDD0'),
  'ivory': ('Ivory', '#FFFFF0'),
  'grey': ('Grey', '#757575'),
  'gray': ('Gray', '#757575'),
  'charcoal': ('Charcoal', '#36454F'),
  'silver': ('Silver', '#C0C0C0'),
  'gold': ('Gold', '#FFD700'),
  'yellow': ('Yellow', '#FBC02D'),
  'mustard': ('Mustard', '#FFDB58'),
  'orange': ('Orange', '#FB8C00'),
  'rust': ('Rust', '#B7410E'),
  'coral': ('Coral', '#FF7F50'),
  'peach': ('Peach', '#FFDAB9'),
  'mocha': ('Mocha', '#967969')
}

def extract_color_from_title(title):
  if not title:
    return "Default Color", "#151616"
  
  title_lower = title.lower()
  sorted_keys = sorted(EXTENDED_COLOR_MAP.keys(), key=lambda k: len(k), reverse=True)
  
  for k in sorted_keys:
    esc_k = re.escape(k)
    if re.search(r'[\-\|\–\:]\s*' + esc_k + r'\b', title_lower):
      name, hex_val = EXTENDED_COLOR_MAP[k]
      return name, hex_val

  for k in sorted_keys:
    esc_k = re.escape(k)
    if re.search(r'\b' + esc_k + r'\b', title_lower):
      name, hex_val = EXTENDED_COLOR_MAP[k]
      return name, hex_val

  return "Default Color", "#151616"

def parse_price_value(raw_text):
  if not raw_text:
    return None
  clean = raw_text.replace('\xa0', ' ').replace('\n', ' ').strip()

  range_match = re.search(r'([0-9,.]+)\s*[\-\–]\s*([0-9,.]+)', clean)
  if range_match:
    clean = range_match.group(1)

  dec_match = re.search(r'([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})', clean)
  if dec_match:
    try:
      return float(dec_match.group(1).replace(',', ''))
    except ValueError:
      pass

  digits = re.sub(r'[^0-9]', '', clean)
  if digits:
    try:
      val = float(digits)
      if val > 100000:
        val = val / 100.0
      return val
    except ValueError:
      pass

  return None

def scrape_live_amazon(page, category_info, max_pages=1):
  cat_name = category_info["cat"]
  query = category_info["query"]
  extracted = []
  seen_asins = set()

  for page_num in range(1, max_pages + 1):
    search_url = f"https://www.amazon.com/s?k={urllib.parse.quote(query)}&page={page_num}"
    print(f"[Amazon Live Scraper] Navigating to {cat_name} (Page {page_num}): {search_url}", file=sys.stderr)

    try:
      page.goto(search_url, wait_until='domcontentloaded', timeout=30000)
      page.wait_for_timeout(2000)

      cards = page.query_selector_all('div[data-component-type="s-search-result"]')
      print(f"[Amazon Live Scraper] Found {len(cards)} live product cards on page {page_num}.", file=sys.stderr)

      for card in cards:
        asin = card.get_attribute('data-asin')
        if not asin or asin in seen_asins:
          continue

        title_el = card.query_selector('h2 a span') or card.query_selector('h2')
        link_el = card.query_selector('h2 a')

        title = title_el.inner_text().strip() if title_el else ''
        if not title or len(title) < 5:
          continue

        href = link_el.get_attribute('href') if link_el else ''
        full_url = f"https://www.amazon.com{href}" if href.startswith('/') else href

        img_el = card.query_selector('img.s-image')
        img_src = img_el.get_attribute('src') if img_el else ''
        if not img_src:
          continue

        high_res_img = re.sub(r'\._AC_.*_\.', '.', img_src)

        offscreen = card.query_selector('.a-price .a-offscreen')
        whole = card.query_selector('.a-price-whole')
        fraction = card.query_selector('.a-price-fraction')
        color_price = card.query_selector('.a-color-price')

        raw_price_str = ''
        if offscreen:
          raw_price_str = offscreen.inner_text().strip()
        elif whole:
          raw_price_str = whole.inner_text().replace('\n', '').strip()
          if fraction:
            raw_price_str += '.' + fraction.inner_text().strip()
        elif color_price:
          raw_price_str = color_price.inner_text().strip()

        egy_price = parse_price_value(raw_price_str)

        old_price_el = card.query_selector('.a-text-price span[aria-hidden="true"]')
        orig_price = parse_price_value(old_price_el.inner_text()) if old_price_el else None
        if orig_price and egy_price and orig_price <= egy_price:
          orig_price = int(egy_price * 1.25)

        rating_el = card.query_selector('i.a-icon-star-small span.a-icon-alt')
        rating_val = 4.8
        if rating_el:
          r_text = rating_el.inner_text()
          m = re.search(r'([0-9.]+)', r_text)
          if m:
            rating_val = float(m.group(1))

        review_el = card.query_selector('span.a-size-small a span.a-size-base')
        review_cnt = 48
        if review_el:
          rev_text = review_el.inner_text().replace(',', '').strip()
          if rev_text.isdigit():
            review_cnt = int(rev_text)

        c_name, c_hex = extract_color_from_title(title)

        seen_asins.add(asin)
        extracted.append({
          "source": "amazon",
          "sourceProductId": asin,
          "sourceUrl": full_url,
          "title": title,
          "name": title,
          "brand": "Amazon Fashion",
          "category": cat_name,
          "price": egy_price,
          "originalPrice": orig_price,
          "currency": "EGY",
          "description": f"Authentic women's {cat_name.lower()} apparel extracted live from Amazon.",
          "images": [high_res_img],
          "colors": [{"name": c_name, "hex": c_hex, "image_url": high_res_img}],
          "sizes": [{"name": "XS", "available": True}, {"name": "S", "available": True}, {"name": "M", "available": True}, {"name": "L", "available": True}, {"name": "XL", "available": True}],
          "rating": rating_val,
          "reviewCount": review_cnt,
          "availability": "in_stock"
        })

    except Exception as err:
      print(f"[Amazon Scraper Error] Page {page_num} fetch failed: {str(err)}", file=sys.stderr)

  return extracted

def scrape_live_jumia(page, category_info, max_pages=1):
  cat_name = category_info["cat"]
  query = category_info["query"]
  extracted = []
  seen_skus = set()

  for page_num in range(1, max_pages + 1):
    search_url = f"https://www.jumia.com.eg/catalog/?q={urllib.parse.quote(query)}&page={page_num}"
    print(f"[Jumia Live Scraper] Navigating to {cat_name} (Page {page_num}): {search_url}", file=sys.stderr)

    try:
      page.goto(search_url, wait_until='domcontentloaded', timeout=30000)
      page.wait_for_timeout(2000)

      cards = page.query_selector_all('article.prd') or page.query_selector_all('article.c-prd')
      print(f"[Jumia Live Scraper] Found {len(cards)} live product cards on page {page_num}.", file=sys.stderr)

      for card in cards:
        data_sku = card.get_attribute('data-sku') or card.get_attribute('data-id')
        title_el = card.query_selector('.name') or card.query_selector('h3')
        link_el = card.query_selector('a.core') or card.query_selector('a')
        price_el = card.query_selector('.prc')
        old_price_el = card.query_selector('.old')
        img_el = card.query_selector('img.img') or card.query_selector('img')

        title = title_el.inner_text().strip() if title_el else ''
        if not title or len(title) < 5:
          continue

        href = link_el.get_attribute('href') if link_el else ''
        if not href:
          continue

        full_url = f"https://www.jumia.com.eg{href}" if href.startswith('/') else href
        sku = data_sku or href.split('/')[-1].replace('.html', '')
        if sku in seen_skus:
          continue

        img_src = img_el.get_attribute('data-src') or img_el.get_attribute('src') if img_el else ''
        if not img_src:
          continue
        high_res_img = re.sub(r'300x300', '500x500', img_src)

        price_text = price_el.inner_text().strip() if price_el else ''
        numeric_price = parse_price_value(price_text)

        old_text = old_price_el.inner_text().strip() if old_price_el else ''
        orig_price = parse_price_value(old_text)
        if orig_price and numeric_price and orig_price <= numeric_price:
          orig_price = int(numeric_price * 1.25)

        c_name, c_hex = extract_color_from_title(title)

        seen_skus.add(sku)
        extracted.append({
          "source": "jumia",
          "sourceProductId": sku,
          "sourceUrl": full_url,
          "title": title,
          "name": title,
          "brand": "Jumia Fashion",
          "category": cat_name,
          "price": numeric_price,
          "originalPrice": orig_price,
          "currency": "EGY",
          "description": f"Authentic women's {cat_name.lower()} apparel extracted live from Jumia Egypt.",
          "images": [high_res_img],
          "colors": [{"name": c_name, "hex": c_hex, "image_url": high_res_img}],
          "sizes": [{"name": "XS", "available": True}, {"name": "S", "available": True}, {"name": "M", "available": True}, {"name": "L", "available": True}, {"name": "XL", "available": True}],
          "rating": 4.6,
          "reviewCount": 35,
          "availability": "in_stock"
        })

    except Exception as err:
      print(f"[Jumia Scraper Error] Page {page_num} fetch failed: {str(err)}", file=sys.stderr)

  return extracted

def main():
  is_test = '--test' in sys.argv
  max_pages = 1 if is_test else 2

  target_categories = [
    {"cat": "Dresses", "query": "womens dress"},
    {"cat": "Hoodies", "query": "womens hoodie"},
    {"cat": "Denim", "query": "womens jeans"},
    {"cat": "Tops", "query": "womens top"},
    {"cat": "Suits", "query": "womens suit"}
  ]

  all_extracted = []

  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(
      user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    )

    for cat_info in target_categories:
      try:
        amz_prods = scrape_live_amazon(page, cat_info, max_pages=max_pages)
        all_extracted.extend(amz_prods)
      except Exception as e:
        print(f"[Amazon Scraper Error] Failed for {cat_info['cat']}: {e}", file=sys.stderr)

      try:
        jumia_prods = scrape_live_jumia(page, cat_info, max_pages=max_pages)
        all_extracted.extend(jumia_prods)
      except Exception as e:
        print(f"[Jumia Scraper Error] Failed for {cat_info['cat']}: {e}", file=sys.stderr)

    browser.close()

  # Output JSON to stdout for seed.js execution
  print(json.dumps(all_extracted))

if __name__ == '__main__':
  main()
