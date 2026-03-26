## 1. Configure electron-builder GitHub publisher

- [x] 1.1 In `package.json`, add a `publish` block inside the `build` config:
  ```json
  "publish": {
    "provider": "github",
    "releaseType": "release"
  }
  ```

## 2. Update GitHub Actions workflow

- [x] 2.1 Add `permissions: contents: write` to the `build` job in `.github/workflows/build.yml`
- [x] 2.2 Add `--publish always` to the `npx electron-builder --linux AppImage` command
- [x] 2.3 Remove the `Upload AppImage` step (`actions/upload-artifact`)
