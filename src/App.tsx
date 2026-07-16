import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Database,
  Eye,
  FileSpreadsheet,
  LineChart as LineChartIcon,
  PanelTop,
  Pencil,
  ScrollText,
  Unlink,
  Upload,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'
import Landing from './Landing'
import { type PlatformName, type ReportRow, reportDataWithHaoyiku as reportData } from './data/dailyReport'

type Period = 'day' | 'week' | 'month' | 'year'
type Page = 'workbench' | 'indicators' | 'data'
type DetailPlatform = Exclude<PlatformName, '总计'>
type DataTab = 'tasks' | 'dailyData'
type LedgerPlatform = DetailPlatform | '抖店' | '得物'
type DataPlatformFilter = '全部' | LedgerPlatform
type DataStoreFilter = '全部' | string

const periods: Array<{ key: Period; label: string }> = [
  { key: 'year', label: '年' },
  { key: 'month', label: '月' },
  { key: 'week', label: '周' },
  { key: 'day', label: '日' },
]

const platforms: PlatformName[] = ['总计', ...reportData.map((item) => item.platform)]
const categoryColors: Record<string, string> = {
  '聚水潭-实发毛利': '#0f9f8a',
  平台费用: '#2864d8',
  推广费: '#8b5cf6',
  运费: '#06b6d4',
  管理费用: '#64748b',
  其他费用支出: '#f59e0b',
  财务费用: '#ef4444',
  税金及附加: '#14b8a6',
  返利: '#22c55e',
  利润: '#0f766e',
  净利润: '#0f766e',
  公摊净利润: '#2563eb',
  销售: '#0284c7',
  占比: '#f97316',
}

interface MetricSpec {
  field: string
  category: string
  chartTitle: string
}

const platformMetricSpecs: Record<PlatformName, MetricSpec[]> = {
  总计: [
    { field: '平台成交GMV', category: '销售', chartTitle: 'GMV' },
    { field: '平台费用合计', category: '平台费用', chartTitle: '平台费用合计' },
    { field: '管理费用合计', category: '管理费用', chartTitle: '管理费用合计' },
  ],
  快手: [
    { field: '平台成交GMV', category: '销售', chartTitle: 'GMV' },
    { field: '平台费用合计', category: '平台费用', chartTitle: '平台费用合计' },
    { field: '管理费用合计', category: '管理费用', chartTitle: '管理费用合计' },
  ],
  爱库存: [
    { field: '平台成交GMV', category: '销售', chartTitle: 'GMV' },
    { field: '平台费用合计', category: '平台费用', chartTitle: '平台费用合计' },
    { field: '管理费用合计', category: '管理费用', chartTitle: '管理费用合计' },
  ],
  唯品会: [
    { field: '平台成交GMV', category: '销售', chartTitle: 'GMV' },
    { field: '活动折扣', category: '聚水潭-实发毛利', chartTitle: '活动折扣' },
  ],
  好衣库: [
    { field: '平台成交GMV', category: '销售', chartTitle: 'GMV' },
    { field: '技术运营服务费', category: '平台费用', chartTitle: '技术运营服务费' },
    { field: '快递信息服务费', category: '平台费用', chartTitle: '快递信息服务费' },
  ],
}

type DailyReportStatus = '待发布' | '已发布' | '未发布'
type CrossValidationStatus = '通过' | '未通过' | '已修正'
type TaskSource = '定时任务' | '指令' | '人工上传文件'
type TaskResult = '完成' | '失败'

interface DailyTaskRecord {
  id: string
  taskId: string
  fileName: string
  source: TaskSource
  platform: LedgerPlatform
  store: string
  taskDate: string
  businessDate: string
  resultPreview: string
  taskResult: TaskResult
  reportStatus: DailyReportStatus
  crossValidation: CrossValidationStatus
  taskLog: string
  isUnbound: boolean
  metrics: { gmv: number; platformFee: number; managementFee: number }
}

interface DailyDataRecord {
  taskId: string
  businessDate: string
  platform: LedgerPlatform
  store: string
  gmv: number
  platformFee: number
  managementFee: number
}

const taskColumns = ['任务 ID', '任务来源', '平台', '店铺', '任务日期', '业务日期', '结果预览', '任务结果', '日报状态', '交叉验证', '任务日志', '操作项']
const dailyDataColumns = ['业务日期', '平台名称', '店铺名称', 'GMV', '平台费用合计', '管理费用合计', '查看明细']

