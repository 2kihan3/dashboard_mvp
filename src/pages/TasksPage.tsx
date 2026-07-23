import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Pencil,
  Plus,
  ScrollText,
  Sparkles,
  Unlink,
  Upload,
} from 'lucide-react'
import { type PlatformName, type ReportRow, reportDataWithHaoyiku as reportData } from '../data/dailyReport'
import { formatPrecise, statusClass } from '../lib/metrics'

type DailyReportStatus = '待发布' | '已发布' | '未发布'
type CrossValidationStatus = '通过' | '未通过' | '已修正'
type TaskSource = '定时任务' | '指令' | '人工上传文件'
type TaskResult = '完成' | '失败'
type DataTab = 'tasks' | 'dailyData'
type LedgerPlatform = Exclude<PlatformName, '总计'> | '抖店' | '得物'
type DataPlatformFilter = '全部' | LedgerPlatform
type DataStoreFilter = '全部' | string

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
  peaCost: number // 豌豆消耗
  owner: string // 任务归属人员
  reviewer: string // 审核人
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

const taskColumns = ['任务 ID', '任务来源', '平台', '店铺', '任务日期', '业务日期', '豌豆消耗', '归属人员', '审核人', '结果预览', '任务结果', '日报状态', '交叉验证', '任务日志', '操作项']
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
    peaCost: 320,
    owner: '李运营',
    reviewer: '张管理员',
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
    peaCost: 280,
    owner: '陈分析',
    reviewer: '',
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
    peaCost: 450,
    owner: '王财务',
    reviewer: '张管理员',
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
    peaCost: 80,
    owner: '李运营',
    reviewer: '',
  },
  {
    id: 'task-5',
    taskId: '20260714HYKSP001',
    fileName: '好衣库日报自动化结果.json',
    source: '定时任务',
    platform: '好衣库',
    store: '好衣库店铺',
    taskDate: '2026-07-14 08:30:15',
    businessDate: '2026-07-13',
    resultPreview: '任务完成',
    taskResult: '完成',
    reportStatus: '待发布',
    crossValidation: '通过',
    taskLog: '08:30 拉取好衣库日报；08:31 完成字段校验；08:30:15 任务结束。',
    isUnbound: false,
    metrics: { gmv: 13680.5, platformFee: 1820.3, managementFee: 0 },
    peaCost: 360,
    owner: '张管理员',
    reviewer: '王财务',
  },
]

const ledgerPlatforms: LedgerPlatform[] = ['快手', '抖店', '唯品会', '爱库存', '好衣库', '得物']

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

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

// 各平台任务结果预览字段白名单
function getPlatformPreviewFields(platform: string, report: { rows: ReportRow[] }): string[] {
  if (platform === '唯品会') {
    return ['平台成交GMV', '活动折扣', 'BD佣金']
  }
  if (platform === '好衣库') {
    return ['平台成交GMV', '技术运营服务费', '推广活动费', '快递信息服务费', '佣金', '罚款', '消费者赔付']
  }
  // 快手 / 爱库存：销售仅成交GMV + 平台费用全部 + 管理费用仅后台管理费
  const fields: string[] = ['平台成交GMV']
  report.rows
    .filter((row) => row.category === '平台费用' && row.field.trim())
    .forEach((row) => fields.push(row.field))
  fields.push('后台管理费')
  return fields
}

interface TaskPreviewField {
  field: string
  value: string
}

interface TaskPreviewGroup {
  category: string
  fields: TaskPreviewField[]
}

