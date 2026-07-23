import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  Pencil,
  Plus,
  QrCode,
  ScrollText,
  Sparkles,
  Store,
  Trash2,
  Unlink,
  Users,
  X,
  Zap,
} from 'lucide-react'

// ===================== 类型定义 =====================

type AdminTab = 'llm' | 'pea' | 'team'
type LlmTab = 'api' | 'binding'
type PeaTab = 'all' | 'daily' | 'other'
type TaskSource = '定时任务' | '指令' | '人工上传文件'
type TaskResult = '完成' | '失败'
type DailyReportStatus = '待发布' | '已发布' | '未发布'
type CrossValidationStatus = '通过' | '未通过' | '已修正'

interface Team {
  id: string
  name: string
  memberCount: number
  createdAt: string
  desc: string
}

interface TeamPlatformAccount {
  id: string
  platform: string
  accountName: string
  boundAt: string
  stores: string[]
  status: 'connected' | 'expired'
}

interface LlmApiConfig {
  id: string
  provider: string
  baseUrl: string
  modelName: string
  apiKey: string
  maxTokens: number
  temperature: number
  status: 'enabled' | 'disabled'
  isDefault: boolean
}

interface ComponentBinding {
  id: string
  name: string
  workflow: string
  inputs: string[] // 从 ['时间', '平台', '店铺'] 中多选
  status: 'active' | 'inactive'
}

const inputOptions = ['时间', '平台', '店铺']

interface PeaRecord {
  id: string
  taskId: string
  taskType: 'daily' | 'other' // 仅用于 tab 筛选，不作为列展示
  source: TaskSource // 任务来源
  platform: string
  store: string
  taskDate: string
  businessDate: string
  peaCost: number
  owner: string // 归属人员
  reviewer: string // 审核人
  resultPreview: string // 结果预览
  taskResult: TaskResult // 任务结果
  reportStatus: DailyReportStatus // 日报状态
  crossValidation: CrossValidationStatus // 交叉验证
  taskLog: string // 任务日志
}

// ===================== Mock 数据 =====================

