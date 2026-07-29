import { useMemo, useState } from 'react'
import { BarChart3, ChartNoAxesCombined, LayoutDashboard, LineChart as LineChartIcon, Plus, TrendingUp, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { type PlatformName, reportDataWithHaoyiku as reportData } from '../data/dailyReport'
import { ChartShell, MetricChart } from '../components/MetricChart'
import { costCompositionData, globalPeriodLabel, operatingTrendData, ratioTrendData } from '../data/globalDashboardMock'
import {
  type Period,
  fieldSummaryValue,
  formatAmount,
  formatPrecise,
  periodBuckets,
  periods,
  platformMetricSpecs,
  platforms,
  fieldPeriodValue,
} from '../lib/metrics'

type DashboardTab = 'global' | 'team' | 'personal'

const tooltipStyle = { background: '#101a18', border: '1px solid rgba(121,219,196,.24)', borderRadius: 6, color: '#d7e8e1', fontSize: 12 }
const axisProps = { tickLine: false, axisLine: false, stroke: '#8da39b', fontSize: 11 }
const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

function MetricSummaryCard({ platform, period, field, label, sublabel }: { platform: PlatformName; period: Period; field: string; label: string; sublabel: string }) {
  const value = fieldSummaryValue(platform, field, period)
  const buckets = periodBuckets(period)
  const currentSum = buckets.reduce((sum, bucket) => sum + fieldPeriodValue(platform, field, period, bucket.indexes), 0)
  void currentSum
  const deltas: Record<string, string> = {
    平台成交GMV: '+8.2%',
    平台费用合计: '+3.1%',
    管理费用合计: '-1.4%',
    活动折扣: '+2.6%',
    技术运营服务费: '+5.4%',
    快递信息服务费: '+1.2%',
  }
  const delta = deltas[field] ?? '+0.0%'
  return (
    <article className="metric-summary-card">
      <header><span className="eyebrow">{sublabel}</span><h3>{label}</h3></header>
      <div className="metric-summary-card__value"><strong>{formatPrecise(value)}</strong><span className={`metric-delta ${delta.startsWith('+') ? 'positive' : 'negative'}`}><TrendingUp aria-hidden="true" />{delta}</span></div>
      <footer><span>{platform === '总计' ? '所有平台合计' : `${platform} · 当前${period === 'day' ? '日' : period === 'week' ? '周' : period === 'month' ? '月' : '年'}`}</span></footer>
    </article>
  )
}

function GlobalDashboard({ period, onPeriodChange }: { period: Period; onPeriodChange: (period: Period) => void }) {
  const operatingData = useMemo(() => operatingTrendData(period), [period])
  const costData = useMemo(() => costCompositionData(period), [period])
  const ratioData = useMemo(() => ratioTrendData(period), [period])
  const periodLabel = globalPeriodLabel(period)
  const latestRatio = ratioData[ratioData.length - 1]?.actualRevenueRatio ?? 0

  return (
    <>
      <section className="data-scope-note global-dashboard-head" data-prd-anchor="dashboard-global-scope">
        <div><span className="eyebrow">global_dashboard · {periodLabel}</span><h2>全局经营看板</h2></div>
        <p>覆盖销售、净利润、费用和费率。当前数据为前端虚拟数据，用于确认图表口径与布局。</p>
      </section>
      <section className="filters global-dashboard-filter" aria-label="全局看板时间维度">
        <div className="segmented">{periods.map((item) => <button className={period === item.key ? 'selected' : ''} key={item.key} type="button" onClick={() => onPeriodChange(item.key)}>{item.label}</button>)}</div>
        <span className="global-dashboard-filter__hint">{periodLabel} · 更新至最近业务日期</span>
      </section>
      <section className="global-chart-grid" data-prd-anchor="dashboard-global-charts">
        <ChartShell title="销售与净利润趋势" subtitle={`${periodLabel} · 金额`} icon={<LineChartIcon aria-hidden="true" />}>
          <div className="chart-summary-value">GMV {formatPrecise(operatingData.reduce((sum, row) => sum + row.gmv, 0))}</div>
          <ResponsiveContainer width="100%" height={285}><LineChart data={operatingData}><CartesianGrid stroke="rgba(213,234,225,.08)" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="label" {...axisProps} /><YAxis tickFormatter={formatAmount} width={60} {...axisProps} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => formatPrecise(Number(value) || 0)} /><Legend wrapperStyle={{ color: '#8da39b', fontSize: 11 }} /><Line type="monotone" dataKey="gmv" name="GMV" stroke="#79dbc4" strokeWidth={2.5} dot={{ r: 3 }} /><Line type="monotone" dataKey="platformGmv" name="平台成交 GMV" stroke="#5fb7e6" strokeWidth={2.5} dot={{ r: 3 }} /><Line type="monotone" dataKey="actualSales" name="实际销售" stroke="#e9ae64" strokeWidth={2.5} dot={{ r: 3 }} /><Line type="monotone" dataKey="netProfit" name="净利润" stroke="#b794f6" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer>
          <p className="global-chart-note">实际销售 = 实发收入 - 退货金额 - 活动折扣；净利润按实际销售扣减货品、辅料、平台、推广、运费、管理及其他经营费用计算。</p>
        </ChartShell>
        <ChartShell title="经营费用构成" subtitle={`${periodLabel} · 平台 + 店铺`} icon={<BarChart3 aria-hidden="true" />}>
          <div className="chart-summary-value">费用合计 {formatPrecise(costData.reduce((sum, row) => sum + row.managementFee + row.otherExpense + row.financialExpense + row.taxes - row.rebate, 0))}</div>
          <ResponsiveContainer width="100%" height={285}><BarChart data={costData} margin={{ bottom: 12 }}><CartesianGrid stroke="rgba(213,234,225,.08)" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="name" interval={0} tick={{ fill: '#8da39b', fontSize: 10 }} tickLine={false} axisLine={false} /><YAxis tickFormatter={formatAmount} width={60} {...axisProps} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => formatPrecise(Number(value) || 0)} /><Legend wrapperStyle={{ color: '#8da39b', fontSize: 11 }} /><Bar dataKey="managementFee" name="管理费" stackId="cost" fill="#5fb7e6" /><Bar dataKey="otherExpense" name="其他费用" stackId="cost" fill="#79dbc4" /><Bar dataKey="financialExpense" name="财务费用" stackId="cost" fill="#b794f6" /><Bar dataKey="taxes" name="税金及附加" stackId="cost" fill="#e9ae64" /><Bar dataKey="rebate" name="返利 (+)" stackId="cost" fill="#34d6b3" /></BarChart></ResponsiveContainer>
          <p className="global-chart-note">横坐标按“平台 + 店铺”聚合；返利作为正向金额单独展示，方便核对费用结构。</p>
        </ChartShell>
        <ChartShell title="经营费率趋势" subtitle={`${periodLabel} · 比率`} icon={<ChartNoAxesCombined aria-hidden="true" />}>
          <div className="chart-summary-value">实际收入占平台收入 {formatPercent(latestRatio)}</div>
          <ResponsiveContainer width="100%" height={285}><LineChart data={ratioData}><CartesianGrid stroke="rgba(213,234,225,.08)" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="label" {...axisProps} /><YAxis domain={[0, 1]} tickFormatter={formatPercent} width={54} {...axisProps} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => formatPercent(Number(value) || 0)} /><Legend wrapperStyle={{ color: '#8da39b', fontSize: 11 }} /><Line type="monotone" dataKey="platformFeeRatio" name="平台费用占比" stroke="#5fb7e6" strokeWidth={2.3} dot={{ r: 3 }} /><Line type="monotone" dataKey="promotionRatio" name="推广占比" stroke="#e9ae64" strokeWidth={2.3} dot={{ r: 3 }} /><Line type="monotone" dataKey="returnRatio" name="退货占比" stroke="#f87171" strokeWidth={2.3} dot={{ r: 3 }} /><Line type="monotone" dataKey="variableCostRatio" name="变动费用占比" stroke="#b794f6" strokeWidth={2.3} dot={{ r: 3 }} /><Line type="monotone" dataKey="actualRevenueRatio" name="实际收入占比" stroke="#79dbc4" strokeWidth={2.6} dot={{ r: 3 }} /></LineChart></ResponsiveContainer>
          <p className="global-chart-note">推广占比不含 BD 佣金；平台费用与推广费用以平台收入为分母，退货和变动费用以实际收入为分母。</p>
        </ChartShell>
      </section>
    </>
  )
}

