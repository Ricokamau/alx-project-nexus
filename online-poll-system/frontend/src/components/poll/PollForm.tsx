import React, { useState } from 'react';
import { PollCreateData } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import './PollForm.css';

interface PollFormProps {
  onSubmit: (data: PollCreateData) => void;
  loading: boolean;
}

const PollForm: React.FC<PollFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    expires_at: ''
  });
  const [options, setOptions] = useState<string[]>(['', '']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate question
    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    } else if (formData.question.trim().length < 10) {
      newErrors.question = 'Question must be at least 10 characters long';
    } else if (formData.question.trim().length > 200) {
      newErrors.question = 'Question must be less than 200 characters';
    }

    // Validate options
    const validOptions = options.filter(option => option.trim().length > 0);
    if (validOptions.length < 2) {
      newErrors.options = 'At least 2 options are required';
    } else if (validOptions.length > 10) {
      newErrors.options = 'Maximum 10 options allowed';
    }

    // Check for duplicate options
    const uniqueOptions = new Set(validOptions.map(opt => opt.trim().toLowerCase()));
    if (uniqueOptions.size !== validOptions.length) {
      newErrors.options = 'Options must be unique';
    }

    // Validate option length
    for (let i = 0; i < validOptions.length; i++) {
      if (validOptions[i].trim().length > 100) {
        newErrors.options = 'Each option must be less than 100 characters';
        break;
      }
    }

    // Validate expiry date
    if (formData.expires_at) {
      const expiryDate = new Date(formData.expires_at);
      const now = new Date();
      if (expiryDate <= now) {
        newErrors.expires_at = 'Expiry date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const validOptions = options.filter(option => option.trim().length > 0);
    
    const pollData: PollCreateData = {
      question: formData.question.trim(),
      description: formData.description.trim(),
      // ✅ FIXED: Convert string options to objects with 'text' field
      options: validOptions.map(opt => ({ text: opt.trim() })),
      ...(formData.expires_at && { expires_at: formData.expires_at })
    };

    console.log('Submitting poll data:', pollData); // Debug log
    onSubmit(pollData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    
    // Clear options error when user starts typing
    if (errors.options) {
      setErrors(prev => ({ ...prev, options: '' }));
    }
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const resetForm = () => {
    setFormData({ question: '', description: '', expires_at: '' });
    setOptions(['', '']);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="poll-form-container">
        <LoadingSpinner size="large" />
        <p>Creating your poll...</p>
      </div>
    );
  }

  return (
    <div className="poll-form-container">
      <div className="poll-form-header">
        <h2>Create a New Poll</h2>
        <p>Create an engaging poll to gather opinions from your audience</p>
      </div>

      <form onSubmit={handleSubmit} className="poll-form">
        {/* Question Field */}
        <div className="form-group">
          <label htmlFor="question" className="form-label required">
            Poll Question
          </label>
          <input
            type="text"
            id="question"
            className={`form-control ${errors.question ? 'error' : ''}`}
            value={formData.question}
            onChange={(e) => handleInputChange('question', e.target.value)}
            placeholder="What question would you like to ask?"
            maxLength={200}
          />
          {errors.question && <div className="error-message">{errors.question}</div>}
          <div className="character-count">
            {formData.question.length}/200 characters
          </div>
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description (Optional)
          </label>
          <textarea
            id="description"
            className="form-control"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Provide additional context or instructions for your poll..."
            rows={3}
            maxLength={500}
          />
          <div className="character-count">
            {formData.description.length}/500 characters
          </div>
        </div>

        {/* Options Section */}
        <div className="form-group">
          <label className="form-label required">
            Poll Options
          </label>
          <div className="options-container">
            {options.map((option, index) => (
              <div key={index} className="option-input-group">
                <div className="option-number">{index + 1}</div>
                <input
                  type="text"
                  className={`form-control option-input ${errors.options ? 'error' : ''}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={100}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm remove-option"
                    onClick={() => removeOption(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {errors.options && <div className="error-message">{errors.options}</div>}
          
          {options.length < 10 && (
            <button
              type="button"
              className="btn btn-outline-primary add-option-btn"
              onClick={addOption}
            >
              + Add Another Option
            </button>
          )}
          
          <div className="options-help">
            {options.filter(opt => opt.trim()).length}/10 options
          </div>
        </div>

        {/* Expiry Date Field */}
        <div className="form-group">
          <label htmlFor="expires_at" className="form-label">
            Expiry Date (Optional)
          </label>
          <input
            type="datetime-local"
            id="expires_at"
            className={`form-control ${errors.expires_at ? 'error' : ''}`}
            value={formData.expires_at}
            onChange={(e) => handleInputChange('expires_at', e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
          {errors.expires_at && <div className="error-message">{errors.expires_at}</div>}
          <div className="help-text">
            Leave empty for polls that never expire
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={resetForm}
          >
            Reset Form
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            Create Poll
          </button>
        </div>
      </form>
    </div>
  );
};

export default PollForm;