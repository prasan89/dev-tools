'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageToolLayout } from '@/components/image-tools/ImageToolLayout';
import { ImageDropzone } from '@/components/image-tools/ImageDropzone';
import { ImageDownloadButton } from '@/components/image-tools/ImageDownloadButton';
import { createObjectUrl, revokeObjectUrl } from '@/lib/image-tools/engine';

export default function BlurClient() {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState('');
  const [output, setOutput] = useState('');
  const [amount, setAmount] = useState(6);
  const [error, setError] = useState('');
  const sourceRef = useRef('');
  const outputRef = useRef('');
  useEffect(() => () => { if(sourceRef.current) revokeObjectUrl(sourceRef.current); if(outputRef.current) revokeObjectUrl(outputRef.current); }, []);
  const onFiles = (files: File[]) => { const next=files[0]; if(!next)return; if(sourceRef.current)revokeObjectUrl(sourceRef.current);if(outputRef.current)revokeObjectUrl(outputRef.current);const url=createObjectUrl(next);sourceRef.current=url;outputRef.current='';setFile(next);setSource(url);setOutput('');setError(''); };
  const process = async () => {
    if(!file)return;
    try {
      const bitmap=await createImageBitmap(file);
      try {
        const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
        const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas is not available.');
        ctx.filter='blur('+amount+'px)';ctx.drawImage(bitmap,0,0);
        const mime=['image/png','image/webp'].includes(file.type)?file.type:'image/jpeg';
        const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not export image.')),mime,.92));
        if(outputRef.current)revokeObjectUrl(outputRef.current);const url=createObjectUrl(blob);outputRef.current=url;setOutput(url);setError('');
      } finally { bitmap.close(); }
    } catch(e){setError(e instanceof Error?e.message:'Could not blur this image.');}
  };
  return <ImageToolLayout title="Blur Image" description="Apply a soft blur to an image with adjustable intensity. Processed locally in your browser.">
    <div className="space-y-5">
      {!file && <ImageDropzone onFiles={onFiles} />}
      {file && <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"><span className="truncate text-sm">{file.name}</span><button onClick={()=>{if(sourceRef.current)revokeObjectUrl(sourceRef.current);if(outputRef.current)revokeObjectUrl(outputRef.current);sourceRef.current='';outputRef.current='';setFile(null);setSource('');setOutput('');}} className="text-sm text-violet-600">Choose another</button></div>}
      {source && <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="flex min-h-64 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800"><img src={output||source} alt="Blurred image preview" className="max-h-[640px] max-w-full object-contain" /></div><section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"><label className="block text-sm">Blur intensity: {amount}px<input type="range" min="1" max="24" value={amount} onChange={e=>setAmount(Number(e.target.value))} className="mt-2 w-full" /></label><button onClick={()=>void process()} className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">Apply blur</button>{output&&<ImageDownloadButton url={output} filename={file!.name.replace(/\.[^.]+$/,'')+'-blurred.'+(file!.type==='image/png'?'png':file!.type==='image/webp'?'webp':'jpg')} className="w-full justify-center" />}{error&&<p role="alert" className="text-sm text-red-600">{error}</p>}<p className="text-xs text-gray-500">Blur is applied to the entire image. This is a visual effect, not a secure redaction method.</p></section></div>}
    </div>
  </ImageToolLayout>;
}
