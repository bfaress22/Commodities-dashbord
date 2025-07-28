import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import { importWorldBankPinkSheet, hasWorldBankData, getCurrentWorldBankData, clearWorldBankData } from '@/services/worldBankApi';
import { toast } from 'sonner';

interface WorldBankFileImportProps {
  onDataImported: () => void;
}

export default function WorldBankFileImport({ onDataImported }: WorldBankFileImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentData = getCurrentWorldBankData();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Please select a valid Excel file (.xlsx or .xls)');
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setError(null);

    try {
      await importWorldBankPinkSheet(selectedFile);
      
      toast.success('World Bank Pink Sheet imported successfully!', {
        description: `Loaded ${getCurrentWorldBankData()?.commodities.length} commodities from ${selectedFile.name}`
      });
      
      onDataImported();
      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import file';
      setError(errorMessage);
      toast.error('Import failed', {
        description: errorMessage
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = () => {
    clearWorldBankData();
    toast.success('Custom data cleared, loading default data');
    onDataImported();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-green-500', 'bg-green-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-green-500', 'bg-green-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-green-500', 'bg-green-50');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      
      setError(null);
      setSelectedFile(file);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-blue-600" />
          Import World Bank Pink Sheet
        </CardTitle>
        <CardDescription>
          Upload the latest World Bank Commodity Price Data (Pink Sheet) Excel file
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Data Status */}
        {currentData && (
          <div className={`border rounded-lg p-4 ${
            currentData.isDefault 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className={`h-4 w-4 ${
                currentData.isDefault ? 'text-blue-600' : 'text-green-600'
              }`} />
              <span className={`text-sm font-medium ${
                currentData.isDefault ? 'text-blue-800' : 'text-green-800'
              }`}>
                {currentData.isDefault ? 'Default Data Loaded' : 'Custom Data Loaded'}
              </span>
            </div>
            <div className={`text-sm space-y-1 ${
              currentData.isDefault ? 'text-blue-700' : 'text-green-700'
            }`}>
              <p><strong>Source:</strong> {currentData.isDefault ? 'Default World Bank Data' : currentData.fileName}</p>
              <p><strong>Commodities:</strong> {currentData.commodities.length}</p>
              <p><strong>Last Updated:</strong> {currentData.lastUpdated.toLocaleString()}</p>
            </div>
            {!currentData.isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearData}
                className="mt-3 text-red-600 border-red-200 hover:bg-red-50"
              >
                Clear Custom Data
              </Button>
            )}
          </div>
        )}

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            selectedFile 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {selectedFile ? 'File Selected' : 'Drop your Pink Sheet file here'}
            </p>
            <p className="text-sm text-gray-500">
              {selectedFile 
                ? selectedFile.name 
                : 'or click to browse for Excel files (.xlsx, .xls)'
              }
            </p>
          </div>

          <div className="mt-4">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {selectedFile ? 'Change File' : 'Browse Files'}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Import Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Import Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How to get the Pink Sheet:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Visit the World Bank website</li>
            <li>Navigate to "Commodity Markets" section</li>
            <li>Download the latest "Pink Sheet" (Monthly Commodity Price Data)</li>
            <li>Upload the Excel file here</li>
          </ol>
        </div>

        {/* Import Button */}
        {selectedFile && (
          <div className="flex justify-center">
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full max-w-xs"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Pink Sheet
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 