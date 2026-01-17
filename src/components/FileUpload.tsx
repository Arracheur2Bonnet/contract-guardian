import { useCallback, useState } from "react";
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  file: File | null;
  error: string | null;
}

const FileUpload = ({ onFileSelect, file, error }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Seuls les fichiers PDF sont acceptés";
    }
    if (file.size > 10 * 1024 * 1024) {
      return "Le fichier ne doit pas dépasser 10 MB";
    }
    return null;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        const validationError = validateFile(droppedFile);
        if (validationError) {
          onFileSelect(null);
          return;
        }
        onFileSelect(droppedFile);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        onFileSelect(null);
        return;
      }
      onFileSelect(selectedFile);
    }
  };

  const removeFile = () => {
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden
            ${isDragging 
              ? "border-primary bg-accent shadow-lg scale-[1.02]" 
              : "border-border hover:border-primary/50 hover:bg-accent/50 hover:shadow-md"
            }
          `}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 opacity-50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          </div>
          
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-5">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragging 
                ? "bg-primary text-white scale-110 shadow-lg" 
                : "bg-gradient-to-br from-primary/10 to-primary/5 text-primary"
            }`}>
              <Upload size={32} />
            </div>
            <div>
              <p className="font-semibold text-lg mb-2">
                Glissez-déposez votre contrat PDF
              </p>
              <p className="text-sm text-muted-foreground">
                ou cliquez pour sélectionner un fichier (max 10 MB)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-success" />
                PDF uniquement
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-success" />
                Max 50 pages
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-success" />
                100% confidentiel
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-border/50 rounded-2xl p-5 bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <p className="font-semibold">{file.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 size={12} />
                    Prêt pour l'analyse
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"
            >
              <X size={18} />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-xl">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;