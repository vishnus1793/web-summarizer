// src/services/storageService.js
import { supabase } from "../lib/supabaseClient";

export async function uploadJson(bucket, path, jsonData) {
  const file = new Blob([JSON.stringify(jsonData)], { type: "application/json" });

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw error;
  return data;
}

export async function downloadJson(bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;

  const text = await data.text();
  return JSON.parse(text);
}

export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
