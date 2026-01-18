import { useState } from 'react';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

export interface FilterOptions {
  priceRange: [number, number];
  capacity: number;
  amenities: string[];
  availableOnly: boolean;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  allAmenities: string[];
}

export function AdvancedFilters({ filters, onFiltersChange, allAmenities }: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      priceRange: [0, 10000000],
      capacity: 1,
      amenities: [],
      availableOnly: false
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = localFilters.amenities.includes(amenity)
      ? localFilters.amenities.filter(a => a !== amenity)
      : [...localFilters.amenities, amenity];
    
    setLocalFilters({ ...localFilters, amenities: newAmenities });
  };

  const activeFiltersCount = 
    (localFilters.amenities.length > 0 ? 1 : 0) +
    (localFilters.availableOnly ? 1 : 0) +
    (localFilters.capacity > 1 ? 1 : 0) +
    (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 10000000 ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* REVISI: Pastikan SheetTrigger membungkus Button dengan asChild. 
          Pastikan komponen Button sudah menggunakan React.forwardRef 
      */}
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filter Lanjutan
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="overflow-y-auto flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Filter Pencarian</SheetTitle>
          <SheetDescription>
            Sesuaikan pencarian kamar dengan preferensi Anda
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-8">
          {/* Price Range */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Rentang Harga</Label>
            <div className="px-2">
              <Slider
                min={0}
                max={10000000}
                step={100000}
                value={localFilters.priceRange}
                onValueChange={(value) => 
                  setLocalFilters({ ...localFilters, priceRange: value as [number, number] })
                }
              />
              <div className="flex justify-between mt-3 text-sm text-muted-foreground font-medium">
                <span>{formatPrice(localFilters.priceRange[0])}</span>
                <span>{formatPrice(localFilters.priceRange[1])}</span>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Kapasitas Minimum</Label>
            <div className="px-2">
              <Slider
                min={1}
                max={6}
                step={1}
                value={[localFilters.capacity]}
                onValueChange={(value) => 
                  setLocalFilters({ ...localFilters, capacity: value[0] })
                }
              />
              <div className="mt-2 text-sm text-muted-foreground font-medium">
                {localFilters.capacity} orang
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Fasilitas</Label>
            <div className="grid grid-cols-1 gap-2">
              {allAmenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={localFilters.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <label
                    htmlFor={`amenity-${amenity}`}
                    className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 py-1"
                  >
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Available Only */}
          <div className="flex items-center space-x-3 p-4 rounded-lg border bg-muted/30">
            <Checkbox
              id="available-only"
              checked={localFilters.availableOnly}
              onCheckedChange={(checked) => 
                setLocalFilters({ ...localFilters, availableOnly: checked as boolean })
              }
            />
            <label
              htmlFor="available-only"
              className="text-sm font-medium cursor-pointer leading-none flex-1"
            >
              Hanya tampilkan kamar tersedia
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t mt-auto bg-background">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Terapkan
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}