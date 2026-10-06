#!/usr/bin/env python3
"""Mirror the live dataset at https://cinchstack.com/data/ to a Hugging Face dataset.

Downloads the three files the site serves right now, writes the dataset card from
scripts/assets/dataset-card.md, and uploads all four. Hugging Face skips the commit when
nothing changed, so the Dataset mirror workflow can run it after every deploy.

  HF_TOKEN    a Hugging Face write token (not needed with --dry-run)
  HF_DATASET  the dataset to publish to (default: <token owner>/cinchstack-software-pricing)
  --dry-run   write the folder to ./mirror-out and stop
"""
import csv
import datetime
import io
import json
import os
import pathlib
import sys
import tempfile
import urllib.request

SITE = 'https://cinchstack.com/data/'
FILES = ['pricing.csv', 'scenarios.csv', 'pricing.json']
CARD = pathlib.Path(__file__).parent / 'assets' / 'dataset-card.md'


def fetch(name):
    req = urllib.request.Request(SITE + name, headers={'User-Agent': 'cinchstack-dataset-mirror'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def rows(data):
    return sum(1 for _ in csv.DictReader(io.StringIO(data.decode('utf-8'))))


def build(out):
    files = {name: fetch(name) for name in FILES}
    meta = json.loads(files['pricing.json'])
    checked = datetime.date.fromisoformat(meta['lastChecked'])
    card = (CARD.read_text(encoding='utf-8')
            .replace('{{tools}}', str(len(meta['tools'])))
            .replace('{{plans}}', str(rows(files['pricing.csv'])))
            .replace('{{scenarios}}', str(rows(files['scenarios.csv'])))
            .replace('{{lastChecked}}', f'{checked.day} {checked:%B %Y}'))
    if '{{' in card:
        sys.exit('dataset card still has an unfilled {{placeholder}}')
    for name, data in files.items():
        (out / name).write_bytes(data)
    (out / 'README.md').write_text(card, encoding='utf-8')
    return meta['lastChecked']


if '--dry-run' in sys.argv:
    out = pathlib.Path('mirror-out')
    out.mkdir(exist_ok=True)
    print(f'Built {out}/ from {SITE} (checked {build(out)}); nothing uploaded.')
    sys.exit(0)

from huggingface_hub import HfApi  # only the upload needs it

api = HfApi(token=os.environ['HF_TOKEN'])
repo = os.environ.get('HF_DATASET') or f"{api.whoami()['name']}/cinchstack-software-pricing"
with tempfile.TemporaryDirectory() as d:
    checked = build(pathlib.Path(d))
    api.create_repo(repo, repo_type='dataset', exist_ok=True)
    api.upload_folder(repo_id=repo, repo_type='dataset', folder_path=d,
                      commit_message=f'Sync from cinchstack.com/data (prices checked up to {checked})')
print(f'https://huggingface.co/datasets/{repo}')
