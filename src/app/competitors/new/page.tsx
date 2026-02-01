'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Globe,
  FileText,
  DollarSign,
  Sparkles,
  Loader2,
  CheckCircle
} from 'lucide-react';

const urlTypes = [
  { id: 'homepage', label: 'Homepage', icon: Globe, description: 'Main website' },
  { id: 'pricing', label: 'Pricing', icon: DollarSign, description: 'Pricing page' },
  { id: 'features', label: 'Features', icon: Sparkles, description: 'Features or product page' },
  { id: 'blog', label: 'Blog/Changelog', icon: FileText, description: 'Blog or updates' },
];

export default function NewCompetitorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    website: '',
    description: '',
  });
  
  const [urls, setUrls] = useState<{ url: string; type: string }[]>([
    { url: '', type: 'homepage' }
  ]);

  const addUrl = () => {
    setUrls([...urls, { url: '', type: 'homepage' }]);
  };

  const removeUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, field: 'url' | 'type', value: string) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          urls: urls.filter(u => u.url.trim()),
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/competitors'), 1500);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 min-h-screen flex items-center justify-center">
          <div className="text-center animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Competitor Added!</h2>
            <p className="text-zinc-500">Redirecting to competitors...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 glass border-b border-border px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/competitors"
              className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Add Competitor</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Start tracking a new rival
              </p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h2 className="font-semibold mb-6">Basic Information</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Competitor Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Acme Inc"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Website <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      placeholder="https://competitor.com"
                      className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description <span className="text-zinc-500">(optional)</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of what they do..."
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* URLs to Monitor */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold">URLs to Monitor</h2>
                  <p className="text-sm text-zinc-500 mt-1">Add pages you want to track for changes</p>
                </div>
                <button
                  type="button"
                  onClick={addUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-accent hover:bg-accent/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add URL
                </button>
              </div>

              <div className="space-y-4">
                {urls.map((urlItem, index) => (
                  <div key={index} className="flex gap-3 animate-fadeIn">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={urlItem.url}
                        onChange={(e) => updateUrl(index, 'url', e.target.value)}
                        placeholder="https://competitor.com/pricing"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                    <select
                      value={urlItem.type}
                      onChange={(e) => updateUrl(index, 'type', e.target.value)}
                      className="px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-colors min-w-[140px]"
                    >
                      {urlTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {urls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrl(index)}
                        className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-background rounded-xl">
                <p className="text-xs text-zinc-500">
                  <strong className="text-zinc-400">Tip:</strong> Add your competitor's pricing page to get notified of price changes, 
                  and their blog or changelog to stay updated on new features.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between">
              <Link
                href="/competitors"
                className="px-5 py-2.5 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading || !form.name || !form.website}
                className="flex items-center gap-2 px-6 py-3 bg-accent-gradient rounded-xl text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Competitor
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
