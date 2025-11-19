import supabase from '../utilities/supabase';

export async function uploadFile(
  filePath: string,
  fileName: string,
  mimeType: string
): Promise<string | null> {
  try {
    const fileData = await fetch(filePath);
    const blob = await fileData.blob();

    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, blob, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

export async function deleteFile(fileName: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('media')
      .remove([fileName]);

    return !error;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
}
