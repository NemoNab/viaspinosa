#!/usr/bin/env bash
# Готовит шоурил для сайта: MP4 (H.264 + AAC), до 1080p, с быстрым стартом в браузере,
# и картинку-постер с 3-й секунды. Метаданные (камера, геометка, дата) вырезаются.
#
#   tools/reel.sh исходник.mov showreel-2025-2026
#   → showreel-2025-2026.mp4 и showreel-2025-2026.jpg рядом с исходником
#
# Качество: CRF 22 (меньше — лучше и тяжелее). Для финальной версии можно
#   QUALITY=best tools/reel.sh …   (медленнее в 2–3 раза, файл чуть легче при том же виде)
set -euo pipefail
in="${1:?укажи исходный файл}"; name="${2:?укажи имя, например showreel-2025-2026}"
dir="$(dirname "$in")"; out="$dir/$name.mp4"; poster="$dir/$name.jpg"
preset=veryfast; [ "${QUALITY:-}" = "best" ] && preset=slow
ffmpeg -hide_banner -y -i "$in" -map_metadata -1 -map 0:v:0 -map 0:a:0? \
  -vf "scale='min(1920,iw)':-2" -c:v libx264 -preset "$preset" -crf 22 -pix_fmt yuv420p \
  -c:a aac -b:a 160k -movflags +faststart "$out"
ffmpeg -hide_banner -y -ss 3 -i "$out" -frames:v 1 -vf "scale='min(1600,iw)':-2" -q:v 3 "$poster"
ls -lh "$out" "$poster"
