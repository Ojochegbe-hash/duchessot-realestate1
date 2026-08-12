import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) {
      alert("Please fill in the required fields (First Name, Email, Message).");
      return;
    }

    setStatus('submitting');
    try {
      const { error } = await supabase.from('messages').insert({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      if (error) throw error;
      
      setStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6">Contact Us</h1>
          <p className="text-lg text-stone-700 max-w-2xl mx-auto">
            Have questions about our properties? Looking to list your home? Get in touch with our team of luxury real estate experts today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-stone-900 mb-8">Get In Touch</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-stone-200">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-1">Office Location</h3>
                  <p className="text-stone-700">East Legon, Accra<br />Windy Hill District, Ghana</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-stone-200">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-1">Phone & WhatsApp</h3>
                  <p className="text-stone-700">
                    <a href="tel:0542242404" className="hover:text-stone-900 transition-colors">0542242404</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-stone-200">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-1">Email</h3>
                  <p className="text-stone-700">
                    <a href="mailto:duchessot@yahoo.com" className="hover:text-stone-900 transition-colors">duchessot@yahoo.com</a>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-stone-50 p-8 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="text-xl font-bold text-stone-900 mb-4">Business Hours</h3>
              <ul className="space-y-2 text-stone-700">
                <li className="flex justify-between"><span>Monday - Friday</span> <span>9:00 AM - 6:00 PM</span></li>
                <li className="flex justify-between"><span>Saturday</span> <span>10:00 AM - 4:00 PM</span></li>
                <li className="flex justify-between"><span>Sunday</span> <span>Closed (Available by Appt)</span></li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-stone-50 p-8 md:p-10 rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200">
            <h2 className="text-2xl font-bold text-stone-900 mb-8">Send a Message</h2>
            
            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center text-green-800">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p>Thank you for reaching out. We will get back to you as soon as possible.</p>
                <Button variant="outline" className="mt-6" onClick={() => setStatus('idle')}>Send Another Message</Button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {status === 'error' && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                    Failed to send message. Please try again or contact us directly.
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-stone-900">First Name *</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:bg-stone-50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-stone-900">Last Name</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:bg-stone-50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-stone-900">Email Address *</label>
                  <input 
                    type="email" 
                    id="email" 
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:bg-stone-50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-stone-900">Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:bg-stone-50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="+233 54 224 2404"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-stone-900">Message *</label>
                  <textarea 
                    id="message" 
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:bg-stone-50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                    placeholder="How can we help you today?"
                  ></textarea>
                </div>

                <Button type="submit" size="lg" className="w-full text-lg h-14 bg-primary hover:bg-primary-light text-white" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