const taskRows: DailyTaskRecord[] = [
  {
    id: 'task-1',
    taskId: '20260714KSGFGJ001',
    fileName: '快手日报自动化结果.json',
    source: '定时任务',
    platform: '快手',
    store: '官方旗舰店',
    taskDate: '2026-07-14 08:05:14',
    businessDate: '2026-07-13',
    resultPreview: '任务完成',
    taskResult: '完成',
    reportStatus: '待发布',
    crossValidation: '通过',
    taskLog: '08:05 拉取快手日报；08:06 完成字段校验；08:05:14 任务结束。',
    isUnbound: false,
    metrics: { gmv: 12722.86, platformFee: 1658.79, managementFee: 116.76 },
  },
  {
    id: 'task-2',
    taskId: '20260714AKJBSP001',
    fileName: '爱库存日报自动化结果.json',
    source: '定时任务',
    platform: '爱库存',
    store: '京倍店铺',
    taskDate: '2026-07-14 08:11:27',
    businessDate: '2026-07-13',
    resultPreview: '任务完成',
    taskResult: '完成',
    reportStatus: '待发布',
    crossValidation: '未通过',
    taskLog: '08:11 拉取爱库存费用数据；品牌推广费为空，等待人工复核。',
    isUnbound: false,
    metrics: { gmv: 5519.9, platformFee: 573.06, managementFee: 0 },
  },
  {
    id: 'task-3',
    taskId: '20260714WPPPJH001',
    fileName: '唯品会日报自动化结果.json',
    source: '指令',
    platform: '唯品会',
    store: '品牌集合店',
    taskDate: '2026-07-14 08:18:42',
    businessDate: '2026-07-13',
    resultPreview: '任务完成',
    taskResult: '完成',
    reportStatus: '已发布',
    crossValidation: '已修正',
    taskLog: '08:18 接收补数指令；08:19 完成唯品会字段复核并发布。',
    isUnbound: false,
    metrics: { gmv: 57911.59, platformFee: 1501.65, managementFee: 0 },
  },
  {
    id: 'task-4',
    taskId: '20260714DYDYSP001',
    fileName: '--',
    source: '定时任务',
    platform: '抖店',
    store: '抖店旗舰店',
    taskDate: '2026-07-14 08:24:08',
    businessDate: '2026-07-13',
    resultPreview: '--',
    taskResult: '失败',
    reportStatus: '未发布',
    crossValidation: '未通过',
    taskLog: '08:24 调用抖店任务失败：授权令牌失效。',
    isUnbound: false,
    metrics: { gmv: 0, platformFee: 0, managementFee: 0 },
  },
]

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

const ledgerPlatforms: LedgerPlatform[] = ['快手', '抖店', '唯品会', '爱库存', '好衣库', '得物']

function dateMinusOne() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().slice(0, 10)
}

function platformAbbreviation(platform: LedgerPlatform) {
  return { 快手: 'KS', 抖店: 'DY', 唯品会: 'WP', 爱库存: 'AK', 好衣库: 'HY', 得物: 'DW' }[platform]
}

function storeAbbreviation(store: string) {
  const known: Record<string, string> = { 官方旗舰店: 'GFGJ', 京倍店铺: 'JBSP', 万顷店铺: 'WQSP', 品牌集合店: 'PPJH', 抖店旗舰店: 'DYSP', 好衣库店铺: 'HYKS', 得物店铺: 'DWSP' }
  return known[store] ?? store.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 4).padEnd(4, 'X')
}

function makeTaskId(platform: LedgerPlatform, store: string, records: DailyTaskRecord[], taskDate = new Date()) {
  const date = taskDate.toISOString().slice(0, 10).replaceAll('-', '')
  const prefix = `${date}${platformAbbreviation(platform)}${storeAbbreviation(store)}`
  const sequence = records.filter((record) => record.platform === platform && record.store === store).length + 1
  return `${prefix}${String(sequence).padStart(3, '0')}`
}

