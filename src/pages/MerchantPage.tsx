import { useState } from 'react'
import {
  CheckCircle2,
  KeyRound,
  Link2,
  Pencil,
  Plus,
  QrCode,
  Store,
  Unlink,
  X,
} from 'lucide-react'

interface PlatformAccount {
  id: string
  platform: string
  accountName: string
  boundAt: string
  stores: string[]
  status: 'connected' | 'expired'
}

const bindablePlatforms = ['快手', '爱库存', '唯品会', '好衣库', '抖店', '得物']

const initialAccounts: PlatformAccount[] = [
  { id: 'pa-1', platform: '快手', accountName: '快手官方企业号', boundAt: '2026-06-15 10:30', stores: ['官方旗舰店', '闪购店'], status: 'connected' },
  { id: 'pa-2', platform: '唯品会', accountName: '唯品会品牌服务商', boundAt: '2026-06-20 14:00', stores: ['品牌集合店'], status: 'connected' },
  { id: 'pa-3', platform: '爱库存', accountName: '爱库存商家账号', boundAt: '2026-05-10 09:15', stores: ['京倍店铺', '万顷店铺'], status: 'expired' },
]

export default function MerchantPage() {
  const [accounts, setAccounts] = useState<PlatformAccount[]>(initialAccounts)
  const [bindDialogOpen, setBindDialogOpen] = useState(false)
  const [bindPlatform, setBindPlatform] = useState(bindablePlatforms[0])
  const [bindMode, setBindMode] = useState<'scan' | 'password'>('scan')
  const [bindStep, setBindStep] = useState<'select' | 'scanning' | 'success'>('select')
  const [bindAccount, setBindAccount] = useState('')
  const [bindPassword, setBindPassword] = useState('')
  const [storeDialogAccount, setStoreDialogAccount] = useState<PlatformAccount | null>(null)
  const [newStoreName, setNewStoreName] = useState('')
  const [editAccount, setEditAccount] = useState<PlatformAccount | null>(null)
  const [editNewStore, setEditNewStore] = useState('')

  const totalStores = accounts.reduce((sum, a) => sum + a.stores.length, 0)

  const handleBindConfirm = () => {
    const newAccount: PlatformAccount = {
      id: `pa-${Date.now()}`,
      platform: bindPlatform,
      accountName: bindMode === 'password' && bindAccount ? bindAccount : `${bindPlatform}企业账号`,
      boundAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      stores: [],
      status: 'connected',
    }
    setAccounts((list) => [...list, newAccount])
    setBindDialogOpen(false)
    setBindStep('select')
    setBindAccount('')
    setBindPassword('')
  }

  const handleUnbind = (id: string) => {
    setAccounts((list) => list.filter((a) => a.id !== id))
  }

  const handleAddStore = () => {
    if (!storeDialogAccount || !newStoreName.trim()) return
    setAccounts((list) => list.map((a) => a.id === storeDialogAccount.id ? { ...a, stores: [...a.stores, newStoreName.trim()] } : a))
    setStoreDialogAccount(null)
    setNewStoreName('')
  }

  const handleRemoveStore = (accountId: string, store: string) => {
    setAccounts((list) => list.map((a) => a.id === accountId ? { ...a, stores: a.stores.filter((s) => s !== store) } : a))
  }

  const handleEditSave = () => {
    if (!editAccount) return
    setAccounts((list) => list.map((a) => a.id === editAccount.id ? { ...a, platform: editAccount.platform, accountName: editAccount.accountName, stores: editAccount.stores, status: editAccount.status } : a))
    setEditAccount(null)
    setEditNewStore('')
  }

  const handleEditAddStore = () => {
    if (!editAccount || !editNewStore.trim()) return
    setEditAccount({ ...editAccount, stores: [...editAccount.stores, editNewStore.trim()] })
    setEditNewStore('')
  }

  const handleEditRemoveStore = (store: string) => {
    if (!editAccount) return
    setEditAccount({ ...editAccount, stores: editAccount.stores.filter((s) => s !== store) })
  }

  return (
    <>
      <section className="data-scope-note">
        <div>
          <span className="eyebrow">merchant_admin</span>
          <h2>商户管理员</h2>
        </div>
        <p>管理平台账号绑定与店铺信息。</p>
      </section>

      <section className="report-stats">
        <article className="report-stat-card">
          <span className="report-stat-card__icon report-stat-card__icon--success"><Link2 aria-hidden="true" /></span>
          <div>
            <strong>{accounts.length}</strong>
            <span>已绑平台账号</span>
          </div>
        </article>
        <article className="report-stat-card">
          <span className="report-stat-card__icon report-stat-card__icon--pea"><Store aria-hidden="true" /></span>
          <div>
            <strong>{totalStores}</strong>
            <span>已绑店铺数</span>
          </div>
        </article>
      </section>

      <article className="data-table-card">
        <header>
          <div>
            <span className="eyebrow">platform_binding</span>
            <h3>平台账号绑定</h3>
          </div>
          <button className="primary-action" type="button" onClick={() => { setBindDialogOpen(true); setBindStep('select'); setBindMode('scan'); setBindPlatform(bindablePlatforms[0]); setBindAccount(''); setBindPassword('') }}>
            <Plus aria-hidden="true" />
            绑定平台账号
          </button>
        </header>
        <div className="platform-account-list">
          {accounts.map((account) => (
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
                  <button type="button" className="icon-btn-sm" title="编辑" onClick={() => setEditAccount(account)}><Pencil aria-hidden="true" /></button>
                  <button type="button" className="icon-btn-sm danger" title="解绑" onClick={() => handleUnbind(account.id)}><Unlink aria-hidden="true" /></button>
                </div>
              </header>
              <div className="platform-account-card__stores">
                <div className="platform-account-card__stores-head">
                  <small className="binding-card__label">关联店铺（{account.stores.length}）</small>
                  {account.status === 'connected' ? (
                    <button type="button" className="binding-add-input" onClick={() => setStoreDialogAccount(account)}>
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
                        <button type="button" className="platform-store-tag__remove" onClick={() => handleRemoveStore(account.id, store)} aria-label="移除店铺">
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
          {accounts.length === 0 ? (
            <div className="merchant-settings-placeholder">
              <QrCode aria-hidden="true" />
              <p>暂未绑定任何平台账号</p>
              <small>点击「扫码绑定」开始接入平台</small>
            </div>
          ) : null}
        </div>
      </article>

      {/* 扫码绑定弹窗 */}
      {bindDialogOpen ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setBindDialogOpen(false)}>
          <section className="ledger-dialog create-task-dialog bind-dialog">
            <header>
              <div>
                <span className="eyebrow">bind_platform</span>
                <h3>绑定平台账号</h3>
              </div>
              <button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => setBindDialogOpen(false)}>×</button>
            </header>

            {bindStep === 'select' ? (
              <>
                <label className="dialog-field">
                  <span>选择平台</span>
                  <select value={bindPlatform} onChange={(e) => setBindPlatform(e.target.value)}>
                    {bindablePlatforms.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>

                <div className="dialog-field">
                  <span>绑定方式</span>
                  <div className="bind-mode-list">
                    <button
                      type="button"
                      className={`bind-mode-card ${bindMode === 'scan' ? 'active' : ''}`}
                      onClick={() => setBindMode('scan')}
                    >
                      <span className="bind-mode-card__icon"><QrCode aria-hidden="true" /></span>
                      <div>
                        <strong>扫码绑定</strong>
                        <small>使用平台 App 扫码授权</small>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`bind-mode-card ${bindMode === 'password' ? 'active' : ''}`}
                      onClick={() => setBindMode('password')}
                    >
                      <span className="bind-mode-card__icon"><KeyRound aria-hidden="true" /></span>
                      <div>
                        <strong>帐密绑定</strong>
                        <small>输入平台账号密码</small>
                      </div>
                    </button>
                  </div>
                </div>

                {bindMode === 'scan' ? (
                  <button className="primary-action bind-dialog__scan-btn" type="button" onClick={() => setBindStep('scanning')}>
                    <QrCode aria-hidden="true" />
                    生成扫码二维码
                  </button>
                ) : (
                  <div className="bind-password-form">
                    <label className="dialog-field">
                      <span>账号</span>
                      <input value={bindAccount} onChange={(e) => setBindAccount(e.target.value)} placeholder="请输入平台账号" />
                    </label>
                    <label className="dialog-field">
                      <span>密码</span>
                      <input type="password" value={bindPassword} onChange={(e) => setBindPassword(e.target.value)} placeholder="请输入密码" />
                    </label>
                    <button className="primary-action bind-dialog__scan-btn" type="button" disabled={!bindAccount || !bindPassword} onClick={() => setBindStep('success')}>
                      <CheckCircle2 aria-hidden="true" />
                      授权绑定
                    </button>
                  </div>
                )}
              </>
            ) : null}

            {bindStep === 'scanning' ? (
              <div className="bind-scan-area">
                <div className="bind-qr-placeholder">
                  <QrCode aria-hidden="true" />
                  <div className="bind-qr-scan-line" />
                </div>
                <p>请使用 <strong>{bindPlatform}</strong> App 扫描上方二维码完成授权</p>
                <small>等待扫码确认中...</small>
                <button className="primary-action" type="button" onClick={() => setBindStep('success')}>模拟扫码成功</button>
              </div>
            ) : null}

            {bindStep === 'success' ? (
              <div className="bind-success-area">
                <CheckCircle2 aria-hidden="true" />
                <p>绑定成功！</p>
                <small>{bindPlatform} 平台账号已成功绑定</small>
                <button className="primary-action" type="button" onClick={handleBindConfirm}>完成</button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {/* 添加店铺弹窗 */}
      {storeDialogAccount ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setStoreDialogAccount(null)}>
          <form className="ledger-dialog create-task-dialog" onSubmit={(e) => { e.preventDefault(); handleAddStore() }}>
            <header>
              <div>
                <span className="eyebrow">add_store</span>
                <h3>添加店铺</h3>
              </div>
              <button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => setStoreDialogAccount(null)}>×</button>
            </header>
            <div className="dialog-meta">
              <span>平台：{storeDialogAccount.platform}</span>
              <span>账号：{storeDialogAccount.accountName}</span>
            </div>
            <label className="dialog-field">
              <span>店铺名称</span>
              <input value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} placeholder="请输入店铺全名" required />
            </label>
            {storeDialogAccount.stores.length > 0 ? (
              <div className="dialog-field">
                <span>已有关联店铺</span>
                <div className="platform-store-tags">
                  {storeDialogAccount.stores.map((s) => (
                    <span key={s} className="platform-store-tag"><Store aria-hidden="true" />{s}</span>
                  ))}
                </div>
              </div>
            ) : null}
            <footer>
              <button className="secondary-action" type="button" onClick={() => setStoreDialogAccount(null)}>取消</button>
              <button className="primary-action" type="submit"><Plus aria-hidden="true" />添加</button>
            </footer>
          </form>
        </div>
      ) : null}

      {/* 编辑平台账号弹窗 */}
      {editAccount ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setEditAccount(null)}>
          <form className="ledger-dialog create-task-dialog" onSubmit={(e) => { e.preventDefault(); handleEditSave() }}>
            <header>
              <div>
                <span className="eyebrow">edit_platform_account</span>
                <h3>编辑平台账号</h3>
              </div>
              <button className="dialog-close" type="button" aria-label="关闭弹窗" onClick={() => { setEditAccount(null); setEditNewStore('') }}>×</button>
            </header>

            <label className="dialog-field">
              <span>平台</span>
              <select value={editAccount.platform} onChange={(e) => setEditAccount({ ...editAccount, platform: e.target.value })}>
                {bindablePlatforms.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>

            <label className="dialog-field">
              <span>账号名称</span>
              <input value={editAccount.accountName} onChange={(e) => setEditAccount({ ...editAccount, accountName: e.target.value })} placeholder="请输入账号名称" required />
            </label>

            <label className="dialog-field">
              <span>状态</span>
              <select value={editAccount.status} onChange={(e) => setEditAccount({ ...editAccount, status: e.target.value as 'connected' | 'expired' })}>
                <option value="connected">已连接</option>
                <option value="expired">已过期</option>
              </select>
            </label>

            <div className="dialog-field">
              <span>关联店铺（{editAccount.stores.length}）</span>
              <div className="platform-store-tags">
                {editAccount.stores.map((store) => (
                  <span key={store} className="platform-store-tag">
                    <Store aria-hidden="true" />
                    {store}
                    <button type="button" className="platform-store-tag__remove" onClick={() => handleEditRemoveStore(store)} aria-label="移除店铺">
                      <X aria-hidden="true" />
                    </button>
                  </span>
                ))}
                {editAccount.stores.length === 0 ? <span className="platform-store-empty">暂无关联店铺</span> : null}
              </div>
            </div>

            <label className="dialog-field">
              <span>添加新店铺</span>
              <div className="binding-add-input-row">
                <input value={editNewStore} onChange={(e) => setEditNewStore(e.target.value)} placeholder="请输入店铺名称" />
                <button type="button" className="binding-add-input" onClick={handleEditAddStore} disabled={!editNewStore.trim()}>
                  <Plus aria-hidden="true" />添加
                </button>
              </div>
            </label>

            <footer>
              <button className="secondary-action" type="button" onClick={() => { setEditAccount(null); setEditNewStore('') }}>取消</button>
              <button className="primary-action" type="submit"><CheckCircle2 aria-hidden="true" />保存</button>
            </footer>
          </form>
        </div>
      ) : null}
    </>
  )
}
