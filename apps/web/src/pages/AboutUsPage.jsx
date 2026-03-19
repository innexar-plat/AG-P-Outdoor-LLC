import React, { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { motion } from '@/lib/motion-lite.jsx';
import { Award, Users, MapPin, Shield } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtonsDeferred.jsx';
import { useSite } from '@/lib/SiteProvider.jsx';
import { fetchSiteImages, fetchSeo } from '@/lib/api';

const AboutUsPage = () => {
  const site = useSite();
  const [teamImage, setTeamImage] = useState(null);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    fetchSiteImages('about').then((images) => {
      if (Array.isArray(images)) {
        const team = images.find((i) => i.slotKey === 'team' || i.slotKey === 'about_team') || images[0];
        setTeamImage(team?.url || null);
      }
    });
  }, []);

  useEffect(() => {
    const raw = site.about_service_areas;
    if (raw && typeof raw === 'string') {
      setServiceAreas(raw.split(',').map((s) => s.trim()).filter(Boolean));
    }
  }, [site.about_service_areas]);

  useEffect(() => {
    fetchSeo('about').then((data) => data && setSeo(data));
  }, []);

  const companyName = site.companyName || 'Our Company';
  const title = seo?.titleTag || `About ${companyName} | Family-Owned Turf Installation`;
  const description = seo?.metaDescription || `Learn about ${companyName}, a family-owned artificial turf installation company. Licensed, insured, and committed to quality.`;

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
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-[#1f3a2e] mb-6">About {companyName}</h1>
            <p className="text-xl text-gray-600">Family-owned, locally operated, and committed to excellence</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            {teamImage && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src={teamImage}
                alt={`${companyName} team`}
                className="rounded-xl shadow-2xl"
              />
            </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-[#1f3a2e]">Our Story</h2>
              <p className="text-gray-700">
                {companyName} is a family-owned and operated artificial turf installation company. We're not a national franchise or a large corporation — we're your neighbors, committed to delivering exceptional quality and personalized service.
              </p>
              <p className="text-gray-700">
                What sets us apart is our unwavering commitment to doing things the right way. We don't cut corners on base preparation, we don't rush installations, and we don't compromise on materials. Every project receives the same meticulous attention to detail, whether it's a small residential lawn or a large commercial installation.
              </p>
              <p className="text-gray-700">
                Our team brings years of experience in landscaping, construction, and turf installation. We understand Florida's unique climate, soil conditions, and drainage challenges. This local expertise ensures your installation is built to last.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: <Award className="h-8 w-8" />, title: "Licensed & Insured", description: "Fully licensed and insured for your protection and peace of mind." },
              { icon: <Users className="h-8 w-8" />, title: "Experienced Team", description: "Years of expertise in turf installation and landscaping." },
              { icon: <Shield className="h-8 w-8" />, title: "Quality Guarantee", description: "We stand behind our work with comprehensive warranties." },
              { icon: <MapPin className="h-8 w-8" />, title: "Local Expertise", description: "Deep understanding of Central Florida's climate and conditions." }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 text-center"
              >
                <div className="bg-gradient-to-br from-[#2f6f46] to-[#245739] text-white w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-[#1f3a2e] mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {serviceAreas.length > 0 && (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#1f3a2e] mb-6">Our Service Areas</h2>
            <p className="text-gray-600 mb-8">Proudly serving our communities</p>
            <div className="flex flex-wrap justify-center gap-3">
              {serviceAreas.map((area) => (
                <span
                  key={area}
                  className="bg-white px-4 py-2 rounded-full text-[#1f3a2e] font-semibold border-2 border-[#2f6f46] shadow-sm"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      <Footer />
    </>
  );
};

export default AboutUsPage;