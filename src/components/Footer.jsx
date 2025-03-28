import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from 'react-icons/fa';

const navigation = {
  company: [
    { name: 'About', href: '/about' },
    { name: 'Features', href: '/features' },
    { name: 'Testimonials', href: '/testimonials' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Cookie Policy', href: '#' },
    { name: 'Licensing', href: '#' },
  ],
  resources: [
    { name: 'Study Guides', href: '#' },
    { name: 'Career Resources', href: '#' },
    { name: 'Mentorship', href: '#' },
    { name: 'Community', href: '#' },
  ],
  support: [
    { name: 'Help Center', href: '#' },
    { name: 'FAQs', href: '#' },
    { name: 'Contact Support', href: '#' },
    { name: 'Student Forum', href: '#' },
  ],
  social: [
    { name: 'Facebook', href: '#', icon: FaFacebook },
    { name: 'Twitter', href: '#', icon: FaTwitter },
    { name: 'Instagram', href: '#', icon: FaInstagram },
    { name: 'LinkedIn', href: '#', icon: FaLinkedin },
    { name: 'YouTube', href: '#', icon: FaYoutube },
  ],
};

const Footer = () => {
  return (
    <footer className="relative">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-content opacity-50" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section with Newsletter */}
        <div className="py-12 lg:py-16 hidden">
          <div className="bg-white dark:bg-dark-content rounded-3xl shadow-xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Join Our Community
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get weekly updates on new resources, study guides, and student success stories.
                </p>
              </div>
              <form className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl border bg-white border-gray-300 dark:border-dark-content-light focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-accent focus:border-transparent dark:bg-dark-content-light dark:text-white"
                />
                <button className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 dark:from-dark-accent dark:to-dark-accent-light text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 py-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500 dark:from-dark-accent dark:to-dark-accent-light">
              Edvise
              </span>
            </Link>
          
          </div>

          {/* Navigation Columns */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Company</h3>
            <ul className="space-y-4">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-dark-accent transition-colors duration-200">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Legal</h3>
            <ul className="space-y-4">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-dark-accent transition-colors duration-200">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Resources</h3>
            <ul className="space-y-4">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-dark-accent transition-colors duration-200">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Support</h3>
            <ul className="space-y-4">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-dark-accent transition-colors duration-200">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-dark-content py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Social Links */}
            <div className="flex space-x-6">
              {navigation.social.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-400 hover:text-primary-600 dark:text-gray-500 dark:hover:text-dark-accent transition-colors duration-200"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-6 w-6" />
                  </a>
                );
              })}
            </div>

            {/* Copyright */}
            <p className="text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Edvise. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