const llmApiConfigs: LlmApiConfig[] = [
  { id: 'api-1', provider: 'OpenAI', baseUrl: 'https://api.openai.com/v1', modelName: 'gpt-4o', apiKey: 'sk-proj-abc123xyz789', maxTokens: 4096, temperature: 0.7, status: 'enabled', isDefault: true },
  { id: 'api-2', provider: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1', modelName: 'claude-sonnet-4-20250514', apiKey: 'sk-ant-api03-def456uvw012', maxTokens: 8192, temperature: 0.5, status: 'enabled', isDefault: false },
  { id: 'api-3', provider: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', modelName: 'deepseek-chat', apiKey: 'sk-ds-ghi789rst345', maxTokens: 4096, temperature: 0.3, status: 'enabled', isDefault: false },
  { id: 'api-4', provider: '通义千问', baseUrl: 'https://dashscope.aliyuncs.com/api/v1', modelName: 'qwen-max', apiKey: 'sk-qwen-jkl012mno678', maxTokens: 6144, temperature: 0.6, status: 'disabled', isDefault: false },
]

const componentBindings: ComponentBinding[] = [
  {
    id: 'bind-1',
    name: '新建任务',
    workflow: '多平台日报生成',
    inputs: ['时间', '平台', '店铺'],
    status: 'active',
  },
  {
    id: 'bind-2',
    name: '立即使用',
    workflow: '平台费用差异排查',
    inputs: ['时间', '平台'],
    status: 'active',
  },
  {
    id: 'bind-3',
    name: '发送',
    workflow: '自由问答',
    inputs: ['时间', '平台', '店铺'],
    status: 'active',
  },
  {
    id: 'bind-4',
    name: '利润分析',
    workflow: '利润归因分析',
    inputs: ['平台', '店铺'],
    status: 'inactive',
  },
]

const peaRecords: PeaRecord[] = [
  {
    id: 'pr-1', taskId: '20260714KSGFGJ001', taskType: 'daily', source: '定时任务', platform: '快手', store: '官方旗舰店',
    taskDate: '2026-07-14 08:05', businessDate: '2026-07-13', peaCost: 320, owner: '李运营', reviewer: '张管理员',
    resultPreview: '任务完成', taskResult: '完成', reportStatus: '待发布', crossValidation: '通过',
    taskLog: '08:05 拉取快手日报；08:06 完成字段校验；08:05:14 任务结束。',
  },
  {
    id: 'pr-2', taskId: '20260714AKJBSP001', taskType: 'daily', source: '定时任务', platform: '爱库存', store: '京倍店铺',
    taskDate: '2026-07-14 08:11', businessDate: '2026-07-13', peaCost: 280, owner: '陈分析', reviewer: '',
    resultPreview: '任务完成', taskResult: '完成', reportStatus: '待发布', crossValidation: '未通过',
    taskLog: '08:11 拉取爱库存费用数据；品牌推广费为空，等待人工复核。',
  },
  {
    id: 'pr-3', taskId: '20260714WPPPJH001', taskType: 'daily', source: '指令', platform: '唯品会', store: '品牌集合店',
    taskDate: '2026-07-14 08:18', businessDate: '2026-07-13', peaCost: 450, owner: '王财务', reviewer: '张管理员',
    resultPreview: '任务完成', taskResult: '完成', reportStatus: '已发布', crossValidation: '已修正',
    taskLog: '08:18 接收补数指令；08:19 完成唯品会字段复核并发布。',
  },
  {
    id: 'pr-4', taskId: '20260714DYDYSP001', taskType: 'daily', source: '定时任务', platform: '抖店', store: '抖店旗舰店',
    taskDate: '2026-07-14 08:24', businessDate: '2026-07-13', peaCost: 80, owner: '李运营', reviewer: '',
    resultPreview: '--', taskResult: '失败', reportStatus: '未发布', crossValidation: '未通过',
    taskLog: '08:24 调用抖店任务失败：授权令牌失效。',
  },
  {
    id: 'pr-5', taskId: '20260714HYKSP001', taskType: 'daily', source: '定时任务', platform: '好衣库', store: '好衣库店铺',
    taskDate: '2026-07-14 08:30', businessDate: '2026-07-13', peaCost: 360, owner: '张管理员', reviewer: '王财务',
    resultPreview: '任务完成', taskResult: '完成', reportStatus: '待发布', crossValidation: '通过',
    taskLog: '08:30 拉取好衣库日报；08:31 完成字段校验；08:30:15 任务结束。',
  },
  {
    id: 'pr-6', taskId: '20260714FEE001', taskType: 'other', source: '指令', platform: '快手', store: '官方旗舰店',
    taskDate: '2026-07-14 09:15', businessDate: '2026-07-13', peaCost: 180, owner: '陈分析', reviewer: '张管理员',
    resultPreview: '任务完成', taskResult: '完成', reportStatus: '已发布', crossValidation: '通过',
    taskLog: '09:15 执行费用差异排查任务；09:16 生成报告。',
  },
  {
    id: 'pr-7', taskId: '20260714ROI001', taskType: 'other', source: '指令', platform: '快手', store: '官方旗舰店',
    taskDate: '2026-07-14 10:30', businessDate: '2026-07-13', peaCost: 220, owner: '李运营', reviewer: '王财务',
    resultPreview: '任务完成', taskResult: '完成', reportStatus: '已发布', crossValidation: '通过',
    taskLog: '10:30 执行 ROI 拆解任务；10:31 生成报告。',
  },
  {
    id: 'pr-8', taskId: '20260714PROFIT001', taskType: 'other', source: '指令', platform: '唯品会', store: '品牌集合店',
    taskDate: '2026-07-14 14:00', businessDate: '2026-07-13', peaCost: 260, owner: '王财务', reviewer: '张管理员',
    resultPreview: '任务完成', taskResult: '完成', reportStatus: '已发布', crossValidation: '已修正',
    taskLog: '14:00 执行利润归因分析；14:01 生成报告并修正。',
  },
]

const peaTabs: Array<{ key: PeaTab; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'daily', label: '日报' },
  { key: 'other', label: '其他报告' },
]

const bindablePlatforms = ['快手', '爱库存', '唯品会', '好衣库', '抖店', '得物']

const teams: Team[] = [
  { id: 'team-1', name: '澄明电商运营团队', memberCount: 4, createdAt: '2026-05-01', desc: '主营快手、唯品会、好衣库平台' },
  { id: 'team-2', name: '京倍数字营销团队', memberCount: 6, createdAt: '2026-04-15', desc: '主营爱库存、抖店平台' },
  { id: 'team-3', name: '万顷品牌管理团队', memberCount: 3, createdAt: '2026-06-10', desc: '主营得物、抖店平台' },
]

const initialTeamAccounts: Record<string, TeamPlatformAccount[]> = {
  'team-1': [
    { id: 'ta-1-1', platform: '快手', accountName: '快手官方企业号', boundAt: '2026-06-15 10:30', stores: ['官方旗舰店', '闪购店'], status: 'connected' },
    { id: 'ta-1-2', platform: '唯品会', accountName: '唯品会品牌服务商', boundAt: '2026-06-20 14:00', stores: ['品牌集合店'], status: 'connected' },
    { id: 'ta-1-3', platform: '好衣库', accountName: '好衣库商家账号', boundAt: '2026-05-10 09:15', stores: ['好衣库店铺'], status: 'expired' },
  ],
  'team-2': [
    { id: 'ta-2-1', platform: '爱库存', accountName: '爱库存商家账号', boundAt: '2026-06-01 11:20', stores: ['京倍店铺', '万顷店铺'], status: 'connected' },
    { id: 'ta-2-2', platform: '抖店', accountName: '抖店旗舰店账号', boundAt: '2026-06-05 15:45', stores: ['抖店旗舰店'], status: 'connected' },
  ],
  'team-3': [
    { id: 'ta-3-1', platform: '得物', accountName: '得物品牌账号', boundAt: '2026-06-12 10:00', stores: ['得物店铺'], status: 'connected' },
  ],
}

// ===================== 组件 =====================

export default function AdminPage() {
  const [adminTab, setAdminTab] = useState<AdminTab>('llm')
  const [llmTab, setLlmTab] = useState<LlmTab>('api')
  const [peaTab, setPeaTab] = useState<PeaTab>('all')
  const [apiKeyVisible, setApiKeyVisible] = useState<Record<string, boolean>>({})
  const [editingApi, setEditingApi] = useState<LlmApiConfig | null>(null)
  const [editingBinding, setEditingBinding] = useState<ComponentBinding | null>(null)
  const [logRecord, setLogRecord] = useState<PeaRecord | null>(null)

  // 团队管理状态
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [teamAccounts, setTeamAccounts] = useState<Record<string, TeamPlatformAccount[]>>(initialTeamAccounts)
  const [teamBindOpen, setTeamBindOpen] = useState(false)
  const [teamBindPlatform, setTeamBindPlatform] = useState(bindablePlatforms[0])
  const [teamBindMode, setTeamBindMode] = useState<'scan' | 'password'>('scan')
  const [teamBindStep, setTeamBindStep] = useState<'select' | 'scanning' | 'success'>('select')
  const [teamBindAccount, setTeamBindAccount] = useState('')
  const [teamBindPassword, setTeamBindPassword] = useState('')
  const [teamStoreDialogAccount, setTeamStoreDialogAccount] = useState<TeamPlatformAccount | null>(null)
  const [teamNewStore, setTeamNewStore] = useState('')
  const [teamEditAccount, setTeamEditAccount] = useState<TeamPlatformAccount | null>(null)
  const [teamEditNewStore, setTeamEditNewStore] = useState('')

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? null
  const currentTeamAccounts = selectedTeamId ? (teamAccounts[selectedTeamId] ?? []) : []

  const totalPeaCost = peaRecords.reduce((sum, r) => sum + r.peaCost, 0)
  const filteredPea = peaTab === 'all' ? peaRecords : peaRecords.filter((r) => r.taskType === peaTab)

  return (
    <>
      <section className="data-scope-note">
        <div>
          <span className="eyebrow">system_admin</span>
          <h2>系统管理员</h2>
        </div>
        <p>管理系统 LLM 配置、组件绑定、豌豆消耗记录与团队管理。</p>
      </section>

      <div className="admin-tabs">
        <button type="button" className={adminTab === 'llm' ? 'active' : ''} onClick={() => setAdminTab('llm')}>LLM 管理</button>
        <button type="button" className={adminTab === 'pea' ? 'active' : ''} onClick={() => setAdminTab('pea')}>豌豆值消耗记录</button>
        <button type="button" className={adminTab === 'team' ? 'active' : ''} onClick={() => { setAdminTab('team'); setSelectedTeamId(null) }}>
          <Users aria-hidden="true" />
          团队管理
        </button>
      </div>

      {adminTab === 'llm' ? (
        <>
          <div className="admin-sub-tabs">
            <button type="button" className={llmTab === 'api' ? 'active' : ''} onClick={() => setLlmTab('api')}>API 管理</button>
            <button type="button" className={llmTab === 'binding' ? 'active' : ''} onClick={() => setLlmTab('binding')}>组件绑定</button>
          </div>

          {llmTab === 'api' ? (
            <article className="data-table-card">
              <header>
                <div>
                  <span className="eyebrow">llm_api_config</span>
                  <h3>API 管理</h3>
                </div>
                <button className="primary-action" type="button" onClick={() => setEditingApi({ id: '', provider: '', baseUrl: '', modelName: '', apiKey: '', maxTokens: 4096, temperature: 0.7, status: 'enabled', isDefault: false })}>
                  <Plus aria-hidden="true" />新增 API 配置
                </button>
              </header>
              <div className="table-scroll">
                <table className="api-config-table">
                  <thead>
                    <tr>
                      <th>服务商</th>
                      <th>Base URL</th>
                      <th>模型名称</th>
                      <th>API Key</th>
                      <th>Max Tokens</th>
                      <th>Temperature</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {llmApiConfigs.map((api) => (
                      <tr key={api.id}>
                        <td>
                          <strong>{api.provider}</strong>
                          {api.isDefault ? <span className="data-pill normal" style={{ marginLeft: 6 }}>默认</span> : null}
                        </td>
                        <td><code className="api-url">{api.baseUrl}</code></td>
                        <td><span className="data-pill normal">{api.modelName}</span></td>
                        <td>
                          <span className="api-key-cell">
                            <code>{apiKeyVisible[api.id] ? api.apiKey : '••••••••••••' + api.apiKey.slice(-4)}</code>
                            <button type="button" className="icon-btn-sm" onClick={() => setApiKeyVisible((s) => ({ ...s, [api.id]: !s[api.id] }))}>
                              {apiKeyVisible[api.id] ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                            </button>
                          </span>
                        </td>
                        <td className="mono-num">{api.maxTokens}</td>
                        <td className="mono-num">{api.temperature}</td>
                        <td>
                          <span className={`data-pill ${api.status === 'enabled' ? 'good' : 'warning'}`}>
                            {api.status === 'enabled' ? '已启用' : '已停用'}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button type="button" className="icon-btn-sm" title="编辑" onClick={() => setEditingApi(api)}><Pencil aria-hidden="true" /></button>
                            <button type="button" className="icon-btn-sm" title="测试"><Zap aria-hidden="true" /></button>
                            <button type="button" className="icon-btn-sm danger" title="删除"><Trash2 aria-hidden="true" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ) : (
            <article className="data-table-card">
              <header>
                <div>
                  <span className="eyebrow">component_binding</span>
                  <h3>组件绑定</h3>
                </div>
                <button className="primary-action" type="button" onClick={() => setEditingBinding({ id: '', name: '', workflow: '', inputs: [], status: 'active' })}>
                  <Plus aria-hidden="true" />新增绑定
                </button>
              </header>
              <div className="binding-list">
                {componentBindings.map((binding) => (
                  <article key={binding.id} className={`binding-card ${binding.status === 'inactive' ? 'inactive' : ''}`}>
                    <header className="binding-card__head">
                      <div className="binding-card__title">
                        <span className="binding-card__icon"><Zap aria-hidden="true" /></span>
                        <div>
                          <strong>{binding.name}</strong>
                        </div>
                      </div>
                      <div className="binding-card__meta">
                        <span className="data-pill normal">{binding.workflow}</span>
                        <span className={`data-pill ${binding.status === 'active' ? 'good' : 'warning'}`}>{binding.status === 'active' ? '已激活' : '未激活'}</span>
                      </div>
                    </header>
                    <div className="binding-card__inputs">
                      <small className="binding-card__label">输入参数</small>
                      <div className="binding-input-tags">
                        {binding.inputs.map((input) => (
                          <span key={input} className="binding-input-tag">
                            <code>{input}</code>
                          </span>
                        ))}
                      </div>
                    </div>
                    <footer className="binding-card__foot">
                      <button type="button" className="icon-btn-sm" title="编辑" onClick={() => setEditingBinding(binding)}><Pencil aria-hidden="true" /></button>
                      <button type="button" className="icon-btn-sm danger" title="删除"><Trash2 aria-hidden="true" /></button>
                    </footer>
                  </article>
                ))}
              </div>
            </article>
          )}
        </>
      ) : null}

      {adminTab === 'pea' ? (
        <article className="data-table-card">
          <header>
            <div>
              <span className="eyebrow">pea_consumption</span>
              <h3>豌豆值消耗记录</h3>
            </div>
            <div className="pea-summary">
              <span className="pea-summary-item"><Sparkles aria-hidden="true" />总消耗 <strong>{totalPeaCost}</strong></span>
              <span className="pea-summary-item">日报 <strong>{peaRecords.filter((r) => r.taskType === 'daily').reduce((s, r) => s + r.peaCost, 0)}</strong></span>
              <span className="pea-summary-item">其他 <strong>{peaRecords.filter((r) => r.taskType === 'other').reduce((s, r) => s + r.peaCost, 0)}</strong></span>
            </div>
          </header>
          <div className="admin-sub-tabs">
            {peaTabs.map((tab) => (
              <button key={tab.key} type="button" className={peaTab === tab.key ? 'active' : ''} onClick={() => setPeaTab(tab.key)}>
                {tab.label}
                <span className="tab-count">{peaTab === tab.key ? filteredPea.length : peaRecords.filter((r) => tab.key === 'all' || r.taskType === tab.key).length}</span>
              </button>
            ))}
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>任务 ID</th>
                  <th>任务来源</th>
                  <th>平台</th>
                  <th>店铺</th>
                  <th>任务日期</th>
                  <th>业务日期</th>
                  <th>豌豆消耗</th>
                  <th>归属人员</th>
                  <th>审核人</th>
                  <th>结果预览</th>
                  <th>任务结果</th>
                  <th>日报状态</th>
                  <th>交叉验证</th>
                  <th>任务日志</th>
                </tr>
              </thead>
              <tbody>
                {filteredPea.map((row) => (
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
                    <td>{row.resultPreview}</td>
                    <td><span className={`data-pill ${row.taskResult === '完成' ? 'normal' : 'danger'}`}>{row.taskResult}</span></td>
                    <td><span className={`data-pill ${row.reportStatus === '已发布' ? 'normal' : 'warning'}`}>{row.reportStatus}</span></td>
                    <td><span className={`data-pill ${row.crossValidation === '通过' ? 'good' : row.crossValidation === '已修正' ? 'normal' : 'danger'}`}>{row.crossValidation}</span></td>
                    <td><button className="log-link" type="button" onClick={() => setLogRecord(row)}><ScrollText aria-hidden="true" />查看日志</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}

      {adminTab === 'team' ? (
        selectedTeam ? (
          <article className="data-table-card">
            <header>
              <div>
                <span className="eyebrow">team_platform_binding</span>
                <h3>{selectedTeam.name} · 平台账号绑定</h3>
              </div>
              <div className="table-header-actions">
                <button className="secondary-action" type="button" onClick={() => setSelectedTeamId(null)}>
                  <ArrowLeft aria-hidden="true" />
                  返回团队列表
                </button>
                <button className="primary-action" type="button" onClick={() => { setTeamBindOpen(true); setTeamBindStep('select'); setTeamBindMode('scan'); setTeamBindPlatform(bindablePlatforms[0]); setTeamBindAccount(''); setTeamBindPassword('') }}>
                  <Plus aria-hidden="true" />
                  绑定平台账号
                </button>
              </div>
            </header>
            <div className="dialog-meta" style={{ marginBottom: 16 }}>
              <span>团队成员：{selectedTeam.memberCount} 人</span>
              <span>创建时间：{selectedTeam.createdAt}</span>
              <span>{selectedTeam.desc}</span>
            </div>
            <div className="platform-account-list">
              {currentTeamAccounts.map((account) => (
                <article key={account.id} className={`platform-account-card ${account.status === 'expired' ? 'expired' : ''}`}>
                  <header className="platform-account-card__head">
                    <div className="platform-account-card__title">
                      <span className="platform-account-card__icon">
                        <Store aria-hidden="true" />
                      </span>
                      <div>
                        <strong>{account.accountName}</strong>
                        <small>{account.platform}</small>
                      </div>
                    </div>
                    <div className="platform-account-card__meta">
                      <span className={`data-pill ${account.status === 'connected' ? 'good' : 'warning'}`}>
                        {account.status === 'connected' ? <CheckCircle2 aria-hidden="true" /> : <Unlink aria-hidden="true" />}
                        {account.status === 'connected' ? '已连接' : '已过期'}
                      </span>
                      <span className="platform-account-card__time">绑定时间：{account.boundAt}</span>
                      <button type="button" className="icon-btn-sm" title="编辑" onClick={() => setTeamEditAccount(account)}><Pencil aria-hidden="true" /></button>
                      <button type="button" className="icon-btn-sm danger" title="解绑" onClick={() => setTeamAccounts((map) => ({ ...map, [selectedTeam.id]: (map[selectedTeam.id] ?? []).filter((a) => a.id !== account.id) }))}><Unlink aria-hidden="true" /></button>
                    </div>
                  </header>
                  <div className="platform-account-card__stores">
                    <div className="platform-account-card__stores-head">
                      <small className="binding-card__label">关联店铺（{account.stores.length}）</small>
                      {account.status === 'connected' ? (
                        <button type="button" className="binding-add-input" onClick={() => setTeamStoreDialogAccount(account)}>
                          <Plus aria-hidden="true" />添加店铺
                        </button>
                      ) : null}
                    </div>
                    <div className="platform-store-tags">
                      {account.stores.map((store) => (
                        <span key={store} className="platform-store-tag">
                          <Store aria-hidden="true" />
                          {store}
                          {account.status === 'connected' ? (
                            <button type="button" className="platform-store-tag__remove" onClick={() => setTeamAccounts((map) => ({ ...map, [selectedTeam.id]: (map[selectedTeam.id] ?? []).map((a) => a.id === account.id ? { ...a, stores: a.stores.filter((s) => s !== store) } : a) }))} aria-label="移除店铺">
                              <X aria-hidden="true" />
                            </button>
                          ) : null}
                        </span>
                      ))}
                      {account.stores.length === 0 ? <span className="platform-store-empty">暂无关联店铺</span> : null}
                    </div>
                  </div>
                </article>
              ))}
              {currentTeamAccounts.length === 0 ? (
                <div className="merchant-settings-placeholder">
                  <QrCode aria-hidden="true" />
                  <p>该团队暂未绑定任何平台账号</p>
                  <small>点击「绑定平台账号」开始接入平台</small>
                </div>
              ) : null}
            </div>
          </article>
        ) : (
          <article className="data-table-card">
            <header>
              <div>
                <span className="eyebrow">team_list</span>
                <h3>团队列表</h3>
              </div>
            </header>
            <div className="team-list">
              {teams.map((team) => {
                const accounts = teamAccounts[team.id] ?? []
                const storeCount = accounts.reduce((sum, a) => sum + a.stores.length, 0)
                return (
                  <article key={team.id} className="team-card" onClick={() => setSelectedTeamId(team.id)}>
                    <header className="team-card__head">
                      <div className="team-card__title">
                        <span className="team-card__icon"><Users aria-hidden="true" /></span>
                        <div>
                          <strong>{team.name}</strong>
                          <small>{team.desc}</small>
                        </div>
                      </div>
                      <span className="data-pill normal">点击管理</span>
                    </header>
                    <div className="team-card__stats">
                      <span><Users aria-hidden="true" /> 成员 {team.memberCount}</span>
                      <span><Link2 aria-hidden="true" /> 平台账号 {accounts.length}</span>
                      <span><Store aria-hidden="true" /> 店铺 {storeCount}</span>
                      <span>创建于 {team.createdAt}</span>
                    </div>
                  </article>
                )
              })}
            </div>
          </article>
        )
      ) : null}

      {/* 团队绑定平台账号弹窗 */}
      {teamBindOpen && selectedTeam ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setTeamBindOpen(false)}>
          <section className="ledger-dialog create-task-dialog bind-dialog">
            <header>
              <div>
                <span className="eyebrow">team_bind_platform</span>
                <h3>绑定平台账号 — {selectedTeam.name}</h3>
              </div>
              <button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => setTeamBindOpen(false)}>×</button>
            </header>

            {teamBindStep === 'select' ? (
              <>
                <label className="dialog-field">
                  <span>选择平台</span>
                  <select value={teamBindPlatform} onChange={(e) => setTeamBindPlatform(e.target.value)}>
                    {bindablePlatforms.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>

                <div className="dialog-field">
                  <span>绑定方式</span>
                  <div className="bind-mode-list">
                    <button type="button" className={`bind-mode-card ${teamBindMode === 'scan' ? 'active' : ''}`} onClick={() => setTeamBindMode('scan')}>
                      <span className="bind-mode-card__icon"><QrCode aria-hidden="true" /></span>
                      <div><strong>扫码绑定</strong><small>使用平台 App 扫码授权</small></div>
                    </button>
                    <button type="button" className={`bind-mode-card ${teamBindMode === 'password' ? 'active' : ''}`} onClick={() => setTeamBindMode('password')}>
                      <span className="bind-mode-card__icon"><KeyRound aria-hidden="true" /></span>
                      <div><strong>帐密绑定</strong><small>输入平台账号密码</small></div>
                    </button>
                  </div>
                </div>

                {teamBindMode === 'scan' ? (
                  <button className="primary-action bind-dialog__scan-btn" type="button" onClick={() => setTeamBindStep('scanning')}>
                    <QrCode aria-hidden="true" />
                    生成扫码二维码
                  </button>
                ) : (
                  <div className="bind-password-form">
                    <label className="dialog-field">
                      <span>账号</span>
                      <input value={teamBindAccount} onChange={(e) => setTeamBindAccount(e.target.value)} placeholder="请输入平台账号" />
                    </label>
                    <label className="dialog-field">
                      <span>密码</span>
                      <input type="password" value={teamBindPassword} onChange={(e) => setTeamBindPassword(e.target.value)} placeholder="请输入密码" />
                    </label>
                    <button className="primary-action bind-dialog__scan-btn" type="button" disabled={!teamBindAccount || !teamBindPassword} onClick={() => setTeamBindStep('success')}>
                      <CheckCircle2 aria-hidden="true" />
                      授权绑定
                    </button>
                  </div>
                )}
              </>
            ) : null}

            {teamBindStep === 'scanning' ? (
              <div className="bind-scan-area">
                <div className="bind-qr-placeholder">
                  <QrCode aria-hidden="true" />
                  <div className="bind-qr-scan-line" />
                </div>
                <p>请使用 <strong>{teamBindPlatform}</strong> App 扫描上方二维码完成授权</p>
                <small>等待扫码确认中...</small>
                <button className="primary-action" type="button" onClick={() => setTeamBindStep('success')}>模拟扫码成功</button>
              </div>
            ) : null}

            {teamBindStep === 'success' ? (
              <div className="bind-success-area">
                <CheckCircle2 aria-hidden="true" />
                <p>绑定成功！</p>
                <small>{teamBindPlatform} 平台账号已成功绑定</small>
                <button className="primary-action" type="button" onClick={() => {
                  const newAccount: TeamPlatformAccount = {
                    id: `ta-${Date.now()}`,
                    platform: teamBindPlatform,
                    accountName: teamBindMode === 'password' && teamBindAccount ? teamBindAccount : `${teamBindPlatform}企业账号`,
                    boundAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                    stores: [],
                    status: 'connected',
                  }
                  setTeamAccounts((map) => ({ ...map, [selectedTeam.id]: [...(map[selectedTeam.id] ?? []), newAccount] }))
                  setTeamBindOpen(false)
                  setTeamBindStep('select')
                  setTeamBindAccount('')
                  setTeamBindPassword('')
                }}>完成</button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {/* 团队添加店铺弹窗 */}
      {teamStoreDialogAccount && selectedTeam ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setTeamStoreDialogAccount(null)}>
          <form className="ledger-dialog create-task-dialog" onSubmit={(e) => { e.preventDefault(); if (!teamStoreDialogAccount || !teamNewStore.trim()) return; setTeamAccounts((map) => ({ ...map, [selectedTeam.id]: (map[selectedTeam.id] ?? []).map((a) => a.id === teamStoreDialogAccount.id ? { ...a, stores: [...a.stores, teamNewStore.trim()] } : a) })); setTeamStoreDialogAccount(null); setTeamNewStore('') }}>
            <header>
              <div>
                <span className="eyebrow">team_add_store</span>
                <h3>添加店铺</h3>
              </div>
              <button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => setTeamStoreDialogAccount(null)}>×</button>
            </header>
            <div className="dialog-meta">
              <span>平台：{teamStoreDialogAccount.platform}</span>
              <span>账号：{teamStoreDialogAccount.accountName}</span>
            </div>
            <label className="dialog-field">
              <span>店铺名称</span>
              <input value={teamNewStore} onChange={(e) => setTeamNewStore(e.target.value)} placeholder="请输入店铺全名" required />
            </label>
            {teamStoreDialogAccount.stores.length > 0 ? (
              <div className="dialog-field">
                <span>已有关联店铺</span>
                <div className="platform-store-tags">
                  {teamStoreDialogAccount.stores.map((s) => (
                    <span key={s} className="platform-store-tag"><Store aria-hidden="true" />{s}</span>
                  ))}
                </div>
              </div>
            ) : null}
            <footer>
              <button className="secondary-action" type="button" onClick={() => setTeamStoreDialogAccount(null)}>取消</button>
              <button className="primary-action" type="submit"><Plus aria-hidden="true" />添加</button>
            </footer>
          </form>
        </div>
      ) : null}

      {/* 团队编辑平台账号弹窗 */}
      {teamEditAccount && selectedTeam ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setTeamEditAccount(null)}>
          <form className="ledger-dialog create-task-dialog" onSubmit={(e) => { e.preventDefault(); if (!teamEditAccount) return; setTeamAccounts((map) => ({ ...map, [selectedTeam.id]: (map[selectedTeam.id] ?? []).map((a) => a.id === teamEditAccount.id ? { ...a, platform: teamEditAccount.platform, accountName: teamEditAccount.accountName, stores: teamEditAccount.stores, status: teamEditAccount.status } : a) })); setTeamEditAccount(null); setTeamEditNewStore('') }}>
            <header>
              <div>
                <span className="eyebrow">team_edit_account</span>
                <h3>编辑平台账号</h3>
              </div>
              <button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => { setTeamEditAccount(null); setTeamEditNewStore('') }}>×</button>
            </header>

            <label className="dialog-field">
              <span>平台</span>
              <select value={teamEditAccount.platform} onChange={(e) => setTeamEditAccount({ ...teamEditAccount, platform: e.target.value })}>
                {bindablePlatforms.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>

            <label className="dialog-field">
              <span>账号名称</span>
              <input value={teamEditAccount.accountName} onChange={(e) => setTeamEditAccount({ ...teamEditAccount, accountName: e.target.value })} placeholder="请输入账号名称" required />
            </label>

            <label className="dialog-field">
              <span>状态</span>
              <select value={teamEditAccount.status} onChange={(e) => setTeamEditAccount({ ...teamEditAccount, status: e.target.value as 'connected' | 'expired' })}>
                <option value="connected">已连接</option>
                <option value="expired">已过期</option>
              </select>
            </label>

            <div className="dialog-field">
              <span>关联店铺（{teamEditAccount.stores.length}）</span>
              <div className="platform-store-tags">
                {teamEditAccount.stores.map((store) => (
                  <span key={store} className="platform-store-tag">
                    <Store aria-hidden="true" />
                    {store}
                    <button type="button" className="platform-store-tag__remove" onClick={() => setTeamEditAccount({ ...teamEditAccount, stores: teamEditAccount.stores.filter((s) => s !== store) })} aria-label="移除店铺">
                      <X aria-hidden="true" />
                    </button>
                  </span>
                ))}
                {teamEditAccount.stores.length === 0 ? <span className="platform-store-empty">暂无关联店铺</span> : null}
              </div>
            </div>

            <label className="dialog-field">
              <span>添加新店铺</span>
              <div className="binding-add-input-row">
                <input value={teamEditNewStore} onChange={(e) => setTeamEditNewStore(e.target.value)} placeholder="请输入店铺名称" />
                <button type="button" className="binding-add-input" onClick={() => { if (!teamEditAccount || !teamEditNewStore.trim()) return; setTeamEditAccount({ ...teamEditAccount, stores: [...teamEditAccount.stores, teamEditNewStore.trim()] }); setTeamEditNewStore('') }} disabled={!teamEditNewStore.trim()}>
                  <Plus aria-hidden="true" />添加
                </button>
              </div>
            </label>

            <footer>
              <button className="secondary-action" type="button" onClick={() => { setTeamEditAccount(null); setTeamEditNewStore('') }}>取消</button>
              <button className="primary-action" type="submit"><CheckCircle2 aria-hidden="true" />保存</button>
            </footer>
          </form>
        </div>
      ) : null}
      {editingApi ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setEditingApi(null)}>
          <form className="ledger-dialog create-task-dialog" onSubmit={(e) => { e.preventDefault(); setEditingApi(null) }}>
            <header>
              <div>
                <span className="eyebrow">{editingApi.id ? 'edit_api' : 'new_api'}</span>
                <h3>{editingApi.id ? '编辑 API 配置' : '新增 API 配置'}</h3>
              </div>
              <button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => setEditingApi(null)}>×</button>
            </header>
            <label className="dialog-field">
              <span>服务商</span>
              <input value={editingApi.provider} onChange={(e) => setEditingApi({ ...editingApi, provider: e.target.value })} placeholder="如 OpenAI / Anthropic / DeepSeek" required />
            </label>
            <label className="dialog-field">
              <span>Base URL</span>
              <input value={editingApi.baseUrl} onChange={(e) => setEditingApi({ ...editingApi, baseUrl: e.target.value })} placeholder="https://api.openai.com/v1" required />
            </label>
            <label className="dialog-field">
              <span>模型名称</span>
              <input value={editingApi.modelName} onChange={(e) => setEditingApi({ ...editingApi, modelName: e.target.value })} placeholder="如 gpt-4o" required />
            </label>
            <label className="dialog-field">
              <span>API Key</span>
              <input type="password" value={editingApi.apiKey} onChange={(e) => setEditingApi({ ...editingApi, apiKey: e.target.value })} placeholder="sk-..." required />
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <label className="dialog-field" style={{ flex: 1 }}>
                <span>Max Tokens</span>
                <input type="number" value={editingApi.maxTokens} onChange={(e) => setEditingApi({ ...editingApi, maxTokens: Number(e.target.value) })} required />
              </label>
              <label className="dialog-field" style={{ flex: 1 }}>
                <span>Temperature</span>
                <input type="number" step="0.1" min="0" max="2" value={editingApi.temperature} onChange={(e) => setEditingApi({ ...editingApi, temperature: Number(e.target.value) })} required />
              </label>
            </div>
            <label className="dialog-field">
              <span>状态</span>
              <select value={editingApi.status} onChange={(e) => setEditingApi({ ...editingApi, status: e.target.value as 'enabled' | 'disabled' })}>
                <option value="enabled">已启用</option>
                <option value="disabled">已停用</option>
              </select>
            </label>
            <footer>
              <button className="secondary-action" type="button" onClick={() => setEditingApi(null)}>取消</button>
              <button className="primary-action" type="submit"><CheckCircle2 aria-hidden="true" />保存</button>
            </footer>
          </form>
        </div>
      ) : null}

      {/* 组件绑定编辑弹窗 */}
      {editingBinding ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setEditingBinding(null)}>
          <form className="ledger-dialog create-task-dialog" onSubmit={(e) => { e.preventDefault(); setEditingBinding(null) }}>
            <header>
              <div>
                <span className="eyebrow">{editingBinding.id ? 'edit_binding' : 'new_binding'}</span>
                <h3>{editingBinding.id ? '编辑组件绑定' : '新增组件绑定'}</h3>
              </div>
              <button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => setEditingBinding(null)}>×</button>
            </header>
            <label className="dialog-field">
              <span>功能名称</span>
              <input value={editingBinding.name} onChange={(e) => setEditingBinding({ ...editingBinding, name: e.target.value })} placeholder="如 新建任务" required />
            </label>
            <label className="dialog-field">
              <span>选择工作流</span>
              <select value={editingBinding.workflow} onChange={(e) => setEditingBinding({ ...editingBinding, workflow: e.target.value })} required>
                <option value="" disabled>请选择工作流</option>
                <option value="多平台日报生成">多平台日报生成</option>
                <option value="平台费用差异排查">平台费用差异排查</option>
                <option value="利润归因分析">利润归因分析</option>
                <option value="推广费 ROI 拆解">推广费 ROI 拆解</option>
                <option value="库存动销预警">库存动销预警</option>
                <option value="自由问答">自由问答</option>
              </select>
            </label>
            <div className="dialog-field">
              <span>输入参数</span>
              <small className="dialog-field-hint">注入到工作流中的 input</small>
              <div className="binding-checkbox-list">
                {inputOptions.map((option) => (
                  <label key={option} className="binding-checkbox-item">
                    <input
                      type="checkbox"
                      checked={editingBinding.inputs.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditingBinding({ ...editingBinding, inputs: [...editingBinding.inputs, option] })
                        } else {
                          setEditingBinding({ ...editingBinding, inputs: editingBinding.inputs.filter((i) => i !== option) })
                        }
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <label className="dialog-field">
              <span>状态</span>
              <select value={editingBinding.status} onChange={(e) => setEditingBinding({ ...editingBinding, status: e.target.value as 'active' | 'inactive' })}>
                <option value="active">已激活</option>
                <option value="inactive">未激活</option>
              </select>
            </label>
            <footer>
              <button className="secondary-action" type="button" onClick={() => setEditingBinding(null)}>取消</button>
              <button className="primary-action" type="submit"><CheckCircle2 aria-hidden="true" />保存</button>
            </footer>
          </form>
        </div>
      ) : null}

      {/* 任务日志弹窗 */}
      {logRecord ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setLogRecord(null)}>
          <section className="ledger-dialog">
            <header>
              <div>
                <span className="eyebrow">task_log</span>
                <h3>任务运行日志</h3>
              </div>
              <button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => setLogRecord(null)}>×</button>
            </header>
            <pre className="task-log">{logRecord.taskLog}</pre>
          </section>
        </div>
      ) : null}
    </>
  )
}
