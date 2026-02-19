'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';

interface CalculatorToolProps {
    toolId: string;
    title: string;
    description: string;
}

export const CalculatorInterface = ({ toolId, title, description }: CalculatorToolProps) => {
    // Generic state for various calculators
    const [values, setValues] = useState<Record<string, number>>({});
    const [result, setResult] = useState<number | null>(null);
    const [breakdown, setBreakdown] = useState<any>(null);

    const handleInputChange = (key: string, value: string) => {
        setValues(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
    };

    const calculate = () => {
        if (toolId === 'gst-calculator') {
            const amount = values.amount || 0;
            const rate = values.rate || 18;
            const type = values.type || 0; // 0 for exclusive, 1 for inclusive

            let gstAmount = 0;
            let total = 0;
            let net = 0;

            if (type === 0) { // Exclusive
                gstAmount = (amount * rate) / 100;
                total = amount + gstAmount;
                net = amount;
            } else { // Inclusive
                net = amount * (100 / (100 + rate));
                gstAmount = amount - net;
                total = amount;
            }

            setResult(total);
            setBreakdown({ net, gstAmount, total });
        }
        else if (toolId === 'emi-calculator') {
            const p = values.amount || 0; // Principal
            const r = (values.rate || 10) / 12 / 100; // Monthly Interest
            const n = (values.years || 1) * 12; // Months

            const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            const totalRepayment = emi * n;
            const totalInterest = totalRepayment - p;

            setResult(emi);
            setBreakdown({ emi, totalRepayment, totalInterest });
        }
        // Add more calc logic here
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 1.5rem' }}>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">{title}</h1>
                <p className="text-gray-500 text-lg">{description}</p>
            </div>

            <div className="card p-6 border-2 border-gray-200">
                <div className="grid gap-6 mb-6">
                    {/* Common Inputs */}
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Amount (Principal/Price)</label>
                        <input
                            type="number"
                            className="p-3 border rounded-lg"
                            placeholder="Enter Amount"
                            onChange={(e) => handleInputChange('amount', e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Rate (%)</label>
                        <input
                            type="number"
                            className="p-3 border rounded-lg"
                            placeholder="Interest/Tax Rate"
                            onChange={(e) => handleInputChange('rate', e.target.value)}
                        />
                    </div>

                    {(toolId === 'emi-calculator' || toolId === 'loan-calculator') && (
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Tenure (Years)</label>
                            <input
                                type="number"
                                className="p-3 border rounded-lg"
                                placeholder="Years"
                                onChange={(e) => handleInputChange('years', e.target.value)}
                            />
                        </div>
                    )}

                    {toolId === 'gst-calculator' && (
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Tax Type</label>
                            <select
                                className="p-3 border rounded-lg"
                                onChange={(e) => handleInputChange('type', e.target.value)}
                            >
                                <option value="0">GST Exclusive (Add GST)</option>
                                <option value="1">GST Inclusive (Remove GST)</option>
                            </select>
                        </div>
                    )}

                    <button onClick={calculate} className="btn btn-primary w-full py-4 text-lg">
                        Calculate
                    </button>
                </div>

                {result !== null && breakdown && (
                    <div className="bg-blue-50 p-6 rounded-lg text-center">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">Results</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {toolId === 'gst-calculator' && (
                                <>
                                    <div className="p-3 bg-white rounded shadow-sm">
                                        <p className="text-sm text-gray-500">Net Amount</p>
                                        <p className="text-lg font-bold">₹{breakdown.net.toFixed(2)}</p>
                                    </div>
                                    <div className="p-3 bg-white rounded shadow-sm">
                                        <p className="text-sm text-gray-500">GST Amount</p>
                                        <p className="text-lg font-bold">₹{breakdown.gstAmount.toFixed(2)}</p>
                                    </div>
                                    <div className="p-3 bg-white rounded shadow-sm border-2 border-blue-200">
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="text-2xl font-bold text-blue-600">₹{breakdown.total.toFixed(2)}</p>
                                    </div>
                                </>
                            )}
                            {(toolId === 'emi-calculator' || toolId === 'loan-calculator') && (
                                <>
                                    <div className="p-3 bg-white rounded shadow-sm border-2 border-blue-200 col-span-1 md:col-span-3">
                                        <p className="text-sm text-gray-500">Monthly EMI</p>
                                        <p className="text-3xl font-bold text-blue-600">₹{breakdown.emi.toFixed(2)}</p>
                                    </div>
                                    <div className="p-3 bg-white rounded shadow-sm">
                                        <p className="text-sm text-gray-500">Principal</p>
                                        <p className="text-lg font-bold">₹{values.amount}</p>
                                    </div>
                                    <div className="p-3 bg-white rounded shadow-sm">
                                        <p className="text-sm text-gray-500">Total Interest</p>
                                        <p className="text-lg font-bold text-red-500">₹{breakdown.totalInterest.toFixed(2)}</p>
                                    </div>
                                    <div className="p-3 bg-white rounded shadow-sm">
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="text-lg font-bold">₹{breakdown.totalRepayment.toFixed(2)}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
