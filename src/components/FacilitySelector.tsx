import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Search, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { web3Service } from '@/lib/web3';

// Mock facilities - in production, fetch from database
const MOCK_FACILITIES = [
  {
    id: '1',
    name: 'City General Hospital',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    type: 'Hospital',
  },
  {
    id: '2',
    name: 'Medicare Clinic',
    address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    type: 'Clinic',
  },
  {
    id: '3',
    name: 'HealthCare Insurance Co.',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    type: 'Insurance',
  },
  {
    id: '4',
    name: 'Wellness Medical Center',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    type: 'Medical Center',
  },
  {
    id: '5',
    name: 'National Lab Services',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    type: 'Laboratory',
  },
];

interface FacilitySelectorProps {
  selectedDocuments: number[];
  onSubmit?: (facilityAddresses: string[]) => void;
  onAccessGranted?: (data: {
    documentIds: number[];
    facilityNames: string[];
    txHash: string;
  }) => void;
}

export const FacilitySelector = ({ selectedDocuments, onSubmit, onAccessGranted }: FacilitySelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFacilities = MOCK_FACILITIES.filter(
    (facility) =>
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFacility = (facilityId: string) => {
    const newSelected = new Set(selectedFacilities);
    if (newSelected.has(facilityId)) {
      newSelected.delete(facilityId);
    } else {
      newSelected.add(facilityId);
    }
    setSelectedFacilities(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedFacilities.size === 0) {
      toast.error('No facilities selected', {
        description: 'Please select at least one facility',
      });
      return;
    }

    if (selectedDocuments.length === 0) {
      toast.error('No documents selected', {
        description: 'Please select at least one document to share',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedFacilityIds = Array.from(selectedFacilities);
      const addresses = selectedFacilityIds.map(
        (id) => MOCK_FACILITIES.find((f) => f.id === id)?.address || ''
      );
      const facilityNames = selectedFacilityIds.map(
        (id) => MOCK_FACILITIES.find((f) => f.id === id)?.name || ''
      );

      const txHash = await web3Service.batchGrantAccess(selectedDocuments, addresses);

      toast.success('Access granted successfully', {
        description: `Documents shared with ${selectedFacilities.size} facilities in a single transaction`,
      });

      onAccessGranted?.({
        documentIds: selectedDocuments,
        facilityNames,
        txHash,
      });

      onSubmit?.(addresses);
      setSelectedFacilities(new Set());
    } catch (error: any) {
      toast.error('Failed to grant access', {
        description: error.message || 'Transaction failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Select Medical Facilities
        </CardTitle>
        <CardDescription>
          Choose facilities to share your documents with (batch submission)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>

        {/* Facility List */}
        <ScrollArea className="h-[300px] border rounded-lg bg-gradient-card">
          <div className="p-4 space-y-2">
            {filteredFacilities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No facilities found
              </p>
            ) : (
              filteredFacilities.map((facility) => (
                <div
                  key={facility.id}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg border transition-smooth cursor-pointer
                    ${
                      selectedFacilities.has(facility.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 bg-card'
                    }
                  `}
                  onClick={() => toggleFacility(facility.id)}
                >
                  <Checkbox
                    checked={selectedFacilities.has(facility.id)}
                    onCheckedChange={() => toggleFacility(facility.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{facility.name}</p>
                    <p className="text-xs text-muted-foreground">{facility.type}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate mt-1">
                      {facility.address}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Summary */}
        <div className="bg-gradient-subtle border border-primary/20 rounded-lg p-3">
          <p className="text-sm font-medium text-foreground mb-1">
            Selected: {selectedFacilities.size} facilities, {selectedDocuments.length} documents
          </p>
          <p className="text-xs text-muted-foreground">
            All documents will be shared with all selected facilities in a single blockchain
            transaction
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={selectedFacilities.size === 0 || selectedDocuments.length === 0 || isSubmitting}
          className={buttonVariants({ variant: 'hero', size: 'lg' })}
          style={{ width: '100%' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Transaction...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Grant Access (Batch)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
