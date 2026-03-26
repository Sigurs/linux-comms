## Context

electron-builder's GitHub publisher creates a GitHub Release tagged `v{version}` (e.g. `v26.326.1`) and uploads build artifacts to it. It reads `GH_TOKEN` from the environment. The `--publish always` flag tells it to publish unconditionally (rather than only when a tag push is detected). Without `--publish always`, electron-builder v26 prints a deprecation warning and may skip publishing in v27+.

GitHub Actions requires the `contents: write` permission on the job to allow creating releases and uploading release assets.

## Goals / Non-Goals

**Goals:**
- AppImage published to a permanent, versioned GitHub Release on every master push
- Direct download without zip extraction

**Non-Goals:**
- Draft or pre-release modes (all releases are published immediately)
- Release notes or changelogs (out of scope)

## Decisions

**Use electron-builder's built-in GitHub publisher**

It handles tag creation, release creation, and asset upload in one step. No extra workflow steps needed. The `publish.provider: "github"` config in `package.json` is sufficient alongside `--publish always`.

**`releaseType: "release"`**

Publishes as a full release (not draft or pre-release). Combined with CalVer versioning, every CI build produces a named release like `v26.326.1`.

**Remove `upload-artifact` step**

The GitHub Release is a better distribution target. Keeping `upload-artifact` alongside would create redundancy. Removing it keeps the workflow clean.

## Risks / Trade-offs

- [Many releases] Every master push creates a new release. With active development this could generate many releases. → Acceptable; releases are cheap and CalVer versions are meaningful.
- [Tag collision] If the same CalVer version is somehow generated twice (e.g. counter cache miss), electron-builder will fail to create the release. → Mitigated by the CI counter cache; extremely unlikely.
