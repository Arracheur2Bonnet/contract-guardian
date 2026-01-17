import { useCallback, useState } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
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
            border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer
            ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
          `}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Upload className="text-muted-foreground" size={28} />
            </div>
            <div>
              <p className="font-medium mb-1">
                Glissez-déposez votre contrat PDF ici
              </p>
              <p className="text-sm text-muted-foreground">
                ou cliquez pour sélectionner un fichier (max 10 MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="text-primary" size={20} />
              </div>
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              className="h-8 w-8"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 text-destructive text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
