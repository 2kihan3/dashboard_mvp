import { useMemo, useState } from 'react'
import { BarChart3, LineChart as LineChartIcon, PanelTop, Plus, Settings2, TrendingUp, X } from 'lucide-react'
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

type DashboardView = 'global' | 'team' | 'personal'
type PersonalComponentType = 'chart' | 'metric'

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

function DailyGmvCard({ platform }: { platform: Exclude<PlatformName, '总计'> }) {
  const day = periodBuckets('day')[0]
  const value = fieldPeriodValue(platform, '平台成交GMV', 'day', day.indexes)
  return (
    <article className="daily-gmv-card">
      <header><h3>{platform}</h3><span className="eyebrow">GMV</span></header>
      <strong>{formatPrecise(value)}</strong>
      <footer>{day.label}</footer>
    </article>
  )
}

function DailyGmvChart({ platform }: { platform: PlatformName }) {
  const dailyPlatforms: Exclude<PlatformName, '总计'>[] = platform === '总计'
    ? reportData.map((item) => item.platform)
    : [platform]
  return (
    <ChartShell title="GMV" subtitle="最近业务日 · 平台">
      <div className="daily-gmv-grid">{dailyPlatforms.map((item) => <DailyGmvCard key={item} platform={item} />)}</div>
      <p className="global-chart-note">日维度下 GMV 以数值卡片展示；切换平台后仅保留该平台的 GMV。</p>
    </ChartShell>
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
        <div className="global-dashboard-title"><span className="eyebrow">global_dashboard · {periodLabel}</span><div><h2>全局经营看板</h2><span className="global-dashboard-title__notice">全量数据正在加紧获取，当前版本请到“团队看板”查看已有数据内容。</span></div></div>
        <p>覆盖销售、净利润、费用和费率。当前数据为前端虚拟数据，用于确认图表口径与布局。</p>
      </section>
      <section className="filters global-dashboard-filter" aria-label="全局看板时间维度">
        <div className="segmented">{periods.map((item) => <button className={period === item.key ? 'selected' : ''} key={item.key} type="button" onClick={() => onPeriodChange(item.key)}>{item.label}</button>)}</div>
        <span className="global-dashboard-filter__hint">{periodLabel} · 更新至最近业务日期</span>
      </section>
      <section className="global-chart-grid" data-prd-anchor="dashboard-global-charts">
        <ChartShell title="销售与净利润趋势" subtitle={`${periodLabel} · 金额`}>
          <div className="chart-summary-value">GMV {formatPrecise(operatingData.reduce((sum, row) => sum + row.gmv, 0))}</div>
          <ResponsiveContainer width="100%" height={285}><LineChart data={operatingData}><CartesianGrid stroke="rgba(213,234,225,.08)" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="label" {...axisProps} /><YAxis tickFormatter={formatAmount} width={60} {...axisProps} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => formatPrecise(Number(value) || 0)} /><Legend wrapperStyle={{ color: '#8da39b', fontSize: 11 }} /><Line type="monotone" dataKey="gmv" name="GMV" stroke="#79dbc4" strokeWidth={2.5} dot={{ r: 3 }} /><Line type="monotone" dataKey="platformGmv" name="平台成交 GMV" stroke="#5fb7e6" strokeWidth={2.5} dot={{ r: 3 }} /><Line type="monotone" dataKey="actualSales" name="实际销售" stroke="#e9ae64" strokeWidth={2.5} dot={{ r: 3 }} /><Line type="monotone" dataKey="netProfit" name="净利润" stroke="#b794f6" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer>
          <p className="global-chart-note">实际销售 = 实发收入 - 退货金额 - 活动折扣；净利润按实际销售扣减货品、辅料、平台、推广、运费、管理及其他经营费用计算。</p>
        </ChartShell>
        <ChartShell title="经营费用构成" subtitle={`${periodLabel} · 平台 + 店铺`}>
          <div className="chart-summary-value">费用合计 {formatPrecise(costData.reduce((sum, row) => sum + row.managementFee + row.otherExpense + row.financialExpense + row.taxes - row.rebate, 0))}</div>
          <ResponsiveContainer width="100%" height={285}><BarChart data={costData} margin={{ bottom: 12 }}><CartesianGrid stroke="rgba(213,234,225,.08)" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="name" interval={0} tick={{ fill: '#8da39b', fontSize: 10 }} tickLine={false} axisLine={false} /><YAxis tickFormatter={formatAmount} width={60} {...axisProps} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => formatPrecise(Number(value) || 0)} /><Legend wrapperStyle={{ color: '#8da39b', fontSize: 11 }} /><Bar dataKey="managementFee" name="管理费" stackId="cost" fill="#5fb7e6" /><Bar dataKey="otherExpense" name="其他费用" stackId="cost" fill="#79dbc4" /><Bar dataKey="financialExpense" name="财务费用" stackId="cost" fill="#b794f6" /><Bar dataKey="taxes" name="税金及附加" stackId="cost" fill="#e9ae64" /><Bar dataKey="rebate" name="返利 (+)" stackId="cost" fill="#34d6b3" /></BarChart></ResponsiveContainer>
          <p className="global-chart-note">横坐标按“平台 + 店铺”聚合；返利作为正向金额单独展示，方便核对费用结构。</p>
        </ChartShell>
        <ChartShell title="经营费率趋势" subtitle={`${periodLabel} · 比率`}>
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
  const isDailyView = period === 'day'
  return (
    <>
      <section className="data-scope-note" data-prd-anchor="dashboard-team-scope"><div><span className="eyebrow">team_dashboard · {platform} · {periodText}</span><h2>团队经营看板</h2></div><p>保留原有团队经营总览与趋势组件，可按平台和时间维度查看对应统计变化。</p></section>
      <section className="filters" aria-label="团队看板筛选" data-prd-anchor="dashboard-team-filters"><div className="segmented">{periods.map((item) => <button className={period === item.key ? 'selected' : ''} key={item.key} type="button" onClick={() => onPeriodChange(item.key)}>{item.label}</button>)}</div><div className="platform-tabs">{platforms.map((item) => <button className={platform === item ? 'selected' : ''} key={item} type="button" onClick={() => onPlatformChange(item)}>{item}</button>)}</div></section>
      <section className="metric-summary-grid" data-prd-anchor="dashboard-team-metrics">{specs.map((spec) => <MetricSummaryCard key={spec.field} platform={platform} period={period} field={spec.field} label={spec.chartTitle} sublabel={`${spec.category} · ${spec.field}`} />)}</section>
      <section className="dashboard-grid" data-prd-anchor="dashboard-team-charts">{specs.map((spec) => isDailyView && spec.field === '平台成交GMV' ? <DailyGmvChart key={spec.field} platform={platform} /> : <MetricChart key={spec.field} platform={platform} period={period} spec={spec} />)}</section>
      <section className="dashboard-source-note"><LineChartIcon aria-hidden="true" /><span>数据范围：{reportData.map((item) => item.platform).join(' / ')} · 周期与平台切换会同步刷新指标卡与图表。</span></section>
      <section className="dashboard-engine-hint"><BarChart3 aria-hidden="true" /><div><strong>需要更细的拆解？</strong><span>切到 chatbot 直接追问，经营引擎会基于这些数据生成归因结论。</span></div></section>
    </>
  )
}

