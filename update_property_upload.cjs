const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/PropertyForm.tsx', 'utf8');

// Add Image Upload function
const uploadFunction = `
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploadingImage(true);
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = \`\${Math.random()}.\${fileExt}\`;
      const filePath = \`\${fileName}\`;
      
      // We will try to upload to a 'properties' bucket.
      // If it fails, we fall back to base64 so it still works for the user immediately!
      let { error: uploadError, data } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);
        
      if (uploadError) {
        console.warn('Storage upload failed, falling back to Base64:', uploadError.message);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setFormData(prev => ({
            ...prev,
            gallery: prev.gallery ? prev.gallery + '\\n' + reader.result : reader.result as string
          }));
          setUploadingImage(false);
        };
        reader.onerror = (error) => {
          console.error('Error converting to Base64:', error);
          setUploadingImage(false);
          alert('Failed to upload image. Please try a smaller image or use a URL.');
        };
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);
        
      setFormData(prev => ({
        ...prev,
        gallery: prev.gallery ? prev.gallery + '\\n' + publicUrl : publicUrl
      }));
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploadingImage(false);
    }
  };
`;

content = content.replace(
  'const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {',
  uploadFunction + '\n  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {'
);

const uploadButton = `
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Upload Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-light"
              />
              {uploadingImage && <p className="text-sm text-stone-500">Uploading...</p>}
            </div>
`;

content = content.replace(
  '<div className="space-y-2">\n              <label className="text-sm font-medium text-stone-700">Image Gallery URLs (One per line)</label>',
  uploadButton + '\n            <div className="space-y-2">\n              <label className="text-sm font-medium text-stone-700">Image Gallery URLs (One per line)</label>'
);

fs.writeFileSync('src/pages/admin/PropertyForm.tsx', content);
console.log('PropertyForm updated with upload');
