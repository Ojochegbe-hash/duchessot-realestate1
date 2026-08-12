const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('AdminTestimonials')) {
  content = content.replace(
    "import AdminVideos from './pages/admin/AdminVideos';",
    "import AdminVideos from './pages/admin/AdminVideos';\nimport AdminTestimonials from './pages/admin/AdminTestimonials';"
  );
  content = content.replace(
    '<Route path="videos" element={<AdminVideos />} />',
    '<Route path="videos" element={<AdminVideos />} />\n              <Route path="testimonials" element={<AdminTestimonials />} />'
  );
  fs.writeFileSync('src/App.tsx', content);
  console.log('App.tsx updated');
}
