'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface EvaluationResponse {
  contains_profanity: boolean;
  severity: number;
  masked_text: string;
  matches: Array<{
    word: string;
    severity: number;
  }>;
}

export default function Home() {
  const [text, setText] = useState('');
  const [useLLM, setUseLLM] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          use_llm: useLLM,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate text');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Profanity Detection System</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced text analysis tool for detecting and managing inappropriate content with customizable severity levels and intelligent masking.
          </p>
          <div className="mt-6">
            <Link href="/admin">
              <Button variant="outline" className="mr-4">
                Admin Panel
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="outline">
                View History
              </Button>
            </Link>
          </div>
        </div>

        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Text Evaluation
            </CardTitle>
            <CardDescription>
              Enter text to analyze for profanity. Toggle LLM validation for enhanced accuracy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                  Text to Analyze
                </label>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the text you want to analyze for profanity..."
                  className="min-h-32 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex flex-col">
                  <label htmlFor="llm-toggle" className="text-sm font-medium text-gray-700">
                    Enhanced LLM Validation
                  </label>
                  <span className="text-sm text-gray-500">
                    Use AI for more accurate context-aware detection
                  </span>
                </div>
                <Switch
                  id="llm-toggle"
                  checked={useLLM}
                  onCheckedChange={setUseLLM}
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading || !text.trim()}
                className="w-full h-12 text-lg font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Evaluate Text
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.contains_profanity ? (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Profanity Detected
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Content Clean
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Detection Status</label>
                    <div className="mt-1">
                      <Badge 
                        variant={result.contains_profanity ? "destructive" : "default"}
                        className="text-sm px-3 py-1"
                      >
                        {result.contains_profanity ? 'Profanity Found' : 'Clean Content'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Overall Severity</label>
                    <div className="mt-1">
                      <Badge 
                        className={`text-sm px-3 py-1 ${getSeverityColor(result.severity)}`}
                      >
                        Level {result.severity} - {getSeverityLabel(result.severity)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Masked Text</label>
                  <div className="mt-1 p-3 bg-slate-100 rounded-md font-mono text-sm">
                    {result.masked_text}
                  </div>
                </div>
              </div>

              {result.matches && result.matches.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Detected Profanity ({result.matches.length} matches)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {result.matches.map((match, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                        <span className="font-mono text-sm text-gray-700">{match.word}</span>
                        <Badge 
                          className={`text-xs px-2 py-1 ${getSeverityColor(match.severity)}`}
                        >
                          {getSeverityLabel(match.severity)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}