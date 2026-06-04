# SVG Compress Helper

A VSCode extension for SVG file compression and monochrome conversion based on SVGO 4.0+.

## Features

### SVG Compression
- Compress SVG files using SVGO default configuration
- Right-click menu integration
- Detailed compression results with size comparison
- Complete error handling
- **Visual preview panel** showing before/after comparison for single file compression

### Monochrome SVG Conversion
- Remove all color attributes during compression
- Preserve `currentColor` for parent element color inheritance
- Support batch processing of multiple SVG files
- Visual preview of color removal results

### Visual Preview Panel
- Automatically opens preview panel when compressing a single SVG file
- Side-by-side comparison of original and optimized SVG
- Displays compression statistics (size before/after, percentage saved)
- Interactive SVG rendering in VSCode

### Batch Processing
- Select multiple SVG files for batch compression
- Automatically filter non-SVG files
- Progress feedback during processing
- Detailed results summary

### Configuration Support
- Auto-detect and use project SVGO configuration files
- Support for `svgo.config.js`, `svgo.config.mjs`, `svgo.config.cjs`, `.svgo.yml`, `.svgorc`, `.svgorc.js`
- Fall back to SVGO default configuration when no config file is found

## Installation

### From VSIX File
1. Open VSCode
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Install from VSIX" and select "Extensions: Install from VSIX..."
4. Navigate to the `.vsix` file and select it

### From Source
```bash
git clone <repository-url>
cd svg-compress-helper
npm install
npm run compile
npm run package
```

## Usage

### Compress SVG
1. Right-click on one or more SVG files in the file explorer
2. Select "Compress SVG" from the context menu
3. View compression results in the output panel

### Compress to Monochrome SVG
1. Right-click on one or more SVG files in the file explorer
2. Select "Compress to Monochrome SVG" from the context menu
3. The compressed monochrome SVG will replace the original file

## Configuration

The extension automatically searches for SVGO configuration files in your project root. Supported configuration files (in order of priority):

1. `svgo.config.js`
2. `svgo.config.mjs`
3. `svgo.config.cjs`
4. `.svgo.yml`
5. `.svgorc`
6. `.svgorc.js`

If no configuration file is found, the extension uses SVGO's default configuration.

### Example SVGO Configuration

```javascript
// svgo.config.js
module.exports = {
  plugins: [
    {
      name: 'removeDoctype',
      active: true,
    },
    {
      name: 'removeComments',
      active: true,
    },
    {
      name: 'removeUnusedNS',
      active: true,
    },
  ],
};
```

## Commands

- `svg-compress-helper.compressSvg`: Compress selected SVG file(s)
- `svg-compress-helper.compressToMono`: Compress and convert to monochrome SVG

## Requirements

- VSCode 1.96.0 or higher
- Node.js 18.0 or higher

## Known Issues

- Large SVG files (>10MB) may take longer to process
- Some complex SVG structures may not be fully optimized for monochrome conversion

## Release Notes

### 1.0.0

Initial release:
- SVG compression using SVGO 4.0+
- Monochrome SVG conversion
- Batch processing support
- Auto-detection of SVGO configuration files
- Detailed compression statistics

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have feature requests, please open an issue on the GitHub repository.
