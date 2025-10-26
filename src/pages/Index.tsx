import { useState } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { DocumentUpload } from '@/components/DocumentUpload';
import { FacilitySelector } from '@/components/FacilitySelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Building2, History, Shield, Blocks, Key, Send, ExternalLink, AlertCircle } from 'lucide-react';

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [uploadedDocuments, setUploadedDocuments] = useState<
    Array<{ id: number; ipfsCid: string; type: string; timestamp: number }>
  >([]);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<
    Array<{
      id: string;
      timestamp: number;
      documentIds: number[];
      facilityNames: string[];
      txHash: string;
    }>
  >([]);

  const handleWalletConnect = (address: string) => {
    setIsConnected(true);
    setUserAddress(address);
  };

  const handleWalletDisconnect = () => {
    setIsConnected(false);
    setUserAddress('');
    setUploadedDocuments([]);
    setSelectedDocuments([]);
  };

  const handleDocumentUpload = (documentId: number, ipfsCid: string) => {
    setUploadedDocuments((prev) => [
      ...prev,
      {
        id: documentId,
        ipfsCid,
        type: 'insurance_card', // Would come from upload form
        timestamp: Date.now(),
      },
    ]);
  };

  const handleAccessGranted = (data: {
    documentIds: number[];
    facilityNames: string[];
    txHash: string;
  }) => {
    const transaction = {
      id: `tx-${Date.now()}`,
      timestamp: Date.now(),
      documentIds: data.documentIds,
      facilityNames: data.facilityNames,
      txHash: data.txHash,
    };
    setTransactionHistory((prev) => [transaction, ...prev]);
  };

  const toggleDocumentSelection = (documentId: number) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-primary/10 bg-gradient-card backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">HealthChain</h1>
                <p className="text-xs text-muted-foreground">Decentralized Healthcare Records</p>
              </div>
            </div>
            
            <WalletConnect onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!isConnected && (
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Blocks className="h-4 w-4" />
                Powered by Celo Blockchain
              </div>
              <h2 className="text-5xl font-bold mb-6 gradient-text">
                Your Healthcare Documents,
                <br />
                Securely on the Blockchain
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Upload once, share with multiple medical facilities in a single transaction.
                End-to-end encrypted, decentralized, and patient-controlled.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-primary/10 shadow-lg hover:shadow-glow transition-smooth">
                <CardHeader>
                  <Key className="h-10 w-10 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">You Own Your Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Complete control over who accesses your healthcare documents
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-primary/10 shadow-lg hover:shadow-glow transition-smooth">
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">End-to-End Encrypted</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Client-side encryption ensures maximum privacy and security
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-primary/10 shadow-lg hover:shadow-glow transition-smooth">
                <CardHeader>
                  <Blocks className="h-10 w-10 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Blockchain Verified</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Immutable audit trail on Celo blockchain ensures authenticity
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <WalletConnect onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} />
            </div>
          </div>
        </section>
      )}

      {/* Main Dashboard - Only shown when connected */}
      {isConnected && (
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="bg-gradient-card border border-primary/10 shadow-md">
              <TabsTrigger value="upload" className="gap-2">
                <FileText className="h-4 w-4" />
                Upload Documents
              </TabsTrigger>
              <TabsTrigger value="share" className="gap-2">
                <Building2 className="h-4 w-4" />
                Share with Facilities
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                History & Access
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <DocumentUpload onUploadComplete={handleDocumentUpload} />

                <Card className="shadow-lg border-primary/10">
                  <CardHeader>
                    <CardTitle>Your Documents</CardTitle>
                    <CardDescription>Uploaded healthcare documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {uploadedDocuments.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {uploadedDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className={`
                              flex items-center justify-between p-3 rounded-lg border transition-smooth cursor-pointer
                              ${
                                selectedDocuments.includes(doc.id)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }
                            `}
                            onClick={() => toggleDocumentSelection(doc.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                                <FileText className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Document #{doc.id}</p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {doc.ipfsCid.substring(0, 20)}...
                                </p>
                              </div>
                            </div>
                            {selectedDocuments.includes(doc.id) && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="share">
              <FacilitySelector
                selectedDocuments={selectedDocuments}
                onAccessGranted={handleAccessGranted}
              />
            </TabsContent>

            <TabsContent value="history">
              <Card className="shadow-lg border-primary/10">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View your document sharing history and access logs</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No transactions yet</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Share documents with facilities to see history here
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs">
                          <p className="font-medium text-yellow-600 dark:text-yellow-500 mb-1">
                            Demo Mode - Simulated Transactions
                          </p>
                          <p className="text-muted-foreground">
                            These are mock transactions. To see real blockchain transactions, deploy the smart contract to Celo network.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {transactionHistory.map((tx) => (
                          <div
                            key={tx.id}
                            className="border border-border rounded-lg p-4 hover:border-primary/50 transition-smooth bg-gradient-card"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                                  <Send className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Access Granted</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(tx.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => window.open(`https://alfajores.celoscan.io/tx/${tx.txHash}`, '_blank')}
                              >
                                View on Explorer
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Documents: </span>
                                <span className="font-mono text-foreground">
                                  {tx.documentIds.join(', ')}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Facilities: </span>
                                <span className="text-foreground">
                                  {tx.facilityNames.join(', ')}
                                </span>
                              </div>
                              <div className="flex items-start gap-1">
                                <span className="text-muted-foreground">Transaction: </span>
                                <span className="font-mono text-foreground break-all">
                                  {tx.txHash}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-gradient-card mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Built on Celo Blockchain • IPFS Decentralized Storage • End-to-End Encrypted</p>
          <p className="mt-2">
            🔒 Your data, your control. Patient sovereignty guaranteed by smart contracts.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
