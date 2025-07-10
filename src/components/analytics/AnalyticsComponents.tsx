import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Users,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  Activity,
  ExternalLink,
  Download,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { 
  ProfileAnalytics, 
  AnalyticsChartData, 
  TopLinksData, 
  DeviceBreakdown as DeviceBreakdownData
} from '@/services/analyticsService';

// Color palette for charts
const CHART_COLORS = ['#0066CC', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#8B5A2B'];

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: string;
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'blue',
  description
}) => {
  const isPositiveChange = change && change > 0;
  const isNegativeChange = change && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
            {React.cloneElement(icon as React.ReactElement, {
              className: `w-4 h-4 text-${color}-600 dark:text-${color}-400`
            })}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {isPositiveChange && <TrendingUp className="w-3 h-3 text-green-500" />}
              {isNegativeChange && <TrendingDown className="w-3 h-3 text-red-500" />}
              <span className={`text-xs ${
                isPositiveChange ? 'text-green-600' : 
                isNegativeChange ? 'text-red-600' : 
                'text-gray-500'
              }`}>
                {change > 0 ? '+' : ''}{change}% {changeLabel}
              </span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Analytics Overview Component
interface AnalyticsOverviewProps {
  analytics: ProfileAnalytics;
  loading?: boolean;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  analytics,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <MetricCard
        title="Total Views"
        value={analytics.total_views}
        change={analytics.views_this_week > 0 ? 
          Math.round(((analytics.views_this_week / Math.max(analytics.total_views - analytics.views_this_week, 1)) * 100)) : 0
        }
        changeLabel="this week"
        icon={<Eye />}
        color="blue"
        description="Profile page visits"
      />
      
      <MetricCard
        title="Link Clicks"
        value={analytics.total_link_clicks}
        change={analytics.link_clicks_this_week > 0 ? 
          Math.round(((analytics.link_clicks_this_week / Math.max(analytics.total_link_clicks - analytics.link_clicks_this_week, 1)) * 100)) : 0
        }
        changeLabel="this week"
        icon={<MousePointer />}
        color="purple"
        description="Social & custom links"
      />
      
      <MetricCard
        title="Unique Visitors"
        value={analytics.unique_visitors}
        icon={<Users />}
        color="green"
        description="Individual people"
      />
      
      <MetricCard
        title="Today's Views"
        value={analytics.views_today}
        icon={<Activity />}
        color="orange"
        description="Views in last 24h"
      />
    </div>
  );
};

// Analytics Chart Component
interface AnalyticsChartProps {
  data: AnalyticsChartData[];
  loading?: boolean;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  loading = false
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Views & Clicks Over Time</CardTitle>
          <CardDescription>Track your profile performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Views & Clicks Over Time
          </CardTitle>
          <CardDescription>
            Track your profile performance over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#0066CC" 
                  strokeWidth={2}
                  dot={{ fill: '#0066CC', strokeWidth: 2, r: 4 }}
                  name="Views"
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  name="Clicks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Top Links Component
interface TopLinksProps {
  data: TopLinksData[];
  loading?: boolean;
}

export const TopLinks: React.FC<TopLinksProps> = ({
  data,
  loading = false
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Links</CardTitle>
          <CardDescription>Most clicked social links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Top Performing Links
          </CardTitle>
          <CardDescription>
            Most clicked social and custom links
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MousePointer className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No link clicks yet</p>
              <p className="text-sm">Share your profile to start tracking clicks!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((link, index) => (
                <div 
                  key={link.platform}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    >
                      #{index + 1}
                    </Badge>
                    <span className="font-medium capitalize">
                      {link.platform}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {link.clicks} clicks
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {link.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Device Breakdown Component
interface DeviceBreakdownProps {
  data: DeviceBreakdownData[];
  loading?: boolean;
}

export const DeviceBreakdown: React.FC<DeviceBreakdownProps> = ({
  data,
  loading = false
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Breakdown</CardTitle>
          <CardDescription>How visitors access your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const pieData = data.map((item, index) => ({
    name: item.device,
    value: item.views,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Device Breakdown
          </CardTitle>
          <CardDescription>
            How visitors access your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No device data yet</p>
              <p className="text-sm">Get more profile views to see device breakdown!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Device List */}
              <div className="space-y-3">
                {data.map((device, index) => (
                  <div 
                    key={device.device}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      ></div>
                      {getDeviceIcon(device.device)}
                      <span className="font-medium">{device.device}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{device.views}</div>
                      <div className="text-xs text-gray-500">{device.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Export Data Component
interface ExportDataProps {
  profileId: string;
  onExport: () => void;
  loading?: boolean;
}

export const ExportData: React.FC<ExportDataProps> = ({
  profileId,
  onExport,
  loading = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Analytics Data
        </CardTitle>
        <CardDescription>
          Download your analytics data for external analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Export includes profile views, link clicks, device breakdown, 
            and visitor analytics in CSV format.
          </p>
          <Button 
            onClick={onExport}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Privacy Notice Component
export const PrivacyNotice: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Privacy & Data Collection
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                We collect minimal, anonymized data to provide these analytics. 
                No personal information is stored, and all data is GDPR compliant. 
                You can delete your analytics data at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 