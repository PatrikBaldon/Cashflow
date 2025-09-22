const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  console.log('🎨 Generating application icons...');
  
  try {
    // Read the source PNG image
    const sourceImage = sharp('cassa_fds.png');
    
    // Get image metadata
    const metadata = await sourceImage.metadata();
    console.log(`📐 Source image: ${metadata.width}x${metadata.height} pixels`);
    
    // Generate different sizes for different platforms
    const sizes = [
      { size: 16, name: 'icon-16.png' },
      { size: 32, name: 'icon-32.png' },
      { size: 48, name: 'icon-48.png' },
      { size: 64, name: 'icon-64.png' },
      { size: 128, name: 'icon-128.png' },
      { size: 256, name: 'icon-256.png' },
      { size: 512, name: 'icon-512.png' },
      { size: 1024, name: 'icon-1024.png' }
    ];
    
    // Generate PNG icons
    for (const { size, name } of sizes) {
      await sourceImage
        .resize(size, size, { 
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(name);
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }
    
    // Create ICO file for Windows (multi-size)
    const icoSizes = [16, 32, 48, 64, 128, 256];
    const icoBuffers = [];
    
    for (const size of icoSizes) {
      const buffer = await sourceImage
        .resize(size, size, { 
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();
      icoBuffers.push({ size, buffer });
    }
    
    // For now, just use the 256x256 as ICO (electron-builder will handle proper ICO creation)
    await sourceImage
      .resize(256, 256, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile('icon.ico');
    console.log('✅ Generated icon.ico (256x256)');
    
    // Create ICNS for macOS (electron-builder will handle proper ICNS creation)
    await sourceImage
      .resize(512, 512, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile('icon.icns');
    console.log('✅ Generated icon.icns (512x512)');
    
    // Create main icon.png for Linux
    await sourceImage
      .resize(512, 512, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile('icon.png');
    console.log('✅ Generated icon.png (512x512)');
    
    console.log('🎉 All icons generated successfully!');
    console.log('\n📦 Generated files:');
    console.log('   • icon.png - Linux AppImage');
    console.log('   • icon.ico - Windows installer');
    console.log('   • icon.icns - macOS DMG');
    console.log('   • Various PNG sizes for different uses');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

// Run the icon generation
generateIcons();