function PersonalDashboard({ period }: { period: Period }) {
  const [dashboardCreated, setDashboardCreated] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [componentType, setComponentType] = useState<PersonalComponentType | null>(null)
  const [componentAdded, setComponentAdded] = useState<PersonalComponentType | null>(null)
  const [title, setTitle] = useState('销售趋势')
  const [description, setDescription] = useState('')
  const [dataSource, setDataSource] = useState('日报数据')
  const [primaryMetric, setPrimaryMetric] = useState('GMV')
  const [timeField, setTimeField] = useState('业务日期')
  const [timeRange, setTimeRange] = useState('跟随看板时间维度')
  const [platformScope, setPlatformScope] = useState('跟随全局筛选')
  const [storeScope, setStoreScope] = useState('跟随全局筛选')
  const [extraFilter, setExtraFilter] = useState('仅已发布日报')
  const [permissionScope, setPermissionScope] = useState('自动继承')
  const [refreshMode, setRefreshMode] = useState('跟随页面刷新')
  const [chartType, setChartType] = useState('折线图')
  const [xAxis, setXAxis] = useState('业务日期')
  const [yAxis, setYAxis] = useState('GMV、净利润')
  const [groupBy, setGroupBy] = useState('平台')
  const [stackMode, setStackMode] = useState('不堆叠')
  const [secondaryAxis, setSecondaryAxis] = useState('无')
  const [sortBy, setSortBy] = useState('时间顺序')
  const [sortOrder, setSortOrder] = useState('正序')
  const [emptyCell, setEmptyCell] = useState('空')
  const [legendVisible, setLegendVisible] = useState(true)
  const [axisVisible, setAxisVisible] = useState(true)
  const [gridVisible, setGridVisible] = useState(true)
  const [valueLabel, setValueLabel] = useState('悬停显示')
  const [unitDisplay, setUnitDisplay] = useState('自动继承指标')
  const [metricMethod, setMetricMethod] = useState('统计字段数值')
  const [statisticField, setStatisticField] = useState('GMV')
  const [aggregatePeriod, setAggregatePeriod] = useState('跟随看板')
  const [comparisonEnabled, setComparisonEnabled] = useState(false)
  const [comparisonMode, setComparisonMode] = useState('同比')
  const [comparisonText, setComparisonText] = useState('较上期')
  const [comparisonType, setComparisonType] = useState('差异率')
  const [targetValue, setTargetValue] = useState('')
  const [warningRule, setWarningRule] = useState('不设置')
  const [numberFormat, setNumberFormat] = useState('自动')
  const [precision, setPrecision] = useState('2')
  const [miniTrend, setMiniTrend] = useState('迷你折线')
  const [helperText, setHelperText] = useState('')

  function startConfig(type: PersonalComponentType) {
    setComponentType(type)
    setTitle(type === 'chart' ? '销售趋势' : 'GMV 总览')
    setPickerOpen(false)
  }

  function addComponent() {
    if (!componentType) return
    setComponentAdded(componentType)
    setComponentType(null)
  }

  if (!dashboardCreated) {
    return (
      <section className="personal-dashboard-empty" data-prd-anchor="dashboard-personal-entry">
        <span className="personal-dashboard-empty__icon"><PanelTop aria-hidden="true" /></span>
        <h3>还没有个人看板</h3>
        <p>从空白看板开始，把日常关注的图表和指标放在自己的工作区。</p>
        <button type="button" className="primary-action" onClick={() => setDashboardCreated(true)}><Plus aria-hidden="true" />新建看板</button>
      </section>
    )
  }

  return (
    <section className="personal-dashboard" data-prd-anchor="dashboard-personal-builder">
      <header className="personal-dashboard__head">
        <div><span className="eyebrow">personal_dashboard · {period === 'day' ? '日' : period === 'week' ? '周' : period === 'month' ? '月' : '年'}维度</span><h2>我的新看板</h2></div>
        <button className="primary-action" type="button" onClick={() => { setPickerOpen(true); setComponentType(null) }}><Plus aria-hidden="true" />添加组件</button>
      </header>
      <div className={`personal-dashboard__workspace ${componentType ? 'is-configuring' : ''}`}>
        <main className="personal-dashboard__canvas">
          {componentType ? (
            <section className="component-config-preview">
              <header><div><span className="eyebrow">preview</span><h3>组件效果预览</h3></div><span>{componentType === 'chart' ? chartType : '指标卡片'}</span></header>
              <article className={`component-config-preview__surface component-config-preview__surface--${componentType}`}>
                <span className="eyebrow">{dataSource} · {componentType === 'chart' ? xAxis : primaryMetric}</span>
                <h4>{title || (componentType === 'chart' ? '未命名统计图' : '未命名指标卡片')}</h4>
                {componentType === 'chart' ? <><div className="component-config-preview__chart"><i /><i /><i /><i /><i /><i /><i /></div><div className="component-config-preview__legend">{yAxis.split('、').map((metric) => <span key={metric}>{metric}</span>)}</div></> : <><strong>{metricMethod === '统计记录总数' ? '128' : '126,840'}</strong><p>{comparisonEnabled ? `${comparisonText} ${comparisonType === '差异率' ? '+8.2%' : '+9,610'}` : helperText || '当前看板时间范围内汇总'}</p>{miniTrend === '不显示' ? null : <div className="component-config-preview__spark"><i /><i /><i /><i /><i /><i /></div>}</>}
              </article>
              <dl className="component-config-preview__summary"><div><dt>数据范围</dt><dd>{dataSource} · {timeRange}</dd></div><div><dt>主指标</dt><dd>{primaryMetric} · {permissionScope}</dd></div></dl>
            </section>
          ) : pickerOpen ? (
            <section className="component-type-picker">
              <header><span className="eyebrow">step 1</span><h3>选择组件类型</h3></header>
              <div>
                <button type="button" onClick={() => startConfig('chart')}><BarChart3 aria-hidden="true" /><strong>统计图</strong><span>用图表观察趋势、构成和分布</span></button>
                <button type="button" onClick={() => startConfig('metric')}><PanelTop aria-hidden="true" /><strong>指标卡片</strong><span>突出展示一个核心统计结果</span></button>
              </div>
            </section>
          ) : componentAdded ? (
            <article className="personal-component-preview">
              <header><span className="eyebrow">{componentAdded === 'chart' ? 'chart_component' : 'metric_component'}</span><button type="button" aria-label="重新配置组件" onClick={() => setComponentType(componentAdded)}><Settings2 aria-hidden="true" /></button></header>
              <h3>{title}</h3>
              {componentAdded === 'chart' ? <><div className="personal-component-preview__chart"><i /><i /><i /><i /><i /><i /></div><p>{chartType} · 数据范围跟随当前看板时间维度</p></> : <><strong>{metricMethod === '统计记录总数' ? '128' : '126,840'}</strong><p>{comparisonEnabled ? `${comparisonText} ${comparisonType === '差异率' ? '+8.2%' : '+9,610'}` : '未开启同比'}</p></>}
            </article>
          ) : (
            <section className="personal-dashboard__blank"><PanelTop aria-hidden="true" /><h3>从第一个组件开始</h3><p>先选择统计图或指标卡片，再配置它要展示的数据。</p><button type="button" className="secondary-action" onClick={() => setPickerOpen(true)}><Plus aria-hidden="true" />添加组件</button></section>
          )}
        </main>

        {componentType ? (
          <aside className="component-configurator" aria-label="组件配置示例页">
            <header><div><span className="eyebrow">step 2 · configuration</span><h3>{componentType === 'chart' ? '新建统计图' : '新建数据卡'}</h3></div><button type="button" aria-label="关闭配置页" onClick={() => setComponentType(null)}><X aria-hidden="true" /></button></header>
            <div className="component-configurator__body">
              <section className="config-section config-section--first">
                <h4>基础信息</h4>
                <label className="dialog-field"><span>组件类型</span><input value={componentType === 'chart' ? '统计图' : '数据卡'} readOnly /></label>
                <label className="dialog-field"><span>组件名称</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="填写组件名称" /></label>
                <label className="dialog-field"><span>描述</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="补充组件用途或阅读口径" rows={3} /></label>
              </section>

              <section className="config-section">
                <h4>数据范围</h4>
                <label className="dialog-field"><span>数据集</span><select value={dataSource} onChange={(event) => setDataSource(event.target.value)}><option>日报数据</option><option>自动化任务</option></select></label>
                <label className="dialog-field"><span>主指标</span><select value={primaryMetric} onChange={(event) => setPrimaryMetric(event.target.value)}><option>GMV</option><option>实际销售</option><option>平台费用</option><option>净利润</option><option>净利润率</option><option>任务完成率</option></select></label>
                <label className="dialog-field"><span>时间字段</span><select value={timeField} onChange={(event) => setTimeField(event.target.value)}><option>业务日期</option><option>任务日期</option></select></label>
                <label className="dialog-field"><span>时间范围</span><select value={timeRange} onChange={(event) => setTimeRange(event.target.value)}><option>跟随看板时间维度</option><option>近 7 天</option><option>本月</option><option>本年</option><option>自定义时间范围</option></select></label>
                <label className="dialog-field"><span>平台范围</span><select value={platformScope} onChange={(event) => setPlatformScope(event.target.value)}><option>跟随全局筛选</option><option>全部平台</option><option>指定平台</option></select></label>
                <label className="dialog-field"><span>店铺范围</span><select value={storeScope} onChange={(event) => setStoreScope(event.target.value)}><option>跟随全局筛选</option><option>全部店铺</option><option>指定店铺</option></select></label>
                <label className="dialog-field"><span>其他筛选条件</span><input value={extraFilter} onChange={(event) => setExtraFilter(event.target.value)} placeholder="例如：仅已发布日报" /></label>
                <label className="dialog-field"><span>数据权限范围</span><select value={permissionScope} onChange={(event) => setPermissionScope(event.target.value)}><option>自动继承</option><option>团队范围</option><option>创建者范围</option></select></label>
              </section>

              <section className="config-section">
                <h4>刷新</h4>
                <label className="dialog-field"><span>刷新方式</span><select value={refreshMode} onChange={(event) => setRefreshMode(event.target.value)}><option>跟随页面刷新</option><option>手动刷新</option><option>定时刷新</option></select></label>
                <label className="dialog-field"><span>最近数据时间</span><input value="2026-07-28 08:30" readOnly /></label>
              </section>

              {componentType === 'chart' ? <>
                <section className="config-section"><h4>图表结构</h4>
                  <label className="dialog-field"><span>图表类型</span><select value={chartType} onChange={(event) => setChartType(event.target.value)}><option>柱状图</option><option>叠加柱状图</option><option>折线图</option><option>平滑折线图</option><option>饼图</option></select></label>
                  <label className="dialog-field"><span>横轴维度</span><select value={xAxis} onChange={(event) => setXAxis(event.target.value)}><option>业务日期</option><option>平台</option><option>店铺</option><option>平台 + 店铺</option><option>任务来源</option></select></label>
                  <label className="dialog-field"><span>纵轴指标</span><select value={yAxis} onChange={(event) => setYAxis(event.target.value)}><option>GMV、净利润</option><option>GMV、平台费用</option><option>净利润、净利润率</option><option>任务完成数、失败数</option></select></label>
                  <label className="dialog-field"><span>分组维度</span><select value={groupBy} onChange={(event) => setGroupBy(event.target.value)}><option>不分组</option><option>平台</option><option>店铺</option><option>任务状态</option></select></label>
                  <label className="dialog-field"><span>堆叠方式</span><select value={stackMode} onChange={(event) => setStackMode(event.target.value)}><option>不堆叠</option><option>普通堆叠</option><option>百分比堆叠</option></select></label>
                  <label className="dialog-field"><span>次坐标轴指标</span><select value={secondaryAxis} onChange={(event) => setSecondaryAxis(event.target.value)}><option>无</option><option>净利润率</option><option>任务完成率</option></select></label>
                </section>
                <section className="config-section"><h4>排序与空值</h4>
                  <label className="dialog-field"><span>排序依据</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option>纵轴值</option><option>横轴值</option><option>时间顺序</option><option>指标名称</option></select></label>
                  <label className="dialog-field"><span>排序规则</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option>正序</option><option>倒序</option></select></label>
                  <label className="dialog-field"><span>空单元格</span><select value={emptyCell} onChange={(event) => setEmptyCell(event.target.value)}><option>空</option><option>按 0</option>{chartType.includes('折线') ? <option>前值连线</option> : null}</select></label>
                </section>
                <section className="config-section"><h4>展示</h4>
                  <label className="config-switch"><input type="checkbox" checked={legendVisible} onChange={(event) => setLegendVisible(event.target.checked)} /><span>显示图例</span></label>
                  <label className="config-switch"><input type="checkbox" checked={axisVisible} onChange={(event) => setAxisVisible(event.target.checked)} /><span>显示坐标轴</span></label>
                  <label className="config-switch"><input type="checkbox" checked={gridVisible} onChange={(event) => setGridVisible(event.target.checked)} /><span>显示网格线</span></label>
                  <label className="dialog-field"><span>数值标签</span><select value={valueLabel} onChange={(event) => setValueLabel(event.target.value)}><option>不显示</option><option>始终显示</option><option>悬停显示</option></select></label>
                  <label className="dialog-field"><span>单位显示</span><select value={unitDisplay} onChange={(event) => setUnitDisplay(event.target.value)}><option>自动继承指标</option><option>强制显示</option><option>隐藏</option></select></label>
                </section>
              </> : <>
                <section className="config-section"><h4>指标内容</h4>
                  <label className="dialog-field"><span>主指标</span><select value={primaryMetric} onChange={(event) => setPrimaryMetric(event.target.value)}><option>GMV</option><option>净利润</option><option>净利润率</option><option>任务完成率</option></select></label>
                  <label className="dialog-field"><span>统计方式</span><select value={metricMethod} onChange={(event) => setMetricMethod(event.target.value)}><option>统计字段数值</option><option>统计记录总数</option><option>去重记录数</option><option>最大值</option><option>最小值</option><option>平均值</option></select></label>
                  <label className="dialog-field"><span>统计字段</span><select value={statisticField} onChange={(event) => setStatisticField(event.target.value)} disabled={metricMethod === '统计记录总数'}><option>GMV</option><option>净利润</option><option>平台费用</option><option>任务 ID</option></select></label>
                  <label className="dialog-field"><span>汇总周期</span><select value={aggregatePeriod} onChange={(event) => setAggregatePeriod(event.target.value)}><option>跟随看板</option><option>当日</option><option>本周</option><option>本月</option><option>本年</option><option>累计</option></select></label>
                </section>
                <section className="config-section"><h4>对比</h4>
                  <label className="config-switch"><input type="checkbox" checked={comparisonEnabled} onChange={(event) => setComparisonEnabled(event.target.checked)} /><span>开启对比</span></label>
                  <p className="config-fixed-note">时间依据：业务日期；对比时间范围跟随当前看板维度。</p>
                  {comparisonEnabled ? <><label className="dialog-field"><span>对比类型</span><select value={comparisonMode} onChange={(event) => setComparisonMode(event.target.value)}><option>同比</option><option>环比</option><option>自定义比较周期</option></select></label><label className="dialog-field"><span>对比描述</span><input value={comparisonText} onChange={(event) => setComparisonText(event.target.value)} placeholder="例如：较上期" /></label><label className="dialog-field"><span>计算类型</span><select value={comparisonType} onChange={(event) => setComparisonType(event.target.value)}><option>差值</option><option>差异率</option></select></label></> : null}
                </section>
                <section className="config-section"><h4>阈值与展示</h4>
                  <label className="dialog-field"><span>目标值</span><input type="number" value={targetValue} onChange={(event) => setTargetValue(event.target.value)} placeholder="不设置" /></label>
                  <label className="dialog-field"><span>预警规则</span><select value={warningRule} onChange={(event) => setWarningRule(event.target.value)}><option>不设置</option><option>大于目标值</option><option>小于目标值</option><option>区间外</option></select></label>
                  <label className="dialog-field"><span>数值格式</span><select value={numberFormat} onChange={(event) => setNumberFormat(event.target.value)}><option>自动</option><option>金额</option><option>数量</option><option>百分比</option><option>小数</option></select></label>
                  <label className="dialog-field"><span>小数位</span><select value={precision} onChange={(event) => setPrecision(event.target.value)}><option>0</option><option>1</option><option>2</option><option>3</option></select></label>
                  <label className="dialog-field"><span>趋势图</span><select value={miniTrend} onChange={(event) => setMiniTrend(event.target.value)}><option>不显示</option><option>迷你折线</option><option>迷你柱图</option></select></label>
                  <label className="dialog-field"><span>辅助文案</span><input value={helperText} onChange={(event) => setHelperText(event.target.value)} placeholder="例如：本月累计" /></label>
                </section>
              </>}
            </div>
            <footer><button className="secondary-action" type="button" onClick={() => setComponentType(null)}>取消</button><button className="primary-action" type="button" onClick={addComponent}>添加到看板</button></footer>
          </aside>
        ) : null}
      </div>
    </section>
  )
}

export default function DashboardPage() {
  const [view, setView] = useState<DashboardView>('global')
  const [period, setPeriod] = useState<Period>('day')
  const [platform, setPlatform] = useState<PlatformName>('总计')
  return (
    <section className="page-stack dashboard-page">
      <nav className="dashboard-view-tabs" aria-label="看板范围" data-prd-anchor="dashboard-view-tabs"><button className={view === 'global' ? 'selected' : ''} type="button" onClick={() => setView('global')}>全局看板</button><button className={view === 'team' ? 'selected' : ''} type="button" onClick={() => setView('team')}>团队看板</button><button className={view === 'personal' ? 'selected' : ''} type="button" onClick={() => setView('personal')}>个人看板</button></nav>
      {view === 'global' ? <GlobalDashboard period={period} onPeriodChange={setPeriod} /> : null}
      {view === 'team' ? <TeamDashboard period={period} platform={platform} onPeriodChange={setPeriod} onPlatformChange={setPlatform} /> : null}
      {view === 'personal' ? <PersonalDashboard period={period} /> : null}
    </section>
  )
}
