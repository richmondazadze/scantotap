import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Legend,
  Area,
  AreaChart
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
  RefreshCw,
  FileText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
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

// Enhanced Mobile-Friendly Analytics Chart Component
interface AnalyticsChartProps {
  data: AnalyticsChartData[];
  loading?: boolean;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  loading = false
}) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  const [timeRange, setTimeRange] = useState<'7' | '14' | '30'>('30');
  const [selectedMetric, setSelectedMetric] = useState<'both' | 'views' | 'clicks'>('both');
  const chartRef = useRef<HTMLDivElement>(null);

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

  // Filter data based on time range
  const filteredData = data.slice(-parseInt(timeRange));

  // Format data for better mobile display
  const formattedData = filteredData.map(item => ({
    ...item,
    shortDate: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  const maxViews = Math.max(...formattedData.map(d => d.views));
  const maxClicks = Math.max(...formattedData.map(d => d.clicks));
  const totalViews = formattedData.reduce((sum, d) => sum + d.views, 0);
  const totalClicks = formattedData.reduce((sum, d) => sum + d.clicks, 0);

  // Custom tooltip for mobile
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white mb-2">
            {new Date(label).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-medium">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: formattedData,
      margin: { top: 10, right: 10, left: 0, bottom: 0 }
    };

    const lineProps = {
      strokeWidth: 3,
      dot: { strokeWidth: 2, r: 4 },
      activeDot: { r: 6, strokeWidth: 2 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066CC" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0066CC" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="shortDate" 
              axisLine={false}
              tickLine={false}
              className="text-xs"
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-xs"
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            {selectedMetric !== 'clicks' && (
              <Area
                type="monotone"
                dataKey="views"
                stroke="#0066CC"
                strokeWidth={2}
                fill="url(#viewsGradient)"
                name="Views"
              />
            )}
            {selectedMetric !== 'views' && (
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#clicksGradient)"
                name="Clicks"
              />
            )}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="shortDate" 
              axisLine={false}
              tickLine={false}
              className="text-xs"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-xs"
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedMetric !== 'clicks' && (
              <Bar 
                dataKey="views" 
                fill="#0066CC" 
                name="Views"
                radius={[2, 2, 0, 0]}
              />
            )}
            {selectedMetric !== 'views' && (
              <Bar 
                dataKey="clicks" 
                fill="#8B5CF6" 
                name="Clicks"
                radius={[2, 2, 0, 0]}
              />
            )}
          </BarChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="shortDate" 
              axisLine={false}
              tickLine={false}
              className="text-xs"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-xs"
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            {selectedMetric !== 'clicks' && (
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#0066CC" 
                {...lineProps}
                name="Views"
              />
            )}
            {selectedMetric !== 'views' && (
              <Line 
                type="monotone" 
                dataKey="clicks" 
                stroke="#8B5CF6" 
                {...lineProps}
                name="Clicks"
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Views & Clicks Over Time
              </CardTitle>
              <CardDescription>
                Track your profile performance trends
              </CardDescription>
            </div>
            
            {/* Mobile-friendly controls */}
            <div className="flex flex-wrap gap-2">
              <Select value={timeRange} onValueChange={(value: '7' | '14' | '30') => setTimeRange(value)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7d</SelectItem>
                  <SelectItem value="14">14d</SelectItem>
                  <SelectItem value="30">30d</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedMetric} onValueChange={(value: 'both' | 'views' | 'clicks') => setSelectedMetric(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="clicks">Clicks</SelectItem>
                </SelectContent>
              </Select>

              <Select value={chartType} onValueChange={(value: 'line' | 'area' | 'bar') => setChartType(value)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="area">Area</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalViews}</div>
              <div className="text-xs text-gray-500">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalClicks}</div>
              <div className="text-xs text-gray-500">Total Clicks</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div ref={chartRef} className="h-64 sm:h-80 touch-pan-x touch-pan-y" data-chart-export>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
          
          {/* Mobile swipe hint */}
          <div className="mt-4 text-center text-xs text-gray-400 sm:hidden">
            💡 Tip: Touch and drag to explore the chart
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

// Enhanced Export Data Component with CSV and PDF support
interface ExportDataProps {
  profileId: string;
  analytics?: ProfileAnalytics;
  chartData?: AnalyticsChartData[];
  topLinks?: TopLinksData[];
  deviceBreakdown?: DeviceBreakdownData[];
  loading?: boolean;
}

export const ExportData: React.FC<ExportDataProps> = ({
  profileId,
  analytics,
  chartData = [],
  topLinks = [],
  deviceBreakdown = [],
  loading = false
}) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // CSV Export Functions
  const exportToCSV = async () => {
    setIsExporting(true);
    setExportProgress(20);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `analytics-${profileId}-${timestamp}`;

      // Prepare analytics summary data
      const summaryData = analytics ? [{
        'Metric': 'Total Views',
        'Value': analytics.total_views,
        'This Week': analytics.views_this_week,
        'This Month': analytics.views_this_month,
        'Today': analytics.views_today
      }, {
        'Metric': 'Total Link Clicks',
        'Value': analytics.total_link_clicks,
        'This Week': analytics.link_clicks_this_week,
        'This Month': analytics.link_clicks_this_month,
        'Today': analytics.link_clicks_today
      }, {
        'Metric': 'Unique Visitors',
        'Value': analytics.unique_visitors,
        'This Week': '-',
        'This Month': '-',
        'Today': '-'
      }] : [];

      setExportProgress(40);

      // Prepare daily chart data
      const dailyData = chartData.map(item => ({
        'Date': item.date,
        'Views': item.views,
        'Clicks': item.clicks
      }));

      setExportProgress(60);

      // Prepare top links data
      const linksData = topLinks.map((link, index) => ({
        'Rank': index + 1,
        'Platform': link.platform,
        'Clicks': link.clicks,
        'Percentage': `${link.percentage}%`
      }));

      setExportProgress(80);

      // Prepare device breakdown data
      const deviceData = deviceBreakdown.map(device => ({
        'Device Type': device.device,
        'Views': device.views,
        'Percentage': `${device.percentage}%`
      }));

      setExportProgress(90);

      // Create and download multiple CSV files in a structured way
      const csvFiles = [
        { name: `${filename}-summary.csv`, data: summaryData },
        { name: `${filename}-daily.csv`, data: dailyData },
        { name: `${filename}-links.csv`, data: linksData },
        { name: `${filename}-devices.csv`, data: deviceData }
      ];

      for (const file of csvFiles) {
        if (file.data.length > 0) {
          const csv = Papa.unparse(file.data as any[]);
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          
          if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', file.name);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      }

      setExportProgress(100);
      
      // Show success message
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Error exporting CSV:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // PDF Export Function
  const exportToPDF = async () => {
    setIsExporting(true);
    setExportProgress(10);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(0, 102, 204);
      pdf.text('Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      setExportProgress(20);

      // Add analytics summary
      if (analytics) {
        pdf.setFontSize(16);
        pdf.setTextColor(0);
        pdf.text('Summary Statistics', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        const summaryText = [
          `Total Views: ${analytics.total_views.toLocaleString()}`,
          `Total Link Clicks: ${analytics.total_link_clicks.toLocaleString()}`,
          `Unique Visitors: ${analytics.unique_visitors.toLocaleString()}`,
          `Views Today: ${analytics.views_today}`,
          `Views This Week: ${analytics.views_this_week}`,
          `Views This Month: ${analytics.views_this_month}`,
        ];

        summaryText.forEach((text) => {
          pdf.text(text, 20, yPosition);
          yPosition += 6;
        });

        yPosition += 10;
      }

      setExportProgress(40);

      // Add chart as image (if chart is visible)
      const chartElement = document.querySelector('[data-chart-export]') as HTMLElement;
      if (chartElement) {
        try {
          const canvas = await html2canvas(chartElement, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Check if we need a new page
          if (yPosition + imgHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (imgError) {
          console.warn('Could not capture chart image:', imgError);
        }
      }

      setExportProgress(60);

      // Add top links table
      if (topLinks.length > 0) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.text('Top Performing Links', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        topLinks.forEach((link, index) => {
          pdf.text(`${index + 1}. ${link.platform}: ${link.clicks} clicks (${link.percentage}%)`, 20, yPosition);
          yPosition += 6;
        });

        yPosition += 10;
      }

      setExportProgress(80);

      // Add device breakdown
      if (deviceBreakdown.length > 0) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.text('Device Breakdown', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        deviceBreakdown.forEach((device) => {
          pdf.text(`${device.device}: ${device.views} views (${device.percentage}%)`, 20, yPosition);
          yPosition += 6;
        });
      }

      setExportProgress(90);

      // Save the PDF
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`analytics-report-${profileId}-${timestamp}.pdf`);

      setExportProgress(100);
      
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Error exporting PDF:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToPDF();
    }
  };

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
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={exportFormat === 'csv' ? 'default' : 'outline'}
                onClick={() => setExportFormat('csv')}
                className="flex items-center gap-2 h-auto p-4"
                disabled={isExporting}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">CSV Files</div>
                  <div className="text-xs opacity-70">Multiple spreadsheet files</div>
                </div>
              </Button>
              
              <Button
                variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                onClick={() => setExportFormat('pdf')}
                className="flex items-center gap-2 h-auto p-4"
                disabled={isExporting}
              >
                <FileText className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">PDF Report</div>
                  <div className="text-xs opacity-70">Complete visual report</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Export Description */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {exportFormat === 'csv' ? (
                <div>
                  <p className="font-medium mb-1">CSV Export includes:</p>
                  <ul className="text-xs space-y-1 ml-4">
                    <li>• Analytics summary with metrics breakdown</li>
                    <li>• Daily views and clicks data</li>
                    <li>• Top performing links ranking</li>
                    <li>• Device breakdown statistics</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p className="font-medium mb-1">PDF Report includes:</p>
                  <ul className="text-xs space-y-1 ml-4">
                    <li>• Complete analytics summary</li>
                    <li>• Visual charts and graphs</li>
                    <li>• Formatted tables and statistics</li>
                    <li>• Professional report layout</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Preparing {exportFormat.toUpperCase()}...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <Button 
            onClick={handleExport}
            disabled={loading || isExporting}
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Exporting {exportFormat.toUpperCase()}...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export as {exportFormat.toUpperCase()}
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