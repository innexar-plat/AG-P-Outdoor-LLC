import React, { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { motion } from '@/lib/motion-lite.jsx';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtonsDeferred.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { submitForm, fetchSeo } from '@/lib/api';
import { useSite } from '@/lib/SiteProvider.jsx';

function buildMapboxEmbed(lat, lon, accessToken = 'pk.eyJ1IjoiYWdwb3V0ZG9vciIsImEiOiJjbHZneHZhdnkwYWxvMmptODNoZzRxZzAxIn0.X_placeholder') {
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  
  const zoom = 16;
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${longitude},${latitude},${zoom},0/800x600@2x?access_token=${accessToken}&attribution=bottom&logo=bottom-left&marker=pin-l-a+2f6f46(${longitude},${latitude})`;
}

function buildMapboxEmbedFrame(lat, lon, accessToken = 'pk.eyJ1IjoiYWdwb3V0ZG9vciIsImEiOiJjbHZneHZhdnkwYWxvMmptODNoZzRxZzAxIn0.X_placeholder') {
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  
  const zoom = 16;
  return `https://api.mapbox.com/styles/v1/maps/iframe?bbox=${(longitude-0.02).toFixed(4)},${(latitude-0.02).toFixed(4)},${(longitude+0.02).toFixed(4)},${(latitude+0.02).toFixed(4)}&zoom=${zoom}&access_token=${accessToken}`;
}

function buildGoogleEmbedShare(lat, lon, address) {
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  
  return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.${Math.random().toString().slice(2)}!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i${1920}!2i${1080}!4f13.1!3m3!1m2!1s${encodeURIComponent(address || 'AG&P Outdoor LLC')}!2s${address}!5e0!3m2!1sen!2sus!4v${Date.now()}`;
}

function buildGoogleSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function parseGooglePlaceFromPath(pathname) {
  if (!pathname || typeof pathname !== 'string') return '';
  const match = pathname.match(/\/maps\/place\/([^/]+)/i);
  if (!match?.[1]) return '';
  return decodeURIComponent(match[1]).replace(/\+/g, ' ');
}

function normalizeMapsEmbedUrl(rawUrl, address) {
  const fallbackQuery = buildGoogleSearchUrl(address || 'AG&P Outdoor LLC, Ocoee, FL');
  if (!rawUrl || typeof rawUrl !== 'string') return fallbackQuery;

  const iframeSrcMatch = rawUrl.match(/src=["']([^"']+)["']/i);
  const candidateRaw = (iframeSrcMatch?.[1] ?? rawUrl).trim().replace(/&amp;/g, '&');
  const normalizedRaw = candidateRaw.startsWith('//') ? `https:${candidateRaw}` : candidateRaw;

  try {
    const parsed = new URL(normalizedRaw);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    const isGoogleHost =
      host.includes('google.') ||
      host.includes('maps.app.goo.gl') ||
      host.includes('g.co') ||
      host.includes('googleusercontent.com');

    const hasEmbedFlag = parsed.searchParams.get('output') === 'embed' || path.includes('/maps/embed');
    if (hasEmbedFlag && isGoogleHost) {
      // Canonicalize to a stable host to avoid "maps.google.com refused to connect".
      parsed.hostname = 'www.google.com';
      parsed.protocol = 'https:';
      return parsed.toString();
    }
    if (hasEmbedFlag) return parsed.toString();

    if (!isGoogleHost) {
      // Allow non-Google absolute embed URLs from admin settings (e.g. OpenStreetMap providers).
      return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : fallbackQuery;
    }

    // Rebuild Google URLs into a known format; this may still be blocked by Google.
    // We only use this when we don't have an explicit /maps/embed URL from admin.
    const q =
      parsed.searchParams.get('q') ||
      parsed.searchParams.get('query') ||
      parsed.searchParams.get('destination') ||
      parseGooglePlaceFromPath(parsed.pathname) ||
      address;
    return buildGoogleSearchUrl(q || 'AG&P Outdoor LLC, Ocoee, FL');
  } catch {
    return fallbackQuery;
  }

  return fallbackQuery;
}

const ContactPage = () => {
  const { toast } = useToast();
  const site = useSite();
  const [seo, setSeo] = useState(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [resolvedMapEmbedUrl, setResolvedMapEmbedUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await submitForm({
      formType: 'contact',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
    });

    if (result.ok) {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: '', phone: '', email: '', city: '', message: '' });
    } else {
      toast({
        title: "Submission Failed",
        description: result.error || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchSeo('contact').then((data) => data && setSeo(data));
  }, []);

  const rawMapUrl = site.company_map_embed_url || site.map_embed_url || site.google_maps_embed_url || site.google_maps_url;
  const normalizedMapUrl = normalizeMapsEmbedUrl(rawMapUrl, site.address);
  const hasExplicitGoogleEmbed = /google\.[^/]+\/maps\/embed/i.test(String(rawMapUrl || ''));

  useEffect(() => {
    let cancelled = false;
    setMapFailed(false);

    if (hasExplicitGoogleEmbed) {
      setResolvedMapEmbedUrl(normalizedMapUrl);
      return () => {
        cancelled = true;
      };
    }

    const addressQuery = site.address || '878 Keaton Pkwy, Ocoee, FL 34761';
    
    // Try Mapbox geocoding first (more reliable)
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressQuery)}.json?access_token=pk.eyJ1IjoiYWdwb3V0ZG9vciIsImEiOiJjbHZneHZhdnkwYWxvMmptODNoZzRxZzAxIn0.X_placeholder&limit=1`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        
        if (data?.features?.[0]) {
          const { geometry } = data.features[0];
          if (geometry?.coordinates?.length >= 2) {
            const [lon, lat] = geometry.coordinates;
            // Use Mapbox static image as iframe alternative
            const mapboxUrl = buildMapboxEmbed(lat, lon);
            setResolvedMapEmbedUrl(mapboxUrl);
            return;
          }
        }
        
        // Fallback to Google Maps
        setResolvedMapEmbedUrl('');
      })
      .catch(() => {
        if (cancelled) return;
        // Fallback to Google Maps search
        const googleFallback = buildGoogleSearchUrl(addressQuery);
        setResolvedMapEmbedUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [hasExplicitGoogleEmbed, normalizedMapUrl, site.address]);

  const title = seo?.titleTag || "Contact AG&P Outdoor LLC | Free Estimates - Central Florida";
  const description = seo?.metaDescription || "Contact AG&P Outdoor LLC for a free estimate on artificial turf installation. Call 772-226-9087 or visit us in Ocoee, FL. Serving Central Florida.";

  return (
    <>
      <Seo
        title={title}
        description={description}
        ogImage={seo?.ogImage}
      />

      <Header />
      <StickyMobileButtons />

      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-[#1f3a2e] mb-6">Contact Us</h1>
              <p className="text-xl text-gray-600">Get your free estimate today</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <h2 className="text-2xl font-bold text-[#1f3a2e] mb-6">Get In Touch</h2>
                  
                  <div className="space-y-4">
                    <a href={`tel:${site.phone}`} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Phone className="h-6 w-6 text-[#2f6f46] mr-4" />
                      <div>
                        <p className="text-sm text-gray-600">Call Us</p>
                        <p className="text-lg font-semibold text-[#1f3a2e]">{site.phone}</p>
                      </div>
                    </a>

                    <a href={`mailto:${site.email}`} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Mail className="h-6 w-6 text-[#2f6f46] mr-4" />
                      <div>
                        <p className="text-sm text-gray-600">Email Us</p>
                        <p className="text-lg font-semibold text-[#1f3a2e]">{site.email}</p>
                      </div>
                    </a>

                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <MapPin className="h-6 w-6 text-[#2f6f46] mr-4 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Visit Us</p>
                        <p className="text-lg font-semibold text-[#1f3a2e]">{site.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <Clock className="h-6 w-6 text-[#2f6f46] mr-4 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Business Hours</p>
                        <div className="text-sm text-[#1f3a2e] space-y-1">
                          <p><span className="font-semibold">Mon-Thu:</span> 9am - 6pm</p>
                          <p><span className="font-semibold">Friday:</span> 9am - 6pm</p>
                          <p><span className="font-semibold">Saturday:</span> 10am - 2pm</p>
                          <p><span className="font-semibold">Sunday:</span> Closed</p>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${site.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors"
                    >
                      <MessageCircle className="h-6 w-6 mr-4" />
                      <div>
                        <p className="text-sm">Message Us on</p>
                        <p className="text-lg font-semibold">WhatsApp</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Map */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-[#1f3a2e] mb-4">Our Location</h3>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    {!mapFailed && resolvedMapEmbedUrl ? (
                      <img
                        src={resolvedMapEmbedUrl}
                        alt="AG&P Outdoor LLC Location Map"
                        width="800"
                        height="600"
                        className="w-full h-full object-cover"
                        onError={() => setMapFailed(true)}
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center text-center p-6">
                        <MapPin className="h-12 w-12 text-[#2f6f46] mb-3 opacity-60" />
                        <p className="text-[#1f3a2e] font-semibold mb-2">Visualizar no mapa</p>
                        <p className="text-gray-600 text-sm mb-4 max-w-xs">{site.address || '878 Keaton Pkwy, Ocoee, FL 34761'}</p>
                        <a
                          href={buildGoogleSearchUrl(site.address || 'AG&P Outdoor LLC, Ocoee, FL')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-[#2f6f46] hover:bg-[#245739] text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Abrir no Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-[#1f3a2e] mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-[#2f6f46] hover:bg-[#245739] text-white font-semibold py-6 text-lg">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ContactPage;