import React, { useState } from 'react';
import { motion } from '@/lib/motion-lite.jsx';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { submitForm } from '@/lib/api';
import { useSite } from '@/lib/SiteProvider.jsx';

const EstimateForm = ({ title = "Get Your Free Estimate" }) => {
  const { toast } = useToast();
  const site = useSite();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    projectType: '',
    size: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Phone, Email)",
        variant: "destructive"
      });
      return;
    }

    const result = await submitForm({
      formType: 'quote',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      metadata: JSON.stringify({ city: formData.city, projectType: formData.projectType, size: formData.size }),
    });

    if (result.ok) {
      setSubmitted(true);
      toast({
        title: "Estimate Request Received!",
        description: "We'll contact you within 24 hours to schedule your free onsite evaluation.",
      });

      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          email: '',
          city: '',
          projectType: '',
          size: '',
          message: ''
        });
        setSubmitted(false);
      }, 3000);
    } else {
      toast({
        title: "Submission Failed",
        description: result.error || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 text-center border-2 border-[#2f6f46]"
      >
        <CheckCircle className="w-16 h-16 text-[#2f6f46] mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-[#1f3a2e] mb-2">Thank You!</h3>
        <p className="text-gray-700">We've received your request and will contact you soon.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-xl shadow-2xl p-8 border border-gray-200"
    >
      <h3 className="text-3xl font-bold text-[#1f3a2e] mb-6 text-center">{title}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder={site.phone}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ocoee, Orlando, etc."
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="projectType">Project Type</Label>
            <select
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6f46] focus-visible:ring-offset-2"
            >
              <option value="">Select a service...</option>
              <option value="residential">Residential Turf</option>
              <option value="putting-green">Putting Green</option>
              <option value="pet-turf">Pet Turf</option>
              <option value="commercial">Commercial Turf</option>
              <option value="pavers">Pavers</option>
              <option value="drainage">Drainage & Grading</option>
              <option value="grass-removal">Natural Grass Removal</option>
            </select>
          </div>
          <div>
            <Label htmlFor="size">Approximate Size (sq ft)</Label>
            <Input
              id="size"
              name="size"
              value={formData.size}
              onChange={handleChange}
              placeholder="e.g., 500 sq ft"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="message">Message / Additional Details</Label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us about your project..."
            rows={4}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#2f6f46] hover:bg-[#245739] text-white font-semibold py-6 text-lg"
        >
          <Send className="mr-2 h-5 w-5" />
          Request Free Estimate
        </Button>
      </form>
    </motion.div>
  );
};

export default EstimateForm;