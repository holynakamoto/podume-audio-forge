
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SecurityEvent {
  id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

const SecurityAuditReport = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityEvents();
  }, []);

  const fetchSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('success')) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (eventType.includes('failed') || eventType.includes('error')) return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getEventBadgeColor = (eventType: string) => {
    if (eventType.includes('success')) return 'bg-green-100 text-green-800';
    if (eventType.includes('failed') || eventType.includes('error')) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return <div className="text-center p-4">Loading security audit log...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Audit Log
        </CardTitle>
        <CardDescription>
          Recent authentication and security events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getEventIcon(event.event_type)}
                <div>
                  <div className="font-medium">{event.event_type.replace(/_/g, ' ')}</div>
                  <div className="text-sm text-gray-500">
                    {event.event_data.email || 'System event'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getEventBadgeColor(event.event_type)}>
                  {event.event_type.split('_')[1]}
                </Badge>
                <div className="text-xs text-gray-500">
                  {new Date(event.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No security events recorded yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityAuditReport;
