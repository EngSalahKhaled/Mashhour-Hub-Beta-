import os
import re

base_dir = r"c:\Users\Mohamed\Downloads\Mashhor Hub Website New (1)\Mashhor Hub Website New (1)\Mashhor Hub Website New"

def extract_meta(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        title_match = re.search(r'<title>(.*?)</title>', content)
        title = title_match.group(1).split('·')[0].strip() if title_match else os.path.basename(filepath).replace('.html', '')
        return title
    except:
        return os.path.basename(filepath).replace('.html', '')

def update_sitemap(lang_dir):
    blog_folder = os.path.join(base_dir, lang_dir, 'blog')
    if not os.path.isdir(blog_folder): return
    files = [f for f in os.listdir(blog_folder) if f.endswith('.html') and f not in ('article-template.html',)]
    
    html_links = []
    for f in files:
        title = extract_meta(os.path.join(blog_folder, f))
        if f == 'index.html' or f == 'insights.html':
            continue
        html_links.append(f'            <li><a href="{lang_dir + "/" if lang_dir else ""}blog/{f}" >{title}</a></li>')

    # Add index manually at top
    html_links.insert(0, f'            <li><a href="{lang_dir + "/" if lang_dir else ""}blog/index.html" >{"المدونة الرئيسية" if lang_dir=="ar" else "Editorial Blog"}</a></li>')
    html_links.insert(1, f'            <li><a href="{lang_dir + "/" if lang_dir else ""}blog/insights.html" >{"مركز المقالات" if lang_dir=="ar" else "Insights Hub"}</a></li>')

    sitemap_file = os.path.join(base_dir, lang_dir, 'sitemap.html')
    if not os.path.isfile(sitemap_file): return
    
    with open(sitemap_file, 'r', encoding='utf-8') as sf:
        content = sf.read()
        
    sitemap_title = 'المدونة والمقالات' if lang_dir == 'ar' else 'Blog &amp; Insights'
    
    # Regex to find the <ul class="sitemap-list"> after <h3 class="sitemap-card-title">{sitemap_title}</h3>
    pattern = r'(<h3 class="sitemap-card-title">' + sitemap_title + r'</h3>\s*</div>\s*<ul class="sitemap-list">)(.*?)(</ul>)'
    
    new_content = re.sub(pattern, r'\g<1>\n' + "\n".join(html_links).replace('\\', '\\\\') + r'\n          \g<3>', content, flags=re.DOTALL)
    
    with open(sitemap_file, 'w', encoding='utf-8') as sf:
        sf.write(new_content)
    print(f"Updated {sitemap_file} with {len(files)} blog links")

update_sitemap('')
update_sitemap('ar')
