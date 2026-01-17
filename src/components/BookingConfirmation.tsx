import { Reservation, Room } from '../types/hotel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { CheckCircle, Calendar, Users, Mail, Phone, MapPin, Printer, Share2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BookingConfirmationProps {
  reservation: Reservation | null;
  room: Room | null;
  open: boolean;
  onClose: () => void;
}

export function BookingConfirmation({ reservation, room, open, onClose }: BookingConfirmationProps) {
  if (!reservation || !room) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
    toast.success('Silakan print konfirmasi booking Anda');
  };

  const handleShare = async () => {
    const text = `Booking Konfirmasi - ${room.name}\nKode: ${reservation.id}\nCheck-in: ${formatDate(reservation.checkIn)}\nCheck-out: ${formatDate(reservation.checkOut)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Konfirmasi Booking Hotel',
          text: text
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Detail booking disalin ke clipboard');
    }
  };

  const handleWhatsApp = () => {
    const message = `Halo, saya ingin konfirmasi booking saya:%0A%0AKode Booking: ${reservation.id}%0AKamar: ${room.name}%0ACheck-in: ${formatDate(reservation.checkIn)}%0ACheck-out: ${formatDate(reservation.checkOut)}`;
    window.open(`https://wa.me/6282112345678?text=${message}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-center space-y-2">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <DialogTitle className="text-2xl">Reservasi Berhasil!</DialogTitle>
            <p className="text-muted-foreground">
              Terima kasih telah memesan di Grand Hotel Resort
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6 text-center">
              <p className="text-sm mb-1">Kode Booking</p>
              <p className="text-2xl tracking-wider">{reservation.id}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h4 className="mb-2">Detail Kamar</h4>
                <p className="text-lg">{room.name}</p>
                <p className="text-sm text-muted-foreground">{room.type}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Check-in</p>
                      <p>{formatDate(reservation.checkIn)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Check-out</p>
                      <p>{formatDate(reservation.checkOut)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Jumlah Tamu</p>
                      <p>{reservation.guests} orang</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nama Tamu</p>
                      <p>{reservation.guestName}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span>Total Pembayaran</span>
                  <span className="text-xl text-primary">{formatPrice(reservation.totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted">
            <CardContent className="pt-6">
              <p className="text-sm text-center">
                Konfirmasi booking telah dikirim ke <strong>{reservation.email}</strong>
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button onClick={handleWhatsApp} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              WhatsApp
            </Button>
          </div>

          <Button onClick={onClose} className="w-full">
            Selesai
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}