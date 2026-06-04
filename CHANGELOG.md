# Change Log

All notable changes to the "SVG Compress Helper" extension will be documented in this file.

## [1.0.0] - 2026-06-02

### Added
- Initial release of SVG Compress Helper
- SVG compression using SVGO 4.0+
- Monochrome SVG conversion with color attribute removal
- Batch processing support for multiple SVG files
- Auto-detection of SVGO configuration files
- Right-click context menu integration
- Detailed compression statistics and results
- Progress feedback during batch operations
- Comprehensive error handling
- Unit and integration tests

### Features
- **Compress SVG**: Standard SVGO compression with default or custom config
- **Compress to Monochrome SVG**: Remove color attributes while preserving `currentColor`
- **Batch Processing**: Process multiple SVG files simultaneously
- **Configuration Auto-Load**: Automatically detect and use project SVGO config files
- **Detailed Feedback**: View compression statistics including size reduction percentage

### Technical Details
- Built with TypeScript 5.0+
- Uses SVGO 4.0.1
- Compatible with VSCode 1.96.0+
- Supports Node.js 20.0+
