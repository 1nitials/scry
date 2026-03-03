const fs = require('fs-extra')
const path = require('path')

async function buildExtension() {
  const outDir = path.join(__dirname, '../out')
  const distDir = path.join(__dirname, '../dist')

  await fs.ensureDir(distDir)
  
  if (await fs.pathExists(outDir)) {
    await fs.copy(path.join(outDir, 'index.html'), path.join(distDir, 'index.html'))
    await fs.copy(path.join(outDir, '_next'), path.join(distDir, 'next'))
    
    const html = await fs.readFile(path.join(distDir, 'index.html'), 'utf8')
    const updated = html.replace(/\/_next\//g, '/next/')
    await fs.writeFile(path.join(distDir, 'index.html'), updated)
  }
  
  await fs.copy(path.join(__dirname, '../manifest.json'), path.join(distDir, 'manifest.json'))
  await fs.copy(path.join(__dirname, '../icon.png'), path.join(distDir, 'icon.png'))
  
  console.log('Extension built successfully in dist/')
}

buildExtension().catch(console.error)
