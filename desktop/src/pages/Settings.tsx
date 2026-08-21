import { useState } from 'react';
import { User, Home, Bell, Cloud, LogOut, ChevronRight, Shield, Palette, Globe } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'household' | 'notifications' | 'sync'>('profile');

  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleSync = () => { setSyncing(true); setTimeout(() => { setSyncing(false); alert('Sync complete! (Demo)'); }, 1500); };
  const handleSignOut = () => { if (confirm('Sign out of Sustainability Hub?')) alert('Signed out. (Demo)'); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-dark-200 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        <div className="w-56 space-y-1 shrink-0">
          {[
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'household', label: 'Household', icon: Home },
            { key: 'notifications', label: 'Notifications', icon: Bell },
            { key: 'sync', label: 'Cloud Sync', icon: Cloud },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-primary/15 text-primary' : 'text-dark-200 hover:bg-dark-600 hover:text-dark-50'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
          <div className="border-t border-dark-500 my-2" />
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card space-y-4">
              <h3 className="text-sm font-semibold text-dark-100">Profile Settings</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white text-xl font-bold">SV</div>
                <div>
                  <p className="font-medium">Sahil Virdi</p>
                  <p className="text-sm text-dark-200">sahil@example.com</p>
                  <button onClick={() => alert('Avatar updated! (Demo)')} className="text-xs text-primary mt-1">Change avatar</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-dark-300 mb-1 block">Full Name</label>
                  <input defaultValue="Sahil Virdi" className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-dark-300 mb-1 block">Email</label>
                  <input defaultValue="sahil@example.com" className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-dark-300 mb-1 block">Location</label>
                  <input defaultValue="Ontario, Canada" className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-dark-300 mb-1 block">Dietary Preference</label>
                  <select className="w-full">
                    <option>Omnivore</option>
                    <option>Vegetarian</option>
                    <option>Vegan</option>
                    <option>Pescatarian</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSave} className={saved ? 'btn-primary bg-green-500' : 'btn-primary'}>{saved ? 'Saved!' : 'Save Changes'}</button>
            </div>
          )}

          {activeTab === 'household' && (
            <div className="card space-y-4">
              <h3 className="text-sm font-semibold text-dark-100">Household Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-dark-300 mb-1 block">Household Size</label>
                  <input type="number" defaultValue={4} className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-dark-300 mb-1 block">Home Type</label>
                  <select className="w-full">
                    <option>House</option>
                    <option>Apartment</option>
                    <option>Condo</option>
                    <option>Townhouse</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-dark-300 mb-1 block">Square Footage</label>
                  <input type="number" defaultValue={2000} className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-dark-300 mb-1 block">Heating Type</label>
                  <select className="w-full">
                    <option>Natural Gas</option>
                    <option>Electric</option>
                    <option>Oil</option>
                    <option>Heat Pump</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSave} className={saved ? 'btn-primary bg-green-500' : 'btn-primary'}>{saved ? 'Saved!' : 'Save Changes'}</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card space-y-4">
              <h3 className="text-sm font-semibold text-dark-100">Notification Preferences</h3>
              {[
                { label: 'Weekly summary report', desc: 'Get a weekly email summary of your sustainability metrics', default: true },
                { label: 'Streak reminders', desc: 'Daily reminder to log food waste and maintain your streak', default: true },
                { label: 'Carbon budget alerts', desc: 'Alert when approaching monthly carbon budget', default: false },
                { label: 'Energy-saving tips', desc: 'Personalized tips based on your energy usage patterns', default: true },
                { label: 'Achievement badges', desc: 'Notification when you earn a new achievement', default: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-dark-300 mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                    <div className="w-9 h-5 bg-dark-400 peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="card space-y-4">
              <h3 className="text-sm font-semibold text-dark-100">Cloud Sync</h3>
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-primary">Sync is active</p>
                    <p className="text-xs text-dark-200">Last synced: 2 minutes ago</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {['Scans', 'Energy Bills', 'Food Waste Logs', 'Settings'].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                    <span className="text-sm">{item}</span>
                    <span className="text-xs text-primary">Up to date</span>
                  </div>
                ))}
              </div>
              <button onClick={handleSync} disabled={syncing} className="btn-outline w-full">{syncing ? 'Syncing...' : 'Sync Now'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
