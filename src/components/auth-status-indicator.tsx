'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Users } from 'lucide-react';

export default function AuthStatusIndicator() {
  const { user, loading, isMigrating, isAuthenticated } = useAuth();
  const [dataStats, setDataStats] = useState({
    subjects: 0,
    questions: 0,
    lastUpdate: ''
  });

  useEffect(() => {
    updateDataStats();
    
    // Listen for data updates
    const handleDataUpdate = () => {
      updateDataStats();
    };

    window.addEventListener('localStorage-update', handleDataUpdate);
    window.addEventListener('data-preservation-refresh', handleDataUpdate);

    return () => {
      window.removeEventListener('localStorage-update', handleDataUpdate);
      window.removeEventListener('data-preservation-refresh', handleDataUpdate);
    };
  }, []);

  const updateDataStats = () => {
    try {
      const subjects = JSON.parse(localStorage.getItem('exam_training_subjects') || '[]');
      const questions = JSON.parse(localStorage.getItem('exam_training_questions') || '[]');
      
      setDataStats({
        subjects: subjects.length,
        questions: questions.length,
        lastUpdate: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error reading data stats:', error);
    }
  };

  const getStatusColor = () => {
    if (loading || isMigrating) return 'bg-yellow-500';
    if (isAuthenticated) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getStatusText = () => {
    if (loading) return 'Checking Authentication...';
    if (isMigrating) return 'Migrating Data...';
    if (isAuthenticated) return `Authenticated: ${user?.email}`;
    return 'Guest Mode';
  };

  const getStatusIcon = () => {
    if (loading || isMigrating) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (isAuthenticated) return <CheckCircle className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Database className="w-4 h-4" />
          Auth & Data Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Authentication Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant="secondary" className={`text-white ${getStatusColor()}`}>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className="text-xs">{getStatusText()}</span>
            </div>
          </Badge>
        </div>

        {/* Data Stats */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subjects:</span>
            <Badge variant="outline">{dataStats.subjects}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Questions:</span>
            <Badge variant="outline">{dataStats.questions}</Badge>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {dataStats.lastUpdate}
          </div>
        </div>

        {/* Migration Status */}
        {isMigrating && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Data migration in progress...
            </span>
          </div>
        )}

        {/* Test Button */}
        <Button 
          onClick={updateDataStats} 
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          <RefreshCw className="w-3 h-3 mr-2" />
          Refresh Stats
        </Button>
      </CardContent>
    </Card>
  );
}