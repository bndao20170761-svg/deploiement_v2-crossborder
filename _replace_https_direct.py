import pathlib

root = pathlib.Path(r"c:\Users\babac\Desktop\Babacar Ndao\Master2 GL\deploiement\vesion_2_enda_crossborder")
excluded_dirs = {'.git', '.svn', '.hg', 'node_modules', 'build', 'dist', 'target', '.next', '.cache', '.venv', 'venv', '__pycache__', '.pytest_cache', '.idea', '.vscode'}
binary_exts = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.zip', '.gz', '.tar', '.tgz', '.bz2', '.7z', '.jar', '.war', '.ear', '.ico', '.ttf', '.woff', '.woff2', '.eot', '.mp4', '.mov', '.avi', '.mp3', '.wav', '.exe', '.dll', '.class', '.pyc', '.pyd', '.db', '.sqlite', '.sqlite3', '.so', '.dylib'}
changed = []

for path in root.rglob('*'):
    if not path.is_file():
        continue
    if any(part in excluded_dirs for part in path.parts):
        continue
    if path.suffix.lower() in binary_exts:
        continue
    try:
        text = path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    if 'https://' not in text:
        continue
    new_text = text.replace('https://', 'http://')
    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        changed.append(str(path.relative_to(root)))

print(f'CHANGED={len(changed)}')
for item in changed:
    print(item)
