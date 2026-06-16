import React, { useState, useMemo } from 'react';
import { Icons } from './Icon';
import { toast } from './Toast';
import { Proposal, Page } from '../types';
import { useProposals } from '../dataStore';

interface ProposalsPageProps {
    searchQuery: string;
    onNavigate: (page: Page, id?: string) => void;
}


export const ProposalsPage: React.FC<ProposalsPageProps> = ({ searchQuery, onNavigate }) => {
    const { items: proposals } = useProposals();
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredProposals = useMemo(() => {
        return proposals.filter(proposal => {
            const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                proposal.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                proposal.number.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === 'all' || proposal.status.toLowerCase() === filterStatus.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [proposals, searchQuery, filterStatus]);

    const stats = useMemo(() => {
        const total = proposals.reduce((sum, p) => sum + p.totalValue, 0);
        const signed = proposals.filter(p => p.status === 'Signed').length;
        const pending = proposals.filter(p => p.status === 'Sent' || p.status === 'Viewed').length;
        return { total, signed, pending, count: proposals.length };
    }, [proposals]);

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

    const handleShareWhatsApp = (proposal: Proposal) => {
        const message = encodeURIComponent(`Hi ${proposal.clientName},\n\nPlease review and sign the proposal for "${proposal.title}".\n\nProposal #: ${proposal.number}\nValue: ₹${proposal.totalValue.toLocaleString()}\nValid Until: ${proposal.validUntil}\n\nView & Sign: https://billenty.app/p/${proposal.id}\n\nThank you!`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
        toast.success('Opening WhatsApp...');
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proposals</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create legally binding proposals with e-signatures</p>
                </div>
                <button
                    onClick={() => onNavigate(Page.CREATE_PROPOSAL)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                    <Icons.Plus size={16} />
                    New Proposal
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{(stats.total / 100000).toFixed(1)}L</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Proposals</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.count}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Signed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.signed}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Pending Signature</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6">
                {['all', 'draft', 'sent', 'viewed', 'signed', 'declined'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filterStatus === status
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Proposals List */}
            {filteredProposals.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.FileText size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No proposals found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first proposal with e-signature</p>
                    <button
                        onClick={() => onNavigate(Page.CREATE_PROPOSAL)}
                        className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg"
                    >
                        Create Proposal
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredProposals.map((proposal) => (
                        <div
                            key={proposal.id}
                            className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs font-mono text-gray-500">{proposal.number}</span>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyle(proposal.status)}`}>
                                            {proposal.status}
                                        </span>
                                        {proposal.status === 'Signed' && (
                                            <span className="flex items-center gap-1 text-xs text-green-600">
                                                <Icons.CheckCircle size={12} />
                                                Legally Binding
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{proposal.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Icons.User size={14} />
                                            {proposal.clientName}
                                        </span>
                                        <span>{proposal.projectType}</span>
                                        <span>Valid until {proposal.validUntil}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{proposal.totalValue.toLocaleString()}</p>
                                    {proposal.clientSignedAt && (
                                        <p className="text-xs text-gray-500 mt-1">Signed on {proposal.clientSignedAt}</p>
                                    )}
                                </div>
                            </div>

                            {/* Signature Status */}
                            {proposal.status === 'Signed' && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                            <Icons.CheckCircle size={16} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Your Signature</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{proposal.senderSignature}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                            <Icons.CheckCircle size={16} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Client Signature</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{proposal.clientSignature}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                                <button
                                    onClick={() => onNavigate(Page.PROPOSAL_DETAILS, proposal.id)}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    View Details
                                </button>
                                {proposal.status !== 'Signed' && proposal.status !== 'Declined' && (
                                    <>
                                        <button
                                            onClick={() => handleShareWhatsApp(proposal)}
                                            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                                        >
                                            <Icons.Send size={14} />
                                            Share via WhatsApp
                                        </button>
                                        <button className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5">
                                            <Icons.Mail size={14} />
                                            Send Email
                                        </button>
                                    </>
                                )}
                                {proposal.status === 'Signed' && (
                                    <button className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5">
                                        <Icons.Download size={14} />
                                        Download Agreement
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
