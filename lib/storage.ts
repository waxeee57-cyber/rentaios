import { supabaseAdmin } from '@/lib/supabase-admin'

export async function uploadCarPhoto(
  file: File,
  carSlug: string
): Promise<{ url: string } | { error: string }> {
  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const filename = `${carSlug}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`

  const { error } = await supabaseAdmin.storage
    .from('car-photos')
    .upload(filename, file, { contentType: file.type, upsert: false })

  if (error) return { error: error.message }

  const { data } = supabaseAdmin.storage.from('car-photos').getPublicUrl(filename)
  return { url: data.publicUrl }
}
