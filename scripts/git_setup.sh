#!/usr/bin/env bash
set -euo pipefail

REMOTE_URL="https://github.com/RaggedyGreg/monday.git"

git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"
git branch -M main
git fetch origin || true
git pull --rebase origin main || true
git push -u origin main

echo "Remote 'origin' set to $REMOTE_URL and pushed branch 'main'."
