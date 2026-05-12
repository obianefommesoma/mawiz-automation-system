const fs = require('fs');
const path = require('path');

try {
    const logoPath = path.join(__dirname, 'logo.png');
    const placeholderPath = path.join(__dirname, 'placeholder.png');
    const htmlPath = path.join(__dirname, 'index.html');

    if (fs.existsSync(logoPath) && fs.existsSync(placeholderPath) && fs.existsSync(htmlPath)) {
        const logo = fs.readFileSync(logoPath);
        const placeholder = fs.readFileSync(placeholderPath);

        const logoB64 = 'data:image/png;base64,' + logo.toString('base64');
        const placeholderB64 = 'data:image/png;base64,' + placeholder.toString('base64');

        let html = fs.readFileSync(htmlPath, 'utf8');
        
        // Replace all instances of logo.png and placeholder.png
        html = html.replace(/src="logo\.png"/g, `src="${logoB64}"`);
        html = html.replace(/src="placeholder\.png"/g, `src="${placeholderB64}"`);

        fs.writeFileSync(htmlPath, html);
        console.log('Successfully embedded base64 images into index.html');
    } else {
        console.log('Files not found');
    }
} catch (e) {
    console.error('Error:', e);
}
