import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/client';
import { IncomingForm, Fields, Files } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const form = new IncomingForm();
    form.parse(req, async (err, fields: Fields, files: Files) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error parsing form data' });
        return;
      }

      // You can now use the `fields` and `files` objects if needed
      console.log('Form fields:', fields);
      console.log('Form files:', files);

      const file = files.file as any; // Assuming you have a file field named 'file'

      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }


      try {
        // Upload the file to Supabase Storage
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(`public/${file.originalFilename}`, file.filepath, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          console.error(error);
          res.status(500).json({ error: 'Error uploading file' });
          return;
        }

        // Insert the file metadata into a Supabase table
        const { error: insertError } = await supabase.from('documents').insert({
          filename: file.originalFilename,
          file_url: data.path,
          // Add any other relevant metadata fields here
        });

        if (insertError) {
          console.error(insertError);
          res.status(500).json({ error: 'Error saving file metadata' });
        } else {
          res.status(200).json({ message: 'File uploaded and metadata saved' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}