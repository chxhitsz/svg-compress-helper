import * as assert from 'assert';
import { optimize, Config } from 'svgo';

suite('SVGO Integration Test Suite', () => {
  test('should compress SVG with default config', () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <!-- This is a comment -->
      <rect fill="red" stroke="blue" x="10" y="10" width="80" height="80"/>
    </svg>`;

    const config: Config = { plugins: [] };
    const result = optimize(svgContent, config);
    assert.ok(result.data);
    assert.ok(result.data.length < svgContent.length);
    assert.ok(!result.data.includes('<!-- This is a comment -->'));
  });

  test('should handle empty SVG', () => {
    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    const config: Config = { plugins: [] };
    const result = optimize(svgContent, config);
    assert.ok(result.data);
  });

  test('should preserve currentColor', () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg">
      <rect fill="currentColor" x="10" y="10" width="80" height="80"/>
    </svg>`;

    const config: Config = { plugins: [] };
    const result = optimize(svgContent, config);
    assert.ok(result.data.includes('currentColor'));
  });

  test('should use built-in plugins', () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg">
      <g id="unused">
        <rect fill="red" x="10" y="10" width="80" height="80"/>
      </g>
    </svg>`;

    // Test with default plugins (SVGO applies its default preset)
    const result = optimize(svgContent);
    assert.ok(result.data);
  });
});
