const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/PropertyForm.tsx', 'utf8');

const oldSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const propertyData = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        gallery: formData.gallery.split('\\n').map(s => s.trim()).filter(Boolean)
      };

      if (isEditing) {
        const { error } = await supabase.from('properties').update(propertyData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('properties').insert([propertyData]);
        if (error) throw error;
      }
      
      navigate('/admin/properties');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };`;

const newSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const propertyData = {
        ...formData,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        gallery: formData.gallery.split('\\n').map(s => s.trim()).filter(Boolean)
      };

      if (isEditing) {
        const { error } = await supabase.from('properties').update(propertyData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('properties').insert([propertyData]);
        if (error) throw error;
      }
      
      alert("Property saved successfully! It will now reflect on your website.");
      navigate('/admin/properties');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };`;

content = content.replace(oldSubmit, newSubmit);
fs.writeFileSync('src/pages/admin/PropertyForm.tsx', content);
console.log('PropertyForm.tsx updated with alert');
