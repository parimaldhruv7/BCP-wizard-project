import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Calendar, User, Building, AlertTriangle, Users } from 'lucide-react';
import { API_BASE_URL } from './api';

interface BCPReportsProps {
  onBack: () => void;
}

interface BCP {
  id: string;
  name: string;
  business_unit: string;
  sub_business_unit: string;
  service_name: string;
  service_description: string;
  created_at: string;
}

interface BCPReport {
  bcp: BCP[];
  processes: any[];
  bia: any[];
  communications: any[];
  risks: any[];
}

const BCPReports: React.FC<BCPReportsProps> = ({ onBack }) => {
  const [bcps, setBcps] = useState<BCP[]>([]);
  const [selectedReport, setSelectedReport] = useState<BCPReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchBCPs();
  }, []);

  const fetchBCPs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bcps`);
      const data = await response.json();
      setBcps(data);
    } catch (error) {
      console.error('Error fetching BCPs:', error);
    }
    setLoading(false);
  };

  const fetchReport = async (bcpId: string) => {
    setReportLoading(true);
    try {
     const response = await fetch(`${API_BASE_URL}/api/bcp/${bcpId}/report`);
      const data = await response.json();
      setSelectedReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
    setReportLoading(false);
  };

  if (selectedReport) {
    const bcp = selectedReport.bcp[0];
    const bia = selectedReport.bia[0];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Reports
              </button>
              <h1 className="text-3xl font-bold text-gray-900">BCP Report</h1>
              <div></div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Report Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{bcp.name}</h2>
                <p className="text-blue-100">Service: {bcp.service_name}</p>
                <p className="text-blue-100 text-sm">Generated: {new Date().toLocaleDateString()}</p>
              </div>

              <div className="p-8">
                {/* Basic Information */}
                <section className="mb-8">
                  <div className="flex items-center mb-4">
                    <Building className="w-6 h-6 text-blue-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 bg-gray-50 rounded-lg p-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">BCP Name</label>
                      <p className="text-gray-900 font-medium">{bcp.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Service Name</label>
                      <p className="text-gray-900 font-medium">{bcp.service_name}</p>
                    </div>
                    {bcp.business_unit && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Business Unit</label>
                        <p className="text-gray-900">{bcp.business_unit}</p>
                      </div>
                    )}
                    {bcp.sub_business_unit && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Sub-Business Unit</label>
                        <p className="text-gray-900">{bcp.sub_business_unit}</p>
                      </div>
                    )}
                    {bcp.service_description && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Service Description</label>
                        <p className="text-gray-900">{bcp.service_description}</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Processes */}
                {selectedReport.processes.length > 0 && (
                  <section className="mb-8">
                    <div className="flex items-center mb-4">
                      <User className="w-6 h-6 text-green-600 mr-2" />
                      <h3 className="text-xl font-semibold text-gray-900">Processes & Owners</h3>
                    </div>
                    <div className="space-y-4">
                      {selectedReport.processes.map((process, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-6 border">
                          <h4 className="font-semibold text-gray-900 mb-4">{process.name}</h4>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">Primary Owner</h5>
                              <p className="text-gray-900">{process.primary_owner_name}</p>
                              <p className="text-gray-600 text-sm">{process.primary_owner_email}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">Backup Owner</h5>
                              <p className="text-gray-900">{process.backup_owner_name}</p>
                              <p className="text-gray-600 text-sm">{process.backup_owner_email}</p>
                            </div>
                            {process.sites && process.sites.length > 0 && (
                              <div className="md:col-span-2">
                                <h5 className="font-medium text-gray-700 mb-2">Sites</h5>
                                <div className="flex flex-wrap gap-2">
                                  {process.sites.map((site: string, siteIndex: number) => (
                                    <span key={siteIndex} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                      {site}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Business Impact Analysis */}
                {bia && (
                  <section className="mb-8">
                    <div className="flex items-center mb-4">
                      <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
                      <h3 className="text-xl font-semibold text-gray-900">Business Impact Analysis</h3>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {bia.criticality_value && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Criticality (MTD)</label>
                            <p className="text-gray-900 font-medium">{bia.criticality_value} {bia.criticality_unit}</p>
                          </div>
                        )}
                        {bia.headcount_requirement && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Headcount Requirement</label>
                            <p className="text-gray-900 font-medium">{bia.headcount_requirement} people</p>
                          </div>
                        )}
                        {bia.dependencies && bia.dependencies.length > 0 && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-2">Dependencies</label>
                            <div className="space-y-2">
                              {bia.dependencies.map((dep: any, index: number) => (
                                <div key={index} className="flex items-start">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium mr-3 mt-0.5">
                                    {dep.type}
                                  </span>
                                  <p className="text-gray-900">{dep.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* Communications */}
                {selectedReport.communications.length > 0 && (
                  <section className="mb-8">
                    <div className="flex items-center mb-4">
                      <Users className="w-6 h-6 text-purple-600 mr-2" />
                      <h3 className="text-xl font-semibold text-gray-900">Communication Contacts</h3>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="grid gap-4">
                        {selectedReport.communications.map((comm, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4">
                            <div>
                              <p className="font-medium text-gray-900">{comm.name}</p>
                              <p className="text-gray-600 text-sm">{comm.email}</p>
                            </div>
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm capitalize">
                              {comm.type.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Risks */}
                {selectedReport.risks.length > 0 && selectedReport.risks[0].description && (
                  <section className="mb-8">
                    <div className="flex items-center mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                      <h3 className="text-xl font-semibold text-gray-900">Risk Assessment</h3>
                    </div>
                    <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                      <p className="text-gray-900">{selectedReport.risks[0].description}</p>
                    </div>
                  </section>
                )}

                {/* Report Footer */}
                <div className="border-t pt-6 mt-8">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <p>Created: {new Date(bcp.created_at).toLocaleString()}</p>
                    <p>Report ID: {bcp.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            <h1 className="text-3xl font-bold text-gray-900">BCP Reports</h1>
            <div></div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : bcps.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No BCPs Found</h3>
              <p className="text-gray-600 mb-6">Create your first Business Continuity Plan to see reports here.</p>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New BCP
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {bcps.map((bcp) => (
                <div key={bcp.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{bcp.name}</h3>
                        <p className="text-gray-600">{bcp.service_name}</p>
                        {bcp.business_unit && (
                          <p className="text-sm text-gray-500 mt-1">{bcp.business_unit}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(bcp.created_at).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => fetchReport(bcp.id)}
                          disabled={reportLoading}
                          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {reportLoading ? (
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FileText className="w-4 h-4 mr-2" />
                          )}
                          {reportLoading ? 'Loading...' : 'View Report'}
                        </button>
                      </div>
                    </div>
                    
                    {bcp.service_description && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 text-sm">{bcp.service_description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BCPReports;