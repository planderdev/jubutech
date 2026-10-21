"""Fetch exact upstream packages, verify npm integrity, and copy browser assets only."""
from pathlib import Path
import base64, hashlib, io, json, tarfile, urllib.request

ROOT = Path(__file__).resolve().parents[1]
PACKAGES = {
    'swiper': ('12.0.3', ['swiper-bundle.min.js', 'swiper-bundle.min.css', 'LICENSE']),
    'lenis': ('1.3.27', ['dist/lenis.min.js', 'dist/lenis.css', 'LICENSE']),
    'aos': ('2.3.4', ['dist/aos.js', 'LICENSE']),
}
manifest = {}
for name, (version, files) in PACKAGES.items():
    metadata = json.load(urllib.request.urlopen(f'https://registry.npmjs.org/{name}/{version}'))
    assert metadata['version'] == version
    data = urllib.request.urlopen(metadata['dist']['tarball']).read()
    algorithm, expected = metadata['dist']['integrity'].split('-', 1)
    assert base64.b64encode(hashlib.new(algorithm, data).digest()).decode() == expected
    destination = ROOT / f'public/assets/vendor/{name}-{version}'
    destination.mkdir(parents=True, exist_ok=True)
    checksums = {}
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as archive:
        for file in files:
            raw = archive.extractfile('package/' + file).read()
            (destination / Path(file).name).write_bytes(raw)
            checksums[Path(file).name] = hashlib.sha256(raw).hexdigest()
    manifest[name] = {'version': version, 'license': metadata['license'], 'source': metadata['dist']['tarball'], 'integrity': metadata['dist']['integrity'], 'sha256': checksums}
(ROOT / 'public/assets/vendor/manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print(json.dumps({name: item['version'] for name, item in manifest.items()}))
