const puppeteer = require('puppeteer');
const path = require('path');

const files = [
  { html: 'guia-registro-recetas-rcta.html', pdf: 'Guia - Registro Recetas RCTA.pdf' },
  { html: 'guia-consultorio.html', pdf: 'Turni - Guia del Consultorio.pdf' },
  { html: 'roadmap.html', pdf: 'Roadmap y Pendientes.pdf' },
];

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  for (const { html, pdf } of files) {
    const page = await browser.newPage();
    const htmlPath = `file:///${path.resolve(__dirname, '..', html).replace(/\\/g, '/')}`;
    console.log(`Generando ${pdf}...`);
    await page.goto(htmlPath, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: path.resolve(__dirname, '..', pdf),
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    await page.close();
    console.log(`✅ ${pdf} generado`);
  }

  await browser.close();
})();
