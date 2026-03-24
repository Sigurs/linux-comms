# Icons

Place PNG icons at the following sizes for AppImage/Flatpak packaging:

- `16x16.png`
- `32x32.png`
- `48x48.png`
- `64x64.png`
- `128x128.png`
- `256x256.png`
- `512x512.png`

Convert from the SVG source:

```bash
for size in 16 32 48 64 128 256 512; do
  inkscape --export-filename="${size}x${size}.png" --export-width=$size --export-height=$size ../icon.svg
done
```

Or with ImageMagick:

```bash
for size in 16 32 48 64 128 256 512; do
  convert -background none -resize ${size}x${size} ../icon.svg ${size}x${size}.png
done
```
