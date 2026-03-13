/**
 * ReportForm – citizen damage reporting form.
 *
 * Allows users to upload an image + GPS location + description.
 * Calls POST /api/report-damage.
 *
 * Props:
 *   onSuccess – callback(response) after successful submission
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { reportDamage } from '../../utils/api';

export default function ReportForm({ onSuccess }) {
  const [form, setForm] = useState({
    latitude: '',
    longitude: '',
    description: '',
    reported_by: '',
    traffic_density: '50',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /** Try to get GPS from the browser */
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success('Location captured!');
      },
      () => toast.error('Failed to get location')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { toast.error('Please select an image'); return; }
    if (!form.latitude || !form.longitude) { toast.error('GPS location is required'); return; }

    setLoading(true);
    const data = new FormData();
    data.append('image', image);
    Object.entries(form).forEach(([k, v]) => data.append(k, v));

    try {
      const result = await reportDamage(data);
      toast.success('Damage report submitted!');
      onSuccess && onSuccess(result);
      // Reset form
      setForm({ latitude: '', longitude: '', description: '', reported_by: '', traffic_density: '50' });
      setImage(null);
      setPreview(null);
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image upload */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">Road Damage Photo *</label>
        <div
          className="border-2 border-dashed border-slate-600 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => document.getElementById('damage-image-input').click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
          ) : (
            <div className="text-slate-500">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm">Click to upload damage photo</p>
              <p className="text-xs mt-1">JPEG, PNG, WEBP – max 10 MB</p>
            </div>
          )}
        </div>
        <input
          id="damage-image-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* GPS */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm text-slate-400">GPS Location *</label>
          <button type="button" onClick={handleGeolocate} className="text-xs text-blue-400 hover:text-blue-300">
            📍 Use my location
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            placeholder="Latitude"
            required
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <input
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            placeholder="Longitude"
            required
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the road damage…"
          rows={3}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Reported by */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">Your name (optional)</label>
        <input
          name="reported_by"
          value={form.reported_by}
          onChange={handleChange}
          placeholder="Anonymous"
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Traffic density */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Road Traffic Density: <span className="text-white">{form.traffic_density}</span> / 100
        </label>
        <input
          type="range"
          name="traffic_density"
          min="0"
          max="100"
          value={form.traffic_density}
          onChange={handleChange}
          className="w-full accent-blue-500"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-semibold rounded-xl transition-colors text-sm"
      >
        {loading ? '🔄 Analysing with AI…' : '🚨 Submit Damage Report'}
      </button>
    </form>
  );
}
