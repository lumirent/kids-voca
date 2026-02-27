import * as fs from 'node:fs';
import * as path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    'Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local',
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadData() {
  try {
    const jsonDir = path.resolve(process.cwd(), 'src', 'data', 'json');
    console.log(`Reading JSON files from ${jsonDir}...`);

    if (!fs.existsSync(jsonDir)) {
      throw new Error(`Directory not found: ${jsonDir}`);
    }

    const files = fs
      .readdirSync(jsonDir)
      .filter((file) => file.endsWith('.json'));
    console.log(`Found ${files.length} JSON files to process.`);

    for (const file of files) {
      const jsonPath = path.join(jsonDir, file);
      console.log(`\n--- Processing file: ${file} ---`);
      const rawData = fs.readFileSync(jsonPath, 'utf-8');
      const vocabData = JSON.parse(rawData);

      console.log(`Found ${vocabData.length} items to process in ${file}.`);

      for (const item of vocabData) {
        console.log(`Processing: ${item.english}`);

        // 1. Convert base64 to buffer
        const base64Data = item.imageData.replace(
          /^data:image\/\w+;base64,/,
          '',
        );
        const buffer = Buffer.from(base64Data, 'base64');

        // Clean filename
        const filename = `${item.english.toLowerCase().replace(/\s+/g, '_')}.jpg`;
        const filePath = `images/${filename}`;

        // 2. Upload image to Supabase Storage
        console.log(`  - Uploading image as ${filename}...`);
        const { error: uploadError } = await supabase.storage
          .from('flashcards')
          .upload(filePath, buffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error(
            `  [ERROR] Failed to upload image for ${item.english}:`,
            uploadError.message,
          );
          continue; // Skip DB insertion if image upload fails
        }

        // 3. Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('flashcards').getPublicUrl(filePath);

        console.log(`  - Image URL: ${publicUrl}`);

        // 4. Insert or Update data into 'words' table
        console.log(`  - Inserting database record...`);

        // First check if the word exists
        const { data: existingWord, error: fetchError } = await supabase
          .from('words')
          .select('id')
          .eq('word', item.english)
          .maybeSingle();

        if (fetchError) {
          console.error(
            `  [ERROR] Failed to check if word exists ${item.english}:`,
            fetchError.message,
          );
          continue;
        }

        let dbError;
        if (existingWord) {
          // Update existing
          const { error } = await supabase
            .from('words')
            .update({
              meaning: item.korean,
              image_url: publicUrl,
            })
            .eq('id', existingWord.id);
          dbError = error;
        } else {
          // Insert new (omit id so it auto-increments if it's serial/identity)
          const { error } = await supabase.from('words').insert([
            {
              word: item.english,
              meaning: item.korean,
              image_url: publicUrl,
            },
          ]);
          dbError = error;
        }

        if (dbError) {
          console.error(
            `  [ERROR] Failed to insert DB record for ${item.english}:`,
            dbError.message,
          );
        } else {
          console.log(`  - Successfully processed ${item.english}`);
        }
      }
    }

    console.log('\nAll tasks completed!');
  } catch (err) {
    console.error('Script failed:', err);
  }
}

uploadData();
