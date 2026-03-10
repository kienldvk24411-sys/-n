import React, { useState, useEffect } from 'react';
import { Search, Clock, Users, Building2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { User, Customer, Property, Contract } from '../types';
import { cn } from '../lib/utils';

interface HeaderProps {
  user: User;
  view: string;
  setView: (view: string, filter?: string) => void;
}

export const Header = ({ user, view, setView }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ customers: Customer[], properties: Property[], contracts: Contract[] } | null>(null);

  useEffect(() => {
    if (searchQuery.length > 1) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        api.search(searchQuery)
          .then(setSearchResults)
          .finally(() => setIsSearching(false));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults(null);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (searchResults) {
        // If we have results, prefer the current view if it has matches
        if (view === 'customers' && searchResults.customers.length > 0) {
          setView('customers', searchQuery);
        } else if (view === 'properties' && searchResults.properties.length > 0) {
          setView('properties', searchQuery);
        } else if (view === 'transactions' && searchResults.contracts.length > 0) {
          setView('transactions', searchQuery);
        } else {
          // Otherwise go to the first section that has results
          if (searchResults.customers.length > 0) {
            setView('customers', searchQuery);
          } else if (searchResults.properties.length > 0) {
            setView('properties', searchQuery);
          } else if (searchResults.contracts.length > 0) {
            setView('transactions', searchQuery);
          } else {
            // Default to customers if no specific results found yet (or still loading)
            setView('customers', searchQuery);
          }
        }
        setSearchQuery('');
        setSearchResults(null);
      } else {
        // If no results yet, just apply to current view or default to customers
        const targetView = ['customers', 'properties', 'transactions'].includes(view) ? view : 'customers';
        setView(targetView, searchQuery);
        setSearchQuery('');
      }
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="relative w-96">
        <div className="relative">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
            isSearching ? "text-blue-500 animate-pulse" : "text-slate-400"
          )} />
          <input 
            type="text" 
            placeholder="Tìm kiếm khách hàng, hợp đồng, dự án..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        
        {/* Search Results Dropdown */}
        <AnimatePresence>
          {(searchResults || isSearching) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[400px] overflow-y-auto z-50"
            >
              {isSearching && (
                <div className="p-4 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Đang tìm kiếm...
                </div>
              )}
              
              {searchResults && (
                <>
                  {searchResults.customers.length > 0 && (
                    <div className="p-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-2">Khách hàng</p>
                      {searchResults.customers.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => { 
                            setView('customers', c.fullName); 
                            setSearchQuery(''); 
                          }} 
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center group transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mr-3 group-hover:bg-blue-100">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{c.fullName}</p>
                            <p className="text-[10px] text-slate-500">{c.phoneNumber}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.properties.length > 0 && (
                    <div className="p-2 border-t border-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-2">Bất động sản / Dự án</p>
                      {searchResults.properties.map(p => (
                        <button 
                          key={p.id} 
                          onClick={() => { 
                            setView('properties', p.title); 
                            setSearchQuery(''); 
                          }} 
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center group transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center mr-3 group-hover:bg-emerald-100">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{p.title}</p>
                            <p className="text-[10px] text-slate-500">{p.location}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.contracts.length > 0 && (
                    <div className="p-2 border-t border-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-2">Hợp đồng</p>
                      {searchResults.contracts.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => { 
                            setView('transactions', c.customer_name); 
                            setSearchQuery(''); 
                          }} 
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center group transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center mr-3 group-hover:bg-amber-100">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">HĐ: {c.customer_name}</p>
                            <p className="text-[10px] text-slate-500">{c.property_title}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.customers.length === 0 && searchResults.properties.length === 0 && searchResults.contracts.length === 0 && !isSearching && (
                    <div className="p-8 text-center text-slate-400 text-sm">Không tìm thấy kết quả cho "{searchQuery}"</div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 relative">
          <Clock className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-orange rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-slate-100 mx-2" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">{user.username}</p>
            <p className="text-[10px] font-bold text-brand-orange uppercase">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white font-bold shadow-lg shadow-brand-blue/20">
            {user.username[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
