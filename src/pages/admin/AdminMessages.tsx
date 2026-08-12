import { useState, useEffect } from 'react';
import { Mail, Check, Trash2, Phone, Mail as MailIcon, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await supabase.from('messages').update({ is_read: true, read: true }).eq('id', id);
      fetchMessages();
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    setMessages(prev => prev.filter(m => m.id !== id));
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) {
        console.error("Error deleting message:", error);
        alert(`Failed to delete message: ${error.message}`);
        fetchMessages();
      }
    } catch (err: any) {
      console.error("Error deleting message:", err);
      fetchMessages();
    }
  };

  const unreadCount = messages.filter(m => !m.read && !m.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Client Messages & Leads
          </h2>
          <p className="text-stone-500 text-sm mt-0.5">
            Inquiries and contact form submissions from website visitors ({unreadCount} unread)
          </p>
        </div>

        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold self-start sm:self-center">
            <Mail className="w-3.5 h-3.5" /> {unreadCount} New Inquiries
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-sm">Loading client messages...</div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <Mail className="h-12 w-12 mx-auto text-stone-300 mb-3" />
            <h3 className="text-base font-bold text-stone-900 mb-1">No messages yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Inquiries sent through your website contact forms and property detail pages will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {messages.map((msg) => {
              const isUnread = !msg.read && !msg.is_read;

              return (
                <div key={msg.id} className={`p-6 transition-colors ${isUnread ? 'bg-primary/5' : 'bg-white'}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-base font-bold ${isUnread ? 'text-primary' : 'text-stone-900'}`}>
                          {msg.name || 'Anonymous Visitor'}
                        </h3>
                        {isUnread && (
                          <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-md uppercase font-extrabold tracking-wider">
                            New Lead
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-stone-500 flex flex-wrap items-center gap-4 pt-0.5">
                        {msg.email && (
                          <a href={`mailto:${msg.email}`} className="hover:text-primary flex items-center gap-1 font-medium">
                            <MailIcon className="w-3.5 h-3.5 text-stone-400" />
                            <span>{msg.email}</span>
                          </a>
                        )}
                        {msg.phone && (
                          <a href={`tel:${msg.phone}`} className="hover:text-primary flex items-center gap-1 font-medium">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            <span>{msg.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-stone-400 font-medium flex items-center gap-1 shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-3 text-stone-700 bg-stone-50 p-4 rounded-xl border border-stone-200/60 text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.message || 'No message text provided.'}
                  </div>

                  <div className="mt-4 flex items-center gap-2 justify-end">
                    {isUnread && (
                      <button 
                        onClick={() => markAsRead(msg.id)}
                        className="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark as Read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteMessage(msg.id)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
