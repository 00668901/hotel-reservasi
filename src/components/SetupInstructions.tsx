import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface SetupInstructionsProps {
  dbError: boolean;
  projectId: string;
  publicAnonKey: string;
}

export function SetupInstructions({ dbError, projectId, publicAnonKey }: SetupInstructionsProps) {
  if (!dbError) return null;

  return (
    <Dialog open={dbError}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            <DialogTitle>Setup Database - Langkah Terakhir!</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Belum Siap</AlertTitle>
            <AlertDescription>
              Aplikasi memerlukan tabel database untuk menyimpan data. Silakan ikuti langkah berikut:
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Buka Supabase Dashboard</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Klik tombol di bawah untuk membuka database Anda
                </p>
                <Button
                  onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId.split('.')[0]}/editor`, '_blank')}
                  className="mt-2"
                >
                  Buka SQL Editor
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Jalankan SQL Query</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Copy dan paste query berikut ke SQL Editor, lalu klik "Run"
                </p>
                <div className="bg-muted p-4 rounded-md text-sm font-mono overflow-x-auto">
                  <pre>{`CREATE TABLE IF NOT EXISTS kv_store_aa71f191 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);`}</pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS kv_store_aa71f191 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);`);
                  }}
                >
                  Copy Query
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Refresh Halaman</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Setelah query berhasil dijalankan, refresh halaman ini
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  Refresh Halaman
                </Button>
              </div>
            </div>
          </div>

          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Setelah Setup Selesai</AlertTitle>
            <AlertDescription className="text-green-800">
              Aplikasi akan otomatis membuat 6 tipe kamar hotel dan siap digunakan!
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}