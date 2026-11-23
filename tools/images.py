#!/usr/bin/env python3
"""Готовит картинки для сайта.

Картинки проектов:
    python3 tools/images.py materials/
  Берёт все JPG и PNG из папки (с подпапками), поворачивает по EXIF, убирает метаданные (геометку, модель телефона),
  делает две ширины, 800 и 1600 пикселей (меньше исходника не увеличивает), в формате WebP и кладёт в assets/img/,
  повторяя структуру подпапок:
      materials/spotted/veranda/01.jpg -> assets/img/spotted/veranda/01-800.webp и 01-1600.webp
  В данных проекта картинку указывают без размера и расширения: "/assets/img/spotted/veranda/01".
  Рядом пишется assets/img/manifest.json с пропорциями, чтобы страница заранее держала место под картинку.

Аватар для развилки:
    python3 tools/images.py --avatar фото.jpg --name nab [--cx 0.5 --cy 0.42 --size 0.65]
  Квадратный кадр (центр и размер в долях ширины фото), чёрно-белый, с подтянутым контрастом, 336 пикселей:
      assets/nab.jpg. Зерно на сайте рисуется из него само.

Нужен Pillow: pip install pillow
"""
import argparse, json, sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
WIDTHS = (800, 1600)
EXT = {".jpg", ".jpeg", ".png", ".webp"}


TR = dict(zip("абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
              ["a","b","v","g","d","e","e","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","h","ts","ch","sh","sch","","y","","e","yu","ya"]))


def slugify(part):
    """имя файла или папки в адрес: латиница, цифры, дефис"""
    out = "".join(TR.get(ch, ch) for ch in part.lower())
    out = "".join(ch if ch.isascii() and (ch.isalnum() or ch in "-_") else "-" for ch in out)
    while "--" in out: out = out.replace("--", "-")
    return out.strip("-") or "img"


def prepare(im):
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGBA", im.size, (255, 255, 255, 0))
        bg.alpha_composite(im)
        return bg
    return im.convert("RGB")


def process_folder(src, out):
    src, out = Path(src), Path(out)
    manifest_path = out / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    files = [p for p in sorted(src.rglob("*")) if p.suffix.lower() in EXT and not p.name.startswith(".")]
    if not files:
        print("в папке нет картинок:", src); return
    for f in files:
        rel = f.relative_to(src).with_suffix("")
        slug = "/".join(slugify(part) for part in rel.parts)
        im = prepare(Image.open(f))
        w, h = im.size
        for target in WIDTHS:
            tw = min(target, w)
            t = im if tw == w else im.resize((tw, round(h * tw / w)), Image.LANCZOS)
            dst = out / f"{slug}-{target}.webp"
            dst.parent.mkdir(parents=True, exist_ok=True)
            t.save(dst, "WEBP", quality=82, method=6)
        try: key = "/" + str((out / slug).resolve().relative_to(ROOT)).replace("\\", "/")
        except ValueError: key = "/assets/img/" + slug   # папка вне сайта: адрес как будто она в assets/img
        manifest[key] = {"w": w, "h": h, "ratio": round(w / h, 4)}
        print(f"{f}  ->  {key}  ({w}×{h})")
    out.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1, sort_keys=True))
    print(f"готово: {len(files)} картинок, адреса и пропорции — в {manifest_path}")


def avatar(path, name, cx, cy, size, px=336):
    im = prepare(Image.open(path)).convert("L")
    W, H = im.size
    s = size * W
    box = (int(cx * W - s / 2), int(cy * H - s / 2), int(cx * W + s / 2), int(cy * H + s / 2))
    c = ImageOps.autocontrast(im.crop(box).resize((px, px), Image.LANCZOS), cutoff=1)
    dst = ROOT / "assets" / f"{name}.jpg"
    c.save(dst, quality=92)
    print("аватар:", dst.relative_to(ROOT), f"— на развилке: data-photo=\"/assets/{name}.jpg\"")


if __name__ == "__main__":
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument("src", nargs="?", help="папка с картинками проектов")
    a.add_argument("--out", default=str(ROOT / "assets" / "img"))
    a.add_argument("--avatar"); a.add_argument("--name")
    a.add_argument("--cx", type=float, default=.5); a.add_argument("--cy", type=float, default=.42); a.add_argument("--size", type=float, default=.65)
    o = a.parse_args()
    if o.avatar:
        if not o.name: sys.exit("для аватара нужно --name, например --name nab")
        avatar(o.avatar, o.name, o.cx, o.cy, o.size)
    elif o.src:
        process_folder(o.src, o.out)
    else:
        a.print_help()
