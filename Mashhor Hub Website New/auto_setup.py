import os
import sys
import re
from pathlib import Path
from PIL import Image

def run_pipeline():
    # 1. Configuration
    RAW_DIR = Path("assets/images/raw")
    THUMB_DIR = Path("assets/images/thumbs")
    HTML_FILE = Path("index.html")
    IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
    
    # 2. Thumbnail Generation
    print("📸 Processing thumbnails in assets/images/raw...")
    processed_count = 0
    if not RAW_DIR.exists():
        print("❌ RAW directory not found. Skipping thumbnails.")
    else:
        for img_path in RAW_DIR.iterdir():
            if img_path.suffix.lower() in IMAGE_EXTENSIONS:
                output_filename = f"thumb_{img_path.stem}.jpg"
                output_path = THUMB_DIR / output_filename
                
                try:
                    with Image.open(img_path) as img:
                        # Handle transparency
                        if img.mode in ("RGBA", "LA", "P"):
                            background = Image.new("RGB", img.size, (255, 255, 255))
                            mask = img.split()[-1] if img.mode == "RGBA" else None
                            background.paste(img, mask=mask)
                            img = background
                        elif img.mode != "RGB":
                            img = img.convert("RGB")
                        
                        img.thumbnail((400, 400))
                        img.save(output_path, "JPEG", optimize=True, quality=85)
                        processed_count += 1
                except Exception as e:
                    print(f"⚠️ Error processing {img_path.name}: {e}")
        print(f"✨ Generated {processed_count} thumbnails.")

    # 3. HTML Update
    if not HTML_FILE.exists():
        print(f"ℹ️ {HTML_FILE} not found. Skipping HTML update.")
        return

    print(f"🔗 Updating {HTML_FILE}...")
    try:
        with open(HTML_FILE, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update img tags to point to thumbs/ and add loading="lazy"
        # Targets any <img> where src doesn't already point to thumbs/
        img_pattern = re.compile(r'(<img\s+[^>]*src=["\']((?!.*?assets/images/thumbs/)[^"\'>]+)["\'][^>]*>)', re.IGNORECASE)

        def update_tag(match):
            full_tag = match.group(1)
            old_src = match.group(2)
            
            filename = old_src.split('/')[-1]
            name_only = os.path.splitext(filename)[0]
            new_src = f"assets/images/thumbs/thumb_{name_only}.jpg"
            
            updated_tag = full_tag.replace(old_src, new_src)
            
            # Add loading="lazy" (skip hero)
            if 'loading=' not in updated_tag.lower() and 'hero' not in updated_tag.lower():
                if updated_tag.endswith('/>'):
                    updated_tag = updated_tag.replace('/>', ' loading="lazy" />')
                else:
                    updated_tag = updated_tag.replace('>', ' loading="lazy">')
            
            return updated_tag

        new_content, count = img_pattern.subn(update_tag, content)
        
        if count > 0:
            with open(HTML_FILE, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"📝 Updated {count} tags in {HTML_FILE}.")
        else:
            print("ℹ️ No HTML updates needed.")

    except Exception as e:
        print(f"❌ Error updating HTML: {e}")

if __name__ == "__main__":
    run_pipeline()
