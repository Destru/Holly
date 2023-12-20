#!/bin/sh
cd /Users/alexander/Development/Holly/
md5=($(shasum key.md))
echo $md5 > key.md
git add key.md
git commit -m "$md5"
git push
fly deploy
exit 0
