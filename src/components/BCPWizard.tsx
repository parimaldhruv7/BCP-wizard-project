import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, AlertCircle } from 'lucide-react';
import StepIndicator from './StepIndicator';
import { API_BASE_URL } from './api';

interface BCPWizardProps {
  onComplete: () => void;
  onBack: () => void;
}

interface Process {
  name: string;
  sites: string[];
  primaryOwner: { name: string; email: string };
  backupOwner: { name: string; email: string };
}

interface Communication {
  name: string;
  email: string;
  type: string;
}

interface Dependency {
  type: string;
  description: string;
}

const BCPWizard: React.FC<BCPWizardProps> = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bcpId, setBcpId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Step 1 data
  const [bcpName, setBcpName] = useState('');
  const [businessUnit, setBusinessUnit] = useState('');
  const [subBusinessUnit, setSubBusinessUnit] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [processes, setProcesses] = useState<Process[]>([
    { name: '', sites: [], primaryOwner: { name: '', email: '' }, backupOwner: { name: '', email: '' } }
  ]);

  // Step 2 data
  const [criticalityUnit, setCriticalityUnit] = useState('Hours');
  const [criticalityValue, setCriticalityValue] = useState('');
  const [headcountRequirement, setHeadcountRequirement] = useState('');
  const [dependencies, setDependencies] = useState<Dependency[]>([]);

  // Step 3 data
  const [communications, setCommunications] = useState<Communication[]>([
    { name: '', email: '', type: 'individual' }
  ]);

  // Step 4 data
  const [riskDescription, setRiskDescription] = useState('');

  const steps = [
    'Service & Process',
    'Business Impact Analysis',
    'Communication',
    'Risk Assessment'
  ];

  const addProcess = () => {
    setProcesses([...processes, { 
      name: '', 
      sites: [], 
      primaryOwner: { name: '', email: '' }, 
      backupOwner: { name: '', email: '' } 
    }]);
  };

  const removeProcess = (index: number) => {
    setProcesses(processes.filter((_, i) => i !== index));
  };

  const updateProcess = (index: number, field: string, value: any) => {
    const updatedProcesses = [...processes];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (updatedProcesses[index] as any)[parent][child] = value;
    } else {
      (updatedProcesses[index] as any)[field] = value;
    }
    setProcesses(updatedProcesses);
  };

  const addSiteToProcess = (processIndex: number, site: string) => {
    if (site.trim()) {
      const updatedProcesses = [...processes];
      updatedProcesses[processIndex].sites.push(site.trim());
      setProcesses(updatedProcesses);
    }
  };

  const removeSiteFromProcess = (processIndex: number, siteIndex: number) => {
    const updatedProcesses = [...processes];
    updatedProcesses[processIndex].sites.splice(siteIndex, 1);
    setProcesses(updatedProcesses);
  };

  const addDependency = () => {
    setDependencies([...dependencies, { type: 'Upstream', description: '' }]);
  };

  const removeDependency = (index: number) => {
    setDependencies(dependencies.filter((_, i) => i !== index));
  };

  const updateDependency = (index: number, field: string, value: string) => {
    const updatedDependencies = [...dependencies];
    (updatedDependencies[index] as any)[field] = value;
    setDependencies(updatedDependencies);
  };

  const addCommunication = () => {
    setCommunications([...communications, { name: '', email: '', type: 'individual' }]);
  };

  const removeCommunication = (index: number) => {
    setCommunications(communications.filter((_, i) => i !== index));
  };

  const updateCommunication = (index: number, field: string, value: string) => {
    const updatedCommunications = [...communications];
    (updatedCommunications[index] as any)[field] = value;
    setCommunications(updatedCommunications);
  };

  const saveStep = async (stepNumber: number) => {
    setLoading(true);
    try {
      if (stepNumber === 1) {
        const response = await fetch(`${API_BASE_URL}/api/bcp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: bcpName,
            businessUnit,
            subBusinessUnit,
            serviceName,
            serviceDescription
          })
        });
        const data = await response.json();
        setBcpId(data.id);

        await fetch(`${API_BASE_URL}/api/bcp/${data.id}/processes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ processes })
        });
      } else if (stepNumber === 2) {
        await fetch(`${API_BASE_URL}/api/bcp/${bcpId}/bia`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            criticalityUnit,
            criticalityValue: parseInt(criticalityValue),
            headcountRequirement: parseInt(headcountRequirement),
            dependencies
          })
        });
      } else if (stepNumber === 3) {
        await fetch(`${API_BASE_URL}/api/bcp/${bcpId}/communications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ communications })
        });
      } else if (stepNumber === 4) {
        await fetch(`${API_BASE_URL}/api/bcp/${bcpId}/risks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: riskDescription })
        });
      }
    } catch (error) {
      console.error('Error saving step:', error);
    }
    setLoading(false);
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      await saveStep(currentStep);
      setCurrentStep(currentStep + 1);
    } else {
      await saveStep(currentStep);
      onComplete();
    }
  };

  const handleSkip = () => {
    if (currentStep === 2 || currentStep === 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bcpName.trim() && serviceName.trim() && processes.every(p => p.name.trim());
      case 2:
        return true; // Can skip this step
      case 3:
        return communications.every(c => c.name.trim() && c.email.trim());
      case 4:
        return true; // Can skip this step
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Service & Process Capture</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-blue-700">
                      <span className="text-red-500">*</span> indicates mandatory fields
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BCP Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bcpName}
                    onChange={(e) => setBcpName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter BCP name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Unit
                  </label>
                  <input
                    type="text"
                    value={businessUnit}
                    onChange={(e) => setBusinessUnit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter business unit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub-Business Unit
                  </label>
                  <input
                    type="text"
                    value={subBusinessUnit}
                    onChange={(e) => setSubBusinessUnit(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter sub-business unit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="What service do you want to protect?"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Description
                </label>
                <textarea
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Describe the service in detail"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Processes</h3>
                <button
                  onClick={addProcess}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Process
                </button>
              </div>

              {processes.map((process, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 mb-4 border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Process {index + 1}</h4>
                    {processes.length > 1 && (
                      <button
                        onClick={() => removeProcess(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Process Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={process.name}
                        onChange={(e) => updateProcess(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter process name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sites
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Add site location"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addSiteToProcess(index, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            addSiteToProcess(index, input.value);
                            input.value = '';
                          }}
                          className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {process.sites.map((site, siteIndex) => (
                          <span
                            key={siteIndex}
                            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                          >
                            {site}
                            <button
                              onClick={() => removeSiteFromProcess(index, siteIndex)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Primary Owner</h5>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={process.primaryOwner.name}
                          onChange={(e) => updateProcess(index, 'primaryOwner.name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Primary owner name"
                        />
                        <input
                          type="email"
                          value={process.primaryOwner.email}
                          onChange={(e) => updateProcess(index, 'primaryOwner.email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Primary owner email"
                        />
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Backup Owner</h5>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={process.backupOwner.name}
                          onChange={(e) => updateProcess(index, 'backupOwner.name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Backup owner name"
                        />
                        <input
                          type="email"
                          value={process.backupOwner.email}
                          onChange={(e) => updateProcess(index, 'backupOwner.email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Backup owner email"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Impact Analysis (BIA)</h2>
              
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-amber-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-amber-700">
                      This step can be skipped if information is not available
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Criticality (MTD) - When does this process need to be restored?
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={criticalityUnit}
                      onChange={(e) => setCriticalityUnit(e.target.value)}
                      className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Hours">Hours</option>
                      <option value="Days">Days</option>
                    </select>
                    <input
                      type="number"
                      value={criticalityValue}
                      onChange={(e) => setCriticalityValue(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headcount Requirement
                  </label>
                  <input
                    type="number"
                    value={headcountRequirement}
                    onChange={(e) => setHeadcountRequirement(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Minimum people required"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    How many people are required at minimum if the site is disrupted?
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Dependencies</h3>
                  <button
                    onClick={addDependency}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Dependency
                  </button>
                </div>

                {dependencies.map((dependency, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Dependency {index + 1}</h4>
                      <button
                        onClick={() => removeDependency(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                          value={dependency.type}
                          onChange={(e) => updateDependency(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Upstream">Upstream</option>
                          <option value="IT">IT</option>
                          <option value="Equipment">Equipment</option>
                          <option value="External">External</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input
                          type="text"
                          value={dependency.description}
                          onChange={(e) => updateDependency(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Describe the dependency"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Communication</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-blue-700">
                      Add individuals, groups, or distribution lists who should be notified if this service is disrupted
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Disruption Notifications</h3>
                <button
                  onClick={addCommunication}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </button>
              </div>

              {communications.map((communication, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 mb-4 border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Contact {index + 1}</h4>
                    {communications.length > 1 && (
                      <button
                        onClick={() => removeCommunication(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={communication.name}
                        onChange={(e) => updateCommunication(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Contact name or group"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={communication.email}
                        onChange={(e) => updateCommunication(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={communication.type}
                        onChange={(e) => updateCommunication(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="individual">Individual</option>
                        <option value="group">Group</option>
                        <option value="distribution_list">Distribution List</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Assessment</h2>
              
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-amber-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-amber-700">
                      This step is optional. You can skip if no major risks are identified.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Major Risks
                </label>
                <textarea
                  value={riskDescription}
                  onChange={(e) => setRiskDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Describe any major risks (e.g., power outage, cyber incident, supply issue, regulatory changes, key personnel dependencies, etc.)"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Include risks like power outages, cyber incidents, supply chain issues, regulatory changes, or any other factors that could impact business continuity.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            <h1 className="text-3xl font-bold text-gray-900">BCP Wizard</h1>
            <div></div>
          </div>

          {/* Step Indicator */}
          <StepIndicator steps={steps} currentStep={currentStep} />

          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              {(currentStep === 2 || currentStep === 4) && (
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Skip Step
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className={`flex items-center px-8 py-3 rounded-lg transition-all ${
                  canProceed() && !loading
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : currentStep === 4 ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Saving...' : currentStep === 4 ? 'Complete' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BCPWizard;