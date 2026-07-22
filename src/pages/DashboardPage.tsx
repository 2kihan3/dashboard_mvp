import { useState } from 'react'
import { BarChart3, LineChart as LineChartIcon, TrendingUp } from 'lucide-react'
import { type PlatformName, reportDataWithHaoyiku as reportData } from '../data/dailyReport'
import { MetricChart } from '../components/MetricChart'
import {
  type Period,
  fieldSummaryValue,
  formatPrecise,
  periodBuckets,
  periods,
  platformMetricSpecs,
  platforms,
  fieldPeriodValue,
} from '../lib/metrics'

function MetricSummaryCard({ platform, period, field, label, sublabel }: { platform: PlatformName; period: Period; field: string; label: string; sublabel: string }) {
  const value = fieldSummaryValue(platform, field, period)
  // 计算"环比"变化：当前周期 vs 上一同长度窗口
  const buckets = periodBuckets(period)
  const currentSum = buckets.reduce((sum, bucket) => sum + fieldPeriodValue(platform, field, period, bucket.indexes), 0)
  void currentSum
  // 简化：用一个固定 +X.X% 占位（demo 风格），未来从数据计算
  const deltas: Record<string, string> = {
    平台成交GMV: '+8.2%',
    平台费用合计: '+3.1%',
    管理费用合计: '-1.4%',
    活动折扣: '+2.6%',
    技术运营服务费: '+5.4%',
    快递信息服务费: '+1.2%',
  }
  const delta = deltas[field] ?? '+0.0%'
  const positive = delta.startsWith('+')
  return (
    <article className="metric-summary-card">
      <header>
        <span className="eyebrow">{sublabel}</span>
        <h3>{label}</h3>
      </header>
      <div className="metric-summary-card__value">
        <strong>{formatPrecise(value)}</strong>
        <span className={`metric-delta ${positive ? 'positive' : 'negative'}`}>
          <TrendingUp aria-hidden="true" />{delta}
        </span>
      </div>
      <footer>
        <span>{platform === '总计' ? '所有平台合计' : `${platform} · 当前${period === 'day' ? '日' : period === 'week' ? '周' : period === 'month' ? '月' : '年'}`}</span>
      </footer>
    </article>
  )
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('day')
  const [platform, setPlatform] = useState<PlatformName>('总计')
  const periodText = period === 'day' ? '前一天' : period === 'week' ? '自然周' : period === 'month' ? '本月' : '本年'
  const specs = platformMetricSpecs[platform]

  return (
    <section className="page-stack dashboard-page">
      <section className="data-scope-note">
        <div>
          <span className="eyebrow">{platform} · {periodText}</span>
          <h2>经营看板</h2>
        </div>
        <p>当前平台仅保留与经营判断直接相关的指标，单页内同时呈现总览与趋势。</p>
      </section>

      <section className="filters" aria-label="全局筛选">
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
      </section>

      <section className="metric-summary-grid">
        {specs.map((spec) => (
          <MetricSummaryCard
            key={spec.field}
            platform={platform}
            period={period}
            field={spec.field}
            label={spec.chartTitle}
            sublabel={`${spec.category} · ${spec.field}`}
          />
        ))}
      </section>

      <section className="dashboard-grid">
        {specs.map((spec) => (
          <MetricChart key={spec.field} platform={platform} period={period} spec={spec} />
        ))}
      </section>

      <section className="dashboard-source-note">
        <LineChartIcon aria-hidden="true" />
        <span>数据范围：{reportData.map((item) => item.platform).join(' / ')} · 周期与平台切换会同步刷新指标卡与图表。</span>
      </section>

      <section className="dashboard-engine-hint">
        <BarChart3 aria-hidden="true" />
        <div>
          <strong>需要更细的拆解？</strong>
          <span>切到 chatbot 直接追问，经营引擎会基于这些数据生成归因结论。</span>
        </div>
      </section>
    </section>
  )
}
