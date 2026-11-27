"""
Свои фото блюд для сайта «Восточка».

1. Положите фото в папку photos-src (рядом с index.html). Имя файла = id блюда из menu.js:
     photos-src/plov.jpg            -> Плов ташкентский
     photos-src/samsa-meat.png      -> Самса с мясом
     photos-src/set-family.jpg      -> картинка сета «Семейный ужин» (id сета с приставкой set-)
   Подходят .jpg .jpeg .png .webp, любого размера, можно прямо с телефона.
2. Запустите в папке сайта:   python tools/photos.py
   Скрипт обрежет фото под карточку (6:5), уменьшит, сохранит в img/<id>.webp
   и сам впишет новые пути в menu.js.
3. Поменяйте версию ?v= в index.html и выложите сайт (git add -A, commit, push).

Скрипт ещё покажет, у каких блюд пока нет фото.
Нужен Pillow:  pip install pillow
"""
import os
import re
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit('Нужен Pillow: pip install pillow')

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'photos-src')
OUT = os.path.join(ROOT, 'img')
MENU = os.path.join(ROOT, 'menu.js')
EXT = ('.jpg', '.jpeg', '.png', '.webp')
SIZE = (900, 750)  # 6:5, как карточка на сайте


def convert(path, dest):
    with Image.open(path) as im:
        im = ImageOps.exif_transpose(im).convert('RGB')
        im = ImageOps.fit(im, SIZE, Image.LANCZOS, centering=(0.5, 0.5))
        im.save(dest, 'WEBP', quality=80, method=6)


def main():
    with open(MENU, encoding='utf-8', newline='') as f:
        menu = f.read()
    os.makedirs(SRC, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)

    done = []
    for name in sorted(os.listdir(SRC)):
        base, ext = os.path.splitext(name)
        if ext.lower() not in EXT:
            continue
        is_set = base.startswith('set-')
        key = base[4:] if is_set else base
        # dish line:  { id: 'plov', ... img: PH('plov') ... }   set line:  id: 'family', ... image: PH('plov-plate')
        dest_name = ('set-' if is_set else '') + key + '.webp'
        new_path = "'img/%s'" % dest_name
        if is_set:
            line = re.compile(r"^(\s*id: '%s',[^\n]*)$" % re.escape(key), re.M)
        else:
            line = re.compile(r"^(\s*\{ id: '%s', name:[^\n]*)$" % re.escape(key), re.M)
        m = line.search(menu)
        if not m:
            print('  ? не нашёл в menu.js:', name, '(имя файла должно быть id блюда)')
            continue
        text = m.group(1)
        field = 'image' if is_set else 'img'
        if re.search(field + r": ('[^']*'|PH\('[^']*'\))", text):
            text = re.sub(field + r": ('[^']*'|PH\('[^']*'\))", field + ': ' + new_path, text, count=1)
        elif is_set:
            text = text.replace('discount:', 'image: %s, discount:' % new_path, 1)
        else:
            text = re.sub(r" \},?\s*$", lambda e: ', img: %s%s' % (new_path, e.group(0)), text, count=1)
        convert(os.path.join(SRC, name), os.path.join(OUT, dest_name))
        menu = menu[:m.start(1)] + text + menu[m.end(1):]
        done.append(name)

    with open(MENU, 'w', encoding='utf-8', newline='') as f:
        f.write(menu)

    print('Готово, фото:', len(done))
    for n in done:
        print('  +', n)
    left = [m for m in re.findall(r"\{ id: '([^']+)', name: '([^']+)'([^\n]*)", menu) if 'price:' in m[2] and "img: 'img/" not in m[2]]
    left = [(i, n) for i, n, _ in left]
    if left:
        print('\nПока без фото (%d):' % len(left))
        print('  ' + ', '.join('%s (%s)' % (n, i) for i, n in left))


if __name__ == '__main__':
    main()
