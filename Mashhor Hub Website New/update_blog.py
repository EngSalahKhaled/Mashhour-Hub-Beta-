import os
import re

base_dir = r"c:\Users\Mohamed\Downloads\Mashhor Hub Website New (1)\Mashhor Hub Website New (1)\Mashhor Hub Website New"

def extract_meta(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        title_match = re.search(r'<title>(.*?)</title>', content)
        title = title_match.group(1).split('·')[0].strip() if title_match else os.path.basename(filepath).replace('.html', '')
        
        desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', content, re.IGNORECASE)
        desc = desc_match.group(1) if desc_match else ''
        
        # look for <div class="art-cat">...</div>
        cat_match = re.search(r'<div class="art-cat.*?">(.*?)</div>', content)
        cat = cat_match.group(1).strip() if cat_match else 'Marketing'
        
        date_match = re.search(r'<span>([a-zA-Z]+ \d+, 202\d|[\u0600-\u06FF]+\s+\d+،\s+202\d)</span>', content)
        date = date_match.group(1) if date_match else '2026'

        img_match = re.search(r'<img[^>]+src=["\'](../assets/images/thumbs/[^"\']+)["\']', content)
        if not img_match:
            img_match = re.search(r'<meta property="og:image"\s+content=["\'].*?/assets/([^\'"]+)["\']', content)
            img = '../assets/' + img_match.group(1) if img_match else '../assets/images/default-cover.svg'
        else:
            img = img_match.group(1)
            
        return {
            'title': title,
            'desc': desc,
            'cat': cat,
            'date': date,
            'img': img
        }
    except Exception as e:
        print("Error parsing", filepath, e)
        return None

def build_blog_index(lang_dir, prefix):
    folder = os.path.join(base_dir, lang_dir, 'blog')
    if not os.path.isdir(folder):
        print(f"Folder not found: {folder}")
        return
        
    files = [f for f in os.listdir(folder) if f.endswith('.html') and f not in ('index.html', 'insights.html', 'article-template.html')]
    
    html_cards = []
    for f in files:
        meta = extract_meta(os.path.join(folder, f))
        if not meta: continue
        
        # mapping some keywords to data-cat
        cat_slug = 'strategy'
        if 'ai' in meta['cat'].lower() or 'ذكاء' in meta['cat'].lower(): cat_slug = 'ai'
        elif 'brand' in meta['cat'].lower() or 'هوية' in meta['cat'].lower(): cat_slug = 'brand'
        elif 'performance' in meta['cat'].lower() or 'أداء' in meta['cat'].lower(): cat_slug = 'performance'
        elif 'consult' in meta['cat'].lower() or 'استشار' in meta['cat'].lower(): cat_slug = 'consulting'
        elif 'media' in meta['cat'].lower() or 'إعلان' in meta['cat'].lower(): cat_slug = 'media'
        elif 'creative' in meta['cat'].lower() or 'إبداع' in meta['cat'].lower(): cat_slug = 'creative'
        elif 'influencer' in meta['cat'].lower() or 'مؤثر' in meta['cat'].lower(): cat_slug = 'influencer'

        html_blocks = []
        html_blocks.append(f'<a href="./{f}" class="article-card" data-cat="{cat_slug}">')
        html_blocks.append(f'  <img class="ac-img" src="{meta["img"]}" alt="{meta["title"]}" loading="lazy">')
        html_blocks.append(f'  <div class="ac-body">')
        html_blocks.append(f'    <span class="ac-cat">{meta["cat"]}</span>')
        html_blocks.append(f'    <h3 class="ac-title">{meta["title"]}</h3>')
        html_blocks.append(f'    <p class="ac-desc">{meta["desc"]}</p>')
        html_blocks.append(f'    <div class="ac-meta">')
        html_blocks.append(f'      <span>{meta["date"]}</span>')
        html_blocks.append(f'      <span class="ac-read">{"اقرأ المقال ←" if lang_dir=="ar" else "Read Article →"}</span>')
        html_blocks.append(f'    </div>')
        html_blocks.append(f'  </div>')
        html_blocks.append(f'</a>')
        html_cards.append("\n".join(html_blocks))

    # read target index html
    target_file = os.path.join(folder, 'insights.html')
    if not os.path.isfile(target_file):
        print(f"Target file not found: {target_file}")
        return
        
    with open(target_file, 'r', encoding='utf-8') as tf:
        target_content = tf.read()
    
    # replace everything inside <div class="articles-grid" id="articles-grid"> to </div>
    pattern = r'(<div class="articles-grid" id="articles-grid">)(.*?)(</div>\s*</div>\s*<div class="newsletter">)'
    new_grid = "\n".join(html_cards)
    
    new_content = re.sub(pattern, r'\g<1>\n' + new_grid.replace('\\', '\\\\') + r'\n\g<3>', target_content, flags=re.DOTALL)
    
    with open(target_file, 'w', encoding='utf-8') as tf:
        tf.write(new_content)
    print(f"Updated {target_file} with {len(files)} articles")

build_blog_index('', 'blog')
build_blog_index('ar', 'ar/blog')
