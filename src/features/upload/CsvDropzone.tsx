import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.js";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import { cn } from "@/lib/utils.js";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, FileSpreadsheet, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";

export interface CsvDropzoneProps {
  onFileLoaded: (content: string) => void;
  onClearError?: () => void;
  error: string | null;
  isLoading?: boolean;
}

export function CsvDropzone({
  onFileLoaded,
  onClearError,
  error,
  isLoading = false,
}: CsvDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const readFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv") && !file.name.match(/\.(csv|txt)$/i)) {
        onFileLoaded("");
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onFileLoaded(text ?? "");
      };
      reader.readAsText(file, "UTF-8");
    },
    [onFileLoaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) readFile(file);
    },
    [readFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) readFile(file);
      e.target.value = "";
    },
    [readFile],
  );

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300",
        "hover:ring-2 hover:ring-blue-400/40",
        isDragOver && "ring-2 ring-blue-500/50",
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Importer un CSV
        </CardTitle>
        <CardDescription className="space-y-2">
          <p>Glissez-déposez un fichier CSV (séparateur ;) ou cliquez pour parcourir.</p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <b className="text-foreground">Colonnes supportées :</b>
            <span className="inline-flex flex-wrap items-center gap-1.5">
              {["name", "isin", "quantity", "buyingPrice", "lastPrice", "amount", "variation"].map(
                (col) => (
                  <Badge
                    key={col}
                    variant="secondary"
                    className="font-mono text-[10px] font-normal bg-muted text-muted-foreground border-muted-foreground/20"
                  >
                    {col}
                  </Badge>
                )
              )}
            </span>
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <b className="text-foreground">Optionnelles :</b>
            <span className="inline-flex flex-wrap items-center gap-1.5">
              {["intradayVariation", "amountVariation", "lastMovementDate"].map(
                (col) => (
                  <Badge
                    key={col}
                    variant="secondary"
                    className="font-mono text-[10px] font-normal bg-muted text-muted-foreground border-muted-foreground/20"
                  >
                    {col}
                  </Badge>
                )
              )}
            </span>
          </p>
          <p className="text-muted-foreground">Nombres avec virgule ou espace acceptés.</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 transition-colors duration-200",
            "hover:border-blue-400 hover:bg-blue-500/10",
            isDragOver && "border-blue-500 bg-blue-500/15",
          )}
        >
          <input
            type="file"
            accept=".csv,.txt,text/csv"
            onChange={handleInputChange}
            className="hidden"
          />
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="h-12 w-12 animate-pulse rounded-full bg-primary/20" />
                <span className="text-sm text-muted-foreground">
                  Chargement…
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="rounded-2xl bg-primary/10 p-4">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <p className="text-center text-sm font-medium text-foreground">
                  {fileName ? fileName : "Glissez votre fichier ici ou cliquez"}
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  CSV (;) : name, ISIN, quantity, buyingPrice, lastPrice,
                  amount, variation
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </label>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Alert variant="destructive" className="rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription className="flex items-center justify-between gap-2">
                  <span>{error}</span>
                  {onClearError && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={onClearError}
                      aria-label="Fermer"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
