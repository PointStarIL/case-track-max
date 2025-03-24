
import React, { useState, useEffect } from 'react';
import { useCasesStore } from '@/store/casesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import { 
  Download, 
  FileUp, 
  Link, 
  Save, 
  Settings as SettingsIcon,
  Database,
  RefreshCw,
  ExternalLink,
  Upload,
  FileCode
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { exportData, importData, setWebhookUrl, getWebhookUrl } = useCasesStore();
  const [webhookUrl, setWebhookUrlState] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const storedWebhookUrl = getWebhookUrl();
    setWebhookUrlState(storedWebhookUrl);
  }, [getWebhookUrl]);
  
  const handleSaveWebhook = () => {
    setWebhookUrl(webhookUrl);
    toast.success('Webhook URL saved successfully');
  };
  
  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };
  
  const handleImportData = () => {
    try {
      importData(jsonData);
      toast.success('Data imported successfully');
      setJsonData('');
    } catch (error) {
      toast.error('Failed to import data. Please check the JSON format.');
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setJsonData(event.target?.result as string);
        toast.success('File loaded. Click "Import Data" to confirm.');
      } catch (error) {
        toast.error('Failed to read file. Please try again.');
      }
    };
    reader.readAsText(file);
  };
  
  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast.error('Please enter a webhook URL first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_webhook',
          timestamp: new Date().toISOString(),
          message: 'This is a test from Case Track Max'
        })
      });
      
      toast({
        title: "Webhook Test Sent",
        description: "The request was sent to your Zapier webhook. Please check your Zap's history to confirm it was triggered.",
      });
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast.error('Failed to test webhook. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>
                  Manage general application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <SettingsIcon className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground">
                    Additional settings will be available in future updates
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>
                  Download your case data as a JSON file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Export all your cases, tasks, and settings. Use this for backup or to transfer data to another system.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={handleExportData} className="gap-1">
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Import Data</CardTitle>
                <CardDescription>
                  Import case data from a JSON file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Import cases and tasks from a previously exported JSON file. This will replace all current data.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="file-upload">Upload JSON File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
                {jsonData && (
                  <div className="grid grid-cols-1 gap-2">
                    <Label>Preview</Label>
                    <Textarea
                      value={jsonData}
                      onChange={(e) => setJsonData(e.target.value)}
                      className="font-mono text-xs h-32"
                      disabled
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleImportData} 
                  disabled={!jsonData}
                  className="gap-1"
                >
                  <FileUp className="h-4 w-4" />
                  <span>Import Data</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Zapier Integration</CardTitle>
                <CardDescription>
                  Connect with Zapier to automate workflows
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Enter your Zapier webhook URL to receive notifications about case and task activities.
                  This allows you to trigger workflows in other applications.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrlState(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Create a webhook trigger in Zapier and paste the provided URL here.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Supported events:</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Case created</li>
                    <li>Case updated</li>
                    <li>Case deleted</li>
                    <li>Task created</li>
                    <li>Task completed</li>
                    <li>Task reopened</li>
                  </ul>
                </div>
                
                <div className="flex flex-col space-y-2 p-3 border rounded-md bg-muted/40">
                  <h3 className="text-sm font-medium flex items-center">
                    <FileCode className="h-4 w-4 mr-1" />
                    How to set up Zapier integration
                  </h3>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Create a new Zap in Zapier</li>
                    <li>Select "Webhooks by Zapier" as the trigger app</li>
                    <li>Choose "Catch Hook" as the trigger event</li>
                    <li>Copy the webhook URL provided by Zapier</li>
                    <li>Paste the URL in the field above and save</li>
                    <li>Configure your desired action in Zapier</li>
                  </ol>
                  <a 
                    href="https://zapier.com/apps/webhook" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center mt-2 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Learn more about Zapier webhooks
                  </a>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleTestWebhook}
                  disabled={!webhookUrl || isLoading}
                  className="gap-1"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>Test Webhook</span>
                </Button>
                
                <Button 
                  onClick={handleSaveWebhook}
                  disabled={!webhookUrl}
                  className="gap-1"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Webhook</span>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Google Sheets Integration</CardTitle>
                <CardDescription>
                  Use Google Sheets as a database for your cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <Database className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground">
                    Google Sheets integration will be available in a future update
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