function TeamDashboard({ period, platform, onPeriodChange, onPlatformChange }: { period: Period; platform: PlatformName; onPeriodChange: (period: Period) => void; onPlatformChange: (platform: PlatformName) => void }) {
  const periodText = period === 'day' ? '前一天' : period === 'week' ? '自然周' : period === 'month' ? '本月' : '本年'
  const specs = platformMetricSpecs[platform]
  return (
    <>
      <section className="data-scope-note" data-prd-anchor="dashboard-team-scope"><div><span className="eyebrow">team_dashboard · {platform} · {periodText}</span><h2>团队经营看板</h2></div><p>保留原有团队经营总览与趋势组件，可按平台和时间维度查看对应统计变化。</p></section>
      <section className="filters" aria-label="团队看板筛选" data-prd-anchor="dashboard-team-filters"><div className="segmented">{periods.map((item) => <button className={period === item.key ? 'selected' : ''} key={item.key} type="button" onClick={() => onPeriodChange(item.key)}>{item.label}</button>)}</div><div className="platform-tabs">{platforms.map((item) => <button className={platform === item ? 'selected' : ''} key={item} type="button" onClick={() => onPlatformChange(item)}>{item}</button>)}</div></section>
      <section className="metric-summary-grid" data-prd-anchor="dashboard-team-metrics">{specs.map((spec) => <MetricSummaryCard key={spec.field} platform={platform} period={period} field={spec.field} label={spec.chartTitle} sublabel={`${spec.category} · ${spec.field}`} />)}</section>
      <section className="dashboard-grid" data-prd-anchor="dashboard-team-charts">{specs.map((spec) => <MetricChart key={spec.field} platform={platform} period={period} spec={spec} />)}</section>
      <section className="dashboard-source-note"><LineChartIcon aria-hidden="true" /><span>数据范围：{reportData.map((item) => item.platform).join(' / ')} · 周期与平台切换会同步刷新指标卡与图表。</span></section>
      <section className="dashboard-engine-hint"><BarChart3 aria-hidden="true" /><div><strong>需要更细的拆解？</strong><span>切到 chatbot 直接追问，经营引擎会基于这些数据生成归因结论。</span></div></section>
    </>
  )
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('global')
  const [period, setPeriod] = useState<Period>('day')
  const [platform, setPlatform] = useState<PlatformName>('总计')
  const [personalDashboardCreated, setPersonalDashboardCreated] = useState(false)
  return (
    <section className="page-stack dashboard-page">
      <nav className="dashboard-tabs" role="tablist" aria-label="经营看板类型">
        <button type="button" role="tab" aria-selected={activeTab === 'global'} className={activeTab === 'global' ? 'active' : ''} onClick={() => setActiveTab('global')}><LayoutDashboard aria-hidden="true" />全局看板</button>
        <button type="button" role="tab" aria-selected={activeTab === 'team'} className={activeTab === 'team' ? 'active' : ''} onClick={() => setActiveTab('team')}><Users aria-hidden="true" />团队看板</button>
        <button type="button" role="tab" aria-selected={activeTab === 'personal'} className={activeTab === 'personal' ? 'active' : ''} onClick={() => setActiveTab('personal')}><LayoutDashboard aria-hidden="true" />个人看板</button>
      </nav>
      {activeTab === 'global' ? <GlobalDashboard period={period} onPeriodChange={setPeriod} /> : null}
      {activeTab === 'team' ? <TeamDashboard period={period} platform={platform} onPeriodChange={setPeriod} onPlatformChange={setPlatform} /> : null}
      {activeTab === 'personal' ? (
        personalDashboardCreated ? (
          <section className="personal-dashboard-ready"><LayoutDashboard aria-hidden="true" /><div><span className="eyebrow">personal_dashboard</span><h3>我的新看板</h3><p>看板已创建，可从团队公共模板开始配置。</p></div></section>
        ) : (
          <section className="personal-dashboard-empty"><span className="personal-dashboard-empty__icon"><LayoutDashboard aria-hidden="true" /></span><h3>还没有个人看板</h3><p>创建后可按自己的工作重点组织经营指标。</p><button type="button" className="primary-action" onClick={() => setPersonalDashboardCreated(true)}><Plus aria-hidden="true" />新建看板</button></section>
        )
      ) : null}
    </section>
  )
}
