#!/usr/bin/env python3
"""
Generate PWA icons from a source image
Requires: pip install pillow

Usage:
    python generate-icons.py source-icon.png
"""

import sys
from PIL import Image
import os

# Icon sizes needed for PWA and iOS
SIZES = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512]

def generate_icons(source_image_path):
    """Generate all required icon sizes from source image"""

    # Create icons directory if it doesn't exist
    os.makedirs('icons', exist_ok=True)

    try:
        # Open source image
        source = Image.open(source_image_path)

        # Convert to RGBA if necessary
        if source.mode != 'RGBA':
            source = source.convert('RGBA')

        print(f"Generating icons from {source_image_path}...")

        for size in SIZES:
            # Create square canvas
            icon = Image.new('RGBA', (size, size), (0, 0, 0, 0))

            # Resize source image
            resized = source.resize((size, size), Image.Resampling.LANCZOS)

            # Paste resized image
            icon.paste(resized, (0, 0), resized)

            # Save icon
            output_path = f'icons/icon-{size}x{size}.png'
            icon.save(output_path, 'PNG', optimize=True)
            print(f"✓ Generated {output_path}")

        print(f"\n✅ Successfully generated {len(SIZES)} icons!")
        print("\nNext steps:")
        print("1. Review icons in the icons/ directory")
        print("2. Update manifest.json if needed")
        print("3. Deploy to Firebase Hosting")

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python generate-icons.py source-icon.png")
        print("\nExample:")
        print("  python generate-icons.py logo.png")
        sys.exit(1)

    source_image = sys.argv[1]

    if not os.path.exists(source_image):
        print(f"❌ Error: File '{source_image}' not found")
        sys.exit(1)

    generate_icons(source_image)