function formatAmount(value: number) {
  const abs = Math.abs(value)
  if (abs >= 10000) return `${(value / 10000).toFixed(1)}万`
  return value.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

function formatPrecise(value: number, type: 'amount' | 'ratio' = 'amount') {
  if (type === 'ratio') return `${(value * 100).toFixed(2)}%`
  return value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

function tooltipAmount(value: unknown) {
  return formatPrecise(typeof value === 'number' ? value : Number(value) || 0)
}

function getPlatformReports(platform: PlatformName) {
  return platform === '总计' ? reportData : reportData.filter((item) => item.platform === platform)
}

function collectRows(platform: PlatformName, predicate: (row: ReportRow) => boolean) {
  return getPlatformReports(platform).flatMap((report) =>
    report.rows.filter(predicate).map((row) => ({ row, platform: report.platform })),
  )
}

const storeShares: Record<DetailPlatform, Array<{ name: string; share: number }>> = {
  快手: [{ name: '官方旗舰店', share: 1 }],
  爱库存: [
    { name: '京倍店铺', share: 0.58 },
    { name: '万顷店铺', share: 0.42 },
  ],
  唯品会: [{ name: '品牌集合店', share: 1 }],
  好衣库: [{ name: '好衣库店铺', share: 1 }],
}

function periodBuckets(period: Period) {
  if (period === 'day') return [{ label: '当日', indexes: [1] }]
  if (period === 'week') return Array.from({ length: 7 }, (_, index) => ({ label: `${index + 1}日`, indexes: [index + 1] }))
  if (period === 'month') return Array.from({ length: 4 }, (_, index) => ({ label: `第${index + 1}周`, indexes: Array.from({ length: 7 }, (_, offset) => index * 7 + offset + 1) }))
  return Array.from({ length: 12 }, (_, index) => ({ label: `${index + 1}月`, indexes: index === 5 ? Array.from({ length: 30 }, (_, offset) => offset + 1) : [] }))
}

function rowPeriodValue(row: ReportRow, period: Period, indexes: number[]) {
  if (period === 'year') return indexes.length ? row.monthTotal : 0
  if (period === 'month' && indexes.length >= 20) return row.monthTotal
  return indexes.reduce((sum, index) => sum + (row.daily[index]?.value ?? 0), 0)
}

function fieldPeriodValue(platform: PlatformName, field: string, period: Period, indexes: number[]) {
  return collectRows(platform, (row) => row.field === field).reduce((sum, item) => sum + rowPeriodValue(item.row, period, indexes), 0)
}

function fieldSummaryValue(platform: PlatformName, field: string, period: Period) {
  const rows = collectRows(platform, (row) => row.field === field)
  if (period === 'year') return rows.reduce((sum, item) => sum + item.row.yearTotal, 0)
  if (period === 'month') return rows.reduce((sum, item) => sum + item.row.monthTotal, 0)
  const indexes = period === 'day' ? [1] : periodBuckets('week').flatMap((bucket) => bucket.indexes)
  return rows.reduce((sum, item) => sum + indexes.reduce((subtotal, index) => subtotal + (item.row.daily[index]?.value ?? 0), 0), 0)
}

function platformFieldBuckets(platform: DetailPlatform, field: string, period: Period) {
  return periodBuckets(period).map((bucket) => ({
    label: bucket.label,
    value: fieldPeriodValue(platform, field, period, bucket.indexes),
  }))
}

function storeFieldBuckets(platform: DetailPlatform, field: string, period: Period) {
  return storeShares[platform].map((store) => ({
    name: store.name,
    value: fieldPeriodValue(platform, field, period, periodBuckets(period).reduce((all, bucket) => all.concat(bucket.indexes), [] as number[])) * store.share,
  }))
}

function storeFieldDetailSeries(platform: DetailPlatform, field: string, period: Period) {
  return storeShares[platform].map((store) => ({
    name: store.name,
    data: periodBuckets(period).map((bucket) => ({
      label: bucket.label,
      value: fieldPeriodValue(platform, field, period, bucket.indexes) * store.share,
    })),
  }))
}

function platformFeeFields(platform: PlatformName) {
  return Array.from(new Set(collectRows(platform, (row) => row.category === '平台费用' && !row.isTotal).map((item) => item.row.field)))
}

const feeColors = ['#2864d8', '#0ea5e9', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444']

function feeColor(field: string) {
  return feeColors[Math.max(0, platformFeeFields('总计').indexOf(field)) % feeColors.length]
}

interface PlatformFeeTooltipEntry {
  color?: string
  dataKey?: string | number
  value?: string | number
}

function PlatformFeeTooltip({ active, label, payload }: { active?: boolean; label?: string | number; payload?: PlatformFeeTooltipEntry[] }) {
  const platform = typeof label === 'string' && reportData.some((report) => report.platform === label) ? label as PlatformName : null
  if (!active || !platform) return null
  const fields = platformFeeFields(platform)
  const entries = fields.map((field) => payload?.find((item) => item.dataKey === field)).filter(Boolean) as PlatformFeeTooltipEntry[]
  return (
    <div className="platform-fee-tooltip">
      <strong>{platform} · 平台费用</strong>
      {entries.map((item) => (
        <span key={String(item.dataKey)}>
          <i style={{ background: item.color ?? feeColor(String(item.dataKey)) }} />
          {item.dataKey}：{formatPrecise(Number(item.value) || 0)}
        </span>
      ))}
    </div>
  )
}

function PlatformFeeLegend() {
  return (
    <div className="platform-fee-legend">
      {reportData.map((report) => {
        const fields = platformFeeFields(report.platform)
        if (!fields.length) return null
        return (
          <section key={report.platform}>
            <strong>{report.platform}</strong>
            <div>
              {fields.map((field) => <span key={field}><i style={{ background: feeColor(field) }} />{field}</span>)}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function feeBuckets(platform: PlatformName, period: Period) {
  return periodBuckets(period).map((bucket) => {
    const point: Record<string, string | number> = { label: bucket.label }
    platformFeeFields(platform).forEach((field) => {
      point[field] = fieldPeriodValue(platform, field, period, bucket.indexes)
    })
    return point
  })
}

function ChartShell({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="chart-shell">
      <header className="chart-shell__header">
        <div>
          <span className="eyebrow">{subtitle}</span>
          <h3>{title}</h3>
        </div>
        <span className="chart-shell__icon">{icon}</span>
      </header>
      <div className="chart-shell__body">{children}</div>
    </section>
  )
}

function MetricChart({ platform, period, spec, indicator = false }: { platform: PlatformName; period: Period; spec: MetricSpec; indicator?: boolean }) {
  const [detailView, setDetailView] = useState(false)
  const color = categoryColors[spec.category] ?? '#2864d8'
  const isGmv = spec.field === '平台成交GMV'
  const isFee = spec.field === '平台费用合计' || spec.field === '技术运营服务费' || spec.field === '快递信息服务费'

  if (platform === '总计') {
    const buckets = periodBuckets(period)
    const totalValue = fieldSummaryValue('总计', spec.field, period)
    if (isGmv) {
      const data = buckets.map((bucket) => {
        const point: Record<string, string | number> = { label: bucket.label }
        reportData.forEach((report) => { point[report.platform] = fieldPeriodValue(report.platform, spec.field, period, bucket.indexes) })
        return point
      })
      return (
        <ChartShell title="GMV" subtitle="总计 · 所有平台日GMV" icon={<LineChartIcon aria-hidden="true" />}>
          <div className="chart-summary-value">{formatPrecise(totalValue)}</div>
          <ResponsiveContainer width="100%" height={indicator ? 220 : 280}>
            <BarChart data={data}><CartesianGrid stroke="#e7eef7" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis tickFormatter={formatAmount} tickLine={false} axisLine={false} width={56} /><Tooltip formatter={tooltipAmount} /><Legend />{reportData.map((report, index) => <Bar key={report.platform} dataKey={report.platform} fill={['#0891b2', '#2563eb', '#14b8a6', '#f59e0b'][index]} radius={[4, 4, 0, 0]} />)}</BarChart>
          </ResponsiveContainer>
        </ChartShell>
      )
    }
    if (isFee) {
      const fields = platformFeeFields('总计')
      const data = reportData.map((report) => {
        const point: Record<string, string | number> = { name: report.platform }
        fields.forEach((field) => { point[field] = fieldSummaryValue(report.platform, field, period) })
        return point
      })
      return (
        <ChartShell title="平台费用合计" subtitle="总计 · 每个平台一根费用堆叠柱" icon={<BarChart3 aria-hidden="true" />}>
          <div className="chart-summary-value">{formatPrecise(totalValue)}</div>
          <ResponsiveContainer width="100%" height={indicator ? 220 : 280}>
            <BarChart data={data} stackOffset="none">
              <CartesianGrid stroke="#e7eef7" strokeDasharray="4 6" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={formatAmount} tickLine={false} axisLine={false} width={56} />
              <Tooltip content={<PlatformFeeTooltip />} wrapperStyle={{ zIndex: 30, pointerEvents: 'none' }} />
              {fields.map((field) => <Bar key={field} dataKey={field} stackId="fees" fill={feeColor(field)} />)}
            </BarChart>
          </ResponsiveContainer>
          <PlatformFeeLegend />
        </ChartShell>
      )
    }
    const data = buckets.map((bucket) => {
      const point: Record<string, string | number> = { label: bucket.label }
      reportData.forEach((report) => { point[report.platform] = fieldPeriodValue(report.platform, spec.field, period, bucket.indexes) })
      return point
    })
    return (
      <ChartShell title="管理费用合计" subtitle="总计 · 各平台管理费用" icon={<BarChart3 aria-hidden="true" />}>
        <div className="chart-summary-value">{formatPrecise(totalValue)}</div>
        <ResponsiveContainer width="100%" height={indicator ? 220 : 280}><BarChart data={data}><CartesianGrid stroke="#e7eef7" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis tickFormatter={formatAmount} tickLine={false} axisLine={false} width={56} /><Tooltip formatter={tooltipAmount} /><Legend />{reportData.map((report, index) => <Bar key={report.platform} dataKey={report.platform} fill={['#64748b', '#94a3b8', '#0f766e', '#f59e0b'][index]} radius={[4, 4, 0, 0]} />)}</BarChart></ResponsiveContainer>
      </ChartShell>
    )
  }

  const totalValue = fieldSummaryValue(platform, spec.field, period)
  if (isGmv) {
    const storeData = storeFieldBuckets(platform, spec.field, period)
    const dailyData = storeFieldDetailSeries(platform, spec.field, period)
    const combinedDailyData = periodBuckets(period).map((bucket, index) => {
      const point: Record<string, string | number> = { label: bucket.label }
      dailyData.forEach((store) => { point[store.name] = store.data[index]?.value ?? 0 })
      return point
    })
    return (
      <ChartShell title="GMV" subtitle={`${platform} · 按店铺`} icon={<LineChartIcon aria-hidden="true" />}>
        <div className="chart-summary-value">{formatPrecise(totalValue)}</div>
        <div className="chart-tabs"><button className={!detailView ? 'selected' : ''} type="button" onClick={() => setDetailView(false)}>期间合计</button>{period !== 'day' ? <button className={detailView ? 'selected' : ''} type="button" onClick={() => setDetailView(true)}>{period === 'week' ? '7日走势' : period === 'month' ? '4周细节' : '12月细节'}</button> : null}</div>
        {!detailView ? <ResponsiveContainer width="100%" height={indicator ? 220 : 280}><BarChart data={storeData}><CartesianGrid stroke="#e7eef7" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} /><YAxis tickFormatter={formatAmount} tickLine={false} axisLine={false} width={56} /><Tooltip formatter={tooltipAmount} /><Bar dataKey="value" fill="#0891b2" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : <ResponsiveContainer width="100%" height={indicator ? 220 : 280}><LineChart data={combinedDailyData}><CartesianGrid stroke="#e7eef7" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="label" type="category" allowDuplicatedCategory={false} tickLine={false} axisLine={false} /><YAxis tickFormatter={formatAmount} tickLine={false} axisLine={false} width={56} /><Tooltip formatter={tooltipAmount} /><Legend />{dailyData.map((store, index) => <Line key={store.name} type="monotone" dataKey={store.name} name={store.name} stroke={['#0891b2', '#2563eb', '#f59e0b'][index]} strokeWidth={2.5} />)}</LineChart></ResponsiveContainer>}
      </ChartShell>
    )
  }
  if (isFee && spec.field === '平台费用合计') {
    const fields = platformFeeFields(platform)
    const pieData = fields.map((field) => ({ name: field, value: fieldSummaryValue(platform, field, period) })).filter((item) => item.value !== 0)
    const data = feeBuckets(platform, period)
    return (
      <ChartShell title="平台费用合计" subtitle={`${platform} · 具体费用组成`} icon={<BarChart3 aria-hidden="true" />}>
        <div className="chart-summary-value">{formatPrecise(totalValue)}</div>
        <div className="chart-tabs"><button className={!detailView ? 'selected' : ''} type="button" onClick={() => setDetailView(false)}>费用组成</button>{period !== 'day' ? <button className={detailView ? 'selected' : ''} type="button" onClick={() => setDetailView(true)}>{period === 'week' ? '7日费用' : period === 'month' ? '4周费用' : '12月费用'}</button> : null}</div>
        {!detailView ? <ResponsiveContainer width="100%" height={indicator ? 220 : 280}><PieChart><Tooltip formatter={tooltipAmount} /><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82}>{pieData.map((item, index) => <Cell key={item.name} fill={['#2864d8', '#0ea5e9', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'][index % 6]} />)}</Pie></PieChart></ResponsiveContainer> : <ResponsiveContainer width="100%" height={indicator ? 220 : 280}><BarChart data={data}><CartesianGrid stroke="#e7eef7" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis tickFormatter={formatAmount} tickLine={false} axisLine={false} width={56} /><Tooltip formatter={tooltipAmount} /><Legend />{fields.map((field, index) => <Bar key={field} dataKey={field} stackId="fees" fill={['#2864d8', '#0ea5e9', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'][index % 6]} />)}</BarChart></ResponsiveContainer>}
      </ChartShell>
    )
  }
  if (spec.field === '管理费用合计') {
    const data = periodBuckets(period).map((bucket) => ({ label: bucket.label, value: fieldPeriodValue(platform, spec.field, period, bucket.indexes) }))
    return (
      <ChartShell title="管理费用合计" subtitle={`${platform} · 期间费用`} icon={<BarChart3 aria-hidden="true" />}>
        {period === 'day' ? <div className="daily-metric normal"><span>当日数值</span><strong>{formatPrecise(totalValue)}</strong><p>管理费用合计</p></div> : <ResponsiveContainer width="100%" height={indicator ? 220 : 280}><BarChart data={data}><CartesianGrid stroke="#e7eef7" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis tickFormatter={formatAmount} tickLine={false} axisLine={false} width={56} /><Tooltip formatter={tooltipAmount} /><Bar dataKey="value" fill="#64748b" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>}
      </ChartShell>
    )
  }
  const data = platformFieldBuckets(platform, spec.field, period)
  return <ChartShell title={spec.chartTitle} subtitle={`${platform} · ${spec.field}`} icon={<BarChart3 aria-hidden="true" />}><div className="chart-summary-value">{formatPrecise(totalValue)}</div><ResponsiveContainer width="100%" height={indicator ? 220 : 280}><BarChart data={data}><CartesianGrid stroke="#e7eef7" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis tickFormatter={formatAmount} tickLine={false} axisLine={false} width={56} /><Tooltip formatter={tooltipAmount} /><Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></ChartShell>
}

function statusClass(value: string) {
  if (value === '无') return 'neutral'
  if (['不通过', '待确认', '待复核', '规则待补', '人工审核', '暂缓接入'].some((word) => value.includes(word))) {
    return 'warning'
  }
  if (['字段缺失', '失败', '异常'].some((word) => value.includes(word))) return 'danger'
  if (['通过', '已确认', '已发布', '已修正'].some((word) => value.includes(word))) return 'normal'
  return 'neutral'
}

interface TaskPreviewField {
  field: string
  value: string
}

interface TaskPreviewGroup {
  category: string
  fields: TaskPreviewField[]
}

const taskPreviewCategories = ['销售', '平台费用', '管理费用']

function taskPreviewGroups(task: DailyTaskRecord): TaskPreviewGroup[] {
  const report = reportData.find((item) => item.platform === task.platform)
  if (!report) return []

  const matchedIndex = report.dates.findIndex((point) => point.date === task.businessDate)
  const dateIndex = matchedIndex >= 0 ? matchedIndex : Math.min(1, report.dates.length - 1)

  return taskPreviewCategories.map((category) => ({
    category,
    fields: report.rows
      .filter((row) => row.category === category && row.field.trim())
      .map((row) => {
        const value =
          row.field === '平台成交GMV'
            ? task.metrics.gmv
            : row.field === '平台费用合计'
              ? task.metrics.platformFee
              : row.field === '管理费用合计'
                ? task.metrics.managementFee
                : row.daily[dateIndex]?.value ?? 0
        return { field: row.field, value: formatPrecise(value, row.valueType) }
      }),
  })).filter((group) => group.fields.length > 0)
}

function TaskPreviewDialog({ task, onClose }: { task: DailyTaskRecord; onClose: () => void }) {
  const groups = taskPreviewGroups(task)
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="ledger-dialog task-preview-dialog">
        <header><div><span className="eyebrow">task_preview</span><h3>任务结果预览</h3></div><button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={onClose}>×</button></header>
        <div className="task-preview-grid"><span>任务 ID</span><strong>{task.taskId}</strong><span>平台 / 店铺</span><strong>{task.platform} · {task.store}</strong><span>业务日期</span><strong>{task.businessDate}</strong></div>
        {groups.length ? <div className="task-detail-groups">{groups.map((group) => <section key={group.category}><h4>{group.category}</h4><div>{group.fields.map((field) => <p key={field.field}><span>{field.field}</span><strong>{field.value}</strong></p>)}</div></section>)}</div> : <div className="task-detail-empty">该平台暂未配置日报字段映射。</div>}
      </section>
    </div>
  )
}

function DataPage() {
  const [tasks, setTasks] = useState<DailyTaskRecord[]>(taskRows)
  const [dailyData, setDailyData] = useState<DailyDataRecord[]>([
    { taskId: '20260714WPPPJH001', businessDate: '2026-07-13', platform: '唯品会', store: '品牌集合店', gmv: 57911.59, platformFee: 1501.65, managementFee: 0 },
  ])
  const [dataTab, setDataTab] = useState<DataTab>('tasks')
  const [taskPlatform, setTaskPlatform] = useState<DataPlatformFilter>('全部')
  const [taskStore, setTaskStore] = useState<DataStoreFilter>('全部')
  const [dailyPlatform, setDailyPlatform] = useState<DataPlatformFilter>('全部')
  const [dailyStore, setDailyStore] = useState<DataStoreFilter>('全部')
  const [dailyStartDate, setDailyStartDate] = useState('')
  const [dailyEndDate, setDailyEndDate] = useState(dateMinusOne())
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [previewTask, setPreviewTask] = useState<DailyTaskRecord | null>(null)
  const [logTask, setLogTask] = useState<DailyTaskRecord | null>(null)
  const [reviewingTaskId, setReviewingTaskId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStoreName, setUploadStoreName] = useState('')
  const [uploadPlatformName, setUploadPlatformName] = useState<LedgerPlatform>('快手')
  const [reviewNote, setReviewNote] = useState('')
  const [ledgerNotice, setLedgerNotice] = useState('')
  const taskStoreOptions = uniqueValues(tasks.filter((task) => taskPlatform === '全部' || task.platform === taskPlatform).map((task) => task.store))
  const dailyStoreOptions = uniqueValues(dailyData.filter((row) => dailyPlatform === '全部' || row.platform === dailyPlatform).map((row) => row.store))
  const visibleTasks = tasks
    .filter((task) => (taskPlatform === '全部' || task.platform === taskPlatform) && (taskStore === '全部' || task.store === taskStore))
    .sort((left, right) => right.taskDate.localeCompare(left.taskDate))
  const visibleDailyData = dailyData
    .filter((row) => (dailyPlatform === '全部' || row.platform === dailyPlatform) && (dailyStore === '全部' || row.store === dailyStore))
    .filter((row) => !dailyStartDate || row.businessDate >= dailyStartDate)
    .filter((row) => !dailyEndDate || row.businessDate <= dailyEndDate)
    .sort((left, right) => right.businessDate.localeCompare(left.businessDate))

  function publishTask(taskId: string) {
    const task = tasks.find((item) => item.taskId === taskId)
    if (!task || task.taskResult === '失败' || task.crossValidation === '未通过' || task.isUnbound) return
    setTasks((rows) => rows.map((row) => row.taskId === taskId ? { ...row, reportStatus: '已发布' } : row))
    setDailyData((rows) => [
      { taskId: task.taskId, businessDate: task.businessDate, platform: task.platform, store: task.store, ...task.metrics },
      ...rows.filter((row) => !(row.businessDate === task.businessDate && row.platform === task.platform && row.store === task.store)),
    ])
    setLedgerNotice('日报已发布，并已写入日报数据')
  }

  function openReview(task: DailyTaskRecord) {
    setReviewingTaskId(task.taskId)
    setReviewNote(task.taskLog)
    setIsReviewDialogOpen(true)
  }

  function completeReview() {
    if (!reviewingTaskId) return
    setTasks((rows) =>
      rows.map((row) =>
        row.taskId === reviewingTaskId
          ? { ...row, crossValidation: '已修正', taskLog: reviewNote.trim() || '人工复核完成' }
          : row,
      ),
    )
    setIsReviewDialogOpen(false)
    setLedgerNotice('复核完成，交叉验证已更新为“已修正”')
  }

  function unbindTask(taskId: string) {
    setTasks((rows) => rows.map((row) => row.taskId === taskId ? { ...row, isUnbound: true } : row))
    setDailyData((rows) => rows.filter((row) => row.taskId !== taskId))
    setLedgerNotice('任务已与对应业务日期和店铺的日报数据解绑')
  }

  function submitManualUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedFile || !uploadStoreName.trim()) return
    const record: DailyTaskRecord = {
      id: `task-${Date.now()}`,
      taskId: makeTaskId(uploadPlatformName, uploadStoreName.trim(), tasks),
      fileName: selectedFile.name,
      source: '人工上传文件',
      platform: uploadPlatformName,
      store: uploadStoreName.trim(),
      taskDate: new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-'),
      businessDate: dateMinusOne(),
      resultPreview: '任务完成',
      taskResult: '完成',
      reportStatus: '待发布',
      crossValidation: '未通过',
      taskLog: '人工上传文件完成，等待交叉验证。',
      isUnbound: false,
      metrics: { gmv: 0, platformFee: 0, managementFee: 0 },
    }
    setTasks((rows) => [record, ...rows])
    setTaskPlatform(uploadPlatformName)
    setTaskStore(uploadStoreName.trim())
    setSelectedFile(null)
    setUploadStoreName('')
    setIsUploadDialogOpen(false)
    setLedgerNotice('人工上传任务已创建，待完成交叉验证')
  }

  return (
    <section className="data-page page-stack">
      <section className="data-toolbar">
        <div className="data-subtabs ledger-tabs" aria-label="数据表切换">
          <button
            className={dataTab === 'tasks' ? 'selected' : ''}
            type="button"
            onClick={() => setDataTab('tasks')}
          >
            日报任务记录
          </button>
          <button
            className={dataTab === 'dailyData' ? 'selected' : ''}
            type="button"
            onClick={() => setDataTab('dailyData')}
          >
            日报数据
          </button>
        </div>

        <div className="ledger-filters" aria-label="平台与店铺筛选">
          <div className="data-subtabs platform-filter">
            {dataTab === 'tasks' ? (
              <button
                className={taskPlatform === '全部' ? 'selected' : ''}
                type="button"
                onClick={() => {
                  setTaskPlatform('全部')
                  setTaskStore('全部')
                }}
              >
                全部
              </button>
            ) : null}
            {ledgerPlatforms.map((item) => (
                  <button
                    className={(dataTab === 'tasks' ? taskPlatform : dailyPlatform) === item ? 'selected' : ''}
                    key={item}
                    type="button"
                    onClick={() => {
                      if (dataTab === 'tasks') {
                        setTaskPlatform(item)
                        setTaskStore('全部')
                      } else {
                        setDailyPlatform(item)
                        setDailyStore('全部')
                      }
                    }}
                  >
                    {item}
                  </button>
                ))}
          </div>
          <label className="store-filter">
            <span>店铺</span>
            <select
              value={dataTab === 'tasks' ? taskStore : dailyStore}
              onChange={(event) => {
                if (dataTab === 'tasks') {
                  setTaskStore(event.target.value)
                  return
                }
                setDailyStore(event.target.value)
              }}
            >
              <option value="全部">全部店铺</option>
              {(dataTab === 'tasks' ? taskStoreOptions : dailyStoreOptions).map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </select>
          </label>
          {dataTab === 'dailyData' ? (
            <label className="store-filter date-range-filter">
              <span>业务日期</span>
              <input type="date" max={dateMinusOne()} value={dailyStartDate} onChange={(event) => setDailyStartDate(event.target.value)} />
              <b>至</b>
              <input type="date" max={dateMinusOne()} value={dailyEndDate} onChange={(event) => setDailyEndDate(event.target.value)} />
            </label>
          ) : null}
        </div>
      </section>

      <article className="data-table-card upload-record-card task-record-card">
        <header>
          <div>
            <span className="eyebrow">{dataTab === 'tasks' ? 'daily_task_records' : 'daily_data'}</span>
            <h3>{dataTab === 'tasks' ? '日报任务记录' : '日报数据'}</h3>
          </div>
          {dataTab === 'tasks' ? (
            <button className="primary-action" type="button" onClick={() => setIsUploadDialogOpen(true)}>
              <Upload aria-hidden="true" />
              人工上传
            </button>
          ) : (
            <span className="table-count">{visibleDailyData.length} 条日报数据</span>
          )}
        </header>
        {ledgerNotice ? (
          <div className="ledger-notice" role="status">
            <AlertTriangle aria-hidden="true" />
            <span>{ledgerNotice}</span>
            <button type="button" aria-label="关闭提示" onClick={() => setLedgerNotice('')}>×</button>
          </div>
        ) : null}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {(dataTab === 'tasks' ? taskColumns : dailyDataColumns).map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataTab === 'tasks'
                ? visibleTasks.map((row) => (
                    <tr key={row.id}>
                      <td><span className="batch-id">{row.taskId}</span></td>
                      <td><span className={`data-pill ${row.source === '人工上传文件' ? 'warning' : 'normal'}`}>{row.source}</span></td>
                      <td>{row.platform}</td>
                      <td>{row.store}</td>
                      <td>{row.taskDate}</td>
                      <td>{row.businessDate}</td>
                      <td>{row.taskResult === '完成' ? <button className="preview-link" type="button" onClick={() => setPreviewTask(row)}><Eye aria-hidden="true" />查看</button> : '--'}</td>
                      <td><span className={`data-pill ${row.taskResult === '完成' ? 'normal' : 'danger'}`}>{row.taskResult}</span></td>
                      <td><span className={`data-pill ${row.reportStatus === '已发布' ? 'normal' : 'warning'}`}>{row.reportStatus}</span></td>
                      <td><span className={`data-pill ${statusClass(row.crossValidation)}`}>{row.crossValidation}</span></td>
                      <td><button className="log-link" type="button" onClick={() => setLogTask(row)}><ScrollText aria-hidden="true" />查看日志</button></td>
                      <td>
                        <div className="row-actions">
                          <button className="table-action publish" type="button" disabled={row.taskResult === '失败' || row.crossValidation === '未通过' || row.reportStatus === '已发布' || row.isUnbound} onClick={() => publishTask(row.taskId)}>
                            <CheckCircle2 aria-hidden="true" />发布
                          </button>
                          <button className="table-action" type="button" disabled={row.taskResult === '失败' || row.crossValidation !== '未通过' || row.isUnbound} onClick={() => openReview(row)}>
                            <Pencil aria-hidden="true" />修改
                          </button>
                          <button className="table-action danger-action" type="button" disabled={row.isUnbound} onClick={() => unbindTask(row.taskId)}>
                            <Unlink aria-hidden="true" />{row.isUnbound ? '已解绑' : '作废'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : visibleDailyData.map((row) => (
                    <tr key={row.taskId}>
                      <td>{row.businessDate}</td><td>{row.platform}</td><td>{row.store}</td><td>{formatPrecise(row.gmv)}</td><td>{formatPrecise(row.platformFee)}</td><td>{formatPrecise(row.managementFee)}</td>
                      <td><button className="preview-link" type="button" onClick={() => setPreviewTask(tasks.find((task) => task.taskId === row.taskId) ?? null)}><Eye aria-hidden="true" />查看明细</button></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </article>

      {isUploadDialogOpen ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsUploadDialogOpen(false)}>
          <form className="ledger-dialog" onSubmit={submitManualUpload}>
            <header>
              <div>
                <span className="eyebrow">manual_import</span>
                <h3>人工上传任务</h3>
              </div>
              <button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => setIsUploadDialogOpen(false)}>×</button>
            </header>
            <p>上传 Excel 后创建一条任务记录，业务日期默认取前一天。</p>
            <label className="dialog-field">
              <span>Excel 文件</span>
              <span className="file-picker">
                <FileSpreadsheet aria-hidden="true" />
                <strong>{selectedFile?.name ?? '选择 .xlsx / .xls / .csv 文件'}</strong>
                <input type="file" accept=".xlsx,.xls,.csv" required onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
              </span>
            </label>
            <label className="dialog-field">
              <span>平台</span>
              <select value={uploadPlatformName} onChange={(event) => setUploadPlatformName(event.target.value as LedgerPlatform)}>
                {ledgerPlatforms.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="dialog-field">
              <span>店铺名称</span>
              <input value={uploadStoreName} onChange={(event) => setUploadStoreName(event.target.value)} placeholder="请输入店铺全名" required />
            </label>
            <div className="dialog-meta"><span>来源：人工上传文件</span><span>业务日期：{dateMinusOne()}</span></div>
            <footer>
              <button className="secondary-action" type="button" onClick={() => setIsUploadDialogOpen(false)}>取消</button>
              <button className="primary-action" type="submit"><Upload aria-hidden="true" />创建任务</button>
            </footer>
          </form>
        </div>
      ) : null}

      {isReviewDialogOpen ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsReviewDialogOpen(false)}>
          <form className="ledger-dialog review-dialog" onSubmit={(event) => { event.preventDefault(); completeReview() }}>
            <header>
              <div>
                <span className="eyebrow">manual_review</span>
                <h3>人工复核修改</h3>
              </div>
              <button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => setIsReviewDialogOpen(false)}>×</button>
            </header>
            <p>完成复核后，交叉验证结果会更新为“已修正”，任务可以继续发布。</p>
            <label className="dialog-field">
              <span>复核说明</span>
              <textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="请输入修正后的说明" rows={4} />
            </label>
            <footer>
              <button className="secondary-action" type="button" onClick={() => setIsReviewDialogOpen(false)}>取消</button>
              <button className="primary-action" type="submit"><CheckCircle2 aria-hidden="true" />完成复核</button>
            </footer>
          </form>
        </div>
      ) : null}

      {previewTask ? <TaskPreviewDialog task={previewTask} onClose={() => setPreviewTask(null)} /> : null}
      {logTask ? <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setLogTask(null)}><section className="ledger-dialog"><header><div><span className="eyebrow">task_log</span><h3>任务运行日志</h3></div><button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => setLogTask(null)}>×</button></header><pre className="task-log">{logTask.taskLog}</pre></section></div> : null}
    </section>
  )
}

function DashboardApp() {
  const [page, setPage] = useState<Page>('workbench')
  const [period, setPeriod] = useState<Period>('day')
  const [platform, setPlatform] = useState<PlatformName>('总计')
  const periodText = period === 'day' ? '前一天' : period === 'week' ? '自然周' : period === 'month' ? '本月' : '本年'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__mark">D</div>
          <div>
            <strong>经营数据看台</strong>
            <span>日报 Demo</span>
          </div>
        </div>

        <nav className="nav">
          <button className={page === 'workbench' ? 'active' : ''} type="button" onClick={() => setPage('workbench')}>
            <PanelTop aria-hidden="true" />
            工作台
          </button>
          <button className={page === 'indicators' ? 'active' : ''} type="button" onClick={() => setPage('indicators')}>
            <BarChart3 aria-hidden="true" />
            数据指标
          </button>
          <button className={page === 'data' ? 'active' : ''} type="button" onClick={() => setPage('data')}>
            <Database aria-hidden="true" />
            数据台账
          </button>
        </nav>

        <div className="sidebar-note">
          <CalendarDays aria-hidden="true" />
          <p>默认口径为前一天 00:00:00-23:59:59；周维度按自然周汇总。</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">多平台经营日报</span>
            <h1>{page === 'workbench' ? '经营总览' : page === 'indicators' ? '指标分析' : '数据台账'}</h1>
          </div>

          {page !== 'data' ? (
            <div className="filters" aria-label="全局筛选">
              <div className="segmented">
                {periods.map((item) => (
                  <button
                    className={period === item.key ? 'selected' : ''}
                    key={item.key}
                    type="button"
                    onClick={() => setPeriod(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="platform-tabs">
                {platforms.map((item) => (
                  <button
                    className={platform === item ? 'selected' : ''}
                    key={item}
                    type="button"
                    onClick={() => setPlatform(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </header>

        {page === 'workbench' ? (
          <section className="page-stack">
            <section className="data-scope-note">
              <div>
                <span className="eyebrow">{platform} · {periodText}</span>
                <h2>经营指标看板</h2>
              </div>
              <p>当前平台仅保留与经营判断直接相关的指标。</p>
            </section>
            <section className="dashboard-grid compact-metric-grid">
              {platformMetricSpecs[platform].map((spec) => <MetricChart key={spec.field} platform={platform} period={period} spec={spec} />)}
            </section>
          </section>
        ) : page === 'indicators' ? (
          <section className="page-stack">
            <section className="data-scope-note">
              <div>
                <span className="eyebrow">{platform} · {periodText}</span>
                <h2>数据指标</h2>
              </div>
              <p>已按平台保留最常用的经营指标。</p>
            </section>
            <section className="indicator-grid compact-indicator-grid">
              {platformMetricSpecs[platform].map((spec) => (
                <MetricChart key={spec.field} platform={platform} period={period} spec={spec} indicator />
              ))}
            </section>
          </section>
        ) : (
          <DataPage />
        )}
      </main>
    </div>
  )
}

function App() {
  const [isWorkbench, setIsWorkbench] = useState(() => window.location.hash === '#workbench')

  useEffect(() => {
    const handleHashChange = () => setIsWorkbench(window.location.hash === '#workbench')
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return isWorkbench ? <DashboardApp /> : <Landing />
}

export default App
