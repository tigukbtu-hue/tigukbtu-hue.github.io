"""
Свои фото блюд для сайта «Восточка».

1. Положите фото в папку photos-src (рядом с index.html). Имя файла = id блюда из menu.js:
     photos-src/plov.jpg            -> Плов ташкентский
     photos-src/samsa-meat.png      -> Самса с мясом
     photos-src/set-family.jpg      -> картинка сета «Семейный ужин» (id сета с приставкой set-)
   Подходят .jpg .jpeg .png .webp, любого размера, можно прямо с телефона.
2. Запустите в папке сайта:   python tools/photos.py
   Скрипт обрежет фото под карточку (6:5), уменьшит, сохранит в img/<id>.webp
   и сам впишет новые пути в menu.js. Фото «для примера» с Wikimedia для этих блюд больше не используются.
3. Поменяйте версию ?v= в index.html и выложите сайт (git add -A, commit, push).

Без аргументов скрипт ещё и покажет, у каких блюд пока фото «для примера».
Нужен Pillow:  pip install pillow
"""
import os
import re
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit('Нужен Pillow: pip install pillow')

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
        if is_set:
            pat = re.compile(r"(id: '%s',[^\n]*?image: )(PH\('[^']*'\)|'[^']*')" % re.escape(key))
        else:
            pat = re.compile(r"(\{ id: '%s', name:[^\n]*?img: )(PH\('[^']*'\)|'[^']*')" % re.escape(key))
        if not pat.search(menu):
            print('  ? не нашёл в menu.js:', name, '(имя файла должно быть id блюда)')
            continue
        dest_name = ('set-' if is_set else '') + key + '.webp'
        convert(os.path.join(SRC, name), os.path.join(OUT, dest_name))
        menu = pat.sub(lambda m: m.group(1) + "'img/%s'" % dest_name, menu, count=1)
        done.append(name)

    with open(MENU, 'w', encoding='utf-8', newline='') as f:
        f.write(menu)

    print('Готово, фото:', len(done))
    for n in done:
        print('  +', n)
    left = re.findall(r"\{ id: '([^']+)', name: '([^']+)'[^\n]*img: PH\(", menu)
    if left:
        print('\nПока фото для примера (%d):' % len(left))
        print('  ' + ', '.join('%s (%s)' % (n, i) for i, n in left))


if __name__ == '__main__':
    main()
