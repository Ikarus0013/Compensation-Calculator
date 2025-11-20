import React, { useState } from 'react';
import { Calculator, Users, TrendingUp, Target, Briefcase, Settings, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Tooltip from './Tooltip';

interface CompensationState {
  baseSalary: number;
  currentArr: number;
  subscribers: number;
  subscriberPlan: number;
  enterpriseClients: number;
  enterpriseAcv: number;
  
  // Bonus 1: Self Serve
  annualSignups: number;
  signupBonusRate: number;
  signupBonusThreshold: number; // 1000

  // Bonus 2: SQLs
  annualSqls: number;
  sqlCommission: number;
  sqlFloorEnabled: boolean;
  sqlFloorPerQuarter: number;
}

const CompensationCalculator: React.FC = () => {
  const [state, setState] = useState<CompensationState>({
    baseSalary: 80000, // Assumption
    currentArr: 2000000,
    subscribers: 100,
    subscriberPlan: 25,
    enterpriseClients: 40,
    enterpriseAcv: 49250,
    
    annualSignups: 1200,
    signupBonusRate: 10000,
    signupBonusThreshold: 1000,
    
    annualSqls: 400,
    sqlCommission: 40,
    sqlFloorEnabled: true,
    sqlFloorPerQuarter: 90,
  });

  // Calculations
  const subscriberArr = state.subscribers * state.subscriberPlan * 12;
  const enterpriseArr = state.enterpriseClients * state.enterpriseAcv;
  const totalCalculatedArr = subscriberArr + enterpriseArr; // For validation/display

  // Goal Simulation Calculations
  const goalArr = 10000000; // 10 Million
  const arrGap = goalArr - state.currentArr;
  
  // Assumptions for Gap Filling (Proportional Growth based on current split)
  // We need to split the 8M gap between Self-Serve and Enterprise. 
  // Let's assume the user might want to see "If we did it all via X" or a mix.
  // For a simple simulation, let's assume the current ratio of revenue contribution continues, 
  // or simpler: show what it takes in EITHER category to hit the gap.
  
  // Scenario A: Fill Gap with Self Serve Only
  // New Annual Revenue needed = arrGap
  // Annual Revenue per User = state.subscriberPlan * 12
  const additionalSubscribersNeeded = arrGap / (state.subscriberPlan * 12);
  const additionalSignupsNeeded = additionalSubscribersNeeded; // Assuming 100% retention for simple math, or just "new signupsnet"
  // Signups Bonus for this scenario
  const goalSelfServeBonus = Math.floor(additionalSignupsNeeded / state.signupBonusThreshold) * state.signupBonusRate;

  // Scenario B: Fill Gap with Enterprise Only
  // New Annual Revenue needed = arrGap
  // Revenue per Client = state.enterpriseAcv
  const additionalEnterpriseClientsNeeded = arrGap / state.enterpriseAcv;
  // Assuming a standard conversion rate from SQL to Deal (e.g. 20% or 1:5) to calc SQLs needed
  // Let's assume a conversion rate is needed here or we just estimate SQLs based on a fixed ratio.
  // "Lets also assume benchmark Conversion rates for Tech industry" -> ~20% SQL to Win is optimistic but standard-ish for high quality
  const assumedWinRate = 0.20; 
  const additionalSqlsNeeded = additionalEnterpriseClientsNeeded / assumedWinRate;
  const goalSqlBonus = additionalSqlsNeeded * state.sqlCommission;


  // Bonus 1: Self Serve
  // "Every 1000 new Self serve Sign ups I receive a 10k Bonus Annually"
  const selfServeBonus = Math.floor(state.annualSignups / state.signupBonusThreshold) * state.signupBonusRate;

  // Bonus 2: SQLs
  // "Every SQL I receive 40€ (Optional Floor 90 SQL per Quarter)"
  // We'll assume consistent quarterly performance for the annual calculation
  const quarterlySqls = state.annualSqls / 4;
  const isFloorMet = !state.sqlFloorEnabled || (quarterlySqls >= state.sqlFloorPerQuarter);
  const sqlBonus = isFloorMet ? (state.annualSqls * state.sqlCommission) : 0;

  const totalBonus = selfServeBonus + sqlBonus;
  const totalCompensation = state.baseSalary + totalBonus;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('de-DE').format(val);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('compensation-calculator-container');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#f9fafb', // Match bg-gray-50
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page if content is long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('compensation-calculator.pdf');
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div id="compensation-calculator-container" className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-600" />
              Compensation Calculator
            </h1>
            <p className="text-gray-500 mt-2">
              Model your On-Target Earnings based on performance metrics.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-sm text-gray-500">Estimated Annual Compensation</div>
            <div className="text-4xl font-bold text-blue-600">{formatCurrency(totalCompensation)}</div>
          </div>
          <div className="md:hidden">
             <button 
               onClick={handleExportPDF}
               className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
               aria-label="Export PDF"
             >
               <Download className="w-6 h-6" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Base Assumptions Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-500" />
                <h2 className="font-semibold text-gray-700">Current Business Snapshot (Reference)</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current ARR (€)
                    <Tooltip content="Annual Recurring Revenue: The total yearly value of all active subscriptions and contracts." />
                  </label>
                  <input
                    type="number"
                    name="currentArr"
                    value={state.currentArr}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                   <div className="text-xs text-gray-400 mt-1">Calculated from inputs: {formatCurrency(totalCalculatedArr)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Salary (€)
                    <Tooltip content="The fixed annual salary component, excluding any performance-based bonuses." />
                  </label>
                  <input
                    type="number"
                    name="baseSalary"
                    value={state.baseSalary}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscribers (Count)
                    <Tooltip content="Number of customers on the self-serve monthly plan." />
                  </label>
                  <input
                    type="number"
                    name="subscribers"
                    value={state.subscribers}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                  <div className="text-xs text-gray-400 mt-1">Plan: {formatCurrency(state.subscriberPlan)}/mo</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enterprise Clients
                    <Tooltip content="Number of high-value clients typically acquired through a sales process." />
                  </label>
                  <input
                    type="number"
                    name="enterpriseClients"
                    value={state.enterpriseClients}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                  <div className="text-xs text-gray-400 mt-1">ACV: {formatCurrency(state.enterpriseAcv)}</div>
                </div>
              </div>
            </div>

            {/* Bonus 1: Self Serve Signups */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-semibold text-indigo-900">Bonus 1: Self-Serve Signups</h2>
                </div>
                <div className="text-indigo-700 font-bold">{formatCurrency(selfServeBonus)}</div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                  Policy: Every <strong>{state.signupBonusThreshold}</strong> new Self-serve Sign ups triggers a <strong>{formatCurrency(state.signupBonusRate)}</strong> Bonus Annually.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Projected Annual Signups
                      <Tooltip content="Estimated number of new self-serve signups for the year. Bonus is paid for every 1,000 new signups." />
                    </label>
                    <input
                      type="number"
                      name="annualSignups"
                      value={state.annualSignups}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                     <div className="text-sm text-gray-500">Progress to next bonus</div>
                     <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${(state.annualSignups % state.signupBonusThreshold) / state.signupBonusThreshold * 100}%` }}
                        ></div>
                     </div>
                     <div className="text-xs text-gray-400 mt-1 text-right">
                       {state.annualSignups % state.signupBonusThreshold} / {state.signupBonusThreshold}
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bonus 2: SQLs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-semibold text-emerald-900">Bonus 2: Sales Qualified Leads (SQL)</h2>
                </div>
                <div className="text-emerald-700 font-bold">{formatCurrency(sqlBonus)}</div>
              </div>
              <div className="p-6 space-y-4">
                 <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                  Policy: Receive <strong>{formatCurrency(state.sqlCommission)}</strong> per SQL.
                  {state.sqlFloorEnabled && ` Floor of ${state.sqlFloorPerQuarter} SQLs per Quarter required.`}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Projected Annual SQLs
                      <Tooltip content="Sales Qualified Leads: Potential customers vetted by marketing that meet criteria to be passed to sales." />
                    </label>
                    <input
                      type="number"
                      name="annualSqls"
                      value={state.annualSqls}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    />
                    <div className="text-xs text-gray-400 mt-1">Avg per Quarter: {Math.round(quarterlySqls)}</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                       <div className="flex items-center">
                         <span className="text-sm text-gray-700">Enable Quarterly Floor?</span>
                         <Tooltip content="If enabled, no bonus is paid if quarterly performance drops below the set minimum (Floor)." />
                       </div>
                       <input
                        type="checkbox"
                        name="sqlFloorEnabled"
                        checked={state.sqlFloorEnabled}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                       />
                    </div>
                    
                    {state.sqlFloorEnabled && (
                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Floor (SQLs per Quarter)</label>
                         <input
                            type="number"
                            name="sqlFloorPerQuarter"
                            value={state.sqlFloorPerQuarter}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                          />
                          {!isFloorMet && (
                            <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Below floor threshold (0 payout)
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Compensation Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base Salary</span>
                  <span className="font-medium">{formatCurrency(state.baseSalary)}</span>
                </div>
                
                <div className="flex justify-between items-center text-indigo-600">
                  <span className="flex items-center gap-2"><Users className="w-4 h-4"/> Signup Bonus</span>
                  <span className="font-medium">{formatCurrency(selfServeBonus)}</span>
                </div>
                
                <div className="flex justify-between items-center text-emerald-600">
                   <span className="flex items-center gap-2"><Target className="w-4 h-4"/> SQL Bonus</span>
                   <span className="font-medium">{formatCurrency(sqlBonus)}</span>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 flex items-center">
                    Total OTE
                    <Tooltip content="On-Target Earnings: The total expected annual compensation when all performance targets are met." />
                  </span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(totalCompensation)}</span>
                </div>
              </div>

              {/* Stats / Ratios */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                 <div className="flex justify-between">
                    <span className="text-gray-500">Bonus as % of Total</span>
                    <span className="font-medium text-gray-900">
                      {totalCompensation > 0 ? ((totalBonus / totalCompensation) * 100).toFixed(1) : 0}%
                    </span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-gray-500">Monthly Average</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(totalCompensation / 12)}
                    </span>
                 </div>
              </div>

               {/* Config Toggle (Hidden/Advanced?) - Kept visible for "Editable" requirement */}
               <div className="mt-8 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Settings className="w-3 h-3" /> Global Settings
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-gray-500 mb-1">Signup Rate (€)</label>
                      <input
                        type="number"
                        name="signupBonusRate"
                        value={state.signupBonusRate}
                        onChange={handleInputChange}
                        className="w-full p-1 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">SQL Rate (€)</label>
                      <input
                        type="number"
                        name="sqlCommission"
                        value={state.sqlCommission}
                        onChange={handleInputChange}
                        className="w-full p-1 border rounded"
                      />
                    </div>
                  </div>
               </div>

               {/* 2026 Goal Simulation */}
               {/* Moved to bottom outside of grid */}

               {/* Export Button */}
               <div className="mt-6">
                 <button
                   onClick={handleExportPDF}
                   className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-md"
                 >
                   <Download className="w-4 h-4" />
                   Export as PDF
                 </button>
               </div>

            </div>
          </div>
        </div>

        {/* 2026 Goal Simulation */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-blue-900">2026 Goal Simulation: €10M ARR</h2>
                <p className="text-sm text-blue-700">
                  To reach €10M from current {formatCurrency(state.currentArr)}, we need to add <strong>{formatCurrency(arrGap)}</strong> in new ARR.
                </p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scenario A */}
              <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                 <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                   <Users className="w-4 h-4 text-indigo-600" />
                   Scenario A: Self-Serve Growth
                 </h4>
                 <p className="text-xs text-gray-500 mb-3">
                   If we achieved the entire {formatCurrency(arrGap)} gap via Self-Serve signups only.
                 </p>
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Addt'l Subscribers:</span>
                      <span className="font-medium">{formatNumber(Math.round(additionalSubscribersNeeded))}</span>
                    </div>
                    <div className="flex justify-between text-indigo-600 font-bold border-t border-gray-100 pt-2 mt-2">
                      <span>Resulting Bonus:</span>
                      <span>{formatCurrency(goalSelfServeBonus)}</span>
                    </div>
                 </div>
              </div>

              {/* Scenario B */}
              <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                 <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                   <Briefcase className="w-4 h-4 text-emerald-600" />
                   Scenario B: Enterprise Growth
                 </h4>
                 <p className="text-xs text-gray-500 mb-3">
                   If we achieved the gap via Enterprise Sales (assuming 20% win rate from SQLs).
                 </p>
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Addt'l Deals:</span>
                      <span className="font-medium">{formatNumber(Math.round(additionalEnterpriseClientsNeeded))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Required SQLs:</span>
                      <span className="font-medium">{formatNumber(Math.round(additionalSqlsNeeded))}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-bold border-t border-gray-100 pt-2 mt-2">
                      <span>Resulting Bonus:</span>
                      <span>{formatCurrency(goalSqlBonus)}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CompensationCalculator;

