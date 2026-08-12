const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.storage.createBucket('property-images', {
    public: true,
  });
  if (error) {
    console.log('Bucket may already exist:', error.message);
  } else {
    console.log('Bucket created successfully:', data);
  }
}
main();
