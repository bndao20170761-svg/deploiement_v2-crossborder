import os
from pathlib import Path

root = Path(r'c:\Users\babac\Desktop\Babacar Ndao\Master2 GL\deploiement\vesion_2_enda_crossborder')
excluded_dirs = {'.git', 'node_modules', 'target', 'build', 'dist', '.idea', '.vscode', '__pycache__'}
excluded_exts = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.pdf', '.jar', '.class', '.war', '.exe', '.dll', '.so', '.zip', '.gz', '.tgz', '.7z', '.mp4', '.mp3', '.woff', '.woff2', '.ttf', '.eot'}
changed = []

for path in root.rglob('*'):
    if not path.is_file():
        continue
    if any(part in excluded_dirs for part in path.parts):
        continue
    ext = path.suffix.lower()
    if ext in excluded_exts:
        continue
    try:
        with path.open('r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
    except Exception:
        continue
    if 'https://' not in text:
        continue
    new_text = text.replace('https://', 'http://')
    if new_text != text:
        with path.open('w', encoding='utf-8', newline='') as f:
            f.write(new_text)
        changed.append(str(path))

print(f'Changed {len(changed)} files')
for p in changed[:200]:
    print(p)
