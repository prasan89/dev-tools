'use client';

import { useState } from 'react';
import { ImageToolLayout } from '@/components/image-tools/ImageToolLayout';
import { ImageDropzone } from '@/components/image-tools/ImageDropzone';
import { formatFileSize } from '@/lib/image-tools/engine';

export default function Base64Client() {
  const [file,setFile]=useState<File|null>(null);
  const [data,setData]=useState('');
  const [mode,setMode]=useState<'data-url'|'base64'>('data-url');
  const [error,setError]=useState('');
  const convert=async(files:File[])=>{
    const next=files[0];if(!next)return;
    if(next.size>10*1024*1024){setError('For performance, Base64 conversion is limited to 10 MB per image.');return;}
    try { const dataUrl=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>typeof reader.result==='string'?resolve(reader.result):reject(new Error('Could not read image.'));reader.onerror=()=>reject(new Error('Could not read image.'));reader.readAsDataURL(next);});setFile(next);setData(dataUrl);setError(''); }
    catch(e){setError(e instanceof Error?e.message:'Conversion failed.');}
  };
  const value=mode==='data-url'?data:data.split(',')[1]??'';
  const copy=async()=>{try{await navigator.clipboard.writeText(value);}catch{setError('Clipboard access was blocked. Select and copy the output manually.')}};
  return <ImageToolLayout title="Image to Base64" description="Convert an image into a Base64 string or data URL for HTML, CSS, and JSON. Everything stays on your device.">
    <div className="space-y-5">
      {!file&&<ImageDropzone onFiles={files=>void convert(files)} />}
      {file&&<div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium">{file.name}</p><p className="text-xs text-gray-500">{formatFileSize(file.size)} · {file.type||'unknown type'}</p></div><button onClick={()=>{setFile(null);setData('');setError('')}} className="text-sm text-violet-600">Choose another</button></div><div className="mt-4 flex items-center gap-4"><label className="flex items-center gap-2 text-sm"><input type="radio" checked={mode==='data-url'} onChange={()=>setMode('data-url')} />Data URL</label><label className="flex items-center gap-2 text-sm"><input type="radio" checked={mode==='base64'} onChange={()=>setMode('base64')} />Base64 only</label><button onClick={()=>void copy()} className="ml-auto rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white">Copy</button></div><textarea readOnly value={value} rows={12} className="mt-3 w-full rounded-lg border border-gray-300 p-3 font-mono text-xs dark:border-gray-700 dark:bg-gray-800" /><p className="mt-2 text-xs text-gray-500">{value.length.toLocaleString()} characters. Base64 typically increases payload size by about one third.</p></div>}
      {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">{error}</p>}
    </div>
  </ImageToolLayout>;
}
