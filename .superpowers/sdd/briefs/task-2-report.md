# Task 2 Report
Status: DONE. Commit 2c63cad "feat: add site and story content loaders".
TDD: tests failed first (module not found), then 3/3 passed; tsc clean.
Files: content/site.json, content/stories.json (3 chapters: duel/expedition/now), src/lib/urls.ts, src/lib/content.ts, tests/urls.test.ts, tests/content.test.ts.
Notes: site.json stores raw-Chinese FB URL; urls.ts applies encodeURI so FACEBOOK_URL matches the percent-encoded test; getSite() returns the encoded URL.
Media: placeholder paths /media/placeholder-*.{mp4,jpg} (files not present); replace per media-curation.md.
Concerns: placeholder media missing; family OK needed for dad's public photos.
