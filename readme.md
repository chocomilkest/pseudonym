# pseudonym (the internal name)
this is a little website i made for my family cuz alias games on app store and google play just money-grabbing bullshit  
the src is in english, but the ui and the words arent, feel free to fork this if you wanna make this an actual multilingual website

## how to build
Requires Node.js 22+, npm, and Python 3 for the local server.

```sh
npm ci
npm run check
npm test
npm run build
python3 -m http.server 8080 -d build
```

Open http://localhost:8080. The `build/` directory contains the complete static site.
Settings are saved automatically. Separate custom words with commas, semicolons,
or new lines; spaces within a phrase are preserved.
