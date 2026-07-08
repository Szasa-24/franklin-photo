'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { auth, googleAuthProvider } from '@/src/lib/firebase';
import { User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Trash2, Cloud } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';


export default function SchoolUploadPage() {
  const pathname = usePathname();
  const schoolId = pathname.split('/').pop();
  
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<{name: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [existingPhotos, setExistingPhotos] = useState<{id: number, thumbnailPath: string, filename: string}[]>([]);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const [pickerLoaded, setPickerLoaded] = useState(false);
  const [isDriveImporting, setIsDriveImporting] = useState(false);
  
  const [files, setFiles] = useState<{file: File, id: string, progress: number, status: 'pending'|'uploading'|'done'|'error'}[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const token = await u.getIdToken();
        fetchSchoolDetails(token);
        fetchExistingPhotos(token);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [schoolId]);

  const fetchSchoolDetails = async (token: string) => {
    try {
      const res = await fetch(`/api/admin/schools/${schoolId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSchool(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchExistingPhotos = async (token: string) => {
    try {
      const res = await fetch(`/api/admin/schools/${schoolId}/photos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExistingPhotos(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      progress: 0,
      status: 'pending' as const
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  });

  const uploadFiles = async () => {
    if (!user) return;
    const token = await user.getIdToken();

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'done' || files[i].status === 'uploading') continue;

      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));

      const formData = new FormData();
      formData.append('file', files[i].file);
      formData.append('schoolId', schoolId as string);

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (res.ok) {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done', progress: 100 } : f));
        } else {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f));
        }
      } catch (err) {
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f));
      }
    }
    
    fetchExistingPhotos(token);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const confirmDeletePhoto = async (photoId: number) => {
    if (!user) return;
    
    setIsDeleting(photoId);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/photos/${photoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchExistingPhotos(token);
      } else {
        console.error('Hiba történt a kép törlése során.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(null);
      setDeletingPhotoId(null);
    }
  };

  const handleDriveImport = async () => {
    if (!pickerLoaded) {
      alert('Google Drive rendszer töltődik, kérjük várjon.');
      return;
    }
    
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (!accessToken) {
        alert('Nem sikerült azonosítani a Google Drive fiókot.');
        return;
      }

      const view = new (window as any).google.picker.DocsView()
        .setIncludeFolders(true)
        .setMimeTypes('image/png,image/jpeg,image/jpg');

      const pickerOrigin =
        window.location.ancestorOrigins &&
        window.location.ancestorOrigins.length > 0
          ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
          : window.location.origin;

      const picker = new (window as any).google.picker.PickerBuilder()
        .addView(view)
        .enableFeature((window as any).google.picker.Feature.MULTISELECT_ENABLED)
        .setOAuthToken(accessToken)
        .setOrigin(pickerOrigin)
        .setCallback(async (data: any) => {
          if (data.action === (window as any).google.picker.Action.PICKED) {
            setIsDriveImporting(true);
            const driveFiles = data.docs;
            
            for (const doc of driveFiles) {
              const fileId = doc.id;
              const fileName = doc.name;
              
              try {
                const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                  headers: { Authorization: `Bearer ${accessToken}` }
                });
                
                if (res.ok) {
                  const blob = await res.blob();
                  const file = new File([blob], fileName, { type: blob.type });
                  
                  setFiles(prev => [
                    ...prev, 
                    { file, id: Math.random().toString(36).substring(7), progress: 0, status: 'pending' }
                  ]);
                } else {
                  console.error('Nem sikerült letölteni a fájlt:', fileName);
                }
              } catch (err) {
                console.error('Hiba a fájl letöltésekor:', fileName, err);
              }
            }
            setIsDriveImporting(false);
          }
        })
        .build();
      
      picker.setVisible(true);
    } catch (error) {
      console.error('Drive import failed', error);
      setIsDriveImporting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!user) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Hozzáférés megtagadva</div>;

  const pendingCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-20">
      <Script 
        src="https://apis.google.com/js/api.js" 
        onLoad={() => {
          (window as any).gapi.load('picker', () => {
            setPickerLoaded(true);
          });
        }} 
      />

      <nav className="border-b border-neutral-800 bg-neutral-900/50 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-neutral-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="font-medium">
              Franklin Photo <span className="text-neutral-500 font-light mx-2">/</span> {school?.name || 'Betöltés...'}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {deletingPhotoId !== null && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-medium mb-4 text-white">Kép törlése</h3>
              <p className="text-neutral-400 mb-8 leading-relaxed">
                Biztosan törölni szeretné ezt a képet? A művelet <strong>nem vonható vissza</strong>.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setDeletingPhotoId(null)}
                  className="px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 text-white rounded-md transition-colors"
                  disabled={isDeleting === deletingPhotoId}
                >
                  Mégse
                </button>
                <button 
                  onClick={() => confirmDeletePhoto(deletingPhotoId)}
                  className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium hover:bg-red-500 rounded-md transition-colors disabled:opacity-50"
                  disabled={isDeleting === deletingPhotoId}
                >
                  {isDeleting === deletingPhotoId ? 'Törlés folyamatban...' : 'Igen, törlöm'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-light">Új képek feltöltése</h2>
              <button 
                onClick={handleDriveImport}
                disabled={!pickerLoaded || isDriveImporting}
                className="flex items-center gap-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-md transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isDriveImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
                Importálás Google Drive-ból
              </button>
            </div>
            
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-white bg-white/5' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-600 hover:bg-neutral-800/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-neutral-500 mx-auto mb-4" />
              <p className="text-sm font-medium text-white mb-2">Kattintson ide, vagy húzza be a fájlokat</p>
              <p className="text-xs text-neutral-500">JPG, JPEG, PNG támogatott.</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
                <h3 className="font-medium text-sm">Feltöltési lista ({files.length})</h3>
                {pendingCount > 0 && (
                  <button 
                    onClick={uploadFiles}
                    className="bg-white text-black px-4 py-2 text-xs font-medium rounded-md hover:bg-neutral-200 transition-colors"
                  >
                    Összes indítása
                  </button>
                )}
              </div>
              <div className="divide-y divide-neutral-800 max-h-[400px] overflow-y-auto">
                {files.map(f => (
                  <div key={f.id} className="p-3 flex items-center justify-between hover:bg-neutral-800/30 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {f.status === 'done' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      ) : f.status === 'uploading' ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin shrink-0" />
                      ) : f.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-neutral-700 shrink-0" />
                      )}
                      <span className="text-sm truncate text-neutral-300">{f.file.name}</span>
                    </div>
                    {f.status === 'pending' && (
                      <button onClick={() => removeFile(f.id)} className="p-1 text-neutral-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light">Korábban feltöltve</h2>
            <span className="bg-neutral-900 border border-neutral-800 text-xs px-3 py-1 rounded-full text-neutral-400">
              {existingPhotos.length} kép
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {existingPhotos.map(photo => (
              <div key={photo.id} className="relative group aspect-square bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <Image
                  src={photo.thumbnailPath}
                  alt={photo.filename}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                  <button 
                    onClick={() => setDeletingPhotoId(photo.id)}
                    disabled={isDeleting === photo.id}
                    className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white p-3 rounded-full transition-colors disabled:opacity-50"
                    title="Kép törlése"
                  >
                    {isDeleting === photo.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {existingPhotos.length === 0 && (
            <div className="text-center py-16 text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
              Még nincsenek feltöltve képek.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
