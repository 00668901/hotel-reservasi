import { useState } from 'react';
import { Room, Reservation } from '../types/hotel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar, Users, Mail, Phone, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BookingModalProps {
  room: Room | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (reservation: Reservation, room: Room) => void;
}

export function BookingModal({ room, open, onClose, onSuccess }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!room) return;

    // Validasi tanggal
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      toast.error('Tanggal check-in tidak boleh di masa lalu');
      return;
    }

    if (checkOutDate <= checkInDate) {
      toast.error('Tanggal check-out harus setelah check-in');
      return;
    }

    if (formData.guests > room.capacity) {
      toast.error(`Jumlah tamu maksimal ${room.capacity} orang`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aa71f191/reservations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            roomId: room.id,
            ...formData
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuat reservasi');
      }

      // Reset form
      setFormData({
        guestName: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        guests: 1,
        specialRequests: ''
      });

      onSuccess(data.data, room);
      onClose();
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Gagal membuat reservasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateTotal = () => {
    if (!room || !formData.checkIn || !formData.checkOut) return 0;
    
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return nights > 0 ? room.price * nights : 0;
  };

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reservasi {room.name}</DialogTitle>
          <DialogDescription>
            Lengkapi formulir di bawah ini untuk melakukan pemesanan
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informasi Tamu */}
          <div className="space-y-4">
            <h4 className="text-sm text-muted-foreground">Informasi Tamu</h4>
            
            <div className="space-y-2">
              <Label htmlFor="guestName">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="guestName"
                  className="pl-10"
                  placeholder="Nama lengkap sesuai identitas"
                  required
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    placeholder="email@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    className="pl-10"
                    placeholder="08123456789"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Reservasi */}
          <div className="space-y-4">
            <h4 className="text-sm text-muted-foreground">Detail Reservasi</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="checkIn"
                    type="date"
                    className="pl-10"
                    required
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="checkOut"
                    type="date"
                    className="pl-10"
                    required
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests">Jumlah Tamu</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="guests"
                  type="number"
                  className="pl-10"
                  min="1"
                  max={room.capacity}
                  required
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                />
              </div>
              <p className="text-xs text-muted-foreground">Maksimal {room.capacity} orang</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Permintaan Khusus (Opsional)</Label>
              <Textarea
                id="specialRequests"
                placeholder="Contoh: Kasur tambahan, lantai tinggi, kamar smoking/non-smoking, dll"
                rows={3}
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              />
            </div>
          </div>

          {/* Ringkasan Harga */}
          {formData.checkIn && formData.checkOut && calculateTotal() > 0 && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Harga per malam</span>
                <span className="text-sm">{formatPrice(room.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">
                  Jumlah malam ({Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} malam)
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(calculateTotal())}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Memproses...' : 'Konfirmasi Reservasi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}