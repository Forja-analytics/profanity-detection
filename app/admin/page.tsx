'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Settings, ArrowLeft, Pencil } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface BlacklistWord {
  id: number;
  phrase: string;
  severity: number;
}

interface WhitelistWord {
  id: number;
  phrase: string;
}

export default function AdminPanel() {
  const [blacklist, setBlacklist] = useState<BlacklistWord[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistWord[]>([]);
  const [newBlacklistWord, setNewBlacklistWord] = useState('');
  const [newBlacklistSeverity, setNewBlacklistSeverity] = useState('1');
  const [newWhitelistWord, setNewWhitelistWord] = useState('');
  const [isAddingBlacklist, setIsAddingBlacklist] = useState(false);
  const [isAddingWhitelist, setIsAddingWhitelist] = useState(false);
  const { toast } = useToast();

  // Blacklist edit
  const [isEditBLOpen, setIsEditBLOpen] = useState(false);
  const [editBLId, setEditBLId] = useState<number | null>(null);
  const [editBLPhrase, setEditBLPhrase] = useState("");
  const [editBLSeverity, setEditBLSeverity] = useState("2");
  const [isSavingBL, setIsSavingBL] = useState(false);

  // Whitelist edit
  const [isEditWLOpen, setIsEditWLOpen] = useState(false);
  const [editWLId, setEditWLId] = useState<number | null>(null);
  const [editWLPhrase, setEditWLPhrase] = useState("");
  const [isSavingWL, setIsSavingWL] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [blacklistRes, whitelistRes] = await Promise.all([
        fetch('/api/admin/blacklist', { cache: 'no-store' }),
        fetch('/api/admin/whitelist', { cache: 'no-store' })
      ]);

      if (blacklistRes.ok) {
        const blacklistData = await blacklistRes.json();
        setBlacklist(blacklistData);
      }

      if (whitelistRes.ok) {
        const whitelistData = await whitelistRes.json();
        setWhitelist(whitelistData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    }
  };

  const addBlacklistWord = async () => {
    if (!newBlacklistWord.trim()) return;

    setIsAddingBlacklist(true);
    try {
      const response = await fetch('/api/admin/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phrase: newBlacklistWord.trim().toLowerCase(),
          severity: parseInt(newBlacklistSeverity)
        }),
      });

      if (response.ok) {
        setNewBlacklistWord('');
        setNewBlacklistSeverity('1');
        await loadData();
        toast({ title: 'Success', description: 'Blacklist word added successfully' });
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to add word');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to add blacklist word',
        variant: 'destructive',
      });
    } finally {
      setIsAddingBlacklist(false);
    }
  };

  const addWhitelistWord = async () => {
    if (!newWhitelistWord.trim()) return;

    setIsAddingWhitelist(true);
    try {
      const response = await fetch('/api/admin/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phrase: newWhitelistWord.trim().toLowerCase()
        }),
      });

      if (response.ok) {
        setNewWhitelistWord('');
        await loadData();
        toast({ title: 'Success', description: 'Whitelist word added successfully' });
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to add word');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to add whitelist word',
        variant: 'destructive',
      });
    } finally {
      setIsAddingWhitelist(false);
    }
  };

  const deleteBlacklistWord = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/blacklist/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await loadData();
        toast({ title: 'Success', description: 'Blacklist word deleted successfully' });
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete word');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete blacklist word',
        variant: 'destructive',
      });
    }
  };

  const deleteWhitelistWord = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/whitelist/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await loadData();
        toast({ title: 'Success', description: 'Whitelist word deleted successfully' });
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete word');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete whitelist word',
        variant: 'destructive',
      });
    }
  };

  // --- Abrir y guardar (editar) Blacklist ---
  function openEditBlacklist(w: BlacklistWord) {
    setEditBLId(w.id);
    setEditBLPhrase(w.phrase);
    setEditBLSeverity(String(w.severity));
    setIsEditBLOpen(true);
  }

  async function saveEditBlacklist() {
    if (editBLId == null) return;
    try {
      setIsSavingBL(true);
      const res = await fetch(`/api/admin/blacklist/${editBLId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phrase: editBLPhrase.trim().toLowerCase(),
          severity: parseInt(editBLSeverity, 10),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Update failed");

      setIsEditBLOpen(false);
      toast({ title: "Updated", description: "Blacklist word updated successfully" });
      await loadData();
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to update", variant: "destructive" });
    } finally {
      setIsSavingBL(false);
    }
  }

  // --- Abrir y guardar (editar) Whitelist ---
  function openEditWhitelist(w: WhitelistWord) {
    setEditWLId(w.id);
    setEditWLPhrase(w.phrase);
    setIsEditWLOpen(true);
  }

  async function saveEditWhitelist() {
    if (editWLId == null) return;
    try {
      setIsSavingWL(true);
      const res = await fetch(`/api/admin/whitelist/${editWLId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase: editWLPhrase.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Update failed");

      setIsEditWLOpen(false);
      toast({ title: "Updated", description: "Whitelist word updated successfully" });
      await loadData();
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to update", variant: "destructive" });
    } finally {
      setIsSavingWL(false);
    }
  }

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-orange-100 text-orange-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 1:
        return 'Mild';
      case 2:
        return 'Moderate';
      case 3:
        return 'Severe';
      default:
        return 'None';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage blacklist and whitelist words</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="blacklist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blacklist">Blacklist Management</TabsTrigger>
            <TabsTrigger value="whitelist">Whitelist Management</TabsTrigger>
          </TabsList>

          {/* --- BLACKLIST --- */}
          <TabsContent value="blacklist">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Blacklist Words</CardTitle>
                <CardDescription>
                  Words and phrases that should be flagged as profanity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6 flex-wrap">
                  <Input
                    placeholder="Enter word or phrase"
                    value={newBlacklistWord}
                    onChange={(e) => setNewBlacklistWord(e.target.value)}
                    className="flex-1 min-w-60"
                  />
                  <Select value={newBlacklistSeverity} onValueChange={setNewBlacklistSeverity}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Mild (1)</SelectItem>
                      <SelectItem value="2">Moderate (2)</SelectItem>
                      <SelectItem value="3">Severe (3)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={addBlacklistWord} 
                    disabled={isAddingBlacklist || !newBlacklistWord.trim()}
                    className="flex items-center gap-2"
                  >
                    {isAddingBlacklist ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Word/Phrase</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead className="w-28">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blacklist.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                            No blacklist words added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        blacklist.map((word) => (
                          <TableRow key={word.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-mono">{word.phrase}</TableCell>
                            <TableCell>
                              <Badge className={getSeverityColor(word.severity)}>
                                Level {word.severity} - {getSeverityLabel(word.severity)}
                              </Badge>
                            </TableCell>
                            <TableCell className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditBlacklist(word)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                aria-label={`Edit ${word.phrase}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteBlacklistWord(word.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                aria-label={`Delete ${word.phrase}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- WHITELIST --- */}
          <TabsContent value="whitelist">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Whitelist Words</CardTitle>
                <CardDescription>
                  Words that should never be flagged as profanity (false positive prevention)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6 flex-wrap">
                  <Input
                    placeholder="Enter word or phrase"
                    value={newWhitelistWord}
                    onChange={(e) => setNewWhitelistWord(e.target.value)}
                    className="flex-1 min-w-60"
                  />
                  <Button 
                    onClick={addWhitelistWord} 
                    disabled={isAddingWhitelist || !newWhitelistWord.trim()}
                    className="flex items-center gap-2"
                  >
                    {isAddingWhitelist ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Word/Phrase</TableHead>
                        <TableHead className="w-28">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {whitelist.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                            No whitelist words added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        whitelist.map((word) => (
                          <TableRow key={word.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-mono">{word.phrase}</TableCell>
                            <TableCell className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditWhitelist(word)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                aria-label={`Edit ${word.phrase}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteWhitelistWord(word.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                aria-label={`Delete ${word.phrase}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ----- DIALOG: Edit Blacklist ----- */}
      <Dialog open={isEditBLOpen} onOpenChange={setIsEditBLOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit blacklist word</DialogTitle>
            <DialogDescription>Change the phrase and/or severity.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bl-phrase" className="text-right">Phrase</Label>
              <Input
                id="bl-phrase"
                value={editBLPhrase}
                onChange={(e) => setEditBLPhrase(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Severity</Label>
              <Select value={editBLSeverity} onValueChange={setEditBLSeverity}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Mild (1)</SelectItem>
                  <SelectItem value="2">Moderate (2)</SelectItem>
                  <SelectItem value="3">Severe (3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditBLOpen(false)}>Cancel</Button>
            <Button onClick={saveEditBlacklist} disabled={isSavingBL} className="inline-flex items-center gap-2">
              {isSavingBL ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ----- DIALOG: Edit Whitelist ----- */}
      <Dialog open={isEditWLOpen} onOpenChange={setIsEditWLOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit whitelist word</DialogTitle>
            <DialogDescription>Change the phrase.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="wl-phrase" className="text-right">Phrase</Label>
              <Input
                id="wl-phrase"
                value={editWLPhrase}
                onChange={(e) => setEditWLPhrase(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditWLOpen(false)}>Cancel</Button>
            <Button onClick={saveEditWhitelist} disabled={isSavingWL} className="inline-flex items-center gap-2">
              {isSavingWL ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
