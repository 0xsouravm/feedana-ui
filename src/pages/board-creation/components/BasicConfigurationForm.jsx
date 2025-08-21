import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const BasicConfigurationForm = ({ formData, onFormChange, errors }) => {
  const categoryOptions = [
    { value: 'employee-feedback', label: 'Employee Feedback' },
    { value: 'product-reviews', label: 'Product Reviews' },
    { value: 'community-input', label: 'Community Input' },
    { value: 'whistleblower', label: 'Whistleblower Submissions' },
    { value: 'customer-service', label: 'Customer Service' },
    { value: 'research-survey', label: 'Research Survey' },
    { value: 'event-feedback', label: 'Event Feedback' },
    { value: 'general', label: 'General Feedback' }
  ];

  const handleInputChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  return (
    <div className="glass-card p-8 rounded-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
          <Icon name="Settings" size={20} className="text-accent" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Basic Configuration</h3>
          <p className="text-sm text-muted-foreground">Set up your feedback board fundamentals</p>
        </div>
      </div>
      <div className="space-y-6">
        <Input
          label="Board Title"
          type="text"
          placeholder="Enter a clear, descriptive title for your feedback board"
          value={formData?.title}
          onChange={(e) => handleInputChange('title', e?.target?.value)}
          error={errors?.title}
          required
          description="This will be visible to all contributors"
          className="mb-4"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Board Description
          </label>
          <textarea
            className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none transition-all duration-200"
            rows={4}
            placeholder="Describe what kind of feedback you're looking for. Be specific about topics, tone, and expectations to get better responses."
            value={formData?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
          />
          {errors?.description && (
            <p className="text-sm text-error">{errors?.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {formData?.description?.length}/500 characters
          </p>
        </div>

        <Select
          label="Category"
          description="Choose the category that best fits your feedback board"
          options={categoryOptions}
          value={formData?.category}
          onChange={(value) => handleInputChange('category', value)}
          error={errors?.category}
          required
          searchable
          className="mb-4"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Expected Duration"
            type="number"
            placeholder="30"
            value={formData?.duration}
            onChange={(e) => handleInputChange('duration', e?.target?.value)}
            error={errors?.duration}
            description="How many days should this board remain active?"
            min="1"
            max="365"
          />

          <Input
            label="Target Responses"
            type="number"
            placeholder="100"
            value={formData?.targetResponses}
            onChange={(e) => handleInputChange('targetResponses', e?.target?.value)}
            error={errors?.targetResponses}
            description="Approximate number of responses you're seeking"
            min="1"
            max="10000"
          />
        </div>

        <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={16} className="text-accent mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Configuration Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Clear titles get 3x more quality responses</li>
                <li>• Specific descriptions reduce irrelevant feedback by 60%</li>
                <li>• Shorter durations create urgency and higher engagement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicConfigurationForm;