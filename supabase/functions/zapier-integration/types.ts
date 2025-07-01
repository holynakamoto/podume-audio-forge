// Action types supported by the integration
export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'query';

// Generic database record type
export interface DatabaseRecord {
  [key: string]: any;
}

// Request payload from Zapier or API
export interface ZapierIntegrationRequest {
  action: ActionType;
  table: string;
  data?: DatabaseRecord;
  query?: {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
  };
  id?: string | number;
}

// Standardized response
export interface ZapierIntegrationResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  id?: string | number;
  timestamp: string;
  errorCode?: string;
} 