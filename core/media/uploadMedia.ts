import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../../app/utilities/supabase';

export async function compressImage(uri: string): Promise<string> {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Image compression failed:', error);
    return uri;
  }
}

export async function pickMediaAndSend(
  deviceId: string,
  receiverId: string
): Promise<boolean> {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission denied');
      return false;
    }

    // Pick image/video
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
      allowsEditing: true
    });

    if (result.canceled) return false;

    const asset = result.assets[0];
    let finalUri = asset.uri;
    let mimeType = 'image/jpeg';

    // Compress if image
    if (asset.type === 'image') {
      finalUri = await compressImage(asset.uri);
      mimeType = 'image/jpeg';
    } else {
      mimeType = 'video/mp4';
    }

    // Generate filename
    const fileName = `${deviceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const extension = asset.type === 'image' ? '.jpg' : '.mp4';

    // Upload to Supabase storage
    const url = await uploadFile(finalUri, fileName + extension, mimeType);

    if (!url) {
      console.error('Upload failed');
      return false;
    }

    // Insert message with media
    const { error } = await supabase
      .from('messages')
      .insert({
        sender: deviceId,
        receiver: receiverId,
        content: '',
        media_url: url,
        media_type: asset.type,
        transport_method: 'direct'
      });

    if (error) {
      console.error('Message insert error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('pickMediaAndSend failed:', error);
    return false;
  }
}
