import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, FileStack, Shapes, Download, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import apiClient from '../api'; // --- Use the new API client ---
import { DocumentCard } from '@/components/DocumentCard';
import { AddDocumentModal } from '@/components/AddDocumentModal';
import { DeleteDocumentModal } from '@/components/DeleteDocumentModal';

export const Documents = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [stats, setStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isHr = user && (user.role === 'HR' || user.role === 'DHR');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params: { search?: string; category?: string } = {};
            if (searchTerm) params.search = searchTerm;
            if (selectedCategory !== 'all') params.category = selectedCategory;

            // --- Use apiClient for all requests ---
            const docsPromise = apiClient.get('/documents', { params });
            const statsPromise = apiClient.get('/documents/stats');
            const catsPromise = apiClient.get('/documents/categories');

            const [docsRes, statsRes, catsRes] = await Promise.all([
                docsPromise.catch(e => { console.error("Docs fetch failed:", e); return { data: [] }; }),
                statsPromise.catch(e => { console.error("Stats fetch failed:", e); return { data: null }; }),
                catsPromise.catch(e => { console.error("Categories fetch failed:", e); return { data: [] }; })
            ]);

            setDocuments(docsRes.data);
            setStats(statsRes.data);
            setCategories(catsRes.data);

        } catch (error) {
            toast({ title: t('toast.error_title'), description: t('documents_page.fetch_error'), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedCategory, t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteClick = (document) => {
      setDocumentToDelete(document);
      setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async (documentId) => {
        setIsSubmitting(true);
        try {
            await apiClient.delete(`/documents/${documentId}`);
            toast({ title: t('toast.success_title'), description: t('documents_page.delete_success') });
            setIsDeleteModalOpen(false);
            setDocumentToDelete(null);
            fetchData();
        } catch (error) {
            toast({ title: t('toast.error_title'), description: t('documents_page.delete_error'), variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{t('documents_page.title')}</h2>
                    <p className="text-muted-foreground">{t('documents_page.description')}</p>
                </div>
                {isHr && (<Button onClick={() => setIsAddModalOpen(true)}>{t('documents_page.add_new_document')}</Button>)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card><CardContent className="p-6"><div className="text-center"><p className="text-2xl font-bold text-blue-600">{stats?.totalDocuments ?? '...'}</p><p className="text-sm text-muted-foreground">{t('documents_page.total_documents')}</p></div></CardContent></Card>
                <Card><CardContent className="p-6"><div className="text-center"><p className="text-2xl font-bold text-green-600">{stats?.totalCategories ?? '...'}</p><p className="text-sm text-muted-foreground">{t('documents_page.categories')}</p></div></CardContent></Card>
                <Card><CardContent className="p-6"><div className="text-center"><p className="text-2xl font-bold text-purple-600">{stats?.totalDownloads ?? '...'}</p><p className="text-sm text-muted-foreground">{t('documents_page.total_downloads')}</p></div></CardContent></Card>
                <Card><CardContent className="p-6"><div className="text-center"><p className="text-2xl font-bold text-yellow-600">{stats?.updatedThisWeek ?? '...'}</p><p className="text-sm text-muted-foreground">{t('documents_page.updated_this_week')}</p></div></CardContent></Card>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex-1"><Input placeholder={t('documents_page.search_placeholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                        <div className="sm:w-48">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger><SelectValue placeholder={t('documents_page.all_categories')} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('documents_page.all_categories')}</SelectItem>
                                    {categories.map((category) => (<SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? <p>{t('common.loading')}</p> : documents.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} onDelete={handleDeleteClick} />
                ))}
            </div>

            {!loading && documents.length === 0 && (
                <Card><CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">{t('documents_page.no_documents_found_title')}</h3>
                    <p className="text-muted-foreground">{searchTerm || selectedCategory !== "all" ? t('documents_page.no_documents_found_filter_desc') : t('documents_page.no_documents_found_yet_desc')}</p>
                </CardContent></Card>
            )}

            <AddDocumentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} categories={categories} onUploadSuccess={fetchData} />
            <DeleteDocumentModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} document={documentToDelete} onConfirm={handleDeleteConfirm} isSubmitting={isSubmitting} />
        </div>
    );
};