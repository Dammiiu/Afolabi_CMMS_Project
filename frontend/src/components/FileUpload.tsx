import React, { useState } from 'react';
import { UploadCloud, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  maxSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, maxSizeMB = 5 }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File is too large. Max size is ${maxSizeMB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onFileSelect(file);
  };

  const removeFile = () => {
    setPreview(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative w-32 h-32 rounded-lg border border-slate-200 overflow-hidden group">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={removeFile}
              className="bg-white rounded-full p-1 text-red-500 hover:bg-red-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
            <p className="mb-2 text-sm text-slate-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-400">PNG, JPG or JPEG (MAX. {maxSizeMB}MB)</p>
          </div>
          <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
        </label>
      )}
    </div>
  );
};

export default FileUpload;
