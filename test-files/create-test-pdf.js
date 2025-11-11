const fs = require('fs');

// Crea un PDF molto semplice usando un approccio basico
const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
100 700 Td
(Gianmario Iamoni - Full Stack Developer) Tj
0 -20 Td
(Email: gianmario.iamoni@example.com) Tj
0 -20 Td
(Phone: +39 123 456 7890) Tj
0 -40 Td
(EXPERIENCE:) Tj
0 -20 Td
(- Senior Full Stack Developer at TechCorp (2020-2024)) Tj
0 -20 Td
(- Frontend Developer at WebAgency (2018-2020)) Tj
0 -20 Td
(- Junior Developer at StartupXYZ (2016-2018)) Tj
0 -40 Td
(SKILLS:) Tj
0 -20 Td
(- JavaScript, TypeScript, React, Next.js) Tj
0 -20 Td
(- Node.js, Express, PostgreSQL) Tj
0 -20 Td
(- AWS, Docker, Kubernetes) Tj
0 -20 Td
(- Git, CI/CD, Agile methodologies) Tj
0 -40 Td
(EDUCATION:) Tj
0 -20 Td
(- Computer Science Degree, University of Milan (2012-2016)) Tj
0 -20 Td
(- Full Stack Bootcamp, TechAcademy (2016)) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000271 00000 n 
0000000520 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
617
%%EOF`;

fs.writeFileSync('test-cv.pdf', pdfContent);
console.log('PDF creato: test-cv.pdf');
