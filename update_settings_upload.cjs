const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Settings.tsx', 'utf8');

const uploadFunction = `
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploadingLogo(true);
      
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setSettings(prev => ({
          ...prev,
          logo_url: reader.result as string
        }));
        setUploadingLogo(false);
      };
      reader.onerror = (error) => {
        console.error('Error converting to Base64:', error);
        setUploadingLogo(false);
        alert('Failed to upload logo.');
      };
    } catch (error: any) {
      alert(error.message);
      setUploadingLogo(false);
    }
  };
`;

content = content.replace(
  'const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {',
  uploadFunction + '\n  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {'
);

const uploadButton = `
            <div className="space-y-2 mt-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">Or Upload Logo from computer</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-light"
              />
              {uploadingLogo && <p className="text-sm text-stone-500">Uploading...</p>}
            </div>
`;

content = content.replace(
  '<p className="text-xs text-stone-500 mt-2">Enter an HTML link to an image (Google Drive direct link, Imgur, etc).</p>',
  '<p className="text-xs text-stone-500 mt-2">Enter an HTML link to an image (Google Drive direct link, Imgur, etc).</p>' + uploadButton
);

fs.writeFileSync('src/pages/admin/Settings.tsx', content);
console.log('Settings updated with upload');