function taskPreviewGroups(task: DailyTaskRecord): TaskPreviewGroup[] {
  const report = reportData.find((item) => item.platform === task.platform)
  if (!report) return []

  const matchedIndex = report.dates.findIndex((point) => point.date === task.businessDate)
  const dateIndex = matchedIndex >= 0 ? matchedIndex : Math.min(1, report.dates.length - 1)

  const whitelist = getPlatformPreviewFields(task.platform, report)
  // 唯品会字段跨多个 category，统一归入「核心指标」分组避免出现「聚水潭-实发毛利」等不友好分组名
  const isUnifiedGroup = task.platform === '唯品会'
  const categoryOrder = ['核心指标', '销售', '聚水潭-实发毛利', '平台费用', '推广费', '管理费用']
  const groupMap = new Map<string, TaskPreviewField[]>()

  whitelist.forEach((fieldName) => {
    const row = report.rows.find((r) => r.field === fieldName)
    const category = isUnifiedGroup ? '核心指标' : (row?.category ?? '平台费用')
    const value = row
      ? (row.field === '平台成交GMV'
          ? task.metrics.gmv
          : row.field === '平台费用合计'
            ? task.metrics.platformFee
            : row.field === '管理费用合计'
              ? task.metrics.managementFee
              : row.daily[dateIndex]?.value ?? 0)
      : 0
    const fieldType = row?.valueType ?? 'amount'

    if (!groupMap.has(category)) groupMap.set(category, [])
    groupMap.get(category)!.push({ field: fieldName, value: formatPrecise(value, fieldType) })
  })

  return Array.from(groupMap.entries())
    .sort((a, b) => {
      const ai = categoryOrder.indexOf(a[0])
      const bi = categoryOrder.indexOf(b[0])
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
    .map(([category, fields]) => ({ category, fields }))
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

export default function TasksPage() {
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
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createMode, setCreateMode] = useState<'manual' | 'auto' | null>(null)
  const [autoPlatform, setAutoPlatform] = useState<LedgerPlatform>('快手')
  const [autoStore, setAutoStore] = useState('')
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [downloadPlatform, setDownloadPlatform] = useState<DataPlatformFilter>('全部')
  const [downloadStore, setDownloadStore] = useState<DataStoreFilter>('全部')
  const [downloadStartDate, setDownloadStartDate] = useState('')
  const [downloadEndDate, setDownloadEndDate] = useState(dateMinusOne())
  const taskStoreOptions = uniqueValues(tasks.filter((task) => taskPlatform === '全部' || task.platform === taskPlatform).map((task) => task.store))
  const dailyStoreOptions = uniqueValues(dailyData.filter((row) => dailyPlatform === '全部' || row.platform === dailyPlatform).map((row) => row.store))
  const downloadStoreOptions = uniqueValues(dailyData.filter((row) => downloadPlatform === '全部' || row.platform === downloadPlatform).map((row) => row.store))

  // 报告统计
  const totalDailyReports = tasks.length
  const totalPublishedReports = tasks.filter((t) => t.reportStatus === '已发布').length
  const totalPeaCost = tasks.reduce((sum, t) => sum + t.peaCost, 0)
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
      peaCost: 0,
      owner: '李运营',
      reviewer: '',
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
      <section className="data-scope-note">
        <div>
          <span className="eyebrow">data_center</span>
          <h2>数据中心</h2>
        </div>
        <p>管理日报任务记录与日报数据，支持发布、复核、作废、新建任务与日志回查。</p>
      </section>

      <section className="report-stats">
        <article className="report-stat-card">
          <span className="report-stat-card__icon"><FileText aria-hidden="true" /></span>
          <div>
            <strong>{totalDailyReports}</strong>
            <span>日报生成数量</span>
          </div>
        </article>
        <article className="report-stat-card">
          <span className="report-stat-card__icon report-stat-card__icon--success"><CheckCircle2 aria-hidden="true" /></span>
          <div>
            <strong>{totalPublishedReports}</strong>
            <span>报告生成数量</span>
          </div>
        </article>
        <article className="report-stat-card">
          <span className="report-stat-card__icon report-stat-card__icon--pea"><Sparkles aria-hidden="true" /></span>
          <div>
            <strong>{totalPeaCost}</strong>
            <span>豌豆消耗</span>
          </div>
        </article>
      </section>

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
            <button className="primary-action" type="button" onClick={() => { setCreateModalOpen(true); setCreateMode(null) }}>
              <Plus aria-hidden="true" />
              新建任务
            </button>
          ) : (
            <div className="table-header-actions">
              <span className="table-count">{visibleDailyData.length} 条日报数据</span>
              <button className="primary-action" type="button" onClick={() => { setDownloadDialogOpen(true); setDownloadPlatform('全部'); setDownloadStore('全部'); setDownloadStartDate(''); setDownloadEndDate(dateMinusOne()) }}>
                <Download aria-hidden="true" />
                下载
              </button>
            </div>
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
                      <td><span className="data-pill pea-cost">{row.peaCost}</span></td>
                      <td>{row.owner}</td>
                      <td>{row.reviewer || '—'}</td>
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

      {createModalOpen && createMode === null ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setCreateModalOpen(false)}>
          <section className="ledger-dialog create-task-dialog">
            <header>
              <div>
                <span className="eyebrow">create_task</span>
                <h3>新建任务</h3>
              </div>
              <button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => setCreateModalOpen(false)}>×</button>
            </header>
            <p>请选择任务创建方式：</p>
            <div className="create-task-options">
              <button type="button" className="create-task-option" onClick={() => { setCreateMode('manual'); setIsUploadDialogOpen(true); setCreateModalOpen(false) }}>
                <span className="create-task-option__icon"><Upload aria-hidden="true" /></span>
                <div>
                  <strong>人工上传文件</strong>
                  <small>上传 Excel/CSV 文件，系统自动解析并创建任务记录</small>
                </div>
              </button>
              <button type="button" className="create-task-option" onClick={() => {
                setCreateMode('auto')
                const firstStore = tasks.filter((t) => t.platform === '快手').map((t) => t.store)[0] ?? ''
                setAutoPlatform('快手')
                setAutoStore(firstStore)
              }}>
                <span className="create-task-option__icon create-task-option__icon--auto"><Sparkles aria-hidden="true" /></span>
                <div>
                  <strong>创建自动化任务</strong>
                  <small>调用 skill 自动拉取平台数据并生成日报，消耗豌豆</small>
                </div>
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {createMode === 'auto' ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setCreateMode(null); setCreateModalOpen(false) } }}>
          <form className="ledger-dialog create-task-dialog" onSubmit={(event) => {
            event.preventDefault()
            setCreateMode(null)
            setCreateModalOpen(false)
            setTaskPlatform(autoPlatform)
            setTaskStore(autoStore)
            setLedgerNotice(`已创建 ${autoPlatform} · ${autoStore} 自动化任务，正在拉取平台数据...`)
          }}>
            <header>
              <div>
                <span className="eyebrow">auto_task</span>
                <h3>创建自动化任务</h3>
              </div>
              <button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => { setCreateMode(null); setCreateModalOpen(false) }}>×</button>
            </header>
            <p>选择目标平台与店铺，系统将调用 skill 自动拉取数据并生成日报。</p>
            <label className="dialog-field">
              <span>平台</span>
              <select value={autoPlatform} onChange={(event) => {
                const plat = event.target.value as LedgerPlatform
                setAutoPlatform(plat)
                const firstStore = tasks.filter((t) => t.platform === plat).map((t) => t.store)[0] ?? ''
                setAutoStore(firstStore)
              }}>
                {ledgerPlatforms.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="dialog-field">
              <span>店铺名称</span>
              <select value={autoStore} onChange={(event) => setAutoStore(event.target.value)} required>
                {tasks.filter((t) => t.platform === autoPlatform).map((t) => t.store).filter((v, i, arr) => arr.indexOf(v) === i).map((store) => <option key={store} value={store}>{store}</option>)}
              </select>
            </label>
            <div className="dialog-meta"><span>来源：自动化任务</span><span>业务日期：{dateMinusOne()}</span><span>预计消耗：320 豌豆</span></div>
            <footer>
              <button className="secondary-action" type="button" onClick={() => { setCreateMode(null); setCreateModalOpen(false) }}>取消</button>
              <button className="primary-action" type="submit"><Sparkles aria-hidden="true" />创建任务</button>
            </footer>
          </form>
        </div>
      ) : null}

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

      {/* 下载日报数据弹窗 */}
      {downloadDialogOpen ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDownloadDialogOpen(false)}>
          <form className="ledger-dialog create-task-dialog" onSubmit={(event) => {
            event.preventDefault()
            setDownloadDialogOpen(false)
            setLedgerNotice('日报数据下载任务已创建，请稍后在下载中心查看')
          }}>
            <header>
              <div>
                <span className="eyebrow">download_daily_data</span>
                <h3>下载日报数据</h3>
              </div>
              <button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => setDownloadDialogOpen(false)}>×</button>
            </header>
            <p>选择时间范围、平台与店铺，下载对应的日报数据。</p>
            <label className="dialog-field">
              <span>业务日期</span>
              <div className="date-range-inputs">
                <input type="date" max={dateMinusOne()} value={downloadStartDate} onChange={(event) => setDownloadStartDate(event.target.value)} />
                <b>至</b>
                <input type="date" max={dateMinusOne()} value={downloadEndDate} onChange={(event) => setDownloadEndDate(event.target.value)} />
              </div>
            </label>
            <label className="dialog-field">
              <span>平台</span>
              <select value={downloadPlatform} onChange={(event) => { setDownloadPlatform(event.target.value as DataPlatformFilter); setDownloadStore('全部') }}>
                <option value="全部">全部平台</option>
                {ledgerPlatforms.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="dialog-field">
              <span>店铺</span>
              <select value={downloadStore} onChange={(event) => setDownloadStore(event.target.value)}>
                <option value="全部">全部店铺</option>
                {downloadStoreOptions.map((store) => <option key={store} value={store}>{store}</option>)}
              </select>
            </label>
            <footer>
              <button className="secondary-action" type="button" onClick={() => setDownloadDialogOpen(false)}>取消</button>
              <button className="primary-action" type="submit"><Download aria-hidden="true" />下载</button>
            </footer>
          </form>
        </div>
      ) : null}
    </section>
  )
}
