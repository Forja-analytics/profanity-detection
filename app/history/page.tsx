'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { History, ArrowLeft, Search, Calendar } from 'lucide-react';
import Link from 'next/link';

interface EvaluationLog {
  id: number;
  input_text: string;
  masked_text: string;
  timestamp: string;
  severity: number;
  contains_profanity: boolean;
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<EvaluationLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs', {
        cache: 'no-store',       
        next: { revalidate: 0 },    
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.input_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.masked_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-orange-100 text-orange-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-green-100 text-green-800';
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
        return 'Clean';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <History className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Evaluation History</h1>
              <p className="text-gray-600">View past text evaluations and their results</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/admin">
              <Button variant="outline">Admin Panel</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Evaluation Logs
            </CardTitle>
            <CardDescription>
              Complete history of all text evaluations performed
            </CardDescription>
            <div className="flex items-center gap-2 mt-4">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search evaluations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading evaluation history...</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-32">Date & Time</TableHead>
                      <TableHead>Original Text</TableHead>
                      <TableHead>Masked Text</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-24">Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          {searchTerm ? 'No evaluations match your search' : 'No evaluations performed yet'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(log.timestamp)}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate font-mono text-sm" title={log.input_text}>
                              {log.input_text}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate font-mono text-sm" title={log.masked_text}>
                              {log.masked_text}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={log.contains_profanity ? "destructive" : "default"}
                              className="text-xs"
                            >
                              {log.contains_profanity ? 'Flagged' : 'Clean'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${getSeverityColor(log.severity)}`}>
                              {getSeverityLabel(log.severity)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}