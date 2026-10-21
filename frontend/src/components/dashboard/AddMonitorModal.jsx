import React, { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { Input } from '../common/Input.jsx';
import { Button } from '../common/Button.jsx';
import { monitorService } from '../../services/monitorService.js';
import { Plus, Globe, Clock, AlertCircle } from 'lucide-react';

export const AddMonitorModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [interval, setInterval] = useState('60');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Monitor name is required';
    }

    if (!url.trim()) {
      newErrors.url = 'Target URL is required';
    } else if (!/^https?:\/\/.+\..+/i.test(url.trim())) {
      newErrors.url = 'Must be a valid URL starting with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await monitorService.createMonitor({
        name: name.trim(),
        url: url.trim(),
        interval: parseInt(interval, 10),
      });

      // Reset form
      setName('');
      setUrl('');
      setInterval('60');
      setErrors({});

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setServerError(
        err.message || 'Failed to create monitor. Please check backend connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Monitor"
      description="Configure a target URL to begin real-time uptime and latency tracking."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <Input
          label="Monitor Name"
          placeholder="e.g. Production API Gateway"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          disabled={isSubmitting}
        />

        <Input
          label="Target URL"
          placeholder="https://api.yourdomain.com/health"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={errors.url}
          helperText="We will send automated HTTP GET requests to this address."
          disabled={isSubmitting}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">
            Check Frequency
          </label>
          <div className="relative">
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2 text-sm bg-dark-900/90 border border-dark-700 rounded-lg text-slate-100 focus:outline-none focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="30">Every 30 seconds (High frequency)</option>
              <option value="60">Every 1 minute (Recommended)</option>
              <option value="300">Every 5 minutes</option>
              <option value="600">Every 10 minutes</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-dark-700/60">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={Plus}
            isLoading={isSubmitting}
          >
            Create Monitor
          </Button>
        </div>
      </form>
    </Modal>
  );
};
