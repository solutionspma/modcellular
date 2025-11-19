#!/bin/bash

# Mod Cellular App Icon Generator
# Creates a 1024x1024 Quantum Mesh Diamond icon

OUTPUT_DIR="ModCellularNative/ios/ModCellularNative/Assets.xcassets/AppIcon.appiconset"
LAUNCH_DIR="ModCellularNative/ios/ModCellularNative/Assets.xcassets/launch-icon.imageset"

# Create 1024x1024 base icon using ImageMagick
convert -size 1024x1024 xc:black \
  -fill none \
  -stroke "#00F6FF" -strokewidth 3 \
  -draw "translate 512,512 rotate 45 rectangle -150,-150 150,150" \
  -stroke "#FF00F5" -strokewidth 3 \
  -draw "translate 512,512 rotate 45 line -120,-120 120,120" \
  -draw "translate 512,512 rotate 45 line -120,120 120,-120" \
  -stroke "#00F6FF" -strokewidth 2 \
  -draw "translate 512,512 circle 0,0 0,200" \
  -blur 0x10 \
  "$OUTPUT_DIR/icon-1024.png"

echo "✅ Generated: $OUTPUT_DIR/icon-1024.png"

# Generate all required iOS sizes
sips -z 40 40 "$OUTPUT_DIR/icon-1024.png" --out "$OUTPUT_DIR/icon-20@2x.png"
sips -z 60 60 "$OUTPUT_DIR/icon-1024.png" --out "$OUTPUT_DIR/icon-20@3x.png"
sips -z 58 58 "$OUTPUT_DIR/icon-1024.png" --out "$OUTPUT_DIR/icon-29@2x.png"
sips -z 87 87 "$OUTPUT_DIR/icon-1024.png" --out "$OUTPUT_DIR/icon-29@3x.png"
sips -z 80 80 "$OUTPUT_DIR/icon-1024.png" --out "$OUTPUT_DIR/icon-40@2x.png"
sips -z 120 120 "$OUTPUT_DIR/icon-1024.png" --out "$OUTPUT_DIR/icon-40@3x.png"
sips -z 120 120 "$OUTPUT_DIR/icon-1024.png" --out "$OUTPUT_DIR/icon-60@2x.png"
sips -z 180 180 "$OUTPUT_DIR/icon-1024.png" --out "$OUTPUT_DIR/icon-60@3x.png"

echo "✅ Generated all iOS icon sizes"

# Generate launch screen icons
sips -z 512 512 "$OUTPUT_DIR/icon-1024.png" --out "$LAUNCH_DIR/launch-icon.png"
sips -z 1024 1024 "$OUTPUT_DIR/icon-1024.png" --out "$LAUNCH_DIR/launch-icon@2x.png"
sips -z 1536 1536 "$OUTPUT_DIR/icon-1024.png" --out "$LAUNCH_DIR/launch-icon@3x.png"

echo "✅ Generated all launch screen icons"
echo ""
echo "🚀 Icon generation complete!"
echo "   Open Xcode to verify: ModCellularNative.xcworkspace"
