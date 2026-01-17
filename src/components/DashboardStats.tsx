import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mountain, Wind, Sparkles, Waves } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function DashboardStats() {
  const benefits = [
    {
      title: 'Pemandangan Pegunungan',
      description: 'View spektakuler langsung ke pegunungan',
      icon: Mountain,
      image: 'https://images.unsplash.com/photo-1768067751225-8e056add4334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHZpZXclMjBob3RlbHxlbnwxfHx8fDE3Njg2MzE4ODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      color: 'text-blue-500'
    },
    {
      title: 'Udara Segar & Bersih',
      description: 'Bebas polusi, udara pegunungan alami',
      icon: Wind,
      image: 'https://images.unsplash.com/photo-1643637007815-830145b71c99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGFpciUyMG5hdHVyZXxlbnwxfHx8fDE3Njg2MzE4ODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      color: 'text-green-500'
    },
    {
      title: 'Fasilitas Premium',
      description: 'Kemewahan & kenyamanan maksimal',
      icon: Sparkles,
      image: 'https://images.unsplash.com/photo-1710378439817-6159c79bda03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGFtZW5pdGllc3xlbnwxfHx8fDE3Njg2MzE4ODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      color: 'text-amber-500'
    },
    {
      title: 'Kolam Renang Infinity',
      description: 'Private pool dengan view menakjubkan',
      icon: Waves,
      image: 'https://images.unsplash.com/photo-1534612899740-55c821a90129?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHN3aW1taW5nJTIwcG9vbHxlbnwxfHx8fDE3Njg2MzE4ODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      color: 'text-cyan-500'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold">Keuntungan Menginap di Hotel Kami</h3>
        <p className="text-muted-foreground">Nikmati pengalaman menginap yang tak terlupakan</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {benefits.map((benefit, index) => {
          const IconComponent = benefit.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all group overflow-hidden">
              <div className="relative h-32 overflow-hidden">
                <ImageWithFallback
                  src={benefit.image}
                  alt={benefit.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className={`absolute top-3 right-3 ${benefit.color}`}>
                  <div className="bg-white rounded-full p-2">
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
