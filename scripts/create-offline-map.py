from PIL import Image, ImageDraw, ImageFilter

source = Image.open("public/prototype-map.png").convert("RGB")

# Keep only the geographic map area from the user-approved zero-light prototype.
offline = source.crop((0, 180, 1100, 1010))

# Remove the prototype's lower-left controls. This region is predominantly ocean.
patch = Image.new("RGB", (190, 190), "#020b15")
patch = patch.filter(ImageFilter.GaussianBlur(18))
offline.paste(patch, (0, 640))

# A gentle edge vignette lets the raster blend into the map canvas.
overlay = Image.new("RGBA", offline.size, (0, 0, 0, 0))
draw = ImageDraw.Draw(overlay)
draw.rectangle((0, 0, offline.width, offline.height), outline=(0, 5, 12, 90), width=10)
offline = Image.alpha_composite(offline.convert("RGBA"), overlay)
offline.save("public/world-offline.png", optimize=True)
