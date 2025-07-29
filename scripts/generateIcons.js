const sharp = require('sharp');
const fs = require('fs');

// Función para convertir SVG a PNG
async function convertSvgToPng(svgPath, pngPath, width, height) {
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    await sharp(svgBuffer)
      .resize(width, height)
      .png()
      .toFile(pngPath);
    console.log(`✅ Generated: ${pngPath} (${width}x${height})`);
  } catch (error) {
    console.error(`❌ Error generating ${pngPath}:`, error.message);
  }
}

// Función principal
async function generateIcons() {
  console.log('🎨 Generating PNG icons from SVG...\n');

  const conversions = [
    // Icon principal
    {
      svg: './assets/images/icon.svg',
      png: './assets/images/icon.png',
      width: 1024,
      height: 1024
    },
    // Splash screen
    {
      svg: './assets/images/splash-icon.svg',
      png: './assets/images/splash-icon.png',
      width: 1200,
      height: 1200
    },
    // Adaptive icon para Android
    {
      svg: './assets/images/adaptive-icon.svg',
      png: './assets/images/adaptive-icon.png',
      width: 512,
      height: 512
    },
    // Favicon
    {
      svg: './assets/images/favicon.svg',
      png: './assets/images/favicon.png',
      width: 32,
      height: 32
    }
  ];

  for (const conversion of conversions) {
    await convertSvgToPng(
      conversion.svg,
      conversion.png,
      conversion.width,
      conversion.height
    );
  }

  console.log('\n🎉 All icons generated successfully!');
}

// Ejecutar el script
generateIcons().catch(console.error);
