import React, { useState } from 'react';
import BCPWizard from './components/BCPWizard';
import BCPReports from './components/BCPReports';
import { FileText, Shield, ArrowLeft } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'wizard' | 'reports'>('home');

  const renderView = () => {
    switch (currentView) {
      case 'wizard':
        return <BCPWizard onComplete={() => setCurrentView('reports')} onBack={() => setCurrentView('home')} />;
      case 'reports':
        return <BCPReports onBack={() => setCurrentView('home')} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="container mx-auto px-4 py-12">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Business Continuity Planning
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Create comprehensive business continuity plans with our intuitive wizard interface
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div 
                  onClick={() => setCurrentView('wizard')}
                  className="group cursor-pointer bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Create New BCP</h3>
                  <p className="text-gray-600 mb-6">
                    Start the interactive wizard to create a comprehensive business continuity plan for your organization.
                  </p>
                  <div className="text-blue-600 font-semibold group-hover:text-indigo-600 transition-colors">
                    Start Wizard →
                  </div>
                </div>
                
                <div 
                  onClick={() => setCurrentView('reports')}
                  className="group cursor-pointer bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">View Reports</h3>
                  <p className="text-gray-600 mb-6">
                    Access and review existing business continuity plans and generate detailed reports.
                  </p>
                  <div className="text-teal-600 font-semibold group-hover:text-cyan-600 transition-colors">
                    View Reports →
                  </div>
                </div>
              </div>
              
              <div className="mt-16 text-center">
                <div className="inline-flex items-center space-x-8 text-sm text-gray-500">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Secure Data Storage
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Interactive Wizard
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    Detailed Reports
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderView();
}

export default App;