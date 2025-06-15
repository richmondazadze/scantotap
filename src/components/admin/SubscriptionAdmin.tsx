import React, { useState } from 'react';
import { SubscriptionService } from '@/services/subscriptionService';
import { SubscriptionMaintenanceService } from '@/services/subscriptionMaintenanceService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, CheckCircle, AlertCircle, Settings, User } from 'lucide-react';

/**
 * Admin component for subscription management and testing
 * This should only be accessible to admin users in production
 */
export const SubscriptionAdmin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [userId, setUserId] = useState('');

  const handleRunMaintenance = async () => {
    setLoading(true);
    try {
      const result = await SubscriptionMaintenanceService.runMaintenanceTasks();
      setResults({ type: 'maintenance', data: result });
    } catch (error) {
      setResults({ type: 'error', data: error });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncUser = async () => {
    if (!userId.trim()) return;
    
    setLoading(true);
    try {
      const result = await SubscriptionMaintenanceService.forceSyncUser(userId.trim());
      setResults({ type: 'sync', data: result });
    } catch (error) {
      setResults({ type: 'error', data: error });
    } finally {
      setLoading(false);
    }
  };

  const handleValidateUser = async () => {
    if (!userId.trim()) return;
    
    setLoading(true);
    try {
      const result = await SubscriptionMaintenanceService.validateUserSubscription(userId.trim());
      setResults({ type: 'validate', data: result });
    } catch (error) {
      setResults({ type: 'error', data: error });
    } finally {
      setLoading(false);
    }
  };

  const handleExpireOverdue = async () => {
    setLoading(true);
    try {
      const result = await SubscriptionService.expireOverdueSubscriptions();
      setResults({ type: 'expire', data: result });
    } catch (error) {
      setResults({ type: 'error', data: error });
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    const { type, data } = results;

    switch (type) {
      case 'maintenance':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Maintenance Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Expired Subscriptions</h4>
                <p className="text-sm text-muted-foreground">
                  Expired: {data.expiredSubscriptions.expired}, Errors: {data.expiredSubscriptions.errors}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Sync Results</h4>
                <p className="text-sm text-muted-foreground">
                  Processed: {data.syncResults.processed}, Updated: {data.syncResults.updated}, Errors: {data.syncResults.errors}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Timestamp</h4>
                <p className="text-sm text-muted-foreground">{data.timestamp}</p>
              </div>
            </CardContent>
          </Card>
        );

      case 'sync':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500" />
                User Sync Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={data.updated ? "default" : "secondary"}>
                  {data.updated ? "Updated" : "No Change"}
                </Badge>
                <span className="text-sm">New Plan: {data.newPlan}</span>
              </div>
            </CardContent>
          </Card>
        );

      case 'validate':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {data.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                Validation Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={data.isValid ? "default" : "destructive"}>
                  {data.isValid ? "Valid" : "Issues Found"}
                </Badge>
                {data.fixed && <Badge variant="outline">Auto-Fixed</Badge>}
              </div>
              {data.issues.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Issues:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {data.issues.map((issue: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'expire':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Expiry Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Expired: {data.expired} subscriptions, Errors: {data.errors}
              </p>
            </CardContent>
          </Card>
        );

      case 'error':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600">{data.message || 'An error occurred'}</p>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Subscription Admin</h1>
        <p className="text-muted-foreground">
          Tools for managing and testing subscription synchronization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Maintenance Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Maintenance Tasks
            </CardTitle>
            <CardDescription>
              Run background maintenance and synchronization tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleRunMaintenance} 
              disabled={loading}
              className="w-full"
            >
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              Run Full Maintenance
            </Button>
            <Button 
              onClick={handleExpireOverdue} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Expire Overdue Subscriptions
            </Button>
          </CardContent>
        </Card>

        {/* User-Specific Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Actions
            </CardTitle>
            <CardDescription>
              Test and manage specific user subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={handleSyncUser} 
                disabled={loading || !userId.trim()}
                size="sm"
              >
                Sync User
              </Button>
              <Button 
                onClick={handleValidateUser} 
                disabled={loading || !userId.trim()}
                variant="outline"
                size="sm"
              >
                Validate User
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {results && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold mb-4">Results</h2>
            {renderResults()}
          </div>
        </>
      )}
    </div>
  );
}; 