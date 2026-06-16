import React, { useRef, useState } from 'react';
import { Proposal } from '../types';
import { Icons } from './Icon';
import { toast } from './Toast';
import { useConfirmDialog } from './ConfirmDialog';
import { generateProposalPDF } from '../utils/pdfGenerator';

interface ProposalDetailsPageProps {
    proposal: Proposal;
    onBack: () => void;
    onEdit: (proposal: Proposal) => void;
    onDelete: (id: string) => void;
}

export const ProposalDetailsPage: React.FC<ProposalDetailsPageProps> = ({
    proposal,
    onBack,
    onEdit,
    onDelete,
}) => {
    const { confirm } = useConfirmDialog();
    const signatureRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [clientSignatureUrl, setClientSignatureUrl] = useState<string | null>(null);

    const isSigned = proposal.status === 'Signed';

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Delete Proposal',
            message: `Are you sure you want to delete proposal ${proposal.number}? This action cannot be undone.`,
            variant: 'danger',
            confirmLabel: 'Delete Proposal',
        });

        if (confirmed) {
            onDelete(proposal.id);
            toast.success('Proposal deleted');
            onBack();
        }
    };

    const handleShareWhatsApp = () => {
        const message = encodeURIComponent(`Hi ${proposal.clientName},\n\nPlease review and sign the proposal for "${proposal.title}".\n\nProposal #: ${proposal.number}\nValue: ₹${proposal.totalValue.toLocaleString()}\nValid Until: ${proposal.validUntil}\n\nView & Sign: https://billenty.app/p/${proposal.id}\n\nThank you!`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
        toast.success('Opening WhatsApp...');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`https://billenty.app/p/${proposal.id}`);
        toast.success('Proposal link copied');
    };

    const handleDownloadPDF = async () => {
        try {
            toast.success('Generating proposal PDF...');
            const blob = await generateProposalPDF(proposal);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Proposal-${proposal.number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success('Download complete!');
        } catch (error) {
            console.error('PDF Generation failed:', error);
            toast.error('Failed to generate PDF');
        }
    };

    const handleSendReminder = () => {
        toast.success('Reminder sent to client');
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Signed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Sent': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
            case 'Viewed': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Draft': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-500';
            case 'Declined': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
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
            setClientSignatureUrl(canvas.toDataURL());
        }
    };

    const clearSignature = () => {
        const canvas = signatureRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setClientSignatureUrl(null);
    };

    const handleSign = () => {
        if (!clientSignatureUrl) {
            toast.error('Please draw your signature first');
            return;
        }
        toast.success('Proposal signed successfully! Both parties are now bound by this agreement.');
    };

    const activityLog = [
        { id: 1, type: 'created', text: `Proposal created`, date: proposal.createdDate },
        ...(proposal.senderSignedAt ? [{ id: 2, type: 'signed', text: 'Signed by service provider', date: proposal.senderSignedAt }] : []),
        ...(proposal.status !== 'Draft' ? [{ id: 3, type: 'sent', text: 'Sent to client', date: proposal.createdDate }] : []),
        ...(proposal.status === 'Viewed' ? [{ id: 4, type: 'viewed', text: 'Viewed by client', date: 'Recently' }] : []),
        ...(proposal.clientSignedAt ? [{ id: 5, type: 'signed', text: 'Signed by client', date: proposal.clientSignedAt }] : []),
    ];

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
                            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">{proposal.number}</h1>
                            <p className="text-xs text-gray-500">Proposal Details</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</label>
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getStatusStyle(proposal.status)}`}>
                            {isSigned ? <Icons.CheckCircle size={16} /> : <Icons.FileText size={16} />}
                            {proposal.status}
                            {isSigned && <span className="text-xs">(Legally Binding)</span>}
                        </div>
                    </div>

                    {/* Client */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Client</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold">
                                {proposal.clientName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{proposal.clientName}</p>
                                <p className="text-xs text-gray-500">{proposal.clientEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Dates</label>
                        <div className="space-y-2">
                            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <span className="text-sm text-gray-500">Created</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{proposal.createdDate}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <span className="text-sm text-gray-500">Valid Until</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{proposal.validUntil}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Actions</label>
                        <div className="space-y-2">
                            {!isSigned && (
                                <>
                                    <button
                                        onClick={handleShareWhatsApp}
                                        className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <Icons.Send size={16} />
                                        Share via WhatsApp
                                    </button>
                                    <button
                                        onClick={handleSendReminder}
                                        className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <Icons.Mail size={16} />
                                        Send Reminder Email
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleCopyLink}
                                className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Icons.Share size={16} />
                                Copy Link
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Icons.Download size={16} />
                                Download PDF
                            </button>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Activity</label>
                        <div className="relative pl-4 space-y-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2">
                            {activityLog.map((log) => (
                                <div key={log.id} className="relative">
                                    <div className={`absolute -left-[13px] top-1 w-2 h-2 rounded-full ${log.type === 'signed' ? 'bg-green-500' : 'bg-gray-400'
                                        }`}></div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{log.text}</p>
                                    <p className="text-xs text-gray-400">{log.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 space-y-3">
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white">Project Value</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">₹{proposal.totalValue.toLocaleString()}</span>
                    </div>

                    {!isSigned && (
                        <button
                            onClick={handleDelete}
                            className="w-full py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium rounded-lg transition-colors"
                        >
                            Delete Proposal
                        </button>
                    )}
                </div>
            </div>

            {/* === MAIN CONTENT - Proposal Document === */}
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
                                            <span className="font-mono font-medium text-gray-900 dark:text-white">{proposal.number}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 w-24">Date</span>
                                            <span className="text-gray-900 dark:text-white">{proposal.createdDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 w-24">Valid Until</span>
                                            <span className="text-gray-900 dark:text-white">{proposal.validUntil}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Project Value</div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">₹{proposal.totalValue.toLocaleString()}</div>
                                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(proposal.status)}`}>
                                        {proposal.status}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">{proposal.title}</h3>
                        </div>

                        {/* Prepared For */}
                        <div className="p-8 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Prepared For</h3>
                            <p className="text-base font-semibold text-gray-900 dark:text-white">{proposal.clientName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{proposal.clientEmail}</p>
                        </div>

                        {/* Sections */}
                        <div className="p-8 space-y-6">
                            {proposal.sections.map((section, idx) => (
                                <div key={section.id}>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                                        {idx + 1}. {section.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                                        {section.content || 'No content provided.'}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Signature Section */}
                        <div className="p-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">Signatures</h3>
                            <div className="grid grid-cols-2 gap-8">
                                {/* Service Provider Signature */}
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Service Provider</p>
                                    <div className="h-24 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                                        {proposal.senderSignature ? (
                                            <div className="text-center">
                                                <p className="font-signature text-2xl italic text-gray-900 dark:text-white">{proposal.senderSignature}</p>
                                                <Icons.CheckCircle size={16} className="text-green-500 mx-auto mt-1" />
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400">Pending</p>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">{proposal.senderSignature || 'Not signed'}</p>
                                    <p className="text-xs text-gray-400">Date: {proposal.senderSignedAt || 'Pending'}</p>
                                </div>

                                {/* Client Signature */}
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Client</p>
                                    {isSigned ? (
                                        <>
                                            <div className="h-24 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                                                <div className="text-center">
                                                    <p className="font-signature text-2xl italic text-gray-900 dark:text-white">{proposal.clientSignature}</p>
                                                    <Icons.CheckCircle size={16} className="text-green-500 mx-auto mt-1" />
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">{proposal.clientSignature}</p>
                                            <p className="text-xs text-gray-400">Date: {proposal.clientSignedAt}</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="relative bg-white border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                                                <canvas
                                                    ref={signatureRef}
                                                    width={300}
                                                    height={96}
                                                    className="w-full cursor-crosshair"
                                                    onMouseDown={startDrawing}
                                                    onMouseMove={draw}
                                                    onMouseUp={stopDrawing}
                                                    onMouseLeave={stopDrawing}
                                                />
                                                {!clientSignatureUrl && (
                                                    <p className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 pointer-events-none">
                                                        Client signs here
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                {clientSignatureUrl && (
                                                    <button onClick={clearSignature} className="text-xs text-gray-500 hover:text-gray-700">
                                                        Clear
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                onClick={handleSign}
                                                className="mt-3 w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                                            >
                                                Sign & Accept Proposal
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        This proposal is legally binding under the Indian Contract Act, 1872 once signed by both parties.
                    </p>
                </div>
            </div>
        </div>
    );
};
