# File Embed Guide

bunnybox files now automatically embed on social media platforms and other websites!

## Supported Platforms

When you share a bunnybox file link, it will automatically embed on:

- ✅ **Discord** - Images, videos, and audio files
- ✅ **Twitter/X** - Images with preview cards
- ✅ **Facebook** - Images and videos
- ✅ **Slack** - Images and media previews
- ✅ **Telegram** - Images and videos
- ✅ **Reddit** - Image and video previews
- ✅ **iMessage** - Rich previews
- ✅ **Any platform that supports Open Graph**

## How It Works

bunnybox uses **Open Graph (OG) tags** and **Twitter Card tags** to provide rich previews:

### For Images:
- Full image preview shown
- Filename as title
- File size and uploader info
- Click to view full size

### For Videos:
- Video player embed (platform-dependent)
- Thumbnail preview
- File information

### For Audio:
- Audio player embed (platform-dependent)
- File information

### For Other Files:
- Summary card with filename
- File size and uploader
- Download button

## Testing Embeds

### Discord
1. Upload a file to bunnybox
2. Copy the file URL (e.g., `https://bunnybox.moe/f/abc123`)
3. Paste it in Discord
4. Discord will automatically generate a rich embed

### Twitter
1. Share the file URL in a tweet
2. Twitter will show a card with the image/video preview

### Testing Locally
Use these tools to test how embeds will look:
- **Discord Embed Tester**: Paste URL in a Discord server
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Open Graph Debugger**: https://www.opengraph.xyz/

## Technical Details

### Meta Tags
bunnybox automatically adds:
- `og:title` - Filename
- `og:description` - File info
- `og:url` - File URL
- `og:image` - For images
- `og:video` - For videos
- `og:audio` - For audio
- `twitter:card` - Twitter-specific tags

### Content Delivery
- Media files are served with `inline` disposition (viewable in browser)
- Other files use `attachment` disposition (download)
- CORS headers enabled for cross-origin embeds
- Aggressive caching (1 year) for performance

### Supported File Types

**Images:**
- JPG, PNG, GIF, WebP, BMP, SVG, ICO
- Shows full preview in most platforms

**Videos:**
- MP4, WebM, MOV, AVI
- Shows video player (platform-dependent)
- Some platforms may show thumbnail only

**Audio:**
- MP3, WAV, OGG, M4A
- Shows audio player (platform-dependent)

**Other:**
- Shows summary card with file info
- Download button

## Privacy Note

When you share a bunnybox file link:
- The file becomes publicly accessible via that link
- Anyone with the link can view/download the file
- Embed metadata includes filename and uploader username
- View counts are tracked

## Production Setup

For embeds to work in production:

1. **Set Base URL** in `.env.local`:
   ```bash
   NEXT_PUBLIC_BASE_URL=https://bunnybox.moe
   ```

2. **Update for Netlify deployment**:
   Add to Netlify environment variables:
   ```
   NEXT_PUBLIC_BASE_URL=https://bunnybox.moe
   ```

3. **Deploy** and test embeds!

## Troubleshooting

### Embeds not showing?
- Wait 5-10 minutes for platforms to cache
- Clear platform's cache (Discord: delete and re-post)
- Check file is publicly accessible
- Verify BASE_URL is set correctly

### Video embeds not playing?
- Some platforms only show thumbnails for videos
- Video format must be supported by the platform
- File size may be too large for some platforms

### Twitter cards not working?
- Use Twitter Card Validator to check
- May take a few minutes to cache
- Ensure file is publicly accessible

## Examples

Share these URLs and see how they embed:

- Image: `https://bunnybox.moe/f/abc123`
- Video: `https://bunnybox.moe/f/xyz789`
- Audio: `https://bunnybox.moe/f/audio01`

Enjoy automatic rich embeds! 🎨✨
