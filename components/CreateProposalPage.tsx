import React, { useState, useRef } from 'react';
import { Icons } from './Icon';
import { Proposal, ProposalSection } from '../types';
import { toast } from './Toast';

interface CreateProposalPageProps {
    onBack: () => void;
    onSubmit: (proposal: Omit<Proposal, 'id'>) => void;
}

const PROJECT_TYPES = [
    'Logo Design',
    'Brand Identity',
    'Web Development',
    'Mobile App Development',
    'UI/UX Design',
    'Consulting',
    'Marketing',
    'Content Writing',
    'Video Production',
    'Other'
];

const DEFAULT_SECTIONS: ProposalSection[] = [
    { id: '1', title: 'Project Overview', content: '' },
    { id: '2', title: 'Scope of Work', content: '' },
    { id: '3', title: 'Deliverables', content: '' },
    { id: '4', title: 'Timeline', content: '' },
    { id: '5', title: 'Investment', content: '' },
    { id: '6', title: 'Terms & Conditions', content: '' },
];

export const CreateProposalPage: React.FC<CreateProposalPageProps> = ({ onBack, onSubmit }) => {
    // Force Rebuild Trigger
    const signatureRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Proposal Details
    const [proposalNumber, setProposalNumber] = useState(`PROP-${Date.now().toString().slice(-8)}`);
    const [title, setTitle] = useState('');
    const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
    const [proposalDate, setProposalDate] = useState(new Date().toISOString().split('T')[0]);
    const [validDays, setValidDays] = useState(30);
    const [totalValue, setTotalValue] = useState('');

    // Client Details
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientCompany, setClientCompany] = useState('');

    // Sections
    const [sections, setSections] = useState<ProposalSection[]>(DEFAULT_SECTIONS);

    // AI Agreement Generation
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    // Signature
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
    const [signerName, setSignerName] = useState('');

    const handleSectionChange = (id: string, content: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, content } : s));
    };

    const handleGenerateAIAgreement = async () => {
        if (!projectType || !totalValue) {
            toast.error('Please enter project type and value first');
            return;
        }

        setIsGeneratingAI(true);
        toast.success('Generating AI-powered agreement...');

        // Simulate AI generation
        await new Promise(resolve => setTimeout(resolve, 2000));

        const aiGeneratedSections: ProposalSection[] = [
            {
                id: '1',
                title: 'Project Overview',
                content: `This agreement is entered into for ${projectType} services. The project aims to deliver professional ${projectType.toLowerCase()} solutions as per the client's requirements and industry best practices.`
            },
            {
                id: '2',
                title: 'Scope of Work',
                content: `The service provider agrees to:\n• Deliver complete ${projectType.toLowerCase()} services\n• Provide regular progress updates\n• Incorporate up to 3 rounds of revisions\n• Deliver final files in all required formats\n• Provide post-delivery support for 15 days`
            },
            {
                id: '3',
                title: 'Deliverables',
                content: `Upon completion, the client will receive:\n• Final ${projectType.toLowerCase()} assets\n• Source files (where applicable)\n• Documentation and guidelines\n• Usage rights as specified in this agreement`
            },
            {
                id: '4',
                title: 'Timeline',
                content: `Project Duration: 2-4 weeks from the date of signing\n\nMilestones:\n• Week 1: Initial concepts and research\n• Week 2: Development and iterations\n• Week 3: Final refinements\n• Week 4: Delivery and handover`
            },
            {
                id: '5',
                title: 'Investment',
                content: `Total Project Value: ₹${parseInt(totalValue).toLocaleString()}\n\nPayment Terms:\n• 50% advance payment upon signing\n• 50% upon project completion\n\nPayment Mode: Bank Transfer / UPI`
            },
            {
                id: '6',
                title: 'Terms & Conditions',
                content: `1. INTELLECTUAL PROPERTY: Upon full payment, all intellectual property rights shall transfer to the client.\n\n2. CONFIDENTIALITY: Both parties agree to maintain confidentiality of all project-related information.\n\n3. REVISIONS: Up to 3 rounds of revisions are included. Additional revisions will be billed separately.\n\n4. CANCELLATION: Either party may cancel with 7 days written notice. Completed work will be billed proportionally.\n\n5. LIABILITY: The service provider's liability is limited to the project value.\n\n6. DISPUTE RESOLUTION: Any disputes shall be resolved through arbitration as per Indian Arbitration Act.\n\n7. GOVERNING LAW: This agreement shall be governed by the laws of India.`
            },
        ];

        setSections(aiGeneratedSections);
        setIsGeneratingAI(false);
        toast.success('Agreement generated! Review and customize as needed.');
    };

    // Signature Canvas Handlers
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = signatureRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = signatureRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = signatureRef.current;
        if (canvas) {
            setSignatureDataUrl(canvas.toDataURL());
        }
    };

    const clearSignature = () => {
        const canvas = signatureRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureDataUrl(null);
    };

    const handleSubmit = () => {
        if (!title || !clientName || !clientEmail) {
            toast.error('Please fill in required fields');
            return;
        }

        const validUntil = new Date(proposalDate);
        validUntil.setDate(validUntil.getDate() + validDays);

        onSubmit({
            number: proposalNumber,
            title,
            status: 'Draft',
            clientName,
            clientEmail,
            projectType,
            createdDate: new Date(proposalDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            validUntil: validUntil.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            totalValue: parseFloat(totalValue) || 0,
            sections,
            senderSignature: signerName,
            senderSignedAt: signatureDataUrl ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined,
        });
    };

    return (
        <div className="h-full flex bg-gray-50 dark:bg-gray-900">

            {/* === LEFT SIDEBAR === */}
            <div className="w-80 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-hidden">

                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <Icons.ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">New Proposal</h1>
                            <p className="text-xs text-gray-500">with e-signature</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Project Type */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Project Type</label>
                        <select
                            value={projectType}
                            onChange={(e) => setProjectType(e.target.value)}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                        >
                            {PROJECT_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Value */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Project Value (₹)</label>
                        <input
                            type="number"
                            value={totalValue}
                            onChange={(e) => setTotalValue(e.target.value)}
                            placeholder="50000"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Validity */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Valid For</label>
                        <select
                            value={validDays}
                            onChange={(e) => setValidDays(parseInt(e.target.value))}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                        >
                            <option value={7}>7 Days</option>
                            <option value={15}>15 Days</option>
                            <option value={30}>30 Days</option>
                            <option value={45}>45 Days</option>
                            <option value={60}>60 Days</option>
                        </select>
                    </div>

                    {/* AI Generate Button */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleGenerateAIAgreement}
                            disabled={isGeneratingAI}
                            className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isGeneratingAI ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Icons.FileText size={16} />
                                    Generate AI Agreement
                                </>
                            )}
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-2">Based on Indian Contract Law</p>
                    </div>

                    {/* Your Signature */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Your Signature</label>
                        <input
                            value={signerName}
                            onChange={(e) => setSignerName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full p-2 mb-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                        />
                        <div className="relative bg-white border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                            <canvas
                                ref={signatureRef}
                                width={250}
                                height={100}
                                className="w-full cursor-crosshair"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                            />
                            {!signatureDataUrl && (
                                <p className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 pointer-events-none">
                                    Draw your signature here
                                </p>
                            )}
                        </div>
                        {signatureDataUrl && (
                            <button
                                onClick={clearSignature}
                                className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                            >
                                Clear signature
                            </button>
                        )}
                    </div>

                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                    <div className="text-sm mb-3">
                        <div className="flex justify-between text-gray-500">
                            <span>Project Value</span>
                            <span className="font-semibold text-gray-900 dark:text-white">₹{parseInt(totalValue || '0').toLocaleString()}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    >
                        Create Proposal
                    </button>
                </div>
            </div>

            {/* === MAIN CONTENT - Proposal Preview === */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">

                    {/* Proposal Document */}
                    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">

                        {/* Document Header */}
                        <div className="p-8 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">PROPOSAL</h2>
                                    <div className="mt-4 space-y-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 w-24">Proposal #</span>
                                            <input
                                                value={proposalNumber}
                                                onChange={(e) => setProposalNumber(e.target.value)}
                                                className="font-mono font-medium text-gray-900 dark:text-white bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:outline-none px-1"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 w-24">Date</span>
                                            <input
                                                type="date"
                                                value={proposalDate}
                                                onChange={(e) => setProposalDate(e.target.value)}
                                                className="text-gray-900 dark:text-white bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:outline-none px-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Project Value</div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">₹{parseInt(totalValue || '0').toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="mt-6">
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Proposal Title (e.g., Logo Design for ABC Corp)"
                                    className="w-full text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-white focus:outline-none py-2"
                                />
                            </div>
                        </div>

                        {/* Client Details */}
                        <div className="p-8 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Prepared For</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <input
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        placeholder="Client Name *"
                                        className="w-full text-base font-semibold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none placeholder-gray-300"
                                    />
                                    <input
                                        value={clientCompany}
                                        onChange={(e) => setClientCompany(e.target.value)}
                                        placeholder="Company Name"
                                        className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300"
                                    />
                                </div>
                                <div>
                                    <input
                                        value={clientEmail}
                                        onChange={(e) => setClientEmail(e.target.value)}
                                        placeholder="client@email.com *"
                                        className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300"
                                    />
                                    <input
                                        value={clientPhone}
                                        onChange={(e) => setClientPhone(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none placeholder-gray-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sections */}
                        <div className="p-8 space-y-6">
                            {sections.map((section, idx) => (
                                <div key={section.id}>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                                        {idx + 1}. {section.title}
                                    </h3>
                                    <textarea
                                        value={section.content}
                                        onChange={(e) => handleSectionChange(section.id, e.target.value)}
                                        placeholder={`Enter ${section.title.toLowerCase()} details...`}
                                        rows={4}
                                        className="w-full text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white resize-none"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Signature Section */}
                        <div className="p-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">Signatures</h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Service Provider</p>
                                    <div className="h-24 bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                                        {signatureDataUrl ? (
                                            <img loading="lazy" src={signatureDataUrl} alt="Signature" className="max-h-full" />
                                        ) : (
                                            <p className="text-xs text-gray-400">Your signature will appear here</p>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">{signerName || 'Your Name'}</p>
                                    <p className="text-xs text-gray-400">Date: {new Date(proposalDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Client</p>
                                    <div className="h-24 bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                                        <p className="text-xs text-gray-400">Client will sign here</p>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">{clientName || 'Client Name'}</p>
                                    <p className="text-xs text-gray-400">Date: Pending</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">Powered by BILLENTY • Legally binding under Indian Contract Act, 1872</p>
                </div>
            </div>
        </div>
    );
};
